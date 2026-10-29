from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.database import engine, Base
from app.routers import (
    auth, institutions, programs, students, submissions,
    compliance, verification, analytics, reports, audit
)

# Create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="Regulatory intelligence, student data management, and APAAR verification platform for AICTE-approved institutions.",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # In development prototype, allow frontend requests
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers under /api/v1
app.include_router(auth.router, prefix=settings.API_V1_STR)
app.include_router(institutions.router, prefix=settings.API_V1_STR)
app.include_router(programs.router, prefix=settings.API_V1_STR)
app.include_router(students.router, prefix=settings.API_V1_STR)
app.include_router(submissions.router, prefix=settings.API_V1_STR)
app.include_router(compliance.router, prefix=settings.API_V1_STR)
app.include_router(verification.router, prefix=settings.API_V1_STR)
app.include_router(analytics.router, prefix=settings.API_V1_STR)
app.include_router(reports.router, prefix=settings.API_V1_STR)
app.include_router(audit.router, prefix=settings.API_V1_STR)

@app.get("/")
def root():
    return {
        "platform": settings.PROJECT_NAME,
        "tagline": "One Academic Identity. Verified Records. Smarter Governance.",
        "version": "1.0.0",
        "docs": "/docs",
        "api_v1": settings.API_V1_STR
    }

@app.get("/api/health")
def health_check():
    return {"status": "healthy", "service": "APAARSetu-API"}
