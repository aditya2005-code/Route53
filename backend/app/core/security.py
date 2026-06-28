import bcrypt

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
