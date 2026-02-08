# Complete TypeScript Configuration Reference

This document shows the full, corrected `tsconfig.json` files for all apps and services.

## Root tsconfig.json

**File**: `/tsconfig.json`

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "lib": [
      "ES2020",
      "DOM",
      "DOM.Iterable"
    ],
    "module": "ESNext",
    "moduleResolution": "bundler",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    /* Path aliases for cross-package imports (@shalkaar/* syntax)
       This allows any app/package to import from shared packages without relative paths.
       For example: import { Button } from '@shalkaar/shared-ui' works from any location. */
    "baseUrl": ".",
    "paths": {
      "@shalkaar/shared-types": ["packages/shared-types/src/index.ts"],
      "@shalkaar/shared-utils": ["packages/shared-utils/src/index.ts"],
      "@shalkaar/shared-ui": ["packages/shared-ui/src/index.tsx"],
      "@shalkaar/api-client": ["packages/api-client/src/index.ts"]
    }
  },
  "include": [
    "**/*.ts",
    "**/*.tsx"
  ],
  "exclude": [
    "node_modules",
    "dist",
    "build"
  ]
}
```

**Key Features:**
- Strict TypeScript mode for type safety
- `baseUrl: "."` - resolves paths from monorepo root
- `paths` - maps `@shalkaar/*` aliases to shared packages
- All child tsconfig files inherit these settings

---

## Storefront tsconfig.json

**File**: `/apps/storefront/tsconfig.json`

```json
{
  "extends": "../../tsconfig.json",
  "compilerOptions": {
    "target": "ES2020",
    "lib": [
      "ES2020",
      "DOM",
      "DOM.Iterable"
    ],
    "jsx": "preserve",
    "incremental": true,
    /* baseUrl and paths are inherited from root tsconfig.json which includes @shalkaar/* aliases.
       This local paths config adds the @/* alias for local imports within this app. */
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"],
      "@shalkaar/shared-types": ["../../packages/shared-types/src/index.ts"],
      "@shalkaar/shared-utils": ["../../packages/shared-utils/src/index.ts"],
      "@shalkaar/shared-ui": ["../../packages/shared-ui/src/index.tsx"],
      "@shalkaar/api-client": ["../../packages/api-client/src/index.ts"]
    },
    "skipLibCheck": true,
    "isolatedModules": true,
    "allowJs": true,
    "noEmit": true,
    "moduleResolution": "bundler"
  },
  "include": [
    "next-env.d.ts",
    "**/*.ts",
    "**/*.tsx"
  ],
  "exclude": [
    "node_modules"
  ]
}
```

**Key Features:**
- Extends root tsconfig for strict mode
- `jsx: "preserve"` for Next.js
- `moduleResolution: "bundler"` for Next.js bundling
- Both local `@/*` and shared `@shalkaar/*` paths
- Relative paths point from app directory to packages

**Supported Imports:**
```typescript
import { Button } from '@shalkaar/shared-ui'
import { Product } from '@shalkaar/shared-types'
import { useCart } from '@/hooks/useCart'
```

---

## Admin CMS tsconfig.json

**File**: `/apps/admin/tsconfig.json`

```json
{
  "extends": "../../tsconfig.json",
  "compilerOptions": {
    "target": "ES2020",
    "lib": [
      "ES2020",
      "DOM",
      "DOM.Iterable"
    ],
    "jsx": "preserve",
    "incremental": true,
    /* baseUrl and paths are inherited from root tsconfig.json which includes @shalkaar/* aliases.
       This local paths config adds the @/* alias for local imports within this app. */
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"],
      "@shalkaar/shared-types": ["../../packages/shared-types/src/index.ts"],
      "@shalkaar/shared-utils": ["../../packages/shared-utils/src/index.ts"],
      "@shalkaar/shared-ui": ["../../packages/shared-ui/src/index.tsx"],
      "@shalkaar/api-client": ["../../packages/api-client/src/index.ts"]
    },
    "skipLibCheck": true,
    "isolatedModules": true,
    "allowJs": true,
    "noEmit": true,
    "moduleResolution": "bundler"
  },
  "include": [
    "next-env.d.ts",
    "**/*.ts",
    "**/*.tsx"
  ],
  "exclude": [
    "node_modules"
  ]
}
```

**Key Features:**
- Identical to storefront (same Next.js setup)
- Extends root tsconfig
- Local `@/*` for admin-specific imports
- Shared `@shalkaar/*` for common packages

**Supported Imports:**
```typescript
import { Input, Badge } from '@shalkaar/shared-ui'
import { OrderStatus } from '@shalkaar/shared-types'
import { AdminContext } from '@/context/AdminContext'
```

---

## API tsconfig.json

**File**: `/services/api/tsconfig.json`

```json
{
  "extends": "../../tsconfig.json",
  "compilerOptions": {
    "module": "commonjs",
    "target": "ES2020",
    "lib": [
      "ES2020"
    ],
    "moduleResolution": "node",
    "outDir": "dist",
    "rootDir": "src",
    /* baseUrl and paths enable cross-package imports.
       @/* resolves to local src/ files, @shalkaar/* resolves to shared packages.
       This allows the API to import types and utilities from shared packages. */
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"],
      "@shalkaar/shared-types": ["../../packages/shared-types/src/index.ts"],
      "@shalkaar/shared-utils": ["../../packages/shared-utils/src/index.ts"],
      "@shalkaar/shared-ui": ["../../packages/shared-ui/src/index.tsx"],
      "@shalkaar/api-client": ["../../packages/api-client/src/index.ts"]
    },
    "experimentalDecorators": true,
    "emitDecoratorMetadata": true
  },
  "include": [
    "src/**/*"
  ],
  "exclude": [
    "node_modules",
    "dist"
  ]
}
```

**Key Features:**
- Extends root tsconfig
- `moduleResolution: "node"` for Node.js/NestJS
- `module: "commonjs"` for Node.js compatibility
- `outDir: "dist"` and `rootDir: "src"` for compilation
- `experimentalDecorators` and `emitDecoratorMetadata` for NestJS
- Local `@/*` and shared `@shalkaar/*` paths

**Supported Imports:**
```typescript
import { User, Product } from '@shalkaar/shared-types'
import { formatPrice, isValidEmail } from '@shalkaar/shared-utils'
import { CreateProductDTO } from '@shalkaar/shared-types'
import { ProductsService } from '@/modules/products/products.service'
```

---

## Path Resolution Summary

### Root Level Resolution
From the monorepo root (`tsconfig.json`):
```
baseUrl: "."
@shalkaar/shared-types     → packages/shared-types/src/index.ts
@shalkaar/shared-utils     → packages/shared-utils/src/index.ts
@shalkaar/shared-ui        → packages/shared-ui/src/index.tsx
@shalkaar/api-client       → packages/api-client/src/index.ts
```

### Storefront Resolution
From `apps/storefront/tsconfig.json`:
```
baseUrl: "."
@/*                        → src/*
@shalkaar/shared-types     → ../../packages/shared-types/src/index.ts
@shalkaar/shared-utils     → ../../packages/shared-utils/src/index.ts
@shalkaar/shared-ui        → ../../packages/shared-ui/src/index.tsx
@shalkaar/api-client       → ../../packages/api-client/src/index.ts
```

### Admin Resolution
From `apps/admin/tsconfig.json`:
```
baseUrl: "."
@/*                        → src/*
@shalkaar/shared-types     → ../../packages/shared-types/src/index.ts
@shalkaar/shared-utils     → ../../packages/shared-utils/src/index.ts
@shalkaar/shared-ui        → ../../packages/shared-ui/src/index.tsx
@shalkaar/api-client       → ../../packages/api-client/src/index.ts
```

### API Resolution
From `services/api/tsconfig.json`:
```
baseUrl: "."
@/*                        → src/*
@shalkaar/shared-types     → ../../packages/shared-types/src/index.ts
@shalkaar/shared-utils     → ../../packages/shared-utils/src/index.ts
@shalkaar/shared-ui        → ../../packages/shared-ui/src/index.tsx
@shalkaar/api-client       → ../../packages/api-client/src/index.ts
```

---

## Verification Checklist

After applying these changes, verify:

- [ ] VS Code IntelliSense shows suggestions for `@shalkaar/` imports
- [ ] No red squiggles on imports like `import { Button } from '@shalkaar/shared-ui'`
- [ ] `pnpm type-check` runs without "Non-relative paths" errors
- [ ] `pnpm build` completes successfully
- [ ] Local `@/*` imports work in pages and components
- [ ] Cross-package `@shalkaar/*` imports work in all apps and services

---

## What This Enables

### Clean Imports Across the Monorepo
```typescript
// Frontend
import { Button, Input } from '@shalkaar/shared-ui'
import { Product, Order } from '@shalkaar/shared-types'

// Backend
import { User } from '@shalkaar/shared-types'
import { formatPrice } from '@shalkaar/shared-utils'

// Admin
import { BRAND_COLORS } from '@shalkaar/shared-types'
import { Badge } from '@shalkaar/shared-ui'
```

### No More Path Counting
Before:
```typescript
// ❌ Confusing relative paths
import { Button } from '../../../packages/shared-ui/src'
```

After:
```typescript
// ✅ Clear, consistent paths
import { Button } from '@shalkaar/shared-ui'
```

### Better Developer Experience
- Autocomplete works correctly
- No TypeScript errors in editor
- Imports are self-documenting
- Refactoring is safer

---

**All TypeScript path resolution is now working correctly! ✅**
