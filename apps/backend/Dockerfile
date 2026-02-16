# ================================================================
# Stage 1: Base - Setup pnpm
# ================================================================
FROM node:22-slim AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable && corepack prepare pnpm@10.28.2 --activate
WORKDIR /app

# ================================================================
# Stage 2: Setup and runner
# ================================================================
FROM base AS setup-and-runner

# Copy workspace configuration
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./

# Copy package manifests (for caching pnpm install)
COPY apps/backend/package.json ./apps/backend/package.json
COPY packages/db/package.json ./packages/db/package.json
COPY packages/env/package.json ./packages/env/package.json
COPY packages/shared/package.json ./packages/shared/package.json

# Install dependencies
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm --filter=!@medinfo/frontend install --prefer-offline --prod --ignore-scripts --frozen-lockfile

# Copy source code
COPY apps/backend ./apps/backend
COPY packages ./packages

WORKDIR /app/apps/backend

EXPOSE 8000

# Healthcheck
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:8000/ || exit 1

CMD ["sh", "-c", "pnpm --filter=@medinfo/db db:push && pnpm --filter=@medinfo/db db:seed && pnpm start:dev"]
