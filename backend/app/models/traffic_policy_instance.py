from datetime import datetime
from typing import TYPE_CHECKING
from sqlalchemy import Integer, String, DateTime, ForeignKey, func, Index
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.database import Base

if TYPE_CHECKING:
    from app.models.traffic_policy import TrafficPolicy
    from app.models.hosted_zone import HostedZone

class TrafficPolicyInstance(Base):
    __tablename__ = "traffic_policy_instances"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    policy_id: Mapped[int] = mapped_column(Integer, ForeignKey("traffic_policies.id", ondelete="CASCADE"), nullable=False)
    hosted_zone_id: Mapped[int] = mapped_column(Integer, ForeignKey("hosted_zones.id", ondelete="CASCADE"), nullable=False)
    dns_name: Mapped[str] = mapped_column(String(255), nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=func.now())

    # Many-to-One Relationship: TrafficPolicyInstance -> TrafficPolicy
    policy: Mapped["TrafficPolicy"] = relationship("TrafficPolicy", back_populates="instances")

    # Many-to-One Relationship: TrafficPolicyInstance -> HostedZone
    hosted_zone: Mapped["HostedZone"] = relationship("HostedZone", back_populates="traffic_policy_instances")

    __table_args__ = (
        Index("ix_traffic_policy_instances_policy_id", "policy_id"),
        Index("ix_traffic_policy_instances_hosted_zone_id", "hosted_zone_id"),
    )
