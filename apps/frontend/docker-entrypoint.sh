#!/bin/sh
# ─────────────────────────────────────────────────────────────────────────────
# Runtime environment injection
# Replaces ${API_URL} placeholder in env.js.template → env.js
# Default: /api (same-origin, suitable for reverse-proxy setups)
# ─────────────────────────────────────────────────────────────────────────────
export API_URL="${API_URL:-/api}"

echo "Frontend config: API_URL=${API_URL}"

envsubst '${API_URL}' \
  < /usr/share/nginx/html/env.js.template \
  > /usr/share/nginx/html/env.js

exec nginx -g 'daemon off;'
