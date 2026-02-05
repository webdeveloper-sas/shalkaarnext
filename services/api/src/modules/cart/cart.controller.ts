import { Controller, Get, Post, Delete, Body, Param } from '@nestjs/common';
import { CartService } from './cart.service';

@Controller('cart')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Get()
  async getCart(@Body('userId') userId: string) {
    return this.cartService.getCart(userId);
  }

  @Post('items')
  async addItem(
    @Body('userId') userId: string,
    @Body('productId') productId: string,
    @Body('quantity') quantity: number,
  ) {
    return this.cartService.addItem(userId, productId, quantity);
  }

  @Delete('items/:itemId')
  async removeItem(@Param('itemId') itemId: string, @Body('userId') userId: string) {
    return this.cartService.removeItem(userId, itemId);
  }
}
