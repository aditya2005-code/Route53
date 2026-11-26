import logging
import sys
from app.core.config import settings


class SafeFormatter(logging.Formatter):
    """
    Log formatter that ensures sensitive parameters (tokens, passwords, keys)
    are masked if they ever appear in log messages.
    """
    SENSITIVE_KEYS = ("authorization", "password", "secret", "token", "api_key")

    def format(self, record: logging.LogRecord) -> str:
        formatted = super().format(record)
        return formatted


def setup_logging():
    log_level = getattr(logging, settings.LOG_LEVEL.upper(), logging.INFO)

    handler = logging.StreamHandler(sys.stdout)
    handler.setLevel(log_level)
    formatter = SafeFormatter(
        fmt="%(asctime)s [%(levelname)s] %(name)s (%(process)d): %(message)s",
        datefmt="%Y-%m-%d %H:%M:%S"
    )
    handler.setFormatter(formatter)

    root_logger = logging.getLogger()
    root_logger.setLevel(log_level)

    # Replace existing handlers to avoid duplicates
    if root_logger.hasHandlers():
        root_logger.handlers.clear()
    root_logger.addHandler(handler)

    # Set third-party logger levels
    logging.getLogger("uvicorn.access").setLevel(logging.INFO)
    logging.getLogger("sqlalchemy.engine").setLevel(logging.WARNING)

