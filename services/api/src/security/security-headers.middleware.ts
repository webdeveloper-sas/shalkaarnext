import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

/**
 * HTTP Security Headers Middleware
 * Enforces security headers to protect against common web vulnerabilities
 */
@Injectable()
export class SecurityHeadersMiddleware implements NestMiddleware {
  use(_req: Request, res: Response, next: NextFunction): void {
    const isDevelopment = process.env.NODE_ENV === 'development';

    // Content Security Policy - prevents XSS and injection attacks
    res.setHeader(
      'Content-Security-Policy',
      isDevelopment
        ? "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline';"
        : "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self'; connect-src 'self'; frame-ancestors 'none';"
    );

    // X-Content-Type-Options - prevents MIME type sniffing
    res.setHeader('X-Content-Type-Options', 'nosniff');

    // X-Frame-Options - prevents clickjacking
    res.setHeader('X-Frame-Options', 'DENY');

    // X-XSS-Protection - enables browser XSS protection (legacy)
    res.setHeader('X-XSS-Protection', '1; mode=block');

    // Referrer-Policy - controls referrer information
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');

    // Permissions-Policy (formerly Feature-Policy) - restrict browser features
    res.setHeader(
      'Permissions-Policy',
      'geolocation=(), microphone=(), camera=(), payment=(), usb=(), magnetometer=(), gyroscope=(), accelerometer=()'
    );

    // Strict-Transport-Security - enforce HTTPS
    if (!isDevelopment) {
      res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
    }

    // Remove X-Powered-By header (don't advertise tech stack)
    res.removeHeader('X-Powered-By');

    next();
  }
}
