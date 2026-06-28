from typing import Optional, List
from sqlalchemy.orm import Session
from sqlalchemy import select
from app.models.dns_record import DNSRecord
from app.repositories.base import BaseRepository

class DNSRecordRepository(BaseRepository[DNSRecord]):
    """
    Repository for managing DNSRecord data access.
    """
    def __init__(self, db: Session):
        super().__init__(DNSRecord, db)

    def create_record(self, record: DNSRecord, commit: bool = True) -> DNSRecord:
        """Alias for create."""
        return self.create(record, commit=commit)

    def get_record_by_id(self, record_id: int) -> Optional[DNSRecord]:
        """Alias for get_by_id."""
        return self.get_by_id(record_id)

    def get_records_by_zone(self, zone_id: int) -> List[DNSRecord]:
        """Fetch all DNS records belonging to a specific hosted zone."""
        stmt = select(DNSRecord).where(DNSRecord.hosted_zone_id == zone_id)
        return list(self.db.execute(stmt).scalars().all())

    def search_records(self, zone_id: int, query: str) -> List[DNSRecord]:
        """
        Search for records within a zone by matching the record name.
        """
        stmt = select(DNSRecord).where(
            DNSRecord.hosted_zone_id == zone_id,
            DNSRecord.record_name.ilike(f"%{query}%")
        )
        return list(self.db.execute(stmt).scalars().all())

    def filter_records_by_type(self, zone_id: int, record_type: str) -> List[DNSRecord]:
        """
        Fetch records within a zone matching a specific DNS record type (e.g., 'A', 'MX').
        """
        stmt = select(DNSRecord).where(
            DNSRecord.hosted_zone_id == zone_id,
            DNSRecord.record_type == record_type
        )
        return list(self.db.execute(stmt).scalars().all())

    def update_record(self, record: DNSRecord, commit: bool = True) -> DNSRecord:
        """
        Since the object is tracked by the session, we just commit to update.
        """
        if commit:
            self.db.commit()
            self.db.refresh(record)
        else:
            self.db.flush()
        return record

    def delete_record(self, record: DNSRecord, commit: bool = True) -> None:
        """Alias for delete."""
        self.delete(record, commit=commit)
