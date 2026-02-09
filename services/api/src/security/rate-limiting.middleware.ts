import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { RateLimiterService } from '@shalkaar/security';
import { LoggerService } from '@shalkaar/logging';

/**
 * Rate Limiting Middleware
 * Applies rate limits based on endpoint and user/IP
 */
@Injectable()
export class RateLimitingMiddleware implements NestMiddleware {
  private rateLimitMap: Map<string, string> = new Map([
    ['/api/auth/login', 'auth'],
    ['/api/auth/register', 'auth'],
    ['/api/auth/password-reset', 'auth'],
    ['/api/auth/password-reset-confirm', 'auth'],
    ['/api/payments/process', 'payment'],
    ['/api/payments/charge', 'payment'],
    ['/api/payments/refund', 'payment'],
    ['/api/webhooks/stripe', 'webhook'],
    ['/api/webhooks/payment', 'webhook'],
    ['/api/checkout', 'checkout'],
    ['/api/orders', 'api'],
  ]);

  constructor(
    private readonly rateLimiter: RateLimiterService,
    private readonly logger: LoggerService
  ) {}

  use(req: Request, res: Response, next: NextFunction): void {
    // Get rate limit preset for this path
    const preset = this.getPreset(req.path);

    if (!preset) {
      // No rate limit configured for this path
      return next();
    }

    // Determine identifier (user ID or IP)
    const identifier = (req as any).user?.id || req.ip || 'unknown';

    // Check rate limit
    const { allowed, info } = this.rateLimiter.isWithinLimit(identifier, preset as any);

    // Add rate limit headers
    res.setHeader('X-RateLimit-Limit', info.limit);
    res.setHeader('X-RateLimit-Remaining', info.remaining);
    res.setHeader('X-RateLimit-Reset', new Date(info.resetTime).toISOString());

    if (!allowed) {
      this.logger.warn('Rate limit exceeded', {
        event: 'security.rate_limit_exceeded',
        identifier,
        preset,
        endpoint: req.path,
        ipAddress: req.ip,
      });

      res.status(429).json({
        statusCode: 429,
        message: 'Too many requests, please try again later',
        retryAfter: Math.ceil((info.resetTime - Date.now()) / 1000),
      });
      return;
    }

    next();
  }

  /**
   * Get rate limit preset for endpoint
   */
  private getPreset(
    path: string
  ): string | null {
    // Exact match
    if (this.rateLimitMap.has(path)) {
      return this.rateLimitMap.get(path)!;
    }

    // Prefix match
    for (const [route, preset] of this.rateLimitMap.entries()) {
      if (path.startsWith(route)) {
        return preset;
      }
    }

    return null;
  }
}
