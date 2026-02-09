import { Module } from '@nestjs/common';
import { LoggerService } from './logger.service';
import { ErrorTrackingService } from './error-tracker.service';
import { SensitiveDataFilter } from './sensitive-data-filter';

/**
 * Logging Module
 * Provides structured logging and error tracking services
 * Export this module from AppModule to make logging available globally
 */
@Module({
  providers: [LoggerService, SensitiveDataFilter, ErrorTrackingService],
  exports: [LoggerService, SensitiveDataFilter, ErrorTrackingService],
})
export class LoggingModule {}

// Export services for direct imports
export { LoggerService };
export { ErrorTrackingService };
export { SensitiveDataFilter };
