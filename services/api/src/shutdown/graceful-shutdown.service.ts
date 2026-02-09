import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { LoggerService } from '@shalkaar/logging';

export interface ShutdownConfig {
  gracefulShutdownTimeoutMs: number; // Total time to wait for graceful shutdown
  drainTimeoutMs: number; // Time to stop accepting new requests
  closeTimeoutMs: number; // Time to close existing connections
}

export interface ShutdownStats {
  startedAt: Date;
  completedAt?: Date;
  duration?: number; // milliseconds
  requestsProcessing: number;
  connectionsOpen: number;
  status: 'pending' | 'draining' | 'closing' | 'closed';
}

/**
 * Graceful Shutdown Service
 * Handles graceful shutdown of the application
 * Ensures in-flight requests complete and connections close properly
 */
@Injectable()
export class GracefulShutdownService implements OnModuleDestroy {
  private activeRequests = 0;
  private shutdownInProgress = false;
  private shutdownStartTime?: Date;
  private shutdownCompleteCallbacks: Array<() => Promise<void>> = [];
  private stats: ShutdownStats = {
    startedAt: new Date(),
    requestsProcessing: 0,
    connectionsOpen: 0,
    status: 'pending',
  };

  private readonly defaultConfig: ShutdownConfig = {
    gracefulShutdownTimeoutMs: 30000, // 30 seconds total
    drainTimeoutMs: 5000, // 5 seconds to drain
    closeTimeoutMs: 10000, // 10 seconds to close
  };

  constructor(
    private readonly logger: LoggerService,
    private readonly prisma: PrismaService
  ) {}

  /**
   * Register a callback to execute during shutdown
   */
  onShutdown(callback: () => Promise<void>): void {
    this.shutdownCompleteCallbacks.push(callback);
  }

  /**
   * Increment active request counter
   */
  incrementActiveRequests(): void {
    if (!this.shutdownInProgress) {
      this.activeRequests++;
      this.stats.requestsProcessing = this.activeRequests;
    }
  }

  /**
   * Decrement active request counter
   */
  decrementActiveRequests(): void {
    if (this.activeRequests > 0) {
      this.activeRequests--;
      this.stats.requestsProcessing = this.activeRequests;
    }
  }

  /**
   * Get current active requests count
   */
  getActiveRequests(): number {
    return this.activeRequests;
  }

  /**
   * Check if shutdown is in progress
   */
  isShuttingDown(): boolean {
    return this.shutdownInProgress;
  }

  /**
   * Trigger graceful shutdown
   */
  async shutdown(config: Partial<ShutdownConfig> = {}): Promise<void> {
    const finalConfig = { ...this.defaultConfig, ...config };

    if (this.shutdownInProgress) {
      this.logger.warn('Shutdown already in progress');
      return;
    }

    this.shutdownInProgress = true;
    this.shutdownStartTime = new Date();
    this.stats.startedAt = this.shutdownStartTime;
    this.stats.status = 'draining';

    this.logger.info('Graceful shutdown initiated', {
      timeout: finalConfig.gracefulShutdownTimeoutMs,
      drainTime: finalConfig.drainTimeoutMs,
      closeTime: finalConfig.closeTimeoutMs,
    });

    try {
      // Phase 1: Drain (stop accepting new requests)
      await this.drainPhase(finalConfig.drainTimeoutMs);

      // Phase 2: Close connections and execute callbacks
      this.stats.status = 'closing';
      await this.closePhase(finalConfig.closeTimeoutMs);

      // Phase 3: Final cleanup
      await this.cleanupPhase();

      this.stats.status = 'closed';
      this.stats.completedAt = new Date();
      this.stats.duration = Date.now() - this.shutdownStartTime.getTime();

      this.logger.info('Graceful shutdown completed', {
        duration: this.stats.duration,
        processedRequests: this.activeRequests,
      });
    } catch (error) {
      this.logger.error('Error during graceful shutdown', {}, error as Error);
      throw error;
    }
  }

  /**
   * Phase 1: Drain incoming requests
   */
  private async drainPhase(timeoutMs: number): Promise<void> {
    this.logger.info('Shutdown phase 1: Draining requests', {
      timeout: timeoutMs,
    });

    const drainStartTime = Date.now();
    const checkInterval = 100; // Check every 100ms

    while (Date.now() - drainStartTime < timeoutMs) {
      if (this.activeRequests === 0) {
        this.logger.info('All requests drained successfully');
        return;
      }

      this.logger.debug(`Waiting for ${this.activeRequests} requests to complete`);
      await this.sleep(checkInterval);
    }

    // Timeout reached, log warning
    this.logger.warn(
      `Drain timeout reached with ${this.activeRequests} requests still processing`
    );
  }

  /**
   * Phase 2: Close connections
   */
  private async closePhase(timeoutMs: number): Promise<void> {
    this.logger.info('Shutdown phase 2: Closing connections', {
      timeout: timeoutMs,
    });

    try {
      // Close database connections
      await Promise.race([
        this.prisma.$disconnect(),
        this.sleep(timeoutMs).then(() => {
          throw new Error('Database disconnect timeout');
        }),
      ]);

      this.logger.info('Database connections closed');
    } catch (error) {
      this.logger.error(
        'Error closing database connections',
        {},
        error as Error
      );
    }

    // Execute shutdown callbacks
    for (const callback of this.shutdownCompleteCallbacks) {
      try {
        await Promise.race([
          callback(),
          this.sleep(5000).then(() => {
            throw new Error('Callback timeout');
          }),
        ]);
      } catch (error) {
        this.logger.error('Error in shutdown callback', {}, error as Error);
      }
    }
  }

  /**
   * Phase 3: Final cleanup
   */
  private async cleanupPhase(): Promise<void> {
    this.logger.info('Shutdown phase 3: Final cleanup');

    // Cleanup tasks
    // Clear any timers, intervals, etc.
    // This is application-specific
  }

  /**
   * Get shutdown statistics
   */
  getStats(): ShutdownStats {
    return {
      ...this.stats,
      requestsProcessing: this.activeRequests,
    };
  }

  /**
   * Force shutdown after timeout
   */
  async forceShutdown(delayMs: number = 0): Promise<void> {
    if (delayMs > 0) {
      this.logger.warn(
        `Force shutdown scheduled in ${delayMs}ms`
      );
      await this.sleep(delayMs);
    }

    this.logger.error('FORCING SHUTDOWN - Some requests may not complete');
    process.exit(1);
  }

  /**
   * Sleep helper
   */
  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * NestJS lifecycle hook
   */
  async onModuleDestroy(): Promise<void> {
    if (!this.shutdownInProgress) {
      await this.shutdown();
    }
  }
}

/**
 * Graceful Shutdown Manager
 * Manages shutdown signals and coordinates graceful shutdown
 */
export class GracefulShutdownManager {
  private service?: GracefulShutdownService;
  private shutdownSignals = ['SIGTERM', 'SIGINT'];
  private forceShutdownTimeout?: NodeJS.Timeout;

  /**
   * Initialize shutdown manager
   */
  initialize(service: GracefulShutdownService, config?: Partial<ShutdownConfig>): void {
    this.service = service;

    // Register signal handlers
    for (const signal of this.shutdownSignals) {
      process.on(signal, () => this.handleShutdownSignal(signal, config));
    }

    // Handle uncaught exceptions
    process.on('uncaughtException', (error) => {
      console.error('Uncaught exception:', error);
      this.triggerShutdown(config);
    });

    // Handle unhandled rejections
    process.on('unhandledRejection', (reason, promise) => {
      console.error('Unhandled rejection at:', promise, 'reason:', reason);
      this.triggerShutdown(config);
    });

    console.log('Graceful shutdown manager initialized');
  }

  /**
   * Handle shutdown signal
   */
  private async handleShutdownSignal(
    signal: string,
    config?: Partial<ShutdownConfig>
  ): Promise<void> {
    console.log(`Received ${signal} signal`);
    await this.triggerShutdown(config);
  }

  /**
   * Trigger shutdown with force fallback
   */
  private async triggerShutdown(config?: Partial<ShutdownConfig>): Promise<void> {
    if (!this.service) {
      console.error('Shutdown service not initialized');
      process.exit(1);
    }

    // Set force shutdown timeout
    const timeoutMs = (config?.gracefulShutdownTimeoutMs || 30000) + 5000; // Add 5s buffer
    this.forceShutdownTimeout = setTimeout(() => {
      console.error(
        `Force shutdown timeout reached after ${timeoutMs}ms`
      );
      process.exit(1);
    }, timeoutMs);

    try {
      await this.service.shutdown(config);
      clearTimeout(this.forceShutdownTimeout);
      process.exit(0);
    } catch (error) {
      console.error('Error during graceful shutdown:', error);
      process.exit(1);
    }
  }
}
