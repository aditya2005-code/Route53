import pytest
from fastapi import status
from app.core.config import Settings
from app.core.rate_limit import InMemoryRateLimiter


def test_health_liveness_endpoint(client):
    response = client.get("/health")
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert data["status"] == "healthy"
    assert data["service"] == "route53-api"


def test_health_readiness_endpoint(client):
    response = client.get("/health/ready")
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert data["status"] == "ready"
    assert data["database"] == "connected"


def test_production_safety_check_detects_default_secret():
    # Attempting to run in production mode with a placeholder key must raise ValueError
    with pytest.raises(ValueError, match="CRITICAL: Insecure or default SECRET_KEY detected"):
        Settings(
            ENVIRONMENT="production",
            SECRET_KEY="route53clone_secret_key_change_me_in_production"
        )


def test_production_safety_check_allows_strong_secret():
    # Strong random 64-character secret must pass
    s = Settings(
        ENVIRONMENT="production",
        SECRET_KEY="a" * 64
    )
    assert s.is_production is True
    assert s.SECRET_KEY == "a" * 64


def test_rate_limiter_logic():
    limiter = InMemoryRateLimiter()
    ip = "192.168.1.100"
    prefix = "test_auth"
    limit = 3

    # First 3 requests must be allowed
    assert limiter.is_allowed(ip, prefix, limit, window_seconds=60)[0] is True
    assert limiter.is_allowed(ip, prefix, limit, window_seconds=60)[0] is True
    assert limiter.is_allowed(ip, prefix, limit, window_seconds=60)[0] is True

    # 4th request must be rejected
    allowed, remaining = limiter.is_allowed(ip, prefix, limit, window_seconds=60)
    assert allowed is False
    assert remaining == 0


def test_database_url_postgres_normalization():
    s = Settings(
        DATABASE_URL="postgres://user:pass@db.render.com:5432/dbname"
    )
    assert s.DATABASE_URL.startswith("postgresql://")

