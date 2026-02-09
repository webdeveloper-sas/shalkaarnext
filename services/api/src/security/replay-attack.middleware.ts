import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { ReplayAttackProtectionService } from '@shalkaar/security';
import { LoggerService } from '@shalkaar/logging';
import * as crypto from 'crypto';

/**
 * Replay Attack Prevention Middleware
 * Detects and prevents replay attacks using nonces and request hashing
 */
@Injectable()
export class ReplayAttackPreventionMiddleware implements NestMiddleware {
  constructor(
    private readonly replayProtection: ReplayAttackProtectionService,
    private readonly logger: LoggerService
  ) {}

  use(req: Request, res: Response, next: NextFunction): void {
    // Only apply to sensitive endpoints
    if (!this.isSensitiveEndpoint(req.path)) {
      return next();
    }

    // Get nonce and timestamp from headers
    const nonce = req.headers['x-request-nonce'] as string;
    const timestamp = req.headers['x-request-timestamp'] as string;

    // Validate freshness
    if (nonce && timestamp) {
      const timestampMs = parseInt(timestamp, 10);

      const freshness = this.replayProtection.validateFreshness(nonce, timestampMs);

      if (!freshness.valid) {
        this.logger.warn('Replay attack detected', {
          event: 'security.replay_attack.invalid_freshness',
          reason: freshness.reason,
          nonce: nonce.substring(0, 16) + '...',
          path: req.path,
        });

        res.status(400).json({
          statusCode: 400,
          message: 'Invalid or expired request',
        });
        return;
      }
    }

    // Check for duplicate requests
    const requestHash = this.hashRequest(req);
    const identifier = (req as any).user?.id || req.ip || 'unknown';

    const duplicate = this.replayProtection.detectDuplicate(identifier, requestHash);

    if (duplicate.isDuplicate && !duplicate.allowed) {
      this.logger.warn('Duplicate request limit exceeded', {
        event: 'security.replay_attack.duplicate_limit',
        identifier,
        path: req.path,
        count: duplicate.count,
      });

      res.status(429).json({
        statusCode: 429,
        message: 'Duplicate request detected',
      });
      return;
    }

    // Provide nonce for next request
    const nextNonce = this.replayProtection.generateNonce();
    const nonceExpiry = this.replayProtection.getNonceExpiry();

    res.setHeader('X-Request-Nonce', nextNonce);
    res.setHeader('X-Nonce-Expiry', nonceExpiry.toISOString());

    next();
  }

  /**
   * Check if endpoint is sensitive
   */
  private isSensitiveEndpoint(path: string): boolean {
    const sensitivePatterns = [
      '/api/payments',
      '/api/checkout',
      '/api/orders',
      '/api/admin',
      '/api/users/profile',
    ];

    return sensitivePatterns.some(pattern => path.startsWith(pattern));
  }

  /**
   * Hash request for duplicate detection
   */
  private hashRequest(req: Request): string {
    const data = {
      method: req.method,
      path: req.path,
      body: req.body,
      user: req.user?.id,
    };

    return crypto.createHash('sha256').update(JSON.stringify(data)).digest('hex');
  }
}
