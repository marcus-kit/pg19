# Universal Dockerfile for monorepo apps
# Usage: docker build --build-arg APP_NAME=client-portal -t client .

ARG APP_NAME=client-portal

# Build stage
FROM node:20-alpine AS builder

ARG APP_NAME

RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app

# Copy workspace config
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./

# Copy shared packages
COPY packages ./packages

# Copy target app
COPY apps/${APP_NAME} ./apps/${APP_NAME}

# Install dependencies
RUN pnpm install --frozen-lockfile

# Build
RUN pnpm --filter ${APP_NAME} build

# Production stage
FROM node:20-alpine AS runner

ARG APP_NAME

WORKDIR /app

COPY --from=builder /app/apps/${APP_NAME}/.output ./.output

ENV HOST=0.0.0.0
ENV PORT=3000
ENV NODE_ENV=production

EXPOSE 3000

CMD ["node", ".output/server/index.mjs"]
