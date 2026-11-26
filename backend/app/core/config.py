import os
import logging
from typing import Optional
from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import Field, AliasChoices, field_validator

logger = logging.getLogger("route53.config")


class Settings(BaseSettings):
    # Environment mode: development, staging, production, test
    ENVIRONMENT: str = Field(default="development")

    # The database connection string (supports SQLite or PostgreSQL)
    DATABASE_URL: str = Field(default="sqlite:///./route53.db")

    # Connection pooling settings (for PostgreSQL)
    DB_POOL_SIZE: int = Field(default=10)
    DB_MAX_OVERFLOW: int = Field(default=20)
    DB_POOL_RECYCLE: int = Field(default=1800)  # 30 minutes

    # Secret keys for auth (configured to allow fallback to JWT_* env vars)
    SECRET_KEY: str = Field(
        default="route53clone_secret_key_change_me_in_production",
        validation_alias=AliasChoices("JWT_SECRET_KEY", "SECRET_KEY")
    )
    ALGORITHM: str = Field(
        default="HS256",
        validation_alias=AliasChoices("JWT_ALGORITHM", "ALGORITHM")
    )
    ACCESS_TOKEN_EXPIRE_MINUTES: int = Field(default=60)

    # CORS configuration (comma separated origins)
    ALLOWED_ORIGINS: str = Field(
        default="http://localhost:3000,http://127.0.0.1:3000,https://route53-beryl.vercel.app"
    )

    # OpenAI configuration
    OPENAI_API_KEY: Optional[str] = Field(default=None)
    OPENAI_MODEL: str = Field(default="gpt-4o-mini")

    # Rate Limiting (requests per minute per client IP)
    RATE_LIMIT_ENABLED: bool = Field(default=True)
    RATE_LIMIT_AUTH_PER_MINUTE: int = Field(default=15)
    RATE_LIMIT_AI_PER_MINUTE: int = Field(default=20)

    # Logging
    LOG_LEVEL: str = Field(default="INFO")

    @field_validator("DATABASE_URL", mode="before")
    @classmethod
    def normalize_database_url(cls, v: str) -> str:
        """
        Normalize postgres:// to postgresql:// as required by SQLAlchemy 2.0.
        Cloud providers (Render, Heroku, Supabase) often supply legacy postgres:// URIs.
        """
        if isinstance(v, str) and v.startswith("postgres://"):
            return v.replace("postgres://", "postgresql://", 1)
        return v

    @property
    def is_production(self) -> bool:
        return self.ENVIRONMENT.lower() in ("production", "prod")

    @property
    def is_testing(self) -> bool:
        return self.ENVIRONMENT.lower() in ("test", "testing")

    def model_post_init(self, __context) -> None:
        self.validate_production_safety()

    def validate_production_safety(self) -> None:
        """
        Fails fast if insecure placeholder secrets are active in production environment.
        """
        if self.is_production:
            insecure_defaults = {
                "route53clone_secret_key_change_me_in_production",
                "9d8b1f0c7e5a4d3f2b6c8e1a9f7d5b3c4a6e8f1d2c9b7a5e3f8d6c1b4a9e7f2",
                "default_secret_key_change_in_production",
                "your_super_secret_key_change_in_production",
                "secret",
            }
            if self.SECRET_KEY in insecure_defaults or len(self.SECRET_KEY) < 32:
                raise ValueError(
                    "CRITICAL: Insecure or default SECRET_KEY detected in PRODUCTION environment. "
                    "Set a secure, high-entropy JWT_SECRET_KEY (minimum 32 characters) via environment variables."
                )

    # Tell Pydantic Settings to read from .env file
    model_config = SettingsConfigDict(
        env_file=os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), ".env"),
        env_file_encoding="utf-8",
        extra="ignore"
    )


settings = Settings()
# Execute safety check on load
settings.validate_production_safety()
