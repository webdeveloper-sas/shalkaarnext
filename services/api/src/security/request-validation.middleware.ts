import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { RequestValidationService } from '@shalkaar/security';
import { LoggerService } from '@shalkaar/logging';

/**
 * Request Validation Middleware
 * Validates and sanitizes all incoming requests
 */
@Injectable()
export class RequestValidationMiddleware implements NestMiddleware {
  constructor(
    private readonly validation: RequestValidationService,
    private readonly logger: LoggerService
  ) {}

  use(req: Request, res: Response, next: NextFunction): any {
    // Validate payload if present
    if (req.body && Object.keys(req.body).length > 0) {
      const validation = this.validation.validatePayload(req.body);

      if (!validation.valid) {
        this.logger.warn('Invalid request payload', {
          event: 'security.invalid_payload',
          reason: validation.error,
          path: req.path,
          userId: req.user?.id,
        });

        return res.status(400).json({
          statusCode: 400,
          message: 'Invalid request payload',
        });
      }
    }

    // Validate query parameters
    for (const [key, value] of Object.entries(req.query)) {
      if (typeof value === 'string') {
        if (!this.validation.validateJson(JSON.stringify({ [key]: value })).valid) {
          // Likely malformed query parameter
          this.logger.warn('Invalid query parameter', {
            event: 'security.invalid_query_param',
            key,
            path: req.path,
          });

          return res.status(400).json({
            statusCode: 400,
            message: `Invalid query parameter: ${key}`,
          });
        }
      }
    }

    // Validate specific headers
    const contentType = req.get('content-type');
    if (req.body && contentType && !contentType.includes('application/json')) {
      if (!req.path.includes('/upload') && !req.path.includes('/webhook')) {
        this.logger.warn('Unexpected content type', {
          event: 'security.unexpected_content_type',
          contentType,
          path: req.path,
        });

        return res.status(415).json({
          statusCode: 415,
          message: 'Unsupported Media Type',
        });
      }
    }

    next();
  }
}
