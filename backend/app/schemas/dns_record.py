import ipaddress
import re
from datetime import datetime
from enum import Enum
from typing import Optional
from pydantic import BaseModel, Field, ConfigDict, model_validator, field_validator
from typing_extensions import Self

_HOSTNAME_REGEX = re.compile(
    r"^(?:[a-zA-Z0-9](?:[a-zA-Z0-9\-]{0,61}[a-zA-Z0-9])?\.)*[a-zA-Z0-9](?:[a-zA-Z0-9\-]{0,61}[a-zA-Z0-9])?$"
)
_RECORD_NAME_REGEX = re.compile(
    r"^(@|\*|[a-zA-Z0-9](?:[a-zA-Z0-9\-_]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9\-_]{0,61}[a-zA-Z0-9])?)*)$"
)


class RecordType(str, Enum):
    A = "A"          # Maps hostname to IPv4 address
    AAAA = "AAAA"    # Maps hostname to IPv6 address
    CNAME = "CNAME"  # Canonical name alias (hostname to hostname)
    TXT = "TXT"      # Arbitrary text, used for SPF, DKIM, domain verification
    MX = "MX"        # Mail exchange server (requires priority)
    NS = "NS"        # Name server delegation record
    PTR = "PTR"      # Reverse DNS lookup (IP to hostname)
    SRV = "SRV"      # Service locator record (requires priority)
    CAA = "CAA"      # Certificate Authority Authorization


def validate_dns_value(record_type: RecordType, value: str) -> str:
    cleaned = value.strip()
    if not cleaned:
        raise ValueError("Record value cannot be empty.")

    if record_type == RecordType.A:
        try:
            ipaddress.IPv4Address(cleaned)
        except ValueError:
            raise ValueError(f"'{cleaned}' is not a valid IPv4 address for an 'A' record.")

    elif record_type == RecordType.AAAA:
        try:
            ipaddress.IPv6Address(cleaned)
        except ValueError:
            raise ValueError(f"'{cleaned}' is not a valid IPv6 address for an 'AAAA' record.")

    elif record_type == RecordType.CNAME:
        # CNAME must not be an IP address
        try:
            ipaddress.ip_address(cleaned)
            raise ValueError("CNAME value must be a domain name / hostname, not an IP address.")
        except ValueError as e:
            if "not an IP address" in str(e):
                raise
            pass
        normalized = cleaned.rstrip(".")
        if not _HOSTNAME_REGEX.match(normalized):
            raise ValueError(f"'{cleaned}' is not a valid canonical hostname for a CNAME record.")

    elif record_type == RecordType.MX:
        # MX target should be a hostname
        normalized = cleaned.rstrip(".")
        try:
            ipaddress.ip_address(normalized)
            raise ValueError("MX destination must be a mail server hostname, not an IP address.")
        except ValueError as e:
            if "not an IP address" in str(e):
                raise
            pass
        if not _HOSTNAME_REGEX.match(normalized):
            raise ValueError(f"'{cleaned}' is not a valid mail exchange hostname for an MX record.")

    elif record_type == RecordType.NS:
        normalized = cleaned.rstrip(".")
        if not _HOSTNAME_REGEX.match(normalized):
            raise ValueError(f"'{cleaned}' is not a valid nameserver hostname for an NS record.")

    elif record_type == RecordType.SRV:
        # SRV format: <weight> <port> <target>
        parts = cleaned.split()
        if len(parts) == 3:
            try:
                weight = int(parts[0])
                port = int(parts[1])
                target = parts[2].rstrip(".")
                if not (0 <= weight <= 65535 and 0 <= port <= 65535):
                    raise ValueError
                if not _HOSTNAME_REGEX.match(target):
                    raise ValueError
            except ValueError:
                raise ValueError(
                    f"'{cleaned}' is not a valid SRV value. Expected: '<weight> <port> <target-hostname>' (e.g. '10 5060 sip.example.com')"
                )
        elif len(parts) == 1:
            target = parts[0].rstrip(".")
            if not _HOSTNAME_REGEX.match(target):
                raise ValueError(f"'{cleaned}' is not a valid hostname for an SRV target.")
        else:
            raise ValueError(f"'{cleaned}' is not a valid SRV record value format.")

    elif record_type == RecordType.CAA:
        # CAA format: <flags> <tag> "<value>" e.g. '0 issue "letsencrypt.org"'
        parts = cleaned.split(maxsplit=2)
        if len(parts) >= 2:
            try:
                flags = int(parts[0])
                if not (0 <= flags <= 255):
                    raise ValueError
            except ValueError:
                raise ValueError("CAA flags must be an integer between 0 and 255.")
            tag = parts[1].lower()
            if tag not in {"issue", "issuewild", "iodef"}:
                raise ValueError(f"CAA tag '{tag}' is not recognized. Expected: issue, issuewild, or iodef.")

    elif record_type == RecordType.TXT:
        if len(cleaned) > 1024:
            raise ValueError("TXT record value cannot exceed 1024 characters.")

    return cleaned


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

    @field_validator("record_name")
    @classmethod
    def validate_name(cls, v: str) -> str:
        v = v.strip().lower()
        if not _RECORD_NAME_REGEX.match(v):
            raise ValueError(f"'{v}' is not a valid DNS record name. Use '@', '*', or valid label such as 'www'.")
        return v

    @model_validator(mode="after")
    def validate_record(self) -> Self:
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

        self.value = validate_dns_value(self.record_type, self.value)
        return self


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

    @field_validator("record_name")
    @classmethod
    def validate_name(cls, v: Optional[str]) -> Optional[str]:
        if v is None:
            return v
        v = v.strip().lower()
        if not _RECORD_NAME_REGEX.match(v):
            raise ValueError(f"'{v}' is not a valid DNS record name.")
        return v

    @model_validator(mode="after")
    def validate_update(self) -> Self:
        requires_priority = {RecordType.MX, RecordType.SRV}

        if self.record_type is not None:
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

        if self.record_type is not None and self.value is not None:
            self.value = validate_dns_value(self.record_type, self.value)

        return self


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
