# MedInfo-Fullstack

MedInfo Nigeria is a comprehensive healthcare platform built to connect patients with certified doctors, provide free medical information, and facilitate virtual consultations.

## 🐳 Docker-First Development

This project uses **Docker** for consistent development environments. All backend services run in isolated containers.

**Quick Setup (5 minutes)**

```bash
git clone <repo-url>
cd medinfo-fullstack
pnpm install
cp apps/backend/.env.example apps/backend/.env
# Configure external services (see below)
docker compose up -d
pnpm db:migrate
pnpm dev:frontend
```

## 📚 Documentation

- **[docs/docker-development.md](./docs/docker-development.md)** - Docker setup and workflow
- **[docs/environment-variables.md](./docs/environment-variables.md)** - Environment configuration
- **[docs/external-services.md](./docs/external-services.md)** - External API setup
- **[docs/troubleshooting.md](./docs/troubleshooting.md)** - Common issues and solutions
- **[docs/architecture.md](./docs/architecture.md)** - Project architecture and development guidelines

## 🚀 Tech Stack

### Docker Services

- **PostgreSQL 18** - Primary database
- **Redis 8** - Cache and job queue (2 instances)
- **Backend** - Hono.js API server

### Applications

- **Frontend**: Next.js 16 (App Router), React 19, TailwindCSS 4, Zustand, TanStack Query
- **Backend**: Hono.js (Node.js), PostgreSQL, Drizzle ORM, Zod

### Shared Packages

- **@medinfo/db**: Database schema and Drizzle configuration
- **@medinfo/env**: Environment variable validation
- **@medinfo/shared**: Shared types and validation schemas

## 🛠️ Quick Start

### Prerequisites

- **Docker Desktop** (recommended) or Docker Engine
- **Node.js 18+** (for frontend development)
- **pnpm 10.33.0+** (package manager)

### Step-by-Step Setup

#### 1. Clone and Install

```bash
git clone <repo-url>
cd medinfo-fullstack
pnpm install
```

#### 2. Configure Environment

```bash
cp apps/backend/.env.example apps/backend/.env
```

Required external services:

- **Google OAuth** - User authentication
- **Cloudinary** - File storage
- **Zoom API** - Video meetings
- **Email Service** - Appointments (optional)

Quick configuration:

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

#### 3. Start Docker Services

```bash
docker compose up -d
```

Wait 30-60 seconds for services to be healthy:

```bash
docker compose ps  # Check status
```

#### 4. Initialize Database

```bash
pnpm db:generate
pnpm db:migrate
pnpm db:seed  # Optional: seed sample data
```

#### 5. Start Frontend

```bash
pnpm dev:frontend
```

### Access Your Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **API Documentation**: http://localhost:8000/api/docs

## 🐳 Docker Services

The Docker setup includes these services:

| Service     | Container             | Port | Purpose         |
| ----------- | --------------------- | ---- | --------------- |
| PostgreSQL  | `medinfo-postgres-db` | 5432 | Database        |
| Redis Cache | `medinfo-redis-cache` | 6379 | Session storage |
| Redis Queue | `medinfo-redis-queue` | 6380 | Job processing  |
| Backend API | `medinfo-backend`     | 8000 | API server      |

### Service Management

```bash
# Start all services
docker compose up -d

# Check service health
docker compose ps

# View logs
docker compose logs -f

# Stop all services
docker compose down

# Restart specific service
docker compose restart backend
```

## 🔧 Development Workflow

### Daily Development

```bash
# Start containers (if stopped)
docker compose up -d

# Start frontend
pnpm dev:frontend

# Monitor logs in another terminal
docker compose logs -f backend

# Make code changes (backend hot-reloads, frontend auto-reloads)
```

### Database Operations

```bash
# Generate and run migrations
pnpm db:generate
pnpm db:migrate

# Seed with sample data
pnpm db:seed

# Open database studio
pnpm db:studio
```

### Debugging

```bash
# Access container shell
docker compose exec backend sh

# Connect to database
docker compose exec medinfo-postgres-db psql -U postgres medinfo

# Test Redis
docker compose exec medinfo-redis-cache redis-cli ping
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

## 🌐 External Services Setup

You must configure these external services:

### 1. Google OAuth (Required)

**Purpose**: User authentication with Google accounts
**Setup**: [Google Cloud Console → APIs & Services → Credentials](https://console.cloud.google.com/apis/credentials)

**Steps**:

1. Create new OAuth 2.0 Client ID
2. Add `http://localhost:8000/api/v1/auth/google/callback` to authorized redirect URIs
3. Copy Client ID and Client Secret to `.env`

### 2. Cloudinary (Required)

**Purpose**: File storage for medical documents and profile images
**Setup**: [Cloudinary Console → Dashboard](https://cloudinary.com/console)

**Steps**:

1. Sign up for free account
2. Get Cloud Name, API Key, and API Secret from Dashboard
3. Add to `.env`

### 3. Zoom API (Required)

**Purpose**: Video meeting creation for virtual consultations
**Setup**: [Zoom App Marketplace → Build App](https://marketplace.zoom.us/)

**Steps**:

1. Create Server-to-Server OAuth app
2. Add necessary scopes (meetings:write, users:read)
3. Copy Account ID, Client ID, and Client Secret to `.env`

### 4. Email Service (Optional)

**Purpose**: Appointment reminders and notifications
**Recommended**: [Resend](https://resend.com/)

**Steps**:

1. Create account and generate API key
2. Add `RESEND_API_KEY` to `.env`

For detailed setup instructions, see **[docs/external-services.md](./docs/external-services.md)**.

## 🏗️ Project Structure

```
medinfo-fullstack/
├── apps/
│   ├── backend/          # Hono API Server
│   └── frontend/         # Next.js Application
├── packages/
│   ├── db/              # Database Schema & Migrations
│   ├── env/             # Environment Validation
│   └── shared/          # Shared Types & Schemas
├── docs/                # Documentation
├── docker-compose.yaml  # Docker Development Setup
└── README.md           # This file
```

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
pnpm dev:docker-db          # Start only database services

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

For complete troubleshooting, see **[docs/troubleshooting.md](./docs/troubleshooting.md)**.

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

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and linting
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
