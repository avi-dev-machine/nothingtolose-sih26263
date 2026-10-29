import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.database import SessionLocal
from app.models import (
    Institution, Program, ProgramIntake, AcademicYear,
    AdmissionRecord, StudentIdentity, ComplianceCase, CredentialRecord
)
from app.services.crypto_service import crypto_service
from app.services.compliance_engine import compliance_engine
from app.services.validation_engine import validation_engine

client = TestClient(app)

def test_health_check():
    response = client.get("/api/health")
    assert response.status_code == 200
    assert response.json()["status"] == "healthy"

def test_demo_login_aicte_admin():
    response = client.post("/api/v1/auth/demo-login", json={"role": "AICTE_ADMIN"})
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["role"] == "AICTE_ADMIN"

def test_demo_login_institution_admin():
    response = client.post("/api/v1/auth/demo-login", json={"role": "INSTITUTION_ADMIN"})
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["role"] == "INSTITUTION_ADMIN"
    assert data["institution_id"] is not None

def test_format_validation_engine():
    # Valid 12-digit APAAR
    valid_res = validation_engine.validate_row_format({
        "apaar_id": "982300010001",
        "institutional_student_id": "TEST-01",
        "program_code": "CSE-BTECH"
    }, 1)
    assert len(valid_res) == 0

    # Missing APAAR
    missing_res = validation_engine.validate_row_format({
        "apaar_id": "",
        "institutional_student_id": "TEST-02",
        "program_code": "CSE-BTECH"
    }, 2)
    assert any(f["rule_code"] == "RULE_MISSING_REQUIRED_FIELD" for f in missing_res)

    # Malformed APAAR (only 7 digits)
    malformed_res = validation_engine.validate_row_format({
        "apaar_id": "1234567",
        "institutional_student_id": "TEST-03",
        "program_code": "CSE-BTECH"
    }, 3)
    assert any(f["rule_code"] == "RULE_MALFORMED_APAAR" for f in malformed_res)

def test_intake_compliance_calculation():
    db = SessionLocal()
    try:
        eit = db.query(Institution).filter(Institution.institution_code == "EIT-2026-WB").first()
        assert eit is not None
        cse = db.query(Program).filter(Program.institution_id == eit.id, Program.program_code == "CSE-BTECH").first()
        assert cse is not None
        ay = db.query(AcademicYear).filter(AcademicYear.status == "ACTIVE").first()
        assert ay is not None

        metrics = compliance_engine.calculate_program_intake(db, eit.id, cse.id, ay.id)
        assert metrics["approved_regular_intake"] == 180
        assert metrics["actual_regular_enrolment"] == 186
        assert metrics["excess"] == 6
        assert metrics["utilization_percentage"] == 103.33
        assert metrics["status"] == "EXCEEDED"
        # Supernumerary seats verified separate
        assert metrics["actual_supernumerary_enrolment"] == 5
    finally:
        db.close()

def test_digital_signature_and_tamper_detection():
    payload = {
        "credential_reference": "VRF-TEST-001",
        "student_id": "TEST-ROLL-123",
        "institution": "Eastern Institute of Technology",
        "program": "B.Tech Computer Science"
    }
    signature = crypto_service.sign_canonical_payload(payload)
    is_valid, msg = crypto_service.verify_payload_integrity(payload, signature)
    assert is_valid is True

    # Tamper payload
    tampered = dict(payload)
    tampered["student_id"] = "TAMPERED-ROLL-999"
    tampered_valid, tampered_msg = crypto_service.verify_payload_integrity(tampered, signature)
    assert tampered_valid is False
    assert "tampered" in tampered_msg.lower() or "mismatch" in tampered_msg.lower()

def test_public_verification_endpoint():
    # Call seeded credential
    response = client.get("/api/v1/verification/records/VRF-2026-EIT001")
    assert response.status_code == 200
    data = response.json()
    assert data["reference"] == "VRF-2026-EIT001"
    assert data["issuer_name"] == "Eastern Institute of Technology"
    assert data["integrity_status"] == "VALID"
    assert "digital_signature" in data

def test_compliance_decision_workflow():
    # Login as AICTE Admin
    login_res = client.post("/api/v1/auth/demo-login", json={"role": "AICTE_ADMIN"})
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # Get cases
    cases_res = client.get("/api/v1/compliance/cases", headers=headers)
    assert cases_res.status_code == 200
    cases = cases_res.json()
    assert len(cases) > 0

    first_case = cases[0]
    case_id = first_case["id"]

    # Assign case
    assign_res = client.post(
        f"/api/v1/compliance/cases/{case_id}/assign",
        json={"assigned_to": "AICTE Inquiry Officer K. Singhania"},
        headers=headers
    )
    assert assign_res.status_code == 200

    # Record decision
    dec_res = client.post(
        f"/api/v1/compliance/cases/{case_id}/decision",
        json={
            "decision": "ISSUE_WARNING",
            "decision_reason": "Excess admissions permitted conditionally subject to regularizing supernumerary quotas and submitting formal explanation."
        },
        headers=headers
    )
    assert dec_res.status_code == 200
    assert dec_res.json()["status"] == "RESOLVED"
