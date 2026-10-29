from sqlalchemy import (
    Column, Integer, String, Boolean, DateTime, ForeignKey, Text, Float, JSON, UniqueConstraint, Index
)
from sqlalchemy.orm import relationship
from datetime import datetime
import uuid
from app.database import Base

def generate_uuid():
    return str(uuid.uuid4())

class User(Base):
    __tablename__ = "users"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    email = Column(String(255), unique=True, nullable=False, index=True)
    full_name = Column(String(255), nullable=False)
    role = Column(String(50), nullable=False)  # AICTE_ADMIN, INSTITUTION_ADMIN, STUDENT, AUTHORIZED_VERIFIER
    institution_id = Column(String(36), ForeignKey("institutions.id", ondelete="SET NULL"), nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    institution = relationship("Institution", back_populates="users")

class Institution(Base):
    __tablename__ = "institutions"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    institution_code = Column(String(50), unique=True, nullable=False, index=True)
    name = Column(String(255), nullable=False)
    institution_type = Column(String(100), default="Engineering & Technology")
    state = Column(String(100), nullable=False)
    district = Column(String(100), nullable=False)
    approval_status = Column(String(50), default="APPROVED")  # APPROVED, UNDER_REVIEW, SUSPENDED
    contact_email = Column(String(255), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    programs = relationship("Program", back_populates="institution", cascade="all, delete-orphan")
    intakes = relationship("ProgramIntake", back_populates="institution", cascade="all, delete-orphan")
    admissions = relationship("AdmissionRecord", back_populates="institution")
    submissions = relationship("DataSubmission", back_populates="institution")
    compliance_cases = relationship("ComplianceCase", back_populates="institution")
    users = relationship("User", back_populates="institution")

class AcademicYear(Base):
    __tablename__ = "academic_years"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    label = Column(String(20), unique=True, nullable=False)  # e.g., "2026-27"
    start_date = Column(DateTime, nullable=False)
    end_date = Column(DateTime, nullable=False)
    status = Column(String(20), default="ACTIVE")  # ACTIVE, PAST, UPCOMING

    intakes = relationship("ProgramIntake", back_populates="academic_year")
    admissions = relationship("AdmissionRecord", back_populates="academic_year")
    submissions = relationship("DataSubmission", back_populates="academic_year")

class Program(Base):
    __tablename__ = "programs"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    institution_id = Column(String(36), ForeignKey("institutions.id", ondelete="CASCADE"), nullable=False)
    program_code = Column(String(50), nullable=False)
    program_name = Column(String(255), nullable=False)
    discipline = Column(String(100), nullable=False)  # Computer Science, Mechanical, Electronics, Management
    duration_years = Column(Integer, default=4)
    approval_status = Column(String(50), default="APPROVED")

    __table_args__ = (
        UniqueConstraint('institution_id', 'program_code', name='uix_institution_program_code'),
    )

    institution = relationship("Institution", back_populates="programs")
    intakes = relationship("ProgramIntake", back_populates="program", cascade="all, delete-orphan")
    admissions = relationship("AdmissionRecord", back_populates="program")

class ProgramIntake(Base):
    __tablename__ = "program_intakes"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    institution_id = Column(String(36), ForeignKey("institutions.id", ondelete="CASCADE"), nullable=False)
    program_id = Column(String(36), ForeignKey("programs.id", ondelete="CASCADE"), nullable=False)
    academic_year_id = Column(String(36), ForeignKey("academic_years.id", ondelete="CASCADE"), nullable=False)
    approved_regular_intake = Column(Integer, nullable=False)
    applicable_supernumerary_limits = Column(Integer, default=20) # Max permitted supernumerary seats (e.g. 10% TFW, etc.)
    policy_version = Column(String(50), default="AICTE-APH-2026-27-V1")
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    __table_args__ = (
        UniqueConstraint('institution_id', 'program_id', 'academic_year_id', name='uix_intake_inst_prog_year'),
    )

    institution = relationship("Institution", back_populates="intakes")
    program = relationship("Program", back_populates="intakes")
    academic_year = relationship("AcademicYear", back_populates="intakes")

class StudentIdentity(Base):
    __tablename__ = "student_identities"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    apaar_id = Column(String(20), nullable=False)  # 12-digit format or synthetic masked ID
    apaar_hash = Column(String(64), nullable=False, index=True)  # Keyed HMAC for indexed lookups without exposing raw ID
    full_name = Column(String(255), nullable=False)
    dob = Column(String(20), nullable=True)
    gender = Column(String(20), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    admissions = relationship("AdmissionRecord", back_populates="student_identity")

class AdmissionRecord(Base):
    __tablename__ = "admission_records"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    student_identity_id = Column(String(36), ForeignKey("student_identities.id", ondelete="CASCADE"), nullable=False)
    institution_id = Column(String(36), ForeignKey("institutions.id", ondelete="CASCADE"), nullable=False)
    program_id = Column(String(36), ForeignKey("programs.id", ondelete="CASCADE"), nullable=False)
    academic_year_id = Column(String(36), ForeignKey("academic_years.id", ondelete="CASCADE"), nullable=False)
    institutional_student_id = Column(String(100), nullable=False)
    admission_date = Column(String(20), nullable=False)
    admission_category = Column(String(50), default="REGULAR")  # REGULAR, MANAGEMENT, MERIT, NRI, OCI, FN
    is_supernumerary = Column(Boolean, default=False)
    supernumerary_category = Column(String(50), nullable=True) # TFW, EWS, J&K_MIGRANT, SPORTS, GOV_NOMINEE
    enrolment_status = Column(String(50), default="ACTIVE")  # ACTIVE, TRANSFERRED, COMPLETED, WITHDRAWN
    record_status = Column(String(50), default="VALIDATED")  # DRAFT, SUBMITTED, VALIDATION_PENDING, VALIDATED, VERIFIED, FLAGGED_FOR_REVIEW, CORRECTION_REQUIRED
    external_verification_status = Column(String(50), default="PENDING_EXTERNAL_VERIFICATION") # FORMAT_VALIDATED, PENDING_EXTERNAL_VERIFICATION, EXTERNALLY_VERIFIED, EXTERNAL_VERIFICATION_FAILED
    source_batch_id = Column(String(36), ForeignKey("data_submissions.id", ondelete="SET NULL"), nullable=True)
    version = Column(Integer, default=1)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    __table_args__ = (
        Index('idx_admission_inst_year_prog', 'institution_id', 'academic_year_id', 'program_id'),
    )

    student_identity = relationship("StudentIdentity", back_populates="admissions")
    institution = relationship("Institution", back_populates="admissions")
    program = relationship("Program", back_populates="admissions")
    academic_year = relationship("AcademicYear", back_populates="admissions")
    submission = relationship("DataSubmission", back_populates="admissions")
    credentials = relationship("CredentialRecord", back_populates="admission", cascade="all, delete-orphan")
    verification_requests = relationship("VerificationRequest", back_populates="admission")

class DataSubmission(Base):
    __tablename__ = "data_submissions"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    institution_id = Column(String(36), ForeignKey("institutions.id", ondelete="CASCADE"), nullable=False)
    academic_year_id = Column(String(36), ForeignKey("academic_years.id", ondelete="CASCADE"), nullable=False)
    file_name = Column(String(255), nullable=False)
    file_hash = Column(String(64), nullable=False)
    submitted_by = Column(String(255), nullable=False)
    status = Column(String(50), default="VALIDATING") # DRAFT, VALIDATING, VALIDATED_WITH_ERRORS, SUBMITTED, APPROVED
    total_rows = Column(Integer, default=0)
    valid_rows = Column(Integer, default=0)
    invalid_rows = Column(Integer, default=0)
    duplicate_candidates = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)
    completed_at = Column(DateTime, nullable=True)

    institution = relationship("Institution", back_populates="submissions")
    academic_year = relationship("AcademicYear", back_populates="submissions")
    admissions = relationship("AdmissionRecord", back_populates="submission")
    findings = relationship("ValidationFinding", back_populates="submission", cascade="all, delete-orphan")

class ValidationFinding(Base):
    __tablename__ = "validation_findings"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    submission_id = Column(String(36), ForeignKey("data_submissions.id", ondelete="CASCADE"), nullable=False)
    admission_record_id = Column(String(36), nullable=True)
    row_number = Column(Integer, nullable=True)
    rule_code = Column(String(50), nullable=False) # RULE_MISSING_APAAR, RULE_MALFORMED_APAAR, RULE_BATCH_DUPLICATE, RULE_CROSS_INSTITUTION_CONFLICT, RULE_INTAKE_EXCEEDED
    severity = Column(String(20), default="HIGH") # CRITICAL, HIGH, MEDIUM, LOW, INFO
    finding_type = Column(String(100), nullable=False)
    message = Column(Text, nullable=False)
    evidence_json = Column(JSON, nullable=True)
    resolution_status = Column(String(30), default="OPEN") # OPEN, RESOLVED, IGNORED, ESCALATED
    resolved_by = Column(String(255), nullable=True)
    resolved_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    submission = relationship("DataSubmission", back_populates="findings")

class ComplianceCase(Base):
    __tablename__ = "compliance_cases"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    institution_id = Column(String(36), ForeignKey("institutions.id", ondelete="CASCADE"), nullable=False)
    program_id = Column(String(36), ForeignKey("programs.id", ondelete="CASCADE"), nullable=False)
    academic_year_id = Column(String(36), ForeignKey("academic_years.id", ondelete="CASCADE"), nullable=False)
    case_type = Column(String(50), default="INTAKE_VIOLATION") # INTAKE_VIOLATION, CROSS_INSTITUTION_CONFLICT, REPEATED_ANOMALY
    priority = Column(String(20), default="HIGH") # CRITICAL, HIGH, MEDIUM, LOW
    status = Column(String(30), default="OPEN") # OPEN, UNDER_REVIEW, ACTION_REQUIRED, RESOLVED, REJECTED
    evidence_json = Column(JSON, nullable=True) # { approved_intake: 180, actual_enrolment: 186, excess: 6, ... }
    assigned_to = Column(String(255), nullable=True)
    decision = Column(String(50), nullable=True) # APPROVE_EXEMPTION, ISSUE_WARNING, PENALTY_IMPOSED, ADMISSION_INVALIDATED, DISMISSED
    decision_reason = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    resolved_at = Column(DateTime, nullable=True)

    institution = relationship("Institution", back_populates="compliance_cases")
    program = relationship("Program")
    academic_year = relationship("AcademicYear")

class VerificationRequest(Base):
    __tablename__ = "verification_requests"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    reference = Column(String(64), nullable=False, index=True) # e.g. "VRF-2026-X9K27M"
    admission_record_id = Column(String(36), ForeignKey("admission_records.id", ondelete="CASCADE"), nullable=False)
    requester_type = Column(String(50), default="EMPLOYER") # EMPLOYER, HIGHER_ED, GOVERNMENT, PUBLIC
    requester_id = Column(String(255), nullable=True)
    purpose = Column(String(255), default="Employment Verification")
    authorization_status = Column(String(30), default="AUTHORIZED")
    result_status = Column(String(50), default="VERIFIED") # VERIFIED, VALID_RECORD_EXTERNAL_IDENTITY_PENDING, NOT_FOUND, REVOKED
    created_at = Column(DateTime, default=datetime.utcnow)
    expires_at = Column(DateTime, nullable=True)

    admission = relationship("AdmissionRecord", back_populates="verification_requests")

class CredentialRecord(Base):
    __tablename__ = "credential_records"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    admission_record_id = Column(String(36), ForeignKey("admission_records.id", ondelete="CASCADE"), nullable=False)
    issuer_institution_id = Column(String(36), nullable=False)
    credential_type = Column(String(50), default="ACADEMIC_ENROLMENT_CREDENTIAL")
    credential_reference = Column(String(64), unique=True, nullable=False, index=True)
    digital_signature = Column(Text, nullable=False)
    canonical_payload = Column(JSON, nullable=False)
    integrity_status = Column(String(30), default="VALID") # VALID, TAMPERED, REVOKED
    key_id = Column(String(50), default="AICTE-PROD-2026-KEY-1")
    issued_at = Column(DateTime, default=datetime.utcnow)
    revoked_at = Column(DateTime, nullable=True)

    admission = relationship("AdmissionRecord", back_populates="credentials")

class AuditEvent(Base):
    __tablename__ = "audit_events"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    actor_id = Column(String(255), nullable=False)
    actor_role = Column(String(50), nullable=False)
    institution_id = Column(String(36), nullable=True)
    action = Column(String(100), nullable=False) # RECORD_SUBMIT, COMPLIANCE_DECISION, CREDENTIAL_VERIFY, BATCH_VALIDATE, etc.
    resource_type = Column(String(50), nullable=False) # ADMISSION, SUBMISSION, COMPLIANCE_CASE, CREDENTIAL
    resource_id = Column(String(255), nullable=False)
    timestamp = Column(DateTime, default=datetime.utcnow, index=True)
    outcome = Column(String(20), default="SUCCESS") # SUCCESS, FAILURE, FLAGGED
    sanitized_metadata = Column(JSON, nullable=True)
