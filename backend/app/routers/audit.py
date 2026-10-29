from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from app.database import get_db
from app.models import AuditEvent, User
from app.schemas import AuditEventResponse
from app.services.auth_service import get_current_user, require_role

router = APIRouter(prefix="/audit-events", tags=["Auditability & Logs"])

@router.get("", response_model=List[AuditEventResponse])
def get_audit_events(
    action: Optional[str] = None,
    resource_type: Optional[str] = None,
    limit: int = Query(100, ge=1, le=500),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Chronological append-only audit trail for compliance and operations.
    """
    query = db.query(AuditEvent)

    if current_user.role == "INSTITUTION_ADMIN":
        query = query.filter(AuditEvent.institution_id == current_user.institution_id)

    if action:
        query = query.filter(AuditEvent.action == action)
    if resource_type:
        query = query.filter(AuditEvent.resource_type == resource_type)

    return query.order_by(AuditEvent.timestamp.desc()).limit(limit).all()
