from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import Dict, Any, List, Optional
from datetime import datetime
from app.models import (
    ProgramIntake, Program, AdmissionRecord, Institution, AcademicYear, ComplianceCase
)
from app.services.audit_service import audit_service

class ComplianceEngine:
    @staticmethod
    def calculate_program_intake(
        db: Session,
        institution_id: str,
        program_id: str,
        academic_year_id: str
    ) -> Dict[str, Any]:
        """
        Calculates intake metrics strictly separating regular from supernumerary seats.
        """
        intake_record = db.query(ProgramIntake).filter(
            ProgramIntake.institution_id == institution_id,
            ProgramIntake.program_id == program_id,
            ProgramIntake.academic_year_id == academic_year_id
        ).first()

        approved_intake = intake_record.approved_regular_intake if intake_record else 0
        supernumerary_limit = intake_record.applicable_supernumerary_limits if intake_record else 0

        # Count active/submitted regular admissions
        regular_count = db.query(func.count(AdmissionRecord.id)).filter(
            AdmissionRecord.institution_id == institution_id,
            AdmissionRecord.program_id == program_id,
            AdmissionRecord.academic_year_id == academic_year_id,
            AdmissionRecord.is_supernumerary == False,
            AdmissionRecord.enrolment_status.in_(["ACTIVE", "ENROLLED"])
        ).scalar() or 0

        # Count supernumerary admissions
        supernumerary_count = db.query(func.count(AdmissionRecord.id)).filter(
            AdmissionRecord.institution_id == institution_id,
            AdmissionRecord.program_id == program_id,
            AdmissionRecord.academic_year_id == academic_year_id,
            AdmissionRecord.is_supernumerary == True,
            AdmissionRecord.enrolment_status.in_(["ACTIVE", "ENROLLED"])
        ).scalar() or 0

        utilization_pct = 0.0
        if approved_intake > 0:
            utilization_pct = round((regular_count / approved_intake) * 100, 2)

        excess = max(0, regular_count - approved_intake)
        status = "COMPLIANT"
        if excess > 0:
            status = "EXCEEDED"
        elif utilization_pct >= 95.0:
            status = "NEAR_CAPACITY"

        return {
            "approved_regular_intake": approved_intake,
            "actual_regular_enrolment": regular_count,
            "supernumerary_limit": supernumerary_limit,
            "actual_supernumerary_enrolment": supernumerary_count,
            "utilization_percentage": utilization_pct,
            "excess": excess,
            "status": status
        }

    @staticmethod
    def sync_intake_compliance_case(
        db: Session,
        institution_id: str,
        program_id: str,
        academic_year_id: str,
        actor_id: str = "SYSTEM"
    ) -> Optional[ComplianceCase]:
        """
        Evaluates intake calculations and creates or updates a regulatory ComplianceCase if intake is exceeded.
        """
        metrics = ComplianceEngine.calculate_program_intake(db, institution_id, program_id, academic_year_id)
        
        program = db.query(Program).filter(Program.id == program_id).first()
        institution = db.query(Institution).filter(Institution.id == institution_id).first()
        academic_year = db.query(AcademicYear).filter(AcademicYear.id == academic_year_id).first()

        existing_case = db.query(ComplianceCase).filter(
            ComplianceCase.institution_id == institution_id,
            ComplianceCase.program_id == program_id,
            ComplianceCase.academic_year_id == academic_year_id,
            ComplianceCase.case_type == "INTAKE_VIOLATION",
            ComplianceCase.status.in_(["OPEN", "UNDER_REVIEW", "ACTION_REQUIRED"])
        ).first()

        if metrics["excess"] > 0:
            evidence = {
                "institution_name": institution.name if institution else "Unknown",
                "institution_code": institution.institution_code if institution else "Unknown",
                "program_name": program.program_name if program else "Unknown",
                "program_code": program.program_code if program else "Unknown",
                "academic_year": academic_year.label if academic_year else "Unknown",
                "approved_regular_intake": metrics["approved_regular_intake"],
                "actual_regular_enrolment": metrics["actual_regular_enrolment"],
                "excess_count": metrics["excess"],
                "utilization_pct": metrics["utilization_percentage"],
                "supernumerary_count": metrics["actual_supernumerary_enrolment"],
                "regulatory_rule": "AICTE Approval Process Handbook (APH) Reg 4.2 - Strict Regular Intake Ceiling",
                "explanation": f"Regular enrolment ({metrics['actual_regular_enrolment']}) exceeds approved regular intake ({metrics['approved_regular_intake']}) by {metrics['excess']} seats."
            }

            if not existing_case:
                case = ComplianceCase(
                    institution_id=institution_id,
                    program_id=program_id,
                    academic_year_id=academic_year_id,
                    case_type="INTAKE_VIOLATION",
                    priority="CRITICAL" if metrics["excess"] >= 5 else "HIGH",
                    status="OPEN",
                    evidence_json=evidence
                )
                db.add(case)
                db.commit()
                db.refresh(case)

                audit_service.log_event(
                    db=db,
                    actor_id=actor_id,
                    actor_role="SYSTEM",
                    action="COMPLIANCE_CASE_OPENED",
                    resource_type="COMPLIANCE_CASE",
                    resource_id=case.id,
                    outcome="FLAGGED",
                    metadata={"excess": metrics["excess"], "program": program.program_name if program else ""},
                    institution_id=institution_id
                )
                return case
            else:
                existing_case.evidence_json = evidence
                existing_case.updated_at = datetime.utcnow()
                db.commit()
                return existing_case
        return None

compliance_engine = ComplianceEngine()
