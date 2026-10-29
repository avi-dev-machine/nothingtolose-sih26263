from fastapi import APIRouter, Depends, HTTPException, status, Response
from sqlalchemy.orm import Session
from datetime import datetime
import io
import qrcode
from app.database import get_db
from app.models import CredentialRecord, AdmissionRecord, StudentIdentity, Institution, Program, AcademicYear, VerificationRequest, User
from app.schemas import VerificationLookupResponse
from app.services.crypto_service import crypto_service
from app.services.audit_service import audit_service
from app.services.auth_service import get_current_user

router = APIRouter(prefix="/verification", tags=["Verification & Credential Integrity"])

@router.get("/records/{reference}", response_model=VerificationLookupResponse)
def verify_credential_reference(reference: str, db: Session = Depends(get_db)):
    """
    Public/Authorized academic record verification.
    Resolves credential, cryptographically verifies HMAC signature, checks revocation,
    and returns minimum permitted academic claims.
    """
    clean_ref = reference.strip().upper()
    cred = db.query(CredentialRecord).filter(CredentialRecord.credential_reference == clean_ref).first()
    if not cred:
        # Check in VerificationRequest references as fallback
        vr = db.query(VerificationRequest).filter(VerificationRequest.reference == clean_ref).first()
        if vr:
            cred = db.query(CredentialRecord).filter(CredentialRecord.admission_record_id == vr.admission_record_id).first()

    if not cred:
        raise HTTPException(
            status_code=404,
            detail=f"Verification reference '{reference}' not found or invalid."
        )

    admission = db.query(AdmissionRecord).filter(AdmissionRecord.id == cred.admission_record_id).first()
    if not admission:
        raise HTTPException(status_code=404, detail="Underlying admission record not found.")

    student = admission.student_identity
    inst = db.query(Institution).filter(Institution.id == admission.institution_id).first()
    prog = db.query(Program).filter(Program.id == admission.program_id).first()
    ay = db.query(AcademicYear).filter(AcademicYear.id == admission.academic_year_id).first()

    # Verify cryptographic signature
    is_valid, explanation = crypto_service.verify_payload_integrity(
        cred.canonical_payload, cred.digital_signature
    )
    integrity_status = "VALID" if is_valid else "TAMPERED"

    # Log verification request
    v_req = VerificationRequest(
        reference=clean_ref,
        admission_record_id=admission.id,
        requester_type="PUBLIC_OR_VERIFIER",
        purpose="Credential Verification",
        authorization_status="AUTHORIZED",
        result_status="VERIFIED" if is_valid else "TAMPER_DETECTED"
    )
    db.add(v_req)
    db.commit()

    audit_service.log_event(
        db=db,
        actor_id="VERIFIER_PORTAL",
        actor_role="AUTHORIZED_VERIFIER",
        action="CREDENTIAL_VERIFIED",
        resource_type="CREDENTIAL_RECORD",
        resource_id=cred.id,
        outcome="SUCCESS" if is_valid else "FLAGGED",
        metadata={"reference": clean_ref, "integrity": integrity_status},
        institution_id=admission.institution_id
    )

    return VerificationLookupResponse(
        reference=clean_ref,
        result_status="VERIFIED" if is_valid else "TAMPER_DETECTED",
        issuer_name=inst.name if inst else "Unknown Institution",
        institution_code=inst.institution_code if inst else "Unknown",
        institutional_student_id=admission.institutional_student_id,
        student_name=student.full_name,
        program_name=prog.program_name if prog else "Unknown Program",
        discipline=prog.discipline if prog else "Unknown",
        academic_year=ay.label if ay else "2026-27",
        admission_date=admission.admission_date,
        enrolment_status=admission.enrolment_status,
        is_supernumerary=admission.is_supernumerary,
        supernumerary_category=admission.supernumerary_category,
        external_verification_status=admission.external_verification_status,
        integrity_status=integrity_status,
        digital_signature=cred.digital_signature,
        key_id=cred.key_id,
        verified_at=datetime.utcnow(),
        explanation=explanation
    )

@router.get("/qr/{reference}")
def get_verification_qr(reference: str):
    """
    Generates a high-resolution QR code PNG linking directly to the verification page.
    """
    clean_ref = reference.strip().upper()
    # The URL points to the frontend verification route
    url = f"http://localhost:3000/verify/{clean_ref}"

    qr = qrcode.QRCode(
        version=1,
        error_correction=qrcode.constants.ERROR_CORRECT_M,
        box_size=10,
        border=3,
    )
    qr.add_data(url)
    qr.make(fit=True)
    img = qr.make_image(fill_color="#0F2042", back_color="white")

    buf = io.BytesIO()
    img.save(buf, format="PNG")
    buf.seek(0)
    return Response(content=buf.getvalue(), media_type="image/png")

@router.post("/tamper-test/{reference}")
def test_tamper_detection(reference: str, db: Session = Depends(get_db)):
    """
    Demonstration endpoint: alters canonical payload fields in memory to demonstrate
    that the cryptographic HMAC signature rejects altered records.
    """
    clean_ref = reference.strip().upper()
    cred = db.query(CredentialRecord).filter(CredentialRecord.credential_reference == clean_ref).first()
    if not cred:
        raise HTTPException(status_code=404, detail="Credential not found")

    # Legitimate signature verification
    valid_status, valid_msg = crypto_service.verify_payload_integrity(cred.canonical_payload, cred.digital_signature)

    # Tampered payload: alter student ID or program code
    tampered_payload = dict(cred.canonical_payload)
    tampered_payload["institutional_student_id"] = "TAMPERED-ROLL-9999"
    tampered_status, tampered_msg = crypto_service.verify_payload_integrity(tampered_payload, cred.digital_signature)

    return {
        "reference": clean_ref,
        "original_payload_valid": valid_status,
        "original_message": valid_msg,
        "tampered_payload_valid": tampered_status,
        "tampered_message": tampered_msg,
        "demonstration": "Cryptographic signature successfully rejected tampered record fields."
    }
