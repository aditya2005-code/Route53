# Auth Pydantic Schemas
from pydantic import BaseModel
from typing import Optional


class TokenResponse(BaseModel):
    """
    The response body returned after a successful login.
    - access_token: The signed JWT string the client must store and send in future requests.
    - token_type:   Always "bearer" per OAuth2 spec. The client sends it as: Authorization: Bearer <token>
    """
    access_token: str
    token_type: str = "bearer"


class TokenData(BaseModel):
    """
    Internal schema used when decoding a JWT token inside the auth dependency.
    - user_id: Extracted from the 'sub' claim in the JWT payload.
    """
    user_id: Optional[int] = None
