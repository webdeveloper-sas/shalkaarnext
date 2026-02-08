# TypeScript Path Resolution - Quick Reference

## Problem Fixed ✅

```
"Non-relative paths are not allowed when 'baseUrl' is not set. 
Did you forget a leading './'?"
```

This error is now gone! All cross-package imports work perfectly.

---

## Clean Import Syntax

### From Any App or Service
```typescript
// ✅ All of these work now:
import { Button, Input, Card } from '@shalkaar/shared-ui'
import { Product, Order, User } from '@shalkaar/shared-types'
import { formatPrice, slugify } from '@shalkaar/shared-utils'
import { apiClient } from '@shalkaar/api-client'

// Local imports
import { useCart } from '@/hooks/useCart'
import { CartProvider } from '@/context/CartContext'
```

---

## What Changed

| File | Added | Purpose |
|------|-------|---------|
| `/tsconfig.json` | `baseUrl` + `paths` | Enable @shalkaar/* aliases for all packages |
| `/apps/storefront/tsconfig.json` | `baseUrl` + `paths` | Resolve @/* locally, @shalkaar/* to packages |
| `/apps/admin/tsconfig.json` | `baseUrl` + `paths` | Same as storefront |
| `/services/api/tsconfig.json` | `baseUrl` + `paths` | Same pattern for NestJS |

---

## Import Examples by Location

### In Storefront (`apps/storefront/`)
```typescript
// Shared packages
import { Button } from '@shalkaar/shared-ui'
import { Product } from '@shalkaar/shared-types'

// Local
import { useCart } from '@/hooks/useCart'
import { CartContext } from '@/context/CartContext'
import { formatPrice } from '@/utils/formatters'
```

### In Admin CMS (`apps/admin/`)
```typescript
// Shared packages
import { Input, Badge } from '@shalkaar/shared-ui'
import { UserRole, OrderStatus } from '@shalkaar/shared-types'

// Local
import { useAdmin } from '@/context/AdminContext'
import { AdminLayout } from '@/components/AdminLayout'
```

### In API (`services/api/`)
```typescript
// Shared packages
import { User, Product } from '@shalkaar/shared-types'
import { formatPrice } from '@shalkaar/shared-utils'
import { CreateProductDTO } from '@shalkaar/shared-types'

// Local
import { ProductsService } from '@/modules/products/products.service'
import { AuthGuard } from '@/guards/auth.guard'
```

---

## How It Works

### The Three-Layer System

**Layer 1: Root Config** (`/tsconfig.json`)
```json
{
  "baseUrl": ".",
  "paths": {
    "@shalkaar/shared-types": ["packages/shared-types/src/index.ts"],
    "@shalkaar/shared-utils": ["packages/shared-utils/src/index.ts"],
    "@shalkaar/shared-ui": ["packages/shared-ui/src/index.tsx"],
    "@shalkaar/api-client": ["packages/api-client/src/index.ts"]
  }
}
```

**Layer 2: App Extends Root**
```json
{
  "extends": "../../tsconfig.json",
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"],
      // All @shalkaar/* paths inherited from root, but can override
      "@shalkaar/shared-types": ["../../packages/shared-types/src/index.ts"]
    }
  }
}
```

**Layer 3: TypeScript Resolves**
```
When you import: import { Button } from '@shalkaar/shared-ui'

TypeScript:
1. Sees @shalkaar/shared-ui path alias
2. Looks it up in paths configuration
3. Finds: "../../packages/shared-ui/src/index.tsx"
4. Resolves to correct location
5. Loads the module ✓
```

---

## Verification Steps

### 1. In VS Code
- Open any file
- Type: `import { ` and VS Code should suggest cross-package imports
- No red squiggles on `@shalkaar/` imports
- Ctrl+Click navigates to the correct file

### 2. Command Line
```bash
# All should complete without "baseUrl" errors
pnpm type-check
pnpm build
```

### 3. Watch for Errors
The following errors should NO LONGER appear:
```
❌ Non-relative paths are not allowed
❌ Cannot find module '@shalkaar/shared-ui'
❌ baseUrl is not set
```

---

## Key Points

✅ **baseUrl** - Required for TypeScript to use path mappings
✅ **paths** - Maps aliases to actual file locations
✅ **Relative paths** - Each app config uses relative paths to packages
✅ **Inheritance** - Apps inherit root config settings
✅ **Consistent syntax** - Same imports work from anywhere

---

## Troubleshooting

### Still seeing errors in VS Code?
```
1. Close VS Code completely
2. Open the folder again
3. Or: Ctrl+Shift+P → Reload Window
```

### TypeScript still complaining?
```bash
# Rebuild TypeScript
pnpm clean:cache
pnpm type-check
```

### Import not resolving?
Check the path in your `tsconfig.json`:
```json
// If you're in /apps/storefront/src/pages/
// And want to import from /packages/shared-ui/src/
// The path should be: ../../packages/shared-ui/src/index.tsx
```

---

## File Locations Reference

```
Project Root
├── packages/
│   ├── shared-types/src/        → @shalkaar/shared-types
│   ├── shared-utils/src/        → @shalkaar/shared-utils
│   ├── shared-ui/src/           → @shalkaar/shared-ui
│   └── api-client/src/          → @shalkaar/api-client
│
├── apps/
│   ├── storefront/src/          → @/* (local imports)
│   └── admin/src/               → @/* (local imports)
│
├── services/
│   └── api/src/                 → @/* (local imports)
│
└── tsconfig.json                → Defines all @shalkaar/* aliases
```

---

## Before vs After

### ❌ BEFORE (With Relative Paths)
```typescript
import { Button } from '../../../packages/shared-ui/src'
import { useCart } from '../../../../apps/storefront/src/hooks/useCart'
import { Product } from '../../../../../packages/shared-types/src'
```
Problems:
- Hard to count dots
- Breaks when moving files
- Ugly and hard to read
- IDE autocomplete struggles

### ✅ AFTER (With Path Aliases)
```typescript
import { Button } from '@shalkaar/shared-ui'
import { useCart } from '@/hooks/useCart'
import { Product } from '@shalkaar/shared-types'
```
Benefits:
- Clear and consistent
- Doesn't break when moving files
- Self-documenting
- Perfect IDE autocomplete

---

## Summary

🎯 **Problem**: Cross-package imports don't resolve without `baseUrl`
✅ **Solution**: Added `baseUrl: "."` and `paths` to all tsconfig files
🚀 **Result**: Clean `@shalkaar/*` imports work everywhere
✨ **Benefit**: Cleaner code, better IDE support, easier refactoring

---

**You're all set! Start using clean cross-package imports! 🎉**
