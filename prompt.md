# AICTE APAAR-Based Student Data Management & Verification System

The strongest solution for this problem statement is not just a student database or an admission-upload portal. It should be a **national student-record verification and regulatory intelligence platform** that connects AICTE-approved institutions, students, and authorized verification stakeholders through a trusted academic identity.

For SIH 2026, I would build the solution around three things:

1. **Trust:** Every student record is linked to an APAAR ID, validated, traceable, and subject to appropriate authorization.
2. **Intelligence:** The system automatically detects duplicate records, suspicious enrolment patterns, intake violations, and inconsistencies across institutions.
3. **Governance:** AICTE gets a live view of admissions, approved intake, compliance, and student-record quality across institutions.

The following solution is designed to be demonstrable as a working product, with a functional frontend, backend APIs, realistic synthetic student data, and an end-to-end institutional-to-AICTE workflow.

# 1. Proposed Solution: APAARSetu

**Working name:** APAARSetu — National Academic Identity & Verification Platform

**Tagline:** One Academic Identity. Verified Records. Smarter Governance.

The name is a proposal for the hackathon, not an existing government platform.

## 1.1 The core idea

APAARSetu is a centralized student-record management and verification platform for AICTE-approved institutions.

Each participating institution submits its student-level admission records through a secure portal or API. The system validates the submitted data, checks the APAAR ID according to the configured verification process, compares enrolment against approved intake, and identifies potential duplicates and anomalies.

After validation, records enter a controlled verification workflow. Verified records become available to authorized users according to their roles and permissions.

AICTE administrators receive national, state, institutional, and program-level analytics. Institutions receive their own admission and compliance dashboards. Employers and other authorized stakeholders can verify permitted academic claims without gaining unrestricted access to a student's personal information.

### The complete workflow



**Institution → Data Upload → APAAR Validation → Duplicate & Anomaly Detection → Verification Workflow → Central Repository → AICTE Analytics → Authorized Record Verification**

The system should support both bulk uploads and real-time integration with institutional information systems.

An important distinction: **a syntactically valid APAAR ID is not necessarily an authentic, verified identity.** Actual identity validation requires an authorized verification service or integration. The prototype must clearly distinguish between simulated verification and verification confirmed by a real external authority.

---

# 2. Core Modules

## Module 1: Institution Management & Secure Onboarding

Every institution should have a dedicated workspace.

**Features**
- Institution registration and AICTE institution identifier.
- Institution verification and approval status.
- Approved programs, academic years, and sanctioned intake.
- Role-based access for principals, admission officers, data operators, and auditors.
- Institution-specific API credentials.
- Upload history, validation results, and submission acknowledgements.
- Admission correction and resubmission workflows.

**Example:** An institution offering CSE with an approved intake of 180 students submits 186 regular admissions. APAARSetu flags the excess and routes it for review instead of silently accepting the submission as compliant.

Supernumerary seats must be tracked separately according to the applicable rules. The system should not assume that every admission beyond the regular intake is automatically invalid.

## Module 2: Student Data Ingestion

Institutions should be able to submit records through three methods:

| Method | Purpose |
|---|---|
| CSV/Excel upload | Bulk admission submission |
| Institutional API | Automatic synchronization from existing ERP/SIS systems |
| Web form | Individual admission entry and correction |

The platform should support draft uploads, validation previews, error reports, resubmission, and a complete submission history.

### Student record schema

| Field | Purpose |
|---|---|
| APAAR ID | National academic identity identifier |
| Student ID | Institution-specific identifier |
| Institution ID | AICTE-recognized institution reference |
| Academic year | Admission cohort |
| Program and discipline | Course-level tracking |
| Admission date | Admission timeline |
| Approved intake | Sanctioned regular intake |
| Actual enrolment | Number of admitted students |
| Supernumerary category | Applicable additional-seat category |
| NRI status | Non-Resident Indian admission category |
| OCI status | Overseas Citizen of India classification |
| FN status | Foreign National classification |
| Admission category | Applicable admission classification |
| Record status | Draft, pending, verified, flagged, or rejected |
| Last updated | Record version timestamp |

Approved intake and actual enrolment are primarily **program-level or institution-program-year-level values**, rather than independent attributes of each student.

Therefore, the data model should store:
- A program intake record for the institution, program, and academic year.
- Individual admission records for students.
- Separate seat-allocation and admission-category records where required.

This avoids counting the same approved intake repeatedly against every student record.

Personal details such as names, dates of birth, and contact information should be collected only when necessary for the approved purpose.

## Module 3: APAAR Validation Engine

This is one of the most important parts of the solution.

The engine should validate each submission in stages:

**Stage A — Format validation**
- Check whether the APAAR ID is present.
- Validate its format against the official specification.
- Reject malformed identifiers.
- Identify missing mandatory fields.

**Stage B — Record validation**
- Detect repeated APAAR IDs within the same submission.
- Detect duplicate institutional student IDs.
- Identify conflicting academic-year or program information.
- Validate category-specific fields.
- Check whether the institution and program are registered.

**Stage C — Cross-institution checks**
- Find existing records with the same APAAR ID across institutions.
- Identify potentially overlapping admissions.
- Flag conflicting active enrolments for review.
- Distinguish legitimate transfers or re-admissions from suspicious duplicates.

**Stage D — Authoritative verification**

If an authorized APAAR verification service is available, request verification through its approved integration.

If it is not available, mark the record as `PENDING_EXTERNAL_VERIFICATION` or `FORMAT_VALIDATED`. Do not claim that the identity has been verified simply because the identifier passes a format check.

### Recommended record states

`DRAFT → SUBMITTED → VALIDATION_PENDING → VALIDATED → VERIFIED`

Alternative outcomes include:

- `FLAGGED_FOR_REVIEW`
- `REJECTED`
- `CORRECTION_REQUIRED`
- `PENDING_EXTERNAL_VERIFICATION`

The exact transition rules should be configurable.

## Module 4: Intelligent Anomaly Detection

A basic database can store student records. APAARSetu should help administrators identify issues that require attention.

| Detection rule | Example | System action |
|---|---|---|
| Duplicate APAAR ID | Same identifier submitted twice | Flag duplicate |
| Invalid identifier | Missing or malformed ID | Return validation error |
| Intake violation | Regular enrolment exceeds approved intake | Raise compliance alert |
| Cross-institution conflict | Same identifier appears in two active enrolments | Flag for review |
| Category inconsistency | Admission category conflicts with submitted fields | Request correction |
| Unusual submission pattern | Large, unexpected batch of corrections | Generate risk alert |
| Repeated failed submissions | Institution repeatedly submits invalid records | Escalate according to policy |

### Go beyond hardcoded validation

Use a layered detection approach:

1. **Deterministic rules:** Exact duplicates, missing fields, intake calculations, and invalid references.
2. **Statistical anomaly detection:** Unusual submission volumes, correction rates, and changes in enrolment patterns.
3. **Explainable risk scoring:** Prioritize records for human review using clearly documented factors.

For example:

> **High-priority enrolment anomaly**
>
> Institution: Demo Institute of Technology  
> Program: Computer Science and Engineering  
> Academic year: 2026–27  
> Approved regular intake: 180  
> Submitted regular enrolment: 186  
> Excess over approved intake: 6  
> Status: Requires regulatory review

The dashboard should explain why an alert was generated, show the underlying evidence, and provide actions to investigate or resolve it.

**Important:** A risk score must not automatically establish fraud, invalidate an APAAR ID, or reject a student's admission. Regulatory decisions should remain subject to authorized review and applicable rules.

## Module 5: AICTE Central Repository

The repository should maintain a consistent, auditable view of student records across participating institutions.

Core capabilities:
- Centralized student-record indexing.
- Institution, program, and academic-year relationships.
- Version history and correction tracking.
- Source institution and submission references.
- Verification status and evidence.
- Duplicate detection across the network.
- Search and controlled access.
- Record-level audit history.

The repository should not be a single unrestricted database of personal information. Apply data minimization, encryption, access controls, retention rules, and appropriate separation of duties.

## Module 6: Live Dashboards

### A. AICTE Administrator Dashboard

The AICTE dashboard should answer the questions regulators actually care about:

- How many institutions have submitted their student records?
- What proportion of submissions has been validated?
- How many records are awaiting verification?
- Which programs have enrolment exceeding their approved intake?
- Where are duplicate or conflicting records concentrated?
- Which institutions have unresolved compliance alerts?
- How has enrolment changed across academic years?

**Recommended dashboard components**
- Institution submission coverage.
- Student-record verification status.
- Approved intake versus regular enrolment.
- Supernumerary admissions by applicable category.
- State-wise and program-wise enrolment.
- Duplicate and anomaly alerts.
- Submission trends.
- Compliance review queue.

### B. Institution Dashboard

Institution administrators should see:
- Total submitted student records.
- Records accepted, flagged, or awaiting verification.
- Program-wise intake utilization.
- Missing or invalid APAAR IDs.
- Duplicate records requiring resolution.
- Upload history and error reports.
- Pending corrections.
- API synchronization status.

Institutions must not be able to browse other institutions' student-level records without explicit authorization.

### C. Student Record Verification Portal

An authorized verifier should be able to:
1. Enter a permitted verification reference or scan a verification QR code.
2. Authenticate or establish the required authorization.
3. Retrieve the minimum permitted information.
4. Review the verification result and its timestamp.
5. Confirm the issuer and the record's current status.

The system should avoid exposing a full APAAR ID through publicly accessible QR codes or verification URLs.

---

## Module 7: Verifiable Academic Records

The system should support generating a verifiable record or credential reference linked to the student's academic identity.

Each verification record should include:
- A unique record reference.
- Issuing institution.
- Student's institution-specific ID.
- Academic program and admission year.
- Record issuance and last-verification timestamps.
- Verification status.
- A cryptographic integrity proof or signed record, where implemented.
- A QR code that opens the authorized verification flow.

For the prototype, use digitally signed record payloads and a verification endpoint to demonstrate integrity checking. Do not represent a locally generated signature as an official government credential.

**Example verification results:**
- Verified against the configured authoritative source.
- Record integrity confirmed; external identity verification pending.
- Record not found.
- Record revoked or superseded.
- Verification requires additional authorization.

These results should be distinct. A valid digital signature proves that a record has not been altered since signing; it does not independently prove the authenticity of the student's identity or the accuracy of the original admission data.

## Module 8: Secure Stakeholder Access

The platform should implement four principal roles.

| Role | Permitted capabilities |
|---|---|
| AICTE Administrator | National analytics, institutional compliance, authorized record review |
| Institution Administrator | Manage institutional records, users, submissions, and corrections |
| Student | View own records and verification status, where supported |
| Authorized External Verifier | Verify permitted academic claims with appropriate authorization |

Additional roles, such as auditors and regulatory officers, can be introduced through configurable permissions.

Security requirements:
- Secure authentication and session management.
- Role-based and, where necessary, attribute-based access control.
- Institution-level data isolation.
- Encryption in transit and at rest.
- API authentication and rate limiting.
- Audit logs for sensitive actions.
- Consent or other applicable legal authorization for data access.
- Time-limited verification links or tokens.
- Configurable retention and deletion policies.
- Secure handling of secrets and signing keys.

Consent should not be treated as the only possible legal basis for every regulatory processing activity. The production design must follow the applicable legal framework and authorized data-sharing arrangements.

## Module 9: Reports & Policy Intelligence

Generate downloadable reports for:
- Institution-wise student enrolment.
- Approved intake versus actual regular enrolment.
- Supernumerary admissions.
- APAAR validation coverage.
- Duplicate-record investigations.
- Outstanding compliance alerts.
- State-wise and discipline-wise trends.
- Submission completeness and data quality.
- Historical comparisons by academic year.

Provide CSV and PDF exports with appropriate permission checks, timestamps, filters, and audit records.

## Module 10: Certificate Integration

Support displaying the APAAR ID alongside the institution's student ID on eligible certificates, as specified by the applicable policy.

The integration should:
- Accept certificate issuance events from authorized institutional systems.
- Retrieve the permitted identifier through a secure interface.
- Apply institution-configured certificate templates.
- Generate a QR code for record verification where appropriate.
- Maintain a record of certificate issuance and subsequent verification.

Do not assume every certificate can be modified or every APAAR ID can be printed without confirming the relevant policy and implementation requirements.

---

# 3. Recommended Technical Architecture

For the SIH prototype, I recommend a modular monolith with clear service boundaries rather than a large collection of microservices. This is faster to develop, easier to demonstrate, and can be decomposed into services as scale and operational needs become clearer.

| Layer | Recommended technology | Responsibility |
|---|---|---|
| Frontend | Next.js, React, TypeScript | Role-specific portals and dashboards |
| UI system | Tailwind CSS and a consistent component library | Enterprise-grade interface |
| Charts | Recharts | Enrolment analytics and compliance trends |
| Backend | FastAPI, Python | REST APIs and business logic |
| Data validation | Pydantic | Request and schema validation |
| Primary database | PostgreSQL | Institutions, admissions, programs, audit references |
| Data access | SQLAlchemy and Alembic | ORM and database migrations |
| Authentication | OAuth 2.0 / OpenID Connect integration or a secure prototype implementation | Identity and access management |
| File ingestion | Pandas and openpyxl | CSV and Excel processing |
| Duplicate detection | PostgreSQL constraints and indexed queries | Exact duplicate and cross-institution checks |
| Anomaly detection | Rule engine; optional scikit-learn | Explainable risk indicators |
| Credential integrity | Standard cryptographic signing library | Signed records and integrity verification |
| API documentation | FastAPI OpenAPI | Integration documentation |
| Deployment | Docker and environment-based configuration | Reproducible deployment |

For the demo, PostgreSQL can be run locally through Docker. If the team needs a faster cloud deployment, the same application can use a compatible managed PostgreSQL service.

### Suggested architecture

```text
                  INSTITUTIONAL SYSTEMS
                    /       |       \
              CSV/Excel   Web Form   REST API
                    \       |       /
                     DATA INGESTION
                           |
                    SCHEMA VALIDATION
                           |
                  APAAR VALIDATION LAYER
                  /         |          \
             Format     Duplicate     External
             Checks     Detection    Verification
                  \         |          /
                    RULE & ANOMALY ENGINE
                           |
                   REVIEW / APPROVAL FLOW
                           |
                  CENTRAL STUDENT REPOSITORY
                    /       |       \
                   /        |        \
             AICTE Portal  Institution  Verification
              & Analytics    Portal       Portal
                   \        |        /
                     AUDIT & REPORTING
```

External identity verification must be implemented through an authorized integration. Until that integration is available, the prototype should provide a clearly labeled simulation adapter rather than pretending to connect to an official service.

---

# 4. The Innovation That Makes This SIH Solution Stand Out

A polished dashboard is not enough. The differentiator should be the quality of the validation workflow and the usefulness of the information it provides to regulators.

I would emphasize these five innovations.

### 1. Cross-Institution Academic Identity Graph

Use APAAR ID as the principal academic identity key and maintain relationships among student records, institutions, programs, and academic years.

This enables the platform to identify potentially conflicting enrolments without automatically assuming that every repeated identifier is fraudulent.

For example, the same identifier appearing in two institutions might indicate:
- An actual duplicate admission.
- A legitimate transfer.
- A historical record that has not been closed.
- A data-entry or synchronization error.

The system should distinguish these cases through evidence and review.

### 2. Explainable Admission Compliance Engine

Instead of simply displaying a red warning, show the calculation and the rule behind it.

For regular enrolment:

\[
\text{Regular Intake Utilization} =
\frac{\text{Actual Regular Enrolment}}{\text{Approved Intake}}
\times 100
\]

For example, if approved intake is 180 and regular enrolment is 186:

\[
\frac{186}{180}\times100 = 103.33\%
\]

The platform should flag the excess of six regular admissions for review, while separately accounting for permissible supernumerary seats and applicable regulatory rules.

### 3. Data Quality Score

Provide an institution-level data quality indicator based on measurable factors such as:
- Mandatory-field completeness.
- Identifier-format validity.
- Resolution of duplicate records.
- Completion of required verification.
- Timeliness of submission.

Keep data quality separate from regulatory compliance. An institution might submit complete records while still requiring an intake-compliance review.

### 4. Risk-Based Review Queue

Prioritize the cases that require human attention.

For example:

| Priority | Finding | Suggested action |
|---|---|---|
| Critical | Confirmed rule violation requiring immediate review | Escalate to authorized officer |
| High | Conflicting active enrolment records | Investigate both records |
| Medium | Inconsistent admission category | Request correction |
| Low | Missing optional information | Notify institution |

These are illustrative priorities, not official AICTE classifications. The production system should use approved regulatory rules.

### 5. Privacy-Preserving Verification

An employer should not need unrestricted access to a student's complete admission record to confirm a specific academic claim.

Design verification responses around the minimum information required, such as:
- Whether the requested claim matches the verified record.
- The issuing institution.
- The credential's current status.
- The verification timestamp.

Apply appropriate authorization, rate limits, and audit logging.

---

# 5. The End-to-End Demo You Should Build

For SIH, the best demonstration is one continuous story rather than a collection of disconnected screens.

Use a fictional institution and entirely synthetic student data.

## Demo scenario: Detecting and resolving an enrolment discrepancy

**Institution:** Eastern Institute of Technology  
**Program:** B.Tech Computer Science and Engineering  
**Academic year:** 2026–27  
**Approved regular intake:** 180  
**Submitted regular enrolment:** 186

The institution submits its student records through the portal.

### Step 1 — Institution login

The institution administrator logs in and sees:
- Institution profile.
- Registered programs.
- Approved intake.
- Current submission status.
- Outstanding validation errors.

### Step 2 — Upload student data

The administrator uploads a CSV file containing 186 synthetic admission records.

The upload preview displays the number of rows, detected columns, missing identifiers, and duplicate candidates.

### Step 3 — Run validation

The engine detects:
- Missing APAAR IDs.
- Repeated identifiers.
- Malformed identifiers.
- Program-level intake excess.
- Potential cross-institution conflicts.

The system generates an itemized report with affected rows and reasons.

### Step 4 — Review and correct records

The institution corrects a missing identifier and removes an accidental duplicate submission.

The system records the correction in the audit history and reruns validation.

It does not silently erase the original submission or its history.

### Step 5 — Submit to AICTE

The institution submits the corrected batch.

The records enter the configured verification workflow. The intake discrepancy remains open because correcting a duplicate does not necessarily resolve the excess-enrolment issue.

### Step 6 — AICTE investigates

The AICTE administrator opens the compliance dashboard.

They can see:
- The institution's approved intake.
- Actual regular enrolment.
- The excess count.
- The affected program.
- The submission and correction history.
- The reason the alert remains unresolved.

The administrator assigns the case for review and records a decision in the simulated workflow.

### Step 7 — Verify a student record

An authorized verifier opens a student verification page and scans or enters a demo verification reference.

The page shows the permitted record information, issuer, verification status, and timestamp.

If authoritative APAAR verification is unavailable, the result explicitly states that external identity verification is pending.

### Step 8 — Generate a report

The AICTE administrator exports a report showing the enrolment discrepancy, validation findings, and case status.

The demonstration ends with an auditable workflow, not just a dashboard.

**This single scenario demonstrates the core problem statement:** secure submission, validation, duplicate detection, intake monitoring, institutional correction, regulatory review, and authorized verification.

---

# 6. Copy-Paste Prompt for Claude Code

The following prompt instructs Claude to act as a senior full-stack engineer and product designer. It specifies the actual application, architecture, workflows, implementation constraints, and acceptance criteria.

It is intentionally detailed so that Claude builds a coherent, working prototype instead of producing a generic admin dashboard with non-functional buttons.

# PROJECT: APAARSetu — National Academic Identity & Student Verification Platform

## 1. ROLE AND OBJECTIVE

Act as a senior full-stack engineer, product architect, database designer, security engineer, and enterprise product designer.

Build a complete, functional, end-to-end prototype for the SIH 2026 problem statement concerning an APAAR-based Student Data Management and Verification System for AICTE-approved institutions.

The product is called APAARSetu.

Tagline: "One Academic Identity. Verified Records. Smarter Governance."

This is a government-grade regulatory technology prototype. It must demonstrate the complete institutional student-data lifecycle, including:

Institution onboarding
→ Student data upload
→ Schema validation
→ APAAR identifier validation
→ Duplicate detection
→ Intake compliance checks
→ Cross-institution conflict detection
→ Human review
→ AICTE central repository
→ Regulatory dashboards
→ Authorized record verification
→ Reports and audit trails.

Do not build a static landing page, a Figma-style mockup, or a collection of disconnected dashboards.

Build an operational application with persistent storage, functioning navigation, real backend APIs, realistic synthetic data, interactive tables, functional filters, meaningful forms, validation results, and state changes that persist across page refreshes.

The product must be easy to run locally and suitable for a live hackathon demonstration.

## 2. FIRST: INSPECT THE EXISTING PROJECT

Before writing code:

1. Inspect the repository structure.
2. Identify the existing framework, dependencies, application entry points, and reusable components.
3. Preserve working code and existing conventions wherever practical.
4. Identify what is already implemented and what is missing.
5. Produce a short implementation plan.
6. Begin implementing immediately after planning.

Do not stop after providing the architecture or plan.

If the repository is empty, initialize the project using the architecture below.

If an existing implementation already uses a different reasonable stack, preserve it where possible rather than needlessly rewriting everything.

Make practical decisions independently. Do not repeatedly ask for approval for ordinary implementation choices.

## 3. RECOMMENDED STACK

Frontend:
- Next.js App Router
- React
- TypeScript
- Tailwind CSS
- Reusable, accessible UI components
- Recharts for charts
- Lucide icons

Backend:
- Python
- FastAPI
- Pydantic
- SQLAlchemy
- Alembic migrations

Database:
- PostgreSQL as the primary database.
- Docker Compose for local PostgreSQL.
- SQLite may be supported as an optional development fallback, but PostgreSQL is the target architecture.

Data ingestion:
- CSV and XLSX parsing.
- Pandas and openpyxl where useful.
- Streaming or chunked processing for larger datasets.
- Row-level validation reports.

Testing:
- Pytest for backend tests.
- Appropriate frontend tests for important interactions.
- API integration tests.

API documentation:
- FastAPI OpenAPI documentation.

Create a clean, modular architecture. Avoid putting the entire application into one giant React component or one oversized FastAPI file.

## 4. PRODUCT DESIGN DIRECTION

Create a premium, restrained enterprise government-tech interface.

The product should feel like a mature regulatory platform used by senior administrators, institutional admission officers, and auditors.

Visual direction:
- Light, professional interface.
- Warm white and subtle neutral backgrounds.
- Deep navy or ink-colored primary text.
- Restrained teal or green for successful verification.
- Amber for pending review.
- Red only for genuine errors or high-priority alerts.
- Subtle borders and carefully controlled shadows.
- Generous spacing.
- Clear typographic hierarchy.
- High information density without visual clutter.
- Consistent table, form, card, badge, and modal styles.
- Professional typography using a suitable modern sans-serif.
- Minimal and purposeful motion.
- Responsive layouts.
- Accessible contrast and keyboard navigation.

Avoid:
- Excessive gradients.
- Glassmorphism everywhere.
- Giant decorative hero sections.
- Cartoon illustrations.
- Oversized emoji.
- Generic AI-themed graphics.
- Random floating elements.
- Unnecessary animations.
- Excessively rounded cards.
- A dashboard made entirely of identical metric cards.
- Fake charts that do not respond to data.
- Buttons that have no behavior.
- Placeholder text disguised as finished functionality.

This is a functional regulatory platform, not a marketing website.

The design must prioritize usability, information hierarchy, data clarity, and speed of operation.

## 5. APPLICATION NAVIGATION

Build a consistent application shell with a sidebar, top navigation, breadcrumb trail, user profile menu, and page-specific actions.

Required routes:

PUBLIC / ENTRY
- /login
- /verify/[reference]

AICTE ADMIN
- /aicte/dashboard
- /aicte/institutions
- /aicte/institutions/[id]
- /aicte/students
- /aicte/verification-queue
- /aicte/compliance
- /aicte/analytics
- /aicte/reports
- /aicte/audit-logs
- /aicte/settings

INSTITUTION
- /institution/dashboard
- /institution/students
- /institution/students/[id]
- /institution/uploads
- /institution/uploads/new
- /institution/uploads/[id]
- /institution/programs
- /institution/compliance
- /institution/reports
- /institution/users
- /institution/settings

STUDENT
- /student/dashboard
- /student/records
- /student/records/[id]
- /student/privacy

VERIFIER
- /verifier/dashboard
- /verifier/check

If a shared component or page is reused across roles, ensure that the visible information and permitted actions still depend on the authenticated user's permissions.

All navigation links must resolve to meaningful pages.

Use a coherent route structure and proper loading, error, empty, and unauthorized states.

## 6. USER ROLES AND ACCESS CONTROL

Implement four primary roles:

A. AICTE_ADMIN
B. INSTITUTION_ADMIN
C. STUDENT
D. AUTHORIZED_VERIFIER

Also support an optional AUDITOR role if it fits the implementation.

Each role must have a different landing dashboard.

AICTE_ADMIN can:
- View national-level analytics.
- Browse registered institutions.
- Review institution-level details.
- Search authorized student records.
- Inspect cross-institution duplicate candidates.
- Review compliance alerts.
- Assign investigations.
- Record review decisions.
- Generate authorized reports.
- Inspect audit events.
- Manage institutional registration status.

INSTITUTION_ADMIN can:
- View only their own institution's operational data.
- View approved programs and intake limits.
- Upload CSV/XLSX files.
- Inspect row-level validation errors.
- Correct eligible records.
- Submit data batches.
- View submission history.
- Resolve institution-level data quality issues.
- View their own compliance alerts.
- Generate institutional reports.
- Manage authorized institutional users where implemented.

STUDENT can:
- View only their own permitted records.
- View record and verification statuses.
- Inspect the permitted history of their records.
- View verification references.
- Manage available consent or privacy preferences where applicable.

AUTHORIZED_VERIFIER can:
- Submit a verification request.
- Verify a permitted credential or record reference.
- View only the information allowed for that request.
- Inspect issuer and verification status.
- View verification timestamps.

Enforce access controls on the backend, not merely by hiding frontend navigation.

Institution-level data isolation must be enforced in database queries and service logic.

A user from Institution A must not gain access to Institution B's student records by modifying a URL or API parameter.

For the demo, implement a clearly labeled local demo authentication mechanism with preconfigured synthetic accounts.

Do not use an unrestricted public registration flow to grant privileged roles.

Never treat a role supplied in an arbitrary request body as authoritative.

Document how demo authentication must be replaced by production-grade identity management.

## 7. DATABASE DESIGN

Create normalized models with migrations.

At minimum, implement these entities:

### Institution
- id
- institution_code
- name
- institution_type
- state
- district
- approval_status
- contact_email
- created_at
- updated_at

### AcademicYear
- id
- label
- start_date
- end_date
- status

### Program
- id
- institution_id
- program_code
- program_name
- discipline
- duration
- approval_status

### ProgramIntake
- id
- institution_id
- program_id
- academic_year_id
- approved_regular_intake
- applicable_supernumerary_limits or policy reference
- policy_version
- effective_from
- effective_to
- created_at
- updated_at

Do not duplicate the same approved intake value across individual student records.

### StudentIdentity
- id
- protected APAAR identifier or a suitable encrypted representation
- keyed lookup fingerprint for exact matching, where appropriate
- created_at
- updated_at

Avoid using an unsalted plain SHA-256 hash of a potentially enumerable identifier as a privacy solution.

Use an appropriately managed keyed HMAC for indexed matching if that approach fits the data-access requirements. Keep cryptographic keys outside source control.

Where appropriate, separate identity data from admission data.

### AdmissionRecord
- id
- student_identity_id
- institution_id
- program_id
- academic_year_id
- institutional_student_id
- admission_date
- admission_category
- enrolment_status
- record_status
- external_verification_status
- source_batch_id
- created_at
- updated_at
- version

Add the necessary database constraints and indexes.

Do not impose a simplistic global uniqueness constraint on student APAAR IDs across all historical admission records. The same identity can legitimately appear in multiple academic records.

Instead, detect duplicate submissions and potentially conflicting active enrolments using explicit business rules.

### SeatAllocation
- id
- institution_id
- program_id
- academic_year_id
- admission_record_id, where applicable
- seat_category
- seat_count or allocation reference
- applicable_policy_reference

Model regular and supernumerary admissions separately enough to calculate intake compliance correctly.

### DataSubmission
- id
- institution_id
- academic_year_id
- file_name
- file_hash
- submitted_by
- status
- total_rows
- valid_rows
- invalid_rows
- duplicate_candidates
- created_at
- completed_at

### ValidationFinding
- id
- submission_id
- admission_record_id, nullable
- row_number, nullable
- rule_code
- severity
- finding_type
- message
- evidence_json
- resolution_status
- resolved_by
- resolved_at
- created_at

### ComplianceCase
- id
- institution_id
- program_id
- academic_year_id
- case_type
- priority
- status
- evidence_json
- assigned_to
- decision
- decision_reason
- created_at
- updated_at
- resolved_at

### VerificationRequest
- id
- reference
- admission_record_id
- requester_type
- requester_id, where applicable
- purpose
- authorization_status
- result_status
- created_at
- expires_at

### AuditEvent
- id
- actor_id
- actor_role
- institution_id, nullable
- action
- resource_type
- resource_id
- timestamp
- request_id
- outcome
- sanitized_metadata

### CredentialRecord
- id
- admission_record_id
- issuer_institution_id
- credential_type
- credential_reference
- integrity_status
- issued_at
- revoked_at
- signing_key_id

### ConsentRecord or AccessAuthorization
Implement an appropriate model for recording relevant consent, authorization, purpose, scope, expiry, and revocation information.

Use separate models for entities that require independent lifecycle management.

Use database transactions for submissions, corrections, review decisions, and other operations that modify multiple related records.

## 8. DATA UPLOAD WORKFLOW

Build a complete bulk-upload workflow.

Page: /institution/uploads/new

The user should be able to:

1. Select the academic year.
2. Select the program or upload records for multiple registered programs.
3. Download a sample CSV template.
4. Upload CSV or XLSX.
5. Preview detected columns.
6. Map incoming columns to supported fields if necessary.
7. Validate file structure.
8. Preview validation findings.
9. Inspect row-level errors.
10. Confirm submission.
11. View processing status.
12. Open the completed report.
13. Download a corrected-row template or error report.
14. Correct errors and submit a new version.

Implement actual backend processing.

Do not generate validation results exclusively in the frontend.

Use a stable internal schema and Pydantic models.

Support fields including:
- APAAR ID.
- Institutional student ID.
- Student name, only where needed.
- Date of birth, only where needed.
- Institution code.
- Program code.
- Academic year.
- Admission date.
- Admission category.
- NRI status.
- OCI status.
- Foreign National status.
- Supernumerary category.
- Applicable seat category.

Treat approved intake and aggregate actual enrolment as program-level information.

Do not require student names or dates of birth if the configured integration does not need them.

Reject unsupported file types, excessively large files, invalid encodings, and malformed data safely.

Enforce configurable upload-size and row-count limits.

Protect against CSV formula injection in exported reports.

Use a file hash and batch metadata to help detect accidental repeated uploads.

A repeated file should produce a warning or idempotent result where appropriate, not silently duplicate all its records.

## 9. APAAR VALIDATION ENGINE

Implement an explicit validation service with independent, testable rules.

Each finding must include:
- Rule code.
- Severity.
- Human-readable message.
- Affected row or record.
- Evidence sufficient to explain the finding.
- Recommended resolution.
- Current resolution status.

Required rules:

A. Required field missing.

B. APAAR ID malformed according to the configured official specification.

C. Duplicate APAAR ID within the same submitted batch.

D. Duplicate institutional student ID within the applicable scope.

E. Potentially conflicting active enrolment across institutions.

F. Institution not recognized or not authorized.

G. Program not registered for the selected institution.

H. Academic year invalid or outside the applicable configuration.

I. Admission category inconsistent with required fields.

J. Actual regular enrolment exceeds approved regular intake.

K. Missing or inconsistent supernumerary-seat information.

L. Duplicate or conflicting existing record.

M. Repeated or unusual correction patterns.

N. Inconsistent admission dates or record statuses.

Do not invent the official APAAR ID format.

Store the format-validation rule in configuration and document that it must be confirmed against the authoritative specification.

Keep these concepts distinct:

- FORMAT_VALIDATED
- LOCAL_RECORD_MATCHED
- EXTERNAL_VERIFICATION_PENDING
- EXTERNALLY_VERIFIED
- EXTERNAL_VERIFICATION_FAILED

Passing a format check must never imply that an APAAR ID is genuine or belongs to the named student.

Implement an external verification adapter interface.

Provide a DEMO adapter that returns clearly labeled synthetic results.

If no authoritative integration exists, use EXTERNAL_VERIFICATION_PENDING.

Never claim that the prototype has contacted an official APAAR, DigiLocker, or government service unless a real authorized integration has actually been configured.

## 10. CROSS-INSTITUTION DUPLICATE DETECTION

Implement exact-match duplicate detection using the protected APAAR identifier or its keyed lookup fingerprint.

When the same identifier appears in multiple institutions, classify it as a candidate conflict.

Consider:
- Active versus inactive admission.
- Academic-year overlap.
- Admission and exit dates.
- Transfer status.
- Duplicate batch submissions.
- Historical records.
- Correction history.

Show the evidence behind each candidate.

Provide an AICTE review screen with:
- Institution A and Institution B.
- Relevant programs and academic years.
- Current admission statuses.
- Date information.
- Evidence from the matching records.
- Suggested investigation steps.
- Review status.

Do not automatically label the student as fraudulent.

Do not automatically merge or delete records.

Provide controlled actions:
- Mark as legitimate historical overlap.
- Request institution clarification.
- Confirm duplicate submission.
- Escalate for regulatory review.
- Resolve with an explanation.

Every decision must be recorded in the audit history.

## 11. INTAKE COMPLIANCE ENGINE

Build a reusable program-level compliance service.

For each institution, program, and academic year, calculate:

approved_regular_intake

actual_regular_enrolment

regular_intake_utilization_percentage

regular_intake_excess

supernumerary_enrolment_by_category

pending_student_records

verified_student_records

flagged_student_records

Use explicitly defined enrolment-status rules.

For example:

regular_intake_utilization_percentage =
(actual_regular_enrolment / approved_regular_intake) * 100

Handle approved intake equal to zero safely.

Calculate excess as:

max(0, actual_regular_enrolment - approved_regular_intake)

Do not mix supernumerary enrolment into regular enrolment unless the applicable policy explicitly requires it.

Keep seat-category rules configurable and versioned.

Create a compliance case when the relevant rule triggers.

The case should include:
- The approved value.
- The observed value.
- The calculation.
- The applicable policy reference.
- The date detected.
- The review status.

Provide AICTE review actions.

A detected discrepancy should trigger investigation, not an automatic final legal conclusion.

## 12. INTELLIGENT ANOMALY DETECTION

Implement a transparent, explainable anomaly engine.

Start with deterministic rules.

Then add optional statistical detection for:
- Unusual submission-volume changes.
- Sudden increases in correction rates.
- Unusually high identifier-validation failure rates.
- Abrupt enrolment changes relative to prior periods.
- Repeated duplicate submissions.

Use statistical methods only where there is sufficient synthetic or historical data.

A simple statistical baseline is preferable to an untrained machine-learning model presented as intelligent.

If implementing a risk score:
- Document every contributing factor.
- Keep the score deterministic and reproducible.
- Show the underlying evidence.
- Avoid unsupported claims of AI accuracy.
- Do not make final regulatory decisions automatically.
- Do not infer misconduct from demographic characteristics.

Display anomaly findings in an investigation queue with configurable priorities.

## 13. AICTE ADMIN DASHBOARD

Build /aicte/dashboard.

The dashboard must be connected to backend analytics endpoints.

Required information:

- Total registered institutions.
- Institutions that have submitted records.
- Total admission records.
- Externally verified records.
- Records awaiting external verification.
- Records with validation findings.
- Open compliance cases.
- Programs requiring intake review.
- Submission coverage.
- Intake utilization trends.
- State-wise institution and enrolment distribution.
- Discipline-wise enrolment.
- Validation failure trends.
- Recent high-priority alerts.

Charts must use actual backend responses.

Provide filters:
- Academic year.
- State.
- Institution.
- Discipline.
- Program.
- Verification status.
- Compliance status.

Provide drill-down navigation from aggregate figures into the corresponding filtered records.

Metric definitions must be explicit.

For example, do not count a student record as externally verified merely because the record is present in the local database.

Do not use randomly generated chart values at runtime.

Seed data can make the dashboard useful, but all displayed metrics must be calculated from the actual seeded database records.

## 14. INSTITUTION DASHBOARD

Build /institution/dashboard.

Show:
- Institution profile and approval status.
- Submission progress.
- Total student records submitted.
- Record validation status.
- Pending external verification.
- Program-wise approved intake and regular enrolment.
- Supernumerary enrolment by category.
- Unresolved validation findings.
- Open compliance cases.
- Recent uploads.
- Latest audit-relevant actions.
- Required next steps.

All values must be calculated from the authenticated institution's own data.

Provide drill-down into the underlying records.

Provide meaningful empty states when the institution has not yet submitted data.

## 15. STUDENT RECORD MANAGEMENT

Build a searchable, filterable student table.

Columns:
- Institution student ID.
- Masked APAAR identifier.
- Program.
- Academic year.
- Admission date.
- Record status.
- External verification status.
- Last updated.
- Available actions.

Implement:
- Server-side pagination.
- Search.
- Sorting.
- Filters.
- Row selection where useful.
- Record detail view.
- Correction workflow.
- Status history.
- Relevant audit history.
- CSV export for authorized users.

Do not expose complete APAAR identifiers unnecessarily.

Implement an explicit permission check before returning sensitive identifier data.

The record detail page should show:
- Basic permitted information.
- Institution and program.
- Academic-year information.
- Validation findings.
- Verification status.
- Source submission.
- Version history.
- Audit history.
- Authorized correction actions.

## 16. SECURE VERIFICATION PORTAL

Implement:

/verify/[reference]

and

/verifier/check

The verification process should:

1. Accept a verification reference.
2. Authenticate or authorize the requester as required.
3. Resolve the credential or record.
4. Check integrity and current status.
5. Return only the permitted information.
6. Record the verification event.
7. Display a clear result.

Possible outcomes:
- VERIFIED
- VALID_RECORD_EXTERNAL_IDENTITY_PENDING
- NOT_FOUND
- REVOKED
- EXPIRED
- ADDITIONAL_AUTHORIZATION_REQUIRED
- VERIFICATION_SERVICE_UNAVAILABLE

Use a short, random, unguessable verification reference.

Do not embed a student's full APAAR ID or personal details in a public URL or QR code.

Do not expose unrestricted student records through a public endpoint.

Generate a QR code that opens the verification route using the random reference.

The verification page must clearly explain what has actually been checked.

## 17. CREDENTIAL INTEGRITY

Implement a working prototype of a digitally signed academic-record payload.

Use an established cryptographic library and a standard signature algorithm.

The signing process should:
- Construct a canonical payload.
- Include a record reference and issuer.
- Include relevant academic-record fields.
- Include issuance time and key identifier.
- Sign the canonical payload.
- Store the signature or signed artifact.
- Verify the signature when requested.
- Detect modifications to signed fields.

Provide a test that changes a signed field and confirms that signature verification fails.

Keep private keys outside the repository.

Use a dedicated development key for local demos.

Document key rotation and secure key management requirements.

Clearly distinguish:
- Record integrity.
- Issuer authentication.
- External identity verification.
- Academic-record accuracy.

A successful digital signature must not be presented as proof of all four.

## 18. REPORTING

Build the following reports:

- Institution submission status.
- Student-record validation summary.
- Approved intake versus actual regular enrolment.
- Supernumerary enrolment summary.
- Duplicate candidate report.
- External verification status.
- Open compliance cases.
- Institution-level data quality.
- State-wise enrolment.
- Discipline-wise enrolment.
- Historical submission trends.

Provide:
- Date and academic-year filters.
- Relevant institution filters.
- CSV download.
- PDF download where practical.
- Report generation timestamps.
- Permission checks.
- Audit events for sensitive exports.

The reports must be generated from database data.

Do not use hardcoded report tables unrelated to the application state.

## 19. AUDITABILITY

Create an audit service that records relevant events, including:

- Authentication events where supported.
- Student-record creation.
- Record corrections.
- Bulk submissions.
- Validation runs.
- Review assignments.
- Compliance decisions.
- Verification requests.
- Credential issuance.
- Credential revocation.
- Sensitive data exports.
- Permission changes.

Store actor, action, target, timestamp, outcome, and relevant sanitized metadata.

Never store passwords, authentication tokens, private keys, or unnecessary sensitive data in logs.

Protect audit records from ordinary application-level modification.

For the prototype, implement append-only audit behavior and document the additional controls required for production-grade tamper resistance.

## 20. API DESIGN

Implement versioned REST APIs.

Use a consistent prefix:

/api/v1

Required endpoint groups:

Authentication:
- POST /api/v1/auth/demo-login
- GET /api/v1/auth/me
- POST /api/v1/auth/logout

Institutions:
- GET /api/v1/institutions
- GET /api/v1/institutions/{id}
- POST /api/v1/institutions
- PATCH /api/v1/institutions/{id}

Programs and intake:
- GET /api/v1/programs
- GET /api/v1/intakes
- GET /api/v1/intakes/{id}

Student records:
- GET /api/v1/students
- GET /api/v1/students/{id}
- POST /api/v1/students
- PATCH /api/v1/students/{id}
- GET /api/v1/students/{id}/history

Uploads:
- POST /api/v1/submissions
- GET /api/v1/submissions
- GET /api/v1/submissions/{id}
- POST /api/v1/submissions/{id}/validate
- POST /api/v1/submissions/{id}/submit
- GET /api/v1/submissions/{id}/findings
- GET /api/v1/submissions/{id}/export-errors

Validation:
- POST /api/v1/validation/run
- GET /api/v1/validation/findings
- POST /api/v1/validation/findings/{id}/resolve

Compliance:
- GET /api/v1/compliance/summary
- GET /api/v1/compliance/cases
- GET /api/v1/compliance/cases/{id}
- POST /api/v1/compliance/cases/{id}/assign
- POST /api/v1/compliance/cases/{id}/decision

Verification:
- POST /api/v1/verification/requests
- GET /api/v1/verification/requests/{id}
- POST /api/v1/verification/requests/{id}/authorize
- GET /api/v1/verification/records/{reference}

Analytics:
- GET /api/v1/analytics/overview
- GET /api/v1/analytics/enrolment
- GET /api/v1/analytics/institutions
- GET /api/v1/analytics/validation

Reports:
- GET /api/v1/reports
- POST /api/v1/reports/generate

Audit:
- GET /api/v1/audit-events

Adjust individual routes as needed to preserve REST consistency and authorization requirements.

Do not implement sensitive endpoints as public APIs merely because they are needed by the frontend.

Use appropriate HTTP status codes, request validation, response models, and structured error responses.

Generate OpenAPI documentation.

## 21. SYNTHETIC DEMO DATA

Create a deterministic seed script.

The demo must work without any external government API.

Seed:
- At least 8 fictional AICTE-approved institutions.
- Multiple states.
- Multiple engineering and management programs.
- At least 2 academic years.
- Hundreds of synthetic admission records.
- Program-level approved intake data.
- A mix of regular and supernumerary admissions.
- Multiple verification states.
- Several pending compliance cases.
- Duplicate candidate scenarios.
- Missing and malformed identifier scenarios.
- Historical and inactive admissions.
- Submission history.
- Audit events.

Use clearly synthetic identifiers and fictional institutions.

Do not use actual student records or actual people's APAAR IDs.

Create deterministic edge cases that can be reproduced during a live demo.

The dataset must include a featured scenario:

Institution: Eastern Institute of Technology

Program: Computer Science and Engineering

Academic year: 2026–27

Approved regular intake: 180

Submitted regular enrolment: 186

Required behavior:
- Detect regular enrolment exceeding approved intake by 6.
- Generate an explainable compliance finding.
- Create or update a review case.
- Display the case on the AICTE dashboard.
- Allow an authorized reviewer to inspect and assign it.
- Allow a reviewer to record a reasoned decision.
- Update the case status.
- Record the action in the audit history.

Also seed:
- A duplicate identifier within a batch.
- A potential cross-institution enrolment conflict.
- A record with a missing identifier.
- A malformed identifier.
- A legitimate historical enrolment that should not automatically be treated as fraud.
- A supernumerary-seat scenario that must be evaluated separately from regular intake.

The demo data must be internally consistent.

The seeded dashboard metrics must match the underlying database.

## 22. INTERACTIVE DEMO EXPERIENCE

Build the application so that a judge can complete the following sequence without editing source code.

1. Open the login page.
2. Log in as an institution administrator using a documented demo account.
3. Inspect the institution dashboard.
4. Open the student-upload page.
5. Upload a sample CSV or use a clearly labeled seeded demo batch.
6. Inspect the validation results.
7. Open a duplicate finding.
8. Inspect the affected records.
9. Correct a record or mark it for clarification.
10. Submit the batch.
11. Log out.
12. Log in as AICTE_ADMIN.
13. Open the national dashboard.
14. Find the intake compliance case.
15. Open its evidence.
16. Assign the case or record a review decision.
17. Open the audit log.
18. Verify a synthetic student record through the authorized verification flow.
19. Inspect the verification result.
20. Generate and download a report.

All actions must produce real application state changes.

Use confirmation dialogs for destructive or consequential actions.

Display success and error notifications.

Provide loading indicators where needed.

If an action is asynchronous, show the actual processing state.

Do not fake a completed API request with a frontend-only toast.

## 23. FRONTEND ENGINEERING REQUIREMENTS

Use:
- Reusable components.
- Typed API clients.
- Shared data contracts.
- Centralized error handling.
- Consistent forms and validation messages.
- Proper loading states.
- Proper empty states.
- Proper error states.
- Responsive layouts.
- Accessible controls.
- Route-level authorization.
- Server-side pagination for large tables.
- URL-backed filters where appropriate.

Do not:
- Store the entire application dataset in React component state.
- Implement a fake backend inside the frontend.
- Hardcode chart data in components.
- Make buttons decorative.
- Duplicate business logic across components.
- Suppress API errors.
- Expose secrets in frontend environment variables.
- Treat a hidden navigation link as an authorization mechanism.

Seed data belongs in the backend database.

The frontend must consume the backend APIs.

## 24. SECURITY REQUIREMENTS

Implement practical prototype-level security and document the production hardening requirements.

Include:
- Secure password handling if password-based demo authentication is used.
- Server-side authorization.
- Institution-level access isolation.
- Input validation.
- Parameterized database operations.
- Safe file parsing.
- File-size limits.
- Rate limiting for relevant endpoints.
- Secure cookie settings where applicable.
- CSRF protection where required by the authentication design.
- CORS restrictions.
- Secrets in environment variables.
- Masking of sensitive identifiers.
- Audit logging.
- Safe CSV exports.
- Safe verification references.
- Appropriate error handling without leaking sensitive data.

Do not claim production-grade security merely because these controls exist in a development prototype.

Provide a production-readiness document covering:
- Authoritative identity integration.
- Government identity and data-sharing approvals.
- Applicable Indian data-protection requirements.
- Consent and authorization design.
- Key management.
- Monitoring and incident response.
- Backups and disaster recovery.
- Retention and deletion.
- High availability.
- Load testing.
- Independent security assessment.

## 25. TESTING REQUIREMENTS

Write tests for at least:

1. Valid record schema.
2. Missing APAAR ID.
3. Malformed APAAR ID.
4. Duplicate APAAR ID within a batch.
5. Duplicate institutional student ID.
6. Cross-institution conflict detection.
7. Approved intake exceeded.
8. Supernumerary enrolment handled separately.
9. Legitimate historical enrolment.
10. Institution-level data isolation.
11. Unauthorized AICTE endpoint access.
12. Unauthorized student-record access.
13. Record correction and audit history.
14. Compliance-case creation.
15. Compliance-case resolution.
16. Verification-reference expiration.
17. Digital-signature verification.
18. Modified signed payload rejection.
19. Report export.
20. Repeated upload/idempotency behavior.

Tests must use controlled fixtures and must not depend on external services.

## 26. DEFINITION OF DONE

The project is not complete until all of the following are true:

- The frontend starts successfully.
- The backend starts successfully.
- Database migrations run successfully.
- The seed script completes successfully.
- The login flow works with documented demo accounts.
- Role-based navigation works.
- Backend role authorization works.
- Institution-level data isolation works.
- Student data can be uploaded.
- Uploaded records are actually parsed and persisted.
- Validation results come from backend logic.
- Duplicate detection works.
- Intake calculations work.
- Compliance cases can be reviewed.
- Review decisions persist.
- Audit history is recorded.
- The verification page returns meaningful results.
- Digital signatures can be verified.
- Reports can be generated and downloaded.
- Dashboards reflect the database.
- Important actions have automated tests.
- No major navigation route is broken.
- No critical action is a decorative button.
- No real government integration is falsely claimed.
- Setup instructions are complete.

## 27. IMPLEMENTATION ORDER

Work in this order:

Phase 1:
Inspect repository, plan architecture, establish project structure, and create the design system.

Phase 2:
Implement database models, migrations, seed data, and backend configuration.

Phase 3:
Implement authentication, roles, permissions, and institution-level data isolation.

Phase 4:
Implement student-record APIs, file ingestion, validation, duplicate detection, and intake calculations.

Phase 5:
Implement compliance cases, review workflows, audit events, and verification services.

Phase 6:
Build the frontend shell, dashboards, upload workflow, record tables, detail views, and compliance queue.

Phase 7:
Implement credential integrity, reports, exports, and verification QR flow.

Phase 8:
Connect every frontend page to real backend APIs.

Phase 9:
Write tests, fix errors, validate the complete demo workflow, and polish the interface.

Phase 10:
Create documentation and verify the setup from a clean environment.

After each phase, run the relevant checks and resolve failures before proceeding.

Do not stop after creating a homepage or dashboard.

## 28. REQUIRED DELIVERABLES

Produce:

1. Complete source code.
2. Frontend application.
3. Backend application.
4. Database models and migrations.
5. Deterministic synthetic-data seed script.
6. Functional authentication and role-based access.
7. Working upload and validation workflow.
8. Duplicate-detection service.
9. Intake compliance engine.
10. Compliance review queue.
11. AICTE dashboard.
12. Institution dashboard.
13. Student-record management pages.
14. Authorized verification portal.
15. Digital-signature verification demonstration.
16. Audit logging.
17. Downloadable reports.
18. Automated tests.
19. Docker Compose configuration.
20. Environment variable example file.
21. README with setup and execution commands.
22. Demo credentials and exact demonstration steps.
23. API documentation.
24. Production-readiness and integration notes.

## 29. FINAL EXECUTION INSTRUCTIONS

Begin by inspecting the repository.

Then implement the application, not merely a plan.

Make reasonable engineering decisions independently.

Prefer working end-to-end functionality over an excessive number of unfinished features.

Do not claim a feature is implemented until its actual code path works.

Do not fabricate official integrations, regulatory approvals, identity-verification results, or performance benchmarks.

Where a real external dependency is unavailable, implement a clearly labeled adapter and a deterministic synthetic demo mode.

Keep the project runnable at every major milestone.

At completion, provide:
- A concise architecture summary.
- The files and modules implemented.
- Exact installation commands.
- Exact commands to start the database, backend, and frontend.
- Demo login credentials.
- A step-by-step live demo script.
- The automated test results.
- Any remaining limitations or external integrations required.

Now inspect the repository and begin building APAARSetu.

---

# 7. How to Get the Best Result from Claude Code

The prompt above defines the target product. To get a reliable implementation, follow this sequence.

### Step 1: Open the project

Open an empty project directory or the repository you intend to use in Claude Code.

Place the SIH problem statement and any official template or technical documentation in the repository if Claude needs to reference them.

### Step 2: Paste the complete prompt

Let Claude inspect the existing codebase and begin implementation.

If it produces only a plan, tell it to continue implementing the first phase and run the application before moving on.

### Step 3: Require a real execution test

Once the initial implementation is complete, use this follow-up prompt:

Do not add new features yet.

Run the existing APAARSetu application from its current state.

1. Start the database and run all migrations.
2. Execute the deterministic seed script.
3. Start the FastAPI backend.
4. Start the Next.js frontend.
5. Resolve dependency, compilation, database, and runtime errors.
6. Test every role's login and permissions.
7. Upload a synthetic student CSV and inspect the backend validation findings.
8. Verify the duplicate-detection logic.
9. Verify the approved-intake calculation using the seeded 180-versus-186 scenario.
10. Confirm that supernumerary admissions are handled separately.
11. Resolve a compliance case and confirm that the decision persists after a page refresh.
12. Confirm that an institution cannot access another institution's records by changing a URL or API parameter.
13. Test the record-verification flow and digital-signature integrity check.
14. Generate and download a report.
15. Run the automated test suite.

Fix the underlying implementation wherever a test fails. Do not hide failures, replace backend behavior with hardcoded frontend responses, or claim tests passed without running them.

Then perform a complete end-to-end demo using the documented synthetic accounts.

Finish by reporting the commands used, tests actually executed, failures fixed, and any remaining limitations.

### Step 4: Add a presentation-ready demo mode

For a hackathon, I would also ask Claude to implement a controlled demo mode with:
- Preloaded synthetic institutions.
- Preloaded admission records.
- A seeded intake violation.
- A seeded duplicate candidate.
- A guided institutional submission flow.
- A guided AICTE investigation flow.
- A reset-demo-data action restricted to authorized demo administrators.

This makes the application reproducible during judging and prevents an empty database or an accidental correction from ruining the demonstration.

---

# 8. What You Should Prioritize If Development Time Is Limited

Do not try to implement every feature at production depth before the hackathon.

Build these in order:

| Priority | Feature | Why it matters |
|---|---|---|
| P0 | Institutional login and role-based access | Establishes the two principal user journeys |
| P0 | Student CSV upload and persistent storage | Demonstrates real data ingestion |
| P0 | APAAR validation and duplicate detection | Directly addresses the problem statement |
| P0 | Approved intake versus actual enrolment | Demonstrates the central regulatory use case |
| P0 | AICTE compliance dashboard | Makes the value visible to judges |
| P0 | Review queue and audit trail | Shows controlled, accountable decision-making |
| P1 | Authorized verification portal | Demonstrates academic-record verification |
| P1 | Reports and downloadable validation results | Demonstrates operational usefulness |
| P1 | Cross-institution conflict detection | Demonstrates national-level capability |
| P2 | Digitally signed record verification | Adds a useful integrity mechanism |
| P2 | Statistical anomaly detection | Adds intelligence beyond deterministic rules |
| P2 | External institutional API integration | Supports future interoperability |

**My recommendation:** Make the CSV-to-validation-to-compliance-review journey exceptionally reliable before adding advanced AI.

A deterministic engine that correctly identifies an excess of six regular admissions, explains why, allows the institution to correct its records, and gives AICTE an auditable review workflow is more convincing than a sophisticated AI dashboard that cannot substantiate its findings.

The strongest final demonstration will prove that **APAARSetu does not merely collect student data; it transforms institutional submissions into traceable, verifiable, and actionable regulatory information.**