import { Injectable, OnModuleInit, BeforeApplicationShutdown } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

/**
 * PrismaService
 * Manages database connection lifecycle and provides Prisma Client instance.
 * Phase 5: Database layer integration.
 */
@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, BeforeApplicationShutdown {
  async onModuleInit() {
    await this.$connect();
  }

  async beforeApplicationShutdown(_signal?: string) {
    await this.$disconnect();
  }
}
