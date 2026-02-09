import { Injectable, Logger as NestLogger } from '@nestjs/common';

export enum LogLevel {
  DEBUG = 'debug',
  INFO = 'info',
  WARN = 'warn',
  ERROR = 'error',
  CRITICAL = 'critical',
}

export interface LogContext {
  userId?: string;
  requestId?: string;
  correlationId?: string;
  sessionId?: string;
  [key: string]: any;
}

export interface StructuredLog {
  timestamp: string;
  level: string;
  message: string;
  service: string;
  context?: LogContext;
  error?: {
    name: string;
    message: string;
    stack?: string;
  };
  metadata?: Record<string, any>;
  duration?: number; // milliseconds
}

/**
 * Structured Logging Service
 * Provides consistent, machine-readable logging across the application
 * All logs are JSON-formatted for easy parsing and analysis
 */
@Injectable()
export class LoggerService {
  private readonly nestLogger = new NestLogger();
  private readonly serviceName = process.env.SERVICE_NAME || 'api';
  private readonly environment = process.env.NODE_ENV || 'development';
  private readonly logLevel = this.getLogLevel();
  private context: LogContext = {};

  constructor() {
    this.nestLogger.log(`Logger initialized for ${this.serviceName} (${this.environment})`);
  }

  /**
   * Set context that will be included in all subsequent logs
   */
  setContext(context: LogContext): void {
    this.context = { ...this.context, ...context };
  }

  /**
   * Clear context
   */
  clearContext(): void {
    this.context = {};
  }

  /**
   * Get current context
   */
  getContext(): LogContext {
    return this.context;
  }

  /**
   * Debug level logging
   */
  debug(message: string, metadata?: Record<string, any>, error?: Error): void {
    if (!this.shouldLog(LogLevel.DEBUG)) return;
    this.log(LogLevel.DEBUG, message, metadata, error);
  }

  /**
   * Info level logging (general informational messages)
   */
  info(message: string, metadata?: Record<string, any>, error?: Error): void {
    if (!this.shouldLog(LogLevel.INFO)) return;
    this.log(LogLevel.INFO, message, metadata, error);
  }

  /**
   * Warn level logging (warnings that should be reviewed)
   */
  warn(message: string, metadata?: Record<string, any>, error?: Error): void {
    if (!this.shouldLog(LogLevel.WARN)) return;
    this.log(LogLevel.WARN, message, metadata, error);
  }

  /**
   * Error level logging (errors that need attention)
   */
  error(message: string, metadata?: Record<string, any>, error?: Error): void {
    if (!this.shouldLog(LogLevel.ERROR)) return;
    this.log(LogLevel.ERROR, message, metadata, error);
  }

  /**
   * Critical level logging (critical errors that stop functionality)
   */
  critical(message: string, metadata?: Record<string, any>, error?: Error): void {
    this.log(LogLevel.CRITICAL, message, metadata, error);
  }

  /**
   * Log an API request
   */
  logRequest(
    method: string,
    path: string,
    statusCode?: number,
    duration?: number,
    metadata?: Record<string, any>
  ): void {
    const message = `${method} ${path}${statusCode ? ` -> ${statusCode}` : ''}`;
    const meta = {
      ...metadata,
      http: {
        method,
        path,
        statusCode,
      },
      duration,
    };

    if (statusCode && statusCode >= 400) {
      this.error(message, meta);
    } else {
      this.info(message, meta);
    }
  }

  /**
   * Log a database query
   */
  logDatabaseQuery(query: string, duration: number, metadata?: Record<string, any>): void {
    const message = `Database query executed in ${duration}ms`;
    this.debug(message, {
      ...metadata,
      query: this.truncate(query, 200),
      duration,
    });
  }

  /**
   * Log an external API call
   */
  logExternalCall(
    service: string,
    endpoint: string,
    statusCode: number,
    duration: number,
    metadata?: Record<string, any>
  ): void {
    const message = `External API call to ${service} ${endpoint} -> ${statusCode}`;
    if (statusCode >= 400) {
      this.warn(message, {
        ...metadata,
        service,
        endpoint,
        statusCode,
        duration,
      });
    } else {
      this.info(message, {
        ...metadata,
        service,
        endpoint,
        statusCode,
        duration,
      });
    }
  }

  /**
   * Core logging method
   */
  private log(
    level: LogLevel,
    message: string,
    metadata?: Record<string, any>,
    error?: Error
  ): void {
    const log: StructuredLog = {
      timestamp: new Date().toISOString(),
      level,
      message,
      service: this.serviceName,
      context: this.context,
      metadata,
    };

    if (error) {
      log.error = {
        name: error.name,
        message: error.message,
        stack: error.stack,
      };
    }

    const logOutput = JSON.stringify(log);

    // Output to console with appropriate method
    switch (level) {
      case LogLevel.DEBUG:
        console.log(logOutput);
        break;
      case LogLevel.INFO:
        console.log(logOutput);
        break;
      case LogLevel.WARN:
        console.warn(logOutput);
        break;
      case LogLevel.ERROR:
        console.error(logOutput);
        break;
      case LogLevel.CRITICAL:
        console.error(logOutput);
        break;
    }
  }

  /**
   * Determine if a log level should be logged
   */
  private shouldLog(level: LogLevel): boolean {
    const levels = [LogLevel.DEBUG, LogLevel.INFO, LogLevel.WARN, LogLevel.ERROR, LogLevel.CRITICAL];
    const currentIndex = levels.indexOf(this.logLevel);
    const targetIndex = levels.indexOf(level);
    return targetIndex >= currentIndex;
  }

  /**
   * Get log level from environment
   */
  private getLogLevel(): LogLevel {
    const env = process.env.LOG_LEVEL || 'info';
    switch (env.toLowerCase()) {
      case 'debug':
        return LogLevel.DEBUG;
      case 'info':
        return LogLevel.INFO;
      case 'warn':
        return LogLevel.WARN;
      case 'error':
        return LogLevel.ERROR;
      case 'critical':
        return LogLevel.CRITICAL;
      default:
        return LogLevel.INFO;
    }
  }

  /**
   * Truncate long strings
   */
  private truncate(str: string, length: number): string {
    if (str.length <= length) return str;
    return str.substring(0, length) + '...';
  }
}
