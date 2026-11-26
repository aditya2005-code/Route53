import time
from collections import defaultdict
from threading import Lock
from typing import Dict, List, Tuple
from fastapi import Request, Response, status
from starlette.middleware.base import BaseHTTPMiddleware
from app.core.config import settings


class InMemoryRateLimiter:
    """
    Thread-safe sliding-window in-memory rate limiter.
    Keyed by (client_ip, path_prefix).
    """
    def __init__(self):
        self._requests: Dict[Tuple[str, str], List[float]] = defaultdict(list)
        self._lock = Lock()

    def is_allowed(self, client_ip: str, key_prefix: str, limit: int, window_seconds: int = 60) -> Tuple[bool, int]:
        now = time.time()
        bucket_key = (client_ip, key_prefix)
        cutoff = now - window_seconds

        with self._lock:
            timestamps = self._requests[bucket_key]
            # Prune timestamps older than the window
            self._requests[bucket_key] = [t for t in timestamps if t > cutoff]
            current_count = len(self._requests[bucket_key])

            if current_count >= limit:
                remaining = 0
                return False, remaining

            self._requests[bucket_key].append(now)
            remaining = limit - (current_count + 1)
            return True, remaining


rate_limiter = InMemoryRateLimiter()


class RateLimitMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        if not settings.RATE_LIMIT_ENABLED or settings.is_testing:
            return await call_next(request)

        path = request.url.path
        client_ip = request.client.host if request.client else "unknown"

        # Check rate-limited path rules
        limit = None
        prefix = None

        if path.startswith("/auth/login") or path.startswith("/auth/register"):
            limit = settings.RATE_LIMIT_AUTH_PER_MINUTE
            prefix = "auth"
        elif path.startswith("/ai/troubleshoot") or path.startswith("/troubleshoot"):
            limit = settings.RATE_LIMIT_AI_PER_MINUTE
            prefix = "ai"

        if limit and prefix and request.method == "POST":
            allowed, remaining = rate_limiter.is_allowed(client_ip, prefix, limit, window_seconds=60)
            if not allowed:
                return Response(
                    content='{"detail":"Too many requests. Please slow down and try again later."}',
                    status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                    media_type="application/json",
                    headers={
                        "Retry-After": "60",
                        "X-RateLimit-Limit": str(limit),
                        "X-RateLimit-Remaining": "0"
                    }
                )

        response = await call_next(request)
        return response
