import os
from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import Field, AliasChoices

class Settings(BaseSettings):
    # The database connection string
    DATABASE_URL: str = Field(default="sqlite:///./route53.db")
    
    # Secret keys for auth (configured to allow fallback to JWT_* env vars)
    SECRET_KEY: str = Field(
        default="route53clone_secret_key_change_me_in_production",
        validation_alias=AliasChoices("JWT_SECRET_KEY", "SECRET_KEY")
    )
    ALGORITHM: str = Field(
        default="HS256",
        validation_alias=AliasChoices("JWT_ALGORITHM", "ALGORITHM")
    )
    ACCESS_TOKEN_EXPIRE_MINUTES: int = Field(default=30)

    # CORS configuration
    ALLOWED_ORIGINS: str = Field(default="http://localhost:3000,http://127.0.0.1:3000")

    # Tell Pydantic Settings to read from .env file
    model_config = SettingsConfigDict(
        env_file=os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), ".env"),
        env_file_encoding="utf-8",
        extra="ignore"  # ignores other environment variables not defined here
    )

settings = Settings()
