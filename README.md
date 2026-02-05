# SHALKAAR E-Commerce Platform

Premium Balochi fashion e-commerce platform celebrating heritage, artisanship, and handcrafted excellence. Built with modern web technologies for scalability, performance, and maintainability.

## 🎯 Quick Start

### Prerequisites

- **Node.js**: 20 LTS or higher
- **pnpm**: 8.0.0 or higher
- **Docker**: For local database (optional)
- **Git**: For version control

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/shalkaarnext.git
cd shalkaarnext

# Install dependencies (monorepo)
pnpm install

# Copy environment variables
cp .env.example .env.local

# Start development servers (all at once)
pnpm dev

# Or start individual servers:
pnpm dev:api          # API on http://localhost:3333
pnpm dev:storefront   # Storefront on http://localhost:3000
pnpm dev:admin        # Admin on http://localhost:3001
```

### With Docker

```bash
# Start all services with Docker
docker-compose up -d

# Stop services
docker-compose down

# View logs
docker-compose logs -f
```

## 📁 Project Structure

```
shalkaarnext/
├── apps/                           # Frontend applications
│   ├── storefront/                # Customer-facing e-commerce storefront
│   │   ├── src/
│   │   │   ├── app/              # Next.js App Router pages
│   │   │   ├── components/       # Reusable components
│   │   │   ├── context/          # React context (Cart, User, Theme)
│   │   │   ├── hooks/            # Custom React hooks
│   │   │   └── lib/              # Utility functions
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   └── tailwind.config.ts
│   │
│   └── admin/                     # Admin CMS dashboard
│       ├── src/
│       │   ├── app/              # Dashboard pages
│       │   ├── components/       # Admin-specific components
│       │   ├── context/          # Admin auth context
│       │   └── lib/              # Admin utilities
│       ├── package.json
│       └── tailwind.config.ts
│
├── packages/                       # Shared libraries
│   ├── shared-types/             # TypeScript types, DTOs, enums, constants
│   ├── shared-utils/             # Utility functions
│   ├── shared-ui/                # React UI components
│   └── api-client/               # Typed HTTP client
│
├── services/                       # Backend services
│   └── api/                       # NestJS REST API
│       ├── src/
│       │   ├── main.ts           # NestJS bootstrap
│       │   ├── app.module.ts     # Root module
│       │   └── modules/          # Feature modules
│       ├── package.json
│       └── tsconfig.json
│
├── .github/workflows/             # GitHub Actions CI/CD
│   ├── ci.yml                    # Linting, type-check, build, test
│   ├── deploy-storefront.yml     # Deploy to Vercel
│   ├── deploy-admin.yml          # Deploy admin to Vercel
│   ├── deploy-api.yml            # Deploy API
│   └── security.yml              # Security scanning
│
├── Documentation/
│   ├── BRAND_DESIGN_FOUNDATION.md    # Brand guidelines
│   ├── MONOREPO_ARCHITECTURE.md      # Technical architecture
│   ├── DEPLOYMENT.md                  # Deployment guide
│   └── README.md                      # This file
│
└── Configuration Files
    ├── package.json               # Workspace configuration
    ├── pnpm-workspace.yaml        # pnpm workspaces
    ├── turbo.json                 # Turborepo configuration
    ├── tsconfig.json              # Root TypeScript config
    ├── .env.example               # Environment template
    ├── docker-compose.yml         # Local development
    └── Dockerfile.api             # API Docker image
```

## 🔧 Technology Stack

### Frontend
- Next.js 14.2+, React 18.3+, TypeScript 5.3+
- Tailwind CSS 3.4+ for styling
- NextAuth 4.24+ for authentication
- React Context API for state management

### Backend
- NestJS 11.0+ for API framework
- TypeScript 5.3+ for type safety
- PostgreSQL 16 (Neon serverless)
- TypeORM 0.3+ for database ORM
- JWT with Passport for authentication

### DevOps
- pnpm 8.0+ for package management
- Turborepo 1.12+ for build orchestration
- GitHub Actions for CI/CD
- Docker & Docker Compose for containerization
- Vercel for frontend hosting
- Railway/Render for backend hosting

## 📦 Available Scripts

```bash
# Development
pnpm dev                # Start all dev servers
pnpm dev:api            # Start API only
pnpm dev:storefront     # Start storefront only
pnpm dev:admin          # Start admin CMS only

# Building
pnpm build              # Build everything
pnpm build:api          # Build API only
pnpm build:storefront   # Build storefront only
pnpm build:admin        # Build admin only

# Code Quality
pnpm lint               # Run ESLint
pnpm lint:fix           # Fix linting issues
pnpm type-check         # Type check all packages
pnpm format             # Format code with Prettier

# Testing & Database
pnpm test               # Run tests
pnpm db:migrate         # Run migrations
pnpm db:seed            # Seed database
pnpm db:reset           # Reset to initial state

# Docker
pnpm docker:up          # Start Docker containers
pnpm docker:down        # Stop Docker containers
pnpm docker:logs        # View logs
```

## 🌐 Service URLs (Development)

- **Storefront**: http://localhost:3000
- **Admin CMS**: http://localhost:3001
- **API**: http://localhost:3333
- **Database**: localhost:5432 (PostgreSQL)
- **PgAdmin**: http://localhost:5050 (Database management)

## 📚 Documentation

- **[BRAND_DESIGN_FOUNDATION.md](./BRAND_DESIGN_FOUNDATION.md)** - Brand guidelines and design system
- **[MONOREPO_ARCHITECTURE.md](./MONOREPO_ARCHITECTURE.md)** - Technical architecture and folder structure
- **[DEPLOYMENT.md](./DEPLOYMENT.md)** - Production deployment and CI/CD setup
- **[apps/storefront/README.md](./apps/storefront/README.md)** - Storefront guide
- **[apps/admin/README.md](./apps/admin/README.md)** - Admin CMS guide
- **[services/api/README.md](./services/api/README.md)** - API guide

## 🚀 Deployment

Automatic deployment via GitHub Actions:
1. **Storefront** - Deployed to Vercel on push to `main`
2. **Admin CMS** - Deployed to Vercel on push to `main`
3. **API** - Deployed to Railway/Render on push to `main`

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed instructions.

## 🔐 Environment Variables

```bash
cp .env.example .env.local
# Edit .env.local with your configuration
```

Key variables:
- `DATABASE_URL` - PostgreSQL connection string
- `NEXT_PUBLIC_API_BASE_URL` - API endpoint
- `JWT_SECRET` - JWT signing secret (40+ characters)
- `NEXTAUTH_SECRET` - NextAuth session secret (40+ characters)

Never commit `.env.local` to version control.

## 🏗️ Architecture Highlights

✅ **Monorepo**: Single repo, multiple apps and packages
✅ **Type Safe**: Full TypeScript strict mode across codebase
✅ **Scalable**: Modular NestJS backend, serverless frontend
✅ **Fast Builds**: Turborepo caching and parallel builds
✅ **DRY Code**: Shared types, UI components, and utilities
✅ **CI/CD**: GitHub Actions for automated testing and deployment
✅ **Docker**: Local development with Docker Compose

## 🤝 Contributing

### Branch Strategy
- `main` - Production code (protected)
- `develop` - Development branch
- `feature/*` - Feature branches from develop
- `hotfix/*` - Urgent fixes from main

### Before Committing
1. Run `pnpm lint:fix` to fix style issues
2. Run `pnpm type-check` to verify TypeScript
3. Run `pnpm test` to run tests
4. Use meaningful commit messages

### Pull Request Process
1. Create feature branch and make changes
2. Ensure all checks pass locally
3. Create PR with description
4. Wait for code review and CI checks
5. Merge when approved

## 🐛 Troubleshooting

**Port Already in Use**
```bash
# Kill process using port
lsof -i :3000 | grep LISTEN | awk '{print $2}' | xargs kill -9
```

**Database Connection Failed**
```bash
# Verify DATABASE_URL in .env.local
# Check if PostgreSQL is running
docker ps | grep postgres
```

**Module Not Found**
```bash
# Rebuild dependencies
pnpm install --force
pnpm build:deps
```

## 📞 Support

- **Issues**: GitHub Issues for bugs and features
- **Questions**: GitHub Discussions
- **Docs**: Check README files in each package

## 📄 License

Proprietary - All rights reserved by SHALKAAR

---

**Version**: 1.0.0 | **Status**: Active Development | **Last Updated**: 2024
