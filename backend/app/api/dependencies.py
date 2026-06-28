from fastapi import Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.dependencies import get_db
from app.models.user import User
from app.repositories.user_repository import UserRepository
from app.core.exceptions import ResourceNotFoundException

def get_current_user(db: Session = Depends(get_db)) -> User:
    """
    Mock authentication dependency.
    Since we haven't implemented JWT tokens yet, this will simply return
    our seeded Admin user (ID: 1) so we can test the protected endpoints.
    In the real auth phase, this will decode the Bearer token.
    """
    user_repo = UserRepository(db)
    user = user_repo.get_user_by_id(1)
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
        )
    return user
