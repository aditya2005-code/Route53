from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field, ConfigDict, field_validator
import re


# ─────────────────────────────────────────────────────────────────────────────
# HostedZoneCreate — validates data for creating a new hosted zone.
#
# Fields:
#   domain_name → Required. The fully-qualified domain name (e.g. "example.com").
#   description → Optional. A human-readable note about this zone.
#
# Why no 'user_id' here?
#   The user_id is extracted from the authenticated JWT token in the service
#   layer. Accepting user_id from the request body would be a security flaw —
#   any client could forge ownership of zones belonging to other users.
#
# Domain name validation:
#   We validate the domain against the standard RFC-1123 hostname pattern.
#   This is a schema-level validation because it doesn't require a DB lookup.
# ─────────────────────────────────────────────────────────────────────────────

# RFC-1123 domain name pattern (e.g. "example.com", "sub.example.co.uk")
_DOMAIN_PATTERN = re.compile(
    r"^(?:[a-zA-Z0-9]"           # First character of each label: alphanumeric
    r"(?:[a-zA-Z0-9\-]{0,61}"    # Remaining label characters: alphanumeric or hyphen
    r"[a-zA-Z0-9])?"             # Last character of label: alphanumeric
    r"\.)+[a-zA-Z]{2,}$"         # TLD: at least 2 alphabetic characters
)

class HostedZoneCreate(BaseModel):
    domain_name: str = Field(
        ...,
        min_length=4,
        max_length=255,
        description="Fully qualified domain name, e.g. 'example.com'",
        examples=["example.com", "myapp.io"]
    )
    description: Optional[str] = Field(
        default=None,
        max_length=500,
        description="Optional description for this hosted zone",
        examples=["Production zone for my SaaS app"]
    )

    @field_validator("domain_name")
    @classmethod
    def validate_domain_name(cls, v: str) -> str:
        """
        Validates that the domain_name conforms to RFC-1123 format.
        Strips trailing dots (e.g. 'example.com.' → 'example.com')
        and converts to lowercase for consistency.
        """
        v = v.strip().rstrip(".").lower()
        if not _DOMAIN_PATTERN.match(v):
            raise ValueError(
                f"'{v}' is not a valid domain name. "
                "Use format like 'example.com' or 'sub.domain.co.uk'"
            )
        return v


# ─────────────────────────────────────────────────────────────────────────────
# HostedZoneUpdate — validates data for partially updating an existing zone.
#
# Why are all fields Optional here?
#   HTTP PATCH semantics: clients send only the fields they want to change.
#   If 'domain_name' is None, the service layer will know not to update it.
#   Making fields required in an update schema would force clients to always
#   send the full resource body (HTTP PUT semantics), which is less flexible.
#
# Why can we update 'domain_name'?
#   In AWS Route53, you cannot rename a hosted zone. However, for our clone
#   we allow it for learning purposes. In production, you may remove this.
# ─────────────────────────────────────────────────────────────────────────────
class HostedZoneUpdate(BaseModel):
    domain_name: Optional[str] = Field(
        default=None,
        min_length=4,
        max_length=255,
        description="New domain name for this hosted zone",
        examples=["newdomain.com"]
    )
    description: Optional[str] = Field(
        default=None,
        max_length=500,
        description="Updated description",
        examples=["Updated zone description"]
    )

    @field_validator("domain_name")
    @classmethod
    def validate_domain_name(cls, v: Optional[str]) -> Optional[str]:
        if v is None:
            return v
        v = v.strip().rstrip(".").lower()
        if not _DOMAIN_PATTERN.match(v):
            raise ValueError(
                f"'{v}' is not a valid domain name. "
                "Use format like 'example.com' or 'sub.domain.co.uk'"
            )
        return v


# ─────────────────────────────────────────────────────────────────────────────
# HostedZoneResponse — shape of hosted zone data returned to the client.
#
# Fields:
#   id          → Database PK — lets clients reference this zone in subsequent
#                 requests (e.g. GET /hosted-zones/{id}/records).
#   user_id     → Lets the client confirm ownership.
#   domain_name → The zone's domain name.
#   description → The optional description.
#   created_at  → Zone creation timestamp.
#   updated_at  → Last modification timestamp.
#
# Note: 'dns_records' is intentionally NOT included here.
#   When you list hosted zones, you usually don't want to eagerly load all
#   DNS records for every zone. Records are fetched separately via
#   GET /hosted-zones/{id}/records. This keeps response payloads lean.
# ─────────────────────────────────────────────────────────────────────────────
class HostedZoneResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    user_id: int
    domain_name: str
    description: Optional[str]
    created_at: datetime
    updated_at: datetime
