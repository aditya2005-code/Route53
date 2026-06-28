from datetime import datetime
from typing import TYPE_CHECKING
from sqlalchemy import Integer, String, DateTime, ForeignKey, func
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.database import Base

if TYPE_CHECKING:
    from app.models.hosted_zone import HostedZone

class DNSRecord(Base):
    __tablename__ = "dns_records"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    hosted_zone_id: Mapped[int] = mapped_column(Integer, ForeignKey("hosted_zones.id", ondelete="CASCADE"), nullable=False)
    record_name: Mapped[str] = mapped_column(String(255), nullable=False)
    record_type: Mapped[str] = mapped_column(String(50), nullable=False)
    value: Mapped[str] = mapped_column(String(1024), nullable=False)
    ttl: Mapped[int] = mapped_column(Integer, default=300, nullable=False)
    priority: Mapped[int | None] = mapped_column(Integer, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=func.now(), onupdate=func.now())

    # Many-to-One Relationship: DNSRecord -> HostedZone
    hosted_zone: Mapped["HostedZone"] = relationship("HostedZone", back_populates="dns_records")
