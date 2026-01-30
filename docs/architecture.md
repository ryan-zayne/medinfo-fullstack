# Project Architecture

This document provides an overview of MedInfo's codebase structure, architecture patterns, and development guidelines.

## 🏗️ Project Overview

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

## 📁 Monorepo Structure

```
medinfo-fullstack/
├── apps/
│   ├── backend/          # Hono API server
│   │   └── src/
│   │       ├── app/             # Feature modules (auth, diseases, appointments, health-tips)
│   │       ├── config/          # env, corsOptions, rateLimiterOptions
│   │       ├── lib/             # factory (createHonoApp), types, utils
│   │       ├── middleware/      # errorHandler, validateWithZod, pinoLogger
│   │       ├── services/        # ai (huggingFace), cloudinary
│   │       ├── app.ts           # Route composition
│   │       └── server.ts        # Entry point
│   │
│   └── frontend/         # Next.js app
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

### Dependency Flow

`apps/` → `packages/` (never reverse)

---

## 🏛️ Architecture Patterns

### Backend Architecture

**Framework**: Hono.js with TypeScript

- **Feature-based routing**: Each domain (auth, appointments, etc.) has its own route module
- **Middleware stack**: Centralized error handling, logging, validation
- **Service layer**: External integrations (AI, storage, video)
- **Validation**: Zod schemas shared with frontend

**Key Features**:

- JWT authentication with refresh tokens
- AI-powered doctor matching using HuggingFace
- Video meeting creation via Zoom API
- File storage through Cloudinary
- Background job processing with Redis queue

### Frontend Architecture

**Framework**: Next.js 16 App Router with React 19

- **Route groups**: `(home)` for public, `(protected)` for authenticated
- **Component library**: Built on Radix UI primitives
- **State management**: Zustand (client) + TanStack Query (server)
- **Styling**: TailwindCSS 4 with custom medical theme

**Key Features**:

- Role-based dashboards (patient vs doctor)
- Real-time appointment management
- Health information library
- Responsive design with accessibility focus

### Database Architecture

**ORM**: Drizzle with PostgreSQL

- **Schema-driven**: TypeScript-first database definitions
- **Migrations**: Version-controlled schema changes
- **Seeders**: Sample data for development
- **Type safety**: Generated types from schema

---

## 🔄 Development Workflow

### Package Management

**Workspace**: pnpm with Turborepo

- **Shared dependencies**: Defined at root level
- **Development isolation**: Each app has its own dev server
- **Build orchestration**: Turbo handles dependency ordering

### Code Quality

**Linting**: ESLint with custom medical healthcare rules

- **Type checking**: Strict TypeScript configuration
- **Formatting**: Prettier with custom medical naming conventions
- **Pre-commit**: Husky + lint-staged for code quality

### Environment Configuration

**Validation**: Zod schemas for all environment variables

- **Type safety**: Compile-time validation
- **Runtime checks**: Missing variables cause startup failure
- **Multi-environment**: Development vs production configurations

---

## 🔧 Key Integrations

### Authentication Flow

1. **Google OAuth**: Users sign in with Google accounts
2. **JWT tokens**: Backend generates access/refresh tokens
3. **Session management**: Frontend stores tokens securely
4. **Auto-refresh**: Silent token renewal

### AI Doctor Matching

1. **Symptom analysis**: Patient symptoms processed as text
2. **Embeddings**: HuggingFace transforms to vectors
3. **Similarity search**: Cosine similarity with doctor specialties
4. **Ranking**: Ranked recommendations returned

### Video Consultations

1. **Appointment booking**: System creates Zoom meeting
2. **Meeting links**: Secure URLs sent to participants
3. **Join meeting**: Direct integration with Zoom client
4. **Recording**: Optional meeting recording for medical records

### File Management

1. **Upload**: Cloudinary handles medical documents
2. **Processing**: Automatic image optimization
3. **Security**: Type validation and virus scanning
4. **Delivery**: CDN-optimized file serving

---

## 🎯 Development Guidelines

### Code Organization

**Feature-based structure**:

- Group related files by business domain
- Keep API routes and UI components aligned
- Share types and validation schemas

**Package boundaries**:

- `@medinfo/db`: Database operations only
- `@medinfo/env`: Environment validation only
- `@medinfo/shared`: Types and schemas only

### Security Practices

**Authentication**:

- JWT secrets must be cryptographically secure
- Access tokens have short lifetime (5 minutes)
- Refresh tokens stored securely with HTTP-only cookies

**Data validation**:

- All inputs validated with Zod schemas
- Type safety enforced throughout stack
- Runtime validation for all external data

**API security**:

- Rate limiting on all endpoints
- CORS configured for specific origins
- Request logging for audit trails

### Performance Optimizations

**Database**:

- Indexed queries for common lookups
- Connection pooling for high throughput
- Redis caching for frequently accessed data

**Frontend**:

- Code splitting by route
- Image optimization with Next.js
- TanStack Query for intelligent caching

**Backend**:

- Background job processing for long tasks
- AI model lazy loading
- Compression for API responses

---

## 🚀 Getting Started

For complete setup instructions, see:

- [Docker Development Setup](./docker-development.md)
- [Environment Variables Guide](./environment-variables.md)
- [External Services Setup](./external-services.md)
- [Troubleshooting Guide](./troubleshooting.md)

### Quick Architecture Summary

- **Monorepo**: Turborepo + pnpm workspaces
- **Backend**: Hono.js + PostgreSQL + Redis
- **Frontend**: Next.js + React 19 + TailwindCSS
- **Database**: Drizzle ORM with TypeScript
- **Auth**: JWT + Google OAuth
- **External**: Cloudinary, Zoom, HuggingFace
- **Development**: Docker-first with comprehensive documentation

This architecture provides a solid foundation for healthcare applications with emphasis on security, performance, and maintainability.
