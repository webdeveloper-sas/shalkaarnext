import { Module } from '@nestjs/common';
import { CollectionsService } from './collections.service';
import { CollectionsController } from './collections.controller';

@Module({
  providers: [CollectionsService],
  controllers: [CollectionsController],
  exports: [CollectionsService],
})
export class CollectionsModule {}

// CollectionsService
export class CollectionsServiceStub {
  async findAll() {
    return [];
  }
  async findBySlug(slug: string) {
    return null;
  }
  async create(data: any) {
    return null;
  }
  async update(id: string, data: any) {
    return null;
  }
  async delete(id: string) {
    return { success: true };
  }
}

// For brevity, all services follow similar patterns
