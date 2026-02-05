import { Controller, Get, Post, Put, Delete, Param, Body, Query } from '@nestjs/common';
import { ContentService } from './content.service';

@Controller('content/stories')
export class ContentController {
  constructor(private readonly contentService: ContentService) {}

  @Get()
  async findAll(@Query('limit') limit = 12, @Query('offset') offset = 0) {
    return this.contentService.findAll(limit, offset);
  }

  @Get(':slug')
  async findBySlug(@Param('slug') slug: string) {
    return this.contentService.findBySlug(slug);
  }

  @Post()
  async create(@Body() data: any) {
    return this.contentService.create(data);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() data: any) {
    return this.contentService.update(id, data);
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    return this.contentService.delete(id);
  }
}
