import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request, status
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware.base import BaseHTTPMiddleware

from app.api.api import api_router
from app.core.config import settings
from app.core.logging_config import setup_logging
from app.core.rate_limit import RateLimitMiddleware
from app.db.database import Base, engine, check_database_health

# Ensure all models are registered in SQLAlchemy mapper
import app.models  # noqa: F401

logger = logging.getLogger("route53.main")


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Application lifespan manager (modern replacement for on_event).
    Initializes logging and verifies database connectivity on boot.
    """
    setup_logging()
    logger.info(f"Starting Route 53 API [Environment: {settings.ENVIRONMENT}]")

    # In local SQLite or development mode, ensure schema exists
    if not settings.is_production or settings.DATABASE_URL.startswith("sqlite"):
        Base.metadata.create_all(bind=engine)
        logger.info("Database schema synchronized.")

    # Probe DB readiness
    if check_database_health():
        logger.info("Database connectivity established successfully.")
    else:
        logger.warning("Database connection probe failed during startup.")

    yield

    logger.info("Shutting down Route 53 API.")


app = FastAPI(
    title="AWS Route 53 Clone API",
    description="A production-grade Route 53 DNS Management Console REST API with AI Troubleshooting",
    version="1.0.0",
    lifespan=lifespan,
    docs_url="/docs" if not settings.is_production else "/docs",
    redoc_url="/redoc" if not settings.is_production else "/redoc",
)


# ---------------------------------------------------------------------------
# Security Headers Middleware
# ---------------------------------------------------------------------------
class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        response = await call_next(request)
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["X-XSS-Protection"] = "1; mode=block"
        response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
        if request.url.scheme == "https" or request.headers.get("x-forwarded-proto") == "https":
            response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
        return response


app.add_middleware(SecurityHeadersMiddleware)
app.add_middleware(RateLimitMiddleware)

# ---------------------------------------------------------------------------
# CORS Middleware
# ---------------------------------------------------------------------------
origins = [origin.strip() for origin in settings.ALLOWED_ORIGINS.split(",") if origin.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allow_headers=["*"],
    expose_headers=["X-RateLimit-Limit", "X-RateLimit-Remaining"],
)


# ---------------------------------------------------------------------------
# Centralized Production Exception Handler
# ---------------------------------------------------------------------------
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Unhandled exception on {request.method} {request.url.path}: {exc}", exc_info=True)
    if settings.is_production:
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content={"detail": "An internal server error occurred. Please contact the administrator."},
        )
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={"detail": str(exc)},
    )


# ---------------------------------------------------------------------------
# API Routes Registration
# ---------------------------------------------------------------------------
app.include_router(api_router)


# ---------------------------------------------------------------------------
# Health and Readiness Probes
# ---------------------------------------------------------------------------
@app.get("/", tags=["Health"])
def read_root():
    return {
        "service": "AWS Route 53 Clone API",
        "status": "operational",
        "docs": "/docs"
    }


@app.get("/health", tags=["Health"])
def health():
    """
    Liveness probe: verifies that the FastAPI process is responsive.
    """
    return {
        "status": "healthy",
        "service": "route53-api"
    }


@app.get("/health/ready", tags=["Health"])
def readiness():
    """
    Readiness probe: verifies that required dependencies (database) are operational.
    Returns HTTP 200 when ready, HTTP 503 when dependencies are unreachable.
    Does NOT leak internal credentials or infrastructure URLs.
    """
    db_ok = check_database_health()
    if db_ok:
        return {
            "status": "ready",
            "database": "connected"
        }
    return JSONResponse(
        status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
        content={
            "status": "not_ready",
            "database": "disconnected"
        }
    )
