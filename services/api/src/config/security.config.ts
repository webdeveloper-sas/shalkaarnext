/**
 * Security Configuration
 * Centralized configuration for all security measures
 */

export interface SecurityConfig {
  headers: {
    enabled: boolean;
    csp: string;
    hsts: boolean;
    hstsMaxAge: number;
  };
  rateLimiting: {
    enabled: boolean;
    defaultLimit: number;
    defaultWindow: number;
  };
  bruteForce: {
    enabled: boolean;
    maxAttempts: number;
    lockoutDuration: number;
  };
  replayAttack: {
    enabled: boolean;
    nonceExpiry: number;
  };
  requestValidation: {
    enabled: boolean;
    maxPayloadSize: number;
    maxJsonDepth: number;
  };
  webhooks: {
    signatureValidation: boolean;
    timestampTolerance: number;
  };
  cors: {
    enabled: boolean;
    allowedOrigins: string[];
    credentials: boolean;
  };
  admin: {
    roleEnforcement: boolean;
    auditLogging: boolean;
  };
}

/**
 * Get security configuration from environment
 */
export function getSecurityConfig(): SecurityConfig {
  const env = process.env.NODE_ENV || 'development';

  return {
    headers: {
      enabled: process.env.SECURITY_HEADERS_ENABLED !== 'false',
      csp: process.env.CONTENT_SECURITY_POLICY || "default-src 'self'",
      hsts: env !== 'development',
      hstsMaxAge: parseInt(process.env.HSTS_MAX_AGE || '31536000', 10),
    },

    rateLimiting: {
      enabled: process.env.RATE_LIMITING_ENABLED !== 'false',
      defaultLimit: parseInt(process.env.RATE_LIMIT_DEFAULT || '100', 10),
      defaultWindow: parseInt(process.env.RATE_LIMIT_WINDOW || '60000', 10),
    },

    bruteForce: {
      enabled: process.env.BRUTE_FORCE_PROTECTION !== 'false',
      maxAttempts: parseInt(process.env.BRUTE_FORCE_MAX_ATTEMPTS || '5', 10),
      lockoutDuration: parseInt(process.env.BRUTE_FORCE_LOCKOUT || '1800000', 10), // 30 min
    },

    replayAttack: {
      enabled: process.env.REPLAY_ATTACK_PROTECTION !== 'false',
      nonceExpiry: parseInt(process.env.REPLAY_NONCE_EXPIRY || '3600000', 10), // 1 hour
    },

    requestValidation: {
      enabled: process.env.REQUEST_VALIDATION !== 'false',
      maxPayloadSize: parseInt(process.env.MAX_PAYLOAD_SIZE || '10485760', 10), // 10MB
      maxJsonDepth: parseInt(process.env.MAX_JSON_DEPTH || '20', 10),
    },

    webhooks: {
      signatureValidation: process.env.WEBHOOK_SIGNATURE_VALIDATION !== 'false',
      timestampTolerance: parseInt(process.env.WEBHOOK_TIMESTAMP_TOLERANCE || '300000', 10), // 5 min
    },

    cors: {
      enabled: process.env.CORS_ENABLED !== 'false',
      allowedOrigins: (process.env.CORS_ORIGINS || 'http://localhost:3000').split(','),
      credentials: process.env.CORS_CREDENTIALS !== 'false',
    },

    admin: {
      roleEnforcement: process.env.ADMIN_ROLE_ENFORCEMENT !== 'false',
      auditLogging: process.env.ADMIN_AUDIT_LOGGING !== 'false',
    },
  };
}

/**
 * Environment-specific security presets
 */
export const SECURITY_PRESETS = {
  development: {
    headersEnabled: true,
    rateLimitingEnabled: false,
    bruteForceEnabled: true,
    replayAttackEnabled: false,
    requestValidationEnabled: true,
  },

  staging: {
    headersEnabled: true,
    rateLimitingEnabled: true,
    bruteForceEnabled: true,
    replayAttackEnabled: true,
    requestValidationEnabled: true,
  },

  production: {
    headersEnabled: true,
    rateLimitingEnabled: true,
    bruteForceEnabled: true,
    replayAttackEnabled: true,
    requestValidationEnabled: true,
  },
};
