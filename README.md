# MedInfo-Fullstack

MedInfo Nigeria is a comprehensive healthcare platform built to connect patients with certified doctors, provide free medical information, and facilitate virtual consultations.

## 📚 Documentation

For a detailed developer guide, please refer to [DEV-GUIDE.md](./DEV-GUIDE.md).

## 🚀 Tech Stack

This project is a monorepo managed by **TurboRepo** and **pnpm workspaces**.

### Apps

- **Frontend**: Next.js 16 (App Router), React 19, TailwindCSS 4, Zustand, TanStack Query.
- **Backend**: Hono.js (Node.js), PostgreSQL, Drizzle ORM, Zod.

### Packages

- **@medinfo/backend-db**: Database schema and Drizzle configuration.
- **@medinfo/env**: Environment variable validation.
- **@medinfo/shared**: Shared types and validation schemas.

## 🛠️ Getting Started

### Prerequisites

- Node.js 18+
- pnpm 10.26.0+
- PostgreSQL

### Installation

```bash
# Clone the repository
git clone <repo-url>
cd medinfo-fullstack

# Install dependencies
pnpm install

# Setup environment variables
cp apps/backend/.env.example apps/backend/.env
# (Configure your .env file)

# Database Setup
pnpm db:generate
pnpm db:migrate
# Optional: Seed data
pnpm db:seed

# Start Development
pnpm dev:backend   # Starts backend on http://localhost:8000
pnpm dev:frontend  # Starts frontend on http://localhost:3000
```

## 🏗️ Project Structure

```
medinfo-fullstack/
├── apps/
│   ├── backend/    # Hono API Server
│   └── frontend/   # Next.js Application
└── packages/
    ├── db/         # Database Schema & Migrations
    ├── env/        # Environment Validation
    └── shared/     # Shared Types & Schemas
```
