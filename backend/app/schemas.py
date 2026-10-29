from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime

# --- Auth Schemas ---
class DemoLoginRequest(BaseModel):
    role: str # AICTE_ADMIN, INSTITUTION_ADMIN, STUDENT, AUTHORIZED_VERIFIER
    email: Optional[str] = None
    institution_id: Optional[str] = None

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    role: str
    email: str
    full_name: str
    institution_id: Optional[str] = None
    institution_name: Optional[str] = None

class UserResponse(BaseModel):
    id: str
    email: str
    full_name: str
    role: str
    institution_id: Optional[str] = None
    institution_name: Optional[str] = None

# --- Institution Schemas ---
class InstitutionResponse(BaseModel):
    id: str
    institution_code: str
    name: str
    institution_type: str
    state: str
    district: str
    approval_status: str
    contact_email: str
    created_at: datetime
    programs_count: Optional[int] = 0
    total_enrolment: Optional[int] = 0
    compliance_cases_count: Optional[int] = 0

    class Config:
        from_attributes = True

class InstitutionUpdate(BaseModel):
    name: Optional[str] = None
    approval_status: Optional[str] = None
    contact_email: Optional[str] = None

# --- Program & Intake Schemas ---
class ProgramResponse(BaseModel):
    id: str
    institution_id: str
    program_code: str
    program_name: str
    discipline: str
    duration_years: int
    approval_status: str

    class Config:
        from_attributes = True

class ProgramIntakeResponse(BaseModel):
    id: str
    institution_id: str
    institution_name: Optional[str] = None
    program_id: str
    program_name: Optional[str] = None
    program_code: Optional[str] = None
    academic_year_id: str
    academic_year_label: Optional[str] = None
    approved_regular_intake: int
    applicable_supernumerary_limits: int
    actual_regular_enrolment: Optional[int] = 0
    actual_supernumerary_enrolment: Optional[int] = 0
    utilization_percentage: Optional[float] = 0.0
    excess: Optional[int] = 0
    status: Optional[str] = "COMPLIANT" # COMPLIANT, EXCEEDED, NEAR_CAPACITY

    class Config:
        from_attributes = True

# --- Student Schemas ---
class StudentCreate(BaseModel):
    apaar_id: str
    full_name: str
    institutional_student_id: str
    program_id: str
    academic_year_id: str
    admission_date: str
    admission_category: str = "REGULAR"
    is_supernumerary: bool = False
    supernumerary_category: Optional[str] = None
    dob: Optional[str] = None
    gender: Optional[str] = None

class StudentUpdate(BaseModel):
    full_name: Optional[str] = None
    apaar_id: Optional[str] = None
    institutional_student_id: Optional[str] = None
    admission_category: Optional[str] = None
    is_supernumerary: Optional[bool] = None
    supernumerary_category: Optional[str] = None
    enrolment_status: Optional[str] = None
    record_status: Optional[str] = None

class StudentResponse(BaseModel):
    id: str
    institutional_student_id: str
    masked_apaar_id: str
    full_name: str
    institution_id: str
    institution_name: Optional[str] = None
    program_id: str
    program_name: Optional[str] = None
    program_code: Optional[str] = None
    academic_year_id: str
    academic_year_label: Optional[str] = None
    admission_date: str
    admission_category: str
    is_supernumerary: bool
    supernumerary_category: Optional[str] = None
    enrolment_status: str
    record_status: str
    external_verification_status: str
    credential_reference: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class StudentDetailResponse(StudentResponse):
    raw_apaar_id: Optional[str] = None # Visible only to authorized roles with permission
    dob: Optional[str] = None
    gender: Optional[str] = None
    submission_id: Optional[str] = None
    version: int = 1
    findings: List[Dict[str, Any]] = []
    audit_history: List[Dict[str, Any]] = []

# --- Submission & Validation Schemas ---
class ValidationFindingResponse(BaseModel):
    id: str
    submission_id: str
    admission_record_id: Optional[str] = None
    row_number: Optional[int] = None
    rule_code: str
    severity: str
    finding_type: str
    message: str
    evidence_json: Optional[Dict[str, Any]] = None
    resolution_status: str
    resolved_by: Optional[str] = None
    resolved_at: Optional[datetime] = None
    created_at: datetime

    class Config:
        from_attributes = True

class SubmissionResponse(BaseModel):
    id: str
    institution_id: str
    institution_name: Optional[str] = None
    academic_year_id: str
    academic_year_label: Optional[str] = None
    file_name: str
    file_hash: str
    submitted_by: str
    status: str
    total_rows: int
    valid_rows: int
    invalid_rows: int
    duplicate_candidates: int
    created_at: datetime
    completed_at: Optional[datetime] = None
    findings: Optional[List[ValidationFindingResponse]] = []

    class Config:
        from_attributes = True

# --- Compliance Schemas ---
class ComplianceCaseResponse(BaseModel):
    id: str
    institution_id: str
    institution_name: Optional[str] = None
    institution_code: Optional[str] = None
    program_id: str
    program_name: Optional[str] = None
    program_code: Optional[str] = None
    academic_year_id: str
    academic_year_label: Optional[str] = None
    case_type: str
    priority: str
    status: str
    evidence_json: Optional[Dict[str, Any]] = None
    assigned_to: Optional[str] = None
    decision: Optional[str] = None
    decision_reason: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    resolved_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class ComplianceAssignRequest(BaseModel):
    assigned_to: str

class ComplianceDecisionRequest(BaseModel):
    decision: str # APPROVE_EXEMPTION, ISSUE_WARNING, PENALTY_IMPOSED, ADMISSION_INVALIDATED, DISMISSED
    decision_reason: str

# --- Verification Schemas ---
class VerificationLookupResponse(BaseModel):
    reference: str
    result_status: str
    issuer_name: str
    institution_code: str
    institutional_student_id: str
    student_name: str
    program_name: str
    discipline: str
    academic_year: str
    admission_date: str
    enrolment_status: str
    is_supernumerary: bool
    supernumerary_category: Optional[str] = None
    external_verification_status: str
    integrity_status: str
    digital_signature: str
    key_id: str
    verified_at: datetime
    explanation: str

class VerificationCreateRequest(BaseModel):
    admission_record_id: str
    requester_type: str = "EMPLOYER"
    purpose: str = "Employment Verification"

# --- Analytics Schemas ---
class OverviewAnalyticsResponse(BaseModel):
    total_institutions: int
    institutions_with_submissions: int
    total_records: int
    verified_records: int
    pending_records: int
    flagged_records: int
    open_compliance_cases: int
    programs_exceeding_intake: int
    avg_intake_utilization: float
    state_distribution: List[Dict[str, Any]]
    discipline_distribution: List[Dict[str, Any]]
    intake_vs_enrolment_by_program: List[Dict[str, Any]]
    recent_anomalies: List[Dict[str, Any]]

# --- Audit Schemas ---
class AuditEventResponse(BaseModel):
    id: str
    actor_id: str
    actor_role: str
    institution_id: Optional[str] = None
    action: str
    resource_type: str
    resource_id: str
    timestamp: datetime
    outcome: str
    sanitized_metadata: Optional[Dict[str, Any]] = None

    class Config:
        from_attributes = True
