/**
 * Logging Configuration
 * Centralized configuration for logging and monitoring across the application
 */

export interface LoggingConfig {
  logLevel: string;
  environment: string;
  serviceName: string;
  errorTracking: {
    enabled: boolean;
    provider: string | null;
    dsn?: string;
    environment: string;
    tracesSampleRate?: number;
    attachStacktrace?: boolean;
  };
  logging: {
    format: 'json' | 'text';
    includeTimestamp: boolean;
    includeDuration: boolean;
    maxBreadcrumbs: number;
    maxQueueSize: number;
  };
  sensitive: {
    maskEmails: boolean;
    maskPhones: boolean;
    maskCreditCards: boolean;
    maskPasswords: boolean;
    maskApiKeys: boolean;
    maskTokens: boolean;
  };
  metrics: {
    enabled: boolean;
    collectHttpMetrics: boolean;
    collectDatabaseMetrics: boolean;
    collectMemoryMetrics: boolean;
  };
}

/**
 * Get logging configuration from environment
 */
export function getLoggingConfig(): LoggingConfig {
  const env = process.env.NODE_ENV || 'development';
  const logLevel = process.env.LOG_LEVEL || (env === 'production' ? 'info' : 'debug');
  
  return {
    logLevel,
    environment: env,
    serviceName: process.env.SERVICE_NAME || 'api',
    
    errorTracking: {
      enabled: process.env.ERROR_TRACKING_ENABLED !== 'false',
      provider: process.env.ERROR_TRACKING_PROVIDER || null,
      dsn: process.env.ERROR_TRACKING_DSN,
      environment: env,
      tracesSampleRate: parseFloat(process.env.ERROR_TRACKING_SAMPLE_RATE || '0.1'),
      attachStacktrace: env !== 'production',
    },
    
    logging: {
      format: (process.env.LOG_FORMAT as 'json' | 'text') || 'json',
      includeTimestamp: process.env.LOG_INCLUDE_TIMESTAMP !== 'false',
      includeDuration: process.env.LOG_INCLUDE_DURATION !== 'false',
      maxBreadcrumbs: parseInt(process.env.LOG_MAX_BREADCRUMBS || '50', 10),
      maxQueueSize: parseInt(process.env.LOG_MAX_QUEUE_SIZE || '100', 10),
    },
    
    sensitive: {
      maskEmails: process.env.LOG_MASK_EMAILS !== 'false',
      maskPhones: process.env.LOG_MASK_PHONES !== 'false',
      maskCreditCards: process.env.LOG_MASK_CREDIT_CARDS !== 'false',
      maskPasswords: process.env.LOG_MASK_PASSWORDS !== 'false',
      maskApiKeys: process.env.LOG_MASK_API_KEYS !== 'false',
      maskTokens: process.env.LOG_MASK_TOKENS !== 'false',
    },
    
    metrics: {
      enabled: process.env.METRICS_ENABLED === 'true',
      collectHttpMetrics: process.env.METRICS_HTTP !== 'false',
      collectDatabaseMetrics: process.env.METRICS_DATABASE !== 'false',
      collectMemoryMetrics: process.env.METRICS_MEMORY !== 'false',
    },
  };
}

/**
 * Environment-specific log levels
 */
export const LOG_LEVELS = {
  development: 'debug',
  staging: 'info',
  production: 'warn',
  test: 'error',
} as const;

/**
 * Sensitive fields that should always be masked
 */
export const SENSITIVE_FIELDS = [
  'password',
  'pwd',
  'secret',
  'token',
  'apiKey',
  'api_key',
  'accessToken',
  'access_token',
  'refreshToken',
  'refresh_token',
  'authToken',
  'auth_token',
  'bearer',
  'creditCard',
  'credit_card',
  'cardNumber',
  'card_number',
  'cvv',
  'cvc',
  'pin',
  'ssn',
  'socialSecurity',
  'social_security',
  'privateKey',
  'private_key',
  'certificate',
  'privateKeyPassword',
  'stripeKey',
  'stripe_key',
  'stripeSecret',
  'stripe_secret',
  'jwtSecret',
  'jwt_secret',
  'oauthToken',
  'oauth_token',
  'sessionId',
  'session_id',
  'cookieValue',
  'cookie_value',
  'auth',
  'authorization',
];

/**
 * Event categories for breadcrumb tracking
 */
export const EVENT_CATEGORIES = {
  AUTH: 'auth',
  PAYMENT: 'payment',
  PAYMENT_WEBHOOK: 'payment.webhook',
  ORDER: 'order',
  ORDER_FULFILLMENT: 'order.fulfillment',
  ORDER_ISSUE: 'order.issue',
  HTTP_REQUEST: 'http.request',
  HTTP_RESPONSE: 'http.response',
  DATABASE: 'database',
  CACHE: 'cache',
  EXTERNAL_API: 'external.api',
  SECURITY: 'security',
  PERFORMANCE: 'performance',
  MESSAGE: 'message',
} as const;

/**
 * Error severity levels
 */
export const ERROR_SEVERITY = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  CRITICAL: 'critical',
} as const;

/**
 * Metric names
 */
export const METRICS = {
  HTTP_REQUEST_DURATION: 'http.request.duration',
  HTTP_REQUEST_SIZE: 'http.request.size',
  HTTP_RESPONSE_SIZE: 'http.response.size',
  HTTP_ERRORS: 'http.errors',
  DATABASE_QUERY_DURATION: 'database.query.duration',
  DATABASE_QUERIES: 'database.queries',
  DATABASE_ERRORS: 'database.errors',
  PAYMENT_PROCESSING_DURATION: 'payment.processing.duration',
  PAYMENT_ERRORS: 'payment.errors',
  ORDER_PROCESSING_DURATION: 'order.processing.duration',
  CACHE_HIT_RATE: 'cache.hit.rate',
  MEMORY_USAGE: 'memory.usage',
  CPU_USAGE: 'cpu.usage',
} as const;

/**
 * Sample configuration for different environments
 */
export const ENVIRONMENT_CONFIGS = {
  development: {
    logLevel: 'debug',
    errorTracking: {
      enabled: true,
      provider: null, // Mock provider in development
    },
    sensitive: {
      maskEmails: false,
      maskPhones: false,
      maskCreditCards: true,
      maskPasswords: true,
      maskApiKeys: true,
      maskTokens: true,
    },
    metrics: {
      enabled: false,
    },
  },
  
  staging: {
    logLevel: 'info',
    errorTracking: {
      enabled: true,
      provider: process.env.ERROR_TRACKING_PROVIDER || 'sentry',
    },
    sensitive: {
      maskEmails: true,
      maskPhones: true,
      maskCreditCards: true,
      maskPasswords: true,
      maskApiKeys: true,
      maskTokens: true,
    },
    metrics: {
      enabled: true,
    },
  },
  
  production: {
    logLevel: 'warn',
    errorTracking: {
      enabled: true,
      provider: process.env.ERROR_TRACKING_PROVIDER || 'sentry',
    },
    sensitive: {
      maskEmails: true,
      maskPhones: true,
      maskCreditCards: true,
      maskPasswords: true,
      maskApiKeys: true,
      maskTokens: true,
    },
    metrics: {
      enabled: true,
    },
  },
};
