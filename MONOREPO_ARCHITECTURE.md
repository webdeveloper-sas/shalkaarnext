
# SHALKAAR: Production-Ready Monorepo Architecture

**A Full-Stack Serverless E-Commerce Platform**
*Premium Balochi Fashion | Next.js + NestJS + PostgreSQL*

---

## ARCHITECTURE OVERVIEW

### Technology Stack (Locked)

- **Frontend**: Next.js 14+ (App Router) + TypeScript

- **Backend**: NestJS 11+ (microservices-ready)

- **Database**: PostgreSQL (Neon serverless)

- **Hosting**: Vercel free tier (frontend) + Neon (database)

- **Package Manager**: pnpm (monorepo optimized)

- **Build Tool**: Turborepo (monorepo orchestration)

- **Runtime**: Node.js 20 LTS

### Core Principles

1. **Separation of Concerns** — Strict boundaries between storefront, admin, and API
2. **Code Sharing** — Single source of truth for types, components, utilities
3. **Serverless-First** — All services designed for Vercel's edge functions and PostgreSQL serverless
4. **Type Safety** — Full TypeScript across frontend, backend, and shared packages
5. **Scalability** — Modular structure allows independent service scaling
6. **Maintainability** — Clear file organization, consistent naming, minimal duplication

---

## MONOREPO FOLDER STRUCTURE

``` text
shalkaarnext/
│
├── apps/                                    # Customer-facing and admin applications
│   ├── storefront/                         # Next.js customer storefront
│   │   ├── src/
│   │   │   ├── app/                       # Next.js App Router pages/layouts
│   │   │   │   ├── (marketing)/           # Public marketing pages
│   │   │   │   │   ├── page.tsx           # Homepage
│   │   │   │   │   ├── about/page.tsx
│   │   │   │   │   └── contact/page.tsx
│   │   │   │   ├── collections/           # Collection listing and detail pages
│   │   │   │   │   ├── page.tsx           # /collections
│   │   │   │   │   └── [slug]/page.tsx    # /collections/[slug]
│   │   │   │   ├── products/              # Product pages
│   │   │   │   │   └── [slug]/page.tsx    # /products/[slug]
│   │   │   │   ├── cart/page.tsx
│   │   │   │   ├── checkout/page.tsx
│   │   │   │   ├── account/               # Customer account pages
│   │   │   │   │   ├── page.tsx
│   │   │   │   │   ├── orders/page.tsx
│   │   │   │   │   └── wishlist/page.tsx
│   │   │   │   ├── auth/                  # Auth pages (login, signup)
│   │   │   │   ├── api/                   # API routes (for client-side calls, not SSR)
│   │   │   │   │   ├── auth/[...nextauth].ts
│   │   │   │   │   ├── revalidate/route.ts
│   │   │   │   │   └── webhooks/[event].ts
│   │   │   │   └── layout.tsx             # Root layout
│   │   │   ├── components/                # Storefront-specific UI components
│   │   │   │   ├── ProductCard.tsx
│   │   │   │   ├── ProductGrid.tsx
│   │   │   │   ├── CollectionHero.tsx
│   │   │   │   ├── Navigation.tsx
│   │   │   │   ├── Footer.tsx
│   │   │   │   └── sections/              # Homepage sections
│   │   │   │       ├── HeroSection.tsx
│   │   │   │       ├── CraftStories.tsx
│   │   │   │       └── TestimonialSection.tsx
│   │   │   ├── hooks/                     # Custom React hooks (storefront-specific)
│   │   │   │   ├── useCart.ts
│   │   │   │   ├── useWishlist.ts
│   │   │   │   ├── useFetch.ts
│   │   │   │   └── useAuth.ts
│   │   │   ├── lib/                       # Utilities (storefront-specific)
│   │   │   │   ├── api-client.ts          # API communication layer
│   │   │   │   ├── validation.ts
│   │   │   │   └── seo.ts
│   │   │   ├── styles/                    # Global styles
│   │   │   │   ├── globals.css
│   │   │   │   └── tokens.css             # Design tokens from foundation
│   │   │   ├── context/                   # React Context (cart, user, theme)
│   │   │   │   ├── CartContext.tsx
│   │   │   │   ├── UserContext.tsx
│   │   │   │   └── ThemeContext.tsx
│   │   │   └── middleware.ts              # Next.js middleware (auth, redirects)
│   │   ├── public/
│   │   │   ├── images/
│   │   │   │   ├── products/
│   │   │   │   ├── collections/
│   │   │   │   └── hero/
│   │   │   ├── fonts/
│   │   │   └── robots.txt
│   │   ├── .env.example
│   │   ├── next.config.js
│   │   ├── tsconfig.json
│   │   ├── tailwind.config.js              # Tailwind config (brand colors, spacing)
│   │   ├── package.json
│   │   └── README.md
│   │
│   └── admin/                              # Next.js admin CMS
│       ├── src/
│       │   ├── app/
│       │   │   ├── login/page.tsx          # Admin login
│       │   │   ├── dashboard/              # Admin dashboard
│       │   │   │   ├── page.tsx            # Overview
│       │   │   │   ├── products/           # Product management
│       │   │   │   │   ├── page.tsx        # Product list
│       │   │   │   │   ├── [id]/page.tsx   # Edit product
│       │   │   │   │   └── create/page.tsx # Create product
│       │   │   │   ├── collections/        # Collection management
│       │   │   │   ├── orders/             # Order management
│       │   │   │   │   ├── page.tsx        # Order list
│       │   │   │   │   └── [id]/page.tsx   # Order detail
│       │   │   │   ├── artisans/           # Artisan profiles
│       │   │   │   ├── content/            # CMS content (stories, blog)
│       │   │   │   │   ├── page.tsx
│       │   │   │   │   ├── [id]/page.tsx
│       │   │   │   │   └── create/page.tsx
│       │   │   │   ├── analytics/          # Sales, traffic analytics
│       │   │   │   ├── users/              # Customer management
│       │   │   │   ├── settings/           # Admin settings
│       │   │   │   │   ├── page.tsx
│       │   │   │   │   ├── branding/page.tsx
│       │   │   │   │   └── email/page.tsx
│       │   │   │   └── layout.tsx          # Admin sidebar layout
│       │   │   ├── api/                    # Admin API routes
│       │   │   │   ├── auth/[...nextauth].ts
│       │   │   │   └── webhooks/[event].ts
│       │   │   └── layout.tsx
│       │   ├── components/                 # Admin UI components
│       │   │   ├── DataTable.tsx           # Reusable data table
│       │   │   ├── Forms/
│       │   │   │   ├── ProductForm.tsx
│       │   │   │   ├── CollectionForm.tsx
│       │   │   │   └── ContentForm.tsx
│       │   │   ├── Modals/
│       │   │   │   ├── ConfirmDeleteModal.tsx
│       │   │   │   └── BulkActionModal.tsx
│       │   │   ├── Sidebar.tsx
│       │   │   ├── TopNav.tsx
│       │   │   └── Analytics/
│       │   │       ├── SalesChart.tsx
│       │   │       ├── OrderSummary.tsx
│       │   │       └── TrafficMetrics.tsx
│       │   ├── hooks/                     # Admin-specific hooks
│       │   │   ├── useAdmin.ts            # Admin auth context
│       │   │   ├── useFetch.ts            # Data fetching
│       │   │   ├── useForm.ts             # Form handling
│       │   │   └── useQuery.ts            # API queries
│       │   ├── lib/                       # Admin utilities
│       │   │   ├── api-client.ts          # API layer
│       │   │   ├── validation.ts
│       │   │   ├── formatters.ts
│       │   │   └── constants.ts           # Admin constants
│       │   ├── styles/
│       │   ├── context/                   # Admin auth context
│       │   │   └── AdminAuthContext.tsx
│       │   └── middleware.ts              # Admin auth middleware
│       ├── public/
│       ├── .env.example
│       ├── next.config.js
│       ├── tsconfig.json
│       ├── tailwind.config.js              # Different theme for admin
│       ├── package.json
│       └── README.md
│
├── packages/                                # Shared packages
│   ├── shared-types/                       # TypeScript type definitions
│   │   ├── src/
│   │   │   ├── api/
│   │   │   │   ├── request.types.ts       # API request DTOs
│   │   │   │   ├── response.types.ts      # API response DTOs
│   │   │   │   └── error.types.ts         # Error types
│   │   │   ├── domain/
│   │   │   │   ├── product.types.ts       # Product entity types
│   │   │   │   ├── collection.types.ts
│   │   │   │   ├── order.types.ts
│   │   │   │   ├── user.types.ts
│   │   │   │   ├── artisan.types.ts
│   │   │   │   ├── content.types.ts       # Blog, craft stories
│   │   │   │   └── payment.types.ts
│   │   │   ├── enum/
│   │   │   │   ├── order-status.enum.ts
│   │   │   │   ├── product-status.enum.ts
│   │   │   │   ├── payment-method.enum.ts
│   │   │   │   └── user-role.enum.ts
│   │   │   ├── index.ts
│   │   │   └── constants.ts                # Shared constants
│   │   ├── tsconfig.json
│   │   ├── package.json
│   │   └── README.md
│   │
│   ├── shared-ui/                          # Reusable UI components
│   │   ├── src/
│   │   │   ├── Button.tsx                  # Primitive components
│   │   │   ├── Input.tsx
│   │   │   ├── Select.tsx
│   │   │   ├── Modal.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── Badge.tsx
│   │   │   ├── Spinner.tsx
│   │   │   ├── Toast.tsx
│   │   │   ├── Accordion.tsx
│   │   │   ├── Tabs.tsx
│   │   │   ├── hooks/                     # Shared hooks
│   │   │   │   ├── useToast.ts
│   │   │   │   ├── useModal.ts
│   │   │   │   └── useClickOutside.ts
│   │   │   ├── utils/
│   │   │   │   ├── cn.ts                  # Class name utility (Tailwind)
│   │   │   │   └── colors.ts              # Brand color utilities
│   │   │   ├── styles/
│   │   │   │   ├── tailwind.config.js     # Shared Tailwind config (brand tokens)
│   │   │   │   └── globals.css
│   │   │   ├── index.ts
│   │   │   └── README.md
│   │   ├── tsconfig.json
│   │   ├── package.json
│   │   └── storybook/ (optional)           # Component documentation
│   │
│   ├── shared-utils/                       # Helper functions and utilities
│   │   ├── src/
│   │   │   ├── string/
│   │   │   │   ├── slugify.ts
│   │   │   │   ├── truncate.ts
│   │   │   │   └── formatters.ts
│   │   │   ├── number/
│   │   │   │   ├── currency.ts            # Currency formatting
│   │   │   │   ├── percent.ts
│   │   │   │   └── calculations.ts
│   │   │   ├── date/
│   │   │   │   ├── format.ts
│   │   │   │   ├── parse.ts
│   │   │   │   └── helpers.ts
│   │   │   ├── validation/
│   │   │   │   ├── email.ts
│   │   │   │   ├── phone.ts
│   │   │   │   ├── url.ts
│   │   │   │   └── zod-schemas.ts         # Zod validation schemas
│   │   │   ├── api/
│   │   │   │   ├── fetch.ts               # Universal fetch wrapper
│   │   │   │   ├── error-handler.ts       # API error handling
│   │   │   │   └── retry-logic.ts         # Retry mechanism for failed requests
│   │   │   ├── env/
│   │   │   │   └── env-validator.ts       # Environment variable validation
│   │   │   ├── index.ts
│   │   │   └── README.md
│   │   ├── tsconfig.json
│   │   ├── package.json
│   │   └── README.md
│   │
│   ├── shared-config/                      # Shared configuration files
│   │   ├── src/
│   │   │   ├── eslint.config.js            # ESLint configuration
│   │   │   ├── prettier.config.js          # Prettier configuration
│   │   │   ├── tsconfig.base.json          # Base TypeScript config
│   │   │   ├── jest.config.js              # Jest configuration
│   │   │   └── vitest.config.ts            # Vitest configuration
│   │   ├── package.json
│   │   └── README.md
│   │
│   └── api-client/                         # Typed API client for frontend apps
│       ├── src/
│       │   ├── client.ts                   # Base API client instance
│       │   ├── endpoints/
│       │   │   ├── products.ts             # Product endpoints
│       │   │   ├── collections.ts
│       │   │   ├── orders.ts
│       │   │   ├── auth.ts
│       │   │   ├── cart.ts
│       │   │   ├── wishlist.ts
│       │   │   ├── users.ts
│       │   │   └── content.ts              # Blog/stories endpoints
│       │   ├── hooks/                      # Query hooks (React Query)
│       │   │   ├── useProducts.ts
│       │   │   ├── useOrders.ts
│       │   │   ├── useCart.ts
│       │   │   └── useUser.ts
│       │   ├── mutations/
│       │   │   ├── useCreateOrder.ts
│       │   │   ├── useUpdateProduct.ts
│       │   │   └── useCreateContent.ts
│       │   ├── index.ts
│       │   └── README.md
│       ├── tsconfig.json
│       ├── package.json
│       └── README.md
│
├── services/                                # Backend microservices (NestJS)
│   └── api/                                # Main API service
│       ├── src/
│       │   ├── main.ts                     # NestJS bootstrap
│       │   ├── app.module.ts               # Root module
│       │   ├── config/                     # Configuration
│       │   │   ├── database.config.ts
│       │   │   ├── auth.config.ts
│       │   │   ├── payment.config.ts
│       │   │   └── email.config.ts
│       │   ├── modules/                    # Feature modules
│       │   │   ├── products/
│       │   │   │   ├── products.module.ts
│       │   │   │   ├── products.service.ts
│       │   │   │   ├── products.controller.ts
│       │   │   │   ├── dto/
│       │   │   │   │   ├── create-product.dto.ts
│       │   │   │   │   ├── update-product.dto.ts
│       │   │   │   │   └── product-query.dto.ts
│       │   │   │   ├── entities/
│       │   │   │   │   └── product.entity.ts
│       │   │   │   └── products.repository.ts
│       │   │   ├── collections/
│       │   │   │   ├── collections.module.ts
│       │   │   │   ├── collections.service.ts
│       │   │   │   ├── collections.controller.ts
│       │   │   │   ├── dto/
│       │   │   │   ├── entities/
│       │   │   │   └── collections.repository.ts
│       │   │   ├── orders/
│       │   │   │   ├── orders.module.ts
│       │   │   │   ├── orders.service.ts
│       │   │   │   ├── orders.controller.ts
│       │   │   │   ├── dto/
│       │   │   │   ├── entities/
│       │   │   │   └── orders.repository.ts
│       │   │   ├── auth/                   # Authentication & JWT
│       │   │   │   ├── auth.module.ts
│       │   │   │   ├── auth.service.ts
│       │   │   │   ├── auth.controller.ts
│       │   │   │   ├── jwt.strategy.ts
│       │   │   │   ├── dto/
│       │   │   │   └── guards/
│       │   │   │       ├── jwt.guard.ts
│       │   │   │       └── admin.guard.ts
│       │   │   ├── users/
│       │   │   │   ├── users.module.ts
│       │   │   │   ├── users.service.ts
│       │   │   │   ├── users.controller.ts
│       │   │   │   ├── dto/
│       │   │   │   ├── entities/
│       │   │   │   └── users.repository.ts
│       │   │   ├── cart/                   # Cart management (stateless)
│       │   │   │   ├── cart.module.ts
│       │   │   │   ├── cart.service.ts
│       │   │   │   └── cart.controller.ts
│       │   │   ├── wishlist/
│       │   │   ├── payment/                # Payment processing
│       │   │   │   ├── payment.module.ts
│       │   │   │   ├── payment.service.ts
│       │   │   │   ├── payment.controller.ts
│       │   │   │   └── providers/          # Payment gateway integrations
│       │   │   │       ├── stripe.provider.ts
│       │   │   │       └── paypal.provider.ts
│       │   │   ├── content/                # Blog, craft stories, testimonials
│       │   │   │   ├── content.module.ts
│       │   │   │   ├── content.service.ts
│       │   │   │   ├── content.controller.ts
│       │   │   │   ├── dto/
│       │   │   │   └── entities/
│       │   │   ├── artisans/               # Artisan profiles
│       │   │   │   ├── artisans.module.ts
│       │   │   │   ├── artisans.service.ts
│       │   │   │   ├── artisans.controller.ts
│       │   │   │   ├── dto/
│       │   │   │   └── entities/
│       │   │   ├── analytics/              # Order and traffic analytics
│       │   │   │   ├── analytics.module.ts
│       │   │   │   ├── analytics.service.ts
│       │   │   │   └── analytics.controller.ts
│       │   │   ├── email/                  # Email service
│       │   │   │   ├── email.module.ts
│       │   │   │   ├── email.service.ts
│       │   │   │   └── templates/
│       │   │   │       ├── order-confirmation.mjml
│       │   │   │       ├── password-reset.mjml
│       │   │   │       └── newsletter.mjml
│       │   │   └── search/                 # Full-text search (PostgreSQL)
│       │   │       ├── search.module.ts
│       │   │       ├── search.service.ts
│       │   │       └── search.controller.ts
│       │   ├── common/                     # Shared utilities
│       │   │   ├── decorators/
│       │   │   │   ├── public.decorator.ts
│       │   │   │   └── admin.decorator.ts
│       │   │   ├── filters/
│       │   │   │   └── http-exception.filter.ts
│       │   │   ├── interceptors/
│       │   │   │   ├── logging.interceptor.ts
│       │   │   │   ├── transform.interceptor.ts
│       │   │   │   └── error.interceptor.ts
│       │   │   ├── middlewares/
│       │   │   │   ├── logger.middleware.ts
│       │   │   │   └── cors.middleware.ts
│       │   │   ├── guards/
│       │   │   │   └── rate-limit.guard.ts
│       │   │   ├── validators/
│       │   │   │   ├── is-unique.validator.ts
│       │   │   │   └── phone.validator.ts
│       │   │   └── utils/
│       │   │       └── pagination.ts
│       │   └── database/                   # Data access layer
│       │       ├── migrations/
│       │       ├── seeds/
│       │       └── typeorm.config.ts
│       ├── .env.example
│       ├── nest-cli.json
│       ├── tsconfig.json
│       ├── package.json
│       ├── Dockerfile (optional)
│       └── README.md
│
├── docs/                                    # Documentation
│   ├── ARCHITECTURE.md                      # (This file)
│   ├── API_DOCUMENTATION.md                # API endpoint reference
│   ├── DATABASE_SCHEMA.md                  # PostgreSQL schema
│   ├── DEPLOYMENT.md                       # Vercel + Neon deployment
│   ├── DEVELOPMENT_SETUP.md                # Local development guide
│   ├── CONTRIBUTING.md                     # Contribution guidelines
│   └── BRAND_FOUNDATION.md                 # (Already created)
│
├── .github/
│   ├── workflows/
│   │   ├── ci.yml                          # Tests, linting, type-check
│   │   ├── deploy-storefront.yml           # Deploy to Vercel
│   │   ├── deploy-admin.yml
│   │   ├── deploy-api.yml
│   │   └── codeql-analysis.yml             # Security scanning
│   └── PULL_REQUEST_TEMPLATE.md
│
├── .gitignore
├── .npmrc                                   # pnpm configuration
├── pnpm-workspace.yaml                      # Monorepo definition
├── turbo.json                               # Turborepo configuration
├── tsconfig.json                            # Root TypeScript config
├── prettier.config.js
├── eslint.config.js
├── package.json                             # Root package.json
└── README.md                                # Project overview

``` text

---

## FOLDER RESPONSIBILITY MATRIX

### apps/storefront/

**Purpose**: Customer-facing e-commerce platform
**Responsibility**:

- Homepage, product listings, product details, collections

- Shopping cart, wishlist, checkout flow

- User authentication and account management

- Order history and order status tracking

- SEO optimization, static generation, ISR

- Mobile-responsive design per Brand Foundation

**Key Technologies**:

- Next.js App Router (SSR + ISR for product pages)

- Server Components for data fetching (server-side rendering)

- Client Components for interactivity (cart, wishlist, filters)

- Tailwind CSS + Brand Design Tokens

- Next Auth for customer authentication

**Outputs to Vercel**:

- Static: Marketing pages, collections (revalidated 1x/day)

- ISR: Product pages (on-demand revalidation)

- API Routes: Cart state, order placement, auth callbacks

---

### apps/admin/

**Purpose**: Internal admin/CMS for managing the platform
**Responsibility**:

- Product management (create, edit, delete, bulk operations)

- Collection management and curation

- Order management and fulfillment tracking

- Content management (blog, craft stories, testimonials)

- Artisan profile management

- Customer user management

- Analytics dashboard (sales, traffic, top products)

- Platform settings and configurations

**Key Technologies**:

- Next.js with App Router (internal-only)

- Protected routes with role-based access control

- Server Actions for data mutations

- Complex forms with validation

- Data tables with sorting, filtering, pagination

**Outputs to Vercel**:

- API Routes for data operations

- Separate deployment from storefront (security isolation)

- Environment variable `ADMIN_URL` only accessible to verified admins

---

### packages/shared-types/

**Purpose**: Single source of truth for all TypeScript type definitions
**Responsibility**:

- Entity types (Product, Collection, Order, User, etc.)

- API request/response DTOs

- Enums for statuses, roles, payment methods

- Shared constants

- Error type definitions

**Why Separate Package**:

- Shared between frontend (storefront + admin) and backend

- Updates to types automatically propagate to all consumers

- Type safety across service boundaries

- Reduces duplication and bugs from type mismatches

**Used By**: All apps and packages

---

### packages/shared-ui/

**Purpose**: Reusable component library
**Responsibility**:

- Primitive components (Button, Input, Select, Modal, Card, Badge, etc.)

- Design system tokens (colors, spacing, typography from Brand Foundation)

- Shared hooks (useToast, useModal, useClickOutside)

- Utilities (class name concatenation, color utilities)

- Tailwind configuration with brand colors

**Why Separate Package**:

- Single source of truth for design consistency

- Components used in both storefront and admin

- Storybook integration for component documentation

- Encourages consistent UI across platforms

**Consumed By**: storefront, admin apps

---

### packages/shared-utils/

**Purpose**: Utility functions and helpers
**Responsibility**:

- String utilities (slugify, truncate, format)

- Number utilities (currency formatting, percentages)

- Date utilities (formatting, parsing)

- Validation utilities (Zod schemas for email, phone, URL)

- API utilities (universal fetch wrapper, error handling, retry logic)

- Environment variable validation

**Why Separate Package**:

- Reusable across frontend and backend

- Reduces code duplication

- Easier to test and maintain utility functions in isolation

**Consumed By**: All apps and services

---

### packages/api-client/

**Purpose**: Typed HTTP client for calling the NestJS backend
**Responsibility**:

- Wrapper around fetch API with built-in error handling

- Endpoint definitions organized by domain

- React Query hooks for data fetching and caching

- Mutations for server-side operations

- Automatic token management (JWT)

- Request/response interceptors

**Why Separate Package**:

- Frontend apps share identical API communication

- Type-safe API calls (DTOs from shared-types)

- Centralized error handling and retry logic

- React Query integration for state management

**Consumed By**: storefront, admin apps

---

### services/api/

**Purpose**: NestJS backend API (core business logic)
**Responsibility**:

- Product catalog management (CRUD, search, filtering)

- Collection management

- Order processing and fulfillment

- User authentication (JWT), authorization, role-based access

- Cart and wishlist stateless logic

- Payment processing (Stripe, PayPal)

- Content management (blog, craft stories)

- Email notifications

- Analytics aggregation

**Architecture**:

- Modular structure (one module per feature)

- Service layer for business logic

- Repository pattern for database access

- DTOs for input validation

- Guards for authentication and authorization

- Interceptors for logging, transformation, error handling

- Filters for centralized error handling

**Key Principles**:

- Stateless (scales horizontally)

- Database agnostic (via TypeORM)

- RESTful API design

- Comprehensive error handling

- Rate limiting and DDoS protection

**Database**: PostgreSQL (Neon serverless)

---

### packages/shared-config/

**Purpose**: Shared configuration and linting rules
**Responsibility**:

- ESLint configuration (consistent code style)

- Prettier configuration (code formatting)

- Base TypeScript configuration

- Jest/Vitest configuration (unit testing)

**Why Separate Package**:

- All projects inherit same linting and formatting rules

- Consistency across codebase

- Easy to update rules globally

**Consumed By**: All apps and packages

---

### docs/

**Purpose**: Project documentation
**Responsibility**:

- ARCHITECTURE.md: Monorepo structure and design decisions

- API_DOCUMENTATION.md: API endpoint reference

- DATABASE_SCHEMA.md: PostgreSQL schema and relationships

- DEPLOYMENT.md: Deployment procedures

- DEVELOPMENT_SETUP.md: Local dev environment setup

- CONTRIBUTING.md: Contribution guidelines

---

## DEPENDENCY TREE

``` text
storefront
├── → api-client (API communication)
├── → shared-types (Type definitions)
├── → shared-ui (Components)
├── → shared-utils (Utilities)
└── → shared-config (ESLint, Prettier)

admin
├── → api-client (API communication)
├── → shared-types (Type definitions)
├── → shared-ui (Components)
├── → shared-utils (Utilities)
└── → shared-config (ESLint, Prettier)

api-client
├── → shared-types (Type definitions)
└── → shared-utils (Utilities)

services/api
├── → shared-types (Type definitions)
└── → shared-utils (Utilities)

shared-ui
├── → shared-utils (Utilities)
└── → shared-config (ESLint, Prettier)

All packages
└── → shared-config (ESLint, Prettier)

``` text

**Key Rule**: No circular dependencies. All dependencies flow downward.

---

## MONOREPO CONFIGURATION

### pnpm-workspace.yaml

``` yaml
packages:
  - 'apps/*'
  - 'packages/*'
  - 'services/*'
  - 'docs'

``` text

### turbo.json (Turborepo Build Orchestration)

``` json
{
  "$schema": "https://turbo.build/schema.json",
  "globalDependencies": ["**/.env"],
  "pipeline": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": ["dist/**", "build/**"]
    },
    "lint": {
      "outputs": []
    },
    "type-check": {
      "outputs": []
    },
    "test": {
      "outputs": ["coverage/**"]
    },
    "dev": {
      "cache": false
    }
  }
}

``` text

### Root package.json (Script Organization)

``` json
{
  "scripts": {
    "dev": "turbo run dev",
    "build": "turbo run build",
    "lint": "turbo run lint",
    "type-check": "turbo run type-check",
    "test": "turbo run test",
    "test:watch": "turbo run test:watch",
    "format": "prettier --write .",
    "clean": "turbo run clean && rm -rf node_modules"
  }
}

``` text

---

## SCALABILITY & DEPLOYMENT CONSIDERATIONS

### Frontend Scalability (Vercel Free Tier)

1. **Static Generation**: Marketing pages pre-built at build time
2. **Incremental Static Regeneration (ISR)**: Product pages cached, on-demand updates
3. **Edge Functions**: Lightweight middleware (auth redirects, header rewriting)
4. **Image Optimization**: Next.js Image component with automatic WebP, responsive sizing
5. **Code Splitting**: Automatic per-route code splitting
6. **Serverless Functions**: API routes scale automatically
7. **CDN**: Vercel's global CDN caches static assets

**Free Tier Limits**:

- 100 deployments/month

- 100 Serverless Function invocations/day (use API Routes sparingly)

- 50GB bandwidth/month

- **Solution**: Heavy lifting offloaded to NestJS backend API

### Backend Scalability (NestJS + Neon)

1. **Stateless Services**: All instances identical, can scale horizontally
2. **Connection Pooling**: Neon serverless PostgreSQL auto-scales connections
3. **Caching Layer**: Redis (optional) for session, cart, product data
4. **Database Indexing**: Proper indexes on frequently-queried columns
5. **Query Optimization**: Lean queries, batch operations, pagination
6. **Rate Limiting**: Prevent abuse from single clients
7. **Request Logging**: Track performance bottlenecks

**Neon Serverless Advantages**:

- Auto-pause when not in use (cost savings)

- Pay per compute hour, not per instance

- Horizontal scaling of database connections

- Point-in-time recovery for backups

### Database Scalability (PostgreSQL)

1. **Proper Indexing**: Indexes on product name, SKU, order status, user email
2. **Partitioning**: Large tables (orders, products) can be partitioned by date or category
3. **Full-Text Search**: PostgreSQL native FTS for product search
4. **JSON Columns**: Store embroidery patterns, materials as JSONB for flexibility
5. **Read Replicas**: Neon supports read replicas for reporting/analytics

### Maintainability Best Practices

#### 1. **Monorepo Structure**

- Clear separation: No cross-app imports (except shared packages)

- Each app is independently deployable

- Services are decoupled via API contracts

#### 2. **Code Organization**

- Consistent folder structure across all apps/services

- Feature-based modules (not layer-based)

- Single responsibility per file/class

- Tests colocated with source code

#### 3. **Type Safety**

- Full TypeScript everywhere

- Strict mode enabled

- Shared types prevent mismatches

- DTOs enforce contracts between frontend/backend

#### 4. **CI/CD Pipeline (GitHub Actions)**

- Automated linting, type-checking, and tests on every commit and PR

- Status checks block merge if any check fails

- Preview deployments to Vercel for all branches

- Production deployments triggered only after merge to `main`

- Parallel deployments: storefront, admin, API

- Rollback capability via Vercel dashboard or GitHub release revert

#### 5. **Documentation**

- README.md in every package and app

- Inline code comments for complex logic

- API documentation (OpenAPI/Swagger)

- Database schema documentation

- Deployment runbooks

#### 6. **Error Handling**

- Centralized error handling (API interceptors)

- Meaningful error messages for users

- Logging for debugging (structured JSON logs)

- Sentry/Error tracking integration (optional)

#### 7. **Testing Strategy**

- Unit tests for utils, services

- Integration tests for API endpoints

- E2E tests for critical user flows (checkout)

- Test coverage minimum 70%

---

## API COMMUNICATION LAYER

### Backend API Contract (OpenAPI)

**Design Principle**: RESTful, resource-oriented, versioned

``` text
GET  /api/v1/products
GET  /api/v1/products?category=shawls&limit=12&offset=0
GET  /api/v1/products/:id
POST /api/v1/products (admin only)
PUT  /api/v1/products/:id (admin only)
DELETE /api/v1/products/:id (admin only)

GET  /api/v1/collections
GET  /api/v1/collections/:slug
POST /api/v1/collections (admin only)

POST /api/v1/orders (create order)
GET  /api/v1/orders/:id (get order by ID)
GET  /api/v1/orders/user/:userId (get user's orders)
PUT  /api/v1/orders/:id/status (admin: update status)
POST /api/v1/orders/:id/cancel (cancel order)

POST /api/v1/auth/register
POST /api/v1/auth/login
POST /api/v1/auth/logout
POST /api/v1/auth/refresh-token
POST /api/v1/auth/password-reset

GET  /api/v1/cart (get cart items for user)
POST /api/v1/cart/items (add to cart)
DELETE /api/v1/cart/items/:itemId (remove from cart)

GET  /api/v1/content/stories
GET  /api/v1/content/stories/:slug
POST /api/v1/content/stories (admin only)

GET  /api/v1/artisans
GET  /api/v1/artisans/:id

``` text

**Authentication**:

- JWT token in Authorization header

- HttpOnly cookies for refresh tokens (CSRF protection)

- Role-based access control (RBAC): customer, admin, super-admin

**Response Format**:

``` json
{
  "success": true,
  "data": { ... },
  "meta": { "pagination": { "total": 100, "limit": 12, "offset": 0 } }
}

``` text

---

## ENVIRONMENT VARIABLES STRATEGY

### Storefront (.env.local)

``` text
NEXT_PUBLIC_API_URL=https://api.shalkaar.com
NEXT_PUBLIC_STRIPE_KEY=pk_live_...
NEXTAUTH_SECRET=...
NEXTAUTH_URL=https://shalkaar.com

``` text

### Admin (.env.local)

``` text
NEXT_PUBLIC_API_URL=https://api.shalkaar.com
ADMIN_SECRET_KEY=... (separate from customer auth)
NEXTAUTH_SECRET=...
NEXTAUTH_URL=https://admin.shalkaar.com

``` text

### API Service (.env)

``` text
DATABASE_URL=postgresql://user:password@neon-host/dbname
JWT_SECRET=...
JWT_EXPIRATION=7d
STRIPE_SECRET_KEY=sk_live_...
PAYPAL_CLIENT_ID=...
SMTP_HOST=...
NODE_ENV=production

``` text

**Strategy**:

- `NEXT_PUBLIC_*` variables available to browser (no secrets)

- Backend secrets in `.env` (not deployed to Vercel frontend)

- Environment variable validation via Zod schemas

- CI/CD secrets managed via GitHub Actions secrets

---

## VERSION CONTROL & CI/CD WORKFLOW

### GitHub Repository Structure

The monorepo is hosted on GitHub at `github.com/shalkaar/shalkaarnext`.

**Branch Strategy:**

- `main` — Production branch. Direct commits blocked; changes only via pull request

- `develop` — Integration branch for features (optional)

- `feature/*` — Feature branches for new development

- `bugfix/*` — Bug fix branches

- `hotfix/*` — Critical production fixes

**Pull Request Requirements:**

- All code changes require a pull request

- Minimum 1 approval from a code reviewer

- All GitHub Actions checks must pass (lint, type-check, tests)

- Status checks block merge until successful

### GitHub Actions CI/CD Pipeline

**Automated Workflows** (triggered on every push):

``` yaml

# .github/workflows/ci.yml

- ESLint (code quality)

- TypeScript (type checking)

- Unit tests (Jest/Vitest)

- Integration tests (API endpoints)

``` text

**Pre-merge Checks:**

- ✅ Linting passes

- ✅ All types resolve

- ✅ Tests pass (minimum 70% coverage)

- ✅ No security vulnerabilities (CodeQL scanning)

**Deployment Triggers:**

- **Preview**: GitHub Actions triggers on every PR and branch push
  - Vercel auto-generates preview URLs for testing
  - Each PR gets unique URLs: `https://[branch-name]-storefront.vercel.app`

- **Production**: Merge to `main` triggers production deployment
  - Storefront: `https://shalkaar.com`
  - Admin: `https://admin.shalkaar.com`
  - API: Deployed to Railway/Render (configured in separate repository)

### Vercel Integration

**Setup:**
Vercel is connected to GitHub with automatic deployments configured for all frontend apps.

**Deployment Flow:**

``` text
GitHub Commit
    ↓
[Branch] → GitHub Actions (CI checks)
    ↓ (if pass)
[PR/Preview] → Vercel Preview Deployment
    ↓ (comment with preview URL)
[Pull Request] → Team review & approval
    ↓ (if approved)
[Merge to main] → Vercel Production Deployment
    ↓ (deploy storefront + admin)
[Production URLs] → shalkaar.com + admin.shalkaar.com

``` text

**Vercel Configuration:**

- Two separate projects: `shalkaarnext-storefront` and `shalkaarnext-admin`

- Environment variables configured per project (secrets not in repo)

- Auto-deployed on `main` branch

- Rollback capability via Vercel dashboard (revert to previous deployment)

- Automatic SSL/TLS certificates via Vercel

### GitHub Secrets (Sensitive Variables)

Stored in GitHub Actions secrets (not in `.env` files):

``` text
VERCEL_TOKEN           # Vercel API token for deployment
NEXTAUTH_SECRET        # Session encryption key
DATABASE_URL           # PostgreSQL connection string
JWT_SECRET             # Backend JWT signing key
STRIPE_SECRET_KEY      # Payment processor key

``` text

These are injected into environment during GitHub Actions build phase.

---

## DEPLOYMENT ARCHITECTURE

### Frontend Deployments (Vercel)

1. **Storefront**: `shalkaar.com` (production), `[branch]-storefront.vercel.app` (preview)
2. **Admin**: `admin.shalkaar.com` (protected, separate deployment), `[branch]-admin.vercel.app` (preview)

### Backend Deployment Options (NestJS)

1. **Vercel Serverless Functions** (free tier, limited)
   - Pros: Same platform, auto-scaling
   - Cons: 10-second cold start limit, limited execution time
   - **Not recommended for I/O-heavy API**

2. **Self-hosted (Railway, Render, Fly.io)** ⭐ **Recommended**
   - Pros: Full control, better performance, WebSocket support
   - Cons: Minimal monthly cost ($5-10)
   - Cheap, reliable, scales well

3. **AWS Lambda / Google Cloud Run**
   - Pros: Enterprise-grade, highly scalable
   - Cons: Overkill for early stage, complex setup

### Database (Neon - PostgreSQL)

- Automatic backups and point-in-time recovery

- Read replicas for scaling read queries

- Connection pooling for cost efficiency

- Direct JDBC connection from NestJS

### CDN & Static Assets

- Vercel CDN for storefront static files (images, CSS, JS)

- Cloudinary or S3 for product images (can offload from repo)

- Version images by hash (cache busting)

---

## SECURITY CONSIDERATIONS

### Frontend Security

1. **CORS**: Backend only accepts requests from storefront/admin URLs
2. **CSRF**: HttpOnly cookies + SameSite=Strict
3. **XSS Prevention**: Sanitize user input, Content Security Policy headers
4. **Rate Limiting**: Implement on API client side before sending requests
5. **Secrets**: Never store API keys in `.env` (use environment variables)

### Backend Security

1. **Authentication**: JWT + refresh tokens, 2FA for admin
2. **Authorization**: Role-based access control (RBAC)
3. **Input Validation**: Zod schemas on all endpoints
4. **SQL Injection**: TypeORM parameterized queries (never raw SQL)
5. **Rate Limiting**: Limit requests per IP/user
6. **HTTPS Only**: All API requests encrypted
7. **Data Encryption**: Password hashing (bcrypt), sensitive data encryption
8. **Logging**: Audit logs for admin actions

### Database Security

1. **Connection**: SSL/TLS encryption to Neon
2. **Access Control**: Database users with minimal permissions
3. **Backups**: Daily automated backups with encryption
4. **IP Whitelisting**: Restrict connections to known servers

---

## DEVELOPMENT WORKFLOW

### Local Development

``` bash

# Install dependencies (monorepo-aware)

pnpm install

# Start all services in dev mode (concurrent)

pnpm dev

# This starts:

# - storefront on http://localhost:3000

# - admin on http://localhost:3001

# - api on http://localhost:3333

``` text

### Code Quality

``` bash

# Run all checks in parallel

pnpm lint        # ESLint
pnpm type-check  # TypeScript
pnpm test        # Unit tests
pnpm format      # Prettier

# Run pre-commit hooks

git add .
git commit        # Husky runs lint + type-check automatically

``` text

### Deployment Workflow

**Standard Feature Development:**

``` bash

# 1. Create a feature branch

git checkout -b feature/product-filters

# 2. Make changes and commit

git add .
git commit -m "feat: add product filtering UI"

# 3. Push to GitHub (triggers GitHub Actions CI)

git push origin feature/product-filters

# 4. Create Pull Request on GitHub

# - GitHub Actions automatically runs lint, type-check, tests

# - Vercel creates preview deployment URL

# - Team reviews PR with preview link

# 5. After approval, merge to main (via GitHub UI)

# - All CI checks must pass

# - Triggers automatic production deployment to Vercel

# - Storefront live at shalkaar.com

# - Admin live at admin.shalkaar.com

``` text

**Direct Production Fixes (Hotfixes):**

``` bash

# 1. Create hotfix branch from main

git checkout -b hotfix/critical-bug main

# 2. Fix and commit

git commit -m "fix: critical payment processing error"

# 3. Push and create PR

git push origin hotfix/critical-bug

# 4. After review and approval, merge to main

# - Vercel automatically deploys to production

# - No additional steps needed

``` text

**Rollback (if deployment breaks production):**

``` bash

# Option 1: Vercel Dashboard (fastest)

# - Go to Vercel project → Deployments

# - Click 'Promote' on previous stable deployment

# Option 2: Git Revert

git revert HEAD  # Creates new commit that undoes the problematic commit
git push origin main

# - Vercel auto-deploys the reverted version

``` text

---

## GITHUB WORKFLOW BEST PRACTICES

### Code Review Standards

**PR Checklist Before Merging:**

- [ ] Branch is up to date with `main`

- [ ] All GitHub Actions checks ✅ pass

- [ ] At least 1 approval from maintainer

- [ ] No merge conflicts

- [ ] Commits have clear, descriptive messages

- [ ] PR description explains what and why (not how)

### Commit Message Standards

Follow conventional commits:

``` text
type(scope): brief description

Optional: longer explanation

``` text

**Types:**

- `feat:` — New feature

- `fix:` — Bug fix

- `refactor:` — Code restructure (no behavior change)

- `test:` — Test additions/updates

- `docs:` — Documentation only

- `style:` — Formatting (Prettier, no logic change)

- `ci:` — CI/CD configuration

**Examples:**

``` text
feat(storefront): add product search by embroidery type
fix(api): resolve order status not updating on payment success
docs(monorepo): update architecture guide with GitHub workflow

``` text

### Branch Protection Rules (Configured on GitHub)

1. Require pull request reviews before merging
2. Require status checks to pass (GitHub Actions)
3. Require branches to be up to date before merging
4. Dismiss stale pull request approvals
5. Require conversation resolution before merging

### Handling CI Failures

**If GitHub Actions Fails:**

1. **Linting Error**
   ```bash
   pnpm format  # Auto-fix with Prettier
   pnpm lint --fix  # Auto-fix ESLint issues
   git add .
   git commit --amend --no-edit
   git push --force-with-lease origin feature/branch-name
   ```

1. **Type Error**

   ```bash
   pnpm type-check  # See errors
   # Fix manually in your code
   git add .
   git commit --amend --no-edit
   git push --force-with-lease origin feature/branch-name
   ```

2. **Test Failure**

   ```bash
   pnpm test  # Run locally
   # Debug and fix
   git add .
   git commit -m "test: fix failing unit test"
   git push origin feature/branch-name
   ```

---

## FINAL ARCHITECTURE PRINCIPLES

1. **Separation of Concerns**
   - Each app has single responsibility
   - Shared code lives in packages
   - No cross-app dependencies

2. **Type Safety**
   - Full TypeScript, strict mode
   - Single source of truth for types
   - DTOs enforce API contracts

3. **Scalability**
   - Stateless services (horizontal scaling)
   - Serverless where appropriate
   - Database optimizations (indexing, partitioning)

4. **Maintainability**
   - Consistent code style (ESLint, Prettier)
   - Clear folder structure
   - Comprehensive documentation
   - Automated testing

5. **Security**
   - Authentication via JWT
   - Authorization via RBAC
   - Input validation with Zod
   - Rate limiting and DDoS protection

6. **Performance**
   - Static generation for marketing pages
   - ISR for product pages
   - Image optimization
   - Database query optimization
   - Caching strategies

---

## NEXT STEPS

1. Initialize pnpm workspace
2. Create folder structure
3. Configure Turborepo for orchestration
4. Set up shared packages (types, UI, utils)
5. Bootstrap frontend apps (storefront, admin)
6. Bootstrap NestJS API
7. Configure CI/CD pipelines
8. Deploy to Vercel + database
9. Load initial product catalog

---

**Document Version:** 1.0

**Last Updated:** February 5, 2026
**Status:** Architecture Foundation — Ready for Implementation
