from fastapi import APIRouter
from app.api.routes import hosted_zones, dns_records, auth

api_router = APIRouter()

# Include the auth router
api_router.include_router(
    auth.router,
    prefix="/auth",
    tags=["Authentication"]
)

# Include the hosted zones router
api_router.include_router(
    hosted_zones.router,
    prefix="/hosted-zones",
    tags=["Hosted Zones"]
)

# Include the DNS records router
# Notice we don't use a prefix here because the endpoints in dns_records.py 
# already specify their full paths (e.g., "/hosted-zones/{zone_id}/records").
api_router.include_router(
    dns_records.router,
    tags=["DNS Records"]
)
