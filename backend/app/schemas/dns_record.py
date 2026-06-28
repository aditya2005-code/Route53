from datetime import datetime
from enum import Enum
from typing import Optional
from pydantic import BaseModel, Field, ConfigDict, model_validator
from typing_extensions import Self


# ─────────────────────────────────────────────────────────────────────────────
# RecordType Enum — defines all supported DNS record types.
#
# Why Enum and not Literal?
#   We use a str Enum so that:
#   1. The values are reusable across schemas, services, and repositories.
#   2. FastAPI auto-generates an OpenAPI dropdown for this field in Swagger UI.
#   3. Comparison is type-safe: RecordType.A == "A" works because str is the
#      mixin base class.
#
# Why inherit from (str, Enum)?
#   Makes the enum values JSON-serializable strings automatically.
#   Without str, FastAPI would serialize the enum as its Python repr,
#   not its string value.
# ─────────────────────────────────────────────────────────────────────────────
class RecordType(str, Enum):
    A     = "A"       # Maps hostname to IPv4 address
    AAAA  = "AAAA"   # Maps hostname to IPv6 address
    CNAME = "CNAME"  # Canonical name alias (hostname to hostname)
    TXT   = "TXT"    # Arbitrary text, used for SPF, DKIM, domain verification
    MX    = "MX"     # Mail exchange server (requires priority)
    NS    = "NS"     # Name server delegation record
    PTR   = "PTR"    # Reverse DNS lookup (IP to hostname)
    SRV   = "SRV"    # Service locator record (requires priority)
    CAA   = "CAA"    # Certificate Authority Authorization


# ─────────────────────────────────────────────────────────────────────────────
# DNSRecordCreate — validates data for creating a new DNS record.
#
# Fields:
#   record_name   → Required. The subdomain label (e.g. "@", "www", "mail").
#                   "@" means the root/apex of the hosted zone domain.
#   record_type   → Required. Must be one of the RecordType enum values.
#   value         → Required. The routing target (IP, domain, or text string).
#   ttl           → Optional. Defaults to 300 seconds (5 minutes).
#                   Range enforced: 60 seconds minimum, 86400 seconds maximum.
#                   60s minimum: prevents excessive DNS query floods.
#                   86400s maximum (24h): prevents records from being cached
#                   too long after updates.
#   priority      → Optional. Required only for MX and SRV record types.
#                   For all other types, this must be None.
#                   Cross-field validation is done in the model_validator.
#
# Why no 'hosted_zone_id' here?
#   The hosted_zone_id comes from the URL path parameter:
#   POST /hosted-zones/{zone_id}/records
#   This is standard RESTful design — resource hierarchy is expressed in the
#   URL, not duplicated in the request body.
# ─────────────────────────────────────────────────────────────────────────────
class DNSRecordCreate(BaseModel):
    record_name: str = Field(
        ...,
        min_length=1,
        max_length=255,
        description="Subdomain label. Use '@' for apex/root domain",
        examples=["@", "www", "mail", "api"]
    )
    record_type: RecordType = Field(
        ...,
        description="DNS record type (A, AAAA, CNAME, TXT, MX, NS, PTR, SRV, CAA)",
        examples=["A", "CNAME"]
    )
    value: str = Field(
        ...,
        min_length=1,
        max_length=1024,
        description="The record's routing target (IP address, hostname, or text)",
        examples=["192.0.2.1", "example.com", "v=spf1 include:_spf.google.com ~all"]
    )
    ttl: int = Field(
        default=300,
        ge=60,
        le=86400,
        description="Time To Live in seconds. Min: 60, Max: 86400 (24h)",
        examples=[300, 3600, 86400]
    )
    priority: Optional[int] = Field(
        default=None,
        ge=0,
        le=65535,
        description="Routing priority. Required for MX and SRV records only.",
        examples=[10, 20]
    )

    @model_validator(mode="after")
    def validate_priority_for_record_type(self) -> Self:
        """
        Cross-field validator: enforces the rule that priority is required
        for MX and SRV records, and must be absent for all other record types.

        Why model_validator instead of field_validator?
            Because this validation requires reading TWO fields simultaneously
            (record_type AND priority). field_validator only has access to
            one field at a time. model_validator runs after all field
            validators have passed and the full model is assembled.

        Why mode='after'?
            'after' means this validator runs after Pydantic has already
            validated and assigned all individual fields. This guarantees
            that self.record_type and self.priority are already valid values
            when this cross-check runs.
        """
        requires_priority = {RecordType.MX, RecordType.SRV}

        if self.record_type in requires_priority and self.priority is None:
            raise ValueError(
                f"'priority' is required for {self.record_type.value} records. "
                "Standard values: 10 (highest priority), 20, 30... (lower priority)"
            )

        if self.record_type not in requires_priority and self.priority is not None:
            raise ValueError(
                f"'priority' must not be set for {self.record_type.value} records. "
                "Priority is only valid for MX and SRV record types."
            )

        return self


# ─────────────────────────────────────────────────────────────────────────────
# DNSRecordUpdate — validates data for partially updating a DNS record.
#
# All fields are Optional for the same reason as HostedZoneUpdate:
# PATCH semantics — send only what you want to change.
#
# The model_validator here only runs the cross-field priority check if BOTH
# fields are being updated simultaneously. This handles three cases:
#   1. Updating only the value → allowed, no priority check needed.
#   2. Updating record_type to MX without priority → raises error.
#   3. Updating priority without record_type → service layer handles this.
# ─────────────────────────────────────────────────────────────────────────────
class DNSRecordUpdate(BaseModel):
    record_name: Optional[str] = Field(
        default=None,
        min_length=1,
        max_length=255,
        description="New subdomain label",
        examples=["www", "api"]
    )
    record_type: Optional[RecordType] = Field(
        default=None,
        description="New DNS record type",
        examples=["CNAME"]
    )
    value: Optional[str] = Field(
        default=None,
        min_length=1,
        max_length=1024,
        description="New routing target value",
        examples=["203.0.113.5"]
    )
    ttl: Optional[int] = Field(
        default=None,
        ge=60,
        le=86400,
        description="New TTL in seconds",
        examples=[600]
    )
    priority: Optional[int] = Field(
        default=None,
        ge=0,
        le=65535,
        description="New priority (MX/SRV only)",
        examples=[10]
    )

    @model_validator(mode="after")
    def validate_priority_consistency(self) -> Self:
        """
        If both record_type and priority are being updated together in the
        same PATCH request, we apply the same priority constraint as Create.
        """
        if self.record_type is None:
            return self  # No record_type change — service layer handles

        requires_priority = {RecordType.MX, RecordType.SRV}

        if self.record_type in requires_priority and self.priority is None:
            raise ValueError(
                f"When changing record type to {self.record_type.value}, "
                "'priority' must also be provided in the same request."
            )

        if self.record_type not in requires_priority and self.priority is not None:
            raise ValueError(
                f"{self.record_type.value} records do not use 'priority'. "
                "Remove 'priority' from the request."
            )

        return self


# ─────────────────────────────────────────────────────────────────────────────
# DNSRecordResponse — shape of DNS record data returned to the client.
#
# All fields are included because there is no sensitive data in DNS records.
# 'hosted_zone_id' is included to allow the client to navigate back to the
# parent zone without additional lookups.
# ─────────────────────────────────────────────────────────────────────────────
class DNSRecordResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    hosted_zone_id: int
    record_name: str
    record_type: RecordType
    value: str
    ttl: int
    priority: Optional[int]
    created_at: datetime
    updated_at: datetime
