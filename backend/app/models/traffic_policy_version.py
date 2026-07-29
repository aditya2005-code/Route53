from datetime import datetime
from typing import List, TYPE_CHECKING
from sqlalchemy import Integer, DateTime, ForeignKey, func, Index
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.database import Base

if TYPE_CHECKING:
    from app.models.traffic_policy import TrafficPolicy
    from app.models.traffic_policy_rule import TrafficPolicyRule

class TrafficPolicyVersion(Base):
    __tablename__ = "traffic_policy_versions"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    policy_id: Mapped[int] = mapped_column(Integer, ForeignKey("traffic_policies.id", ondelete="CASCADE"), nullable=False)
    version_number: Mapped[int] = mapped_column(Integer, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=func.now())

    # Many-to-One Relationship: TrafficPolicyVersion -> TrafficPolicy
    policy: Mapped["TrafficPolicy"] = relationship("TrafficPolicy", back_populates="versions")

    # One-to-Many Relationship: TrafficPolicyVersion -> TrafficPolicyRule
    # Cascade delete when parent policy version is removed
    rules: Mapped[List["TrafficPolicyRule"]] = relationship(
        "TrafficPolicyRule",
        back_populates="version",
        cascade="all, delete-orphan"
    )

    __table_args__ = (
        Index("ix_traffic_policy_versions_policy_id", "policy_id"),
    )
