# Main FastAPI application entry point
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.api import api_router
from app.core.config import settings

app = FastAPI(
    title="AWS Route 53 Clone API",
    description="A production-quality AWS Route53 Clone REST API",
    version="1.0.0",
)

# Configure CORS origins dynamically
origins = [origin.strip() for origin in settings.ALLOWED_ORIGINS.split(",") if origin.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router)


@app.get("/")
def read_root():
    return {"message": "Welcome to Route 53 Clone API"}


@app.get("/health", tags=["Health"])
def health_check():
    """
    Dedicated health check endpoint for production platform probes.
    """
    return {"status": "healthy"}

