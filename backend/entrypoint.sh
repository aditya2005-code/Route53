#!/bin/sh
set -e

echo "[Route 53 Backend] Initializing application container..."

# 1. Run database migrations to ensure schema is fully upgraded to head
echo "[Route 53 Backend] Applying database migrations (alembic upgrade head)..."
python -m alembic upgrade head || {
    echo "[Route 53 Backend] Warning: Alembic migration execution skipped or already at head."
}

# 2. Hand over execution to CMD (uvicorn)
echo "[Route 53 Backend] Starting Uvicorn server on port ${PORT:-8000}..."
exec "$@"
