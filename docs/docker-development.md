# Docker Development Setup

This guide covers the Docker-based development workflow for MedInfo. All services run in isolated containers to ensure consistency.

## Overview

The Docker setup includes:

- **PostgreSQL 18** - Primary database
- **Redis 8 (Cache)** - Session storage and caching
- **Redis 8 (Queue)** - Background job processing
- **Backend API** - Hono.js application server

## Quick Start

### Prerequisites

- **Docker Desktop** or Docker Engine
- **Docker Compose**
- **Node.js 18+**
- **pnpm 10.33.3+**

### Setup Instructions

```bash
# Clone and set up project
git clone <repo-url>
cd medinfo
pnpm install

# Configure environment variables
cp apps/backend/.env.example apps/backend/.env

# Start all backend services
docker compose up -d

# Check service status
docker compose ps

# Initialize database
pnpm db:generate
pnpm db:migrate
pnpm db:seed  # Optional

# Start frontend development server
pnpm dev:frontend
```

### Access Points

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **API Documentation**: Bruno Collection at `apps/backend/(bruno)-(medinfo)`

## Service Configuration

### Port Mapping

| Service | Container | Host Port | Internal Port | Purpose |
|---|---|---|---|---|
| PostgreSQL | `medinfo-postgres-db` | 5432 | 5432 | Primary database |
| Redis Cache | `medinfo-redis-cache` | 6379 | 6379 | Session storage |
| Redis Queue | `medinfo-redis-queue` | 6380 | 6379 | Job processing |
| Backend API | `medinfo-backend` | 8000 | 8000 | API server |

## External Services Setup

Configure these services in `apps/backend/.env`:

1. **Google OAuth** - User authentication
2. **Cloudinary** - File storage
3. **Zoom API** - Video meeting creation
4. **Email Service** - Appointment reminders (optional)

See [external-services.md](./external-services.md) for details.

### Example Configuration

```bash
# apps/backend/.env
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
CLOUDINARY_CLOUD_NAME=your-cloudinary-name
CLOUDINARY_API_KEY=your-cloudinary-key
CLOUDINARY_API_SECRET=your-cloudinary-secret
ZOOM_ACCOUNT_ID=your-zoom-account-id
ZOOM_CLIENT_ID=your-zoom-client-id
ZOOM_CLIENT_SECRET=your-zoom-client-secret

# Generated secrets
ACCESS_SECRET=your-access-secret-min-32-chars
REFRESH_SECRET=your-refresh-secret-min-32-chars
```

## Development Workflow

### Standard Operations

```bash
# Start containers
docker compose up -d

# Check service health
docker compose ps

# Start frontend development server
pnpm dev:frontend

# Monitor backend logs
docker compose logs -f backend

# Stop all containers
docker compose down
```

### Database Operations

```bash
# Generate and run migrations
pnpm db:generate
pnpm db:migrate

# Reset database (destructive)
pnpm db:migrate:reset

# Seed with sample data
pnpm db:seed

# Open database studio
pnpm db:studio
```

### Debugging

```bash
# Access backend container shell
docker compose exec backend sh

# Access PostgreSQL CLI
docker compose exec medinfo-postgres-db psql -U postgres medinfo

# Test Redis connections
docker compose exec medinfo-redis-cache redis-cli ping
docker compose exec medinfo-redis-queue redis-cli ping
```

## Port Configuration

If services fail to start, check for local port conflicts.

### Diagnosing Conflicts

```bash
# Linux
netstat -tulpn | grep -E ":(5432|6379|6380|8000)"

# macOS
lsof -i :5432 -i :6379 -i :6380 -i :8000

# Windows
netstat -an | findstr ":5432 :6379 :6380 :8000"
```

### Resolving Conflicts

1. Stop conflicting local services (e.g., local PostgreSQL or Redis).
2. Modify port mappings in `docker-compose.yaml`.
3. Alternatively, keep services internal to the Docker network.

## Scripts Overview

```bash
# Docker commands
docker compose up -d           # Start all services
docker compose down            # Stop all services
docker compose logs -f backend # View backend logs
docker compose ps              # Check service status

# Database commands
pnpm db:generate               # Generate Drizzle schema
pnpm db:migrate                # Run migrations
pnpm db:seed                   # Seed sample data
pnpm db:studio                 # Open Drizzle Studio

# Application
pnpm dev:frontend              # Start frontend server

# Code quality
pnpm lint:eslint               # Run ESLint
pnpm lint:format               # Format code
pnpm lint:type-check           # TypeScript type checking
```

## Troubleshooting

### Container Startup Issues

```bash
# Verify Docker is running
docker version

# Check for port conflicts
netstat -tulpn | grep -E ":(5432|6379|6380|8000)"

# Inspect logs
docker compose logs
```

### Database Connection Failures

```bash
# Verify database health
docker compose exec medinfo-postgres-db pg_isready

# Test connection via Node.js
docker compose exec backend node -e "
const { Client } = require('pg');
const client = new Client({ connectionString: process.env.DATABASE_URL_DEV });
client.connect().then(() => console.log('Database connected')).finally(() => client.end());"
```

### Missing Environment Variables

```bash
# Check injected variables
docker compose exec backend env | grep -E "(GOOGLE_|CLOUDINARY_|ZOOM_)"

# Look for specific missing variable errors
docker compose logs backend | grep "Missing required environment variable"
```

For more details, refer to [troubleshooting.md](./troubleshooting.md).

## Setup Checklist

- [ ] Docker Desktop installed and running
- [ ] Node.js 18+ and pnpm installed
- [ ] Environment file populated with external service credentials
- [ ] Docker containers started and running healthy
- [ ] Database migrations applied
- [ ] Frontend accessible at http://localhost:3000
- [ ] Backend API accessible at http://localhost:8000
- [ ] External services integrated (OAuth, Cloudinary, Zoom)

## Useful Links

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **API Documentation**: Bruno Collection at `apps/backend/(bruno)-(medinfo)`
- **Database Studio**: `pnpm db:studio`

For complete troubleshooting, see [troubleshooting.md](./troubleshooting.md).
