import { Controller, Get, HttpCode, HttpStatus, Logger } from '@nestjs/common';
import { StartupVerificationService } from './startup-verification.service';
import { PrismaService } from '../prisma/prisma.service';

export interface HealthCheckResponse {
  status: 'up' | 'degraded' | 'down';
  timestamp: Date;
  uptime: number;
  environment: string;
  services: {
    api: {
      status: 'up' | 'down';
      responseTime: number;
    };
    database: {
      status: 'up' | 'down';
      responseTime: number;
    };
  };
  version: string;
}

export interface DetailedHealthResponse extends HealthCheckResponse {
  startupChecks?: any;
  memory?: {
    heapUsed: number;
    heapTotal: number;
    external: number;
  };
  uptime: number;
}

/**
 * Health Check Controller
 * Provides endpoints for monitoring application health
 */
@Controller('api/health')
export class HealthCheckController {
  private readonly logger = new Logger(HealthCheckController.name);
  private readonly startTime = Date.now();

  constructor(
    private startupVerification: StartupVerificationService,
    private prisma: PrismaService
  ) {}

  /**
   * GET /api/health
   * Basic health check - returns 200 if API is running
   */
  @Get()
  @HttpCode(HttpStatus.OK)
  async healthCheck(): Promise<HealthCheckResponse> {
    const startTime = Date.now();
    const now = new Date();

    // Check database
    let dbStatus: 'up' | 'down' = 'down';
    let dbResponseTime = 0;
    const dbStart = Date.now();

    try {
      await this.prisma.$queryRaw`SELECT 1`;
      dbStatus = 'up';
      dbResponseTime = Date.now() - dbStart;
    } catch (error) {
      this.logger.error('Database health check failed', error);
    }

    const apiResponseTime = Date.now() - startTime;

    return {
      status: dbStatus === 'up' ? 'up' : 'degraded',
      timestamp: now,
      uptime: Date.now() - this.startTime,
      environment: process.env.NODE_ENV || 'development',
      services: {
        api: {
          status: 'up',
          responseTime: apiResponseTime,
        },
        database: {
          status: dbStatus,
          responseTime: dbResponseTime,
        },
      },
      version: process.env.npm_package_version || '1.0.0',
    };
  }

  /**
   * GET /api/health/deep
   * Deep health check - includes startup verification and memory info
   * Only available in development/staging, restricted in production
   */
  @Get('deep')
  @HttpCode(HttpStatus.OK)
  async deepHealthCheck(): Promise<DetailedHealthResponse> {
    const isProduction = process.env.NODE_ENV === 'production';
    
    // In production, only return basic info to prevent information leakage
    if (isProduction) {
      const basic = await this.healthCheck();
      return {
        ...basic,
        memory: {
          heapUsed: process.memoryUsage().heapUsed,
          heapTotal: process.memoryUsage().heapTotal,
          external: process.memoryUsage().external,
        },
      };
    }

    const basic = await this.healthCheck();
    const memUsage = process.memoryUsage();
    const startupChecks = this.startupVerification.getVerification();

    return {
      ...basic,
      startupChecks,
      memory: {
        heapUsed: memUsage.heapUsed,
        heapTotal: memUsage.heapTotal,
        external: memUsage.external,
      },
    };
  }

  /**
   * GET /api/health/startup
   * Get startup verification details
   * Useful for debugging deployment issues
   */
  @Get('startup')
  @HttpCode(HttpStatus.OK)
  async startupCheckDetails(): Promise<any> {
    const verification = this.startupVerification.getVerification();

    if (!verification) {
      return {
        status: 'not-run',
        message: 'Startup verification has not been run',
      };
    }

    return {
      timestamp: verification.timestamp,
      environment: verification.environment,
      allPassed: verification.allPassed,
      criticalChecksPassed: verification.criticalChecksPassed,
      totalDuration: verification.totalDuration,
      checks: verification.checks.map((c) => ({
        name: c.name,
        status: c.status,
        message: c.message,
        duration: c.duration,
      })),
    };
  }

  /**
   * GET /api/health/ready
   * Readiness probe - indicates if service is ready to accept traffic
   */
  @Get('ready')
  @HttpCode(HttpStatus.OK)
  async readinessProbe(): Promise<{
    ready: boolean;
    details: string;
  }> {
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      return {
        ready: true,
        details: 'Service is ready',
      };
    } catch (error) {
      return {
        ready: false,
        details: 'Database not available',
      };
    }
  }

  /**
   * GET /api/health/live
   * Liveness probe - indicates if service process is alive
   * Used by container orchestrators like Kubernetes
   */
  @Get('live')
  @HttpCode(HttpStatus.OK)
  async livenessProbe(): Promise<{ alive: boolean }> {
    return { alive: true };
  }
}
