# ================================================================
# Stage 1: Base - Setup pnpm and workspace structure
# ================================================================
FROM node:22-alpine AS base

# Install pnpm
RUN corepack enable && corepack prepare pnpm@10.24.0 --activate

WORKDIR /app

# Copy root workspace files
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./

# Copy workspace packages needed by backend
COPY packages/db/package.json ./packages/db/
COPY packages/env/package.json ./packages/env/
COPY packages/shared/package.json ./packages/shared/

# Copy backend package.json
COPY apps/backend/package.json ./apps/backend/

# ================================================================
# Stage 2: Build - Install dependencies and build
# ================================================================
FROM base AS build

# Install all dependencies (including devDependencies for build)
RUN pnpm install --frozen-lockfile

# Copy source code
COPY packages/db/src ./packages/db/src
COPY packages/db/tsconfig.json ./packages/db/
COPY packages/db/drizzle.config.ts ./packages/db/

COPY packages/env/src ./packages/env/src
COPY packages/env/tsconfig.json ./packages/env/

COPY packages/shared/src ./packages/shared/src
COPY packages/shared/tsconfig.json ./packages/shared/

COPY apps/backend/src ./apps/backend/src
COPY apps/backend/tsconfig.json ./apps/backend/
COPY apps/backend/tsdown.config.ts ./apps/backend/

# Build the backend
WORKDIR /app/apps/backend
RUN pnpm run build

# ================================================================
# Stage 3: Production - Minimal runtime image
# ================================================================
FROM node:22-alpine AS production

# Install pnpm for production
RUN corepack enable && corepack prepare pnpm@10.24.0 --activate

# Create non-root user for security
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 hono

WORKDIR /app

# Copy workspace files
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./

# Copy package.json files for workspace resolution
COPY packages/db/package.json ./packages/db/
COPY packages/env/package.json ./packages/env/
COPY packages/shared/package.json ./packages/shared/
COPY apps/backend/package.json ./apps/backend/

# Install production dependencies only
RUN pnpm install --frozen-lockfile --prod

# Copy built files and source (tsx runs TS directly)
COPY --from=build /app/apps/backend/dist ./apps/backend/dist
COPY --from=build /app/apps/backend/src ./apps/backend/src
COPY --from=build /app/packages/db/src ./packages/db/src
COPY --from=build /app/packages/env/src ./packages/env/src
COPY --from=build /app/packages/shared/src ./packages/shared/src

# Set ownership
RUN chown -R hono:nodejs /app

USER hono

WORKDIR /app/apps/backend

# Environment
ENV NODE_ENV=production
ENV PORT=8000

EXPOSE 8000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:8000/ || exit 1

CMD ["pnpm", "start"]
