# Docker Setup

## Quick Start

```bash
# Build all images
docker compose build

# Start everything (postgres → migrations → backend)
docker compose up -d

# View logs
docker compose logs -f backend

# Stop all
docker compose down
```

## Services

| Service        | Port | Description                       |
| :------------- | :--: | :-------------------------------- |
| **postgres**   | 5432 | PostgreSQL 16 database            |
| **migrations** |  -   | One-shot Drizzle migration runner |
| **backend**    | 8000 | Hono API server                   |

## Architecture

```mermaid
flowchart LR
    A[postgres:16-alpine] -->|healthcheck| B[migrations]
    B -->|completed| C[backend:8000]
    C -->|connects to| A
```

## Environment Variables

The backend container reads from `apps/backend/.env`. For Docker, ensure your database URL uses the container network:

```env
DATABASE_URL_DEV=postgresql://postgres:postgres@postgres:5432/medinfo
DATABASE_URL_PROD=postgresql://postgres:postgres@postgres:5432/medinfo
```

> **Note**: First backend startup will be slower due to HuggingFace model download (~67MB).
