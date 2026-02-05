import { Controller, Get, Post, Put, Param, Body } from '@nestjs/common';
import { OrdersService } from './orders.service';

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  async create(@Body() data: any) {
    return this.ordersService.create(data);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.ordersService.findOne(id);
  }

  @Get('user/:userId')
  async findUserOrders(@Param('userId') userId: string) {
    return this.ordersService.findUserOrders(userId);
  }

  @Put(':id/status')
  async updateStatus(@Param('id') id: string, @Body('status') status: string) {
    return this.ordersService.updateStatus(id, status);
  }

  @Post(':id/cancel')
  async cancel(@Param('id') id: string) {
    return this.ordersService.cancel(id);
  }
}
