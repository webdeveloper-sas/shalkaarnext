/**
 * Backend Environment Configuration
 * NestJS API service configuration with validation
 */

import { EnvVarConfig } from './env-validator';

/**
 * Backend environment variables configuration
 */
export const BACKEND_ENV_CONFIG: EnvVarConfig[] = [
  // ==========================================
  // Core Configuration
  // ==========================================
  {
    key: 'NODE_ENV',
    required: true,
    description: 'Runtime environment (development, staging, production)',
    validateFn: (value) => ['development', 'staging', 'production'].includes(value),
  },
  {
    key: 'API_PORT',
    required: true,
    description: 'Port for API server',
    type: 'number',
    defaultValue: 3333,
  },
  {
    key: 'API_URL',
    required: true,
    requiredIn: ['production', 'staging'],
    description: 'Public URL of the API',
    type: 'url',
    defaultValue: 'http://localhost:3333',
  },
  
  // ==========================================
  // Database Configuration
  // ==========================================
  {
    key: 'DATABASE_URL',
    required: true,
    requiredIn: ['production', 'staging'],
    description: 'PostgreSQL connection string (Neon or local)',
    environment: 'backend',
    sensitive: true,
    validateFn: (value) => value.includes('postgresql://'),
  },
  {
    key: 'DATABASE_POOL_SIZE',
    description: 'Database connection pool size',
    type: 'number',
    defaultValue: 20,
    requiredIn: ['production'],
  },
  {
    key: 'DATABASE_TIMEOUT',
    description: 'Database connection timeout in milliseconds',
    type: 'number',
    defaultValue: 5000,
  },

  // ==========================================
  // Authentication & JWT
  // ==========================================
  {
    key: 'JWT_SECRET',
    required: true,
    requiredIn: ['production', 'staging'],
    description: 'JWT signing secret for access tokens',
    environment: 'backend',
    sensitive: true,
    validateFn: (value) => value.length >= 32,
  },
  {
    key: 'JWT_EXPIRATION',
    description: 'JWT expiration time (e.g., 15m, 24h)',
    defaultValue: '15m',
  },
  {
    key: 'JWT_REFRESH_SECRET',
    required: true,
    requiredIn: ['production', 'staging'],
    description: 'JWT signing secret for refresh tokens',
    environment: 'backend',
    sensitive: true,
    validateFn: (value) => value.length >= 32,
  },
  {
    key: 'JWT_REFRESH_EXPIRATION',
    description: 'JWT refresh token expiration time',
    defaultValue: '7d',
  },

  // ==========================================
  // Payment Processing
  // ==========================================
  {
    key: 'PAYMENT_GATEWAY',
    description: 'Payment gateway provider (stripe, paypal, mock)',
    defaultValue: 'mock',
    validateFn: (value) => ['stripe', 'paypal', 'mock'].includes(value),
  },
  {
    key: 'STRIPE_SECRET_KEY',
    requiredIn: ['production', 'staging'],
    description: 'Stripe secret API key',
    environment: 'backend',
    sensitive: true,
    validateFn: (value) => value.startsWith('sk_'),
  },
  {
    key: 'STRIPE_PUBLISHABLE_KEY',
    requiredIn: ['production', 'staging'],
    description: 'Stripe publishable API key (sent to frontend)',
    sensitive: true,
    validateFn: (value) => value.startsWith('pk_'),
  },
  {
    key: 'STRIPE_WEBHOOK_SECRET',
    requiredIn: ['production', 'staging'],
    description: 'Stripe webhook signing secret',
    environment: 'backend',
    sensitive: true,
    validateFn: (value) => value.startsWith('whsec_'),
  },
  {
    key: 'PAYMENT_TIMEOUT_MS',
    description: 'Payment processing timeout in milliseconds',
    type: 'number',
    defaultValue: 30000,
  },
  {
    key: 'PAYMENT_RETRY_ATTEMPTS',
    description: 'Number of payment retry attempts',
    type: 'number',
    defaultValue: 3,
  },

  // ==========================================
  // Email Configuration
  // ==========================================
  {
    key: 'EMAIL_PROVIDER',
    description: 'Email provider (sendgrid, mailgun, smtp, mock)',
    defaultValue: 'mock',
    validateFn: (value) => ['sendgrid', 'mailgun', 'smtp', 'mock'].includes(value),
  },
  {
    key: 'SMTP_HOST',
    requiredIn: ['production', 'staging'],
    description: 'SMTP server host',
    environment: 'backend',
  },
  {
    key: 'SMTP_PORT',
    requiredIn: ['production', 'staging'],
    description: 'SMTP server port',
    type: 'number',
    defaultValue: 587,
  },
  {
    key: 'SMTP_USER',
    requiredIn: ['production', 'staging'],
    description: 'SMTP authentication username',
    environment: 'backend',
    sensitive: true,
  },
  {
    key: 'SMTP_PASS',
    requiredIn: ['production', 'staging'],
    description: 'SMTP authentication password',
    environment: 'backend',
    sensitive: true,
  },
  {
    key: 'SMTP_FROM_EMAIL',
    requiredIn: ['production', 'staging'],
    description: 'Default sender email address',
    type: 'string',
    defaultValue: 'noreply@shalkaar.com',
  },
  {
    key: 'SMTP_FROM_NAME',
    description: 'Default sender name',
    defaultValue: 'SHALKAAR',
  },
  {
    key: 'EMAIL_TIMEOUT_MS',
    description: 'Email sending timeout in milliseconds',
    type: 'number',
    defaultValue: 10000,
  },

  // ==========================================
  // Webhook Configuration
  // ==========================================
  {
    key: 'WEBHOOK_TIMEOUT_MS',
    description: 'Webhook processing timeout in milliseconds',
    type: 'number',
    defaultValue: 30000,
  },
  {
    key: 'WEBHOOK_RETRY_ATTEMPTS',
    description: 'Number of webhook retry attempts',
    type: 'number',
    defaultValue: 3,
  },
  {
    key: 'WEBHOOK_RETRY_DELAY_MS',
    description: 'Delay between webhook retry attempts (milliseconds)',
    type: 'number',
    defaultValue: 1000,
  },

  // ==========================================
  // Logging & Monitoring
  // ==========================================
  {
    key: 'LOG_LEVEL',
    description: 'Log level (debug, info, warn, error)',
    defaultValue: 'info',
    validateFn: (value) => ['debug', 'info', 'warn', 'error'].includes(value),
  },
  {
    key: 'SENTRY_DSN',
    description: 'Sentry error tracking DSN',
    environment: 'backend',
    sensitive: true,
  },
  {
    key: 'SENTRY_ENVIRONMENT',
    description: 'Sentry environment tag',
    defaultValue: 'development',
  },

  // ==========================================
  // CORS & Security
  // ==========================================
  {
    key: 'CORS_ORIGIN',
    description: 'CORS allowed origins (comma-separated)',
    defaultValue: 'http://localhost:3000,http://localhost:3001',
  },
  {
    key: 'TRUSTED_PROXIES',
    description: 'Trusted proxy IPs (comma-separated)',
    defaultValue: '127.0.0.1,::1',
  },
  {
    key: 'RATE_LIMIT_WINDOW_MS',
    description: 'Rate limit window in milliseconds',
    type: 'number',
    defaultValue: 60000,
  },
  {
    key: 'RATE_LIMIT_MAX_REQUESTS',
    description: 'Maximum requests per rate limit window',
    type: 'number',
    defaultValue: 100,
  },
];

/**
 * Backend configuration interface
 */
export interface BackendConfig {
  // Core
  nodeEnv: 'development' | 'staging' | 'production';
  apiPort: number;
  apiUrl: string;
  isDevelopment: boolean;
  isProduction: boolean;
  isStaging: boolean;

  // Database
  databaseUrl: string;
  databasePoolSize: number;
  databaseTimeout: number;

  // Authentication
  jwtSecret: string;
  jwtExpiration: string;
  jwtRefreshSecret: string;
  jwtRefreshExpiration: string;

  // Payment
  paymentGateway: 'stripe' | 'paypal' | 'mock';
  stripeSecretKey?: string;
  stripePublishableKey?: string;
  stripeWebhookSecret?: string;
  paymentTimeoutMs: number;
  paymentRetryAttempts: number;

  // Email
  emailProvider: 'sendgrid' | 'mailgun' | 'smtp' | 'mock';
  smtpHost?: string;
  smtpPort: number;
  smtpUser?: string;
  smtpPass?: string;
  smtpFromEmail: string;
  smtpFromName: string;
  emailTimeoutMs: number;

  // Webhooks
  webhookTimeoutMs: number;
  webhookRetryAttempts: number;
  webhookRetryDelayMs: number;

  // Logging
  logLevel: 'debug' | 'info' | 'warn' | 'error';
  sentryDsn?: string;
  sentryEnvironment: string;

  // Security
  corsOrigin: string[];
  trustedProxies: string[];
  rateLimitWindowMs: number;
  rateLimitMaxRequests: number;
}

/**
 * Parse backend configuration from environment variables
 */
export function parseBackendConfig(env: NodeJS.ProcessEnv = process.env): BackendConfig {
  const nodeEnv = (env.NODE_ENV as 'development' | 'staging' | 'production') || 'development';

  return {
    // Core
    nodeEnv,
    apiPort: Number(env.API_PORT || 3333),
    apiUrl: env.API_URL || 'http://localhost:3333',
    isDevelopment: nodeEnv === 'development',
    isProduction: nodeEnv === 'production',
    isStaging: nodeEnv === 'staging',

    // Database
    databaseUrl: env.DATABASE_URL || '',
    databasePoolSize: Number(env.DATABASE_POOL_SIZE || 20),
    databaseTimeout: Number(env.DATABASE_TIMEOUT || 5000),

    // Authentication
    jwtSecret: env.JWT_SECRET || '',
    jwtExpiration: env.JWT_EXPIRATION || '15m',
    jwtRefreshSecret: env.JWT_REFRESH_SECRET || '',
    jwtRefreshExpiration: env.JWT_REFRESH_EXPIRATION || '7d',

    // Payment
    paymentGateway: (env.PAYMENT_GATEWAY as any) || 'mock',
    stripeSecretKey: env.STRIPE_SECRET_KEY,
    stripePublishableKey: env.STRIPE_PUBLISHABLE_KEY,
    stripeWebhookSecret: env.STRIPE_WEBHOOK_SECRET,
    paymentTimeoutMs: Number(env.PAYMENT_TIMEOUT_MS || 30000),
    paymentRetryAttempts: Number(env.PAYMENT_RETRY_ATTEMPTS || 3),

    // Email
    emailProvider: (env.EMAIL_PROVIDER as any) || 'mock',
    smtpHost: env.SMTP_HOST,
    smtpPort: Number(env.SMTP_PORT || 587),
    smtpUser: env.SMTP_USER,
    smtpPass: env.SMTP_PASS,
    smtpFromEmail: env.SMTP_FROM_EMAIL || 'noreply@shalkaar.com',
    smtpFromName: env.SMTP_FROM_NAME || 'SHALKAAR',
    emailTimeoutMs: Number(env.EMAIL_TIMEOUT_MS || 10000),

    // Webhooks
    webhookTimeoutMs: Number(env.WEBHOOK_TIMEOUT_MS || 30000),
    webhookRetryAttempts: Number(env.WEBHOOK_RETRY_ATTEMPTS || 3),
    webhookRetryDelayMs: Number(env.WEBHOOK_RETRY_DELAY_MS || 1000),

    // Logging
    logLevel: (env.LOG_LEVEL as any) || 'info',
    sentryDsn: env.SENTRY_DSN,
    sentryEnvironment: env.SENTRY_ENVIRONMENT || 'development',

    // Security
    corsOrigin: (env.CORS_ORIGIN || 'http://localhost:3000,http://localhost:3001').split(',').map(s => s.trim()),
    trustedProxies: (env.TRUSTED_PROXIES || '127.0.0.1,::1').split(',').map(s => s.trim()),
    rateLimitWindowMs: Number(env.RATE_LIMIT_WINDOW_MS || 60000),
    rateLimitMaxRequests: Number(env.RATE_LIMIT_MAX_REQUESTS || 100),
  };
}
