from sqlalchemy.orm import Session
from app.models.user import User
from app.schemas.user import UserCreate
from app.schemas.auth import TokenResponse
from app.repositories.user_repository import UserRepository
from app.core.security import hash_password, verify_password, create_access_token
from app.core.exceptions import DuplicateResourceException, ResourceNotFoundException


class AuthService:
    """
    Service layer for User authentication and management.
    Coordinates between the API routes and the UserRepository.
    """
    def __init__(self, db: Session):
        self.user_repo = UserRepository(db)

    def register_user(self, schema: UserCreate) -> User:
        """
        Business Logic:
        1. Check if a user with the given email already exists.
        2. Hash the plaintext password for secure storage.
        3. Save the new user to the database.
        """
        existing_user = self.user_repo.get_user_by_email(schema.email)
        if existing_user:
            raise DuplicateResourceException("A user with this email already exists.")

        hashed_pw = hash_password(schema.password)
        new_user = User(
            name=schema.name,
            email=schema.email,
            password=hashed_pw
        )
        return self.user_repo.create_user(new_user)

    def login(self, email: str, plain_password: str) -> TokenResponse:
        """
        Business Logic:
        1. Verify the email and password against the DB hash.
        2. On success, generate and return a signed JWT access token.
        3. The route returns this token; the client stores it and sends it
           on every subsequent request inside: Authorization: Bearer <token>
        """
        user = self.verify_credentials(email, plain_password)
        access_token = create_access_token(subject=user.id)
        return TokenResponse(access_token=access_token, token_type="bearer")

    def verify_credentials(self, email: str, plain_password: str) -> User:
        """
        Business Logic:
        1. Fetch user by email.
        2. Verify the provided plaintext password against the stored hash.
        3. Return the user if valid, otherwise raise an exception.
        """
        user = self.user_repo.get_user_by_email(email)
        if not user or not verify_password(plain_password, user.password):
            # Generic error for both cases to prevent user enumeration attacks.
            raise ResourceNotFoundException("Invalid email or password.")
        return user

    def get_current_user(self, user_id: int) -> User:
        """
        Fetches the user by ID. Used after decoding a JWT token.
        """
        user = self.user_repo.get_user_by_id(user_id)
        if not user:
            raise ResourceNotFoundException("User not found.")
        return user
