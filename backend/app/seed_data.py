import sys
import os
from datetime import datetime, timedelta

# Ensure parent directory is in path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.database import SessionLocal, engine, Base
from app.models import (
    User, Institution, AcademicYear, Program, ProgramIntake,
    StudentIdentity, AdmissionRecord, DataSubmission,
    ValidationFinding, ComplianceCase, CredentialRecord, AuditEvent, VerificationRequest
)
from app.services.crypto_service import crypto_service
from app.services.compliance_engine import compliance_engine
from app.services.audit_service import audit_service

def seed_database():
    print("[*] Rebuilding tables and seeding deterministic synthetic data for APAARSetu...")
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)

    db = SessionLocal()

    try:
        # 1. Academic Years
        ay_past = AcademicYear(
            label="2025-26",
            start_date=datetime(2025, 7, 1),
            end_date=datetime(2026, 6, 30),
            status="PAST"
        )
        ay_curr = AcademicYear(
            label="2026-27",
            start_date=datetime(2026, 7, 1),
            end_date=datetime(2027, 6, 30),
            status="ACTIVE"
        )
        db.add_all([ay_past, ay_curr])
        db.commit()

        # 2. Institutions (8 AICTE-approved institutions)
        institutions_data = [
            ("EIT-2026-WB", "Eastern Institute of Technology", "Engineering & Technology", "West Bengal", "Kolkata", "admin@eit.edu.in"),
            ("AIET-1001-MH", "Apex Institute of Engineering & Technology", "Engineering & Technology", "Maharashtra", "Pune", "admin@aiet.edu.in"),
            ("NITS-2002-DL", "National Institute of Technology & Science", "Engineering & Technology", "Delhi", "New Delhi", "admin@nits.edu.in"),
            ("DCE-3003-KA", "Deccan College of Engineering", "Engineering & Technology", "Karnataka", "Bengaluru", "admin@dce.edu.in"),
            ("KITE-4004-OR", "Kalinga Institute of Technical Education", "Engineering & Technology", "Odisha", "Bhubaneswar", "admin@kite.edu.in"),
            ("HIT-5005-UK", "Himalaya Institute of Technology", "Engineering & Technology", "Uttarakhand", "Dehradun", "admin@hit.edu.in"),
            ("GTI-6006-GJ", "Gujarat Technological Institute", "Engineering & Technology", "Gujarat", "Ahmedabad", "admin@gti.edu.in"),
            ("SAE-7007-TN", "Southern Academy of Engineering", "Engineering & Technology", "Tamil Nadu", "Chennai", "admin@sae.edu.in"),
        ]

        inst_map = {}
        for code, name, itype, state, dist, email in institutions_data:
            inst = Institution(
                institution_code=code,
                name=name,
                institution_type=itype,
                state=state,
                district=dist,
                approval_status="APPROVED",
                contact_email=email
            )
            db.add(inst)
            db.commit()
            db.refresh(inst)
            inst_map[code] = inst

        eit = inst_map["EIT-2026-WB"]
        aiet = inst_map["AIET-1001-MH"]

        # 3. Programs
        programs_spec = [
            ("CSE-BTECH", "B.Tech Computer Science and Engineering", "Computer Science", 4),
            ("ECE-BTECH", "B.Tech Electronics & Communication Engineering", "Electronics", 4),
            ("MECH-BTECH", "B.Tech Mechanical Engineering", "Mechanical", 4),
            ("MBA-MGMT", "Master of Business Administration", "Management", 2),
        ]

        prog_map = {}
        for inst_code, inst_obj in inst_map.items():
            for pcode, pname, pdisc, pdur in programs_spec:
                prog = Program(
                    institution_id=inst_obj.id,
                    program_code=pcode,
                    program_name=pname,
                    discipline=pdisc,
                    duration_years=pdur,
                    approval_status="APPROVED"
                )
                db.add(prog)
                db.commit()
                db.refresh(prog)
                prog_map[(inst_code, pcode)] = prog

        # 4. Program Intakes
        # EIT CSE has approved intake of 180 regular seats
        eit_cse_prog = prog_map[("EIT-2026-WB", "CSE-BTECH")]
        intake_eit_cse = ProgramIntake(
            institution_id=eit.id,
            program_id=eit_cse_prog.id,
            academic_year_id=ay_curr.id,
            approved_regular_intake=180,
            applicable_supernumerary_limits=20,
            policy_version="AICTE-APH-2026-27-REG4"
        )
        db.add(intake_eit_cse)

        # Other programs intake
        for inst_code, inst_obj in inst_map.items():
            for pcode, _, _, _ in programs_spec:
                if inst_code == "EIT-2026-WB" and pcode == "CSE-BTECH":
                    continue
                approved = 120 if "CSE" in pcode else (60 if "ECE" in pcode else 40)
                intake = ProgramIntake(
                    institution_id=inst_obj.id,
                    program_id=prog_map[(inst_code, pcode)].id,
                    academic_year_id=ay_curr.id,
                    approved_regular_intake=approved,
                    applicable_supernumerary_limits=10,
                    policy_version="AICTE-APH-2026-27-REG4"
                )
                db.add(intake)
        db.commit()

        # 5. Preconfigured Demo Users
        users = [
            User(
                email="admin@aicte.gov.in",
                full_name="Dr. Rajesh Sharma (AICTE Regulatory Director)",
                role="AICTE_ADMIN",
                institution_id=None
            ),
            User(
                email="admin@eit.edu.in",
                full_name="Prof. S. K. Mukherjee (Principal, Eastern Institute of Technology)",
                role="INSTITUTION_ADMIN",
                institution_id=eit.id
            ),
            User(
                email="admin@aiet.edu.in",
                full_name="Dr. Ananya Deshmukh (Dean of Admissions, Apex Institute)",
                role="INSTITUTION_ADMIN",
                institution_id=aiet.id
            ),
            User(
                email="student@eit.edu.in",
                full_name="Aarav Banerjee (B.Tech CSE, 2026)",
                role="STUDENT",
                institution_id=eit.id
            ),
            User(
                email="verifier@tcs.com",
                full_name="Vikram Malhotra (Lead Background Verifier, TCS)",
                role="AUTHORIZED_VERIFIER",
                institution_id=None
            )
        ]
        db.add_all(users)
        db.commit()

        # 6. FEATURED DEMO SCENARIO:
        # Eastern Institute of Technology CSE 2026-27
        # Approved intake: 180
        # Submitted regular enrolment: 186 (+6 excess)
        # Plus 5 supernumerary seats (TFW / EWS) which are compliant
        print("[*] Seeding featured 186-student regular intake scenario for Eastern Institute...")

        # Create batch submission record for EIT
        eit_sub = DataSubmission(
            institution_id=eit.id,
            academic_year_id=ay_curr.id,
            file_name="eit_admissions_cse_2026_cohort.csv",
            file_hash="e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
            submitted_by="admin@eit.edu.in",
            status="SUBMITTED",
            total_rows=191,
            valid_rows=191,
            invalid_rows=0,
            duplicate_candidates=0,
            created_at=datetime.utcnow() - timedelta(days=2),
            completed_at=datetime.utcnow() - timedelta(days=2)
        )
        db.add(eit_sub)
        db.commit()
        db.refresh(eit_sub)

        # 186 Regular students + 5 Supernumerary students
        student_names = [
            "Aarav Banerjee", "Aditi Rao", "Rohan Verma", "Sneha Roy", "Vikram Sen",
            "Ananya Gupta", "Priya Nair", "Rahul Sharma", "Kavya Patel", "Arjun Reddy",
            "Isha Kapoor", "Manish Paul", "Pooja Bose", "Devendra Jha", "Shreya Das",
            "Kunal Ghosh", "Ritika Mehta", "Tanmay Joshi", "Siddharth Dey", "Meera Pillai"
        ]

        seeded_credentials = []

        for i in range(1, 187): # 1 to 186
            name_idx = (i - 1) % len(student_names)
            s_name = f"{student_names[name_idx]} #{i}" if i > len(student_names) else student_names[name_idx]
            apaar_num = f"9823{i:08d}"
            apaar_hash = crypto_service.generate_apaar_hash(apaar_num)
            stud_id = f"EIT-CSE-26-{i:03d}"

            identity = StudentIdentity(
                apaar_id=apaar_num,
                apaar_hash=apaar_hash,
                full_name=s_name,
                dob="2005-04-15",
                gender="Male" if i % 2 == 1 else "Female"
            )
            db.add(identity)
            db.commit()
            db.refresh(identity)

            admission = AdmissionRecord(
                student_identity_id=identity.id,
                institution_id=eit.id,
                program_id=eit_cse_prog.id,
                academic_year_id=ay_curr.id,
                institutional_student_id=stud_id,
                admission_date="2026-08-10",
                admission_category="REGULAR",
                is_supernumerary=False,
                supernumerary_category=None,
                enrolment_status="ACTIVE",
                record_status="VALIDATED",
                external_verification_status="PENDING_EXTERNAL_VERIFICATION" if i > 5 else "EXTERNALLY_VERIFIED",
                source_batch_id=eit_sub.id
            )
            db.add(admission)
            db.commit()
            db.refresh(admission)

            # Generate signed credential record
            cred_ref = f"VRF-2026-EIT{i:03d}"
            payload = {
                "credential_reference": cred_ref,
                "institution_code": eit.institution_code,
                "institutional_student_id": admission.institutional_student_id,
                "program_code": eit_cse_prog.program_code,
                "academic_year": ay_curr.label,
                "admission_date": admission.admission_date,
                "is_supernumerary": False,
                "enrolment_status": "ACTIVE",
                "issued_at": datetime.utcnow().isoformat()
            }
            signature = crypto_service.sign_canonical_payload(payload)

            cred = CredentialRecord(
                admission_record_id=admission.id,
                issuer_institution_id=eit.id,
                credential_reference=cred_ref,
                canonical_payload=payload,
                digital_signature=signature,
                integrity_status="VALID"
            )
            db.add(cred)
            if i <= 5:
                seeded_credentials.append((cred_ref, admission.id))

        # 5 Supernumerary students (TFW & EWS)
        for j in range(1, 6):
            apaar_num = f"9824{j:08d}"
            apaar_hash = crypto_service.generate_apaar_hash(apaar_num)
            stud_id = f"EIT-CSE-26-SUP-{j:02d}"

            identity = StudentIdentity(
                apaar_id=apaar_num,
                apaar_hash=apaar_hash,
                full_name=f"Supernumerary Scholar #{j}",
                dob="2005-06-20",
                gender="Female" if j % 2 == 0 else "Male"
            )
            db.add(identity)
            db.commit()
            db.refresh(identity)

            admission = AdmissionRecord(
                student_identity_id=identity.id,
                institution_id=eit.id,
                program_id=eit_cse_prog.id,
                academic_year_id=ay_curr.id,
                institutional_student_id=stud_id,
                admission_date="2026-08-12",
                admission_category="SUPERNUMERARY",
                is_supernumerary=True,
                supernumerary_category="TFW" if j <= 3 else "EWS",
                enrolment_status="ACTIVE",
                record_status="VALIDATED",
                external_verification_status="EXTERNALLY_VERIFIED",
                source_batch_id=eit_sub.id
            )
            db.add(admission)

        db.commit()

        # 7. Seed Cross-Institution Conflict Candidate
        # Student APAAR 912345678901 enrolled at Apex Institute AND also submitted at Deccan College
        print("[*] Seeding cross-institution conflict scenario...")
        cross_apaar = "912345678901"
        cross_hash = crypto_service.generate_apaar_hash(cross_apaar)

        ident_cross = StudentIdentity(
            apaar_id=cross_apaar,
            apaar_hash=cross_hash,
            full_name="Rajeshwar Kulkarni",
            dob="2004-11-12",
            gender="Male"
        )
        db.add(ident_cross)
        db.commit()
        db.refresh(ident_cross)

        # Active admission at Apex Institute
        adm_aiet = AdmissionRecord(
            student_identity_id=ident_cross.id,
            institution_id=aiet.id,
            program_id=prog_map[("AIET-1001-MH", "CSE-BTECH")].id,
            academic_year_id=ay_curr.id,
            institutional_student_id="AIET-CSE-26-042",
            admission_date="2026-08-01",
            admission_category="REGULAR",
            is_supernumerary=False,
            enrolment_status="ACTIVE",
            record_status="VALIDATED",
            external_verification_status="EXTERNALLY_VERIFIED"
        )
        db.add(adm_aiet)

        # Conflicting active admission at Deccan College
        dce = inst_map["DCE-3003-KA"]
        adm_dce = AdmissionRecord(
            student_identity_id=ident_cross.id,
            institution_id=dce.id,
            program_id=prog_map[("DCE-3003-KA", "CSE-BTECH")].id,
            academic_year_id=ay_curr.id,
            institutional_student_id="DCE-CSE-26-088",
            admission_date="2026-08-05",
            admission_category="REGULAR",
            is_supernumerary=False,
            enrolment_status="ACTIVE",
            record_status="FLAGGED_FOR_REVIEW",
            external_verification_status="PENDING_EXTERNAL_VERIFICATION"
        )
        db.add(adm_dce)
        db.commit()

        # 8. Trigger Compliance Case for Eastern Institute Intake Violation (180 approved vs 186 regular)
        compliance_engine.sync_intake_compliance_case(
            db, eit.id, eit_cse_prog.id, ay_curr.id, actor_id="AICTE_INTAKE_ENGINE"
        )

        # Also create a cross-institution conflict compliance case
        case_cross = ComplianceCase(
            institution_id=aiet.id,
            program_id=prog_map[("AIET-1001-MH", "CSE-BTECH")].id,
            academic_year_id=ay_curr.id,
            case_type="CROSS_INSTITUTION_CONFLICT",
            priority="CRITICAL",
            status="OPEN",
            evidence_json={
                "student_name": "Rajeshwar Kulkarni",
                "masked_apaar": crypto_service.mask_apaar(cross_apaar),
                "institution_a": "Apex Institute of Engineering & Technology",
                "roll_a": "AIET-CSE-26-042",
                "institution_b": "Deccan College of Engineering",
                "roll_b": "DCE-CSE-26-088",
                "finding": "Identical APAAR ID actively enrolled simultaneously across two distinct AICTE institutions."
            }
        )
        db.add(case_cross)
        db.commit()

        # 9. Verification requests for seeded credentials
        for ref, adm_id in seeded_credentials:
            vr = VerificationRequest(
                reference=ref,
                admission_record_id=adm_id,
                requester_type="EMPLOYER",
                requester_id="TCS Verification Team",
                purpose="Pre-employment Background Check",
                authorization_status="AUTHORIZED",
                result_status="VERIFIED"
            )
            db.add(vr)
        db.commit()

        # 10. Audit Events
        audit_service.log_event(
            db=db,
            actor_id="admin@eit.edu.in",
            actor_role="INSTITUTION_ADMIN",
            action="BATCH_SUBMISSION",
            resource_type="SUBMISSION",
            resource_id=eit_sub.id,
            outcome="SUCCESS",
            metadata={"file_name": eit_sub.file_name, "total_records": 191},
            institution_id=eit.id
        )
        audit_service.log_event(
            db=db,
            actor_id="AICTE_REGULATORY_BOT",
            actor_role="SYSTEM",
            action="COMPLIANCE_CASE_OPENED",
            resource_type="COMPLIANCE_CASE",
            resource_id="CASE-EIT-CSE-2026",
            outcome="FLAGGED",
            metadata={"excess_regular_admissions": 6, "program": "B.Tech CSE"},
            institution_id=eit.id
        )

        print("[SUCCESS] Seed script completed successfully!")
        print("  - Institutions: 8")
        print("  - Students created: 193+")
        print("  - Featured 180 vs 186 case: Active on Eastern Institute of Technology")
        print("  - Preconfigured demo accounts ready.")

    except Exception as e:
        db.rollback()
        print(f"[ERROR] Error during seed: {str(e)}")
        raise e
    finally:
        db.close()

if __name__ == "__main__":
    seed_database()
