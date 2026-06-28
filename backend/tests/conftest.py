import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.main import app
from app.db.database import Base
from app.core.dependencies import get_db
from app.core.security import hash_password, create_access_token
from app.models.user import User

# Use an in-memory SQLite database for testing.
# StaticPool is used to prevent SQLite from closing the in-memory DB between connections.
SQLALCHEMY_DATABASE_URL = "sqlite:///:memory:"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

@pytest.fixture(scope="function")
def db():
    # Create the database tables
    Base.metadata.create_all(bind=engine)
    connection = engine.connect()
    transaction = connection.begin()
    session = TestingSessionLocal(bind=connection)
    
    yield session
    
    session.close()
    transaction.rollback()
    connection.close()
    Base.metadata.drop_all(bind=engine)

@pytest.fixture(scope="function")
def client(db):
    def override_get_db():
        try:
            yield db
        finally:
            pass
            
    app.dependency_overrides[get_db] = override_get_db
    yield TestClient(app)
    app.dependency_overrides.clear()

@pytest.fixture(scope="function")
def user_a(db):
    user = User(
        name="User A",
        email="usera@example.com",
        password=hash_password("password123")
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user

@pytest.fixture(scope="function")
def user_b(db):
    user = User(
        name="User B",
        email="userb@example.com",
        password=hash_password("password123")
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user

@pytest.fixture(scope="function")
def token_a(user_a):
    from datetime import timedelta
    return create_access_token(subject=user_a.id, expires_delta=timedelta(hours=1))

@pytest.fixture(scope="function")
def token_b(user_b):
    from datetime import timedelta
    return create_access_token(subject=user_b.id, expires_delta=timedelta(hours=1))

@pytest.fixture(scope="function")
def headers_a(token_a):
    return {"Authorization": f"Bearer {token_a}"}

@pytest.fixture(scope="function")
def headers_b(token_b):
    return {"Authorization": f"Bearer {token_b}"}
