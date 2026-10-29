from pydantic_settings import BaseSettings
from typing import Optional
import os

class Settings(BaseSettings):
    PROJECT_NAME: str = "APAARSetu - National Academic Identity & Verification Platform"
    API_V1_STR: str = "/api/v1"
    SECRET_KEY: str = os.getenv("SECRET_KEY", "apaarsetu-dev-secret-key-32-chars-long-secure-random")
    HMAC_SALT_KEY: str = os.getenv("HMAC_SALT_KEY", "apaarsetu-hmac-salt-key-secure-2026")
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./apaarsetu.db")
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 # 24 hours for demo
    ENVIRONMENT: str = os.getenv("ENVIRONMENT", "development")

    class Config:
        case_sensitive = True

settings = Settings()
