import os
from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import Field

class Settings(BaseSettings):
    # The database connection string
    DATABASE_URL: str = Field(default="sqlite:///./route53.db")
    
    # Secret keys for auth (will be used later, but declared here for completeness)
    SECRET_KEY: str = Field(default="route53clone_secret_key_change_me_in_production")
    ALGORITHM: str = Field(default="HS256")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = Field(default=30)

    # Tell Pydantic Settings to read from .env file
    model_config = SettingsConfigDict(
        env_file=os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), ".env"),
        env_file_encoding="utf-8",
        extra="ignore"  # ignores other environment variables not defined here
    )

settings = Settings()
