from sqlalchemy.orm import Session
from datetime import datetime
from typing import Dict, Any, Optional
from app.models import AuditEvent

class AuditService:
    @staticmethod
    def log_event(
        db: Session,
        actor_id: str,
        actor_role: str,
        action: str,
        resource_type: str,
        resource_id: str,
        outcome: str = "SUCCESS",
        metadata: Optional[Dict[str, Any]] = None,
        institution_id: Optional[str] = None
    ) -> AuditEvent:
        """
        Creates an immutable audit log entry.
        Never stores private keys, plain passwords or unnecessary PII.
        """
        sanitized = None
        if metadata:
            sanitized = {k: v for k, v in metadata.items() if not any(x in k.lower() for x in ["password", "secret", "token", "key"])}

        event = AuditEvent(
            actor_id=actor_id,
            actor_role=actor_role,
            institution_id=institution_id,
            action=action,
            resource_type=resource_type,
            resource_id=str(resource_id),
            outcome=outcome,
            sanitized_metadata=sanitized,
            timestamp=datetime.utcnow()
        )
        db.add(event)
        db.commit()
        db.refresh(event)
        return event

audit_service = AuditService()
