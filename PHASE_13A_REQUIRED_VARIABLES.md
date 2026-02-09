
# Phase 13a: Required Environment Variables Summary

## Quick Reference

### Development Environment

**Minimal Setup (for local development with mocks):**

``` text
NODE_ENV=development
DATABASE_URL=postgresql://user:password@localhost:5432/shalkaarnext
API_PORT=3333
API_URL=http://localhost:3333
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=dev-secret-change-in-production
NEXT_PUBLIC_API_BASE_URL=http://localhost:3333/api/v1

``` text

**Recommended Setup (more complete):**

``` text

# All minimal variables +

JWT_SECRET=dev-jwt-secret-change-in-production
JWT_REFRESH_SECRET=dev-refresh-secret-change-in-production
ADMIN_NEXTAUTH_URL=http://localhost:3001
ADMIN_NEXTAUTH_SECRET=dev-admin-secret-change-in-production
PAYMENT_GATEWAY=mock
EMAIL_PROVIDER=mock
LOG_LEVEL=debug
NEXT_PUBLIC_GA_ID=

``` text

**Total Variables:** 21
**Minimal Required:** 7
**Optional/Defaulted:** 14

---

### Staging Environment

**CRITICAL: All of these must be configured before deploying to staging**

``` text
🔴 CORE CONFIGURATION (6)
NODE_ENV=staging
API_PORT=3333
API_URL=https://api-staging.shalkaar.com
DATABASE_URL=postgresql://...staging database...
NEXTAUTH_URL=https://staging.shalkaar.com
NEXT_PUBLIC_API_BASE_URL=https://api-staging.shalkaar.com/api/v1

🔴 AUTHENTICATION (4) - MIN 32 CHARACTERS EACH

JWT_SECRET=STAGING_VALUE_MINIMUM_32_CHARS
JWT_REFRESH_SECRET=STAGING_VALUE_MINIMUM_32_CHARS
NEXTAUTH_SECRET=STAGING_VALUE_MINIMUM_32_CHARS
ADMIN_NEXTAUTH_SECRET=STAGING_VALUE_MINIMUM_32_CHARS

🔴 PAYMENT - STRIPE TEST KEYS (3)

PAYMENT_GATEWAY=stripe
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...

🔴 EMAIL - SMTP CONFIGURED (5)

EMAIL_PROVIDER=smtp
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASS=SG....
SMTP_FROM_EMAIL=noreply-staging@shalkaar.com

🔴 MONITORING (2)
SENTRY_DSN=https://...sentry...
SENTRY_ENVIRONMENT=staging

✅ OPTIONAL (defaults available)

- LOG_LEVEL (default: info)

- CORS_ORIGIN (has default)

- RATE_LIMIT_* (has defaults)

``` text

**Total Variables:** 25
**Absolutely Required:** 20
**Optional/Defaulted:** 5

---

### Production Environment

**CRITICAL: Production requires all staging variables + additional hardening**

``` text
🔴 CORE CONFIGURATION (6)
NODE_ENV=production
API_PORT=3333
API_URL=https://api.shalkaar.com
DATABASE_URL=postgresql://...production database...
NEXTAUTH_URL=https://www.shalkaar.com
NEXT_PUBLIC_API_BASE_URL=https://api.shalkaar.com/api/v1

🔴 AUTHENTICATION (4) - UNIQUE, MIN 32 CHARS EACH

JWT_SECRET=PRODUCTION_UNIQUE_VALUE_MINIMUM_32_CHARS
JWT_REFRESH_SECRET=PRODUCTION_UNIQUE_VALUE_MINIMUM_32_CHARS
NEXTAUTH_SECRET=PRODUCTION_UNIQUE_VALUE_MINIMUM_32_CHARS
ADMIN_NEXTAUTH_SECRET=PRODUCTION_UNIQUE_VALUE_MINIMUM_32_CHARS

🔴 PAYMENT - STRIPE LIVE KEYS (3)

PAYMENT_GATEWAY=stripe
STRIPE_SECRET_KEY=sk_live_...
STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...

🔴 EMAIL - PRODUCTION SMTP (5)

EMAIL_PROVIDER=sendgrid
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASS=SG....
SMTP_FROM_EMAIL=noreply@shalkaar.com

🔴 MONITORING (2)
SENTRY_DSN=https://...production...
SENTRY_ENVIRONMENT=production

🔴 SECURITY - PRODUCTION HARDENING (3)

CORS_ORIGIN=https://www.shalkaar.com,https://admin.shalkaar.com
TRUSTED_PROXIES=YOUR_LOAD_BALANCER_IPS
RATE_LIMIT_MAX_REQUESTS=100

✅ OPTIONAL (defaults available)

- LOG_LEVEL (default: warn for production)

- DATABASE_POOL_SIZE (default: 50)

``` text

**Total Variables:** 28
**Absolutely Required:** 25
**Optional/Hardened:** 3

---

## 📋 Variable Groups

### Group 1: Core & Deployment (Required in all environments)

``` text
NODE_ENV
API_PORT
API_URL
DATABASE_URL
NEXTAUTH_URL
NEXT_PUBLIC_API_BASE_URL

``` text

### Group 2: Authentication (Required in staging/production)

``` text
JWT_SECRET (min 32 chars)
JWT_REFRESH_SECRET (min 32 chars)
NEXTAUTH_SECRET (min 32 chars)
ADMIN_NEXTAUTH_SECRET (min 32 chars)
ADMIN_NEXTAUTH_URL

``` text

### Group 3: Payment (Required in staging/production)

``` text
STRIPE_SECRET_KEY (sk_test_ or sk_live_)
STRIPE_PUBLISHABLE_KEY (pk_test_ or pk_live_)
STRIPE_WEBHOOK_SECRET (whsec_...)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY

``` text

### Group 4: Email (Required in staging/production)

``` text
SMTP_HOST
SMTP_PORT
SMTP_USER
SMTP_PASS
SMTP_FROM_EMAIL

``` text

### Group 5: Monitoring & Logging

``` text
LOG_LEVEL
SENTRY_DSN (required in staging/production)
SENTRY_ENVIRONMENT

``` text

### Group 6: Security (Required in production)

``` text
CORS_ORIGIN (required in staging/production)
TRUSTED_PROXIES (required in production)
RATE_LIMIT_*

``` text

### Group 7: Features (Optional)

``` text
NEXT_PUBLIC_GA_ID
NEXT_PUBLIC_ENABLE_*
NEXT_PUBLIC_APP_NAME
NEXT_PUBLIC_SUPPORT_EMAIL

``` text

---

## ✅ Pre-Deployment Checklist

### Before Staging Deployment

- [ ] All 20 required variables are set

- [ ] All auth secrets are minimum 32 characters

- [ ] Stripe test keys (sk_test_, pk_test_) are configured

- [ ] SMTP credentials work (test sending email)

- [ ] SENTRY_DSN is from staging project

- [ ] DATABASE_URL points to staging database

- [ ] API_URL uses https://api-staging.shalkaar.com

- [ ] NEXTAUTH_URL uses https://staging.shalkaar.com

- [ ] Secrets are stored securely (not in git)

- [ ] No sensitive variables have NEXT_PUBLIC_ prefix

### Before Production Deployment

- [ ] All 25 required variables are set

- [ ] All secrets are UNIQUE from staging

- [ ] Stripe live keys (sk_live_, pk_live_) are configured

- [ ] Production SMTP server tested

- [ ] SENTRY_DSN is from production project

- [ ] DATABASE_URL points to production database

- [ ] API_URL uses https://api.shalkaar.com

- [ ] NEXTAUTH_URL uses https://www.shalkaar.com

- [ ] CORS_ORIGIN restricted to only production domains

- [ ] TRUSTED_PROXIES includes load balancer IPs

- [ ] LOG_LEVEL is set to 'warn' or 'error'

- [ ] DATABASE_POOL_SIZE increased to 50

- [ ] All secrets managed by secrets management service

- [ ] No .env.production file checked into git

- [ ] Deployment validated with test payment

- [ ] Error tracking verified with test event

- [ ] Email delivery verified with test email

---

## 🔑 Secret Generation

### Generate JWT Secrets

``` bash
openssl rand -base64 32

# Output: xK9sL2mP5nQ8rT1uV4wX7yZ0aB3cD6eF9gH2jK5l=

``` text

### Generate NextAuth Secrets

``` bash
openssl rand -base64 32

# Output: aB3cD6eF9gH2jK5lM8nO1pQ4rS7tU0vW3xY6zZ9aB=

``` text

### Using in Multiple Variables

``` bash

# Generate once, use for different variables

JWT_SECRET=$(openssl rand -base64 32)
JWT_REFRESH_SECRET=$(openssl rand -base64 32)
NEXTAUTH_SECRET=$(openssl rand -base64 32)
ADMIN_NEXTAUTH_SECRET=$(openssl rand -base64 32)

# Verify they're different

echo "JWT: $JWT_SECRET"
echo "Refresh: $JWT_REFRESH_SECRET"
echo "NextAuth: $NEXTAUTH_SECRET"
echo "Admin: $ADMIN_NEXTAUTH_SECRET"

``` text

---

## 🚨 Common Mistakes

### ❌ Wrong: Using same JWT secret for all environments

``` text
Development: JWT_SECRET=dev-secret
Staging: JWT_SECRET=dev-secret        # ❌ WRONG
Production: JWT_SECRET=dev-secret      # ❌ WRONG

``` text

### ✅ Correct: Unique secrets per environment

``` text
Development: JWT_SECRET=dev-xxx (can be simple)
Staging: JWT_SECRET=staging-abc (min 32 chars, unique)
Production: JWT_SECRET=prod-xyz (min 32 chars, unique)

``` text

### ❌ Wrong: Using test keys in production

``` text
STRIPE_SECRET_KEY=sk_test_...    # ❌ WRONG for production

``` text

### ✅ Correct: Live keys in production

``` text
Development: STRIPE_SECRET_KEY=sk_test_...
Staging: STRIPE_SECRET_KEY=sk_test_...
Production: STRIPE_SECRET_KEY=sk_live_...    # ✅ CORRECT

``` text

### ❌ Wrong: Exposing secrets to browser

``` text
NEXT_PUBLIC_JWT_SECRET=...              # ❌ SECURITY RISK
NEXT_PUBLIC_STRIPE_SECRET_KEY=...       # ❌ SECURITY RISK
NEXT_PUBLIC_DATABASE_URL=...            # ❌ SECURITY RISK

``` text

### ✅ Correct: Only public-safe values exposed

``` text
NEXT_PUBLIC_API_BASE_URL=...           # ✅ Safe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=... # ✅ Safe (public key)
NEXT_PUBLIC_GA_ID=...                  # ✅ Safe

``` text

---

## 📊 Variable Count Summary

| Environment | Required | Optional/Default | Total | Validation |

| ------------- | ---------- | ------------------ | ------- | ----------- |
| Development | 7 | 14 | 21 | Lenient |

| Staging | 20 | 5 | 25 | Strict |
| Production | 25 | 3 | 28 | Very Strict |

---

## 🔗 Environment File Templates

### Use These Templates:

1. **Development:** Copy from `.env.development`
   - Start with mocks
   - Gradually replace with real services

2. **Staging:** Copy from `.env.staging`
   - All required variables listed
   - REPLACE_* placeholders show where to add secrets

3. **Production:** Copy from `.env.production`
   - Most strict setup
   - All variables documented
   - Security notes included

---

## 📚 Additional Resources

- Full documentation: See `PHASE_13A_ENV_CONFIGURATION.md`

- Validation utility: `packages/config/src/env-validator.ts`

- Backend config: `packages/config/src/backend-config.ts`

- Frontend config: `packages/config/src/frontend-config.ts`

---

*Phase 13a: Required Variables Reference - Use this checklist before deployment*
