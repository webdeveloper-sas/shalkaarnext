
# SHALKAAR Storefront

Customer-facing e-commerce storefront for SHALKAAR - Premium Balochi Fashion. Built with Next.js 14, TypeScript, Tailwind CSS, and React.

## Features

- **Home Page** - Hero section, featured collections, artisan stories

- **Product Browsing** - Browse products with filtering and search

- **Collections** - Organize products by collections

- **Shopping Cart** - Add items, manage quantities, view totals

- **Checkout** - Multi-step checkout with shipping and payment

- **User Accounts** - Customer profiles, order history, wishlist

- **Authentication** - Secure login and registration with NextAuth

- **Wishlist** - Save favorite products for later

- **Product Reviews** - View customer reviews and ratings

- **Responsive Design** - Optimized for mobile, tablet, and desktop

## Prerequisites

- Node.js 20 LTS or higher

- pnpm 8+ package manager

## Installation

From the root of the monorepo, install dependencies:

``` bash
pnpm install

``` text

## Development

Start the storefront in development mode:

``` bash
pnpm dev:storefront

``` text

The storefront will be available at `http://localhost:3000`

## Configuration

Create a `.env.local` file in the `apps/storefront` directory:

``` bash
cp .env.example .env.local

``` text

Update the environment variables as needed:

- `NEXT_PUBLIC_API_BASE_URL` - Backend API URL (e.g., http://localhost:3333/api/v1)

- `NEXTAUTH_URL` - Storefront URL for NextAuth

- `NEXTAUTH_SECRET` - Secret key for NextAuth session encryption

## Building

Build the storefront for production:

``` bash
pnpm build:storefront

``` text

## Structure

``` text
src/
├── app/                    # Next.js App Router pages and layouts
│   ├── layout.tsx         # Root layout with providers
│   ├── page.tsx           # Home page
│   ├── globals.css        # Global styles and Tailwind directives
│   ├── marketing/         # Marketing pages layout
│   ├── collections/       # Collection browsing pages
│   ├── products/          # Product detail pages
│   ├── cart/              # Shopping cart page
│   ├── checkout/          # Checkout flow pages
│   ├── account/           # User account pages
│   └── auth/              # Authentication pages (login/register)
├── components/            # Reusable React components
│   ├── ProductCard/       # Product display component
│   ├── CartItem/          # Cart item component
│   ├── Navigation/        # Header/navigation component
│   └── Footer/            # Footer component
├── context/              # React context providers
│   ├── CartContext.tsx    # Shopping cart context
│   ├── UserContext.tsx    # User/auth context
│   └── ThemeContext.tsx   # Theme (light/dark) context
├── hooks/                # Custom React hooks
│   ├── useCart.ts        # Cart management hook
│   ├── useWishlist.ts    # Wishlist management hook
│   ├── useAuth.ts        # Authentication hook
│   └── useFetch.ts       # Data fetching hook
└── lib/                  # Utility functions and helpers

``` text

## Design System

The storefront uses the SHALKAAR brand design system defined in the root `BRAND_DESIGN_FOUNDATION.md`:

- **Primary Color** (Deep Indigo): `#2a1555`

- **Accent Color** (Burnt Sienna): `#a0522d`

- **Background** (Off-white): `#f5f3f0`

- **Text** (Charcoal): `#1a1a1a`

- **Accent** (Soft Gold): `#d4a574`

All colors and typography are configured in the `tailwind.config.ts` file using values from the shared design tokens.

## TODO Items

The following functionality needs to be implemented:

- [ ] Navigation component with mobile menu

- [ ] Footer with links and newsletter signup

- [ ] Product card components with image gallery

- [ ] Search functionality with autocomplete

- [ ] Filter sidebar for products

- [ ] Cart functionality connected to backend API

- [ ] Checkout form with validation

- [ ] Payment integration (Stripe, PayPal)

- [ ] User authentication with NextAuth

- [ ] Order tracking page

- [ ] Product reviews and ratings

- [ ] Wishlist functionality

- [ ] Email notifications (order confirmation, shipping)

- [ ] Admin-managed product content and images

- [ ] SEO optimization (meta tags, structured data)

## API Integration

The storefront communicates with the backend API at the following endpoints (all prefixed with `/api/v1`):

- `GET /products` - List products

- `GET /products/:id` - Get product details

- `POST /products/search` - Search products

- `GET /collections` - List collections

- `GET /collections/:slug` - Get collection details

- `POST /auth/register` - User registration

- `POST /auth/login` - User login

- `GET /cart` - Get current cart

- `POST /cart/items` - Add to cart

- `PUT /cart/items/:id` - Update cart item

- `DELETE /cart/items/:id` - Remove from cart

- `POST /orders` - Create order

- `GET /orders/:id` - Get order details

Refer to the backend API documentation for detailed endpoint specifications.

## Context Providers

The storefront uses React Context for state management:

### CartContext

Manages shopping cart state and operations:

- `addToCart(product, quantity)` - Add item to cart

- `removeFromCart(itemId)` - Remove item from cart

- `updateQuantity(itemId, quantity)` - Update item quantity

- `clearCart()` - Clear all items from cart

### UserContext

Manages user authentication and profile:

- `login(email, password)` - User login

- `logout()` - User logout

- `register(email, password, name)` - User registration

- `updateProfile(data)` - Update user profile

### ThemeContext

Manages light/dark theme preference:

- `toggleTheme()` - Toggle between light and dark themes

## Custom Hooks

The storefront includes custom hooks for common functionality:

### useCart()

Access cart functionality and state from anywhere in the app.

### useWishlist()

Manage product wishlist (save/remove favorites).

### useAuth()

Access user authentication state and methods.

### useFetch()

Generic fetch hook for API calls with loading and error states.

## Contributing

When adding new pages or components to the storefront:

1. Keep page files in the appropriate app directory
2. Create reusable components in the `components/` directory
3. Use the custom hooks for cart, auth, and data fetching
4. Follow the brand design system from `BRAND_DESIGN_FOUNDATION.md`
5. Add TODO comments for incomplete functionality
6. Maintain TypeScript strict mode compliance

## Deployment

The storefront is deployed to Vercel using GitHub Actions CI/CD. See the root `MONOREPO_ARCHITECTURE.md` for deployment workflow details.

## Performance

The storefront is optimized for performance:

- Image optimization with Next.js Image component

- Code splitting with Next.js App Router

- CSS-in-JS with Tailwind for minimal bundle size

- Server components where possible

- Static generation (ISG) for product pages

## Accessibility

The storefront is built with accessibility in mind:

- Semantic HTML structure

- ARIA labels for interactive elements

- Keyboard navigation support

- High contrast colors from design system

- Screen reader optimized

## License

Proprietary - All rights reserved by SHALKAAR
