
# 🚀 SHALKAAR Development Kickoff Guide

Welcome to the SHALKAAR e-commerce platform! This guide will help you get started with development.

## ⚡ First 5 Minutes (Get Running)

``` bash

# 1. Clone the repository

git clone <repository-url>
cd shalkaarnext

# 2. Install dependencies

pnpm install

# 3. Copy environment file

cp .env.example .env.local

# 4. Start development servers

pnpm dev

``` text

Open:

- **Storefront**: http://localhost:3000

- **Admin CMS**: http://localhost:3001

- **API**: http://localhost:3333

## 📖 Essential Reading (15 minutes)

Before you start coding, read these in this order:

1. **[BRAND_DESIGN_FOUNDATION.md](./BRAND_DESIGN_FOUNDATION.md)** ← Design & brand guidelines
2. **[MONOREPO_ARCHITECTURE.md](./MONOREPO_ARCHITECTURE.md)** ← How the codebase is organized
3. **[README.md](./README.md)** ← Quick reference

## 🏢 Team Assignments

### Backend Team

**Focus**: `services/api/src/modules/`

- [ ] Implement Products service and API endpoints

- [ ] Implement Collections service and API endpoints

- [ ] Implement Orders service and API endpoints

- [ ] Implement Users service and API endpoints

- [ ] Implement Auth service (register, login, JWT)

- [ ] Implement Cart service and API endpoints

- [ ] Implement Wishlist service

- [ ] Implement Payment service

- [ ] Implement Content service (blog, testimonials)

- [ ] Implement Artisans service

- [ ] Implement Analytics service

- [ ] Set up database migrations

- [ ] Add database seeders

**Resources**:

- [services/api/README.md](./services/api/README.md)

- Check each module's service files for TODO comments

### Frontend (Storefront) Team

**Focus**: `apps/storefront/src/app/` and `apps/storefront/src/components/`

- [ ] Create Navigation component with mobile menu

- [ ] Create Footer component

- [ ] Create ProductCard component

- [ ] Implement home page with hero section

- [ ] Implement collections page and filtering

- [ ] Implement product detail page

- [ ] Create shopping cart functionality

- [ ] Create checkout flow

- [ ] Implement user authentication (login/register)

- [ ] Create order tracking

- [ ] Implement wishlist functionality

- [ ] Add product reviews

- [ ] Connect all pages to backend API

**Resources**:

- [apps/storefront/README.md](./apps/storefront/README.md)

- Check each page file for TODO comments

### Admin (CMS) Team

**Focus**: `apps/admin/src/app/dashboard/`

- [ ] Create Sidebar navigation component

- [ ] Create Header component with user menu

- [ ] Create reusable data table component

- [ ] Create form components for products

- [ ] Implement product management pages

- [ ] Implement collection management

- [ ] Implement order management with status updates

- [ ] Implement artisan management

- [ ] Implement content management (blog, testimonials)

- [ ] Implement customer management

- [ ] Create analytics dashboard with charts

- [ ] Implement settings pages

- [ ] Add file upload for images

- [ ] Implement bulk operations

**Resources**:

- [apps/admin/README.md](./apps/admin/README.md)

- Check each dashboard page for TODO comments

## 🔄 Workflow

### Daily Development

``` bash

# Start dev servers

pnpm dev

# In another terminal, before committing:

pnpm lint:fix      # Fix style issues
pnpm type-check    # Check TypeScript
git add .
git commit -m "Feature: description"
git push

``` text

### Creating Features

``` bash

# Create feature branch

git checkout -b feature/your-feature-name

# Make your changes

# Test locally with pnpm dev

# Run quality checks:

pnpm lint:fix
pnpm type-check

# Push and create PR

git push origin feature/your-feature-name

``` text

### Code Review

- All PRs require review

- All CI checks must pass

- Update on feedback and re-request review

### Merging to Production

1. Merge to `develop` after review
2. When ready for release, create PR from `develop` to `main`
3. GitHub Actions automatically deploys to production

## 📦 Using Shared Packages

All team members should use shared types and components:

### Shared Types

``` typescript
import {
  Product,
  Order,
  User,
  ProductStatus,
  OrderStatus
} from '@shalkaar/shared-types';

``` text

### Shared UI Components

``` typescript
import { Button, Input, Card, Modal } from '@shalkaar/shared-ui';

// Example:
<Button variant="primary" size="md">Click me</Button>

``` text

### Shared Utilities

``` typescript
import {
  slugify,
  formatPrice,
  isValidEmail
} from '@shalkaar/shared-utils';

``` text

### API Client (Frontend Only)

``` typescript
import { apiClient } from '@shalkaar/api-client';

// Fetch products
const products = await apiClient.get('/products');

``` text

## 🎨 Design System

All styling uses the SHALKAAR brand design system from `BRAND_DESIGN_FOUNDATION.md`:

### Colors

``` typescript
// Use these in Tailwind classes:
brand-indigo    // #2a1555 (primary)
brand-sienna    // #a0522d (accent)
brand-cream     // #f5f3f0 (background)
brand-dark      // #1a1a1a (text)
brand-accent    // #d4a574 (highlights)

``` text

### Typography

``` typescript
// Fonts are configured in tailwind.config.ts
font-sans       // Primary font (body text)
font-serif      // Secondary font (headings)

``` text

### Component Example

``` tsx
<div className="bg-brand-cream p-brand-lg rounded-lg shadow">
  <h1 className="text-2xl font-serif font-bold text-brand-indigo mb-brand-md">
    Products
  </h1>
  <Button variant="primary">Shop Now</Button>
</div>

``` text

## 🔌 API Integration

### Backend → Frontend Communication

Example: Creating a product via API

**Backend (services/api/)**:

``` typescript
// products.controller.ts
@Post()
create(@Body() createProductDto: CreateProductDTO) {
  return this.productsService.create(createProductDto);
}

``` text

**Frontend (apps/storefront/)**:

``` typescript
// Create product
const newProduct = await apiClient.post('/products', {
  name: 'Beautiful Shawl',
  price: 9999,
  // ... other fields
});

``` text

**Admin (apps/admin/)**:

``` typescript
// Same API call
const newProduct = await fetch(
  `${process.env.NEXT_PUBLIC_API_BASE_URL}/products`,
  { method: 'POST', body: JSON.stringify(data) }
);

``` text

## 🐛 Debugging Tips

### TypeScript Errors

``` bash
pnpm type-check      # See all TypeScript errors
pnpm type-check -- --noEmit --listFiles  # More details

``` text

### Linting Errors

``` bash
pnpm lint            # See all eslint errors
pnpm lint:fix        # Auto-fix common issues

``` text

### Build Errors

``` bash
pnpm build           # Build everything (shows errors)
pnpm clean           # Clean build artifacts and retry
pnpm clean:cache     # Clear turbo cache

``` text

### API Issues

Check the API logs:

``` bash

# In the terminal running pnpm dev

# Look for API logs on port 3333

# Check your .env.local DATABASE_URL is correct

``` text

### Database Connection

``` bash

# Test your connection string

psql $DATABASE_URL -c "SELECT 1"

# Or run migrations

pnpm db:migrate

# Or reseed

pnpm db:reset

``` text

## 📝 Code Standards

### Variable Naming

``` typescript
// ✅ Good
const productName = 'Handwoven Shawl';
const isAvailable = true;
const getProductById = (id: string) => { ... }

// ❌ Avoid
const pn = 'Handwoven Shawl';
const available = true;
const get = (id: string) => { ... }

``` text

### File Organization

``` text
src/
├── components/
│   ├── ProductCard/
│   │   ├── ProductCard.tsx
│   │   └── ProductCard.test.tsx
│   └── ...
├── pages/
│   └── products/
│       └── page.tsx
├── hooks/
│   └── useProducts.ts
└── utils/
    └── formatters.ts

``` text

### Comments

``` typescript
// ✅ Good - explains WHY

// Cache products for 1 hour to reduce DB load
const CACHE_TTL = 3600;

// ❌ Avoid - just repeats code

// Set cache TTL to 3600
const CACHE_TTL = 3600;

// TODO: Implement pagination
const getAllProducts = async () => {

``` text

## 🚀 Git Workflow

### Commit Messages

``` text
// ✅ Good
git commit -m "feat: add product search functionality"
git commit -m "fix: resolve cart quantity bug"
git commit -m "docs: update API documentation"

// ❌ Avoid
git commit -m "update stuff"
git commit -m "fixed bug"
git commit -m "changes"

``` text

### Branch Names

``` bash
feature/product-search
feature/user-authentication
fix/cart-calculation-bug
docs/api-endpoints

``` text

## 📊 Progress Tracking

Team leads can track progress:

``` bash

# Count lines of code

find apps services packages -name "*.ts" -o -name "*.tsx" | xargs wc -l

# List TODO items

grep -r "TODO:" src/

# Run type check to see what's breaking

pnpm type-check

# Test coverage

pnpm test --coverage

``` text

## 🤝 Getting Help

### Questions?

1. Check the README in your specific package
2. Look at TODO comments in the code
3. Review MONOREPO_ARCHITECTURE.md
4. Ask in team channel

### Issues?

1. Check if it's a TypeScript error: `pnpm type-check`
2. Check if it's a style issue: `pnpm lint`
3. Check if it builds: `pnpm build`
4. Check the specific package's README

### New to This Stack?

- Next.js: [next.js.org/docs](https://nextjs.org/docs)

- NestJS: [docs.nestjs.com](https://docs.nestjs.com)

- TypeScript: [typescriptlang.org](https://www.typescriptlang.org)

- Tailwind: [tailwindcss.com/docs](https://tailwindcss.com/docs)

- React: [react.dev](https://react.dev)

## ✅ Ready to Start?

1. ✅ You've got the code (`git clone`)
2. ✅ You've installed dependencies (`pnpm install`)
3. ✅ You've read the documentation
4. ✅ You've started dev servers (`pnpm dev`)
5. ✅ You've been assigned to a team
6. ✅ You know what feature to implement

**Now go build something awesome! 🎉**

---

## Quick Reference

``` bash

# Start development

pnpm dev

# Quality checks before committing

pnpm lint:fix && pnpm type-check

# Build for production

pnpm build

# Run tests

pnpm test

# Database

pnpm db:migrate
pnpm db:seed
pnpm db:reset

# Docker (if using)

pnpm docker:up
pnpm docker:down
pnpm docker:logs

``` text

---

**Welcome to the SHALKAAR team! Let's build something great together! 🚀**
