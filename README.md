# Ledger Platform

A production-grade **metered API gateway** built with Node.js, Express, MongoDB, Redis, and React. Provides API key authentication, token-bucket rate limiting, write-ahead log metering, usage-based billing, and a real-time monitoring dashboard — all running in Docker with multi-instance horizontal scaling.

---

## Table of Contents

- [Architecture](#architecture)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Quick Start](#quick-start)
- [API Reference](#api-reference)
- [Services](#services)
- [Production Deployment](#production-deployment)
- [CI/CD](#cicd)
- [Testing](#testing)

---

## Architecture

```
                         ┌─────────────────────────────────────────────┐
                         │            Client (React + Vite)            │
                         │            http://localhost:5173             │
                         └────────────────────┬────────────────────────┘
                                              │ /api, /register, /billing
                                              ▼
                         ┌─────────────────────────────────────────────┐
                         │           Nginx Reverse Proxy               │
                         │            http://localhost:8080             │
                         │         Round-robin load balancer            │
                         └──────┬──────────────────────────┬───────────┘
                                │                          │
                         ┌──────▼─────────┐        ┌──────▼─────────┐
                         │   Gateway-1    │        │   Gateway-2    │
                         │   Express      │        │   Express      │
                         │   Port 5000    │        │   Port 5000    │
                         └──────┬─────────┘        └──────┬─────────┘
                                │                          │
                                └──────────┬───────────────┘
                                           │
                         ┌──────────────────▼──────────────────┐
                         │          Fake Backend                │
                         │          http://fake-backend:5001    │
                         └──────────────────┬──────────────────┘
                                            │
              ┌──────────────────────────────┼──────────────────────────────┐
              │                              │                              │
     ┌────────▼────────┐          ┌─────────▼─────────┐         ┌─────────▼─────────┐
     │     MongoDB      │          │       Redis       │         │   Docker Network  │
     │  - ApiKeys       │          │  - Token buckets  │         │   Internal DNS    │
     │  - UsageLogs     │          │  - Usage counters │         │                   │
     └─────────────────┘          └───────────────────┘         └───────────────────┘
```

**Request lifecycle through the gateway:**

```
Client → Nginx → Gateway → Auth Middleware → Rate Limiter → Meter Middleware → Backend
                          │                │              │
                          │  Validates     │  Lua token   │  1. Write "pending" to Mongo
                          │  x-api-key     │  bucket      │  2. Forward to backend
                          │  via Mongo     │  (atomic)    │  3. Incr Redis counter
                          │                │              │  4. Mark "complete" in Mongo
                          │                │              │  5. Return response to client
```

---

## Features

### **API Key Authentication**
- Keys generated via `crypto.randomBytes(32)` with `lk_` prefix
- Stored in MongoDB with tier and backend URL mapping
- Looked up on every request via the `x-api-key` header

### **Atomic Rate Limiting**
- Redis Lua token bucket algorithm — single atomic script
- Configurable capacity and refill rate per tier:
  - **Free**: 10 tokens capacity, 1 token/sec refill
  - **Pro/Enterprise**: 100 tokens capacity, 20 tokens/sec refill
- 3600s TTL on unused buckets for automatic cleanup
- Returns `429 Too Many Requests` with `Retry-After` header when exhausted

### **Write-Ahead Log Metering**
- Every request is recorded in MongoDB as `"pending"` **before** forwarding
- After successful backend response: status → `"complete"`, Redis counter incremented
- After backend failure: status → `"failed"`, Redis counter unchanged
- Duplicate `requestId` (UUID v4) handling prevents double-counting on retries

### **Multi-Instance Correctness**
- Nginx round-robins across two gateway instances
- Redis `INCR` is atomic — safe under concurrent access from both gateways
- MongoDB unique index on `requestId` prevents duplicate write-ahead log entries
- Verified: Mongo complete count == Redis counter == 200-status responses (proven with k6 load test)

### **Usage-Based Billing**
- **Free tier**: 1,000 free requests/month, $0.001 per additional request
- **Paid tier**: 1,000 free requests/month, $0.001 per additional request
- Billing period computed as `YYYY-MM` from UTC date
- `GET /billing/:apiKey` returns current usage and amount due

### **Live Dashboard**
- React + Vite dashboard with real-time billing updates
- Polls `/billing/:apiKey` every 5 seconds
- API key registration form with copyable key and sample curl command
- Developed with Vite hot-reload; production build served via nginx

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Gateway** | Node.js, Express, Mongoose, ioredis, Axios |
| **Rate Limiter** | Redis Lua scripting (atomic token bucket) |
| **Database** | MongoDB 7 (usage logs, API keys) |
| **Cache** | Redis 7 (rate limit state, usage counters) |
| **Dashboard** | React 18, Vite 6, Axios |
| **Load Balancer** | Nginx (round-robin) |
| **Containerization** | Docker, Docker Compose |
| **CI/CD** | GitHub Actions, GitHub Container Registry |
| **Load Testing** | k6 (Grafana) |

---

## Quick Start

```bash
# 1. Clone and start all services
git clone https://github.com/Ayushgaurav5768/Ledger.git
cd Ledger
docker compose up -d --build

# 2. Register an API key
curl -X POST http://localhost:8080/register \
  -H "Content-Type: application/json" \
  -d '{"backendUrl":"http://fake-backend:5001"}'
# → {"key":"lk_..."}

# 3. Test the proxy
curl http://localhost:8080/api/test \
  -H "x-api-key: lk_..."
# → {"message":"ok","timestamp":"..."}

# 4. Open the dashboard
open http://localhost:5173

# 5. Check your billing
curl http://localhost:8080/billing/<your-key>
# → {"apiKey":"...","tier":"free","usageCount":1,"amountDue":0}
```

### Register with a paid tier

```bash
# Register, then upgrade the tier
KEY=$(curl -s -X POST http://localhost:8080/register \
  -H "Content-Type: application/json" \
  -d '{"backendUrl":"http://fake-backend:5001"}' | node -pe "JSON.parse(require('fs').readFileSync('/dev/stdin','utf8')).key")

docker exec ledger-mongo mongosh ledger --quiet \
  --eval "db.apikeys.updateOne({key:'$KEY'},{\$set:{tier:'enterprise'}})"
```

---

## API Reference

### `POST /register`
Register a new API key.

**Request:**
```json
{ "backendUrl": "http://fake-backend:5001" }
```

**Response:** `201 Created`
```json
{ "key": "a69a652eaebb476f0d775e6c35a4cefa..." }
```

---

### `ALL /api/*`
Proxy requests to the registered backend URL.

**Headers:**
| Header | Value |
|--------|-------|
| `x-api-key` | Your API key |

**Query parameters:**
| Param | Description |
|-------|-------------|
| `delay` | Simulated latency in ms (fake-backend only) |

**Responses:**
| Status | Description |
|--------|-------------|
| `200` | Success — response from backend |
| `429` | Rate limit exceeded |
| `502` | Backend unreachable or connection error |

---

### `GET /billing/:apiKey`
Get usage statistics and amount due for the current billing period.

**Response:** `200 OK`
```json
{
  "apiKey": "a69a652eaebb476f0d775e6c35a4cefa...",
  "tier": "enterprise",
  "usageCount": 1500,
  "amountDue": 0.50
}
```

---

### `GET /health`
Health check endpoint.

**Response:** `200 OK`
```json
{
  "status": "healthy",
  "service": "gateway",
  "timestamp": "2026-06-25T15:09:45.899Z"
}
```

---

## Services

| Service | Internal Port | Host Port | Description |
|---------|--------------|-----------|-------------|
| **Client** | 5173 | `5173` | React dashboard (Vite dev) |
| **Nginx** | 80 | `8080` | Load balancer + reverse proxy |
| **Gateway-1** | 5000 | — | Express API gateway (instance 1) |
| **Gateway-2** | 5000 | — | Express API gateway (instance 2) |
| **Fake Backend** | 5001 | `5001` | Test backend for development |
| **MongoDB** | 27017 | `27017` | Primary data store |
| **Redis** | 6379 | `6379` | Rate limiting + counters |

---

## Production Deployment

```bash
# Using the deploy script
./infra/scripts/deploy.sh prod

# Or directly with Docker Compose
docker compose -f docker-compose.prod.yml up -d --build
```

The production configuration includes:
- **Persistent volumes** for MongoDB and Redis data
- **Restart policies** on all services
- **Separate Docker network** for service isolation
- **nginx production build** for the React client

### Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `5000` | Gateway HTTP listen port |
| `MONGO_URL` | `mongodb://mongo:27017/ledger` | MongoDB connection string |
| `REDIS_URL` | `redis://redis:6379` | Redis connection string |
| `DEFAULT_BACKEND_URL` | `http://fake-backend:5001` | Default backend for proxies |
| `PROXY_TARGET` | `http://nginx:80` | Vite proxy target (dev mode) |

---

## CI/CD

The GitHub Actions workflow (`.github/workflows/ci.yml`) runs on every push to `main`:

### **Test Phase**
1. Builds all Docker images
2. Starts services with Docker Compose
3. Registers an API key and verifies:
   - Proxy returns `200 OK`
   - Rate limiter returns `429` after bucket exhaustion
   - Billing endpoint reports correct usage
   - Mongo/Redis counts match
4. Tears down services

### **Build Phase** (on merge to main)
1. Authenticates with GitHub Container Registry
2. Builds and pushes three images:
   - `ghcr.io/<repo>/gateway:latest`
   - `ghcr.io/<repo>/fake-backend:latest`
   - `ghcr.io/<repo>/client:latest`
3. Tags each image with the commit SHA for traceability

---

## Testing

### Rate Limiting
```bash
KEY=$(curl -s -X POST http://localhost:8080/register \
  -H "Content-Type: application/json" \
  -d '{"backendUrl":"http://fake-backend:5001"}' | node -pe "JSON.parse(require('fs').readFileSync('/dev/stdin','utf8')).key")

# First 10 requests succeed (free tier capacity = 10)
for i in $(seq 1 15); do
  curl -s -o /dev/null -w "%{http_code} " \
    http://localhost:8080/api/test -H "x-api-key: $KEY"
done
# → 200 200 200 200 200 200 200 200 200 200 429 429 429 429 429
```

### Multi-Instance Count Verification
```bash
# Run k6 load test (20 concurrent users, 10 seconds)
docker run --rm -i --network ledger_default \
  -e BASE_URL=http://nginx \
  -e API_KEY=$KEY \
  grafana/k6 run - < load-tests/k6-concurrency-test.js

# Verify no double-counting
docker exec ledger-gateway-1-1 node src/scripts/verifyCount.js "$KEY"
# → MongoDB 'complete' count: 300
# → Redis counter (...): 300
# → Match: true
```

### Billing Validation
```bash
curl http://localhost:8080/billing/$KEY
# → {"usageCount":300,"amountDue":0}
```

---

## Project Structure

```
Ledger/
├── .github/workflows/ci.yml        # CI/CD pipeline
├── docker-compose.yml              # Development compose
├── docker-compose.prod.yml         # Production compose
├── infra/
│   ├── nginx/nginx.conf            # Load balancer config
│   ├── scripts/deploy.sh           # Deployment script
│   └── terraform/                  # Infrastructure as code
├── load-tests/
│   └── k6-concurrency-test.js      # Load test script
├── services/
│   ├── client/                     # React dashboard (Vite)
│   │   ├── src/
│   │   │   ├── components/         # React components
│   │   │   ├── services/api.js     # API client
│   │   │   ├── App.jsx             # Main app
│   │   │   └── main.jsx            # Entry point
│   │   └── index.html
│   ├── fake-backend/               # Test backend
│   │   └── src/index.js
│   └── gateway/                    # API gateway
│       └── src/
│           ├── config/             # DB and Redis connections
│           ├── lua/                # Lua rate limiter script
│           ├── metering/           # Write-ahead log logic
│           ├── middleware/         # Auth, rate limiter, error handler
│           ├── models/             # Mongoose schemas
│           ├── pricing/            # Tier config and billing
│           ├── proxy/              # Request forwarding
│           ├── routes/             # Express routes
│           └── scripts/            # Verification utilities
└── README.md
```

---

## License

MIT — built as an MVP demonstration of metered API gateway architecture.
