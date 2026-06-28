from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session

from app.core.dependencies import get_db
from app.api.dependencies import get_current_user
from app.models.user import User
from app.schemas.hosted_zone import HostedZoneCreate, HostedZoneUpdate, HostedZoneResponse
from app.services.hosted_zone_service import HostedZoneService
from app.core.exceptions import DuplicateResourceException, PermissionDeniedException, ResourceNotFoundException

router = APIRouter()

@router.post("/", response_model=HostedZoneResponse, status_code=status.HTTP_201_CREATED)
def create_hosted_zone(
    schema: HostedZoneCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    service = HostedZoneService(db)
    try:
        return service.create_hosted_zone(user_id=current_user.id, schema=schema)
    except DuplicateResourceException as e:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=str(e))

from app.schemas.pagination import PaginatedResponse

@router.get("/", response_model=PaginatedResponse[HostedZoneResponse])
def get_hosted_zones(
    search: Optional[str] = Query(None, description="Search by domain name"),
    page: int = Query(1, ge=1, description="Page number"),
    limit: int = Query(10, ge=1, le=1000, description="Items per page"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    service = HostedZoneService(db)
    result = service.get_paginated_zones(user_id=current_user.id, search=search, page=page, limit=limit)
    return result

@router.get("/{zone_id}", response_model=HostedZoneResponse)
def get_hosted_zone(
    zone_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    service = HostedZoneService(db)
    try:
        return service.get_hosted_zone(user_id=current_user.id, zone_id=zone_id)
    except ResourceNotFoundException as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
    except PermissionDeniedException as e:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=str(e))

@router.put("/{zone_id}", response_model=HostedZoneResponse)
def update_hosted_zone(
    zone_id: int,
    schema: HostedZoneUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    service = HostedZoneService(db)
    try:
        return service.update_hosted_zone(user_id=current_user.id, zone_id=zone_id, schema=schema)
    except ResourceNotFoundException as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
    except PermissionDeniedException as e:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=str(e))
    except DuplicateResourceException as e:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=str(e))

@router.delete("/{zone_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_hosted_zone(
    zone_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    service = HostedZoneService(db)
    try:
        service.delete_hosted_zone(user_id=current_user.id, zone_id=zone_id)
    except ResourceNotFoundException as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
    except PermissionDeniedException as e:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=str(e))
