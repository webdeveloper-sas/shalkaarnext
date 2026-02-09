import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { Request, Response } from 'express';
import { LoggerService } from '@shalkaar/logging';
import { ErrorTrackingService } from '@shalkaar/logging';

/**
 * Global Error Tracking Interceptor
 * Catches all errors in the application and logs them with full context
 * Provides consistent error handling and tracking across all controllers
 */
@Injectable()
export class ErrorTrackingInterceptor implements NestInterceptor {
  constructor(
    private readonly logger: LoggerService,
    private readonly errorTracker: ErrorTrackingService
  ) {}

  intercept(
    context: ExecutionContext,
    next: CallHandler
  ): Observable<any> {
    const request = context.switchToHttp().getRequest<Request>();
    const response = context.switchToHttp().getResponse<Response>();

    return next.handle().pipe(
      tap((_data) => {
        // Success - log if needed
        if (response.statusCode >= 400) {
          this.logger.info(`Response with status ${response.statusCode}`, {
            method: request.method,
            path: request.path,
            statusCode: response.statusCode,
          });
        }
      }),
      catchError((error: any) => {
        return this.handleError(error, request, response, context);
      })
    );
  }

  /**
   * Handle errors with tracking
   */
  private handleError(
    error: any,
    request: Request,
    _response: Response,
    context: ExecutionContext
  ): Observable<never> {
    const requestId = request.headers['x-request-id'] as string;
    const userId = (request.user as any)?.id;

    // Extract relevant error information
    const errorName = error?.name || 'UnknownError';
    // Not currently used but kept for future tracking enhancements
    void (error?.message || String(error));
    const statusCode = error?.status || HttpStatus.INTERNAL_SERVER_ERROR;

    // Capture error with context
    const errorId = this.errorTracker.captureError(
      error,
      {
        requestId,
        userId,
        method: request.method,
        path: request.path,
        action: context.getHandler().name,
        resource: context.getClass().name,
      },
      this.getErrorTags(error)
    );

    // Log the error
    this.logger.error(
      `Error in ${request.method} ${request.path}`,
      {
        errorId,
        errorName,
        statusCode,
        requestId,
        userId,
        action: context.getHandler().name,
        controller: context.getClass().name,
      },
      error
    );

    // If already an HTTP exception, re-throw it
    if (error instanceof HttpException) {
      return throwError(() => error);
    }

    // Create HTTP exception with error tracking ID
    const httpException = new HttpException(
      {
        statusCode,
        message: this.getPublicErrorMessage(error, statusCode),
        errorId, // Include tracking ID in response
        timestamp: new Date().toISOString(),
      },
      statusCode
    );

    return throwError(() => httpException);
  }

  /**
   * Get public error message (don't expose internal details)
   */
  private getPublicErrorMessage(error: any, statusCode: number): string {
    if (statusCode === HttpStatus.NOT_FOUND) {
      return 'Resource not found';
    }

    if (statusCode === HttpStatus.UNAUTHORIZED) {
      return 'Unauthorized access';
    }

    if (statusCode === HttpStatus.FORBIDDEN) {
      return 'Access denied';
    }

    if (statusCode === HttpStatus.BAD_REQUEST) {
      return error.message || 'Invalid request';
    }

    if (statusCode === HttpStatus.CONFLICT) {
      return error.message || 'Resource conflict';
    }

    if (statusCode === HttpStatus.UNPROCESSABLE_ENTITY) {
      return error.message || 'Unable to process request';
    }

    if (statusCode === HttpStatus.TOO_MANY_REQUESTS) {
      return 'Too many requests, please try again later';
    }

    if (statusCode >= HttpStatus.INTERNAL_SERVER_ERROR) {
      return 'Internal server error. Please contact support with error ID: ' + error.id;
    }

    return 'An error occurred processing your request';
  }

  /**
   * Generate tags for error tracking
   */
  private getErrorTags(error: any): string[] {
    const tags: string[] = [];

    const name = String(error?.name || '').toLowerCase();
    const message = String(error?.message || '').toLowerCase();
    const stack = String(error?.stack || '').toLowerCase();
    const statusCode = error?.status || 500;

    // Categorize error
    if (name.includes('validationerror') || message.includes('validation')) {
      tags.push('validation');
    }

    if (name.includes('notfounderror') || message.includes('not found')) {
      tags.push('not-found');
    }

    if (
      name.includes('unauthorizederror') ||
      message.includes('unauthorized')
    ) {
      tags.push('auth');
    }

    if (
      name.includes('databaseerror') ||
      name.includes('queryerror') ||
      message.includes('database')
    ) {
      tags.push('database');
    }

    if (message.includes('payment') || message.includes('stripe')) {
      tags.push('payment');
    }

    if (message.includes('timeout')) {
      tags.push('timeout');
    }

    if (message.includes('connection')) {
      tags.push('connection');
    }

    if (stack.includes('at stripe')) {
      tags.push('external-api');
    }

    // Add status code category
    if (statusCode >= 500) {
      tags.push('server-error');
    } else if (statusCode >= 400) {
      tags.push('client-error');
    }

    return tags;
  }
}
