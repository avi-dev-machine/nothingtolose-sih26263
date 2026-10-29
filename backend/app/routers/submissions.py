from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form, Response
from sqlalchemy.orm import Session
from typing import List, Optional
import hashlib
import io
import csv
import pandas as pd
from datetime import datetime
from app.database import get_db
from app.models import (
    DataSubmission, ValidationFinding, AdmissionRecord, StudentIdentity,
    Institution, Program, AcademicYear, CredentialRecord, User
)
from app.schemas import SubmissionResponse, ValidationFindingResponse
from app.services.auth_service import get_current_user, enforce_institution_isolation
from app.services.validation_engine import validation_engine
from app.services.compliance_engine import compliance_engine
from app.services.crypto_service import crypto_service
from app.services.audit_service import audit_service

router = APIRouter(prefix="/submissions", tags=["Data Submissions & Uploads"])

@router.post("/upload-csv", response_model=SubmissionResponse)
async def upload_csv(
    file: UploadFile = File(...),
    academic_year_id: str = Form(...),
    institution_id: Optional[str] = Form(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Ingests and validates student records uploaded via CSV or XLSX.
    Runs immediate multi-stage validation and duplicate detection.
    """
    target_inst_id = enforce_institution_isolation(current_user, institution_id)
    if not target_inst_id:
        raise HTTPException(status_code=400, detail="Target institution must be specified.")

    contents = await file.read()
    if len(contents) > 10 * 1024 * 1024: # 10MB limit
        raise HTTPException(status_code=400, detail="File size exceeds maximum allowed limit (10MB).")

    file_hash = hashlib.sha256(contents).hexdigest()

    # Parse rows
    try:
        if file.filename.endswith(".xlsx") or file.filename.endswith(".xls"):
            df = pd.read_excel(io.BytesIO(contents))
        else:
            df = pd.read_csv(io.BytesIO(contents))
        
        # Normalize column names: strip and lowercase
        df.columns = [c.strip().lower() for c in df.columns]
        # Standardize field aliases
        alias_map = {
            "apaar": "apaar_id",
            "apaar_number": "apaar_id",
            "student_id": "institutional_student_id",
            "roll_no": "institutional_student_id",
            "roll_number": "institutional_student_id",
            "name": "full_name",
            "student_name": "full_name",
            "program": "program_code",
            "branch": "program_code",
            "admission_type": "admission_category",
            "supernumerary": "is_supernumerary"
        }
        df = df.rename(columns=alias_map)
        rows = df.to_dict(orient="records")
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to parse uploaded file: {str(e)}")

    if not rows:
        raise HTTPException(status_code=400, detail="Uploaded file contains no data rows.")

    # Create submission record
    submission = DataSubmission(
        institution_id=target_inst_id,
        academic_year_id=academic_year_id,
        file_name=file.filename,
        file_hash=file_hash,
        submitted_by=current_user.email,
        status="VALIDATING",
        total_rows=len(rows)
    )
    db.add(submission)
    db.commit()
    db.refresh(submission)

    # Run validation engine
    db_findings, metrics = validation_engine.validate_batch(
        db=db,
        submission=submission,
        rows=rows,
        actor_id=current_user.id
    )

    # Automatically store valid rows in draft/staging status
    inst = db.query(Institution).filter(Institution.id == target_inst_id).first()
    ay = db.query(AcademicYear).filter(AcademicYear.id == academic_year_id).first()
    programs = db.query(Program).filter(Program.institution_id == target_inst_id).all()
    prog_map = {p.program_code.upper(): p for p in programs}

    # If no duplicate APAAR or malformed error in a row, create or stage record
    invalid_row_numbers = {f.row_number for f in db_findings if f.row_number is not None and f.severity in ["CRITICAL", "HIGH"]}

    for idx, r in enumerate(rows, start=1):
        if idx in invalid_row_numbers:
            continue

        raw_apaar = validation_engine.clean_apaar(str(r.get("apaar_id", "")))
        prog_code = str(r.get("program_code", "")).strip().upper()
        prog = prog_map.get(prog_code)
        if not prog or not raw_apaar:
            continue

        stud_name = str(r.get("full_name") or f"Student {r.get('institutional_student_id')}")
        stud_id = str(r.get("institutional_student_id"))
        is_sup = str(r.get("is_supernumerary", "")).lower() in ["true", "1", "yes"]
        sup_cat = str(r.get("supernumerary_category", "")) if is_sup else None

        apaar_hash = crypto_service.generate_apaar_hash(raw_apaar)
        identity = db.query(StudentIdentity).filter(StudentIdentity.apaar_hash == apaar_hash).first()
        if not identity:
            identity = StudentIdentity(
                apaar_id=raw_apaar,
                apaar_hash=apaar_hash,
                full_name=stud_name,
                dob=str(r.get("dob", "2005-01-01")),
                gender=str(r.get("gender", "Unspecified"))
            )
            db.add(identity)
            db.commit()
            db.refresh(identity)

        admission = AdmissionRecord(
            student_identity_id=identity.id,
            institution_id=target_inst_id,
            program_id=prog.id,
            academic_year_id=academic_year_id,
            institutional_student_id=stud_id,
            admission_date=str(r.get("admission_date", datetime.utcnow().strftime("%Y-%m-%d"))),
            admission_category=str(r.get("admission_category", "REGULAR")),
            is_supernumerary=is_sup,
            supernumerary_category=sup_cat,
            enrolment_status="ACTIVE",
            record_status="VALIDATED",
            external_verification_status="PENDING_EXTERNAL_VERIFICATION",
            source_batch_id=submission.id
        )
        db.add(admission)
        db.commit()
        db.refresh(admission)

        # Generate cryptographic credential record
        cred_ref = f"VRF-{datetime.utcnow().year}-{admission.id[:6].upper()}"
        payload = {
            "credential_reference": cred_ref,
            "institution_code": inst.institution_code,
            "institutional_student_id": admission.institutional_student_id,
            "program_code": prog.program_code,
            "academic_year": ay.label if ay else "2026-27",
            "admission_date": admission.admission_date,
            "is_supernumerary": admission.is_supernumerary,
            "enrolment_status": admission.enrolment_status,
            "issued_at": datetime.utcnow().isoformat()
        }
        signature = crypto_service.sign_canonical_payload(payload)

        cred = CredentialRecord(
            admission_record_id=admission.id,
            issuer_institution_id=target_inst_id,
            credential_reference=cred_ref,
            canonical_payload=payload,
            digital_signature=signature,
            integrity_status="VALID"
        )
        db.add(cred)

    db.commit()

    # Re-evaluate intake compliance for all programs updated
    for prog in programs:
        compliance_engine.sync_intake_compliance_case(
            db, target_inst_id, prog.id, academic_year_id, actor_id=current_user.id
        )

    return get_submission(submission.id, db, current_user)

@router.get("", response_model=List[SubmissionResponse])
def get_submissions(
    institution_id: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = db.query(DataSubmission)
    if current_user.role == "INSTITUTION_ADMIN":
        query = query.filter(DataSubmission.institution_id == current_user.institution_id)
    elif institution_id:
        query = query.filter(DataSubmission.institution_id == institution_id)

    submissions = query.order_by(DataSubmission.created_at.desc()).all()
    results = []
    for s in submissions:
        inst = db.query(Institution).filter(Institution.id == s.institution_id).first()
        ay = db.query(AcademicYear).filter(AcademicYear.id == s.academic_year_id).first()
        results.append(SubmissionResponse(
            id=s.id,
            institution_id=s.institution_id,
            institution_name=inst.name if inst else "Unknown",
            academic_year_id=s.academic_year_id,
            academic_year_label=ay.label if ay else "Unknown",
            file_name=s.file_name,
            file_hash=s.file_hash,
            submitted_by=s.submitted_by,
            status=s.status,
            total_rows=s.total_rows,
            valid_rows=s.valid_rows,
            invalid_rows=s.invalid_rows,
            duplicate_candidates=s.duplicate_candidates,
            created_at=s.created_at,
            completed_at=s.completed_at
        ))
    return results

@router.get("/{id}", response_model=SubmissionResponse)
def get_submission(
    id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    s = db.query(DataSubmission).filter(DataSubmission.id == id).first()
    if not s:
        raise HTTPException(status_code=404, detail="Submission not found")

    enforce_institution_isolation(current_user, s.institution_id)

    inst = db.query(Institution).filter(Institution.id == s.institution_id).first()
    ay = db.query(AcademicYear).filter(AcademicYear.id == s.academic_year_id).first()
    findings = db.query(ValidationFinding).filter(ValidationFinding.submission_id == s.id).all()

    return SubmissionResponse(
        id=s.id,
        institution_id=s.institution_id,
        institution_name=inst.name if inst else "Unknown",
        academic_year_id=s.academic_year_id,
        academic_year_label=ay.label if ay else "Unknown",
        file_name=s.file_name,
        file_hash=s.file_hash,
        submitted_by=s.submitted_by,
        status=s.status,
        total_rows=s.total_rows,
        valid_rows=s.valid_rows,
        invalid_rows=s.invalid_rows,
        duplicate_candidates=s.duplicate_candidates,
        created_at=s.created_at,
        completed_at=s.completed_at,
        findings=[ValidationFindingResponse(
            id=f.id,
            submission_id=f.submission_id,
            admission_record_id=f.admission_record_id,
            row_number=f.row_number,
            rule_code=f.rule_code,
            severity=f.severity,
            finding_type=f.finding_type,
            message=f.message,
            evidence_json=f.evidence_json,
            resolution_status=f.resolution_status,
            resolved_by=f.resolved_by,
            resolved_at=f.resolved_at,
            created_at=f.created_at
        ) for f in findings]
    )

@router.post("/{id}/submit")
def finalize_submission(
    id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    s = db.query(DataSubmission).filter(DataSubmission.id == id).first()
    if not s:
        raise HTTPException(status_code=404, detail="Submission not found")

    enforce_institution_isolation(current_user, s.institution_id)

    s.status = "SUBMITTED"
    s.completed_at = datetime.utcnow()
    db.commit()

    audit_service.log_event(
        db=db,
        actor_id=current_user.id,
        actor_role=current_user.role,
        action="SUBMISSION_FINALIZED",
        resource_type="SUBMISSION",
        resource_id=s.id,
        outcome="SUCCESS",
        metadata={"valid_rows": s.valid_rows, "total_rows": s.total_rows},
        institution_id=s.institution_id
    )

    return {"message": "Batch successfully submitted to AICTE Central Repository", "submission_id": s.id}

@router.get("/{id}/export-errors")
def export_submission_errors(
    id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    s = db.query(DataSubmission).filter(DataSubmission.id == id).first()
    if not s:
        raise HTTPException(status_code=404, detail="Submission not found")

    enforce_institution_isolation(current_user, s.institution_id)

    findings = db.query(ValidationFinding).filter(ValidationFinding.submission_id == s.id).all()

    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(["Row_Number", "Rule_Code", "Severity", "Finding_Type", "Message", "Status"])

    for f in findings:
        writer.writerow([
            f.row_number or "N/A",
            f.rule_code,
            f.severity,
            f.finding_type,
            f.message,
            f.resolution_status
        ])

    return Response(
        content=output.getvalue(),
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename=submission_{id}_errors.csv"}
    )
