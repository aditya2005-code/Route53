# Main FastAPI application entry point
from fastapi import FastAPI

app = FastAPI(title="AWS Route 53 Clone API")

@app.get("/")
def read_root():
    return {"message": "Welcome to Route 53 Clone API"}
