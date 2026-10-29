from fastapi import APIRouter, Depends, Response
from sqlalchemy.orm import Session
import io
import csv
from datetime import datetime
from app.database import get_db
from app.models import ComplianceCase, Institution, Program, AcademicYear, ProgramIntake, ValidationFinding, User
from app.services.auth_service import get_current_user, require_role
from app.services.compliance_engine import compliance_engine
from app.services.audit_service import audit_service

router = APIRouter(prefix="/reports", tags=["Reports & Policy Intelligence"])

@router.get("/compliance-cases")
def export_compliance_report(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    cases = db.query(ComplianceCase).order_by(ComplianceCase.created_at.desc()).all()
    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow([
        "Case_ID", "Institution_Code", "Institution_Name", "Program",
        "Academic_Year", "Case_Type", "Priority", "Status",
        "Assigned_To", "Decision", "Created_At", "Resolved_At"
    ])

    for c in cases:
        inst = db.query(Institution).filter(Institution.id == c.institution_id).first()
        prog = db.query(Program).filter(Program.id == c.program_id).first()
        ay = db.query(AcademicYear).filter(AcademicYear.id == c.academic_year_id).first()

        writer.writerow([
            c.id,
            inst.institution_code if inst else "",
            inst.name if inst else "",
            prog.program_name if prog else "",
            ay.label if ay else "",
            c.case_type,
            c.priority,
            c.status,
            c.assigned_to or "Unassigned",
            c.decision or "Pending Decision",
            c.created_at.strftime("%Y-%m-%d %H:%M"),
            c.resolved_at.strftime("%Y-%m-%d %H:%M") if c.resolved_at else "Open"
        ])

    audit_service.log_event(
        db=db,
        actor_id=current_user.id,
        actor_role=current_user.role,
        action="EXPORT_COMPLIANCE_REPORT",
        resource_type="REPORT",
        resource_id="COMPLIANCE_CASES",
        outcome="SUCCESS",
        metadata={"cases_count": len(cases)},
        institution_id=current_user.institution_id
    )

    return Response(
        content=output.getvalue(),
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename=compliance_cases_report_{datetime.utcnow().strftime('%Y%m%d')}.csv"}
    )

@router.get("/intake-utilization")
def export_intake_report(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    intakes = db.query(ProgramIntake).all()
    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow([
        "Institution_Code", "Institution_Name", "Program_Code", "Program_Name",
        "Academic_Year", "Approved_Regular_Intake", "Actual_Regular_Enrolment",
        "Supernumerary_Enrolment", "Utilization_Percentage", "Excess_Count", "Compliance_Status"
    ])

    for item in intakes:
        inst = db.query(Institution).filter(Institution.id == item.institution_id).first()
        prog = db.query(Program).filter(Program.id == item.program_id).first()
        ay = db.query(AcademicYear).filter(AcademicYear.id == item.academic_year_id).first()
        metrics = compliance_engine.calculate_program_intake(
            db, item.institution_id, item.program_id, item.academic_year_id
        )

        writer.writerow([
            inst.institution_code if inst else "",
            inst.name if inst else "",
            prog.program_code if prog else "",
            prog.program_name if prog else "",
            ay.label if ay else "",
            item.approved_regular_intake,
            metrics["actual_regular_enrolment"],
            metrics["actual_supernumerary_enrolment"],
            f"{metrics['utilization_percentage']}%",
            metrics["excess"],
            metrics["status"]
        ])

    return Response(
        content=output.getvalue(),
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename=intake_utilization_report_{datetime.utcnow().strftime('%Y%m%d')}.csv"}
    )
