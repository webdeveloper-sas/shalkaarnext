import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { LoggerService } from '@shalkaar/logging';
import { ErrorTrackingService } from '@shalkaar/logging';
import { v4 as uuidv4 } from 'uuid';

/**
 * Request Logging Middleware
 * Logs all HTTP requests with timing, response status, and relevant metadata
 * Automatically masks sensitive information
 */
@Injectable()
export class RequestLoggerMiddleware implements NestMiddleware {
  constructor(
    private readonly logger: LoggerService,
    private readonly errorTracker: ErrorTrackingService
  ) {}

  use(req: Request, res: Response, next: NextFunction): void {
    const startTime = Date.now();
    const requestId = req.headers['x-request-id'] as string || uuidv4();
    const correlationId = req.headers['x-correlation-id'] as string;

    // Set context for this request
    this.logger.setContext({
      requestId,
      correlationId,
      method: req.method,
      path: req.path,
    });

    this.errorTracker.addBreadcrumb(
      `${req.method} ${req.path}`,
      'http.request',
      'info'
    );

    // Store request ID in response headers
    res.setHeader('X-Request-ID', requestId);

    // Capture original end function
    const originalEnd = res.end;
    let responseBody = '';

    // Intercept response data
    res.write = ((chunk: any) => {
      responseBody += chunk;
      return res.constructor.prototype.write.call(res, chunk);
    }) as any;

    res.end = function (chunk?: any, ...args: any[]) {
      if (chunk) responseBody += chunk;

      const duration = Date.now() - startTime;
      const statusCode = res.statusCode;

      // Log the request
      this.logRequest(
        req,
        res,
        duration,
        statusCode,
        requestId,
        correlationId
      );

      // Add breadcrumb for response
      this.errorTracker.addBreadcrumb(
        `Response: ${statusCode}`,
        'http.response',
        statusCode >= 400 ? 'error' : 'info',
        { duration, statusCode }
      );

      // Call original end
      originalEnd.call(res, chunk, ...args);
    }.bind(this);

    next();
  }
}
