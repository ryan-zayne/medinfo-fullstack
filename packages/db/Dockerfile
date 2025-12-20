# ================================================================
# Stage 1: Base - Setup pnpm
# ================================================================
FROM node:22-alpine AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable && corepack prepare pnpm@10.26.0 --activate

WORKDIR /app

# ================================================================
# Stage 2: Prepare deps
# ================================================================
FROM base AS prepare-deps

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json ./
COPY packages/db ./packages/db
COPY packages/env ./packages/env

RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --prod --frozen-lockfile

# ================================================================
# Stage 3: DB Setup
# ================================================================
FROM base AS setup

COPY --from=prepare-deps /app/node_modules ./node_modules
COPY --from=prepare-deps /app/packages/db ./packages/db
COPY --from=prepare-deps /app/packages/env ./packages/env


WORKDIR /app/packages/db

# Run migrations
CMD ["sh", "-c", "pnpm db:generate && pnpm db:migrate && pnpm db:seed"]
