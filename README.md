# Digital Proof of Work (DPOW) — Part 1 Foundation

Full-stack platform for students to build verifiable digital portfolios.

## Stack

**Backend:** Node.js, Express, MongoDB, Mongoose, JWT, Bcrypt, Multer, Cloudinary, Zod  
**Frontend:** Next.js, React, Tailwind CSS, Shadcn-style UI, Axios, React Hook Form, Zod, TanStack Query

## Project structure

```
backend/     Express REST API (MVC)
frontend/    Next.js 15 App Router UI
```

## Prerequisites

- Node.js 18+
- MongoDB running locally or a MongoDB Atlas URI
- Cloudinary account (for file uploads)
- SMTP credentials (optional in dev — emails log to console)

## Setup

### 1. Backend

```bash
cd backend
cp .env.example .env
# Edit .env with your MongoDB URI, JWT secrets, Cloudinary keys
npm install
npm run dev
```

API runs at `http://localhost:5000`

### 2. Frontend

```bash
cd frontend
cp .env.local.example .env.local
npm install
npm run dev
```

App runs at `http://localhost:3000`

## API endpoints

| Route | Description |
|-------|-------------|
| `POST /api/auth/register` | Register + send verification email |
| `GET /api/auth/verify-email/:token` | Verify email |
| `POST /api/auth/login` | Login (access + refresh tokens) |
| `POST /api/auth/refresh` | Rotate tokens |
| `POST /api/auth/logout` | Invalidate refresh token |
| `POST /api/auth/forgot-password` | Send reset email |
| `POST /api/auth/reset-password/:token` | Reset password |
| `GET /api/profiles/me` | Get own profile |
| `POST /api/profiles` | Create profile (student) |
| `PATCH /api/profiles/me` | Update profile |
| `POST /api/profiles/me/avatar` | Upload avatar |
| `GET/POST/PATCH/DELETE /api/projects` | Project CRUD |
| `GET/POST/DELETE /api/certificates` | Certificate management |
| `GET /api/users` | User management (admin) |

## Dev notes

- **Email verification:** In dev without SMTP, verification links are printed in the backend console (jsonTransport).
- **Manual verify:** You can also mark a user verified directly in MongoDB for testing: `{ isEmailVerified: true }`.
- **Roles:** `student`, `verifier`, `recruiter`, `admin` — Part 1 UI focuses on the student dashboard.

## Security

- Helmet, CORS, rate limiting
- Bcrypt (cost 12), JWT access (15m) + refresh (7d) with rotation
- Zod validation on all inputs
- RBAC middleware on protected routes
