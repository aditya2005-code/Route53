import os
from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import Field

class Settings(BaseSettings):
    # The database connection string
    DATABASE_URL: str = Field(default="sqlite:///./route53.db")

    # Secret key — reads JWT_SECRET_KEY from .env
    SECRET_KEY: str = Field(
        default="route53clone_secret_key_change_me_in_production",
        alias="JWT_SECRET_KEY"
    )
    # Algorithm — reads JWT_ALGORITHM from .env
    ALGORITHM: str = Field(default="HS256", alias="JWT_ALGORITHM")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = Field(default=60)

    # Tell Pydantic Settings to read from .env file
    model_config = SettingsConfigDict(
        env_file=os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), ".env"),
        env_file_encoding="utf-8",
        extra="ignore",
        populate_by_name=True,  # allows usage by field name OR alias
    )

settings = Settings()
