from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional, Dict, Any
from datetime import datetime
from app.database import get_db
from app.models import ComplianceCase, Institution, Program, AcademicYear, User
from app.schemas import ComplianceCaseResponse, ComplianceAssignRequest, ComplianceDecisionRequest
from app.services.auth_service import get_current_user, require_role, enforce_institution_isolation
from app.services.audit_service import audit_service

router = APIRouter(prefix="/compliance", tags=["Regulatory Compliance & Cases"])

@router.get("/summary", response_model=Dict[str, Any])
def get_compliance_summary(
    institution_id: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = db.query(ComplianceCase)
    if current_user.role == "INSTITUTION_ADMIN":
        query = query.filter(ComplianceCase.institution_id == current_user.institution_id)
    elif institution_id:
        query = query.filter(ComplianceCase.institution_id == institution_id)

    total_cases = query.count()
    open_cases = query.filter(ComplianceCase.status.in_(["OPEN", "UNDER_REVIEW", "ACTION_REQUIRED"])).count()
    intake_violations = query.filter(ComplianceCase.case_type == "INTAKE_VIOLATION").count()
    cross_conflicts = query.filter(ComplianceCase.case_type == "CROSS_INSTITUTION_CONFLICT").count()
    critical_cases = query.filter(ComplianceCase.priority == "CRITICAL", ComplianceCase.status != "RESOLVED").count()

    return {
        "total_cases": total_cases,
        "open_cases": open_cases,
        "resolved_cases": total_cases - open_cases,
        "intake_violations": intake_violations,
        "cross_conflicts": cross_conflicts,
        "critical_cases": critical_cases
    }

@router.get("/cases", response_model=List[ComplianceCaseResponse])
def get_compliance_cases(
    status: Optional[str] = None,
    priority: Optional[str] = None,
    case_type: Optional[str] = None,
    institution_id: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = db.query(ComplianceCase)

    if current_user.role == "INSTITUTION_ADMIN":
        query = query.filter(ComplianceCase.institution_id == current_user.institution_id)
    elif institution_id:
        query = query.filter(ComplianceCase.institution_id == institution_id)

    if status:
        query = query.filter(ComplianceCase.status == status)
    if priority:
        query = query.filter(ComplianceCase.priority == priority)
    if case_type:
        query = query.filter(ComplianceCase.case_type == case_type)

    cases = query.order_by(ComplianceCase.created_at.desc()).all()
    results = []

    for c in cases:
        inst = db.query(Institution).filter(Institution.id == c.institution_id).first()
        prog = db.query(Program).filter(Program.id == c.program_id).first()
        ay = db.query(AcademicYear).filter(AcademicYear.id == c.academic_year_id).first()

        results.append(ComplianceCaseResponse(
            id=c.id,
            institution_id=c.institution_id,
            institution_name=inst.name if inst else "Unknown",
            institution_code=inst.institution_code if inst else "Unknown",
            program_id=c.program_id,
            program_name=prog.program_name if prog else "Unknown",
            program_code=prog.program_code if prog else "Unknown",
            academic_year_id=c.academic_year_id,
            academic_year_label=ay.label if ay else "Unknown",
            case_type=c.case_type,
            priority=c.priority,
            status=c.status,
            evidence_json=c.evidence_json,
            assigned_to=c.assigned_to,
            decision=c.decision,
            decision_reason=c.decision_reason,
            created_at=c.created_at,
            updated_at=c.updated_at,
            resolved_at=c.resolved_at
        ))

    return results

@router.get("/cases/{id}", response_model=ComplianceCaseResponse)
def get_compliance_case(
    id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    c = db.query(ComplianceCase).filter(ComplianceCase.id == id).first()
    if not c:
        raise HTTPException(status_code=404, detail="Compliance case not found")

    enforce_institution_isolation(current_user, c.institution_id)

    inst = db.query(Institution).filter(Institution.id == c.institution_id).first()
    prog = db.query(Program).filter(Program.id == c.program_id).first()
    ay = db.query(AcademicYear).filter(AcademicYear.id == c.academic_year_id).first()

    return ComplianceCaseResponse(
        id=c.id,
        institution_id=c.institution_id,
        institution_name=inst.name if inst else "Unknown",
        institution_code=inst.institution_code if inst else "Unknown",
        program_id=c.program_id,
        program_name=prog.program_name if prog else "Unknown",
        program_code=prog.program_code if prog else "Unknown",
        academic_year_id=c.academic_year_id,
        academic_year_label=ay.label if ay else "Unknown",
        case_type=c.case_type,
        priority=c.priority,
        status=c.status,
        evidence_json=c.evidence_json,
        assigned_to=c.assigned_to,
        decision=c.decision,
        decision_reason=c.decision_reason,
        created_at=c.created_at,
        updated_at=c.updated_at,
        resolved_at=c.resolved_at
    )

@router.post("/cases/{id}/assign")
def assign_case(
    id: str,
    payload: ComplianceAssignRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["AICTE_ADMIN"]))
):
    c = db.query(ComplianceCase).filter(ComplianceCase.id == id).first()
    if not c:
        raise HTTPException(status_code=404, detail="Compliance case not found")

    c.assigned_to = payload.assigned_to
    c.status = "UNDER_REVIEW"
    c.updated_at = datetime.utcnow()
    db.commit()

    audit_service.log_event(
        db=db,
        actor_id=current_user.id,
        actor_role=current_user.role,
        action="COMPLIANCE_CASE_ASSIGNED",
        resource_type="COMPLIANCE_CASE",
        resource_id=c.id,
        outcome="SUCCESS",
        metadata={"assigned_to": payload.assigned_to},
        institution_id=c.institution_id
    )

    return {"message": f"Case assigned to {payload.assigned_to}", "status": c.status}

@router.post("/cases/{id}/decision")
def record_decision(
    id: str,
    payload: ComplianceDecisionRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["AICTE_ADMIN"]))
):
    """
    Records an auditable regulatory decision on an intake compliance case.
    """
    c = db.query(ComplianceCase).filter(ComplianceCase.id == id).first()
    if not c:
        raise HTTPException(status_code=404, detail="Compliance case not found")

    c.decision = payload.decision
    c.decision_reason = payload.decision_reason
    c.status = "RESOLVED"
    c.resolved_at = datetime.utcnow()
    c.updated_at = datetime.utcnow()
    db.commit()

    audit_service.log_event(
        db=db,
        actor_id=current_user.id,
        actor_role=current_user.role,
        action="COMPLIANCE_DECISION_RECORDED",
        resource_type="COMPLIANCE_CASE",
        resource_id=c.id,
        outcome="SUCCESS",
        metadata={"decision": payload.decision, "reason": payload.decision_reason},
        institution_id=c.institution_id
    )

    return {
        "message": "Regulatory decision recorded successfully",
        "case_id": c.id,
        "decision": c.decision,
        "status": c.status
    }
