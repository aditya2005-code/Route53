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
        """Alias for get_by_id."""
        return self.get_by_id(zone_id)

    def get_all_zones(self) -> List[HostedZone]:
        """Alias for get_all."""
        return self.get_all()

    def get_zones_by_user(self, user_id: int) -> List[HostedZone]:
        """Fetch all hosted zones belonging to a specific user."""
        stmt = select(HostedZone).where(HostedZone.user_id == user_id)
        return list(self.db.execute(stmt).scalars().all())

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

    def delete_zone(self, zone: HostedZone, commit: bool = True) -> None:
        """Alias for delete."""
        self.delete(zone, commit=commit)

    def zone_exists(self, domain_name: str) -> bool:
        """
        Check if a zone with the given domain name already exists globally.
        This is useful to prevent duplicate domain registrations.
        """
        stmt = select(HostedZone.id).where(HostedZone.domain_name == domain_name)
        return self.db.execute(stmt).scalar_one_or_none() is not None
