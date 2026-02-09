
# Phase 10 Implementation Guide & Quick Reference

## Quick Setup Instructions

### 1. Environment Configuration

``` bash

# .env.local

NEXT_PUBLIC_API_BASE_URL=http://localhost:3333/api/v1
JWT_SECRET=your-super-secret-key-change-in-production
REFRESH_TOKEN_SECRET=refresh-token-secret

``` text

### 2. Install & Build

``` bash

# Install dependencies

pnpm install

# Build all apps

pnpm build

# Start development server

pnpm dev

# Start production build

pnpm build && pnpm start

``` text

---

## Component Usage Guide

### 1. Authentication Usage

``` tsx
import { useAuth } from '@/context/AuthContext';

export default function Component() {
  const { user, login, logout, token, isAuthenticated } = useAuth();

  // Check authentication status
  if (!isAuthenticated) {
    return <p>Please log in</p>;
  }

  return (
    <div>
      <p>Welcome, {user?.email}</p>
      <button onClick={logout}>Logout</button>
    </div>
  );
}

``` text

### 2. Protected Routes

``` tsx
import ProtectedRoute from '@/components/ProtectedRoute';

// Admin-only page
export default function AdminPage() {
  return (
    <ProtectedRoute allowedRoles={['ADMIN']}>
      <AdminDashboard />
    </ProtectedRoute>
  );
}

// Multi-role access
export default function OrderPage() {
  return (
    <ProtectedRoute allowedRoles={['CUSTOMER', 'ADMIN']}>
      <OrderHistory />
    </ProtectedRoute>
  );
}

``` text

### 3. Wishlist Integration

``` tsx
import { useWishlist } from '@/context/WishlistContext';
import WishlistButton from '@/components/WishlistButton';

export default function ProductCard({ product }) {
  const { isInWishlist } = useWishlist();

  return (
    <div>
      <h3>{product.name}</h3>
      <WishlistButton
        productId={product.id}
        productName={product.name}
        price={product.price}
        image={product.image}
        variant="icon"
      />
    </div>
  );
}

``` text

### 4. Search & Filter

``` tsx
import SearchAndFilter from '@/components/SearchAndFilter';

export default function ProductsPage() {
  const [filteredProducts, setFilteredProducts] = useState([]);

  return (
    <div>
      <SearchAndFilter
        products={allProducts}
        onFilter={setFilteredProducts}
        categories={categories}
      />
      {/* Display filteredProducts */}
    </div>
  );
}

``` text

### 5. Reviews Component

``` tsx
import Reviews from '@/components/Reviews';

export default function ProductDetail({ productId }) {
  return (
    <div>
      <ProductInfo />
      <Reviews
        productId={productId}
        onReviewAdded={() => {
          // Refresh product stats
        }}
      />
    </div>
  );
}

``` text

---

## API Endpoint Reference

### Authentication Endpoints

``` text
POST   /auth/register          - Create new account

POST   /auth/login             - User login

POST   /auth/logout            - User logout

POST   /auth/refresh-token     - Refresh JWT token

POST   /auth/request-password-reset
POST   /auth/reset-password
POST   /auth/verify-email

``` text

### User Endpoints

``` text
GET    /users/:id              - Get user profile

PATCH  /users/:id              - Update user profile

GET    /users/:id/orders       - User order history

``` text

### Products Endpoints

``` text
GET    /products               - List products with filters

GET    /products/:id           - Get product details

POST   /products               - Create product (admin)

PATCH  /products/:id           - Update product (admin)

DELETE /products/:id           - Delete product (admin)

GET    /products/:id/reviews   - Get product reviews

POST   /products/:id/reviews   - Submit review

GET    /products/:id/wishlist  - Check wishlist status

``` text

### Dashboard Endpoints

``` text
GET    /dashboard/stats        - Admin dashboard metrics

GET    /dashboard/orders       - Recent orders

GET    /dashboard/products     - Product overview

``` text

---

## Database Schema Reference

### User (Prisma)

``` prisma
model User {
  id              String    @id @default(cuid())
  email           String    @unique
  firstName       String
  lastName        String
  password        String    // bcrypt hashed
  phone           String?
  address         Address?
  role            Role      @default(CUSTOMER)
  verified        Boolean   @default(false)
  refreshToken    String?
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt

  orders          Order[]
  reviews         Review[]
  wishlists       Wishlist[]
}

enum Role {
  CUSTOMER
  VENDOR
  ADMIN
}

``` text

### Review

``` prisma
model Review {
  id              String    @id @default(cuid())
  productId       String
  userId          String
  rating          Int       // 1-5
  title           String    @db.VarChar(100)
  comment         String    @db.Text
  helpful         Int       @default(0)
  verified        Boolean   @default(false)
  createdAt       DateTime  @default(now())

  product         Product   @relation(fields: [productId], references: [id])
  user            User      @relation(fields: [userId], references: [id])

  @@index([productId])
  @@index([userId])
}

``` text

### Wishlist

``` prisma
model Wishlist {
  id              String    @id @default(cuid())
  userId          String
  productId       String
  createdAt       DateTime  @default(now())

  user            User      @relation(fields: [userId], references: [id])
  product         Product   @relation(fields: [productId], references: [id])

  @@unique([userId, productId])
}

``` text

---

## Error Handling Patterns

### API Error Responses

``` typescript
// Handle 401 Unauthorized
if (response.status === 401) {
  logout();
  router.push('/auth/login');
}

// Handle 403 Forbidden
if (response.status === 403) {
  router.push('/unauthorized');
}

// Handle validation errors
if (response.status === 400) {
  const error = await response.json();
  setFormError(error.message);
}

// Handle server errors
if (response.status >= 500) {
  setError('Server error. Please try again later.');
}

``` text

### Try-Catch Pattern

``` typescript
try {
  const response = await fetch(url, options);
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Request failed');

  }
  const data = await response.json();
  return data;
} catch (err) {
  const message = err instanceof Error ? err.message : 'Unknown error';
  console.error('API Error:', message);
  throw err;
}

``` text

---

## Security Checklist

### Before Production Deployment

- [ ] All API endpoints use HTTPS

- [ ] JWT secret is strong and unique

- [ ] CORS is properly configured

- [ ] Rate limiting is enabled

- [ ] SQL injection prevention implemented

- [ ] XSS protection enabled

- [ ] CSRF tokens validated

- [ ] Passwords hashed with bcrypt

- [ ] Environment variables secured

- [ ] Error messages don't leak system info

- [ ] Sensitive data not logged

- [ ] Database backups automated

- [ ] SSL certificate installed

- [ ] Security headers configured

### CORS Configuration (Backend)

``` typescript
@Module({
  imports: [
    CorsModule.register({
      origin: [
        'http://localhost:3000',
        'http://localhost:3001',
        'https://yourdomain.com'
      ],
      credentials: true,
      methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
      allowedHeaders: 'Content-Type,Authorization',
    }),
  ],
})
export class AppModule {}

``` text

### Rate Limiting (Backend)

``` typescript
import { ThrottlerModule } from '@nestjs/throttler';

@Module({
  imports: [
    ThrottlerModule.forRoot([
      {
        ttl: 60000,
        limit: 10, // 10 requests per 60 seconds
      },
    ]),
  ],
})
export class AppModule {}

``` text

---

## Performance Optimization Tips

### Frontend

``` typescript
// ✅ Good: Memoize expensive computations
const filteredProducts = useMemo(() => {
  return products.filter(p => p.price > minPrice);
}, [products, minPrice]);

// ✅ Good: Memoize callbacks
const handleFilter = useCallback((newFilter) => {
  setFilter(newFilter);
}, []);

// ✅ Good: Lazy load images
<img src={url} loading="lazy" />

// ✅ Good: Use Next.js Image component
<Image src={url} alt={alt} width={200} height={200} />

// ❌ Avoid: Inline functions in JSX
<button onClick={() => handleClick()}>Click</button>
// Should use callback above

``` text

### Backend

``` typescript
// ✅ Good: Use indexes
@Entity()
export class Review {
  @Index()
  @Column()
  productId: string;

  @Index()
  @Column()
  userId: string;
}

// ✅ Good: Pagination
SELECT * FROM products LIMIT 10 OFFSET 0;

// ✅ Good: Query optimization
SELECT p.* FROM products p
  LEFT JOIN reviews r ON p.id = r.productId
  WHERE p.status = 'ACTIVE'
  LIMIT 20;

// ❌ Avoid: N+1 queries
for (const product of products) {
  const reviews = await getReviews(product.id); // Bad!
}
// Use JOIN instead

``` text

---

## Monitoring & Logging

### Frontend Logging

``` typescript
// Development logging
if (process.env.NODE_ENV === 'development') {
  console.log('User logged in:', user);
}

// Production monitoring
if (process.env.NODE_ENV === 'production') {
  // Send to error tracking service (Sentry)
  Sentry.captureException(error);
}

``` text

### Backend Logging

``` typescript
import { Logger } from '@nestjs/common';

export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  async login(email: string, password: string) {
    this.logger.log(`Login attempt for ${email}`);
    try {
      // Login logic
    } catch (error) {
      this.logger.error(`Login failed for ${email}:`, error);
      throw error;
    }
  }
}

``` text

---

## Testing Examples

### Unit Test (AuthContext)

``` typescript
import { renderHook, act } from '@testing-library/react';
import { useAuth } from '@/context/AuthContext';

describe('useAuth', () => {
  it('should login user with valid credentials', async () => {
    const { result } = renderHook(() => useAuth(), {
      wrapper: AuthProvider
    });

    await act(async () => {
      await result.current.login('user@example.com', 'password');
    });

    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.user).toBeDefined();
  });
});

``` text

### Integration Test

``` typescript
describe('Login Flow', () => {
  it('should login and redirect to home', async () => {
    render(<LoginPage />);

    await userEvent.type(
      screen.getByPlaceholderText(/email/i),
      'user@example.com'
    );
    await userEvent.type(
      screen.getByPlaceholderText(/password/i),
      'password'
    );
    await userEvent.click(screen.getByRole('button', { name: /login/i }));

    await waitFor(() => {
      expect(window.location.pathname).toBe('/');
    });
  });
});

``` text

---

## Troubleshooting Guide

### Token Not Refreshing

``` typescript
// Check token expiry time
const getTokenExpiry = (token: string) => {
  const parts = token.split('.');
  const decoded = JSON.parse(atob(parts[1]));
  return new Date(decoded.exp * 1000);
};

// Verify refresh mechanism
localStorage.getItem('shalkaar_refresh_token');

``` text

### Protected Routes Not Working

``` typescript
// Debug authentication state
const { user, isAuthenticated, isLoading } = useAuth();
console.log({ user, isAuthenticated, isLoading });

// Check role access
console.log('User role:', user?.role);
console.log('Allowed roles:', allowedRoles);

``` text

### Search Not Finding Results

``` typescript
// Debug filter state
console.log('Search term:', searchTerm);
console.log('Product count:', products.length);
console.log('Filtered count:', filteredProducts.length);

// Check filter logic
console.log('Min price:', priceMin, 'Max price:', priceMax);

``` text

---

## Useful Commands

``` bash

# Development

pnpm dev                    # Start dev server
pnpm dev:admin             # Start admin app only
pnpm dev:storefront        # Start storefront only

# Building

pnpm build                 # Build all apps
pnpm build:storefront      # Build storefront
pnpm build:admin           # Build admin

# Testing

pnpm test                  # Run all tests
pnpm test:watch            # Watch mode
pnpm test:coverage         # Coverage report

# Linting

pnpm lint                  # Run ESLint
pnpm format                # Format with Prettier

# Database

pnpm db:push               # Push Prisma schema
pnpm db:migrate            # Run migrations
pnpm db:seed               # Seed database
pnpm db:studio             # Open Prisma Studio

``` text

---

## Resources & Documentation

### Official Documentation

- [Next.js Documentation](https://nextjs.org/docs)

- [React Documentation](https://react.dev)

- [TypeScript Documentation](https://www.typescriptlang.org/docs)

- [Tailwind CSS Documentation](https://tailwindcss.com/docs)

- [NestJS Documentation](https://docs.nestjs.com)

### Libraries

- [SWR - Data Fetching](https://swr.vercel.app)

- [Zod - Schema Validation](https://zod.dev)

- [Sentry - Error Tracking](https://sentry.io)

### Security

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)

- [JWT Best Practices](https://tools.ietf.org/html/rfc8949)

- [Auth0 Blog](https://auth0.com/blog)

---

## Support Channels

- GitHub Issues: Report bugs

- Documentation: `/docs` folder

- Email: support@shalkaar.com

- Slack: #engineering channel

---

**Version:** 1.0.0

**Last Updated:** 2024
**Status:** Production Ready
**Support:** Active Development
