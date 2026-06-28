from typing import Optional, List
from sqlalchemy.orm import Session
from sqlalchemy import select
from app.models.user import User
from app.repositories.base import BaseRepository

class UserRepository(BaseRepository[User]):
    """
    Repository for managing User data access.
    Inherits create, get_by_id, get_all, and delete from BaseRepository.
    """
    def __init__(self, db: Session):
        super().__init__(User, db)

    def create_user(self, user: User, commit: bool = True) -> User:
        """Alias for create, kept for explicit naming requirements."""
        return self.create(user, commit=commit)

    def get_user_by_id(self, user_id: int) -> Optional[User]:
        """Alias for get_by_id."""
        return self.get_by_id(user_id)

    def get_user_by_email(self, email: str) -> Optional[User]:
        """Fetch a single user by their unique email address."""
        stmt = select(User).where(User.email == email)
        return self.db.execute(stmt).scalar_one_or_none()

    def list_users(self) -> List[User]:
        """Alias for get_all."""
        return self.get_all()
