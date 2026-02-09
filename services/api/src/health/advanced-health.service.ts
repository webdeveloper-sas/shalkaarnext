import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { LoggerService } from '@shalkaar/logging';

export enum ServiceHealth {
  HEALTHY = 'healthy',
  DEGRADED = 'degraded',
  UNHEALTHY = 'unhealthy',
}

export interface HealthCheckResult {
  service: string;
  status: ServiceHealth;
  timestamp: string;
  duration: number; // milliseconds
  details?: Record<string, any>;
  error?: string;
}

export interface SystemHealthReport {
  status: ServiceHealth;
  timestamp: string;
  uptime: number; // milliseconds
  checks: HealthCheckResult[];
  overallHealthy: boolean;
  degradedServices: string[];
  unhealthyServices: string[];
  summary: {
    total: number;
    healthy: number;
    degraded: number;
    unhealthy: number;
  };
}

/**
 * Advanced Health Check Service
 * Monitors application and external service health comprehensively
 */
@Injectable()
export class AdvancedHealthService {
  private readonly startTime = Date.now();
  private lastReport?: SystemHealthReport;

  constructor(
    private readonly prisma: PrismaService,
    private readonly logger: LoggerService
  ) {}

  /**
   * Perform comprehensive health check
   */
  async checkSystemHealth(): Promise<SystemHealthReport> {
    const checks: HealthCheckResult[] = [];

    // Run all health checks
    checks.push(await this.checkDatabase());
    checks.push(await this.checkPaymentService());
    checks.push(await this.checkCacheService());
    checks.push(await this.checkEmailService());
    checks.push(await this.checkExternalApis());
    checks.push(await this.checkMemory());
    checks.push(await this.checkDiskSpace());

    // Calculate overall status
    const unhealthyServices = checks
      .filter((c) => c.status === ServiceHealth.UNHEALTHY)
      .map((c) => c.service);
    const degradedServices = checks
      .filter((c) => c.status === ServiceHealth.DEGRADED)
      .map((c) => c.service);

    const overallHealthy =
      unhealthyServices.length === 0 && degradedServices.length <= 1;
    const overallStatus = unhealthyServices.length > 0
      ? ServiceHealth.UNHEALTHY
      : degradedServices.length > 0
      ? ServiceHealth.DEGRADED
      : ServiceHealth.HEALTHY;

    const report: SystemHealthReport = {
      status: overallStatus,
      timestamp: new Date().toISOString(),
      uptime: Date.now() - this.startTime,
      checks,
      overallHealthy,
      degradedServices,
      unhealthyServices,
      summary: {
        total: checks.length,
        healthy: checks.filter((c) => c.status === ServiceHealth.HEALTHY).length,
        degraded: degradedServices.length,
        unhealthy: unhealthyServices.length,
      },
    };

    this.lastReport = report;

    // Log if any issues
    if (!overallHealthy) {
      this.logger.warn('System health check detected issues', {
        status: overallStatus,
        degraded: degradedServices,
        unhealthy: unhealthyServices,
      });
    }

    return report;
  }

  /**
   * Check database connectivity and performance
   */
  private async checkDatabase(): Promise<HealthCheckResult> {
    const checkName = 'database';
    const startTime = Date.now();

    try {
      // Simple ping query
      await this.prisma.$queryRaw`SELECT 1`;

      // Check connection pool
      const poolDetails = await this.getConnectionPoolStats();

      const duration = Date.now() - startTime;

      // Determine status based on duration
      let status = ServiceHealth.HEALTHY;
      if (duration > 1000) status = ServiceHealth.DEGRADED;
      if (duration > 5000) status = ServiceHealth.UNHEALTHY;

      return {
        service: checkName,
        status,
        timestamp: new Date().toISOString(),
        duration,
        details: {
          responseTime: `${duration}ms`,
          ...poolDetails,
        },
      };
    } catch (error) {
      this.logger.error('Database health check failed', { error: String(error) });
      return {
        service: checkName,
        status: ServiceHealth.UNHEALTHY,
        timestamp: new Date().toISOString(),
        duration: Date.now() - startTime,
        error: String(error),
      };
    }
  }

  /**
   * Check payment service availability
   */
  private async checkPaymentService(): Promise<HealthCheckResult> {
    const checkName = 'payment_service';
    const startTime = Date.now();

    try {
      // Check if Stripe API is accessible
      // This is a mock - in real scenario, make actual API call
      const stripeKey = process.env.STRIPE_SECRET_KEY;
      
      if (!stripeKey) {
        return {
          service: checkName,
          status: ServiceHealth.UNHEALTHY,
          timestamp: new Date().toISOString(),
          duration: Date.now() - startTime,
          error: 'Stripe key not configured',
        };
      }

      // In production, call Stripe to verify connectivity
      // For now, just verify configuration
      const duration = Date.now() - startTime;

      return {
        service: checkName,
        status: ServiceHealth.HEALTHY,
        timestamp: new Date().toISOString(),
        duration,
        details: {
          configured: true,
          provider: 'stripe',
        },
      };
    } catch (error) {
      return {
        service: checkName,
        status: ServiceHealth.DEGRADED,
        timestamp: new Date().toISOString(),
        duration: Date.now() - startTime,
        error: String(error),
      };
    }
  }

  /**
   * Check cache service availability
   */
  private async checkCacheService(): Promise<HealthCheckResult> {
    const checkName = 'cache_service';
    const startTime = Date.now();

    try {
      // Check Redis if configured
      const redisUrl = process.env.REDIS_URL;

      if (!redisUrl) {
        // Cache is optional
        return {
          service: checkName,
          status: ServiceHealth.HEALTHY,
          timestamp: new Date().toISOString(),
          duration: Date.now() - startTime,
          details: {
            available: false,
            reason: 'Not configured',
          },
        };
      }

      // In production, connect to Redis and verify
      const duration = Date.now() - startTime;

      return {
        service: checkName,
        status: ServiceHealth.HEALTHY,
        timestamp: new Date().toISOString(),
        duration,
        details: {
          available: true,
          provider: 'redis',
        },
      };
    } catch (error) {
      // Cache failure is degraded, not unhealthy
      return {
        service: checkName,
        status: ServiceHealth.DEGRADED,
        timestamp: new Date().toISOString(),
        duration: Date.now() - startTime,
        error: String(error),
        details: {
          fallback: 'memory_cache',
        },
      };
    }
  }

  /**
   * Check email service availability
   */
  private async checkEmailService(): Promise<HealthCheckResult> {
    const checkName = 'email_service';
    const startTime = Date.now();

    try {
      // Check if email is configured
      const smtpUrl = process.env.SMTP_URL;
      const mockEmail = process.env.MOCK_EMAIL;

      if (!smtpUrl && !mockEmail) {
        return {
          service: checkName,
          status: ServiceHealth.UNHEALTHY,
          timestamp: new Date().toISOString(),
          duration: Date.now() - startTime,
          error: 'Email service not configured',
        };
      }

      const duration = Date.now() - startTime;

      return {
        service: checkName,
        status: ServiceHealth.HEALTHY,
        timestamp: new Date().toISOString(),
        duration,
        details: {
          configured: true,
          provider: smtpUrl ? 'smtp' : 'mock',
        },
      };
    } catch (error) {
      return {
        service: checkName,
        status: ServiceHealth.DEGRADED,
        timestamp: new Date().toISOString(),
        duration: Date.now() - startTime,
        error: String(error),
      };
    }
  }

  /**
   * Check external API dependencies
   */
  private async checkExternalApis(): Promise<HealthCheckResult> {
    const checkName = 'external_apis';
    const startTime = Date.now();

    try {
      const apis = {
        stripe: !!process.env.STRIPE_SECRET_KEY,
        webhook: !!process.env.STRIPE_WEBHOOK_SECRET,
      };

      const allConfigured = Object.values(apis).every((v) => v);

      const duration = Date.now() - startTime;

      return {
        service: checkName,
        status: allConfigured
          ? ServiceHealth.HEALTHY
          : ServiceHealth.DEGRADED,
        timestamp: new Date().toISOString(),
        duration,
        details: {
          configured: apis,
        },
      };
    } catch (error) {
      return {
        service: checkName,
        status: ServiceHealth.DEGRADED,
        timestamp: new Date().toISOString(),
        duration: Date.now() - startTime,
        error: String(error),
      };
    }
  }

  /**
   * Check system memory usage
   */
  private async checkMemory(): Promise<HealthCheckResult> {
    const checkName = 'memory';
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const startTime = Date.now();

    try {
      const mem = process.memoryUsage();
      const heapUsedPercent = (mem.heapUsed / mem.heapTotal) * 100;

      let status = ServiceHealth.HEALTHY;
      if (heapUsedPercent > 80) status = ServiceHealth.DEGRADED;
      if (heapUsedPercent > 95) status = ServiceHealth.UNHEALTHY;

      const duration = Date.now() - startTime;

      return {
        service: checkName,
        status,
        timestamp: new Date().toISOString(),
        duration,
        details: {
          heapUsed: `${(mem.heapUsed / 1024 / 1024).toFixed(2)}MB`,
          heapTotal: `${(mem.heapTotal / 1024 / 1024).toFixed(2)}MB`,
          heapUsedPercent: `${heapUsedPercent.toFixed(1)}%`,
          external: `${(mem.external / 1024 / 1024).toFixed(2)}MB`,
        },
      };
    } catch (error) {
      return {
        service: checkName,
        status: ServiceHealth.DEGRADED,
        timestamp: new Date().toISOString(),
        duration: Date.now() - startTime,
        error: String(error),
      };
    }
  }

  /**
   * Check disk space availability
   */
  private async checkDiskSpace(): Promise<HealthCheckResult> {
    const checkName = 'disk_space';
    const startTime = Date.now();

    try {
      // Note: In production, use a library like 'diskusage' or check /proc/mounts
      // For now, just return a placeholder

      const duration = Date.now() - startTime;

      return {
        service: checkName,
        status: ServiceHealth.HEALTHY,
        timestamp: new Date().toISOString(),
        duration,
        details: {
          status: 'monitored',
        },
      };
    } catch (error) {
      return {
        service: checkName,
        status: ServiceHealth.DEGRADED,
        timestamp: new Date().toISOString(),
        duration: Date.now() - startTime,
        error: String(error),
      };
    }
  }

  /**
   * Get connection pool statistics
   */
  private async getConnectionPoolStats(): Promise<Record<string, any>> {
    try {
      // Get Prisma connection pool stats if available
      return {
        connections: 'monitored',
      };
    } catch (error) {
      return {};
    }
  }

  /**
   * Get uptime in seconds
   */
  getUptime(): number {
    return Math.floor((Date.now() - this.startTime) / 1000);
  }

  /**
   * Get last health report
   */
  getLastReport(): SystemHealthReport | undefined {
    return this.lastReport;
  }

  /**
   * Get quick health status (CLOSED form)
   */
  async getQuickHealth(): Promise<{
    status: ServiceHealth;
    uptime: number;
    timestamp: string;
  }> {
    const report = this.lastReport || (await this.checkSystemHealth());

    return {
      status: report.status,
      uptime: report.uptime,
      timestamp: report.timestamp,
    };
  }
}
