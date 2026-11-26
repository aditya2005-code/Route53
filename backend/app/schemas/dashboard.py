from typing import Dict, List
from pydantic import BaseModel, ConfigDict
from app.schemas.hosted_zone import HostedZoneResponse
from app.schemas.dns_record import DNSRecordResponse


class DashboardSummary(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    total_zones: int
    total_records: int
    record_distribution: Dict[str, int]
    recent_zones: List[HostedZoneResponse]
    recent_records: List[DNSRecordResponse]

