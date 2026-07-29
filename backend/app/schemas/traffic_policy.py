from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, Field, ConfigDict, field_validator
from app.constants.traffic_policy import RoutingType, PolicyStatus


# ─────────────────────────────────────────────────────────────────────────────
# Rule Schemas
# ─────────────────────────────────────────────────────────────────────────────

class TrafficPolicyRuleBase(BaseModel):
    record_name: str = Field(..., min_length=1, max_length=255, description="Subdomain name for the rule")
    record_type: str = Field(..., min_length=1, max_length=50, description="DNS record type (e.g. A, CNAME)")
    value: str = Field(..., min_length=1, max_length=1024, description="Routing target value")
    ttl: int = Field(..., gt=0, description="Time to live in seconds")
    weight: Optional[int] = Field(default=None, ge=0, le=255, description="Weighted routing weight (0-255)")
    region: Optional[str] = Field(default=None, max_length=100, description="Geolocation routing region")
    failover_role: Optional[str] = Field(default=None, max_length=50, description="Failover routing role (PRIMARY/SECONDARY)")
    health_check_id: Optional[str] = Field(default=None, max_length=100, description="Associated health check ID")

    @field_validator("record_name")
    @classmethod
    def validate_record_name(cls, v: str) -> str:
        trimmed = v.strip()
        if not trimmed:
            raise ValueError("record_name cannot be empty or whitespace only")
        return trimmed

    @field_validator("record_type")
    @classmethod
    def validate_record_type(cls, v: str) -> str:
        trimmed = v.strip().upper()
        if not trimmed:
            raise ValueError("record_type cannot be empty or whitespace only")
        return trimmed

    @field_validator("value")
    @classmethod
    def validate_value(cls, v: str) -> str:
        trimmed = v.strip()
        if not trimmed:
            raise ValueError("value cannot be empty or whitespace only")
        return trimmed


class TrafficPolicyRuleCreate(TrafficPolicyRuleBase):
    pass


class TrafficPolicyRuleResponse(TrafficPolicyRuleBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    version_id: int
    created_at: datetime


# ─────────────────────────────────────────────────────────────────────────────
# Version Schemas
# ─────────────────────────────────────────────────────────────────────────────

class TrafficPolicyVersionBase(BaseModel):
    version_number: int = Field(..., ge=1, description="Version number")


class TrafficPolicyVersionCreate(TrafficPolicyVersionBase):
    pass


class TrafficPolicyVersionResponse(TrafficPolicyVersionBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    policy_id: int
    created_at: datetime
    rules: List[TrafficPolicyRuleResponse] = Field(default=[])


# ─────────────────────────────────────────────────────────────────────────────
# Instance Schemas
# ─────────────────────────────────────────────────────────────────────────────

class TrafficPolicyInstanceBase(BaseModel):
    hosted_zone_id: int = Field(..., description="ID of the associated hosted zone")
    dns_name: str = Field(..., min_length=1, max_length=255, description="DNS name for the policy instance")

    @field_validator("dns_name")
    @classmethod
    def validate_dns_name(cls, v: str) -> str:
        trimmed = v.strip()
        if not trimmed:
            raise ValueError("dns_name cannot be empty or whitespace only")
        return trimmed


class TrafficPolicyInstanceCreate(TrafficPolicyInstanceBase):
    pass


class TrafficPolicyInstanceResponse(TrafficPolicyInstanceBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    policy_id: int
    created_at: datetime


# ─────────────────────────────────────────────────────────────────────────────
# Traffic Policy Schemas
# ─────────────────────────────────────────────────────────────────────────────

class TrafficPolicyBase(BaseModel):
    name: Optional[str] = Field(default=None, min_length=1, max_length=100, description="Traffic policy name")
    description: Optional[str] = Field(default=None, max_length=500, description="Traffic policy description")
    routing_type: Optional[RoutingType] = Field(default=None, description="Routing type")
    status: Optional[PolicyStatus] = Field(default=None, description="Policy status")

    @field_validator("name")
    @classmethod
    def validate_name(cls, v: Optional[str]) -> Optional[str]:
        if v is not None:
            trimmed = v.strip()
            if not trimmed:
                raise ValueError("Name cannot be empty or whitespace only")
            return trimmed
        return v

    @field_validator("description")
    @classmethod
    def validate_description(cls, v: Optional[str]) -> Optional[str]:
        if v is not None:
            return v.strip()
        return v


class TrafficPolicyCreate(TrafficPolicyBase):
    name: str = Field(..., min_length=1, max_length=100, description="Traffic policy name")
    routing_type: RoutingType = Field(..., description="Routing type")
    status: PolicyStatus = Field(default=PolicyStatus.ACTIVE, description="Policy status")


class TrafficPolicyUpdate(TrafficPolicyBase):
    pass


class TrafficPolicyResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    user_id: int
    name: str
    description: Optional[str]
    routing_type: RoutingType
    status: PolicyStatus
    current_version: int
    created_at: datetime
    updated_at: datetime
    versions: List[TrafficPolicyVersionResponse] = Field(default=[])
    instances: List[TrafficPolicyInstanceResponse] = Field(default=[])


class TrafficPolicyListResponse(BaseModel):
    items: List[TrafficPolicyResponse]
    total: int
    page: int
    page_size: int
