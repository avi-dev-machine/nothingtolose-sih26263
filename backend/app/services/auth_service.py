import jwt
from datetime import datetime, timedelta
from typing import Optional, List
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from app.config import settings
from app.database import get_db
from app.models import User, Institution

security = HTTPBearer(auto_error=False)

class AuthService:
    @staticmethod
    def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
        to_encode = data.copy()
        if expires_delta:
            expire = datetime.utcnow() + expires_delta
        else:
            expire = datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
        to_encode.update({"exp": expire})
        encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.JWT_ALGORITHM)
        return encoded_jwt

    @staticmethod
    def decode_token(token: str) -> dict:
        try:
            payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.JWT_ALGORITHM])
            return payload
        except jwt.PyJWTError:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid or expired authentication credentials",
                headers={"WWW-Authenticate": "Bearer"},
            )

def get_current_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security),
    db: Session = Depends(get_db)
) -> User:
    if not credentials:
        # Check for demo fallback header if testing locally without auth header
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication token required. Please log in via Demo Accounts.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    payload = AuthService.decode_token(credentials.credentials)
    user_id: str = payload.get("sub")
    if not user_id:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token payload")
    
    user = db.query(User).filter(User.id == user_id, User.is_active == True).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User account not found or inactive")
    return user

def require_role(allowed_roles: List[str]):
    def role_checker(current_user: User = Depends(get_current_user)):
        if current_user.role not in allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Access denied. Required roles: {', '.join(allowed_roles)}. Your role: {current_user.role}"
            )
        return current_user
    return role_checker

def enforce_institution_isolation(user: User, institution_id: Optional[str]) -> str:
    """
    Enforces strict tenant isolation:
    - AICTE_ADMIN can access any institution (or all).
    - INSTITUTION_ADMIN can ONLY access their own institution.
    """
    if user.role == "AICTE_ADMIN":
        return institution_id or ""
    
    if user.role == "INSTITUTION_ADMIN":
        if not user.institution_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Institution administrator has no assigned institution."
            )
        if institution_id and user.institution_id != institution_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access Denied: You do not have permission to access or modify records of another institution."
            )
        return user.institution_id

    raise HTTPException(
        status_code=status.HTTP_403_FORBIDDEN,
        detail="Unauthorized role for institutional data access."
    )
