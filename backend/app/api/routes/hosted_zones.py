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

@router.get("/", response_model=List[HostedZoneResponse])
def get_hosted_zones(
    query: Optional[str] = Query(None, description="Search by domain name"),
    skip: int = Query(0, ge=0, description="Pagination: number of records to skip"),
    limit: int = Query(100, ge=1, le=1000, description="Pagination: maximum records to return"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    service = HostedZoneService(db)
    # If a search query is provided, use the search method
    if query:
        zones = service.search_hosted_zones(user_id=current_user.id, query=query)
    else:
        zones = service.list_hosted_zones(user_id=current_user.id)
    
    # Manual in-memory pagination for simplicity, though normally done at DB layer
    return zones[skip : skip + limit]

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
