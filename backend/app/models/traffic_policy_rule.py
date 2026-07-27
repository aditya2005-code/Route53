from datetime import datetime
from typing import TYPE_CHECKING
from sqlalchemy import Integer, String, DateTime, ForeignKey, func
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.database import Base

if TYPE_CHECKING:
    from app.models.traffic_policy_version import TrafficPolicyVersion

class TrafficPolicyRule(Base):
    __tablename__ = "traffic_policy_rules"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    version_id: Mapped[int] = mapped_column(Integer, ForeignKey("traffic_policy_versions.id", ondelete="CASCADE"), nullable=False)
    record_name: Mapped[str] = mapped_column(String(255), nullable=False)
    record_type: Mapped[str] = mapped_column(String(50), nullable=False)
    value: Mapped[str] = mapped_column(String(1024), nullable=False)
    ttl: Mapped[int] = mapped_column(Integer, default=300, nullable=False)
    weight: Mapped[int | None] = mapped_column(Integer, nullable=True)
    region: Mapped[str | None] = mapped_column(String(100), nullable=True)
    failover_role: Mapped[str | None] = mapped_column(String(50), nullable=True)
    health_check_id: Mapped[str | None] = mapped_column(String(100), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=func.now())

    # Many-to-One Relationship: TrafficPolicyRule -> TrafficPolicyVersion
    version: Mapped["TrafficPolicyVersion"] = relationship("TrafficPolicyVersion", back_populates="rules")
from app.db.database import Base

class TrafficPolicyRule(Base):
    __tablename__ = "traffic_policy_rules"

    # TODO: Add columns
