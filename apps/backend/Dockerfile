# ── Stage 1: Build ──────────────────────────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /workspace

# Copy root tsconfig (backend tsconfig.json extends it)
COPY tsconfig.base.json ./

# Install backend dependencies
COPY apps/backend/package*.json ./apps/backend/
RUN cd apps/backend && npm ci

# Copy backend source and compile
COPY apps/backend ./apps/backend
RUN cd apps/backend && npx tsc -p tsconfig.json

# ── Stage 2: Production runner ───────────────────────────────────────────────
FROM node:20-alpine AS runner

WORKDIR /app

# Copy compiled JS (outDir = ../../dist/apps/backend relative to apps/backend)
COPY --from=builder /workspace/dist/apps/backend ./

# Copy SQL migrations (needed at runtime by migrate.js via __dirname)
COPY --from=builder /workspace/apps/backend/src/database/migrations ./database/migrations

# Install only production dependencies
COPY apps/backend/package*.json ./
RUN npm ci --omit=dev

# Entrypoint: run migrations then start server
COPY apps/backend/docker-entrypoint.sh ./
RUN sed -i 's/\r//' docker-entrypoint.sh && chmod +x docker-entrypoint.sh

EXPOSE 3000
ENV NODE_ENV=production

CMD ["./docker-entrypoint.sh"]
