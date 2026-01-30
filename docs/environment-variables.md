# Environment Variables

This document lists all environment variables required by MedInfo backend application.

## Required Variables

### Application Configuration

- `NODE_ENV` - development or production
- `PORT` - Server port (default: 8000)
- `LOG_LEVEL` - debug, info, warn, error, fatal, silent

### Database Configuration

- `DATABASE_URL_DEV` - PostgreSQL connection for development
- `DATABASE_URL_PROD` - PostgreSQL connection for production
- `DB_MIGRATING` - Migration state flag
- `DB_SEEDING` - Seeding state flag
- `SEED_PASSWORD` - Default password for seeded users

### JWT Authentication

- `ACCESS_SECRET` - Secret for access tokens (generate: `openssl rand -base64 32`)
- `REFRESH_SECRET` - Secret for refresh tokens (generate: `openssl rand -base64 32`)
- `ACCESS_JWT_EXPIRES_IN` - Access token lifetime (milliseconds)
- `REFRESH_JWT_EXPIRES_IN` - Refresh token lifetime (milliseconds)

### Host Configuration

- `BASE_BACKEND_HOST_DEV` - Backend URL for development (http://localhost:8000)
- `BASE_BACKEND_HOST_PROD` - Backend URL for production
- `BASE_FRONTEND_HOST_DEV` - Frontend URL for development (http://localhost:3000)
- `BASE_FRONTEND_HOST_PROD` - Frontend URL for production

### Redis Configuration

- `REDIS_CACHE_URL_DEV` - Redis cache for development (redis://localhost:6379)
- `REDIS_CACHE_URL_PROD` - Redis cache for production
- `REDIS_QUEUE_URL_DEV` - Redis queue for development (redis://localhost:6380)
- `REDIS_QUEUE_URL_PROD` - Redis queue for production

### Google OAuth

- `GOOGLE_CLIENT_ID` - Google OAuth client ID
- `GOOGLE_CLIENT_SECRET` - Google OAuth client secret
- `GOOGLE_REDIRECT_URI` - OAuth callback URL
- `GOOGLE_AUTH_API_KEY` - Google API key for additional services

### Cloudinary

- `CLOUDINARY_CLOUD_NAME` - Cloudinary account cloud name
- `CLOUDINARY_API_KEY` - Cloudinary API key
- `CLOUDINARY_API_SECRET` - Cloudinary API secret

### Zoom API

- `ZOOM_ACCOUNT_ID` - Zoom account ID
- `ZOOM_CLIENT_ID` - Zoom OAuth client ID
- `ZOOM_CLIENT_SECRET` - Zoom OAuth client secret

## Setup Instructions

1. **Copy environment template**:

   ```bash
   cp apps/backend/.env.example apps/backend/.env
   ```

2. **Generate secrets**:

   ```bash
   openssl rand -base64 32  # For ACCESS_SECRET
   openssl rand -base64 32  # For REFRESH_SECRET
   ```

3. **Configure external services**:
   - See [external-services.md](./external-services.md) for setup instructions

4. **Test configuration**:
   ```bash
   docker compose up -d
   docker compose exec backend env | grep -E "(GOOGLE_|CLOUDINARY_|ZOOM_)"
   ```

## Docker Auto-Configuration

When using Docker, these URLs are automatically set:

```bash
DATABASE_URL_DEV=postgresql://postgres:postgres@medinfo-postgres-db:5432/medinfo
REDIS_CACHE_URL_DEV=redis://medinfo-redis-cache:6379
REDIS_QUEUE_URL_DEV=redis://medinfo-redis-queue:6379
```

## Security Notes

- Never commit `.env` file to version control
- Use different secrets for development and production
- Rotate secrets periodically in production
- Keep API keys secure and limit permissions

For troubleshooting environment variable issues, see [troubleshooting.md](./troubleshooting.md).
