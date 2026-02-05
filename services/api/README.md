# SHALKAAR NestJS Backend API

Premium Balochi Fashion E-Commerce API built with NestJS, PostgreSQL, and TypeScript.

## Features

- RESTful API with OpenAPI documentation
- JWT authentication and RBAC
- Product catalog management
- Order processing and fulfillment
- Payment processing integration
- Content management system (CMS)
- User management
- Analytics and reporting
- Email notifications

## Development

```bash
# Install dependencies
pnpm install

# Start in development mode
pnpm dev

# Run database migrations
pnpm typeorm:migration:run

# Seed initial data
pnpm seed
```

## Build & Deployment

```bash
# Build
pnpm build

# Start production
pnpm start
```

## Environment Variables

See `.env.example` for required variables.

```
DATABASE_URL=postgresql://user:password@host/dbname
JWT_SECRET=your-secret-key
NODE_ENV=development|production
```

## API Routes

All routes prefixed with `/api/v1`

- `GET /products` - List products
- `POST /orders` - Create order
- `POST /auth/register` - Register user
- `POST /auth/login` - Login user
- (More endpoints documented in API docs)

---

**Status:** Scaffolding Phase - Ready for Implementation
