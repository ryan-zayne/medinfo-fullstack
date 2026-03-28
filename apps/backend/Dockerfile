# ================================================================
# Stage 1: Base - Setup pnpm
# ================================================================
FROM node:24.14.0-alpine3.22 AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable && corepack prepare pnpm@10.33.0 --activate
WORKDIR /app

# ================================================================
# Stage 2: Dependencies
# ================================================================
FROM base AS deps

# Copy workspace configuration first (best for layer caching)
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./

# Copy only package.json files for dependency resolution
COPY apps/backend/package.json ./apps/backend/package.json
COPY packages/db/package.json ./packages/db/package.json
COPY packages/env/package.json ./packages/env/package.json
COPY packages/shared/package.json ./packages/shared/package.json

# Install production dependencies with BuildKit cache mount
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm --filter=!@medinfo/frontend install --prefer-offline --prod --ignore-scripts --frozen-lockfile

# ================================================================
# Stage 3: Builder
# ================================================================
FROM deps AS builder

# Copy source code
COPY apps/backend ./apps/backend
COPY packages ./packages

WORKDIR /app/apps/backend

# Build if needed (uncomment if your app requires compilation)
# RUN pnpm run build

# ================================================================
# Stage 4: Production Runtime
# ================================================================
FROM base AS runner

# Copy optimized node_modules from deps stage
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/apps/backend ./apps/backend
COPY --from=deps /app/packages ./packages

WORKDIR /app/apps/backend

# Set production environment for optimized runtime
ENV NODE_ENV=production

EXPOSE 8000

# Improved healthcheck with curl
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
    CMD curl -f http://localhost:8000/health || exit 1

# Run migrations and start app
CMD ["sh", "-c", "pnpm --filter=@medinfo/db db:push && pnpm --filter=@medinfo/db db:seed && pnpm start"]
