#!/usr/bin/env bash
set -euo pipefail

# Usage: ./infra/scripts/deploy.sh [environment]
# Requires: docker, docker-compose
# Optional: pass env name to select compose file (default: prod)

ENV="${1:-prod}"
COMPOSE_FILE="docker-compose.${ENV}.yml"

if [ ! -f "$COMPOSE_FILE" ]; then
  echo "Compose file not found: $COMPOSE_FILE"
  exit 1
fi

echo "=== Deploying ledger-platform ($ENV) ==="

# Pull latest images (if configured)
docker compose -f "$COMPOSE_FILE" pull 2>/dev/null || true

# Start services
docker compose -f "$COMPOSE_FILE" up -d --remove-orphans

# Wait for gateways to be healthy
echo "Waiting for gateways..."
for i in $(seq 1 30); do
  HEALTHY=$(docker ps --filter "name=gateway" --filter "health=healthy" -q | wc -l)
  if [ "$HEALTHY" -ge 2 ] 2>/dev/null; then
    echo "Gateways healthy"
    break
  fi
  sleep 2
done

# Verify health endpoint
echo "Verifying health..."
curl -sf http://localhost:8080/health || {
  echo "Health check failed"
  docker compose -f "$COMPOSE_FILE" logs --tail 20 gateway-1 gateway-2 nginx
  exit 1
}

echo "=== Deploy complete ==="
echo "Gateway API:    http://localhost:8080"
echo "Dashboard:      http://localhost:5173"
