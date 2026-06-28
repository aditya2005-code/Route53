from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.api import api_router
from app.core.config import settings
from app.db.database import Base, engine

# Import all models BEFORE create_all()
from app.models import user, hosted_zone, dns_record

app = FastAPI(
    title="AWS Route 53 Clone API",
    description="A production-quality AWS Route53 Clone REST API",
    version="1.0.0",
)


@app.on_event("startup")
def on_startup():
    """
    Create database tables if they don't already exist.
    Safe to run multiple times.
    """
    Base.metadata.create_all(bind=engine)


# Configure CORS
origins = [origin.strip() for origin in settings.ALLOWED_ORIGINS.split(",")]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register API routes
app.include_router(api_router)


@app.get("/")
def read_root():
    return {
        "message": "Welcome to Route 53 Clone API"
    }


@app.get("/health")
def health():
    return {
        "status": "healthy"
    }