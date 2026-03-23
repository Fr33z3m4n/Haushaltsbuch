# ── Stage 1: Build Angular ───────────────────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /workspace

# Copy NX workspace config
COPY package*.json ./
COPY nx.json ./
COPY tsconfig.base.json ./

# Copy frontend app
COPY apps/frontend ./apps/frontend

# Install root dependencies (NX + Angular CLI)
RUN npm ci

# Build production bundle
RUN npx nx build frontend --configuration=production

# ── Stage 2: Serve with Nginx ────────────────────────────────────────────────
FROM nginx:alpine AS runner

# Install envsubst (part of gettext)
RUN apk add --no-cache gettext

# Remove default nginx config
RUN rm /etc/nginx/conf.d/default.conf

# Copy custom SPA-friendly nginx config
COPY apps/frontend/nginx.conf /etc/nginx/conf.d/default.conf

# Copy Angular build output
COPY --from=builder /workspace/dist/apps/frontend/browser /usr/share/nginx/html

# Copy env.js.template (envsubst fills it at container start)
COPY apps/frontend/public/env.js.template /usr/share/nginx/html/env.js.template

# Copy & prepare entrypoint
COPY apps/frontend/docker-entrypoint.sh /docker-entrypoint.sh
RUN sed -i 's/\r//' /docker-entrypoint.sh && chmod +x /docker-entrypoint.sh

EXPOSE 80

CMD ["/docker-entrypoint.sh"]
