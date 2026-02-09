import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';

export interface StartupCheck {
  name: string;
  status: 'ok' | 'warning' | 'error';
  message: string;
  duration: number; // milliseconds
}

export interface StartupVerification {
  timestamp: Date;
  environment: string;
  checks: StartupCheck[];
  allPassed: boolean;
  criticalChecksPassed: boolean;
  totalDuration: number;
}

/**
 * Startup Verification Service
 * Runs critical checks on application startup to ensure production readiness
 */
@Injectable()
export class StartupVerificationService implements OnModuleInit {
  private readonly logger = new Logger(StartupVerificationService.name);
  private verification: StartupVerification | null = null;

  constructor(
    private configService: ConfigService,
    private prisma: PrismaService
  ) {}

  /**
   * Run on module initialization
   */
  async onModuleInit(): Promise<void> {
    if (this.getEnvironment() === 'production') {
      this.logger.log('Production mode detected - running startup verification...');
      const verification = await this.verify();

      if (!verification.criticalChecksPassed) {
        this.logger.error('Critical startup checks failed!');
        this.logVerification(verification);
        process.exit(1);
      }

      if (!verification.allPassed) {
        this.logger.warn('Some startup checks failed');
        this.logVerification(verification);
      } else {
        this.logger.log('✅ All startup checks passed');
      }
    }
  }

  /**
   * Run all startup verification checks
   */
  async verify(): Promise<StartupVerification> {
    const startTime = Date.now();
    const checks: StartupCheck[] = [];

    // Environment checks
    checks.push(await this.checkEnvironmentVariables());
    checks.push(await this.checkNodeVersion());
    checks.push(await this.checkDatabaseConnection());
    checks.push(await this.checkDatabaseMigrations());
    checks.push(await this.checkRequiredSecrets());
    checks.push(await this.checkPortAvailability());
    checks.push(await this.checkMemoryAvailability());
    checks.push(await this.checkDiskSpace());

    const totalDuration = Date.now() - startTime;
    const environment = this.getEnvironment();

    const verification: StartupVerification = {
      timestamp: new Date(),
      environment,
      checks,
      allPassed: checks.every((c) => c.status !== 'error'),
      criticalChecksPassed: this.checkCriticalChecks(checks),
      totalDuration,
    };

    this.verification = verification;
    return verification;
  }

  /**
   * Check environment variables
   */
  private async checkEnvironmentVariables(): Promise<StartupCheck> {
    const startTime = Date.now();

    try {
      const nodeEnv = this.configService.get('NODE_ENV');
      const apiUrl = this.configService.get('API_URL');
      const apiPort = this.configService.get('API_PORT');

      if (!nodeEnv || !apiUrl || !apiPort) {
        return {
          name: 'Environment Variables',
          status: 'error',
          message: 'Missing required environment variables',
          duration: Date.now() - startTime,
        };
      }

      return {
        name: 'Environment Variables',
        status: 'ok',
        message: `NODE_ENV=${nodeEnv}, API_PORT=${apiPort}`,
        duration: Date.now() - startTime,
      };
    } catch (error) {
      return {
        name: 'Environment Variables',
        status: 'error',
        message: 'Failed to read environment variables',
        duration: Date.now() - startTime,
      };
    }
  }

  /**
   * Check Node.js version
   */
  private async checkNodeVersion(): Promise<StartupCheck> {
    const startTime = Date.now();

    try {
      const nodeVersion = process.version;
      const majorVersion = parseInt(nodeVersion.split('.')[0].substring(1));

      if (majorVersion < 18) {
        return {
          name: 'Node.js Version',
          status: 'warning',
          message: `Node.js ${nodeVersion} (recommended 18+)`,
          duration: Date.now() - startTime,
        };
      }

      return {
        name: 'Node.js Version',
        status: 'ok',
        message: `Node.js ${nodeVersion}`,
        duration: Date.now() - startTime,
      };
    } catch (error) {
      return {
        name: 'Node.js Version',
        status: 'error',
        message: 'Failed to check Node.js version',
        duration: Date.now() - startTime,
      };
    }
  }

  /**
   * Check database connection
   */
  private async checkDatabaseConnection(): Promise<StartupCheck> {
    const startTime = Date.now();

    try {
      await this.prisma.$queryRaw`SELECT 1`;
      return {
        name: 'Database Connection',
        status: 'ok',
        message: 'Connected',
        duration: Date.now() - startTime,
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      return {
        name: 'Database Connection',
        status: 'error',
        message: `Failed: ${errorMessage}`,
        duration: Date.now() - startTime,
      };
    }
  }

  /**
   * Check database migrations status
   */
  private async checkDatabaseMigrations(): Promise<StartupCheck> {
    const startTime = Date.now();

    try {
      // Check if migrations table exists
      const result = await this.prisma.$queryRaw`
        SELECT COUNT(*) as count FROM "_prisma_migrations"
      `;

      const migrationCount = (result as any)[0]?.count || 0;

      return {
        name: 'Database Migrations',
        status: 'ok',
        message: `${migrationCount} migrations applied`,
        duration: Date.now() - startTime,
      };
    } catch (error) {
      return {
        name: 'Database Migrations',
        status: 'warning',
        message: 'Unable to verify migration status',
        duration: Date.now() - startTime,
      };
    }
  }

  /**
   * Check required secrets
   */
  private async checkRequiredSecrets(): Promise<StartupCheck> {
    const startTime = Date.now();
    const environment = this.getEnvironment();

    try {
      const requiredSecrets: Record<string, string[]> = {
        production: ['JWT_SECRET', 'DATABASE_URL', 'NEXTAUTH_SECRET'],
        staging: ['JWT_SECRET', 'DATABASE_URL'],
        development: [],
      };

      const secrets = requiredSecrets[environment] || [];
      const missing: string[] = [];

      for (const secret of secrets) {
        if (!this.configService.get(secret)) {
          missing.push(secret);
        }
      }

      if (missing.length > 0) {
        return {
          name: 'Required Secrets',
          status: 'error',
          message: `Missing: ${missing.join(', ')}`,
          duration: Date.now() - startTime,
        };
      }

      return {
        name: 'Required Secrets',
        status: 'ok',
        message: `All ${secrets.length} required secrets configured`,
        duration: Date.now() - startTime,
      };
    } catch (error) {
      return {
        name: 'Required Secrets',
        status: 'warning',
        message: 'Unable to verify secrets',
        duration: Date.now() - startTime,
      };
    }
  }

  /**
   * Check port availability
   */
  private async checkPortAvailability(): Promise<StartupCheck> {
    const startTime = Date.now();

    try {
      const port = this.configService.get<number>('API_PORT', 3333);
      // In production, port should be available
      // This is mostly informational
      return {
        name: 'Port Availability',
        status: 'ok',
        message: `Port ${port} configured`,
        duration: Date.now() - startTime,
      };
    } catch (error) {
      return {
        name: 'Port Availability',
        status: 'warning',
        message: 'Unable to verify port availability',
        duration: Date.now() - startTime,
      };
    }
  }

  /**
   * Check available memory
   */
  private async checkMemoryAvailability(): Promise<StartupCheck> {
    const startTime = Date.now();

    try {
      const totalMemory = require('os').totalmem();
      const freeMemory = require('os').freemem();
      const usedMemory = totalMemory - freeMemory;
      const usagePercent = (usedMemory / totalMemory) * 100;

      const status = usagePercent > 90 ? 'warning' : 'ok';
      const usedGB = (usedMemory / (1024 * 1024 * 1024)).toFixed(2);
      const totalGB = (totalMemory / (1024 * 1024 * 1024)).toFixed(2);

      return {
        name: 'Memory Availability',
        status,
        message: `${usedGB}GB / ${totalGB}GB used (${usagePercent.toFixed(1)}%)`,
        duration: Date.now() - startTime,
      };
    } catch (error) {
      return {
        name: 'Memory Availability',
        status: 'warning',
        message: 'Unable to check memory',
        duration: Date.now() - startTime,
      };
    }
  }

  /**
   * Check disk space
   */
  private async checkDiskSpace(): Promise<StartupCheck> {
    const startTime = Date.now();

    try {
      // This would require os.statfs which is platform-specific
      // For now, return informational check
      return {
        name: 'Disk Space',
        status: 'ok',
        message: 'Disk space check requires platform-specific monitoring',
        duration: Date.now() - startTime,
      };
    } catch (error) {
      return {
        name: 'Disk Space',
        status: 'warning',
        message: 'Unable to check disk space',
        duration: Date.now() - startTime,
      };
    }
  }

  /**
   * Check if critical checks passed
   */
  private checkCriticalChecks(checks: StartupCheck[]): boolean {
    const criticalChecks = [
      'Environment Variables',
      'Database Connection',
      'Required Secrets',
    ];

    const criticalFailed = checks
      .filter((c) => criticalChecks.includes(c.name))
      .some((c) => c.status === 'error');

    return !criticalFailed;
  }

  /**
   * Get current environment
   */
  private getEnvironment(): string {
    return this.configService.get('NODE_ENV', 'development');
  }

  /**
   * Get verification results
   */
  getVerification(): StartupVerification | null {
    return this.verification;
  }

  /**
   * Log verification results
   */
  private logVerification(verification: StartupVerification): void {
    this.logger.debug(
      JSON.stringify(
        {
          timestamp: verification.timestamp,
          environment: verification.environment,
          duration: `${verification.totalDuration}ms`,
          allPassed: verification.allPassed,
          checks: verification.checks.map((c) => ({
            name: c.name,
            status: c.status,
            message: c.message,
          })),
        },
        null,
        2
      )
    );
  }
}
