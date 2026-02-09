
# SHALKAAR Admin Dashboard

Admin CMS for managing the SHALKAAR e-commerce platform. Built with Next.js 14, TypeScript, and Tailwind CSS.

## Features

- **Dashboard Overview** - Key metrics and recent order visualization

- **Product Management** - Create, edit, and delete products with variants

- **Collection Management** - Organize products into collections

- **Order Management** - Track order status, manage fulfillment, and handle returns

- **Artisan Management** - Manage artisan profiles and their products

- **Content Management** - Create and manage blog posts, testimonials, and stories

- **Customer Management** - View customer information and purchase history

- **Analytics** - Sales metrics, top products, traffic sources

- **Settings** - Configure email, payment, shipping, and team settings

## Prerequisites

- Node.js 20 LTS or higher

- pnpm 8+ package manager

## Installation

From the root of the monorepo, install dependencies:

``` bash
pnpm install

``` text

## Development

Start the admin dashboard in development mode:

``` bash
pnpm dev:admin

``` text

The admin dashboard will be available at `http://localhost:3001`

## Configuration

Create a `.env.local` file in the `apps/admin` directory:

``` bash
cp .env.example .env.local

``` text

Update the environment variables as needed:

- `NEXT_PUBLIC_API_BASE_URL` - Backend API URL

- `NEXTAUTH_URL` - Admin dashboard URL

- `NEXTAUTH_SECRET` - Secret key for NextAuth session encryption

## Building

Build the admin dashboard for production:

``` bash
pnpm build:admin

``` text

## Structure

``` text
src/
├── app/                    # Next.js App Router pages and layouts
│   ├── auth/              # Authentication pages (login)
│   ├── dashboard/         # Protected dashboard pages
│   │   ├── page.tsx       # Dashboard overview
│   │   ├── products/      # Product management
│   │   ├── collections/   # Collection management
│   │   ├── orders/        # Order management
│   │   ├── artisans/      # Artisan management
│   │   ├── content/       # Content management
│   │   ├── users/         # Customer management
│   │   ├── analytics/     # Analytics and reports
│   │   └── settings/      # Platform settings
│   ├── layout.tsx         # Root layout with providers
│   └── globals.css        # Global styles
├── components/            # Reusable React components
├── context/              # React context providers
│   └── AdminContext.tsx   # Admin authentication context
└── lib/                  # Utility functions and helpers

``` text

## TODO Items

The following functionality needs to be implemented:

- [ ] Admin authentication with role-based access control

- [ ] Protected routes middleware

- [ ] Sidebar navigation component

- [ ] Header with user menu and notifications

- [ ] Forms for product creation/editing

- [ ] Data tables with sorting and filtering

- [ ] Image upload and management

- [ ] Analytics charts and graphs

- [ ] Email template management

- [ ] Bulk operations (import/export)

- [ ] Activity logging

- [ ] Email notifications for admins

## API Integration

The admin dashboard communicates with the backend API at the following endpoints (all prefixed with `/api/v1`):

- `/products` - Product management

- `/collections` - Collection management

- `/orders` - Order management

- `/users` - User/customer management

- `/auth` - Authentication

- `/artisans` - Artisan management

- `/content` - Content management

- `/analytics` - Analytics data

Refer to the backend API documentation for detailed endpoint specifications.

## Contributing

When adding new features to the admin dashboard:

1. Keep component files organized in the `components/` directory
2. Use the `useAdmin()` hook for accessing admin context
3. Follow the existing naming conventions for routes
4. Add TODO comments for incomplete functionality
5. Maintain TypeScript strict mode compliance

## Deployment

The admin dashboard is deployed via Vercel using GitHub Actions CI/CD. See the root `MONOREPO_ARCHITECTURE.md` for deployment workflow details.
