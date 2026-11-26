from typing import Dict, List
from sqlalchemy.orm import Session
from sqlalchemy import select, func, desc

from app.models.hosted_zone import HostedZone
from app.models.dns_record import DNSRecord
from app.schemas.dashboard import DashboardSummary
from app.schemas.hosted_zone import HostedZoneResponse
from app.schemas.dns_record import DNSRecordResponse


class DashboardService:
    def __init__(self, db: Session):
        self.db = db

    def get_summary(self, user_id: int) -> DashboardSummary:
        # 1. Total hosted zones owned by user
        total_zones = self.db.execute(
            select(func.count(HostedZone.id)).where(HostedZone.user_id == user_id)
        ).scalar() or 0

        # 2. Total DNS records belonging to user's zones
        total_records = self.db.execute(
            select(func.count(DNSRecord.id))
            .join(HostedZone, DNSRecord.hosted_zone_id == HostedZone.id)
            .where(HostedZone.user_id == user_id)
        ).scalar() or 0

        # 3. Record distribution by record_type
        distribution_rows = self.db.execute(
            select(DNSRecord.record_type, func.count(DNSRecord.id))
            .join(HostedZone, DNSRecord.hosted_zone_id == HostedZone.id)
            .where(HostedZone.user_id == user_id)
            .group_by(DNSRecord.record_type)
        ).all()
        record_distribution: Dict[str, int] = {
            row[0]: row[1] for row in distribution_rows
        }

        # 4. Recent hosted zones (top 5)
        recent_zones_query = self.db.execute(
            select(HostedZone)
            .where(HostedZone.user_id == user_id)
            .order_by(desc(HostedZone.created_at))
            .limit(5)
        ).scalars().all()

        recent_zones = []
        for zone in recent_zones_query:
            zone.record_count = len(zone.dns_records)
            recent_zones.append(HostedZoneResponse.model_validate(zone))

        # 5. Recent DNS records (top 5)
        recent_records_query = self.db.execute(
            select(DNSRecord)
            .join(HostedZone, DNSRecord.hosted_zone_id == HostedZone.id)
            .where(HostedZone.user_id == user_id)
            .order_by(desc(DNSRecord.updated_at))
            .limit(5)
        ).scalars().all()

        recent_records = [
            DNSRecordResponse.model_validate(r) for r in recent_records_query
        ]

        return DashboardSummary(
            total_zones=total_zones,
            total_records=total_records,
            record_distribution=record_distribution,
            recent_zones=recent_zones,
            recent_records=recent_records,
        )

