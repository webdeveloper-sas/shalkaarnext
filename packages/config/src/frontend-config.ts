/**
 * Frontend Environment Configuration
 * Next.js frontend configuration with validation (PUBLIC ONLY)
 */

import { EnvVarConfig } from './env-validator';

/**
 * Frontend environment variables configuration
 * NOTE: Only NEXT_PUBLIC_* variables are exposed to browser
 */
export const FRONTEND_ENV_CONFIG: EnvVarConfig[] = [
  // ==========================================
  // API Configuration (PUBLIC)
  // ==========================================
  {
    key: 'NEXT_PUBLIC_API_BASE_URL',
    required: true,
    requiredIn: ['production', 'staging'],
    description: 'Base URL for API requests from frontend',
    type: 'url',
    defaultValue: 'http://localhost:3333/api/v1',
    validateFn: (value) => value.includes('/api/'),
  },

  // ==========================================
  // Authentication (NON-PUBLIC - Server only)
  // ==========================================
  {
    key: 'NEXTAUTH_URL',
    required: true,
    requiredIn: ['production', 'staging'],
    description: 'NextAuth callback URL for storefront',
    type: 'url',
    environment: 'backend',
    sensitive: true,
  },
  {
    key: 'NEXTAUTH_SECRET',
    required: true,
    requiredIn: ['production', 'staging'],
    description: 'NextAuth secret key for storefront',
    environment: 'backend',
    sensitive: true,
    validateFn: (value) => value.length >= 32,
  },

  // ==========================================
  // Admin Dashboard Configuration
  // ==========================================
  {
    key: 'ADMIN_NEXTAUTH_URL',
    requiredIn: ['production', 'staging'],
    description: 'NextAuth callback URL for admin dashboard',
    type: 'url',
    environment: 'backend',
    sensitive: true,
  },
  {
    key: 'ADMIN_NEXTAUTH_SECRET',
    requiredIn: ['production', 'staging'],
    description: 'NextAuth secret key for admin dashboard',
    environment: 'backend',
    sensitive: true,
    validateFn: (value) => value.length >= 32,
  },
  {
    key: 'NEXT_PUBLIC_ADMIN_EMAIL_DOMAIN',
    description: 'Email domain allowed for admin access',
    defaultValue: '@shalkaar.com',
  },

  // ==========================================
  // Analytics (PUBLIC - Safe)
  // ==========================================
  {
    key: 'NEXT_PUBLIC_GA_ID',
    description: 'Google Analytics ID (public)',
    validateFn: (value) => value.startsWith('G-') || value.length === 0,
  },
  {
    key: 'NEXT_PUBLIC_ENABLE_ANALYTICS',
    description: 'Enable analytics tracking',
    type: 'boolean',
    defaultValue: true,
  },

  // ==========================================
  // Payment Processing (PUBLIC - Only public keys)
  // ==========================================
  {
    key: 'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY',
    requiredIn: ['production', 'staging'],
    description: 'Stripe publishable key (safe for frontend)',
    validateFn: (value) => value.startsWith('pk_') || value.length === 0,
  },

  // ==========================================
  // Feature Flags (PUBLIC)
  // ==========================================
  {
    key: 'NEXT_PUBLIC_ENABLE_ARTISAN_PROGRAM',
    description: 'Enable artisan program feature',
    type: 'boolean',
    defaultValue: true,
  },
  {
    key: 'NEXT_PUBLIC_ENABLE_REVIEWS',
    description: 'Enable product reviews',
    type: 'boolean',
    defaultValue: true,
  },
  {
    key: 'NEXT_PUBLIC_ENABLE_WISHLISTS',
    description: 'Enable wishlist functionality',
    type: 'boolean',
    defaultValue: true,
  },
  {
    key: 'NEXT_PUBLIC_ENABLE_SUBSCRIPTIONS',
    description: 'Enable subscription products',
    type: 'boolean',
    defaultValue: false,
  },

  // ==========================================
  // App Configuration (PUBLIC)
  // ==========================================
  {
    key: 'NEXT_PUBLIC_APP_NAME',
    description: 'Application name',
    defaultValue: 'SHALKAAR',
  },
  {
    key: 'NEXT_PUBLIC_SUPPORT_EMAIL',
    description: 'Support email address',
    defaultValue: 'support@shalkaar.com',
  },
];

/**
 * Frontend configuration interface
 * Only includes variables that are safe to expose
 */
export interface FrontendConfig {
  // API
  apiBaseUrl: string;

  // Analytics
  gaId?: string;
  enableAnalytics: boolean;

  // Payment
  stripePublishableKey?: string;

  // Features
  enableArtisanProgram: boolean;
  enableReviews: boolean;
  enableWishlists: boolean;
  enableSubscriptions: boolean;

  // App
  appName: string;
  supportEmail: string;
  adminEmailDomain: string;
}

/**
 * Parse frontend configuration from environment variables
 * IMPORTANT: Only returns public-safe values
 */
export function parseFrontendConfig(env: NodeJS.ProcessEnv = process.env): FrontendConfig {
  return {
    // API
    apiBaseUrl: env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3333/api/v1',

    // Analytics
    gaId: env.NEXT_PUBLIC_GA_ID,
    enableAnalytics: env.NEXT_PUBLIC_ENABLE_ANALYTICS !== 'false',

    // Payment
    stripePublishableKey: env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,

    // Features
    enableArtisanProgram: env.NEXT_PUBLIC_ENABLE_ARTISAN_PROGRAM !== 'false',
    enableReviews: env.NEXT_PUBLIC_ENABLE_REVIEWS !== 'false',
    enableWishlists: env.NEXT_PUBLIC_ENABLE_WISHLISTS !== 'false',
    enableSubscriptions: env.NEXT_PUBLIC_ENABLE_SUBSCRIPTIONS === 'true',

    // App
    appName: env.NEXT_PUBLIC_APP_NAME || 'SHALKAAR',
    supportEmail: env.NEXT_PUBLIC_SUPPORT_EMAIL || 'support@shalkaar.com',
    adminEmailDomain: env.NEXT_PUBLIC_ADMIN_EMAIL_DOMAIN || '@shalkaar.com',
  };
}

/**
 * Verify that only NEXT_PUBLIC_* variables are being used
 * Prevents accidental exposure of sensitive data
 */
export function verifyNoSensitiveExposure(env: NodeJS.ProcessEnv = process.env): { valid: boolean; exposed: string[] } {
  const exposed: string[] = [];

  const sensitiveKeys = [
    'JWT_SECRET',
    'JWT_REFRESH_SECRET',
    'NEXTAUTH_SECRET',
    'ADMIN_NEXTAUTH_SECRET',
    'STRIPE_SECRET_KEY',
    'STRIPE_WEBHOOK_SECRET',
    'SMTP_PASS',
    'SENTRY_DSN',
    'DATABASE_URL',
  ];

  sensitiveKeys.forEach(key => {
    if (env[`NEXT_PUBLIC_${key}`]) {
      exposed.push(`NEXT_PUBLIC_${key}`);
    }
  });

  return {
    valid: exposed.length === 0,
    exposed,
  };
}
