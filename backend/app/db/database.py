import logging
from sqlalchemy import create_engine, text
from sqlalchemy.orm import declarative_base, sessionmaker, DeclarativeBase
from app.core.config import settings

logger = logging.getLogger("route53.database")

# 1. Create the SQLAlchemy Engine with production connection pooling
engine_kwargs = {}

if settings.DATABASE_URL.startswith("sqlite"):
    # SQLite connection configuration
    engine_kwargs["connect_args"] = {"check_same_thread": False}
else:
    # PostgreSQL production connection pooling:
    # - pool_size: number of persistent connections kept open
    # - max_overflow: maximum surge connections allowed beyond pool_size
    # - pool_pre_ping: validates connections are live before checkout (prevents broken pipe / dropped SSL)
    # - pool_recycle: recycles connections periodically to avoid server-side timeouts
    engine_kwargs.update({
        "pool_size": settings.DB_POOL_SIZE,
        "max_overflow": settings.DB_MAX_OVERFLOW,
        "pool_pre_ping": True,
        "pool_recycle": settings.DB_POOL_RECYCLE,
    })

engine = create_engine(settings.DATABASE_URL, **engine_kwargs)

# 2. Configure the SessionLocal class
SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine
)

# 3. Create the Declarative Base class
class Base(DeclarativeBase):
    pass


def check_database_health() -> bool:
    """
    Executes a fast probe query ('SELECT 1') to verify database connectivity.
    Returns True if healthy, False if connection fails.
    """
    try:
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
        return True
    except Exception as e:
        logger.error(f"Database health probe failed: {e}")
        return False
