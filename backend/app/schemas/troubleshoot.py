from enum import Enum
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field, ConfigDict
from app.schemas.dns_record import RecordType


class SeverityLevel(str, Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"


class TroubleshootRequest(BaseModel):
    query: str = Field(
        ...,
        min_length=3,
        max_length=1500,
        description="Natural-language description of the DNS problem",
        examples=["My domain example.com is returning NXDOMAIN", "CNAME record for www is not resolving"]
    )
    zone_id: Optional[int] = Field(
        default=None,
        description="Optional ID of the hosted zone to inspect"
    )
    record_name: Optional[str] = Field(
        default=None,
        description="Optional record name label, e.g. 'www' or '@'"
    )
    record_type: Optional[RecordType] = Field(
        default=None,
        description="Optional DNS record type, e.g. 'A' or 'CNAME'"
    )


class TroubleshootResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    problem: str = Field(description="Description of the identified issue")
    possible_causes: List[str] = Field(description="List of potential root causes")
    analysis: str = Field(description="Technical explanation with DNS reasoning")
    recommended_actions: List[str] = Field(description="Actionable, safe steps for resolution")
    severity: SeverityLevel = Field(description="Severity classification: low, medium, or high")
    requires_manual_verification: bool = Field(
        default=True,
        description="Always true: commands or DNS mutations are never auto-applied"
    )
    zone_context: Optional[Dict[str, Any]] = Field(
        default=None,
        description="Verified database facts used during troubleshooting"
    )

