
# SHALKAAR Deployment Guide

Complete guide for deploying the SHALKAAR e-commerce platform to production.

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Prerequisites](#prerequisites)
3. [Database Setup](#database-setup)
4. [Storefront Deployment (Vercel)](#storefront-deployment-vercel)
5. [Admin CMS Deployment (Vercel)](#admin-cms-deployment-vercel)
6. [API Deployment](#api-deployment)
7. [Environment Configuration](#environment-configuration)
8. [CI/CD Pipeline](#ci-cd-pipeline)
9. [Monitoring & Logging](#monitoring-and-logging)
10. [Troubleshooting](#troubleshooting)

## Architecture Overview

``` text
┌─────────────────────────────────────────────────────────┐
│                   Internet Traffic                       │
└────────────────────┬────────────────────────────────────┘
                     │
        ┌────────────┴────────────┐
        │                         │
    ┌───▼──────┐          ┌──────▼───┐
    │Storefront│          │Admin CMS │
    │(Vercel)  │          │(Vercel)  │
    └───┬──────┘          └──────┬───┘
        │                        │
        └────────────┬───────────┘
                     │
            ┌────────▼────────┐
            │ NestJS API      │
            │ (Railway/Render)│
            └────────┬────────┘
                     │
         ┌───────────┴───────────┐
         │                       │
    ┌────▼──────┐      ┌────────▼─┐
    │PostgreSQL │      │ Cloudinary│
    │(Neon)     │      │(CDN)      │
    └───────────┘      └───────────┘

``` text

## Prerequisites

- GitHub account with repository access

- Vercel account for frontend deployments

- Railway or Render account for backend API

- Neon PostgreSQL account for database

- Stripe account for payment processing

- SMTP email service (Gmail, SendGrid, etc.)

- Docker and Docker Compose (for local development)

- pnpm 8+ and Node.js 20 LTS

## Database Setup

### Neon PostgreSQL

1. Create a new database on [Neon](https://neon.tech)
2. Copy your connection string
3. Set environment variable:
   ```bash
   DATABASE_URL=postgresql://user:password@region.neon.tech/dbname?sslmode=require
```text

### Migrations

Run database migrations before deployment:

``` bash

# From project root

pnpm db:migrate

``` text

### Seeding (Development)

To seed initial data:

``` bash
pnpm db:seed

``` text

## Storefront Deployment (Vercel)

### Manual Setup

1. **Connect Repository to Vercel**
   - Visit [vercel.com](https://vercel.com)
   - Import your GitHub repository
   - Select `apps/storefront` as the root directory

2. **Configure Project Settings**
   - Framework Preset: Next.js
   - Build Command: `pnpm build`
   - Output Directory: `.next`
   - Install Command: `pnpm install --frozen-lockfile`

3. **Environment Variables**
   Add in Vercel dashboard:
```text

   NEXT_PUBLIC_API_BASE_URL=https://api.shalkaar.com/api/v1
   NEXTAUTH_URL=https://shalkaar.com
   NEXTAUTH_SECRET=(generate with: openssl rand -hex 32)
   NEXT_PUBLIC_GA_ID=your_google_analytics_id
```text

4. **Custom Domain**
   - Add domain in Vercel project settings
   - Update DNS records to point to Vercel

### Automatic Deployment

CI/CD workflow automatically deploys to Vercel when:

- Changes pushed to `main` branch

- Files in `apps/storefront/` or `packages/` changed

- Workflow: `.github/workflows/deploy-storefront.yml`

### GitHub Secrets Required

``` text
VERCEL_TOKEN          # Vercel API token
VERCEL_ORG_ID         # Vercel organization ID
VERCEL_STOREFRONT_PROJECT_ID  # Project ID for storefront

``` text

## Admin CMS Deployment (Vercel)

### Manual Setup

1. **Connect Repository to Vercel**
   - Import repository again for admin project
   - Select `apps/admin` as the root directory

2. **Configure Project Settings**
   - Same as storefront (Next.js preset)
   - Root Directory: `apps/admin`

3. **Environment Variables**
```text

   NEXT_PUBLIC_API_BASE_URL=https://api.shalkaar.com/api/v1
   NEXTAUTH_URL=https://admin.shalkaar.com
   NEXTAUTH_SECRET=(generate with: openssl rand -hex 32)
   NEXT_PUBLIC_ADMIN_EMAIL_DOMAIN=@shalkaar.com
```text

4. **Protected Access**
   - Set up authentication via NextAuth
   - Configure role-based access control (RBAC)
   - Restrict to admin and super_admin users only

### Automatic Deployment

CI/CD workflow automatically deploys to Vercel:

- Workflow: `.github/workflows/deploy-admin.yml`

- Triggered on changes to `apps/admin/` in `main` branch

### GitHub Secrets Required

``` text
VERCEL_ADMIN_PROJECT_ID  # Project ID for admin CMS

``` text

## API Deployment

### Option 1: Railway

1. **Create Railway Project**
   - Visit [railway.app](https://railway.app)
   - Create new project from GitHub
   - Select SHALKAAR repository

2. **Configure Service**
   - Service: NestJS API
   - Root Directory: `services/api`
   - Start Command: `node dist/main`

3. **Add PostgreSQL Plugin**
   - Add PostgreSQL from plugin marketplace
   - Railway auto-generates DATABASE_URL

4. **Environment Variables**
```text

   API_ENV=production
   JWT_SECRET=(strong random key)
   JWT_EXPIRATION=7d
   NODE_ENV=production
```text

5. **Domain Configuration**
   - Enable public networking
   - Add custom domain (api.shalkaar.com)

### Option 2: Render

1. **Create Render Service**
   - Visit [render.com](https://render.com)
   - New → Web Service
   - Connect GitHub repo

2. **Configuration**
   - Name: `shalkaar-api`
   - Environment: Node
   - Build Command: `pnpm install && pnpm build:api`
   - Start Command: `node services/api/dist/main`
   - Root Directory: Leave blank (Render handles monorepo)

3. **Add Database**
   - New → PostgreSQL
   - Connect to web service
   - Auto-populates DATABASE_URL

4. **Environment Variables**
   - Same as Railway above

### Option 3: Docker (Self-Hosted)

1. **Build Docker Image**
   ```bash
   docker build -f Dockerfile.api -t shalkaar-api:latest .
```text

1. **Push to Registry**
   ```bash
   docker tag shalkaar-api:latest registry.example.com/shalkaar-api:latest
   docker push registry.example.com/shalkaar-api:latest
```text

2. **Deploy**
   - Use docker-compose or Kubernetes
   - Mount environment file
   - Expose port 3333

### Automatic API Deployment

CI/CD workflow handles Docker build and deployment:

- Workflow: `.github/workflows/deploy-api.yml`

- Builds and pushes Docker image

- Deploys to production server via SSH

### GitHub Secrets Required

``` text
DOCKER_REGISTRY       # Docker registry URL
DOCKER_USERNAME       # Docker registry username
DOCKER_PASSWORD       # Docker registry password
API_HOST              # Production server hostname
API_USERNAME          # SSH username
API_SSH_KEY           # SSH private key
SLACK_WEBHOOK         # Optional: Slack notifications

``` text

## Environment Configuration

### Production Environment Variables

Create `.env.production` with production-specific values:

``` bash

# Database (use Neon connection string)

DATABASE_URL=postgresql://...

# API

API_ENV=production
JWT_SECRET=(use 32+ character random string)

# Storefront

NEXT_PUBLIC_API_BASE_URL=https://api.shalkaar.com/api/v1
NEXTAUTH_URL=https://shalkaar.com
NEXTAUTH_SECRET=(use 32+ character random string)

# Payment Processing

STRIPE_PUBLIC_KEY=pk_live_...
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Email

SMTP_HOST=smtp.sendgrid.net
SMTP_USER=apikey
SMTP_PASS=(SendGrid API key)

``` text

### Secrets Management

- **Never commit .env files to repository**

- Use `.env.example` as template

- Add secrets to GitHub Actions, Vercel, and Railway/Render dashboards

- Rotate secrets regularly

- Use strong random values for secrets

## CI/CD Pipeline

### GitHub Actions Workflows

#### 1. CI (Continuous Integration)

- **Trigger**: Push to main/develop, pull requests

- **Jobs**:
  - ESLint (code style)
  - TypeScript type-check
  - Build all packages
  - Unit tests
  - Security audit

- **Artifact**: Build cache via Turbo

#### 2. Storefront Deployment

- **Trigger**: Push to main, changes in apps/storefront/

- **Steps**:
  - Install dependencies
  - Type check
  - Lint
  - Build
  - Deploy to Vercel

- **Time**: ~5 minutes

#### 3. Admin Deployment

- **Trigger**: Push to main, changes in apps/admin/

- **Steps**: Same as storefront

- **Time**: ~5 minutes

#### 4. API Deployment

- **Trigger**: Push to main, changes in services/api/

- **Steps**:
  - Build
  - Docker build and push
  - SSH deploy to production
  - Health check

- **Time**: ~15 minutes

#### 5. Security Scan

- **Trigger**: Daily schedule, push to main

- **Checks**:
  - CodeQL analysis
  - Dependency audit
  - SARIF report upload

### Branch Protection Rules

Protect `main` branch:

- ✅ Require pull request reviews (2 reviewers)

- ✅ Require status checks to pass (CI, type-check)

- ✅ Require branches to be up to date

- ✅ Require code owners approval

- ✅ Dismiss stale PR approvals

### Deployment Strategy

``` text
Feature Branch
    ↓
Pull Request (triggers CI)
    ↓
Code Review
    ↓
Merge to main (triggers all deployments)
    ↓
Storefront deployed to Vercel
Admin CMS deployed to Vercel
API deployed to Railway/Render
    ↓
Production live

``` text

## Monitoring & Logging

### Application Monitoring

1. **Sentry Error Tracking**
   - Captures JavaScript errors from frontend
   - Backend exception tracking
   - Performance monitoring
   - Release tracking

2. **Google Analytics**
   - User behavior tracking
   - Conversion tracking
   - Traffic analysis
   - Device and browser stats

### Logging Strategy

**API Logs**:

- Winston logger for structured logs

- Log levels: error, warn, info, debug

- Sent to centralized logging service (e.g., LogRocket)

**Frontend Logs**:

- Console errors captured by Sentry

- User interaction events to analytics

**Database Logs**:

- Query performance monitoring via pgBadger

- Connection pool monitoring

- Slow query logs

### Health Checks

- **API**: `GET /health` returns 200 with status

- **Storefront**: Monitor Core Web Vitals

- **Admin**: Check authentication endpoint

- **Database**: Connection pool monitoring

## Troubleshooting

### Deployment Failures

**Vercel Deployment Fails**

``` bash

# Check build logs in Vercel dashboard

# Common causes:

# 1. Environment variables not set

# 2. TypeScript compilation errors

# 3. Port conflicts

# 4. Missing dependencies

``` text

**API Deployment Fails**

``` bash

# SSH to production server

ssh -i <key> user@api.shalkaar.com

# Check Docker logs

docker-compose logs -f api

# Restart service

docker-compose restart api

``` text

**Database Connection Issues**

``` bash

# Test connection string

psql $DATABASE_URL -c "SELECT 1"

# Check connection pool

# If using PgBouncer, check bouncer logs

``` text

### Performance Issues

1. **Slow API Responses**
   - Check database query performance
   - Monitor CPU/memory on server
   - Review Turbo cache hit rate

2. **High Vercel Cold Starts**
   - Upgrade Vercel plan
   - Optimize bundle size with `next/bundle-analyzer`
   - Use ISG for static pages

3. **Database Bottleneck**
   - Add database indexes
   - Implement caching layer (Redis)
   - Use read replicas for high-traffic queries

### Rollback Procedure

**Quick Rollback**
1. Revert commit and push to main
2. GitHub Actions automatically redeploys
3. Previous version deployed within 5-15 minutes

**Manual Rollback**
1. Vercel: Use previous deployment from dashboard
2. Railway/Render: Switch to previous Docker image
3. Update GitHub to match deployed version

## Disaster Recovery

### Backup Strategy

- **Database**: Daily automated backups via Neon

- **Code**: GitHub repository is source of truth

- **Assets**: Cloudinary CDN with backup replicas

- **Configuration**: Stored in environment variables (no secrets in repo)

### Recovery Procedures

**Database Recovery**

``` bash

# Neon provides point-in-time recovery

# Access from Neon dashboard

# Restore to specific time/transaction

``` text

**Code Recovery**

``` bash

# Git provides full history

git log --oneline
git reset --hard <commit-hash>
git push -f origin main

``` text

**Asset Recovery**

- Cloudinary maintains backup copies

- Re-sync from source of truth if needed

## Post-Deployment Checklist

- [ ] Verify storefront loads and is responsive

- [ ] Check admin dashboard login works

- [ ] Test product listing and search

- [ ] Confirm payment processing (test mode)

- [ ] Verify email notifications send

- [ ] Check database backups are configured

- [ ] Monitor error tracking (Sentry)

- [ ] Review analytics and user activity

- [ ] Run security scan

- [ ] Update status page if applicable

## Support & Escalation

**Issues During Deployment**:
1. Check GitHub Actions logs
2. Review Vercel/Railway/Render dashboard
3. Check database connection and backups
4. Verify environment variables
5. Contact infrastructure team if needed

**Production Issues**:
1. Check error tracking (Sentry)
2. Review application logs
3. Monitor performance metrics
4. Execute rollback if necessary
5. Post-incident review after resolution

---

For questions or issues, contact the infrastructure team or refer to the main README.md.
