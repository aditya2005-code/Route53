from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session

from app.core.dependencies import get_db
from app.api.dependencies import get_current_user
from app.models.user import User
from app.schemas.dns_record import DNSRecordCreate, DNSRecordUpdate, DNSRecordResponse, RecordType
from app.services.dns_record_service import DNSRecordService
from app.core.exceptions import ConflictException, PermissionDeniedException, ResourceNotFoundException

router = APIRouter()

@router.post("/hosted-zones/{zone_id}/records", response_model=DNSRecordResponse, status_code=status.HTTP_201_CREATED)
def create_dns_record(
    zone_id: int,
    schema: DNSRecordCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    service = DNSRecordService(db)
    try:
        return service.create_dns_record(user_id=current_user.id, zone_id=zone_id, schema=schema)
    except ConflictException as e:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=str(e))
    except PermissionDeniedException as e:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=str(e))
    except ResourceNotFoundException as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))

from app.schemas.pagination import PaginatedResponse

@router.get("/hosted-zones/{zone_id}/records", response_model=PaginatedResponse[DNSRecordResponse])
def get_dns_records(
    zone_id: int,
    search: Optional[str] = Query(None, description="Search by record name or value"),
    type: Optional[RecordType] = Query(None, description="Filter by record type"),
    page: int = Query(1, ge=1, description="Page number"),
    limit: int = Query(10, ge=1, le=1000, description="Items per page"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    service = DNSRecordService(db)
    try:
        result = service.get_paginated_records(
            user_id=current_user.id, 
            zone_id=zone_id, 
            search=search, 
            record_type=type,
            page=page,
            limit=limit
        )
        return result
    except PermissionDeniedException as e:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=str(e))
    except ResourceNotFoundException as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))

@router.get("/hosted-zones/{zone_id}/records/{record_id}", response_model=DNSRecordResponse)
def get_dns_record(
    zone_id: int,
    record_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    service = DNSRecordService(db)
    try:
        return service.get_dns_record(user_id=current_user.id, zone_id=zone_id, record_id=record_id)
    except PermissionDeniedException as e:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=str(e))
    except ResourceNotFoundException as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))

@router.put("/hosted-zones/{zone_id}/records/{record_id}", response_model=DNSRecordResponse)
def update_dns_record(
    zone_id: int,
    record_id: int,
    schema: DNSRecordUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    service = DNSRecordService(db)
    try:
        return service.update_dns_record(user_id=current_user.id, zone_id=zone_id, record_id=record_id, schema=schema)
    except ConflictException as e:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=str(e))
    except PermissionDeniedException as e:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=str(e))
    except ResourceNotFoundException as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))

@router.delete("/hosted-zones/{zone_id}/records/{record_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_dns_record(
    zone_id: int,
    record_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    service = DNSRecordService(db)
    try:
        service.delete_dns_record(user_id=current_user.id, zone_id=zone_id, record_id=record_id)
    except PermissionDeniedException as e:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=str(e))
    except ResourceNotFoundException as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
