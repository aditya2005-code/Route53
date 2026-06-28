from typing import Annotated
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from app.core.dependencies import get_db
from app.core.security import decode_access_token
from app.models.user import User
from app.repositories.user_repository import UserRepository

# OAuth2PasswordBearer tells FastAPI:
# 1. The login URL (tokenUrl) is "/auth/login" — this is used by the Swagger "Authorize" button.
# 2. Requests should include the token as: Authorization: Bearer <token>
# 3. FastAPI will automatically extract the raw token string from the header for us.
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")


def get_current_user(
    token: Annotated[str, Depends(oauth2_scheme)],
    db: Annotated[Session, Depends(get_db)]
) -> User:
    """
    Real JWT authentication dependency.
    This is injected into every protected route via Depends(get_current_user).

    Flow:
    1. FastAPI extracts the Bearer token from the Authorization header.
    2. We decode it using our SECRET_KEY (verifies signature + checks expiry).
    3. We load the user from the DB using the user_id embedded in the token.
    4. If anything fails, we return 401 Unauthorized.
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials. Please log in again.",
        headers={"WWW-Authenticate": "Bearer"},  # RFC 6750 spec
    )

    user_id = decode_access_token(token)
    if user_id is None:
        raise credentials_exception

    user_repo = UserRepository(db)
    user = user_repo.get_user_by_id(user_id)

    if not user:
        raise credentials_exception

    return user
