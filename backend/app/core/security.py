import bcrypt
from datetime import datetime, timedelta, timezone
from typing import Optional
from jose import jwt, JWTError

from app.core.config import settings


def hash_password(password: str) -> str:
    """
    Hash a plaintext password using the bcrypt library directly.
    Converts string password to bytes, hashes it with a random salt,
    and decodes back to a UTF-8 string for storage.
    """
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(password.encode("utf-8"), salt)
    return hashed.decode("utf-8")


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """
    Verifies a plaintext password against the stored bcrypt hash.
    """
    try:
        return bcrypt.checkpw(
            plain_password.encode("utf-8"),
            hashed_password.encode("utf-8")
        )
    except Exception:
        return False


def create_access_token(subject: int, expires_delta: Optional[timedelta] = None) -> str:
    """
    Creates a signed JWT token.

    - subject: The user's primary key (ID). We store it as the 'sub' claim.
    - exp: The expiry time. After this, the token is rejected.
    - The token is signed with SECRET_KEY using the HS256 algorithm.
      Anyone can READ the payload, but only the server can VERIFY the signature.
    """
    expire = datetime.now(timezone.utc) + (
        expires_delta or timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    )
    payload = {
        "sub": str(subject),   # JWT spec: 'sub' is the subject (user id)
        "exp": expire,         # JWT spec: 'exp' is the expiry timestamp
        "iat": datetime.now(timezone.utc),  # issued-at time
    }
    return jwt.encode(payload, settings.SECRET_KEY, algorithm=settings.ALGORITHM)


def decode_access_token(token: str) -> Optional[int]:
    """
    Decodes and validates a JWT token.
    Returns the user_id (int) on success.
    Returns None if the token is expired, malformed, or has an invalid signature.
    """
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        user_id = payload.get("sub")
        if user_id is None:
            return None
        return int(user_id)
    except JWTError:
        # Catches: ExpiredSignatureError, JWTClaimsError, DecodeError, etc.
        return None
