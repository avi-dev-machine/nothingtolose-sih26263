from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import Dict, Any
from app.database import get_db
from app.models import User, Institution
from app.schemas import DemoLoginRequest, TokenResponse, UserResponse
from app.services.auth_service import AuthService, get_current_user
from app.services.audit_service import audit_service

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/demo-login", response_model=TokenResponse)
def demo_login(req: DemoLoginRequest, db: Session = Depends(get_db)):
    """
    Demo login endpoint providing authentic JWT tokens for 4 primary roles.
    Includes Eastern Institute of Technology (featured institution) and Apex Institute.
    """
    query = db.query(User).filter(User.role == req.role)
    if req.email:
        query = query.filter(User.email == req.email)
    elif req.institution_id:
        query = query.filter(User.institution_id == req.institution_id)
    
    user = query.first()
    if not user:
        # Fallback to any user with that role
        user = db.query(User).filter(User.role == req.role).first()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"No demo user configured for role {req.role}"
        )

    inst_name = None
    if user.institution_id:
        inst = db.query(Institution).filter(Institution.id == user.institution_id).first()
        if inst:
            inst_name = inst.name

    token = AuthService.create_access_token({
        "sub": user.id,
        "role": user.role,
        "email": user.email,
        "institution_id": user.institution_id
    })

    audit_service.log_event(
        db=db,
        actor_id=user.id,
        actor_role=user.role,
        action="USER_LOGIN",
        resource_type="USER",
        resource_id=user.id,
        outcome="SUCCESS",
        metadata={"email": user.email, "role": user.role},
        institution_id=user.institution_id
    )

    return TokenResponse(
        access_token=token,
        token_type="bearer",
        role=user.role,
        email=user.email,
        full_name=user.full_name,
        institution_id=user.institution_id,
        institution_name=inst_name
    )

@router.get("/me", response_model=UserResponse)
def get_me(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    inst_name = None
    if current_user.institution_id:
        inst = db.query(Institution).filter(Institution.id == current_user.institution_id).first()
        if inst:
            inst_name = inst.name

    return UserResponse(
        id=current_user.id,
        email=current_user.email,
        full_name=current_user.full_name,
        role=current_user.role,
        institution_id=current_user.institution_id,
        institution_name=inst_name
    )

@router.post("/logout")
def logout(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    audit_service.log_event(
        db=db,
        actor_id=current_user.id,
        actor_role=current_user.role,
        action="USER_LOGOUT",
        resource_type="USER",
        resource_id=current_user.id,
        outcome="SUCCESS",
        institution_id=current_user.institution_id
    )
    return {"message": "Successfully logged out"}
