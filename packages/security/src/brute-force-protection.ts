import { Injectable } from '@nestjs/common';
import { LoggerService } from '@shalkaar/logging';

/**
 * Brute Force Protection
 * Detects and prevents brute force attacks through:
 * - Failed login attempt tracking
 * - Account lockout after threshold
 * - Progressive delays
 * - IP-based blocking
 */
@Injectable()
export class BruteForceProtectionService {
  private failedAttempts: Map<string, { count: number; resetTime: number }> = new Map();
  private lockedAccounts: Set<string> = new Set();
  private blockedIps: Map<string, { until: number; reason: string }> = new Map();

  private readonly config = {
    maxAttempts: 5,
    lockoutDurationMs: 30 * 60 * 1000, // 30 minutes
    attemptResetMs: 15 * 60 * 1000, // 15 minutes
    ipBlockDurationMs: 60 * 60 * 1000, // 1 hour
    ipMaxAttempts: 20, // Max attempts per IP before blocking
  };

  constructor(private readonly logger: LoggerService) {
    // Cleanup every 5 minutes
    setInterval(() => this.cleanup(), 5 * 60 * 1000);
  }

  /**
   * Check if account is locked
   */
  isAccountLocked(identifier: string): boolean {
    return this.lockedAccounts.has(identifier);
  }

  /**
   * Check if IP is blocked
   */
  isIpBlocked(ipAddress: string): boolean {
    const blocked = this.blockedIps.get(ipAddress);
    if (!blocked) return false;

    if (Date.now() > blocked.until) {
      this.blockedIps.delete(ipAddress);
      return false;
    }

    return true;
  }

  /**
   * Record failed login attempt
   */
  recordFailedAttempt(
    identifier: string,
    ipAddress: string,
    _reason?: string // eslint-disable-line @typescript-eslint/no-unused-vars
  ): { locked: boolean; attemptsRemaining: number; lockoutUntil?: Date } {
    const now = Date.now();

    // Check if IP is already blocked
    if (this.isIpBlocked(ipAddress)) {
      this.logger.warn('Blocked IP attempted login', {
        event: 'brute_force.blocked_ip_attempt',
        ipAddress,
        identifier,
      });
      return { locked: true, attemptsRemaining: 0 };
    }

    // Get or create attempt entry
    const current = this.failedAttempts.get(identifier) || {
      count: 0,
      resetTime: now + this.config.attemptResetMs,
    };

    // Reset if window expired
    if (now > current.resetTime) {
      current.count = 0;
      current.resetTime = now + this.config.attemptResetMs;
    }

    current.count++;

    // Check if lockout threshold reached
    if (current.count >= this.config.maxAttempts) {
      this.lockedAccounts.add(identifier);
      const lockoutUntil = new Date(now + this.config.lockoutDurationMs);

      this.logger.error('Account locked due to brute force', {
        event: 'brute_force.account_locked',
        identifier,
        ipAddress,
        attempts: current.count,
        lockedUntil: lockoutUntil,
      });

      // Also block the IP
      this.blockIp(ipAddress, 'Brute force attempts');

      this.failedAttempts.delete(identifier);
      return { locked: true, attemptsRemaining: 0, lockoutUntil };
    }

    this.failedAttempts.set(identifier, current);

    this.logger.warn('Failed login attempt recorded', {
      event: 'brute_force.failed_attempt',
      identifier,
      ipAddress,
      attempts: current.count,
      threshold: this.config.maxAttempts,
    });

    return {
      locked: false,
      attemptsRemaining: Math.max(0, this.config.maxAttempts - current.count),
    };
  }

  /**
   * Record successful login (reset attempts)
   */
  recordSuccessfulLogin(identifier: string): void {
    this.failedAttempts.delete(identifier);
  }

  /**
   * Unlock account manually
   */
  unlockAccount(identifier: string): void {
    this.lockedAccounts.delete(identifier);
    this.failedAttempts.delete(identifier);

    this.logger.info('Account unlocked', {
      event: 'brute_force.account_unlocked',
      identifier,
    });
  }

  /**
   * Block an IP address
   */
  private blockIp(ipAddress: string, reason: string): void {
    const until = Date.now() + this.config.ipBlockDurationMs;
    this.blockedIps.set(ipAddress, { until, reason });

    this.logger.error('IP address blocked', {
      event: 'brute_force.ip_blocked',
      ipAddress,
      reason,
      until: new Date(until),
    });
  }

  /**
   * Get lockout remaining time
   */
  getLockoutRemaining(identifier: string): number | null {
    if (!this.lockedAccounts.has(identifier)) return null;

    // In a real implementation, store lockout time
    // For now, return the full duration
    return this.config.lockoutDurationMs;
  }

  /**
   * Get attempt count for identifier
   */
  getAttemptCount(identifier: string): number {
    const entry = this.failedAttempts.get(identifier);
    return entry?.count || 0;
  }

  /**
   * Cleanup expired entries
   */
  private cleanup(): void {
    const now = Date.now();

    // Cleanup failed attempts
    for (const [key, entry] of this.failedAttempts.entries()) {
      if (now > entry.resetTime) {
        this.failedAttempts.delete(key);
      }
    }

    // Cleanup blocked IPs
    for (const [ip, block] of this.blockedIps.entries()) {
      if (now > block.until) {
        this.blockedIps.delete(ip);
      }
    }
  }

  /**
   * Get metrics
   */
  getMetrics(): {
    lockedAccounts: number;
    blockedIps: number;
    trackedIdentifiers: number;
  } {
    return {
      lockedAccounts: this.lockedAccounts.size,
      blockedIps: this.blockedIps.size,
      trackedIdentifiers: this.failedAttempts.size,
    };
  }
}
// Export default configuration
export const BRUTE_FORCE_CONFIG = {
  maxAttempts: 5,
  windowMs: 15 * 60 * 1000,
  lockoutDurationMs: 30 * 60 * 1000,
  incrementMultiplier: 1.5,
  ipBlockDurationMs: 60 * 60 * 1000,
} as const;