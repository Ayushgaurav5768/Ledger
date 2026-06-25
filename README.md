# Ledger Platform

Metered API gateway MVP — rate limiting, usage metering, billing, and a React dashboard.

## Architecture

```
Client (React/Vite) → Nginx → Gateway-1 (Express) → Fake Backend
                     → Nginx → Gateway-2 (Express) → Fake Backend
                            ↓
                       MongoDB (UsageLog, ApiKeys)
                       Redis   (Rate limiter, Usage counters)
```

## Quick Start

```bash
# Start all services (dev mode with hot reload)
docker compose up -d --build

# Register an API key
curl -X POST http://localhost:8080/register \
  -H "Content-Type: application/json" \
  -d '{"backendUrl":"http://fake-backend:5001"}'

# Test the proxy
curl http://localhost:8080/api/test \
  -H "x-api-key: <your-key>"

# Open the dashboard
open http://localhost:5173
```

## Production Deployment

```bash
# Using production Docker Compose
./infra/scripts/deploy.sh prod

# Or manually:
docker compose -f docker-compose.prod.yml up -d --build
```

### Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `5000` | Gateway listen port |
| `MONGO_URL` | `mongodb://mongo:27017/ledger` | MongoDB connection |
| `REDIS_URL` | `redis://redis:6379` | Redis connection |
| `DEFAULT_BACKEND_URL` | `http://fake-backend:5001` | Default backend URL |

## CI/CD

GitHub Actions workflow builds and tests on every push to main:

1. **Test** — starts all services, registers a key, tests proxy/rate-limiting/billing
2. **Build** — pushes Docker images to `ghcr.io/<repo>/`

## Services

| Service | Port | Description |
|---------|------|-------------|
| Client | 5173 | React dashboard (dev) / nginx (prod) |
| Nginx | 8080 | Load balancer + reverse proxy |
| Gateway | 5000 | Express API gateway (2 instances) |
| Fake Backend | 5001 | Test backend service |
| MongoDB | 27017 | Usage logs + API keys |
| Redis | 6379 | Rate limiting + usage counters |

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| POST | `/register` | Register a new API key |
| GET | `/health` | Health check |
| ALL | `/api/*` | Proxy to backend (requires x-api-key) |
| GET | `/billing/:apiKey` | Get usage and amount due |

## Testing

```bash
# Rate limiting test
for i in $(seq 1 15); do
  curl -s -o /dev/null -w "%{http_code} " \
    http://localhost:8080/api/test -H "x-api-key: $KEY"
done

# Verify billing counts match
docker exec ledger-gateway-1 node src/scripts/verifyCount.js "$KEY"
```
