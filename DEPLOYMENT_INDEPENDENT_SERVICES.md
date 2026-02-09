
# Independent Deployment Guide

This document explains how to deploy the API and Storefront independently or together.

## Architecture

The application is designed as a monorepo with independent services:

``` text
shalkaarnext/
├── services/api/          # NestJS Backend API (port 3333)
├── apps/storefront/       # Next.js Storefront (port 3000)
├── apps/admin/           # Admin Dashboard (port 3001)
└── packages/             # Shared libraries

``` text

Each service:

- ✅ Can be deployed independently

- ✅ Has its own build output

- ✅ Has its own environment configuration

- ✅ Can scale independently

- ✅ Has its own health checks

---

## Independent Deployment: API

### Build

``` bash
cd services/api
npm ci                    # Clean install dependencies
npm run build            # Build NestJS app

``` text

**Output:** `services/api/dist/`

### Environment

Create `.env` file in root (used by API):

``` env
NODE_ENV=production
API_PORT=3333
API_URL=https://api.shalkaar.com
DATABASE_URL=postgresql://...
JWT_SECRET=...
STRIPE_SECRET_KEY=sk_live_...

# ... other variables

``` text

### Deploy

``` bash
cd services/api
npm install --production  # Install production dependencies only
npm run start            # Start the application

``` text

**Verification:**

``` bash
curl http://localhost:3333/api/health

# Expected: { "status": "up", ... }

``` text

### Docker Deployment

``` bash

# Build Docker image

docker build -f services/api/Dockerfile -t shalkaar-api:latest .

# Run container

docker run \
  -p 3333:3333 \
  --env-file .env.production \
  shalkaar-api:latest

``` text

---

## Independent Deployment: Storefront

### Build

``` bash
cd apps/storefront
npm ci
npm run build

``` text

**Output:** `apps/storefront/.next/`

### Environment

Create `.env.local` in `apps/storefront/`:

``` env
NEXT_PUBLIC_API_BASE_URL=https://api.shalkaar.com/api/v1
NEXT_PUBLIC_GA_ID=...
NEXTAUTH_URL=https://www.shalkaar.com
NEXTAUTH_SECRET=...

``` text

### Deploy

``` bash
cd apps/storefront
npm install --production
npm run start

``` text

**Verification:**

``` bash
curl http://localhost:3000

# Expected: HTML response

``` text

### Docker Deployment

``` bash

# Build Docker image

docker build -f apps/storefront/Dockerfile -t shalkaar-storefront:latest .

# Run container

docker run \
  -p 3000:3000 \
  --env-file apps/storefront/.env.local \
  shalkaar-storefront:latest

``` text

---

## Independent Deployment: Admin Dashboard

Same as Storefront, but on port 3001:

``` bash
cd apps/admin
npm ci
npm run build
npm install --production
npm run start

``` text

---

## Combined Deployment

Deploy all services together:

``` bash

# 1. Install dependencies

npm ci

# 2. Build all services

npm run build

# 3. Verify pre-deployment

node scripts/pre-deployment-check.js --environment=production

# 4. Start all services

npm run start:all

``` text

---

## Scaling Strategy

### Horizontal Scaling

Each service can scale independently:

``` text
Load Balancer
├── API (instances 1-3)
│   ├── 3333-1
│   ├── 3333-2
│   └── 3333-3
├── Storefront (instances 1-2)
│   ├── 3000-1
│   └── 3000-2
└── Admin (instance 1)
    └── 3001-1

``` text

### Load Balancing Example (Nginx)

``` nginx
upstream api {
  server api-1:3333;
  server api-2:3333;
  server api-3:3333;
}

upstream storefront {
  server storefront-1:3000;
  server storefront-2:3000;
}

server {
  listen 80;
  server_name api.shalkaar.com;
  location / {
    proxy_pass http://api;
  }
}

server {
  listen 80;
  server_name www.shalkaar.com;
  location / {
    proxy_pass http://storefront;
  }
}

``` text

---

## Database Migrations

Migrations should run independently before starting services:

``` bash

# 1. Apply pending migrations (run once before any instance starts)

cd services/api
npx prisma migrate deploy

# 2. Then start services

npm run start

``` text

---

## Health Checks for Monitoring

Each service provides health check endpoints:

### API Health Checks

``` text
GET /api/health          # Basic health (200 = up)
GET /api/health/live     # Liveness probe (Kubernetes)
GET /api/health/ready    # Readiness probe (Kubernetes)
GET /api/health/startup  # Startup verification details

``` text

### Kubernetes Probes

``` yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: api
spec:
  template:
    spec:
      containers:
      - name: api
        image: shalkaar-api:latest
        livenessProbe:
          httpGet:
            path: /api/health/live
            port: 3333
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /api/health/ready
            port: 3333
          initialDelaySeconds: 10
          periodSeconds: 5

``` text

---

## Pre-Deployment Checklist per Service

### API Deployment

- [ ] Environment file has all required variables

- [ ] Database URL is correct and accessible

- [ ] JWT_SECRET is set and strong (32+ chars)

- [ ] STRIPE_SECRET_KEY is configured (sk_live_ for prod)

- [ ] Database migrations are up to date

- [ ] Health check responds with status "up"

### Storefront Deployment

- [ ] NEXT_PUBLIC_API_BASE_URL points to correct API

- [ ] NEXTAUTH_URL is set to storefront domain

- [ ] Build output (.next/) exists

- [ ] No REPLACE_WITH_ placeholders in .env

- [ ] Page loads at root URL

### Admin Deployment

- [ ] Same as Storefront but for admin dashboard

- [ ] Admin URLs configured correctly

---

## Rollback Procedure

### API Rollback

``` bash

# 1. Identify previous version

docker images shalkaar-api

# 2. Deploy previous version

docker run \
  -p 3333:3333 \
  --env-file .env.production \
  shalkaar-api:v1.0.0  # Previous version

``` text

### Storefront Rollback

Same approach with `shalkaar-storefront` image.

---

## Zero-Downtime Deployment

Use Blue-Green Deployment:

``` bash

# 1. Start new version (green) alongside old (blue)

docker run -p 3334:3000 shalkaar-storefront:v1.1.0  # Green (new)

# Old version still running on 3000                    # Blue (old)

# 2. Test green version

curl http://localhost:3334

# 3. Switch load balancer to green

# Update Nginx/Load Balancer config

# 4. Remove blue version

docker stop <blue-container>

``` text

---

## Deployment Monitoring

### Monitor API

``` bash

# Watch logs

docker logs -f api-container --tail 100

# Check health continuously

watch curl http://localhost:3333/api/health

# Monitor database

npx prisma studio

``` text

### Monitor Storefront

``` bash

# Check Next.js logs

docker logs -f storefront-container

# Load test

apache2-bench -n 1000 -c 10 http://localhost:3000/

``` text

---

## Troubleshooting Deployment

### API won't start

``` bash

# Check logs

docker logs api-container

# Verify database connection

psql $DATABASE_URL -c "SELECT 1"

# Check environment variables

env | grep API_

``` text

### Storefront loads slowly

``` bash

# Check Next.js build

npm run build -- --analyze

# Check API connectivity

curl $NEXT_PUBLIC_API_BASE_URL/health

# Monitor response times

curl -w "Total time: %{time_total}\n" http://localhost:3000

``` text

### Webhook failures

``` bash

# Verify webhook secret in environment

echo $STRIPE_WEBHOOK_SECRET

# Test webhook endpoint

curl -X POST http://localhost:3333/api/webhooks/stripe \
  -H "stripe-signature: test" \
  -d '{}'

``` text

---

## Summary

✅ **Independent Deployment Benefits:**

- Deploy updates without touching other services

- Scale services independently based on load

- Easier rollback of individual services

- Reduced deployment risk

- Faster iteration cycles

✅ **Combined Deployment Benefits:**

- Single command to deploy entire system

- Consistent versioning across services

- Simpler for small-scale deployments

Choose the approach based on your infrastructure and team needs.
