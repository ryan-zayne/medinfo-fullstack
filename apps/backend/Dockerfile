# ================================================================
# Stage 1: Base - Setup pnpm
# ================================================================
FROM node:22-slim AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable && corepack prepare pnpm@10.25.0 --activate
WORKDIR /app

# ================================================================
# Stage 2: Setup Workspace
# ================================================================
# Copy workspace configuration
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./

# Copy package configs
COPY packages/db/package.json ./packages/db/
COPY packages/env/package.json ./packages/env/
COPY packages/shared/package.json ./packages/shared/
COPY apps/backend/package.json ./apps/backend/

# Install dependencies (including dev deps for tsx/building)
RUN pnpm install --frozen-lockfile --prod

# Copy source code for everything
COPY packages/db ./packages/db
COPY packages/env ./packages/env
COPY packages/shared ./packages/shared
COPY apps/backend ./apps/backend

# ================================================================
# Stage 3: Runner
# ================================================================
# We run directly from the workspace structure to preserve symlinks
# needed for tsx to resolve path aliases in dependencies.

WORKDIR /app/apps/backend

# Expose port and start
ENV NODE_ENV=production
ENV PORT=8000
EXPOSE 8000

# Healthcheck
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:8000/ || exit 1

CMD ["pnpm", "start"]
