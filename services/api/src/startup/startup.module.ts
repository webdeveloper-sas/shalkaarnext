import { Module } from '@nestjs/common';
import { StartupVerificationService } from './startup-verification.service';
import { HealthCheckController } from './health-check.controller';
import { PrismaModule } from '../prisma/prisma.module';

/**
 * Startup Module
 * Handles application startup verification and health checks
 */
@Module({
  imports: [PrismaModule],
  providers: [StartupVerificationService],
  controllers: [HealthCheckController],
  exports: [StartupVerificationService],
})
export class StartupModule {}
