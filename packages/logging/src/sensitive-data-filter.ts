import { Injectable } from '@nestjs/common';

/**
 * Sensitive Data Filter
 * Masks PII and sensitive information to prevent accidental logging
 * of confidential data like passwords, tokens, credit cards, etc.
 */
@Injectable()
export class SensitiveDataFilter {
  // Patterns for detecting sensitive data
  private readonly patterns = {
    // Credit card numbers (16 digits, common formats)
    creditCard: /\b\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}\b/g,
    // Common password patterns
    password: /(['"]?password['"]?\s*[:=]\s*)(['"][^'"]*['"]|[^\s,}]*)(?=[,}\s])/gi,
    // API keys and tokens
    apiKey: /(['"]?(?:api[_-]?key|secret|token|auth)['"]?\s*[:=]\s*)(['"][^'"]*['"]|[^\s,}]*)(?=[,}\s])/gi,
    // Bearer tokens
    bearerToken: /Bearer\s+([A-Za-z0-9._-]+)/g,
    // JWT tokens
    jwtToken: /eyJ[A-Za-z0-9_-]+\.eyJ[A-Za-z0-9_-]+\.([A-Za-z0-9_-]+)/g,
    // Email addresses
    email: /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g,
    // Social security numbers (XXX-XX-XXXX)
    ssn: /\b\d{3}-\d{2}-\d{4}\b/g,
    // Phone numbers
    phone: /\b(?:\+?1[-.\s]?)?\(?[2-9]\d{2}[-.\s]?\d{3}[-.\s]?\d{4}\b/g,
    // IPv4 addresses (for privacy)
    ipv4: /\b(?:\d{1,3}\.){3}\d{1,3}\b/g,
  };

  // Keys that should have their values masked
  private readonly keywordPatterns = [
    'password',
    'pwd',
    'secret',
    'token',
    'api_key',
    'apiKey',
    'apiSecret',
    'api_secret',
    'stripe_key',
    'stripe_secret',
    'stripe_token',
    'access_token',
    'refresh_token',
    'auth_token',
    'session_id',
    'sessionId',
    'credit_card',
    'creditCard',
    'card_number',
    'cardNumber',
    'cvv',
    'cvc',
    'pin',
    'ssn',
    'social_security',
    'privateKey',
    'private_key',
    'certificate',
    'oauth_token',
    'bearer_token',
    'jwt',
    'jwk',
  ];

  /**
   * Mask sensitive data in an object
   */
  maskObject(obj: any, depth = 0): any {
    if (depth > 10) return '[CIRCULAR]'; // Prevent infinite recursion

    if (obj === null || obj === undefined) return obj;
    if (typeof obj !== 'object') return this.maskValue(String(obj));

    if (Array.isArray(obj)) {
      return obj.map((item) => this.maskObject(item, depth + 1));
    }

    const masked: any = {};
    for (const [key, value] of Object.entries(obj)) {
      if (this.isSensitiveKey(key)) {
        masked[key] = this.maskValue(String(value));
      } else if (typeof value === 'object') {
        masked[key] = this.maskObject(value, depth + 1);
      } else {
        masked[key] = value;
      }
    }
    return masked;
  }

  /**
   * Mask sensitive data in a string
   */
  maskString(str: string): string {
    if (typeof str !== 'string') return str;

    let result = str;

    // Mask credit card numbers
    result = result.replace(this.patterns.creditCard, (match) => {
      const digits = match.replace(/\D/g, '');
      if (digits.length === 16) {
        return `****-****-****-${digits.slice(-4)}`;
      }
      return match;
    });

    // Mask passwords
    result = result.replace(this.patterns.password, '$1[REDACTED]');

    // Mask API keys and tokens
    result = result.replace(this.patterns.apiKey, '$1[REDACTED]');

    // Mask bearer tokens (keep first 4 chars)
    result = result.replace(this.patterns.bearerToken, (match) => {
      const token = match.replace('Bearer ', '');
      return `Bearer ${token.substring(0, 4)}[REDACTED]`;
    });

    // Mask JWT tokens
    result = result.replace(this.patterns.jwtToken, (match) => {
      const parts = match.split('.');
      if (parts.length === 3) {
        return `${parts[0].substring(0, 4)}[REDACTED].${parts[1].substring(0, 4)}[REDACTED].${parts[2].substring(0, 4)}[REDACTED]`;
      }
      return match;
    });

    // Mask emails (keep domain)
    result = result.replace(this.patterns.email, (email) => {
      const [local, domain] = email.split('@');
      return `${local.substring(0, 2)}***@${domain}`;
    });

    // Mask SSN
    result = result.replace(this.patterns.ssn, 'XXX-XX-XXXX');

    // Mask phone numbers
    result = result.replace(this.patterns.phone, '[PHONE]');

    // Mask IPv4 (optional, uncomment if needed)
    // result = result.replace(this.patterns.ipv4, '[IP]');

    return result;
  }

  /**
   * Check if a key is sensitive
   */
  private isSensitiveKey(key: string): boolean {
    const lowerKey = key.toLowerCase();
    return this.keywordPatterns.some((pattern) => lowerKey.includes(pattern));
  }

  /**
   * Mask a single value
   */
  private maskValue(value: string): string {
    if (typeof value !== 'string' || value.length === 0) return '[REDACTED]';

    // For very short strings, just redact
    if (value.length <= 4) return '[REDACTED]';

    // For longer strings, show first 4 chars
    return `${value.substring(0, 4)}[REDACTED]`;
  }

  /**
   * Extract and redact query parameters from a URL
   */
  maskUrl(url: string): string {
    try {
      const urlObj = new URL(url);
      const sensitiveParams = ['token', 'key', 'api_key', 'secret', 'password', 'auth'];

      for (const param of sensitiveParams) {
        if (urlObj.searchParams.has(param)) {
          const value = urlObj.searchParams.get(param);
          if (value) {
            urlObj.searchParams.set(param, `[REDACTED]`);
          }
        }
      }

      return urlObj.toString();
    } catch (error) {
      // If not a valid URL, try regex masking
      return this.maskString(url);
    }
  }

  /**
   * Mask request headers (remove sensitive headers entirely or mask values)
   */
  maskHeaders(headers: Record<string, any>): Record<string, any> {
    const sensitiveHeaders = [
      'authorization',
      'x-api-key',
      'x-access-token',
      'x-auth-token',
      'cookie',
      'x-csrf-token',
      'x-stripe-signature',
    ];

    const masked: Record<string, any> = {};

    for (const [key, value] of Object.entries(headers)) {
      const lowerKey = key.toLowerCase();
      if (sensitiveHeaders.includes(lowerKey)) {
        masked[key] = '[REDACTED]';
      } else {
        masked[key] = value;
      }
    }

    return masked;
  }

  /**
   * Check if a string contains sensitive data
   */
  hasSensitiveData(str: string): boolean {
    if (typeof str !== 'string') return false;

    return (
      this.patterns.creditCard.test(str) ||
      this.patterns.password.test(str) ||
      this.patterns.apiKey.test(str) ||
      this.patterns.bearerToken.test(str) ||
      this.patterns.jwtToken.test(str) ||
      this.patterns.ssn.test(str)
    );
  }
}
