import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { BruteForceProtectionService } from '@shalkaar/security';
import { LoggerService } from '@shalkaar/logging';

/**
 * Brute Force Protection Middleware
 * Prevents brute force attacks on sensitive endpoints
 */
@Injectable()
export class BruteForceProtectionMiddleware implements NestMiddleware {
  constructor(
    private readonly bruteForceProtection: BruteForceProtectionService,
    private readonly logger: LoggerService
  ) {}

  use(req: Request, res: Response, next: NextFunction): void {
    // Only apply to login and password reset endpoints
    if (!req.path.includes('/auth/login') && !req.path.includes('/auth/password-reset')) {
      return next();
    }

    const identifier = this.extractIdentifier(req);
    const ipAddress = req.ip || 'unknown';

    // Check if account is locked
    if (this.bruteForceProtection.isAccountLocked(identifier)) {
      this.logger.warn('Locked account login attempt', {
        event: 'security.brute_force.locked_account_attempt',
        identifier,
        ipAddress,
      });

      res.status(429).json({
        statusCode: 429,
        message: 'Account is temporarily locked due to multiple failed login attempts',
        retryAfter: 'Please try again in 30 minutes',
      });
      return;
    }

    // Check if IP is blocked
    if (this.bruteForceProtection.isIpBlocked(ipAddress)) {
      this.logger.error('Blocked IP login attempt', {
        event: 'security.brute_force.blocked_ip_attempt',
        ipAddress,
      });

      res.status(403).json({
        statusCode: 403,
        message: 'Access denied',
      });
      return;
    }

    // Intercept response to track success/failure
    const originalJson = res.json.bind(res);
    const bruteForceProtection = this.bruteForceProtection;
    res.json = function (data: any) {
      if (res.statusCode === 200 || res.statusCode === 201) {
        // Success
        bruteForceProtection.recordSuccessfulLogin(identifier);
      } else if (res.statusCode === 401 || res.statusCode === 400) {
        // Failed attempt
        const result = bruteForceProtection.recordFailedAttempt(
          identifier,
          ipAddress,
          data?.message || 'Login failed'
        );

        if (result.locked) {
          return originalJson({
            statusCode: 429,
            message: 'Account locked due to multiple failed attempts',
            lockedUntil: result.lockoutUntil,
          });
        }
      }

      return originalJson(data);
    };

    next();
  }

  /**
   * Extract identifier from request (email, username, etc.)
   */
  private extractIdentifier(req: Request): string {
    const body = req.body as any;
    return body?.email || body?.username || body?.userId || 'unknown';
  }
}
