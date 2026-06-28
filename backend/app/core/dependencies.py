from typing import Generator
from sqlalchemy.orm import Session
from app.db.database import SessionLocal

def get_db() -> Generator[Session, None, None]:
    """
    FastAPI dependency that provides a transactional database session.
    Guarantees that the session is closed after the request is finished,
    even if an exception occurs during request processing.
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
