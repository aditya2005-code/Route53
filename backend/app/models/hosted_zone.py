from datetime import datetime
from typing import List, TYPE_CHECKING
from sqlalchemy import Integer, String, DateTime, ForeignKey, func
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.database import Base

if TYPE_CHECKING:
    from app.models.user import User
    from app.models.dns_record import DNSRecord

class HostedZone(Base):
    __tablename__ = "hosted_zones"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    user_id: Mapped[int] = mapped_column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    domain_name: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[str | None] = mapped_column(String(500), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=func.now(), onupdate=func.now())

    # Many-to-One Relationship: HostedZone -> User
    owner: Mapped["User"] = relationship("User", back_populates="hosted_zones")

    # One-to-Many Relationship: HostedZone -> DNSRecords
    dns_records: Mapped[List["DNSRecord"]] = relationship(
        "DNSRecord",
        back_populates="hosted_zone",
        cascade="all, delete-orphan"
    )
