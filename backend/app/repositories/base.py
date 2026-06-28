from typing import Generic, TypeVar, Type, Any, Optional, List
from sqlalchemy.orm import Session
from sqlalchemy import select

# T is a generic type variable that will represent our SQLAlchemy models
T = TypeVar("T")

class BaseRepository(Generic[T]):
    """
    A generic repository providing standard CRUD operations.
    Other repositories will inherit from this to avoid duplicating code.
    """
    def __init__(self, model: Type[T], db: Session):
        self.model = model
        self.db = db

    def get_by_id(self, id: Any) -> Optional[T]:
        """Fetch a single record by its primary key."""
        return self.db.get(self.model, id)

    def get_all(self) -> List[T]:
        """Fetch all records for this model."""
        stmt = select(self.model)
        return list(self.db.execute(stmt).scalars().all())

    def create(self, obj: T, commit: bool = True) -> T:
        """
        Add a new record to the database.
        If commit=False, the transaction is flushed but not committed,
        allowing the service layer to chain multiple operations.
        """
        self.db.add(obj)
        if commit:
            self.db.commit()
            self.db.refresh(obj)
        else:
            self.db.flush()
        return obj

    def delete(self, obj: T, commit: bool = True) -> None:
        """Delete a record from the database."""
        self.db.delete(obj)
        if commit:
            self.db.commit()
        else:
            self.db.flush()
