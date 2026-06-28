import sys
import os
from logging.config import fileConfig

from sqlalchemy import engine_from_config, pool
from alembic import context

# ---------------------------------------------------------------------------
# 1. Add the backend root to sys.path so our app package is importable
# ---------------------------------------------------------------------------
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# ---------------------------------------------------------------------------
# 2. Import our application settings to get the DATABASE_URL dynamically.
#    This keeps Alembic in sync with the rest of our application config.
# ---------------------------------------------------------------------------
from app.core.config import settings

# ---------------------------------------------------------------------------
# 3. Import Base AND all models so that SQLAlchemy registers their table
#    schemas in Base.metadata. Without these imports, autogenerate will
#    produce an empty migration because metadata will be empty.
# ---------------------------------------------------------------------------
from app.db.database import Base
from app.models.user import User            # noqa: F401 - registers User table
from app.models.hosted_zone import HostedZone  # noqa: F401 - registers HostedZone table
from app.models.dns_record import DNSRecord    # noqa: F401 - registers DNSRecord table

# ---------------------------------------------------------------------------
# Alembic Config object — provides access to values in alembic.ini
# ---------------------------------------------------------------------------
config = context.config

# Interpret the config file for Python logging
if config.config_file_name is not None:
    fileConfig(config.config_file_name)

# ---------------------------------------------------------------------------
# 4. Point Alembic at our metadata so autogenerate can diff the schema
# ---------------------------------------------------------------------------
target_metadata = Base.metadata

# ---------------------------------------------------------------------------
# 5. Override the sqlalchemy.url with the value from our Settings class.
#    This ensures .env drives all configuration, not alembic.ini.
# ---------------------------------------------------------------------------
config.set_main_option("sqlalchemy.url", settings.DATABASE_URL)


def run_migrations_offline() -> None:
    """
    Run migrations in 'offline' mode.
    In this mode, Alembic generates SQL scripts without connecting to the
    database. Useful for reviewing changes before applying them.
    """
    url = config.get_main_option("sqlalchemy.url")
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
    )

    with context.begin_transaction():
        context.run_migrations()


def run_migrations_online() -> None:
    """
    Run migrations in 'online' mode.
    In this mode, Alembic connects to the database directly and applies
    migrations immediately.
    """
    connectable = engine_from_config(
        config.get_section(config.config_ini_section, {}),
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
    )

    with connectable.connect() as connection:
        context.configure(
            connection=connection,
            target_metadata=target_metadata
        )

        with context.begin_transaction():
            context.run_migrations()


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
