from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker, DeclarativeBase
from app.core.config import settings

# 1. Create the SQLAlchemy Engine
# For SQLite, we disable same-thread checks because FastAPI works with concurrent threads.
# In production with Postgres, connect_args is not needed.
engine = create_engine(
    settings.DATABASE_URL,
    connect_args={"check_same_thread": False} if settings.DATABASE_URL.startswith("sqlite") else {}
)

# 2. Configure the SessionLocal class
# Each instance of SessionLocal will represent a single database transaction session.
SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine
)

# 3. Create the Declarative Base class
# All database models will inherit from this Base.
# Using the SQLAlchemy 2.0 style of DeclarativeBase class.
class Base(DeclarativeBase):
    pass
