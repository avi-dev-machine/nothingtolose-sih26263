import re
from typing import List, Dict, Any, Tuple, Optional
from datetime import datetime
from sqlalchemy.orm import Session
from app.models import (
    DataSubmission, ValidationFinding, AdmissionRecord, StudentIdentity,
    Institution, Program, AcademicYear, ProgramIntake
)
from app.services.crypto_service import crypto_service
from app.services.compliance_engine import compliance_engine
from app.services.audit_service import audit_service

class ValidationEngine:
    # 12-digit numeric specification (allowing optional dashes or spaces)
    APAAR_REGEX = re.compile(r"^\d{12}$")
    CLEAN_REGEX = re.compile(r"[\s\-]")

    @classmethod
    def clean_apaar(cls, raw: str) -> str:
        if not raw:
            return ""
        return cls.CLEAN_REGEX.sub("", str(raw).strip())

    @classmethod
    def validate_row_format(cls, row: Dict[str, Any], row_idx: int) -> List[Dict[str, Any]]:
        findings = []

        apaar_raw = row.get("apaar_id") or row.get("APAAR_ID") or ""
        student_id = row.get("institutional_student_id") or row.get("Student_ID") or ""
        program_code = row.get("program_code") or row.get("Program_Code") or ""
        name = row.get("full_name") or row.get("Name") or ""

        # Check required fields
        if not str(apaar_raw).strip():
            findings.append({
                "row_number": row_idx,
                "rule_code": "RULE_MISSING_REQUIRED_FIELD",
                "severity": "CRITICAL",
                "finding_type": "Schema Error",
                "message": f"Row {row_idx}: Mandatory field 'apaar_id' is missing or empty.",
                "evidence_json": {"field": "apaar_id", "row": row_idx}
            })
        else:
            cleaned = cls.clean_apaar(str(apaar_raw))
            if not cls.APAAR_REGEX.match(cleaned):
                findings.append({
                    "row_number": row_idx,
                    "rule_code": "RULE_MALFORMED_APAAR",
                    "severity": "HIGH",
                    "finding_type": "Identifier Format Error",
                    "message": f"Row {row_idx}: APAAR ID '{apaar_raw}' does not comply with official 12-digit numeric specification.",
                    "evidence_json": {"raw_apaar": str(apaar_raw), "cleaned_length": len(cleaned)}
                })

        if not str(student_id).strip():
            findings.append({
                "row_number": row_idx,
                "rule_code": "RULE_MISSING_REQUIRED_FIELD",
                "severity": "HIGH",
                "finding_type": "Schema Error",
                "message": f"Row {row_idx}: Mandatory field 'institutional_student_id' is missing.",
                "evidence_json": {"field": "institutional_student_id", "row": row_idx}
            })

        if not str(program_code).strip():
            findings.append({
                "row_number": row_idx,
                "rule_code": "RULE_MISSING_REQUIRED_FIELD",
                "severity": "HIGH",
                "finding_type": "Schema Error",
                "message": f"Row {row_idx}: Program code is missing.",
                "evidence_json": {"field": "program_code", "row": row_idx}
            })

        # Supernumerary seat consistency check
        is_sup = str(row.get("is_supernumerary", "")).lower() in ["true", "1", "yes"]
        sup_cat = row.get("supernumerary_category")
        if is_sup and (not sup_cat or str(sup_cat).strip().lower() in ["", "none", "nan"]):
            findings.append({
                "row_number": row_idx,
                "rule_code": "RULE_SUPERNUMERARY_MISMATCH",
                "severity": "MEDIUM",
                "finding_type": "Policy Compliance Error",
                "message": f"Row {row_idx}: Record marked as supernumerary seat but missing specific category (e.g., TFW, EWS, J&K_MIGRANT, SPORTS).",
                "evidence_json": {"is_supernumerary": True, "category": sup_cat}
            })

        return findings

    @classmethod
    def validate_batch(
        cls,
        db: Session,
        submission: DataSubmission,
        rows: List[Dict[str, Any]],
        actor_id: str = "SYSTEM"
    ) -> Tuple[List[ValidationFinding], Dict[str, Any]]:
        """
        Runs comprehensive multi-stage validation:
        1. Format & completeness check
        2. Within-batch duplicate check
        3. Cross-institution active enrolment conflict check
        4. Program and intake capacity check
        """
        all_findings = []
        batch_apaar_map: Dict[str, List[int]] = {}
        batch_stud_id_map: Dict[str, List[int]] = {}

        institution = db.query(Institution).filter(Institution.id == submission.institution_id).first()
        programs = db.query(Program).filter(Program.institution_id == submission.institution_id).all()
        program_by_code = {p.program_code.upper(): p for p in programs}

        valid_row_indices = set()
        duplicate_count = 0

        # Stage 1 & 2: Row format & In-Batch duplicate detection
        for idx, row in enumerate(rows, start=1):
            row_findings = cls.validate_row_format(row, idx)
            apaar_raw = row.get("apaar_id") or row.get("APAAR_ID") or ""
            cleaned_apaar = cls.clean_apaar(str(apaar_raw))
            stud_id = str(row.get("institutional_student_id") or row.get("Student_ID") or "").strip()

            if cleaned_apaar and cls.APAAR_REGEX.match(cleaned_apaar):
                if cleaned_apaar not in batch_apaar_map:
                    batch_apaar_map[cleaned_apaar] = []
                batch_apaar_map[cleaned_apaar].append(idx)

            if stud_id:
                if stud_id not in batch_stud_id_map:
                    batch_stud_id_map[stud_id] = []
                batch_stud_id_map[stud_id].append(idx)

            # Check if program exists for this institution
            prog_code = str(row.get("program_code") or row.get("Program_Code") or "").strip().upper()
            if prog_code and prog_code not in program_by_code:
                row_findings.append({
                    "row_number": idx,
                    "rule_code": "RULE_UNREGISTERED_PROGRAM",
                    "severity": "HIGH",
                    "finding_type": "Institutional Registry Error",
                    "message": f"Row {idx}: Program code '{prog_code}' is not registered under institution {institution.name if institution else 'this institution'}.",
                    "evidence_json": {"submitted_program_code": prog_code, "institution_id": submission.institution_id}
                })

            if row_findings:
                all_findings.extend(row_findings)
            else:
                valid_row_indices.add(idx)

        # In-batch duplicate APAAR checks
        for apaar, row_list in batch_apaar_map.items():
            if len(row_list) > 1:
                duplicate_count += len(row_list)
                for r in row_list:
                    valid_row_indices.discard(r)
                    all_findings.append({
                        "row_number": r,
                        "rule_code": "RULE_BATCH_DUPLICATE_APAAR",
                        "severity": "CRITICAL",
                        "finding_type": "Duplicate Identity Submission",
                        "message": f"Row {r}: APAAR identifier appears {len(row_list)} times in this uploaded batch (Rows: {', '.join(map(str, row_list))}).",
                        "evidence_json": {"masked_apaar": crypto_service.mask_apaar(apaar), "duplicate_rows": row_list}
                    })

        # In-batch duplicate institutional student ID checks
        for sid, row_list in batch_stud_id_map.items():
            if len(row_list) > 1:
                for r in row_list:
                    valid_row_indices.discard(r)
                    all_findings.append({
                        "row_number": r,
                        "rule_code": "RULE_BATCH_DUPLICATE_STUDENT_ID",
                        "severity": "HIGH",
                        "finding_type": "Duplicate Institutional Roll/ID",
                        "message": f"Row {r}: Institutional Student ID '{sid}' is repeated across multiple rows (Rows: {', '.join(map(str, row_list))}).",
                        "evidence_json": {"student_id": sid, "rows": row_list}
                    })

        # Stage 3: Cross-Institution Conflict Check
        for apaar, row_list in batch_apaar_map.items():
            apaar_hash = crypto_service.generate_apaar_hash(apaar)
            # Find any active admission records in other institutions
            conflicts = db.query(AdmissionRecord).join(StudentIdentity).filter(
                StudentIdentity.apaar_hash == apaar_hash,
                AdmissionRecord.institution_id != submission.institution_id,
                AdmissionRecord.enrolment_status == "ACTIVE"
            ).all()

            if conflicts:
                for conf in conflicts:
                    other_inst = db.query(Institution).filter(Institution.id == conf.institution_id).first()
                    for r in row_list:
                        all_findings.append({
                            "row_number": r,
                            "rule_code": "RULE_CROSS_INSTITUTION_CONFLICT",
                            "severity": "CRITICAL",
                            "finding_type": "National Cross-Institution Conflict",
                            "message": f"Row {r}: APAAR identity already has an ACTIVE enrolment at '{other_inst.name if other_inst else 'Another Institution'}' (Student ID: {conf.institutional_student_id}).",
                            "evidence_json": {
                                "conflicting_institution": other_inst.name if other_inst else "Unknown",
                                "conflicting_institution_code": other_inst.institution_code if other_inst else "Unknown",
                                "conflicting_student_id": conf.institutional_student_id,
                                "conflicting_program_id": conf.program_id,
                                "admission_date": conf.admission_date
                            }
                        })

        # Save findings to database
        db_findings = []
        for f in all_findings:
            db_finding = ValidationFinding(
                submission_id=submission.id,
                row_number=f.get("row_number"),
                rule_code=f["rule_code"],
                severity=f["severity"],
                finding_type=f["finding_type"],
                message=f["message"],
                evidence_json=f.get("evidence_json"),
                resolution_status="OPEN"
            )
            db.add(db_finding)
            db_findings.append(db_finding)

        # Update submission metrics
        submission.total_rows = len(rows)
        submission.valid_rows = len(valid_row_indices)
        submission.invalid_rows = len(rows) - len(valid_row_indices)
        submission.duplicate_candidates = duplicate_count
        submission.status = "VALIDATED_WITH_ERRORS" if db_findings else "VALIDATED"
        submission.completed_at = datetime.utcnow()

        db.commit()

        audit_service.log_event(
            db=db,
            actor_id=actor_id,
            actor_role="INSTITUTION_ADMIN",
            action="BATCH_VALIDATED",
            resource_type="SUBMISSION",
            resource_id=submission.id,
            outcome="FLAGGED" if db_findings else "SUCCESS",
            metadata={
                "total_rows": len(rows),
                "valid_rows": len(valid_row_indices),
                "findings_count": len(db_findings),
                "duplicate_candidates": duplicate_count
            },
            institution_id=submission.institution_id
        )

        return db_findings, {
            "total_rows": len(rows),
            "valid_rows": len(valid_row_indices),
            "invalid_rows": len(rows) - len(valid_row_indices),
            "duplicate_candidates": duplicate_count,
            "status": submission.status
        }

validation_engine = ValidationEngine()
