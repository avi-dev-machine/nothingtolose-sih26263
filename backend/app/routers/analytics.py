from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import Dict, Any, List
from app.database import get_db
from app.models import (
    Institution, Program, ProgramIntake, AdmissionRecord, ComplianceCase,
    DataSubmission, ValidationFinding, User
)
from app.schemas import OverviewAnalyticsResponse
from app.services.auth_service import get_current_user
from app.services.compliance_engine import compliance_engine

router = APIRouter(prefix="/analytics", tags=["Analytics & National Oversight"])

@router.get("/overview", response_model=OverviewAnalyticsResponse)
def get_national_overview(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """
    Computes national AICTE regulatory KPIs and distributions from live database records.
    """
    total_inst = db.query(Institution).count()
    sub_inst = db.query(func.count(func.distinct(DataSubmission.institution_id))).scalar() or 0
    total_records = db.query(AdmissionRecord).count()
    verified_records = db.query(AdmissionRecord).filter(
        AdmissionRecord.external_verification_status.in_(["EXTERNALLY_VERIFIED", "FORMAT_VALIDATED"])
    ).count()
    pending_records = db.query(AdmissionRecord).filter(
        AdmissionRecord.external_verification_status == "PENDING_EXTERNAL_VERIFICATION"
    ).count()
    flagged_records = db.query(AdmissionRecord).filter(
        AdmissionRecord.record_status.in_(["FLAGGED_FOR_REVIEW", "CORRECTION_REQUIRED"])
    ).count()

    open_cases = db.query(ComplianceCase).filter(
        ComplianceCase.status.in_(["OPEN", "UNDER_REVIEW", "ACTION_REQUIRED"])
    ).count()

    # Program intakes metrics
    intakes = db.query(ProgramIntake).all()
    exceeding_count = 0
    utilization_sum = 0.0
    intake_vs_enrolment = []

    for item in intakes:
        metrics = compliance_engine.calculate_program_intake(
            db, item.institution_id, item.program_id, item.academic_year_id
        )
        if metrics["excess"] > 0:
            exceeding_count += 1
        utilization_sum += metrics["utilization_percentage"]

        prog = db.query(Program).filter(Program.id == item.program_id).first()
        inst = db.query(Institution).filter(Institution.id == item.institution_id).first()

        intake_vs_enrolment.append({
            "program_code": prog.program_code if prog else "Unknown",
            "program_name": prog.program_name if prog else "Unknown",
            "institution_name": inst.name if inst else "Unknown",
            "approved_intake": item.approved_regular_intake,
            "actual_enrolment": metrics["actual_regular_enrolment"],
            "supernumerary": metrics["actual_supernumerary_enrolment"],
            "excess": metrics["excess"],
            "utilization": metrics["utilization_percentage"],
            "status": metrics["status"]
        })

    avg_utilization = round(utilization_sum / max(1, len(intakes)), 2) if intakes else 0.0

    # State distribution
    states_query = db.query(
        Institution.state,
        func.count(Institution.id).label("institutions_count")
    ).group_by(Institution.state).all()

    state_dist = []
    for s, count in states_query:
        enrol = db.query(func.count(AdmissionRecord.id)).join(Institution).filter(Institution.state == s).scalar() or 0
        state_dist.append({
            "state": s,
            "institutions_count": count,
            "enrolment_count": enrol
        })

    # Discipline distribution
    discipline_query = db.query(
        Program.discipline,
        func.count(AdmissionRecord.id)
    ).join(AdmissionRecord, AdmissionRecord.program_id == Program.id).group_by(Program.discipline).all()

    discipline_dist = [{"discipline": d, "enrolment": c} for d, c in discipline_query]

    # Recent anomalies / cases
    cases = db.query(ComplianceCase).order_by(ComplianceCase.created_at.desc()).limit(5).all()
    recent_anomalies = []
    for c in cases:
        inst = db.query(Institution).filter(Institution.id == c.institution_id).first()
        prog = db.query(Program).filter(Program.id == c.program_id).first()
        recent_anomalies.append({
            "id": c.id,
            "institution_name": inst.name if inst else "Unknown",
            "program_name": prog.program_name if prog else "Unknown",
            "case_type": c.case_type,
            "priority": c.priority,
            "status": c.status,
            "evidence": c.evidence_json
        })

    return OverviewAnalyticsResponse(
        total_institutions=total_inst,
        institutions_with_submissions=sub_inst,
        total_records=total_records,
        verified_records=verified_records,
        pending_records=pending_records,
        flagged_records=flagged_records,
        open_compliance_cases=open_cases,
        programs_exceeding_intake=exceeding_count,
        avg_intake_utilization=avg_utilization,
        state_distribution=state_dist,
        discipline_distribution=discipline_dist,
        intake_vs_enrolment_by_program=intake_vs_enrolment[:10],
        recent_anomalies=recent_anomalies
    )
