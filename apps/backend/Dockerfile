# ================================================================
# Stage 1: Base - Setup pnpm
# ================================================================
FROM node:22-slim AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable && corepack prepare pnpm@10.26.0 --activate
WORKDIR /app

# ================================================================
# Stage 2: Prepare deps
# ================================================================
FROM base AS prepare-deps

# Copy workspace configuration
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./

# Copy necessary files
COPY packages/db ./packages/db
COPY packages/env ./packages/env
COPY packages/shared ./packages/shared
COPY apps/backend ./apps/backend

# Install dependencies
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --prod --frozen-lockfile

# ================================================================
# Stage 3: Runner
# ================================================================
FROM base AS runner

COPY --from=prepare-deps /app ./

WORKDIR /app/apps/backend

EXPOSE 8000

# Healthcheck
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:8000/ || exit 1

CMD ["pnpm", "start"]
