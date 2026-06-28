# Main FastAPI application entry point
from fastapi import FastAPI
from app.api.api import api_router

app = FastAPI(
    title="AWS Route 53 Clone API",
    description="A production-quality AWS Route53 Clone REST API",
    version="1.0.0",
)

app.include_router(api_router)


@app.get("/")
def read_root():
    return {"message": "Welcome to Route 53 Clone API"}
