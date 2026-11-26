from fastapi import APIRouter
from app.api.routes import hosted_zones, dns_records, auth, dashboard, troubleshoot
from app.routers.traffic_policy import router as traffic_policy_router

api_router = APIRouter()

# Authentication
api_router.include_router(
    auth.router,
    prefix="/auth",
    tags=["Authentication"]
)

# Hosted Zones
api_router.include_router(
    hosted_zones.router,
    prefix="/hosted-zones",
    tags=["Hosted Zones"]
)

# DNS Records (paths like /hosted-zones/{zone_id}/records)
api_router.include_router(
    dns_records.router,
    tags=["DNS Records"]
)

# Dashboard Summary
api_router.include_router(
    dashboard.router,
    prefix="/dashboard",
    tags=["Dashboard"]
)

# AI DNS Troubleshooter
api_router.include_router(
    troubleshoot.router,
    prefix="/ai",
    tags=["AI DNS Troubleshooter"]
)

# Convenience alias: /troubleshoot directly
api_router.include_router(
    troubleshoot.router,
    tags=["AI DNS Troubleshooter"]
)

# Traffic Policies
api_router.include_router(
    traffic_policy_router,
)
