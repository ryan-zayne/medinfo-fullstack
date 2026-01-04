# MedInfo Developer Guide

A guide to the MedInfo codebase - a full-stack healthcare platform built with TypeScript.

## Project Overview

MedInfo Nigeria connects patients with certified doctors for virtual consultations, provides a medical information library, and supports appointment scheduling with video conferencing.

### Tech Stack

| Layer      | Technology                         |
| ---------- | ---------------------------------- |
| Monorepo   | Turborepo + pnpm workspaces        |
| Backend    | Hono.js on Node.js                 |
| Frontend   | Next.js 16 (App Router) + React 19 |
| Database   | PostgreSQL + Drizzle ORM           |
| Validation | Zod (shared across stack)          |
| State      | TanStack Query + Zustand           |
| Auth       | JWT + Google OAuth                 |
| AI         | HuggingFace Transformers           |
| Storage    | Cloudinary                         |
| Video      | Zoom API                           |

---

## Monorepo Structure

```
medinfo-fullstack/
├── apps/
│   ├── backend/         # Hono API server
│   │   └── src/
│   │       ├── app/             # Feature modules (auth, diseases, appointments, health-tips)
│   │       ├── config/          # env, corsOptions, rateLimiterOptions
│   │       ├── lib/             # factory (createHonoApp), types, utils
│   │       ├── middleware/      # errorHandler, validateWithZod, pinoLogger
│   │       ├── services/        # ai (huggingFace), cloudinary
│   │       ├── app.ts           # Route composition
│   │       └── server.ts        # Entry point
│   │
│   └── frontend/        # Next.js app
│       ├── app/
│       │   ├── (home)/          # Public routes (landing, auth, library, daily-tips)
│       │   ├── (protected)/     # Authenticated routes
│       │   │   └── dashboard/   # Role-based (patient/doctor)
│       │   ├── Providers.tsx    # React Query, progress provider
│       │   └── layout.tsx
│       ├── components/
│       │   ├── common/          # Logo, NavLink, Show, For, Await, DropZoneInput
│       │   ├── icons/           # Icon components
│       │   └── ui/              # Button, Form, Select, Dialog, Accordion, etc.
│       └── lib/
│           ├── api/             # callBackendApi client with plugins
│           ├── react-query/     # queryOptions, mutationOptions
│           ├── utils/           # cn, common helpers
│           └── zustand/         # theme store
│
└── packages/
    ├── db/                      # Drizzle ORM
    │   └── src/
    │       ├── schema/          # Table definitions (auth, appointments, diseases)
    │       ├── migrations/      # SQL migrations
    │       ├── seeders/         # diseases seeder
    │       └── db.ts            # Database connection
    │
    ├── env/                     # Environment validation with Zod
    │   └── src/backend-env.ts
    │
    └── shared/                  # Shared types & API schemas
        └── src/validation/backendApiSchema.ts
```

**Dependency Flow**: `apps/` → `packages/` (never reverse)

---

## Getting Started

### Prerequisites

- Node.js 18+
- pnpm 10.27.0 (`corepack enable`)
- PostgreSQL database

### Setup

```bash
git clone <repo-url>
cd medinfo-fullstack
pnpm install
cp apps/backend/.env.example apps/backend/.env
# Edit .env with your credentials
pnpm db:generate && pnpm db:migrate && pnpm db:push
pnpm dev:backend  # http://localhost:8000
pnpm dev:frontend # http://localhost:3000
```

### Key Commands

```bash
# Development
pnpm dev:backend      # Start backend
pnpm dev:frontend     # Start frontend
pnpm dev:db           # Start PostgreSQL via Docker

# Build & Lint
pnpm build            # Build all packages
pnpm lint:eslint      # Lint entire monorepo
pnpm lint:type-check  # Type check all packages

# Database
pnpm db:generate      # Generate Drizzle types
pnpm db:migrate       # Run migrations
pnpm db:push          # Push schema (dev only)
pnpm db:seed          # Seed data
pnpm db:studio        # Open Drizzle Studio GUI

# Docker
docker-compose up -d  # Start all services
docker-compose down   # Stop all services
```

---

## Backend Architecture

### App Factory Pattern

The backend is initialized in `src/lib/factory/createHonoApp.ts` which applies:

- CORS configuration from `src/config/corsOptions.ts`
- Rate limiting from `src/config/rateLimiterOptions.ts`
- Secure headers
- Request ID and pino logger
- Not found and error handlers

### Route Composition

Routes are composed in `src/app/app.ts`:

```typescript
app.basePath("/api/v1")
	.route("", healthTipsRoutes)
	.route("", diseasesRoutes)
	.route("", authRoutes)
	.route("", appointmentsRoutes);
```

### Feature Module Pattern

Each feature follows this structure:

```
src/app/{feature}/
├── routes.ts           # Hono route definitions
├── middleware/         # Feature-specific middleware
│   └── authMiddleware/
└── services/           # Business logic & external integrations
```

Example: `src/app/auth/`, `src/app/appointments/`, `src/app/diseases/`

### Key Patterns

**Validation** - All inputs validated with Zod via `validateWithZodMiddleware`:

```typescript
.post("/signin", validateWithZodMiddleware("json", schema.body), handler)
```

**Error Handling** - Use `AppError` class:

```typescript
throw new AppError({ code: 404, message: "User not found" });
```

**Responses** - Use `AppJsonResponse` for consistency:

```typescript
return AppJsonResponse(ctx, { data, message: "Success", schema });
```

**Cookies** - Managed via `src/app/auth/services/cookie.ts`:

- httpOnly, secure, sameSite configured
- Production uses partitioned cookies

### External Services

| Service | Location                         | Purpose                                    |
| ------- | -------------------------------- | ------------------------------------------ |
| AI      | `src/services/ai/huggingFace.ts` | HuggingFace embeddings for doctor matching |
| Storage | `src/services/cloudinary/`       | File uploads (doctor licenses)             |
| Video   | `src/services/zoomApi/`          | Zoom meeting creation/deletion             |

---

## Frontend Architecture

### Route Groups

```
app/
├── (home)/                   # Public pages (navbar + footer)
│   ├── auth/                 # signin, signup
│   ├── daily-tips/
│   ├── library/
│   ├── layout.tsx
│   └── page.tsx              # Landing page
│
├── (protected)/              # Authenticated (requires session)
│   └── dashboard/
│       ├── (role)/
│       │   ├── patient/
│       │   └── doctor/
│       └── template.tsx      # Dashboard layout
│
├── Providers.tsx             # React Query, progress bar
└── layout.tsx                # Root layout
```

### State Management

- **TanStack Query**: Server state, caching, mutations
- **Zustand**: Client state (theme store)
- **React Hook Form + Zod**: Form validation

### API Client

The API client in `lib/api/callBackendApi/callBackendApi.ts` uses `@zayne-labs/callapi` with:

- **Base URL**: localhost:8000 (dev) or production API
- **Credentials**: include (cookies sent automatically)
- **Plugins**:
   - `authErrorRedirectPlugin`: Redirects to /auth/signin on 401
   - `toastPlugin`: Shows success/error toasts via sonner
   - `loggerPlugin`: Logs errors

### React Query Patterns

Query options provide caching and stale time configuration:

```typescript
// Cached forever
healthTipsQuery();

// Query with pagination
diseasesQuery({ page: 1, limit: 10 });

// Mutations with toast handling
googleOAuthMutation();
bookAppointmentMutation();
```

### Component Library

| Location             | Components                                                                               |
| -------------------- | ---------------------------------------------------------------------------------------- |
| `components/common/` | Logo, NavLink, Show, For, ForWithWrapper, Switch, Await, Overlay, DropZoneInput          |
| `components/icons/`  | Icon components (ArrowBackIcon, CalendarIcon, etc.)                                      |
| `components/ui/`     | Button, Form, Select, Dialog, Accordion, Carousel, DateTimePicker, DropdownMenu, Popover |

---

## Shared Packages

### @medinfo/db

Database layer using Drizzle ORM with PostgreSQL. Schemas define:

- Tables with columns, indexes, constraints
- Auto-generated Zod schemas via `createInsertSchema`/`createSelectSchema`
- Type inference with `$inferInsert`/`$inferSelect`

### @medinfo/env

Zod-based environment validation in `packages/env/src/backend-env.ts`. All env vars validated at startup.

### @medinfo/shared

Shared code used by both apps:

- API request/response schemas in `backendApiSchema.ts`
- TypeScript types generated from Zod schemas
- Provides end-to-end type safety

---

## Authentication System

### JWT Token Flow

- **Access Token**: Short-lived (15 min), validates API requests
- **Refresh Token**: Long-lived (7 days), stored in DB as jsonb array
- **Rotation**: Each refresh replaces old token in whitelist
- **Reuse Detection**: Clears all tokens if reused token not in whitelist

### Cookie Storage

- httpOnly (inaccessible to JS)
- secure (HTTPS only)
- sameSite (lax in dev, none in prod)
- partitioned (prod only)

### Google OAuth Flow

1. Client calls `/auth/google?role=patient|doctor`
2. Backend generates state + code verifier, stores in cookies
3. Redirects to Google consent screen
4. Google calls back to `/auth/google/callback`
5. Backend exchanges code for tokens, creates/finds user
6. Generates JWT tokens, sets cookies, redirects to frontend

### Session Validation

Middleware checks tokens in order:

1. Validate access token
2. If expired/invalid, validate refresh token against DB whitelist
3. On success, set user in context
4. On failure, return 401

---

## Key Features

### Disease Library

- Public endpoint with search and pagination
- Data seeded from `packages/db/src/data/diseases.json`
- CRUD operations for admins

### Health Tips

- Fetches from external API
- Cached indefinitely with `staleTime: Infinity`
- Random selection with limit

### AI Doctor Matching

- Uses HuggingFace `e5-small-v2` embeddings
- **Process**:
   1. Create embedding vector for patient's reason/symptoms
   2. Create embedding vectors for each doctor's specialty
   3. Compute cosine similarity between patient vector and each doctor
   4. Rank by similarity score, return top 3
- Location: `src/app/appointments/services/matchDoctorAlgorithm.ts`

### Appointments with Zoom

- Patient provides: reason, allergies, medical conditions, health insurance
- AI matches with doctors
- Zoom meeting created with patient and doctor as invitees
- Meeting URL stored for video consultation
- Cancellation deletes both appointment and Zoom meeting

**Endpoints**:

- `POST /appointments/match-doctor` - AI doctor matching
- `POST /appointments/book` - Create appointment + Zoom meeting
- `GET /appointments/doctor/all` - Doctor's appointments
- `GET /appointments/patient/all` - Patient's appointments
- `DELETE /appointments/cancel` - Cancel appointment + meeting

---

## Database

### Schema Files

| Table        | File                     | Purpose                        |
| ------------ | ------------------------ | ------------------------------ |
| users        | `schema/auth.ts`         | Patients and doctors           |
| appointments | `schema/appointments.ts` | Appointments with Zoom details |
| diseases     | `schema/diseases.ts`     | Disease library                |

### Database Operations

```bash
# Make schema changes
1. Edit schema in packages/db/src/schema/
2. pnpm db:generate
3. pnpm db:migrate
4. pnpm db:studio  # Verify
```

### Seeders

- Diseases seeded from `packages/db/src/data/diseases.json`
- Uses `onConflictDoNothing()` for idempotent seeding

---

## Security

| Feature               | Implementation                           |
| --------------------- | ---------------------------------------- |
| Auth Tokens           | JWT with separate access/refresh secrets |
| Token Storage         | httpOnly, secure, sameSite cookies       |
| Token Whitelist       | Refresh tokens in DB jsonb array         |
| Password Hashing      | bcrypt-like hashing                      |
| Rate Limiting         | hono-rate-limiter on all routes          |
| CORS                  | Configured allowed origins               |
| Secure Headers        | helmet-like via hono/secure-headers      |
| Input Validation      | Zod schemas for all inputs               |
| CSRF Protection       | State + code verifier in OAuth           |
| Login Retry Limits    | Max 3 attempts in 12 hours               |
| Token Reuse Detection | Clears all tokens on reuse               |

---

## Docker

### Services

| Service             | Image              | Purpose                   |
| ------------------- | ------------------ | ------------------------- |
| medinfo-postgres-db | postgres:18-alpine | PostgreSQL database       |
| medinfo-db-setup    | Custom Dockerfile  | Runs migrations and seeds |
| medinfo-backend     | Custom Dockerfile  | API server on port 8000   |

### Setup Flow

1. PostgreSQL starts and becomes healthy
2. medinfo-db-setup runs (generate, migrate, seed)
3. Backend starts and waits for db-setup completion

---

## Common Workflows

### Adding a Backend Feature

1. Create directory in `apps/backend/src/app/{feature}/`
2. Add `routes.ts` with Hono route definitions
3. Add `services/` for business logic
4. Add `middleware/` if needed
5. Register route in `apps/backend/src/app/app.ts`
6. Add API schemas in `packages/shared/src/validation/backendApiSchema.ts`

### Adding a Frontend Feature

1. Create page in `apps/frontend/app/`
2. Add query options in `lib/react-query/queryOptions.ts`
3. Add mutation options in `lib/react-query/mutationOptions.ts`
4. Use API client from `lib/api/callBackendApi/`

### Database Schema Changes

1. Edit schema in `packages/db/src/schema/`
2. Run `pnpm db:generate`
3. Run `pnpm db:migrate`
4. Update seeders if needed
5. Verify with `pnpm db:studio`

### Environment Variables

Required in `apps/backend/.env`:

```bash
# Database
DATABASE_URL_DEV=
DATABASE_URL_PROD=

# Auth
ACCESS_SECRET=
REFRESH_SECRET=
ACCESS_JWT_EXPIRES_IN=
REFRESH_JWT_EXPIRES_IN=

# OAuth
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=

# Storage
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
CLOUDINARY_CLOUD_NAME=

# Zoom
ZOOM_CLIENT_ID=
ZOOM_CLIENT_SECRET=
ZOOM_ACCOUNT_ID=

# Server
PORT=8000
NODE_ENV=
```

---

## Code Conventions

- **No comments** unless explicitly requested
- Follow existing patterns in each feature module
- Use shared packages for types and schemas
- Validate with Zod, throw `AppError` on failure
- Use `AppJsonResponse` for consistent API responses
- Run `pnpm lint:eslint` and `pnpm lint:type-check` before committing
- Component files prefixed with `-` are private (e.g., `-components/NavBar.tsx`)
