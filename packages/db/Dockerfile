# ================================================================
# Drizzle Migration Runner
# ================================================================
FROM node:22-alpine

# Install pnpm
RUN corepack enable && corepack prepare pnpm@10.25.0 --activate

WORKDIR /app

# Copy root workspace files
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./

# Copy workspace packages
COPY packages/db/package.json ./packages/db/
COPY packages/env/package.json ./packages/env/

# Install dependencies
RUN pnpm install --frozen-lockfile --prod

# Copy source files
COPY packages/db/src ./packages/db/src
COPY packages/db/drizzle.config.ts ./packages/db/
COPY packages/db/tsconfig.json ./packages/db/

COPY packages/env/src ./packages/env/src
COPY packages/env/tsconfig.json ./packages/env/

WORKDIR /app/packages/db

# Run migrations
# Generate migrations inside the container, then run them, then seed
CMD ["sh", "-c", "pnpm db:generate && pnpm db:migrate && pnpm db:seed"]
