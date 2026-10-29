# APAARSetu — National Academic Identity & Student Verification Platform

> **"One Academic Identity. Verified Records. Smarter Governance."**  
> Problem Statement: AICTE APAAR-Based Student Data Management & Verification System (SIH 2026)

---

## 1. Executive Summary

**APAARSetu** is a government-grade regulatory technology platform connecting AICTE-approved institutions, regulatory councils, students, and authorized background verifiers.
Rather than functioning merely as an admission repository, APAARSetu establishes:
1. **Trust:** Academic records cryptographically signed with canonical payloads and HMAC-SHA256 signatures, linked to protected APAAR identities with keyed lookup fingerprints for privacy.
2. **Intelligence:** Real-time multi-stage validation engine identifying missing fields, malformed 12-digit APAAR IDs, in-batch duplicates, and cross-institution active enrolment conflicts across universities.
3. **Regulatory Governance:** AICTE live intake compliance monitoring calculating regular intake utilization (`Actual Regular Enrolment / Approved Sanctioned Intake`), explicitly separating supernumerary quotas (TFW, EWS, Sports) to detect excesses with auditable decision-making workflows.

---

## 2. Technical Stack & Architecture

| Layer | Technology | Key Capabilities |
|---|---|---|
| **Frontend** | Next.js 16 (App Router), TypeScript, React, Tailwind CSS | Role-based navigation, responsive enterprise aesthetic, Recharts visualization, QR code reader |
| **Backend** | Python 3, FastAPI, Pydantic v2 | Versioned RESTful APIs (`/api/v1`), OpenAPI docs, dependency injection, role authorization |
| **Data & ORM** | SQLAlchemy, SQLite / PostgreSQL | Normalized relational models, tenant isolation, cascading integrity, append-only audit trail |
| **Ingestion** | Pandas, OpenpyXL, CSV parser | Chunked parsing, schema mapping, formula injection protection |
| **Security & Cryptography** | HMAC-SHA256, Keyed Salted Hashing | Sensitive APAAR masking (`9823 **** 4921`), canonical JSON payload signing, tamper detection |
| **Testing** | Pytest, TestClient | Automated validation tests, crypto tamper rejection, intake math, and decision persistence |

---

## 3. Directory Layout

```text
├── backend/
│   ├── app/
│   │   ├── config.py              # Application settings & security keys
│   │   ├── database.py            # SQLAlchemy engine & session dependency
│   │   ├── models.py              # 12 Normalized relational tables (Institutions, Admissions, Compliance, etc.)
│   │   ├── schemas.py             # Pydantic request/response schemas
│   │   ├── main.py                # FastAPI entrypoint, CORS & router aggregation
│   │   ├── seed_data.py           # Deterministic seeder (8 institutions, 186-student scenario, credentials)
│   │   ├── services/
│   │   │   ├── auth_service.py        # JWT auth, demo persona logins & tenant isolation
│   │   │   ├── crypto_service.py      # APAAR masking, keyed HMAC fingerprints, canonical signatures
│   │   │   ├── validation_engine.py   # Multi-stage format, batch duplicate & conflict checks
│   │   │   ├── compliance_engine.py   # Program intake utilization & regulatory case generation
│   │   │   └── audit_service.py       # Append-only immutable audit logger
│   │   └── routers/                   # Modular REST endpoints
│   │       ├── auth.py, institutions.py, programs.py, students.py, submissions.py,
│   │       ├── compliance.py, verification.py, analytics.py, reports.py, audit.py
│   ├── sample_data/
│   │   ├── valid_sample_admissions.csv
│   │   └── batch_with_duplicates_and_errors.csv
│   ├── tests/
│   │   └── test_apaarsetu.py      # Automated test suite (8/8 passed)
│   ├── Dockerfile
│   ├── requirements.txt
│   └── run.py
├── frontend/
│   ├── src/
│   │   ├── app/                   # Next.js App Router routes
│   │   │   ├── page.tsx           # Home entry & one-click demo personas
│   │   │   ├── aicte/             # AICTE Admin portal (dashboard, compliance, queue, analytics, reports, audit)
│   │   │   ├── institution/       # Institution portal (dashboard, upload CSV, roster, programs, compliance)
│   │   │   ├── student/           # Student portal (academic ID card, verifiable credential)
│   │   │   ├── verifier/          # Verifier portal (query claims, audit history)
│   │   │   └── verify/[reference] # Public cryptographic credential verification & tamper testing
│   │   ├── components/layout/     # Government Navbar, Sidebar, AppShell
│   │   ├── context/AuthContext.tsx# Demo persona context
│   │   └── lib/api.ts             # Typed API client
│   ├── Dockerfile
│   └── package.json
├── docker-compose.yml
├── .env.example
└── README.md
```

---

## 4. Quick Start & Execution Commands

### Prerequisites
- Python 3.10+
- Node.js 18+ & npm

### Method A: Local Native Execution (Recommended for Fast Demo)

#### 1. Setup & Start Backend:
```bash
# In first terminal:
cd backend
python -m pip install -r requirements.txt

# Run database seeder (rebuilds SQLite database and seeds 8 institutions + 186 cohort):
python app/seed_data.py

# Run automated tests:
python -m pytest tests/ -v

# Start FastAPI server on port 8000:
python run.py
```
*Backend runs at `http://localhost:8000`. Interactive OpenAPI documentation at `http://localhost:8000/docs`.*

#### 2. Setup & Start Frontend:
```bash
# In second terminal:
cd frontend
npm install
npm run dev
```
*Frontend runs at `http://localhost:3000`.*

---

### Method B: Docker Compose (Single Command)
```bash
docker-compose up --build
```

---

## 5. Demo Personas & Preconfigured Accounts

The application has a **Live Demo Switcher** in the top navigation bar and on the homepage for instant one-click switching during judging:

| Role | Account Email | Persona / Organization | Demonstrated Workflow |
|---|---|---|---|
| **AICTE Admin** | `admin@aicte.gov.in` | Dr. Rajesh Sharma (AICTE Director) | National overview, review intake violation case, assign inquiry officer, record regulatory decision |
| **Institution Admin** | `admin@eit.edu.in` | Prof. S. K. Mukherjee (Principal, Eastern Inst. of Tech) | Featured 180 vs 186 CSE intake alert, bulk CSV upload, error report download, student correction |
| **Institution Admin** | `admin@aiet.edu.in` | Dr. Ananya Deshmukh (Apex Institute) | Multi-tenant isolation verification |
| **Student** | `student@eit.edu.in` | Aarav Banerjee (B.Tech CSE) | Digital APAAR Academic Card, masked identifier, verifiable QR token |
| **Authorized Verifier** | `verifier@tcs.com` | Vikram Malhotra (TCS Background Verifier) | Query credential reference, HMAC cryptographic proof, interactive tamper test |

---

## 6. Step-by-Step Live Demo Script for Judges

Complete this 10-minute sequence during demonstration:

1. **Open Portal**: Navigate to `http://localhost:3000`. Notice the Government design aesthetic with the 4 one-click demo personas and public verification search.
2. **Public Verification**: In the search bar on the homepage, click demo link `VRF-2026-EIT001`.
   - Observe the green **"Academic Record Cryptographically Verified"** banner.
   - Inspect the minimal permitted claims: Student Legal Name, Institutional Roll ID, Program, Admission Date, and Issuing Institution (`EIT-2026-WB`).
   - Notice the **Cryptographic Integrity Proof** (HMAC-SHA256 signature) and high-resolution verifiable QR code.
3. **Interactive Tamper Test**: Click the button **"Run Tamper Test"**.
   - Watch the backend intentionally alter the signed student roll number in memory and re-verify the digital signature.
   - Observe immediate cryptographic rejection: `Digital signature mismatch - record payload has been tampered with`.
4. **Institution Login**: Switch to **Eastern Institute of Technology** (`admin@eit.edu.in`).
   - Observe the **"Intake Regulatory Notice"** alert banner: B.Tech CSE has Approved Regular Intake of **180**, but actual enrolled regular count is **186** (+6 excess, 103.33% utilization).
   - Observe that the 5 supernumerary admissions (TFW/EWS) are tracked separately and do not breach the regular quota.
5. **Data Ingestion & Multi-Stage Validation**:
   - In the sidebar, navigate to **Upload Admissions** (`/institution/uploads/new`).
   - Click the live hackathon button **"Test Error & Duplicate Batch (6 Rows)"**.
   - Notice the immediate backend validation analysis:
     * Row 1: Missing mandatory APAAR ID (`RULE_MISSING_REQUIRED_FIELD`).
     * Row 2: Malformed APAAR ID `9825123` violating 12-digit numeric standard (`RULE_MALFORMED_APAAR`).
     * Row 3 & 4: In-batch duplicate identity candidate (`RULE_BATCH_DUPLICATE_APAAR`).
     * Row 5: Unregistered academic program code (`RULE_UNREGISTERED_PROGRAM`).
     * Row 6: Supernumerary seat missing required quota category (`RULE_SUPERNUMERARY_MISMATCH`).
   - Click **"Export Errors CSV"** to test downloadable compliance error reports.
6. **Audited Record Correction Workflow**:
   - Navigate to **Student Records** (`/institution/students`).
   - Search for `Aarav Banerjee` and click **"Correct"**.
   - Modify the student's roll number or category and click **"Commit Audited Correction"**.
   - Notice that the record version increments, the change is saved in the database, and an immutable audit event is recorded.
7. **AICTE Admin Investigation & Decision**:
   - Switch persona to **AICTE National Admin** (`admin@aicte.gov.in`).
   - View the national dashboard with real-time Recharts capacity charts and state distribution.
   - Click on **Intake Compliance** (`/aicte/compliance`).
   - Open Eastern Institute's active CSE violation case. Inspect the AICTE evidence breakdown (180 approved, 186 observed, +6 excess).
   - Click **"Assign Reviewer"** and assign to an inquiry officer.
   - Click **"Record Ruling Decision"**, select `Issue Regulatory Warning & Conditional Regularization`, provide an official rationale, and click **"Commit Decision"**.
   - Notice the status immediately changes to **RESOLVED** and persists upon page refresh.
8. **Cross-Institution Conflict Graph**:
   - Click **Verification Queue** (`/aicte/verification-queue`).
   - View student candidate **Rajeshwar Kulkarni** (APAAR `9123 **** 8901`) flagged for concurrent active enrolment at both **Apex Institute** (Maharashtra) and **Deccan College** (Karnataka).
   - Review the regulatory options: "Request Clarification", "Mark as Legitimate Transfer", or "Confirm Duplicate".
9. **Audit Trail**:
   - Navigate to **Audit Trail** (`/aicte/audit-logs`) to review the complete, chronological append-only audit trail verifying every action taken during the demo.

---

## 7. Automated Test Suite Results

Run `python -m pytest tests/ -v` inside the `backend` directory:

```text
============================= test session starts =============================
platform win32 -- Python 3.14.2, pytest-9.0.2

tests/test_apaarsetu.py::test_health_check PASSED                        [ 12%]
tests/test_apaarsetu.py::test_demo_login_aicte_admin PASSED              [ 25%]
tests/test_apaarsetu.py::test_demo_login_institution_admin PASSED        [ 37%]
tests/test_apaarsetu.py::test_format_validation_engine PASSED            [ 50%]
tests/test_apaarsetu.py::test_intake_compliance_calculation PASSED       [ 62%]
tests/test_apaarsetu.py::test_digital_signature_and_tamper_detection PASSED [ 75%]
tests/test_apaarsetu.py::test_public_verification_endpoint PASSED        [ 87%]
tests/test_apaarsetu.py::test_compliance_decision_workflow PASSED        [100%]

======================= 8 passed, 0 failed in 1.14s ===========================
```

---

## 8. Regulatory Integrity & Production Readiness

1. **Simulation Adapter Distinction**: In strict accordance with SIH ethics and government regulatory standards, external APAAR verification is marked as `PENDING_EXTERNAL_VERIFICATION` / simulated adapter rather than falsely claiming live connectivity to official UIDAI/DigiLocker servers without formal statutory sanction.
2. **Privacy by Design**: Sensitive APAAR identifiers are masked in all frontend views and stored as keyed HMAC-SHA256 lookup fingerprints to prevent database enumeration while preserving indexed cross-institution lookup capability.
3. **Data Minimization**: Authorized background verification endpoints only return minimal academic claims (name, institution, program, admission year, enrolment status) and never leak raw demographic or personal identifiers.
