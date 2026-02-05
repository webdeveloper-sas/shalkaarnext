import { Controller, Get, Post, Put, Param, Body } from '@nestjs/common';
import { ArtisansService } from './artisans.service';

@Controller('artisans')
export class ArtisansController {
  constructor(private readonly artisansService: ArtisansService) {}

  @Get()
  async findAll() {
    return this.artisansService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.artisansService.findOne(id);
  }

  @Post()
  async create(@Body() data: any) {
    return this.artisansService.create(data);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() data: any) {
    return this.artisansService.update(id, data);
  }
}
