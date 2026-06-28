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

    def get_paginated_records(
        self, 
        zone_id: int, 
        search: Optional[str] = None, 
        record_type: Optional[str] = None, 
        page: int = 1, 
        limit: int = 10
    ) -> tuple[List[DNSRecord], int]:
        """
        Fetch paginated DNS records for a zone with optional search (name/value) and type filter.
        Returns a tuple of (items, total_count).
        """
        from sqlalchemy import func, or_
        
        stmt = select(DNSRecord).where(DNSRecord.hosted_zone_id == zone_id)
        
        if record_type:
            stmt = stmt.where(DNSRecord.record_type == record_type)
            
        if search:
            stmt = stmt.where(
                or_(
                    DNSRecord.record_name.ilike(f"%{search}%"),
                    DNSRecord.value.ilike(f"%{search}%")
                )
            )
            
        count_stmt = select(func.count()).select_from(stmt.subquery())
        total = self.db.execute(count_stmt).scalar_one()
        
        offset = (page - 1) * limit
        stmt = stmt.offset(offset).limit(limit)
        
        items = list(self.db.execute(stmt).scalars().all())
        return items, total

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

    def update_record_if_owned(self, record: DNSRecord, user_id: int, commit: bool = True) -> DNSRecord:
        """
        Update a DNS record only if the parent HostedZone is owned by the user.
        """
        from app.models.hosted_zone import HostedZone
        stmt = select(HostedZone.user_id).where(HostedZone.id == record.hosted_zone_id)
        owner_id = self.db.execute(stmt).scalar()
        if owner_id != user_id:
            from app.core.exceptions import ResourceNotFoundException
            raise ResourceNotFoundException("DNS record not found.")
        return self.update_record(record, commit=commit)

    def delete_record(self, record: DNSRecord, commit: bool = True) -> None:
        """Alias for delete."""
        self.delete(record, commit=commit)

    def delete_record_if_owned(self, record: DNSRecord, user_id: int, commit: bool = True) -> None:
        """
        Delete a DNS record only if the parent HostedZone is owned by the user.
        """
        from app.models.hosted_zone import HostedZone
        stmt = select(HostedZone.user_id).where(HostedZone.id == record.hosted_zone_id)
        owner_id = self.db.execute(stmt).scalar()
        if owner_id != user_id:
            from app.core.exceptions import ResourceNotFoundException
            raise ResourceNotFoundException("DNS record not found.")
        self.delete_record(record, commit=commit)

    def get_record_by_id_and_owner(self, record_id: int, user_id: int) -> Optional[DNSRecord]:
        """
        Fetch a record by record_id and owner (user_id) via HostedZone join.
        """
        from app.models.hosted_zone import HostedZone
        stmt = select(DNSRecord).join(HostedZone).where(
            DNSRecord.id == record_id,
            HostedZone.user_id == user_id
        )
        return self.db.execute(stmt).scalar_one_or_none()

    def get_records_by_zone_and_owner(self, zone_id: int, user_id: int) -> List[DNSRecord]:
        """
        Fetch all DNS records in a zone if the zone is owned by the user.
        """
        from app.models.hosted_zone import HostedZone
        stmt = select(DNSRecord).join(HostedZone).where(
            DNSRecord.hosted_zone_id == zone_id,
            HostedZone.user_id == user_id
        )
        return list(self.db.execute(stmt).scalars().all())

    def get_paginated_records_by_owner(
        self, 
        zone_id: int, 
        user_id: int,
        search: Optional[str] = None, 
        record_type: Optional[str] = None, 
        page: int = 1, 
        limit: int = 10
    ) -> tuple[List[DNSRecord], int]:
        """
        Fetch paginated DNS records for a zone owned by the user, with optional search and type filter.
        Returns a tuple of (items, total_count).
        """
        from sqlalchemy import func, or_
        from app.models.hosted_zone import HostedZone
        
        stmt = select(DNSRecord).join(HostedZone).where(
            DNSRecord.hosted_zone_id == zone_id,
            HostedZone.user_id == user_id
        )
        
        if record_type:
            stmt = stmt.where(DNSRecord.record_type == record_type)
            
        if search:
            stmt = stmt.where(
                or_(
                    DNSRecord.record_name.ilike(f"%{search}%"),
                    DNSRecord.value.ilike(f"%{search}%")
                )
            )
            
        count_stmt = select(func.count()).select_from(stmt.subquery())
        total = self.db.execute(count_stmt).scalar_one()
        
        offset = (page - 1) * limit
        stmt = stmt.offset(offset).limit(limit)
        
        items = list(self.db.execute(stmt).scalars().all())
        return items, total
