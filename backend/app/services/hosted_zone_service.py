from typing import List
from sqlalchemy.orm import Session
from app.models.hosted_zone import HostedZone
from app.schemas.hosted_zone import HostedZoneCreate, HostedZoneUpdate
from app.repositories.hosted_zone_repository import HostedZoneRepository
from app.core.exceptions import DuplicateResourceException, ResourceNotFoundException

class HostedZoneService:
    """
    Service layer for HostedZone management.
    """
    def __init__(self, db: Session):
        self.zone_repo = HostedZoneRepository(db)

    def create_hosted_zone(self, user_id: int, schema: HostedZoneCreate) -> HostedZone:
        """
        Business Logic:
        1. Prevent duplicate domains globally. AWS Route 53 allows duplicate private zones, 
           but for our public clone, a domain can only be registered once.
        """
        if self.zone_repo.zone_exists(schema.domain_name):
            raise DuplicateResourceException(f"The domain '{schema.domain_name}' is already registered.")

        new_zone = HostedZone(
            user_id=user_id,
            domain_name=schema.domain_name,
            description=schema.description
        )
        zone = self.zone_repo.create_zone(new_zone)
        zone.record_count = 0
        return zone

    def get_hosted_zone(self, user_id: int, zone_id: int) -> HostedZone:
        """
        Business Logic:
        1. Fetch the zone by ID AND owner in a single query.
        2. If the result is None — whether the zone doesn't exist or belongs to another
           user — raise ResourceNotFoundException.

        WHY NOT PermissionDeniedException?
        Returning 403 Forbidden tells the caller "this resource exists but isn't yours."
        That is a resource enumeration vulnerability: an attacker can probe IDs and
        distinguish between 'not found' and 'found but forbidden'.
        Returning 404 for both cases leaks zero information.
        """
        zone = self.zone_repo.get_zone_by_id_and_owner(zone_id, user_id)
        if not zone:
            raise ResourceNotFoundException("Hosted zone not found.")
        return zone

    def list_hosted_zones(self, user_id: int) -> List[HostedZone]:
        """Fetch all zones owned by the user."""
        return self.zone_repo.get_zones_by_user(user_id)

    def search_hosted_zones(self, user_id: int, query: str) -> List[HostedZone]:
        """Search domains owned by the user."""
        return self.zone_repo.search_zones(user_id, query)

    def get_paginated_zones(self, user_id: int, search: str = None, page: int = 1, limit: int = 10) -> dict:
        """
        Fetch zones with pagination and optional search.
        Returns a dictionary matching the PaginatedResponse schema structure.
        """
        import math
        
        # Validation
        if page < 1: page = 1
        if limit < 1: limit = 10
        if limit > 1000: limit = 1000
            
        items, total = self.zone_repo.get_paginated_zones(user_id, search, page, limit)
        
        return {
            "items": items,
            "total": total,
            "page": page,
            "limit": limit,
            "pages": math.ceil(total / limit) if limit > 0 else 1
        }

    def update_hosted_zone(self, user_id: int, zone_id: int, schema: HostedZoneUpdate) -> HostedZone:
        """
        Business Logic:
        1. Retrieve and authorize (reusing get_hosted_zone logic).
        2. If domain_name is being changed, check for global uniqueness.
        3. Apply updates and save.
        """
        zone = self.get_hosted_zone(user_id, zone_id)

        if schema.domain_name and schema.domain_name != zone.domain_name:
            if self.zone_repo.zone_exists(schema.domain_name):
                raise DuplicateResourceException(f"The domain '{schema.domain_name}' is already registered.")
            zone.domain_name = schema.domain_name

        if schema.description is not None:
            zone.description = schema.description

        zone = self.zone_repo.update_zone_if_owned(zone, user_id)
        zone.record_count = len(zone.dns_records)
        return zone

    def delete_hosted_zone(self, user_id: int, zone_id: int) -> None:
        """
        Business Logic:
        1. Retrieve and authorize.
        2. Delete the zone. (Cascade deletes will automatically handle child DNS records at DB level).
        """
        zone = self.get_hosted_zone(user_id, zone_id)
        self.zone_repo.delete_zone_if_owned(zone, user_id)
