from datetime import datetime
from typing import List, TYPE_CHECKING
from sqlalchemy import Integer, String, DateTime, func
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.database import Base

if TYPE_CHECKING:
    from app.models.hosted_zone import HostedZone

class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True, nullable=False)
    password: Mapped[str] = mapped_column(String(255), nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=func.now(), onupdate=func.now())

    # One-to-Many Relationship: User -> HostedZones
    # cascade="all, delete-orphan" handles cleanups when a user is deleted.
    hosted_zones: Mapped[List["HostedZone"]] = relationship(
        "HostedZone",
        back_populates="owner",
        cascade="all, delete-orphan"
    )
