# Main FastAPI application entry point
from fastapi import FastAPI
from app.api.api import api_router

app = FastAPI(title="AWS Route 53 Clone API")

app.include_router(api_router)

@app.get("/")
def read_root():
    return {"message": "Welcome to Route 53 Clone API"}

