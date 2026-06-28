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

        WHY this exists:
        Fetching a zone by ID then checking zone.user_id in the service layer
        would require the service to raise PermissionDeniedException, which maps
        to HTTP 403 — leaking the fact that the resource exists (enumeration risk).

        By filtering on BOTH id AND user_id in a single SQL query, the result is
        simply None when the zone doesn't exist OR belongs to another user.
        The service layer then raises ResourceNotFoundException → HTTP 404 in both cases.
        The attacker learns nothing.
        """
        stmt = select(HostedZone).where(
            HostedZone.id == zone_id,
            HostedZone.user_id == user_id
        )
        return self.db.execute(stmt).scalar_one_or_none()

    def get_all_zones(self) -> List[HostedZone]:
        """Alias for get_all."""
        return self.get_all()

    def get_zones_by_user(self, user_id: int) -> List[HostedZone]:
        """Fetch all hosted zones belonging to a specific user."""
        stmt = select(HostedZone).where(HostedZone.user_id == user_id)
        return list(self.db.execute(stmt).scalars().all())

    def get_paginated_zones(self, user_id: int, search: Optional[str] = None, page: int = 1, limit: int = 10) -> tuple[List[HostedZone], int]:
        """
        Fetch paginated zones for a user with optional search by domain name.
        Returns a tuple of (items, total_count).
        """
        from sqlalchemy import func
        
        # Base query
        stmt = select(HostedZone).where(HostedZone.user_id == user_id)
        
        # Apply search filter
        if search:
            stmt = stmt.where(HostedZone.domain_name.ilike(f"%{search}%"))
            
        # Get total count (ignoring pagination limits)
        count_stmt = select(func.count()).select_from(stmt.subquery())
        total = self.db.execute(count_stmt).scalar_one()
        
        # Apply pagination
        offset = (page - 1) * limit
        stmt = stmt.offset(offset).limit(limit)
        
        items = list(self.db.execute(stmt).scalars().all())
        return items, total

    def search_zones(self, user_id: int, domain_query: str) -> List[HostedZone]:
        """
        Search for zones belonging to a user by domain name using a LIKE clause.
        """
        stmt = select(HostedZone).where(
            HostedZone.user_id == user_id,
            HostedZone.domain_name.ilike(f"%{domain_query}%")
        )
        return list(self.db.execute(stmt).scalars().all())

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
