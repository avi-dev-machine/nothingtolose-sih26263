from fastapi import APIRouter, Depends, HTTPException, status, Query, Response
from sqlalchemy.orm import Session
from sqlalchemy import or_
from typing import List, Optional, Dict, Any
import io
import csv
from datetime import datetime
from app.database import get_db
from app.models import (
    AdmissionRecord, StudentIdentity, Institution, Program, AcademicYear,
    ValidationFinding, AuditEvent, CredentialRecord, User
)
from app.schemas import StudentResponse, StudentDetailResponse, StudentUpdate, StudentCreate
from app.services.auth_service import get_current_user, enforce_institution_isolation
from app.services.crypto_service import crypto_service
from app.services.compliance_engine import compliance_engine
from app.services.audit_service import audit_service

router = APIRouter(prefix="/students", tags=["Student Records"])

@router.get("", response_model=Dict if False else Any) # returns dict with items and total
def get_students(
    search: Optional[str] = None,
    institution_id: Optional[str] = None,
    program_id: Optional[str] = None,
    academic_year_id: Optional[str] = None,
    record_status: Optional[str] = None,
    external_verification_status: Optional[str] = None,
    is_supernumerary: Optional[bool] = None,
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=200),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Search and filter student admission records with server-side pagination.
    Protects APAAR IDs via masking. Enforces tenant isolation.
    """
    effective_inst_id = enforce_institution_isolation(current_user, institution_id)

    query = db.query(AdmissionRecord).join(StudentIdentity)

    if effective_inst_id:
        query = query.filter(AdmissionRecord.institution_id == effective_inst_id)
    if program_id:
        query = query.filter(AdmissionRecord.program_id == program_id)
    if academic_year_id:
        query = query.filter(AdmissionRecord.academic_year_id == academic_year_id)
    if record_status:
        query = query.filter(AdmissionRecord.record_status == record_status)
    if external_verification_status:
        query = query.filter(AdmissionRecord.external_verification_status == external_verification_status)
    if is_supernumerary is not None:
        query = query.filter(AdmissionRecord.is_supernumerary == is_supernumerary)

    if search:
        s = f"%{search.strip()}%"
        query = query.filter(
            or_(
                StudentIdentity.full_name.ilike(s),
                AdmissionRecord.institutional_student_id.ilike(s),
                StudentIdentity.apaar_id.ilike(s)
            )
        )

    total = query.count()
    records = query.order_by(AdmissionRecord.created_at.desc()).offset(skip).limit(limit).all()

    items = []
    for rec in records:
        inst = db.query(Institution).filter(Institution.id == rec.institution_id).first()
        prog = db.query(Program).filter(Program.id == rec.program_id).first()
        ay = db.query(AcademicYear).filter(AcademicYear.id == rec.academic_year_id).first()
        cred = db.query(CredentialRecord).filter(CredentialRecord.admission_record_id == rec.id).first()

        items.append({
            "id": rec.id,
            "institutional_student_id": rec.institutional_student_id,
            "masked_apaar_id": crypto_service.mask_apaar(rec.student_identity.apaar_id),
            "full_name": rec.student_identity.full_name,
            "institution_id": rec.institution_id,
            "institution_name": inst.name if inst else "Unknown",
            "program_id": rec.program_id,
            "program_name": prog.program_name if prog else "Unknown",
            "program_code": prog.program_code if prog else "Unknown",
            "academic_year_id": rec.academic_year_id,
            "academic_year_label": ay.label if ay else "Unknown",
            "admission_date": rec.admission_date,
            "admission_category": rec.admission_category,
            "is_supernumerary": rec.is_supernumerary,
            "supernumerary_category": rec.supernumerary_category,
            "enrolment_status": rec.enrolment_status,
            "record_status": rec.record_status,
            "external_verification_status": rec.external_verification_status,
            "credential_reference": cred.credential_reference if cred else None,
            "created_at": rec.created_at,
            "updated_at": rec.updated_at
        })

    return {"total": total, "skip": skip, "limit": limit, "items": items}

@router.get("/{id}", response_model=StudentDetailResponse)
def get_student(
    id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    rec = db.query(AdmissionRecord).filter(AdmissionRecord.id == id).first()
    if not rec:
        raise HTTPException(status_code=404, detail="Student admission record not found")

    enforce_institution_isolation(current_user, rec.institution_id)

    inst = db.query(Institution).filter(Institution.id == rec.institution_id).first()
    prog = db.query(Program).filter(Program.id == rec.program_id).first()
    ay = db.query(AcademicYear).filter(AcademicYear.id == rec.academic_year_id).first()
    cred = db.query(CredentialRecord).filter(CredentialRecord.admission_record_id == rec.id).first()

    findings = db.query(ValidationFinding).filter(
        ValidationFinding.admission_record_id == rec.id
    ).all()

    audit_logs = db.query(AuditEvent).filter(
        AuditEvent.resource_id == rec.id
    ).order_by(AuditEvent.timestamp.desc()).all()

    return StudentDetailResponse(
        id=rec.id,
        institutional_student_id=rec.institutional_student_id,
        masked_apaar_id=crypto_service.mask_apaar(rec.student_identity.apaar_id),
        raw_apaar_id=rec.student_identity.apaar_id if current_user.role in ["AICTE_ADMIN", "INSTITUTION_ADMIN"] else None,
        full_name=rec.student_identity.full_name,
        dob=rec.student_identity.dob,
        gender=rec.student_identity.gender,
        institution_id=rec.institution_id,
        institution_name=inst.name if inst else "Unknown",
        program_id=rec.program_id,
        program_name=prog.program_name if prog else "Unknown",
        program_code=prog.program_code if prog else "Unknown",
        academic_year_id=rec.academic_year_id,
        academic_year_label=ay.label if ay else "Unknown",
        admission_date=rec.admission_date,
        admission_category=rec.admission_category,
        is_supernumerary=rec.is_supernumerary,
        supernumerary_category=rec.supernumerary_category,
        enrolment_status=rec.enrolment_status,
        record_status=rec.record_status,
        external_verification_status=rec.external_verification_status,
        credential_reference=cred.credential_reference if cred else None,
        submission_id=rec.source_batch_id,
        version=rec.version,
        created_at=rec.created_at,
        updated_at=rec.updated_at,
        findings=[{
            "id": f.id,
            "rule_code": f.rule_code,
            "severity": f.severity,
            "message": f.message,
            "resolution_status": f.resolution_status
        } for f in findings],
        audit_history=[{
            "id": a.id,
            "actor_id": a.actor_id,
            "actor_role": a.actor_role,
            "action": a.action,
            "timestamp": a.timestamp,
            "metadata": a.sanitized_metadata
        } for a in audit_logs]
    )

@router.patch("/{id}", response_model=StudentDetailResponse)
def update_student(
    id: str,
    payload: StudentUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Admission record correction workflow.
    Increments version, retains audit history, re-evaluates compliance intake.
    """
    rec = db.query(AdmissionRecord).filter(AdmissionRecord.id == id).first()
    if not rec:
        raise HTTPException(status_code=404, detail="Student admission record not found")

    enforce_institution_isolation(current_user, rec.institution_id)

    changes = {}

    if payload.full_name and payload.full_name != rec.student_identity.full_name:
        changes["full_name"] = {"old": rec.student_identity.full_name, "new": payload.full_name}
        rec.student_identity.full_name = payload.full_name

    if payload.apaar_id:
        clean = payload.apaar_id.replace(" ", "").replace("-", "")
        if clean != rec.student_identity.apaar_id:
            changes["apaar_id"] = {"old": crypto_service.mask_apaar(rec.student_identity.apaar_id), "new": crypto_service.mask_apaar(clean)}
            rec.student_identity.apaar_id = clean
            rec.student_identity.apaar_hash = crypto_service.generate_apaar_hash(clean)

    if payload.institutional_student_id and payload.institutional_student_id != rec.institutional_student_id:
        changes["institutional_student_id"] = {"old": rec.institutional_student_id, "new": payload.institutional_student_id}
        rec.institutional_student_id = payload.institutional_student_id

    if payload.admission_category and payload.admission_category != rec.admission_category:
        changes["admission_category"] = {"old": rec.admission_category, "new": payload.admission_category}
        rec.admission_category = payload.admission_category

    if payload.is_supernumerary is not None and payload.is_supernumerary != rec.is_supernumerary:
        changes["is_supernumerary"] = {"old": rec.is_supernumerary, "new": payload.is_supernumerary}
        rec.is_supernumerary = payload.is_supernumerary

    if payload.supernumerary_category is not None:
        rec.supernumerary_category = payload.supernumerary_category

    if payload.enrolment_status and payload.enrolment_status != rec.enrolment_status:
        changes["enrolment_status"] = {"old": rec.enrolment_status, "new": payload.enrolment_status}
        rec.enrolment_status = payload.enrolment_status

    if payload.record_status:
        rec.record_status = payload.record_status

    rec.version += 1
    rec.updated_at = datetime.utcnow()
    db.commit()

    # Re-evaluate program intake compliance
    compliance_engine.sync_intake_compliance_case(
        db, rec.institution_id, rec.program_id, rec.academic_year_id, actor_id=current_user.id
    )

    audit_service.log_event(
        db=db,
        actor_id=current_user.id,
        actor_role=current_user.role,
        action="STUDENT_RECORD_CORRECTED",
        resource_type="ADMISSION_RECORD",
        resource_id=rec.id,
        outcome="SUCCESS",
        metadata={"version": rec.version, "changes": changes},
        institution_id=rec.institution_id
    )

    return get_student(id, db, current_user)

@router.get("/export/csv")
def export_students_csv(
    institution_id: Optional[str] = None,
    program_id: Optional[str] = None,
    academic_year_id: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Exports student admission records to CSV with anti-formula injection safeguards.
    """
    effective_inst_id = enforce_institution_isolation(current_user, institution_id)

    query = db.query(AdmissionRecord).join(StudentIdentity)
    if effective_inst_id:
        query = query.filter(AdmissionRecord.institution_id == effective_inst_id)
    if program_id:
        query = query.filter(AdmissionRecord.program_id == program_id)
    if academic_year_id:
        query = query.filter(AdmissionRecord.academic_year_id == academic_year_id)

    records = query.all()

    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow([
        "Institutional_Student_ID", "Student_Name", "Masked_APAAR",
        "Institution", "Program", "Academic_Year", "Admission_Date",
        "Admission_Category", "Is_Supernumerary", "Supernumerary_Category",
        "Enrolment_Status", "Record_Status", "Verification_Status"
    ])

    for r in records:
        inst = db.query(Institution).filter(Institution.id == r.institution_id).first()
        prog = db.query(Program).filter(Program.id == r.program_id).first()
        ay = db.query(AcademicYear).filter(AcademicYear.id == r.academic_year_id).first()

        # Sanitize CSV formula injection (cells starting with =, +, -, @)
        def sanitize(val):
            s = str(val or "")
            if s and s[0] in ["=", "+", "-", "@"]:
                return "'" + s
            return s

        writer.writerow([
            sanitize(r.institutional_student_id),
            sanitize(r.student_identity.full_name),
            sanitize(crypto_service.mask_apaar(r.student_identity.apaar_id)),
            sanitize(inst.name if inst else ""),
            sanitize(prog.program_name if prog else ""),
            sanitize(ay.label if ay else ""),
            sanitize(r.admission_date),
            sanitize(r.admission_category),
            "YES" if r.is_supernumerary else "NO",
            sanitize(r.supernumerary_category or "N/A"),
            sanitize(r.enrolment_status),
            sanitize(r.record_status),
            sanitize(r.external_verification_status)
        ])

    audit_service.log_event(
        db=db,
        actor_id=current_user.id,
        actor_role=current_user.role,
        action="EXPORT_STUDENTS_CSV",
        resource_type="STUDENT_RECORDS",
        resource_id="BULK_EXPORT",
        outcome="SUCCESS",
        metadata={"rows_exported": len(records)},
        institution_id=effective_inst_id
    )

    csv_data = output.getvalue()
    return Response(
        content=csv_data,
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename=apaarsetu_students_{datetime.utcnow().strftime('%Y%m%d_%H%M%S')}.csv"}
    )
