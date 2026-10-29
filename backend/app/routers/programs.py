from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from app.database import get_db
from app.models import Program, ProgramIntake, Institution, AcademicYear, User
from app.schemas import ProgramResponse, ProgramIntakeResponse
from app.services.auth_service import get_current_user, enforce_institution_isolation
from app.services.compliance_engine import compliance_engine

router = APIRouter(prefix="/programs", tags=["Programs & Intakes"])

@router.get("", response_model=List[ProgramResponse])
def get_programs(
    institution_id: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = db.query(Program)
    if current_user.role == "INSTITUTION_ADMIN":
        query = query.filter(Program.institution_id == current_user.institution_id)
    elif institution_id:
        query = query.filter(Program.institution_id == institution_id)

    return query.order_by(Program.program_name).all()

@router.get("/intakes", response_model=List[ProgramIntakeResponse])
def get_program_intakes(
    institution_id: Optional[str] = None,
    academic_year_id: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Returns intake limits and real-time calculated enrolment utilization.
    Calculates actual regular enrolment vs approved intake and separates supernumerary seats.
    """
    query = db.query(ProgramIntake)

    if current_user.role == "INSTITUTION_ADMIN":
        query = query.filter(ProgramIntake.institution_id == current_user.institution_id)
    elif institution_id:
        query = query.filter(ProgramIntake.institution_id == institution_id)

    if academic_year_id:
        query = query.filter(ProgramIntake.academic_year_id == academic_year_id)

    intakes = query.all()
    results = []

    for item in intakes:
        metrics = compliance_engine.calculate_program_intake(
            db, item.institution_id, item.program_id, item.academic_year_id
        )

        inst = db.query(Institution).filter(Institution.id == item.institution_id).first()
        prog = db.query(Program).filter(Program.id == item.program_id).first()
        ay = db.query(AcademicYear).filter(AcademicYear.id == item.academic_year_id).first()

        results.append(ProgramIntakeResponse(
            id=item.id,
            institution_id=item.institution_id,
            institution_name=inst.name if inst else "Unknown",
            program_id=item.program_id,
            program_name=prog.program_name if prog else "Unknown",
            program_code=prog.program_code if prog else "Unknown",
            academic_year_id=item.academic_year_id,
            academic_year_label=ay.label if ay else "Unknown",
            approved_regular_intake=item.approved_regular_intake,
            applicable_supernumerary_limits=item.applicable_supernumerary_limits,
            actual_regular_enrolment=metrics["actual_regular_enrolment"],
            actual_supernumerary_enrolment=metrics["actual_supernumerary_enrolment"],
            utilization_percentage=metrics["utilization_percentage"],
            excess=metrics["excess"],
            status=metrics["status"]
        ))

    return results
