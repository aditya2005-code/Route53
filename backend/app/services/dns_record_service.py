from typing import List
from sqlalchemy.orm import Session
from app.models.dns_record import DNSRecord
from app.schemas.dns_record import DNSRecordCreate, DNSRecordUpdate, RecordType
from app.repositories.dns_record_repository import DNSRecordRepository
from app.services.hosted_zone_service import HostedZoneService
from app.core.exceptions import ConflictException, ResourceNotFoundException

class DNSRecordService:
    """
    Service layer for DNSRecord management.
    Coordinates between API routes and DNSRecordRepository, and enforces DNS logic.
    """
    def __init__(self, db: Session):
        self.record_repo = DNSRecordRepository(db)
        # We need the HostedZoneService to verify ownership before modifying records.
        self.zone_service = HostedZoneService(db)

    def _validate_record_conflicts(self, zone_id: int, record_name: str, record_type: RecordType, current_record_id: int = None) -> None:
        """
        Business Logic: DNS Conflict Rules.
        1. A CNAME record cannot coexist with any other record (A, TXT, MX, etc.) for the SAME record_name.
        2. If a CNAME exists for 'www', you cannot create an 'A' record for 'www'.
        3. If an 'A' record exists for 'www', you cannot create a 'CNAME' for 'www'.
        """
        existing_records = self.record_repo.search_records(zone_id, record_name)
        
        for record in existing_records:
            if current_record_id and record.id == current_record_id:
                continue # Skip checking against itself during an update

            if record.record_name == record_name:
                if record_type == RecordType.CNAME:
                    raise ConflictException(f"Cannot create CNAME: Another record already exists for '{record_name}'.")
                if record.record_type == RecordType.CNAME.value:
                    raise ConflictException(f"Cannot create {record_type.value}: A CNAME record already exists for '{record_name}'.")

    def create_dns_record(self, user_id: int, zone_id: int, schema: DNSRecordCreate) -> DNSRecord:
        """
        Business Logic:
        1. Ensure the user actually owns the Hosted Zone.
        2. Validate DNS conflicts (e.g., CNAME collisions).
        (Note: TTL, Priority, and RecordType validations are already handled by Pydantic schema).
        """
        # This will raise PermissionDeniedException or ResourceNotFoundException if invalid.
        self.zone_service.get_hosted_zone(user_id, zone_id)
        
        self._validate_record_conflicts(zone_id, schema.record_name, schema.record_type)

        new_record = DNSRecord(
            hosted_zone_id=zone_id,
            record_name=schema.record_name,
            record_type=schema.record_type.value,
            value=schema.value,
            ttl=schema.ttl,
            priority=schema.priority
        )
        return self.record_repo.create_record(new_record)

    def get_dns_record(self, user_id: int, zone_id: int, record_id: int) -> DNSRecord:
        """
        Business Logic:
        1. Ensure user owns the zone.
        2. Ensure the record exists and belongs to this zone.
        """
        self.zone_service.get_hosted_zone(user_id, zone_id)
        
        record = self.record_repo.get_record_by_id(record_id)
        if not record or record.hosted_zone_id != zone_id:
            raise ResourceNotFoundException("DNS record not found.")
            
        return record

    def list_dns_records(self, user_id: int, zone_id: int) -> List[DNSRecord]:
        """Verify ownership, then return all records for the zone."""
        self.zone_service.get_hosted_zone(user_id, zone_id)
        return self.record_repo.get_records_by_zone(zone_id)

    def search_dns_records(self, user_id: int, zone_id: int, query: str) -> List[DNSRecord]:
        self.zone_service.get_hosted_zone(user_id, zone_id)
        return self.record_repo.search_records(zone_id, query)

    def filter_dns_records_by_type(self, user_id: int, zone_id: int, record_type: RecordType) -> List[DNSRecord]:
        self.zone_service.get_hosted_zone(user_id, zone_id)
        return self.record_repo.filter_records_by_type(zone_id, record_type.value)

    def get_paginated_records(
        self, 
        user_id: int, 
        zone_id: int, 
        search: str = None, 
        record_type: RecordType = None, 
        page: int = 1, 
        limit: int = 10
    ) -> dict:
        """
        Fetch DNS records with pagination, optional search, and optional type filtering.
        Returns a dictionary matching the PaginatedResponse schema structure.
        """
        import math
        
        # Verify ownership of the zone
        self.zone_service.get_hosted_zone(user_id, zone_id)
        
        # Validation
        if page < 1: page = 1
        if limit < 1: limit = 10
        if limit > 1000: limit = 1000
            
        type_val = record_type.value if record_type else None
            
        items, total = self.record_repo.get_paginated_records(zone_id, search, type_val, page, limit)
        
        return {
            "items": items,
            "total": total,
            "page": page,
            "limit": limit,
            "pages": math.ceil(total / limit) if limit > 0 else 1
        }

    def update_dns_record(self, user_id: int, zone_id: int, record_id: int, schema: DNSRecordUpdate) -> DNSRecord:
        """
        Business Logic:
        1. Fetch and authorize record.
        2. If name or type is changing, re-run DNS conflict validation.
        3. Apply updates.
        """
        record = self.get_dns_record(user_id, zone_id, record_id)

        new_name = schema.record_name if schema.record_name else record.record_name
        new_type = schema.record_type if schema.record_type else RecordType(record.record_type)

        if schema.record_name or schema.record_type:
            self._validate_record_conflicts(zone_id, new_name, new_type, current_record_id=record.id)

        if schema.record_name: record.record_name = schema.record_name
        if schema.record_type: record.record_type = schema.record_type.value
        if schema.value: record.value = schema.value
        if schema.ttl: record.ttl = schema.ttl
        
        # Priority can be updated. If record_type changed, Schema model_validator already enforced priority rules.
        if schema.priority is not None: 
            record.priority = schema.priority

        return self.record_repo.update_record(record)

    def delete_dns_record(self, user_id: int, zone_id: int, record_id: int) -> None:
        """Fetch, authorize, and delete."""
        record = self.get_dns_record(user_id, zone_id, record_id)
        self.record_repo.delete_record(record)
