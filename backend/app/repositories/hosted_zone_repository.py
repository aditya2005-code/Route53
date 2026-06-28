from typing import Optional, List
from sqlalchemy.orm import Session
from sqlalchemy import select
from app.models.hosted_zone import HostedZone
from app.repositories.base import BaseRepository

class HostedZoneRepository(BaseRepository[HostedZone]):
    """
    Repository for managing HostedZone data access.
    """
    def __init__(self, db: Session):
        super().__init__(HostedZone, db)

    def create_zone(self, zone: HostedZone, commit: bool = True) -> HostedZone:
        """Alias for create."""
        return self.create(zone, commit=commit)

    def get_zone_by_id(self, zone_id: int) -> Optional[HostedZone]:
        """Alias for get_by_id. Used internally; prefer get_zone_by_id_and_owner for protected endpoints."""
        return self.get_by_id(zone_id)

    def get_zone_by_id_and_owner(self, zone_id: int, user_id: int) -> Optional[HostedZone]:
        """
        Ownership-aware fetch.
        """
        from app.models.dns_record import DNSRecord
        from sqlalchemy import func

        stmt = (
            select(HostedZone, func.count(DNSRecord.id).label("record_count"))
            .outerjoin(DNSRecord, HostedZone.id == DNSRecord.hosted_zone_id)
            .where(
                HostedZone.id == zone_id,
                HostedZone.user_id == user_id
            )
            .group_by(HostedZone.id)
        )
        row = self.db.execute(stmt).first()
        if row:
            zone, record_count = row
            zone.record_count = record_count
            return zone
        return None

    def get_all_zones(self) -> List[HostedZone]:
        """Alias for get_all."""
        return self.get_all()

    def get_zones_by_user(self, user_id: int) -> List[HostedZone]:
        """Fetch all hosted zones belonging to a specific user."""
        from app.models.dns_record import DNSRecord
        from sqlalchemy import func

        stmt = (
            select(HostedZone, func.count(DNSRecord.id).label("record_count"))
            .outerjoin(DNSRecord, HostedZone.id == DNSRecord.hosted_zone_id)
            .where(HostedZone.user_id == user_id)
            .group_by(HostedZone.id)
        )
        results = self.db.execute(stmt).all()
        items = []
        for zone, record_count in results:
            zone.record_count = record_count
            items.append(zone)
        return items

    def get_paginated_zones(self, user_id: int, search: Optional[str] = None, page: int = 1, limit: int = 10) -> tuple[List[HostedZone], int]:
        """
        Fetch paginated zones for a user with optional search by domain name.
        Returns a tuple of (items, total_count).
        """
        from sqlalchemy import func
        from app.models.dns_record import DNSRecord
        
        # Base query to get HostedZones matching criteria (for count and base items)
        base_stmt = select(HostedZone).where(HostedZone.user_id == user_id)
        if search:
            base_stmt = base_stmt.where(HostedZone.domain_name.ilike(f"%{search}%"))
            
        # Get total count (ignoring pagination limits)
        count_stmt = select(func.count()).select_from(base_stmt.subquery())
        total = self.db.execute(count_stmt).scalar_one()
        
        # Apply pagination and count aggregation
        offset = (page - 1) * limit
        stmt = (
            select(HostedZone, func.count(DNSRecord.id).label("record_count"))
            .outerjoin(DNSRecord, HostedZone.id == DNSRecord.hosted_zone_id)
            .where(HostedZone.user_id == user_id)
        )
        if search:
            stmt = stmt.where(HostedZone.domain_name.ilike(f"%{search}%"))
            
        stmt = stmt.group_by(HostedZone.id).offset(offset).limit(limit)
        
        results = self.db.execute(stmt).all()
        items = []
        for zone, record_count in results:
            zone.record_count = record_count
            items.append(zone)
            
        return items, total

    def search_zones(self, user_id: int, domain_query: str) -> List[HostedZone]:
        """
        Search for zones belonging to a user by domain name using a LIKE clause.
        """
        from app.models.dns_record import DNSRecord
        from sqlalchemy import func

        stmt = (
            select(HostedZone, func.count(DNSRecord.id).label("record_count"))
            .outerjoin(DNSRecord, HostedZone.id == DNSRecord.hosted_zone_id)
            .where(
                HostedZone.user_id == user_id,
                HostedZone.domain_name.ilike(f"%{domain_query}%")
            )
            .group_by(HostedZone.id)
        )
        results = self.db.execute(stmt).all()
        items = []
        for zone, record_count in results:
            zone.record_count = record_count
            items.append(zone)
        return items

    def update_zone(self, zone: HostedZone, commit: bool = True) -> HostedZone:
        """
        Since the object is tracked by the session, we just commit to update.
        """
        if commit:
            self.db.commit()
            self.db.refresh(zone)
        else:
            self.db.flush()
        return zone

    def update_zone_if_owned(self, zone: HostedZone, user_id: int, commit: bool = True) -> HostedZone:
        """
        Update only if owned, otherwise raise ResourceNotFoundException.
        """
        if zone.user_id != user_id:
            from app.core.exceptions import ResourceNotFoundException
            raise ResourceNotFoundException("Hosted zone not found.")
        return self.update_zone(zone, commit=commit)

    def delete_zone(self, zone: HostedZone, commit: bool = True) -> None:
        """Alias for delete."""
        self.delete(zone, commit=commit)

    def delete_zone_if_owned(self, zone: HostedZone, user_id: int, commit: bool = True) -> None:
        """
        Delete only if owned, otherwise raise ResourceNotFoundException.
        """
        if zone.user_id != user_id:
            from app.core.exceptions import ResourceNotFoundException
            raise ResourceNotFoundException("Hosted zone not found.")
        self.delete_zone(zone, commit=commit)

    def zone_exists(self, domain_name: str) -> bool:
        """
        Check if a zone with the given domain name already exists globally.
        This is useful to prevent duplicate domain registrations.
        """
        stmt = select(HostedZone.id).where(HostedZone.domain_name == domain_name)
        return self.db.execute(stmt).scalar_one_or_none() is not None
