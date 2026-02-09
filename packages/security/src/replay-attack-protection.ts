import { Injectable } from '@nestjs/common';
import { LoggerService } from '@shalkaar/logging';

/**
 * Replay Attack Prevention
 * Prevents attackers from replaying captured requests by:
 * - Tracking request nonces
 * - Validating timestamps
 * - Detecting duplicate requests
 */
@Injectable()
export class ReplayAttackProtectionService {
  private usedNonces: Map<string, number> = new Map();
  private requestHashes: Map<string, { timestamp: number; count: number }> = new Map();

  private readonly config = {
    nonceExpiryMs: 60 * 60 * 1000, // 1 hour
    timestampToleranceMs: 5 * 60 * 1000, // 5 minutes
    maxDuplicateRequests: 3, // Allow same request 3 times (in case of retries)
    maxDuplicateWindow: 5 * 60 * 1000, // 5 minute window
  };

  constructor(private readonly logger: LoggerService) {
    // Cleanup every 30 minutes
    setInterval(() => this.cleanup(), 30 * 60 * 1000);
  }

  /**
   * Validate request freshness
   * Prevents replay by checking timestamp and nonce
   */
  validateFreshness(
    nonce: string,
    timestamp: number
  ): {
    valid: boolean;
    reason?: string;
  } {
    const now = Date.now();

    // Check timestamp tolerance
    if (Math.abs(now - timestamp) > this.config.timestampToleranceMs) {
      return {
        valid: false,
        reason: 'Request timestamp too old',
      };
    }

    // Check if nonce was already used (replay attack)
    if (this.usedNonces.has(nonce)) {
      this.logger.error('Replay attack detected - nonce reuse', {
        event: 'security.replay_attack.nonce_reuse',
        nonce: nonce.substring(0, 16) + '...',
      });

      return {
        valid: false,
        reason: 'Nonce already used',
      };
    }

    // Record nonce as used
    this.usedNonces.set(nonce, now);

    return { valid: true };
  }

  /**
   * Detect duplicate requests
   */
  detectDuplicate(
    identifier: string,
    requestHash: string
  ): {
    isDuplicate: boolean;
    count: number;
    allowed: boolean;
  } {
    const now = Date.now();
    const key = `${identifier}:${requestHash}`;

    // Get or create entry
    const entry = this.requestHashes.get(key) || {
      timestamp: now,
      count: 0,
    };

    // Reset if window expired
    if (now - entry.timestamp > this.config.maxDuplicateWindow) {
      entry.timestamp = now;
      entry.count = 0;
    }

    entry.count++;
    this.requestHashes.set(key, entry);

    const isDuplicate = entry.count > 1;
    const allowed = entry.count <= this.config.maxDuplicateRequests;

    if (isDuplicate && !allowed) {
      this.logger.warn('Duplicate request limit exceeded', {
        event: 'security.duplicate_request.limit_exceeded',
        identifier,
        requestHash: requestHash.substring(0, 16) + '...',
        count: entry.count,
        limit: this.config.maxDuplicateRequests,
      });
    }

    return { isDuplicate, count: entry.count, allowed };
  }

  /**
   * Generate a nonce for the client
   */
  generateNonce(): string {
    return `${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
  }

  /**
   * Get nonce expiry
   */
  getNonceExpiry(): Date {
    return new Date(Date.now() + this.config.nonceExpiryMs);
  }

  /**
   * Cleanup expired nonces and hashes
   */
  private cleanup(): void {
    const now = Date.now();

    // Cleanup used nonces
    for (const [nonce, timestamp] of this.usedNonces.entries()) {
      if (now - timestamp > this.config.nonceExpiryMs) {
        this.usedNonces.delete(nonce);
      }
    }

    // Cleanup request hashes
    for (const [key, entry] of this.requestHashes.entries()) {
      if (now - entry.timestamp > this.config.maxDuplicateWindow) {
        this.requestHashes.delete(key);
      }
    }
  }

  /**
   * Get metrics
   */
  getMetrics(): {
    activeNonces: number;
    trackedRequests: number;
  } {
    return {
      activeNonces: this.usedNonces.size,
      trackedRequests: this.requestHashes.size,
    };
  }
}
// Export default configuration
export const REPLAY_ATTACK_CONFIG = {
  nonceTtlMs: 5 * 60 * 1000,
  maxDuplicateWindow: 60 * 1000,
  duplicateLimit: 5,
} as const;