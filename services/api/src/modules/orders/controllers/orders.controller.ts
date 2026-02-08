import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
  HttpCode,
  ForbiddenException,
} from '@nestjs/common';
import { OrdersService } from '../services/orders.service';
import { CreateOrderDto, UpdateOrderStatusDto, OrderResponseDto, OrderQueryDto } from '../dtos/order.dto';
import { JwtAuthGuard, RolesGuard } from '../../../common/guards';
import { Roles, CurrentUser } from '../../../common/decorators';
import { UserRole } from '../../../common/enums';

@Controller('orders')
@UseGuards(JwtAuthGuard, RolesGuard)
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Get()
  @Roles(UserRole.ADMIN, UserRole.CUSTOMER, UserRole.VENDOR)
  async getAllOrders(@Query() query: OrderQueryDto, @CurrentUser() user: any) {
    // Non-admin users can only see their own orders
    if (user.role !== UserRole.ADMIN) {
      query.userId = user.id;
    }
    return this.ordersService.getAllOrders(query);
  }

  @Get(':id')
  @Roles(UserRole.ADMIN, UserRole.CUSTOMER, UserRole.VENDOR)
  async getOrderById(@Param('id') id: string, @CurrentUser() user: any): Promise<OrderResponseDto> {
    const order = await this.ordersService.getOrderById(id);
    // Non-admin users can only view their own orders
    if (user.role !== UserRole.ADMIN && order.userId !== user.id) {
      throw new ForbiddenException('Can only view own orders');
    }
    return order;
  }

  @Post()
  @Roles(UserRole.CUSTOMER, UserRole.VENDOR)
  @HttpCode(201)
  async createOrder(@Body() data: CreateOrderDto, @CurrentUser() user: any): Promise<OrderResponseDto> {
    // Users can only create orders for themselves
    if (data.userId !== user.id && user.role !== UserRole.ADMIN) {
      throw new ForbiddenException('Can only create orders for yourself');
    }
    return this.ordersService.createOrder(data);
  }

  @Patch(':id/status')
  @Roles(UserRole.ADMIN)
  async updateOrderStatus(
    @Param('id') id: string,
    @Body() data: UpdateOrderStatusDto,
  ): Promise<OrderResponseDto> {
    return this.ordersService.updateOrderStatus(id, data);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN, UserRole.CUSTOMER, UserRole.VENDOR)
  @HttpCode(204)
  async cancelOrder(@Param('id') id: string, @CurrentUser() user: any) {
    const order = await this.ordersService.getOrderById(id);
    // Only ADMIN or order owner can cancel
    if (user.role !== UserRole.ADMIN && order.userId !== user.id) {
      throw new ForbiddenException('Can only cancel own orders');
    }
    return this.ordersService.cancelOrder(id);
  }
}
