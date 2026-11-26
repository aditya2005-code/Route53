# Route 53 — Production Deployment Runbook & Architecture Guide

This guide details the step-by-step procedures for deploying the **Route 53 Cloud DNS & AI Troubleshooter** platform to production cloud environments, container registries, and local staging instances.

---

## 1. Production Architecture Overview

```mermaid
flowchart TD
    subgraph Users["End Users"]
        Browser["Web Browser (HTTPS)"]
    end

    subgraph Edge["Global CDN & Edge Routing"]
        VercelEdge["Vercel Edge Network / CDN"]
        RenderEdge["Cloudflare / Render Edge Proxy"]
    end

    subgraph FrontendHosting["Frontend Tier (Vercel)"]
        NextServer["Next.js 16 SSR & Server Actions"]
        StaticAssets["Optimized Static Chunks / Turbopack"]
    end

    subgraph BackendHosting["Backend Tier (Render / Cloud Container)"]
        FastAPIApp["FastAPI ASGI Server (Uvicorn)"]
        RateLimiter["In-Memory Rate Limiter"]
        SecurityHeaders["Security Headers Middleware"]
        AlembicRunner["Alembic Migration Runner (entrypoint.sh)"]
    end

    subgraph ExternalServices["External APIs"]
        OpenAIAPI["OpenAI GPT-4o API"]
        HeuristicFallback["Built-in Heuristic Diagnostic Engine"]
    end

    subgraph DatabaseTier["Persistence Tier (Managed PostgreSQL)"]
        PostgresDB[("PostgreSQL 15 (SSL Enabled)")\n- Connection Pooling (pool_size=10)\n- Health Probes (pool_pre_ping=True)\n- Persistent Block Storage]
    end

    Browser -->|HTTPS / Port 443| VercelEdge
    Browser -->|REST API / Bearer JWT| RenderEdge
    VercelEdge --> NextServer
    NextServer --> StaticAssets
    RenderEdge --> FastAPIApp
    FastAPIApp --> RateLimiter
    RateLimiter --> SecurityHeaders
    FastAPIApp --> AlembicRunner
    FastAPIApp -->|TCP / SSL Pool| PostgresDB
    FastAPIApp -->|JSON Prompt| OpenAIAPI
    FastAPIApp -.->|Offline / Timeout Fallback| HeuristicFallback
```

---

## 2. Deployment Matrix

| Tier | Recommended Platform | Alternative Platforms | Protocol | Port |
|---|---|---|---|---|
| **Frontend** | [Vercel](https://vercel.com) | AWS Amplify, Netlify, Cloudflare Pages | HTTPS | 443 |
| **Backend** | [Render](https://render.com) | Railway, Fly.io, AWS ECS / App Runner | HTTPS | 443 / 8000 |
| **Database** | Managed PostgreSQL (Render / Neon / Supabase) | AWS RDS PostgreSQL, Supabase | TLS / TCP | 5432 |
| **Local Staging** | Docker Compose | Kubernetes (Minikube / Kind) | HTTP | 3000, 8000, 5432 |

---

## 3. Step 1: Managed PostgreSQL Database Provisioning

Before deploying the backend, provision a managed PostgreSQL database.

### Option A: Render Managed PostgreSQL
1. Sign in to your [Render Dashboard](https://dashboard.render.com).
2. Click **New +** → **PostgreSQL**.
3. Configure the database:
   - **Name**: `route53-postgres`
   - **Database Name**: `route53_db`
   - **User**: `route53_user`
   - **Region**: Choose the region closest to your users (e.g. `Oregon (US West)` or `Frankfurt (EU)`).
   - **Plan**: `Free` or `Starter`.
4. Click **Create Database**.
5. Once provisioned, locate the **Internal Database URL** (for services inside Render) and **External Database URL** (for external connections).
6. Note: If the connection URL begins with `postgres://`, Route 53's configuration engine automatically converts it to `postgresql://` for SQLAlchemy 2.0 compatibility.

### Option B: Neon / Supabase PostgreSQL
1. Create a project at [Neon](https://neon.tech) or [Supabase](https://supabase.com).
2. Copy the pooled connection string (with `sslmode=require`).

---

## 4. Step 2: Backend Cloud Deployment (Render / Docker)

The backend is fully containerized with a production multi-stage `Dockerfile` and automated migration entrypoint (`entrypoint.sh`).

### Method A: Web Service via Dockerfile (Recommended)
1. Go to [Render Dashboard](https://dashboard.render.com) → **New +** → **Web Service**.
2. Connect your GitHub repository: `aditya2005-code/Route53`.
3. Configure settings:
   - **Name**: `route53-backend`
   - **Region**: Same region as your PostgreSQL database.
   - **Branch**: `main`
   - **Root Directory**: `backend`
   - **Runtime**: `Docker` (Render automatically detects `backend/Dockerfile`).
4. In the **Environment Variables** section, add the required keys:

| Key | Example Value | Description |
|---|---|---|
| `ENVIRONMENT` | `production` | Enables production security checks |
| `DATABASE_URL` | `postgresql://user:pass@host:5432/route53_db` | Connection string from Step 1 |
| `JWT_SECRET_KEY` | *(Generate 64-char hex)* | High-entropy JWT signing key |
| `JWT_ALGORITHM` | `HS256` | JWT algorithm |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | `60` | Token expiration window |
| `ALLOWED_ORIGINS` | `https://route53-beryl.vercel.app` | Comma-separated frontend domains |
| `OPENAI_API_KEY` | `sk-proj-...` | *(Optional)* OpenAI key for troubleshooting |
| `OPENAI_MODEL` | `gpt-4o` | AI model name |
| `RATE_LIMIT_ENABLED` | `true` | Rate limits brute-force attempts |
| `LOG_LEVEL` | `INFO` | Logging verbosity |

> **Secret Generation Tip**:
> Generate your production `JWT_SECRET_KEY` locally:
> ```bash
> python -c "import secrets; print(secrets.token_hex(32))"
> ```

5. In **Health Check Path**, enter: `/health`
6. Click **Deploy Web Service**.
7. Observe the build log:
   - Docker builds multi-stage runner.
   - `entrypoint.sh` runs `alembic upgrade head`, creating all database tables and indexes automatically.
   - Uvicorn boots and reports: `Application startup complete`.
8. Copy your backend public URL (e.g., `https://route53-backend-xxxx.onrender.com`).

---

## 5. Step 3: Frontend Cloud Deployment (Vercel)

1. Sign in to your [Vercel Dashboard](https://vercel.com).
2. Click **Add New...** → **Project**.
3. Import your GitHub repository: `aditya2005-code/Route53`.
4. Configure Project Settings:
   - **Project Name**: `route53` (or keep existing `route53-beryl`)
   - **Framework Preset**: `Next.js`
   - **Root Directory**: Click *Edit* and select `frontend`.
5. In **Environment Variables**, add:

| Key | Value | Notes |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | `https://your-backend-url.onrender.com` | No trailing slash |

6. Click **Deploy**.
7. Vercel runs `npm ci`, `npm run build` with Turbopack, and deploys the static and serverless artifacts.
8. Copy your frontend URL (e.g., `https://route53-beryl.vercel.app`).

### Synchronize CORS on Backend
Return to the Render backend service settings:
- Update `ALLOWED_ORIGINS` to include the exact frontend Vercel URL:
  ```
  ALLOWED_ORIGINS=https://route53-beryl.vercel.app,http://localhost:3000
  ```
- Save changes to restart backend workers.

---

## 6. Step 4: Local Multi-Container Deployment (Docker Compose)

For testing the complete stack locally in isolated containers:

```bash
# 1. From repository root, create your environment configuration
cp .env.example .env

# 2. Build and launch PostgreSQL, FastAPI Backend, and Next.js Frontend
docker compose up -d --build

# 3. Monitor container health status
docker compose ps

# 4. View logs from all services
docker compose logs -f

# 5. Verify service accessibility:
# - Frontend: http://localhost:3000
# - Backend API: http://localhost:8000
# - Health Probe: http://localhost:8000/health
# - Readiness Probe: http://localhost:8000/health/ready
# - Swagger Docs: http://localhost:8000/docs
```

To stop containers:
```bash
docker compose down
```

---

## 7. Database Migration & Rollback Runbook

### Applying Migrations in Production
Alembic migrations run automatically on container startup via `entrypoint.sh`. If manual execution is preferred:

```bash
# Execute directly via virtualenv
cd backend
python -m alembic upgrade head

# Or inside a running Docker container
docker exec -it route53-backend python -m alembic upgrade head
```

### Rollback Strategy
If a migration failure occurs:
```bash
# Roll back the single most recent migration
python -m alembic downgrade -1

# Check current revision status
python -m alembic current
```

---

## 8. Health and Readiness Monitoring

Route 53 exposes two probe endpoints for cloud load balancers and orchestrators:

### 1. Liveness Probe (`GET /health`)
- **Purpose**: Confirms the web process is running.
- **Response**: `200 OK`
  ```json
  {
    "status": "healthy",
    "service": "route53-api"
  }
  ```

### 2. Readiness Probe (`GET /health/ready`)
- **Purpose**: Validates database connectivity and connection pool health.
- **Healthy Response**: `200 OK`
  ```json
  {
    "status": "ready",
    "database": "connected"
  }
  ```
- **Unhealthy Response**: `503 Service Unavailable`
  ```json
  {
    "status": "not_ready",
    "database": "disconnected"
  }
  ```

---

## 9. Security Best Practices Checklist

- [x] **No Insecure Secrets in Production**: Application refuses to boot in `ENVIRONMENT=production` if default or short `JWT_SECRET_KEY` is present.
- [x] **Security Headers**: Automatic emission of `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `X-XSS-Protection`, and `Strict-Transport-Security`.
- [x] **Rate Limiting**: Brute-force protection on `/auth/login`, `/auth/register`, and `/ai/troubleshoot`.
- [x] **Tenant Data Isolation**: All queries enforce `WHERE user_id = :current_user_id`.
- [x] **Safe Error Responses**: 500 exceptions log tracebacks internally while returning sanitized error messages to public clients.
- [x] **Non-Root Execution**: Docker containers run as unprivileged `appuser` (1001) and `nextjs` (1001).
- [x] **Connection Pool Recovery**: PostgreSQL connection drops handled via `pool_pre_ping=True`.

