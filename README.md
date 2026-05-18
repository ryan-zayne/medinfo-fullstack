# MedInfo

MedInfo Nigeria is a healthcare platform designed to connect patients with certified doctors, provide medical information, and facilitate virtual consultations.

## Documentation

- [Docker Setup](./docs/docker-development.md)
- [Environment Configuration](./docs/environment-variables.md)
- [External API Setup](./docs/external-services.md)
- [Troubleshooting](./docs/troubleshooting.md)
- [Architecture Guidelines](./docs/architecture.md)

## Tech Stack

- **Frontend**: Next.js 16 (App Router), React 19, TailwindCSS 4, Zustand, TanStack Query
- **Backend**: Hono.js (Node.js), PostgreSQL 18, Drizzle ORM, Zod, Redis 8
- **Monorepo**: pnpm workspaces
- **Shared Packages**: `@medinfo/db`, `@medinfo/env`, `@medinfo/shared`

## Quick Start

### Prerequisites

- Docker Engine / Docker Desktop
- Node.js 18+
- pnpm 10.33.3+

### Setup Instructions

1. **Clone the repository**
   ```bash
   git clone <repo-url>
   cd medinfo
   pnpm install
   ```

2. **Configure environment variables**
   ```bash
   cp apps/backend/.env.example apps/backend/.env
   ```
   You will need to configure the following external services in your `.env` file:
   - Google OAuth (Client ID & Secret)
   - Cloudinary (Cloud Name, API Key & Secret)
   - Zoom API (Account ID, Client ID & Secret)
   - Resend Email Service (Optional)

   Generate local secrets for JWT:
   ```bash
   ACCESS_SECRET=your-access-secret-min-32-chars
   REFRESH_SECRET=your-refresh-secret-min-32-chars
   ```

3. **Start Docker services**
   ```bash
   docker compose up -d
   ```
   Wait until services are healthy. You can check the status using `docker compose ps`.

4. **Initialize the database**
   ```bash
   pnpm db:generate
   pnpm db:migrate
   pnpm db:seed # Optional
   ```

5. **Start the frontend development server**
   ```bash
   pnpm dev:frontend
   ```

### Access Points

- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- API Documentation: Bruno Collection at `apps/backend/(bruno)-(medinfo)`

## Development Workflow

All backend services, including the API server, database, and cache, are configured to run in Docker containers.

### Service Overview

| Service | Container | Port | Purpose |
|---------|-----------|------|---------|
| PostgreSQL | `medinfo-postgres-db` | 5432 | Primary database |
| Redis Cache | `medinfo-redis-cache` | 6379 | Session storage |
| Redis Queue | `medinfo-redis-queue` | 6380 | Job processing |
| Backend API | `medinfo-backend` | 8000 | API server |

### Common Commands

**Docker**
```bash
docker compose up -d           # Start all services
docker compose down            # Stop all services
docker compose logs -f backend # View backend logs
docker compose restart backend # Restart backend container
```

**Database**
```bash
pnpm db:generate               # Generate Drizzle schema
pnpm db:migrate                # Run migrations
pnpm db:seed                   # Seed sample data
pnpm db:studio                 # Open Drizzle Studio
```

**Linting and Formatting**
```bash
pnpm lint:eslint
pnpm lint:format
pnpm lint:type-check
```

## Troubleshooting

### Port Conflicts
If services fail to start, check for local processes using ports 5432, 6379, 6380, or 8000. Stop conflicting local services or modify the exposed ports in `docker-compose.yaml`.

### Database Connection Issues
To test the database connection directly from the backend container:
```bash
docker compose exec backend node -e "
const { Client } = require('pg');
const client = new Client({ connectionString: process.env.DATABASE_URL_DEV });
client.connect().then(() => console.log('Connected')).finally(() => client.end());"
```

### Missing Environment Variables
Check backend logs for missing environment variables:
```bash
docker compose logs backend | grep "Missing required environment variable"
```

For more detailed guides, see the [troubleshooting documentation](./docs/troubleshooting.md).

## Project Structure

```text
medinfo/
├── apps/
│   ├── backend/          # Hono API Server
│   └── frontend/         # Next.js Application
├── packages/
│   ├── db/               # Database Schema & Migrations
│   ├── env/              # Environment Validation
│   └── shared/           # Shared Types & Schemas
├── docs/                 # Documentation
├── docker-compose.yaml   # Docker configuration
└── README.md
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Implement your changes
4. Run tests and linting checks
5. Submit a pull request

## License

This project is licensed under the MIT License. See the LICENSE file for details.
