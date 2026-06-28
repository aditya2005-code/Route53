# Auth routes
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from typing import Annotated
from sqlalchemy.orm import Session

from app.core.dependencies import get_db
from app.api.dependencies import get_current_user
from app.models.user import User
from app.schemas.user import UserCreate, UserResponse
from app.schemas.auth import TokenResponse
from app.services.auth_service import AuthService
from app.core.exceptions import DuplicateResourceException, ResourceNotFoundException

router = APIRouter()


@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def register(
    schema: UserCreate,
    db: Session = Depends(get_db)
):
    """
    Register a new user account.
    The password is hashed before storage — it is never saved as plain text.
    """
    service = AuthService(db)
    try:
        return service.register_user(schema)
    except DuplicateResourceException as e:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=str(e))


@router.post("/login", response_model=TokenResponse)
def login(
    form_data: Annotated[OAuth2PasswordRequestForm, Depends()],
    db: Session = Depends(get_db)
):
    """
    Login and receive a JWT access token.

    WHY OAuth2PasswordRequestForm instead of JSON body?
    FastAPI's Swagger "Authorize" button sends credentials as HTML form data
    (application/x-www-form-urlencoded), NOT as JSON. Using OAuth2PasswordRequestForm
    makes the Swagger Authorize button work out of the box.
    In Postman, send as form-data with 'username' and 'password' fields.

    Note: OAuth2 spec uses 'username' field name, but we treat it as an email.
    """
    service = AuthService(db)
    try:
        return service.login(email=form_data.username, plain_password=form_data.password)
    except ResourceNotFoundException:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password.",
            headers={"WWW-Authenticate": "Bearer"},
        )


@router.post("/logout")
def logout():
    """
    Logout endpoint.

    WHY is this so simple?
    JWT tokens are stateless — the server does not store sessions.
    A true server-side logout would require a token blacklist (stored in Redis).
    For this project, logout is handled CLIENT-SIDE by discarding the stored token.
    The client simply deletes the token from localStorage or cookies.
    """
    return {"message": "Logged out successfully. Please discard your token."}


@router.get("/me", response_model=UserResponse)
def get_me(
    current_user: User = Depends(get_current_user)
):
    """
    Returns the profile of the currently authenticated user.
    The user is extracted from the JWT token by the get_current_user dependency.
    No DB call needed here — the dependency already loaded the user.
    """
    return current_user
