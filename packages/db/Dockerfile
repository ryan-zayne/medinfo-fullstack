# ================================================================
# Stage 1: Base - Setup pnpm
# ================================================================
FROM dhi.io/node:22-alpine3.22-dev AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable && corepack prepare pnpm@10.26.0 --activate
WORKDIR /app

# ================================================================
# Stage 2: Dependencies
# ================================================================
FROM base AS deps

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json ./
COPY packages/db ./packages/db
COPY packages/env ./packages/env

# Install only production dependencies with BuildKit cache
RUN --mount=type=cache,id=pnpm,target=/pnpm/store \
    pnpm install \
    --prod \
    --frozen-lockfile

# ================================================================
# Stage 3: Production Runtime
# ================================================================
FROM dhi.io/node:22-alpine3.22 AS production

WORKDIR /app

# Copy optimized node_modules from deps stage
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/packages/db ./packages/db
COPY --from=deps /app/packages/env ./packages/env

WORKDIR /app/packages/db

# Set production environment
ENV NODE_ENV=production

# Run database migrations and seeding
CMD ["node", "./node_modules/.bin/pnpm", "db:generate", "&&", "pnpm", "db:migrate", "&&", "pnpm", "db:seed"]
