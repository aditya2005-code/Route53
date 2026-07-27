from datetime import datetime
from typing import List, TYPE_CHECKING
from sqlalchemy import Integer, String, DateTime, ForeignKey, func, Enum as SQLEnum, Index
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.database import Base
from app.constants.traffic_policy import RoutingType, PolicyStatus

if TYPE_CHECKING:
    from app.models.user import User
    from app.models.traffic_policy_version import TrafficPolicyVersion
    from app.models.traffic_policy_instance import TrafficPolicyInstance

class TrafficPolicy(Base):
    __tablename__ = "traffic_policies"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    user_id: Mapped[int] = mapped_column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    description: Mapped[str | None] = mapped_column(String(500), nullable=True)
    routing_type: Mapped[RoutingType] = mapped_column(SQLEnum(RoutingType), nullable=False)
    status: Mapped[PolicyStatus] = mapped_column(SQLEnum(PolicyStatus), nullable=False)
    current_version: Mapped[int] = mapped_column(Integer, default=1, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=func.now(), onupdate=func.now())

    # Many-to-One Relationship: TrafficPolicy -> User
    user: Mapped["User"] = relationship("User", back_populates="traffic_policies")

    # One-to-Many Relationship: TrafficPolicy -> TrafficPolicyVersion
    # Cascade delete when parent policy is removed
    versions: Mapped[List["TrafficPolicyVersion"]] = relationship(
        "TrafficPolicyVersion",
        back_populates="policy",
        cascade="all, delete-orphan"
    )

    # One-to-Many Relationship: TrafficPolicy -> TrafficPolicyInstance
    # Cascade delete when parent policy is removed
    instances: Mapped[List["TrafficPolicyInstance"]] = relationship(
        "TrafficPolicyInstance",
        back_populates="policy",
        cascade="all, delete-orphan"
    )

    # Policy name should later be unique per user
    # TODO: Implement UniqueConstraint("user_id", "name", name="uq_traffic_policies_user_name")
    __table_args__ = (
        Index("ix_traffic_policies_user_id", "user_id"),
        Index("ix_traffic_policies_name", "name"),
    )
