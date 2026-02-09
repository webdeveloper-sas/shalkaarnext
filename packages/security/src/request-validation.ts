import { Injectable } from '@nestjs/common';
import { LoggerService } from '@shalkaar/logging';

/**
 * Request Validation & Sanitization
 * Prevents:
 * - Malformed payloads
 * - Oversized requests
 * - Invalid data types
 * - Injection attacks
 */
@Injectable()
export class RequestValidationService {
  private readonly config = {
    maxPayloadSize: 10 * 1024 * 1024, // 10MB
    maxJsonDepth: 20,
    maxArrayLength: 10000,
    maxStringLength: 1000000, // 1MB
    blacklistedPaths: ['__proto__', 'constructor', 'prototype'],
  };

  constructor(private readonly logger: LoggerService) {}

  /**
   * Validate request payload
   */
  validatePayload(payload: any, maxSize?: number): { valid: boolean; error?: string } {
    const size = maxSize || this.config.maxPayloadSize;

    // Check payload size
    const payloadString = JSON.stringify(payload);
    if (payloadString.length > size) {
      return {
        valid: false,
        error: `Payload exceeds maximum size of ${size} bytes`,
      };
    }

    // Check for suspicious patterns
    const check = this.checkForSuspiciousPatterns(payload);
    if (!check.valid) {
      return check;
    }

    // Check for prototype pollution
    const protCheck = this.checkForPrototypePollution(payload);
    if (!protCheck.valid) {
      return protCheck;
    }

    return { valid: true };
  }

  /**
   * Sanitize user input
   */
  sanitizeInput(input: string): string {
    if (typeof input !== 'string') return input;

    // Remove null bytes
    let sanitized = input.replace(/\0/g, '');

    // Escape HTML special characters
    sanitized = sanitized
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
      .replace(/\//g, '&#x2F;');

    return sanitized;
  }

  /**
   * Validate email format
   */
  validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email) && email.length <= 254;
  }

  /**
   * Validate URL
   */
  validateUrl(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Validate JSON structure
   */
  validateJson(json: string): { valid: boolean; error?: string; data?: any } {
    try {
      const data = JSON.parse(json);

      // Check depth
      if (this.getObjectDepth(data) > this.config.maxJsonDepth) {
        return {
          valid: false,
          error: `JSON depth exceeds maximum of ${this.config.maxJsonDepth}`,
        };
      }

      return { valid: true, data };
    } catch (error) {
      return {
        valid: false,
        error: 'Invalid JSON format',
      };
    }
  }

  /**
   * Check for suspicious patterns
   */
  private checkForSuspiciousPatterns(obj: any, depth = 0): { valid: boolean; error?: string } {
    if (depth > this.config.maxJsonDepth) {
      return {
        valid: false,
        error: `Object nesting too deep (max: ${this.config.maxJsonDepth})`,
      };
    }

    if (Array.isArray(obj)) {
      if (obj.length > this.config.maxArrayLength) {
        return {
          valid: false,
          error: `Array length exceeds maximum of ${this.config.maxArrayLength}`,
        };
      }

      for (const item of obj) {
        if (typeof item === 'object') {
          const check = this.checkForSuspiciousPatterns(item, depth + 1);
          if (!check.valid) return check;
        }
      }
    } else if (typeof obj === 'object' && obj !== null) {
      for (const [_key, _value] of Object.entries(obj)) {
        if (typeof _value === 'string' && _value.length > this.config.maxStringLength) {
          return {
            valid: false,
            error: `String value exceeds maximum length of ${this.config.maxStringLength}`,
          };
        }

        if (typeof _value === 'object') {
          const check = this.checkForSuspiciousPatterns(_value, depth + 1);
          if (!check.valid) return check;
        }
      }
    }

    return { valid: true };
  }

  /**
   * Check for prototype pollution attacks
   */
  private checkForPrototypePollution(obj: any): { valid: boolean; error?: string } {
    if (typeof obj !== 'object' || obj === null) {
      return { valid: true };
    }

    for (const key of Object.keys(obj)) {
      if (this.config.blacklistedPaths.includes(key)) {
        this.logger.error('Prototype pollution attempt detected', {
          event: 'security.prototype_pollution',
          key,
        });

        return {
          valid: false,
          error: 'Invalid object key detected',
        };
      }

      if (typeof obj[key] === 'object' && obj[key] !== null) {
        const check = this.checkForPrototypePollution(obj[key]);
        if (!check.valid) return check;
      }
    }

    return { valid: true };
  }

  /**
   * Get object depth
   */
  private getObjectDepth(obj: any): number {
    if (typeof obj !== 'object' || obj === null) return 0;

    let maxDepth = 0;

    if (Array.isArray(obj)) {
      for (const item of obj) {
        maxDepth = Math.max(maxDepth, this.getObjectDepth(item));
      }
    } else {
      for (const value of Object.values(obj)) {
        maxDepth = Math.max(maxDepth, this.getObjectDepth(value));
      }
    }

    return maxDepth + 1;
  }
}
// Export default configuration
export const REQUEST_VALIDATION_CONFIG = {
  maxPayloadSize: 10 * 1024 * 1024, // 10MB
  maxObjectDepth: 20,
  blacklistedPaths: ['__proto__', 'constructor', 'prototype'],
} as const;