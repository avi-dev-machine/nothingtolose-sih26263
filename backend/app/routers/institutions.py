from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List, Optional
from app.database import get_db
from app.models import Institution, Program, AdmissionRecord, ComplianceCase, User
from app.schemas import InstitutionResponse, InstitutionUpdate
from app.services.auth_service import get_current_user, require_role, enforce_institution_isolation
from app.services.audit_service import audit_service

router = APIRouter(prefix="/institutions", tags=["Institutions"])

@router.get("", response_model=List[InstitutionResponse])
def get_institutions(
    state: Optional[str] = None,
    approval_status: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    List registered institutions with aggregate metrics.
    AICTE_ADMIN sees all; INSTITUTION_ADMIN sees their own.
    """
    query = db.query(Institution)

    if current_user.role == "INSTITUTION_ADMIN":
        query = query.filter(Institution.id == current_user.institution_id)
    else:
        if state:
            query = query.filter(Institution.state.ilike(f"%{state}%"))
        if approval_status:
            query = query.filter(Institution.approval_status == approval_status)

    institutions = query.order_by(Institution.name).all()
    results = []

    for inst in institutions:
        prog_count = db.query(func.count(Program.id)).filter(Program.institution_id == inst.id).scalar() or 0
        enrolment_count = db.query(func.count(AdmissionRecord.id)).filter(
            AdmissionRecord.institution_id == inst.id,
            AdmissionRecord.enrolment_status == "ACTIVE"
        ).scalar() or 0
        cases_count = db.query(func.count(ComplianceCase.id)).filter(
            ComplianceCase.institution_id == inst.id,
            ComplianceCase.status.in_(["OPEN", "UNDER_REVIEW", "ACTION_REQUIRED"])
        ).scalar() or 0

        res = InstitutionResponse(
            id=inst.id,
            institution_code=inst.institution_code,
            name=inst.name,
            institution_type=inst.institution_type,
            state=inst.state,
            district=inst.district,
            approval_status=inst.approval_status,
            contact_email=inst.contact_email,
            created_at=inst.created_at,
            programs_count=prog_count,
            total_enrolment=enrolment_count,
            compliance_cases_count=cases_count
        )
        results.append(res)

    return results

@router.get("/{id}", response_model=InstitutionResponse)
def get_institution(
    id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    enforce_institution_isolation(current_user, id)
    inst = db.query(Institution).filter(Institution.id == id).first()
    if not inst:
        raise HTTPException(status_code=404, detail="Institution not found")

    prog_count = db.query(func.count(Program.id)).filter(Program.institution_id == inst.id).scalar() or 0
    enrolment_count = db.query(func.count(AdmissionRecord.id)).filter(
        AdmissionRecord.institution_id == inst.id,
        AdmissionRecord.enrolment_status == "ACTIVE"
    ).scalar() or 0
    cases_count = db.query(func.count(ComplianceCase.id)).filter(
        ComplianceCase.institution_id == inst.id,
        ComplianceCase.status.in_(["OPEN", "UNDER_REVIEW", "ACTION_REQUIRED"])
    ).scalar() or 0

    return InstitutionResponse(
        id=inst.id,
        institution_code=inst.institution_code,
        name=inst.name,
        institution_type=inst.institution_type,
        state=inst.state,
        district=inst.district,
        approval_status=inst.approval_status,
        contact_email=inst.contact_email,
        created_at=inst.created_at,
        programs_count=prog_count,
        total_enrolment=enrolment_count,
        compliance_cases_count=cases_count
    )

@router.patch("/{id}", response_model=InstitutionResponse)
def update_institution(
    id: str,
    payload: InstitutionUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["AICTE_ADMIN"]))
):
    inst = db.query(Institution).filter(Institution.id == id).first()
    if not inst:
        raise HTTPException(status_code=404, detail="Institution not found")

    if payload.name:
        inst.name = payload.name
    if payload.approval_status:
        inst.approval_status = payload.approval_status
    if payload.contact_email:
        inst.contact_email = payload.contact_email

    db.commit()
    db.refresh(inst)

    audit_service.log_event(
        db=db,
        actor_id=current_user.id,
        actor_role=current_user.role,
        action="UPDATE_INSTITUTION",
        resource_type="INSTITUTION",
        resource_id=inst.id,
        outcome="SUCCESS",
        metadata={"approval_status": inst.approval_status},
        institution_id=inst.id
    )

    return get_institution(id, db, current_user)
