# Docker Development Setup

This guide covers the complete Docker-based development workflow for MedInfo. All services run in isolated containers for consistency across development environments.

## 🐳 Overview

The Docker setup includes:

- **PostgreSQL 18** - Primary database
- **Redis 8 (Cache)** - Session storage and caching
- **Redis 8 (Queue)** - Background job processing
- **Backend API** - Hono.js application server

## 🚀 Quick Start

### Prerequisites

- **Docker Desktop** (recommended) or Docker Engine
- **Docker Compose** (included with Docker Desktop)
- **Node.js 18+** (for frontend development)
- **pnpm 10.33.0+** (package manager)

### Step-by-Step Setup

```bash
# Clone and set up project
git clone <repo-url>
cd medinfo-fullstack
pnpm install

# Configure environment (see External Services section below)
cp apps/backend/.env.example apps/backend/.env

# Start all backend services
docker compose up -d

# Wait for services to be healthy (30-60 seconds)
docker compose ps

# Initialize database (run once)
pnpm db:generate
pnpm db:migrate
pnpm db:seed  # Optional

# Start frontend (local, not in Docker)
pnpm dev:frontend
```

### Access Your Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **API Documentation**: http://localhost:8000/api/docs

## 📋 Service Configuration

### Port Mapping

| Service     | Container             | Host Port | Internal Port | Purpose          |
| ----------- | --------------------- | --------- | ------------- | ---------------- |
| PostgreSQL  | `medinfo-postgres-db` | 5432      | 5432          | Primary database |
| Redis Cache | `medinfo-redis-cache` | 6379      | 6379          | Session storage  |
| Redis Queue | `medinfo-redis-queue` | 6380      | 6379          | Job processing   |
| Backend API | `medinfo-backend`     | 8000      | 8000          | API server       |

## 🔌 External Services Setup

You must configure these external services in `apps/backend/.env`:

### Required Services

1. **Google OAuth** - User authentication
2. **Cloudinary** - File storage for medical documents
3. **Zoom API** - Video meeting creation
4. **Email Service** - Appointment reminders (optional)

For detailed setup instructions, see **[external-services.md](./external-services.md)**.

### Quick Configuration

```bash
# Edit apps/backend/.env
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
CLOUDINARY_CLOUD_NAME=your-cloudinary-name
CLOUDINARY_API_KEY=your-cloudinary-key
CLOUDINARY_API_SECRET=your-cloudinary-secret
ZOOM_ACCOUNT_ID=your-zoom-account-id
ZOOM_CLIENT_ID=your-zoom-client-id
ZOOM_CLIENT_SECRET=your-zoom-client-secret

# Generate secrets
ACCESS_SECRET=your-access-secret-min-32-chars
REFRESH_SECRET=your-refresh-secret-min-32-chars
```

## 🔧 Development Workflow

### Daily Development

```bash
# Start containers (if stopped)
docker compose up -d

# Check service health
docker compose ps

# Start frontend development server
pnpm dev:frontend

# Monitor logs in real-time
docker compose logs -f backend

# Stop all containers
docker compose down
```

### Database Operations

```bash
# Generate and run migrations
pnpm db:generate
pnpm db:migrate

# Reset database (⚠️ destructive)
pnpm db:migrate:reset

# Seed with sample data
pnpm db:seed

# Open database studio
pnpm db:studio
```

### Debugging

```bash
# Connect to backend container
docker compose exec backend sh

# Connect to PostgreSQL
docker compose exec medinfo-postgres-db psql -U postgres medinfo

# Test Redis connections
docker compose exec medinfo-redis-cache redis-cli ping
docker compose exec medinfo-redis-queue redis-cli ping
```

## 📋 Port Configuration

⚠️ **Port conflicts are common**. If services fail to start:

### Check for Conflicts

```bash
# Check port usage
netstat -tulpn | grep ":5432\|:6379\|:6380\|:8000"  # Linux
lsof -i :5432 -i :6379 -i :6380 -i :8000              # macOS
netstat -an | findstr ":5432 :6379 :6380 :8000"          # Windows
```

### Solutions

1. **Stop conflicting local services** (PostgreSQL, Redis)
2. **Use alternative ports** (edit `docker-compose.yaml`)
3. **Remove port exposures** (Docker internal only)

## 🔧 Development Scripts

```bash
# Docker operations
docker compose up -d          # Start all services
docker compose down           # Stop all services
docker compose logs -f backend # View backend logs
docker compose ps             # Check service status

# Database operations
pnpm db:generate             # Generate Drizzle schema
pnpm db:migrate              # Run migrations
pnpm db:seed                 # Seed sample data
pnpm db:studio               # Open Drizzle Studio

# Development
pnpm dev:frontend           # Start frontend (backend runs in Docker)

# Code quality
pnpm lint:eslint           # Run ESLint
pnpm lint:format           # Format code
pnpm lint:type-check       # TypeScript type checking
```

## 🚨 Common Issues

### Docker Services Won't Start

```bash
# Check Docker Desktop is running
docker version

# Check port conflicts
netstat -tulpn | grep -E ":(5432|6379|6380|8000)"

# View error logs
docker compose logs
```

### Database Connection Failed

```bash
# Check database health
docker compose exec medinfo-postgres-db pg_isready

# Test connection
docker compose exec backend node -e "
const { Client } = require('pg');
const client = new Client({ connectionString: process.env.DATABASE_URL_DEV });
client.connect().then(() => console.log('Database connected!')).finally(() => client.end());"
```

### Environment Variable Errors

```bash
# Verify environment variables
docker compose exec backend env | grep -E "(GOOGLE_|CLOUDINARY_|ZOOM_)"

# Check for missing variables in logs
docker compose logs backend | grep "Missing required environment variable"
```

For complete troubleshooting, see **[troubleshooting.md](./troubleshooting.md)**.

## 📱 Quick Setup Checklist

- [ ] Docker Desktop installed and running
- [ ] Node.js 18+ and pnpm installed
- [ ] Environment file configured with external services
- [ ] Docker containers started and healthy
- [ ] Database migrations applied
- [ ] Frontend accessible at http://localhost:3000
- [ ] Backend API accessible at http://localhost:8000
- [ ] External services connected (OAuth, Cloudinary, Zoom)

## 🔗 Links

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **API Documentation**: http://localhost:8000/api/docs
- **Database Studio**: `pnpm db:studio` (when services running)

For complete troubleshooting, see **[troubleshooting.md](./troubleshooting.md)**.
