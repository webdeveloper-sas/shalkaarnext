import { Injectable } from '@nestjs/common';
import { LoggerService } from './logger.service';
import { SensitiveDataFilter } from './sensitive-data-filter';

export interface ErrorContext {
  userId?: string;
  requestId?: string;
  action?: string;
  resource?: string;
  [key: string]: any;
}

export interface TrackedError {
  id: string;
  timestamp: string;
  name: string;
  message: string;
  stack?: string;
  context?: ErrorContext;
  statusCode?: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
  tags?: string[];
  breadcrumbs?: Breadcrumb[];
}

export interface Breadcrumb {
  timestamp: string;
  category: string;
  message: string;
  level: 'debug' | 'info' | 'warning' | 'error';
  data?: Record<string, any>;
}

export type ErrorTrackingProvider = 'sentry' | 'bugsnag' | 'rollbar' | 'datadog' | 'custom' | null;

/**
 * Error Tracking Service
 * Provider-agnostic error tracking with support for multiple providers
 * Manages error context, breadcrumbs, and integrations with external services
 */
@Injectable()
export class ErrorTrackingService {
  private breadcrumbs: Breadcrumb[] = [];
  private readonly maxBreadcrumbs = 50;
  private errorContext: ErrorContext = {};
  private provider: ErrorTrackingProvider = null;
  private errorQueue: TrackedError[] = [];
  private readonly maxQueueSize = 100;

  constructor(
    private readonly logger: LoggerService,
    private readonly sensitiveDataFilter: SensitiveDataFilter
  ) {
    this.initializeProvider();
  }

  /**
   * Initialize error tracking provider based on configuration
   */
  private initializeProvider(): void {
    const providerName = process.env.ERROR_TRACKING_PROVIDER;

    if (!providerName || providerName === 'none') {
      this.logger.info('Error tracking disabled');
      this.provider = null;
      return;
    }

    if (!this.isValidProvider(providerName)) {
      this.logger.warn(`Unknown error tracking provider: ${providerName}`);
      this.provider = null;
      return;
    }

    this.provider = providerName as ErrorTrackingProvider;
    this.logger.info(`Error tracking provider initialized: ${this.provider}`);
  }

  /**
   * Capture and track an error
   */
  captureError(
    error: Error | any,
    context?: ErrorContext,
    tags?: string[]
  ): string {
    const errorId = this.generateErrorId();
    const trackedError: TrackedError = {
      id: errorId,
      timestamp: new Date().toISOString(),
      name: error?.name || 'Unknown',
      message: error?.message || String(error),
      stack: error?.stack,
      context: { ...this.errorContext, ...context },
      severity: this.determineSeverity(error),
      tags,
      breadcrumbs: [...this.breadcrumbs],
    };

    // Mask sensitive data
    trackedError.context = this.sensitiveDataFilter.maskObject(
      trackedError.context
    );

    // Add to queue
    this.errorQueue.push(trackedError);
    if (this.errorQueue.length > this.maxQueueSize) {
      this.errorQueue.shift();
    }

    // Log locally
    this.logger.error(`Error captured: ${errorId}`, {
      error: trackedError.name,
      message: trackedError.message,
      severity: trackedError.severity,
      tags,
    });

    // Send to provider if configured
    if (this.provider) {
      this.sendToProvider(trackedError);
    }

    return errorId;
  }

  /**
   * Capture exception (alias for captureError)
   */
  captureException(error: Error, context?: ErrorContext): string {
    return this.captureError(error, context);
  }

  /**
   * Capture a message
   */
  captureMessage(
    message: string,
    level: 'debug' | 'info' | 'warning' | 'error' = 'info',
    context?: ErrorContext
  ): string {
    const messageId = this.generateErrorId();

    this.logger.error(
      message,
      {
        level,
        id: messageId,
        context: { ...this.errorContext, ...context },
      }
    );

    // Add breadcrumb
    this.addBreadcrumb(message, 'message', level);

    if (this.provider) {
      this.sendMessageToProvider(message, level, context);
    }

    return messageId;
  }

  /**
   * Set user context (identify user in error tracking)
   */
  setUser(userId: string, email?: string, username?: string): void {
    this.errorContext.userId = userId;
    if (email) this.errorContext.userEmail = email;
    if (username) this.errorContext.username = username;

    this.logger.debug('Error tracking user context set', { userId });
  }

  /**
   * Clear user context
   */
  clearUser(): void {
    delete this.errorContext.userId;
    delete this.errorContext.userEmail;
    delete this.errorContext.username;
  }

  /**
   * Set arbitrary context
   */
  setContext(key: string, value: any): void {
    this.errorContext[key] = value;
  }

  /**
   * Get current context
   */
  getContext(): ErrorContext {
    return { ...this.errorContext };
  }

  /**
   * Add a breadcrumb (event trail for debugging)
   */
  addBreadcrumb(
    message: string,
    category: string = 'action',
    level: 'debug' | 'info' | 'warning' | 'error' = 'info',
    data?: Record<string, any>
  ): void {
    const breadcrumb: Breadcrumb = {
      timestamp: new Date().toISOString(),
      category,
      message,
      level,
      data: data ? this.sensitiveDataFilter.maskObject(data) : undefined,
    };

    this.breadcrumbs.push(breadcrumb);

    // Keep only last N breadcrumbs
    if (this.breadcrumbs.length > this.maxBreadcrumbs) {
      this.breadcrumbs = this.breadcrumbs.slice(-this.maxBreadcrumbs);
    }
  }

  /**
   * Get recent breadcrumbs
   */
  getBreadcrumbs(limit: number = 10): Breadcrumb[] {
    return this.breadcrumbs.slice(-limit);
  }

  /**
   * Clear breadcrumbs
   */
  clearBreadcrumbs(): void {
    this.breadcrumbs = [];
  }

  /**
   * Get error queue (for debugging/monitoring)
   */
  getErrorQueue(): TrackedError[] {
    return [...this.errorQueue];
  }

  /**
   * Get errors by severity
   */
  getErrorsBySeverity(severity: string): TrackedError[] {
    return this.errorQueue.filter((e) => e.severity === severity);
  }

  /**
   * Send error to provider
   */
  private sendToProvider(error: TrackedError): void {
    // This would be implemented by specific provider adapters
    // For now, we just log that we would send it
    this.logger.debug(`Would send to provider: ${this.provider}`, {
      errorId: error.id,
      provider: this.provider,
    });
  }

  /**
   * Send message to provider
   */
  private sendMessageToProvider(
    message: string,
    level: string,
    _context?: ErrorContext // eslint-disable-line @typescript-eslint/no-unused-vars
  ): void {
    this.logger.debug(`Would send message to provider: ${this.provider}`, {
      message,
      level,
      provider: this.provider,
    });
  }

  /**
   * Determine error severity
   */
  private determineSeverity(
    error: any
  ): 'low' | 'medium' | 'high' | 'critical' {
    if (!error) return 'medium';

    const message = String(error.message || error).toLowerCase();
    const stack = String(error.stack || '').toLowerCase();

    // Critical errors
    if (
      message.includes('crash') ||
      message.includes('fatal') ||
      message.includes('critical') ||
      stack.includes('uncaught')
    ) {
      return 'critical';
    }

    // High severity
    if (
      message.includes('database') ||
      message.includes('connection') ||
      message.includes('timeout') ||
      message.includes('payment') ||
      message.includes('auth')
    ) {
      return 'high';
    }

    // Low severity
    if (
      message.includes('deprecat') ||
      message.includes('warning') ||
      message.includes('debug')
    ) {
      return 'low';
    }

    return 'medium';
  }
  /**
   * Generate unique error ID
   */
  private generateErrorId(): string {
    return `err_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Validate provider name
   */
  private isValidProvider(provider: string): boolean {
    const validProviders: ErrorTrackingProvider[] = [
      'sentry',
      'bugsnag',
      'rollbar',
      'datadog',
      'custom',
      null,
    ];
    return validProviders.includes(provider as ErrorTrackingProvider);
  }
}
