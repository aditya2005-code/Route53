<div align="center">

# ☁️ AWS Route 53 Clone

### A production-quality full-stack clone of the AWS Route 53 DNS Management Console

[![Next.js](https://img.shields.io/badge/Next.js-16-black?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115-009688?style=for-the-badge&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![SQLite](https://img.shields.io/badge/SQLite-3-003B57?style=for-the-badge&logo=sqlite&logoColor=white)](https://www.sqlite.org/)
[![SQLAlchemy](https://img.shields.io/badge/SQLAlchemy-2.x-D71F00?style=for-the-badge&logo=python&logoColor=white)](https://www.sqlalchemy.org/)
[![JWT](https://img.shields.io/badge/JWT-Auth-000000?style=for-the-badge&logo=jsonwebtokens&logoColor=white)](https://jwt.io/)
[![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-3.x-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Deployed on Vercel](https://img.shields.io/badge/Vercel-Frontend-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://route53-beryl.vercel.app)
[![Deployed on Render](https://img.shields.io/badge/Render-Backend-46E3B7?style=for-the-badge&logo=render&logoColor=white)](https://route53-backend-2vlc.onrender.com)

<br/>

[🌐 Live Demo](https://route53-beryl.vercel.app) · [📖 API Docs](https://route53-backend-2vlc.onrender.com/docs) · [🐛 Report Bug](https://github.com/yourusername/route53/issues) · [💡 Request Feature](https://github.com/yourusername/route53/issues)

</div>

---

## 🌐 Live Demo

| Service | URL |
|---|---|
| 🖥️ **Frontend** | [https://route53-beryl.vercel.app](https://route53-beryl.vercel.app) |
| ⚙️ **Backend API** | [https://route53-backend-2vlc.onrender.com](https://route53-backend-2vlc.onrender.com) |
| 📖 **Swagger Docs** | [https://route53-backend-2vlc.onrender.com/docs](https://route53-backend-2vlc.onrender.com/docs) |

> **Note:** The backend is hosted on Render's free tier — it may take **~30 seconds** to cold-start on the first request. Please be patient.

---

## 🔑 Demo Credentials

You can log in with the shared demo account or register a new account — both options are fully supported.

```
Email:    pratapcon89@gmail.com
Password: Aditya@123
```

> ✅ Alternatively, click **Register** on the login page to create your own account instantly.

---

## 📌 Project Overview

**AWS Route 53 Clone** is a full-stack, production-quality web application that replicates the core DNS management experience of the AWS Route 53 Console. Built with **Next.js 16**, **FastAPI**, **SQLAlchemy**, and **JWT Authentication**, it demonstrates real-world software engineering practices including:

- Clean layered architecture (API → Service → Repository → Model)
- JWT-based stateless authentication with protected routes
- Full CRUD operations with search, filtering, and server-side pagination
- AWS Console-inspired UI with responsive design
- Swagger/OpenAPI auto-generated API documentation
- Deployed full-stack on Vercel + Render

---

## ✨ Key Features

### 🔐 Authentication
| Feature | Status |
|---|---|
| User Registration | ✅ |
| User Login | ✅ |
| JWT Token Issuance | ✅ |
| Session Restore on Reload | ✅ |
| Logout (Client-side token discard) | ✅ |
| Protected Routes (frontend + backend) | ✅ |
| Password Strength Validation | ✅ |

### 🌐 Hosted Zones
| Feature | Status |
|---|---|
| Create Hosted Zone | ✅ |
| List All Zones (with pagination) | ✅ |
| View Single Zone | ✅ |
| Update Zone Description | ✅ |
| Delete Zone (cascades to records) | ✅ |
| Search by Domain Name | ✅ |
| User-scoped Ownership | ✅ |

### 📋 DNS Records
| Feature | Status |
|---|---|
| Create DNS Record | ✅ |
| List Records (per zone, paginated) | ✅ |
| View Single Record | ✅ |
| Update Record | ✅ |
| Delete Record | ✅ |
| Search by Name or Value | ✅ |
| Filter by Record Type | ✅ |
| Supported Record Types: `A`, `AAAA`, `CNAME`, `MX`, `TXT`, `NS`, `SOA`, `SRV`, `PTR` | ✅ |

### 🎨 UI & UX
| Feature | Status |
|---|---|
| AWS Console-Inspired Design | ✅ |
| Responsive Layout | ✅ |
| Loading Skeletons | ✅ |
| Empty States | ✅ |
| Toast Notifications | ✅ |
| Client-side Form Validation (Zod + React Hook Form) | ✅ |
| API Error Alerts (inline) | ✅ |

---

## 🛠️ Tech Stack

### Frontend
| Technology | Version | Purpose |
|---|---|---|
| [Next.js](https://nextjs.org/) | 16 (Turbopack) | React framework with App Router |
| [TypeScript](https://www.typescriptlang.org/) | 5.x | Type-safe JavaScript |
| [Tailwind CSS](https://tailwindcss.com/) | 3.x | Utility-first styling |
| [React Hook Form](https://react-hook-form.com/) | 7.x | Form state management |
| [Zod](https://zod.dev/) | 3.x | Schema-based form validation |
| [Axios](https://axios-http.com/) | 1.x | HTTP client |
| [Zustand](https://zustand-demo.pmnd.rs/) | 4.x | Lightweight global state |
| [Lucide React](https://lucide.dev/) | Latest | Icon library |

### Backend
| Technology | Version | Purpose |
|---|---|---|
| [FastAPI](https://fastapi.tiangolo.com/) | 0.115 | REST API framework |
| [SQLAlchemy](https://www.sqlalchemy.org/) | 2.x | ORM & database access layer |
| [Pydantic](https://docs.pydantic.dev/) | 2.x | Request/response validation |
| [python-jose](https://github.com/mpdavis/python-jose) | 3.x | JWT encoding/decoding |
| [passlib + bcrypt](https://passlib.readthedocs.io/) | Latest | Password hashing |
| [Alembic](https://alembic.sqlalchemy.org/) | 1.x | Database migrations |
| [Uvicorn](https://www.uvicorn.org/) | 0.x | ASGI server |

### Database
| Technology | Purpose |
|---|---|
| [SQLite](https://www.sqlite.org/) | Lightweight relational database (file-based) |

### Deployment
| Service | Purpose |
|---|---|
| [Vercel](https://vercel.com/) | Frontend hosting with CI/CD |
| [Render](https://render.com/) | Backend API hosting |

---

## 🏗️ High-Level Architecture

```
┌──────────────────────────────────────────────────────────────────────┐
│                            BROWSER                                   │
│               https://route53-beryl.vercel.app                       │
└───────────────────────────────┬──────────────────────────────────────┘
                                │  HTTP / HTTPS
                                ▼
┌──────────────────────────────────────────────────────────────────────┐
│                     NEXT.JS 16 (Vercel)                              │
│                                                                      │
│   ┌─────────────┐   ┌──────────────────┐   ┌─────────────────────┐  │
│   │  App Router │   │  Proxy (proxy.ts) │   │  Auth Context +     │  │
│   │  /app/**    │──▶│  /api/* → API    │   │  Zustand (JWT)      │  │
│   └─────────────┘   └────────┬─────────┘   └─────────────────────┘  │
└────────────────────────────── │ ────────────────────────────────────┘
                                │  REST API calls (Bearer Token)
                                ▼
┌──────────────────────────────────────────────────────────────────────┐
│              FASTAPI + UVICORN (Render)                              │
│          https://route53-backend-2vlc.onrender.com                  │
│                                                                      │
│   ┌───────────┐   ┌───────────────┐   ┌────────────────────────┐    │
│   │  Routers  │──▶│   Services    │──▶│     Repositories       │    │
│   │ /auth/*   │   │ AuthService   │   │  UserRepo              │    │
│   │ /hosted-  │   │ ZoneService   │   │  HostedZoneRepo        │    │
│   │  zones/*  │   │ DNSService    │   │  DNSRecordRepo         │    │
│   └───────────┘   └───────────────┘   └────────────┬───────────┘    │
└───────────────────────────────────────────────────── │ ─────────────┘
                                                        │  SQLAlchemy ORM
                                                        ▼
┌──────────────────────────────────────────────────────────────────────┐
│                        SQLITE DATABASE                               │
│                         route53.db                                   │
│                                                                      │
│        users  ──▶  hosted_zones  ──▶  dns_records                   │
└──────────────────────────────────────────────────────────────────────┘
```

---

## 🔄 Application Flow

```
 USER
  │
  ▼
┌───────────────────────┐
│   Register / Login    │
│  (email + password)   │
└──────────┬────────────┘
           │ POST /auth/login
           ▼
┌───────────────────────┐
│   FastAPI AuthService │
│  Verifies credentials │
│  Hashes password w/   │
│       bcrypt          │
└──────────┬────────────┘
           │
           ▼
┌───────────────────────┐
│   JWT Token Issued    │
│  (HS256, 30-min exp.) │
└──────────┬────────────┘
           │ Token stored in localStorage
           ▼
┌───────────────────────┐
│   Protected Routes    │
│  (frontend + backend) │
│  Bearer token sent    │
│  in every request     │
└──────────┬────────────┘
           │ Token validated by FastAPI dependency
           ▼
┌───────────────────────┐
│    Database (SQLite)  │
│  User-scoped queries  │
│  only return owner's  │
│       own records     │
└───────────────────────┘
```

---

## 🗄️ Database Schema

### `users`
| Column | Type | Constraints |
|---|---|---|
| `id` | INTEGER | PRIMARY KEY, AUTOINCREMENT |
| `name` | VARCHAR(100) | NOT NULL |
| `email` | VARCHAR(255) | NOT NULL, UNIQUE, INDEXED |
| `password` | VARCHAR(255) | NOT NULL (bcrypt hash) |
| `created_at` | DATETIME | DEFAULT now() |
| `updated_at` | DATETIME | DEFAULT now(), ON UPDATE now() |

### `hosted_zones`
| Column | Type | Constraints |
|---|---|---|
| `id` | INTEGER | PRIMARY KEY, AUTOINCREMENT |
| `user_id` | INTEGER | FK → `users.id` ON DELETE CASCADE |
| `domain_name` | VARCHAR(255) | NOT NULL |
| `description` | VARCHAR(500) | NULLABLE |
| `created_at` | DATETIME | DEFAULT now() |
| `updated_at` | DATETIME | DEFAULT now(), ON UPDATE now() |

### `dns_records`
| Column | Type | Constraints |
|---|---|---|
| `id` | INTEGER | PRIMARY KEY, AUTOINCREMENT |
| `hosted_zone_id` | INTEGER | FK → `hosted_zones.id` ON DELETE CASCADE |
| `record_name` | VARCHAR(255) | NOT NULL |
| `record_type` | VARCHAR(50) | NOT NULL (`A`, `AAAA`, `CNAME`, `MX`, `TXT`, ...) |
| `value` | VARCHAR(1024) | NOT NULL |
| `ttl` | INTEGER | NOT NULL, DEFAULT 300 |
| `priority` | INTEGER | NULLABLE (used for MX, SRV) |
| `created_at` | DATETIME | DEFAULT now() |
| `updated_at` | DATETIME | DEFAULT now(), ON UPDATE now() |

---

## 📊 ER Diagram

```
┌──────────────────┐          ┌────────────────────┐          ┌─────────────────────┐
│      users       │          │    hosted_zones     │          │     dns_records      │
├──────────────────┤          ├────────────────────┤          ├─────────────────────┤
│ PK id            │1       N │ PK id              │1       N │ PK id               │
│    name          │◀─────────│ FK user_id         │◀─────────│ FK hosted_zone_id   │
│    email (UNIQUE)│          │    domain_name      │          │    record_name       │
│    password      │          │    description      │          │    record_type       │
│    created_at    │          │    created_at       │          │    value             │
│    updated_at    │          │    updated_at       │          │    ttl               │
└──────────────────┘          └────────────────────┘          │    priority          │
                                                               │    created_at        │
                  cascade delete              cascade delete   │    updated_at        │
                                                               └─────────────────────┘
```

---

## 📁 Folder Structure

```
route53/
├── README.md
├── docker-compose.yml
│
├── backend/                          # FastAPI Backend
│   ├── alembic.ini
│   ├── requirements.txt
│   ├── alembic/                      # Database migrations
│   │   └── versions/
│   ├── tests/                        # Pytest test suite
│   └── app/
│       ├── main.py                   # FastAPI app entrypoint + CORS
│       ├── api/
│       │   ├── api.py                # Root APIRouter
│       │   ├── dependencies.py       # get_current_user dependency
│       │   └── routes/
│       │       ├── auth.py           # /auth/* endpoints
│       │       ├── hosted_zones.py   # /hosted-zones/* endpoints
│       │       └── dns_records.py    # /hosted-zones/{id}/records
│       ├── core/
│       │   ├── config.py             # Settings (pydantic-settings)
│       │   ├── dependencies.py       # get_db session dependency
│       │   ├── exceptions.py         # Custom exception classes
│       │   └── security.py           # JWT + bcrypt utilities
│       ├── db/
│       │   └── database.py           # SQLAlchemy engine + session
│       ├── models/
│       │   ├── user.py               # User ORM model
│       │   ├── hosted_zone.py        # HostedZone ORM model
│       │   └── dns_record.py         # DNSRecord ORM model
│       ├── schemas/
│       │   ├── user.py               # UserCreate / UserResponse
│       │   ├── auth.py               # TokenResponse
│       │   ├── hosted_zone.py        # Zone create/update/response schemas
│       │   ├── dns_record.py         # DNS schemas + RecordType enum
│       │   └── pagination.py         # PaginatedResponse[T] generic
│       ├── services/
│       │   ├── auth_service.py       # Register, login, JWT logic
│       │   ├── hosted_zone_service.py
│       │   └── dns_record_service.py
│       ├── repositories/             # DB query layer
│       └── utils/
│
└── frontend/                         # Next.js 16 Frontend
    ├── next.config.ts
    ├── proxy.ts                      # Next.js API proxy to backend
    ├── package.json
    ├── app/                          # Next.js App Router
    │   ├── layout.tsx                # Root layout
    │   ├── page.tsx                  # Root redirect
    │   ├── auth/
    │   │   ├── login/page.tsx        # Login page
    │   │   └── register/page.tsx     # Register page
    │   ├── dashboard/page.tsx
    │   ├── hosted-zones/
    │   │   ├── page.tsx              # Hosted zones list
    │   │   └── [zoneId]/page.tsx     # Zone detail + DNS records
    │   ├── health-checks/page.tsx
    │   ├── traffic-policies/page.tsx
    │   ├── resolver/page.tsx
    │   ├── profiles/page.tsx
    │   └── settings/page.tsx
    ├── components/
    │   ├── ui/                       # Reusable UI primitives
    │   ├── layout/                   # Sidebar, Navbar
    │   ├── hosted-zones/             # Zone-specific components
    │   └── dns-records/              # DNS record components
    ├── context/
    │   └── AuthContext.tsx           # JWT session context
    ├── hooks/                        # Custom React hooks
    ├── services/
    │   ├── auth.service.ts
    │   ├── hostedZone.service.ts
    │   └── dnsRecord.service.ts
    ├── store/                        # Zustand global state
    ├── types/                        # TypeScript interfaces
    └── utils/                        # Shared utilities
```

---

## 🚀 REST API Endpoints

Base URL: `https://route53-backend-2vlc.onrender.com`  
Interactive Docs: [/docs](https://route53-backend-2vlc.onrender.com/docs)

### 🔐 Authentication

| Method | Endpoint | Auth Required | Description |
|---|---|---|---|
| `POST` | `/auth/register` | ❌ | Create a new user account |
| `POST` | `/auth/login` | ❌ | Login and receive a JWT token |
| `POST` | `/auth/logout` | ✅ | Logout (client discards token) |
| `GET` | `/auth/me` | ✅ | Get current authenticated user |

### 🌐 Hosted Zones

| Method | Endpoint | Auth Required | Description |
|---|---|---|---|
| `POST` | `/hosted-zones/` | ✅ | Create a new hosted zone |
| `GET` | `/hosted-zones/` | ✅ | List zones (search, page, limit) |
| `GET` | `/hosted-zones/{zone_id}` | ✅ | Get a single hosted zone |
| `PUT` | `/hosted-zones/{zone_id}` | ✅ | Update a hosted zone |
| `DELETE` | `/hosted-zones/{zone_id}` | ✅ | Delete a hosted zone (cascades) |

### 📋 DNS Records

| Method | Endpoint | Auth Required | Description |
|---|---|---|---|
| `POST` | `/hosted-zones/{zone_id}/records` | ✅ | Create a DNS record |
| `GET` | `/hosted-zones/{zone_id}/records` | ✅ | List records (search, type, page, limit) |
| `GET` | `/hosted-zones/{zone_id}/records/{record_id}` | ✅ | Get a single DNS record |
| `PUT` | `/hosted-zones/{zone_id}/records/{record_id}` | ✅ | Update a DNS record |
| `DELETE` | `/hosted-zones/{zone_id}/records/{record_id}` | ✅ | Delete a DNS record |

---

## 💻 Local Setup

### Prerequisites

- Python 3.11+
- Node.js 18+
- npm / yarn / pnpm

---

### 🔧 Backend Setup

```bash
# 1. Clone the repository
git clone https://github.com/yourusername/route53.git
cd route53/backend

# 2. Create and activate a virtual environment
python -m venv venv

# Windows PowerShell
.\venv\Scripts\Activate.ps1

# macOS / Linux
source venv/bin/activate

# 3. Install dependencies
pip install -r requirements.txt

# 4. Copy and configure environment file
cp .env.example .env

# 5. Start the development server
uvicorn app.main:app --reload
```

API available at: `http://localhost:8000`  
Swagger UI: `http://localhost:8000/docs`

---

### 🖥️ Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Copy and configure environment file
cp .env.example .env.local

# Start the development server
npm run dev
```

App available at: `http://localhost:3000`

---

## 🔐 Environment Variables (Sample Configuration)
> **Note:** The following environment variables are provided as example values for this assignment. Replace them with your own configuration when deploying the project.

### Backend (`backend/.env`)

```env
# Database
DATABASE_URL=sqlite:///./route53.db

# JWT Settings
SECRET_KEY=your_super_secret_key_change_in_production
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# CORS
ALLOWED_ORIGINS=http://localhost:3000,http://127.0.0.1:3000
```

### Frontend (`frontend/.env.local`)

```env
# Backend API base URL
NEXT_PUBLIC_API_URL=http://localhost:8000
```

---

## 🚢 Deployment Instructions

### Backend → Render

1. Push your code to GitHub.
2. Go to [render.com](https://render.com) → **New Web Service**.
3. Connect your GitHub repository, set **Root Directory** to `backend`.
4. Configure:
   - **Build Command:** `pip install -r requirements.txt`
   - **Start Command:** `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
5. Add environment variables in the Render dashboard:
   ```
   SECRET_KEY=<your_secret>
   ALLOWED_ORIGINS=https://your-frontend.vercel.app
   ```
6. Deploy and copy the public service URL.

### Frontend → Vercel

1. Go to [vercel.com](https://vercel.com) → **New Project**.
2. Import your GitHub repository, set **Root Directory** to `frontend`.
3. Add environment variable:
   ```
   NEXT_PUBLIC_API_URL=https://your-backend.onrender.com
   ```
4. Deploy — Vercel auto-builds and publishes on every push to `main`.

---

## ✅ Testing Checklist

### 🔐 Authentication
- [ ] Register a new account with valid email & password
- [ ] Registration fails gracefully with duplicate email (409 Conflict)
- [ ] Registration shows error for weak password (must contain letter + number)
- [ ] Login with valid credentials succeeds
- [ ] Login fails gracefully with wrong password (401)
- [ ] JWT session persists across browser refresh
- [ ] Logout clears session and redirects to `/login`
- [ ] Protected routes redirect unauthenticated users to `/login`

### 🌐 Hosted Zones CRUD
- [ ] Create a new hosted zone
- [ ] Duplicate zone name returns conflict error
- [ ] View all zones in paginated list
- [ ] Search zones by domain name
- [ ] View single zone detail page
- [ ] Update zone description
- [ ] Delete a zone and verify DNS records are cascade-deleted

### 📋 DNS Records CRUD
- [ ] Create a DNS record in a zone
- [ ] List DNS records with pagination
- [ ] Search records by name or value
- [ ] Filter records by type (A, CNAME, MX, TXT, etc.)
- [ ] Update a DNS record
- [ ] Delete a DNS record

### 🎨 UI & UX
- [ ] Loading skeletons appear during API calls
- [ ] Empty state renders when no zones / records exist
- [ ] Toast notifications appear on success and error
- [ ] Form validation fires before API calls
- [ ] Responsive layout on mobile, tablet, and desktop

---

## 🔮 Future Improvements

| Feature | Priority |
|---|---|
| PostgreSQL support (replace SQLite) | 🔴 High |
| Redis-based token blacklist (true server-side logout) | 🔴 High |
| Email verification on registration | 🟡 Medium |
| Role-based access control (Admin / Viewer) | 🟡 Medium |
| DNS record import/export (CSV / BIND zone file) | 🟡 Medium |
| Cursor-based pagination for large datasets | 🟡 Medium |
| Alembic auto-migration in CI/CD pipeline | 🟡 Medium |
| Unit & integration test coverage > 80% | 🟡 Medium |
| Dark mode toggle | 🟢 Low |
| Activity / audit log per zone | 🟢 Low |
| Docker Compose one-command full-stack launch | 🟢 Low |

---

## 👤 Author

**Aditya Pratap Singh**

- 📧 [singhadityapratap758@gmail.com](mailto:singhadityapratap@gmail.com)
- 🌐 Live App: [https://route53-beryl.vercel.app](https://route53-beryl.vercel.app)
- 📖 API Docs: [https://route53-backend-2vlc.onrender.com/docs](https://route53-backend-2vlc.onrender.com/docs)

---

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

---

<div align="center">

**⭐ If you found this project helpful, please give it a star on GitHub!**

Built with ❤️ by [Aditya Pratap Singh](mailto:singhadityapratap758.com)

</div>
