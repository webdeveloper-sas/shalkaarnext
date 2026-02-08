import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  UseGuards,
  HttpCode,
  ForbiddenException,
} from '@nestjs/common';
import { CartService } from '../services/cart.service';
import { AddToCartDto, UpdateCartItemDto, CartResponseDto, CartSummaryDto } from '../dtos/cart.dto';
import { JwtAuthGuard, RolesGuard } from '../../../common/guards';
import { Roles, CurrentUser } from '../../../common/decorators';
import { UserRole } from '../../../common/enums';

@Controller('cart')
@UseGuards(JwtAuthGuard, RolesGuard)
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Get(':userId')
  @Roles(UserRole.CUSTOMER, UserRole.VENDOR)
  async getCart(@Param('userId') userId: string, @CurrentUser() user: any): Promise<CartResponseDto> {
    if (user.id !== userId) {
      throw new ForbiddenException('Can only access own cart');
    }
    return this.cartService.getCart(userId);
  }

  @Get(':userId/summary')
  @Roles(UserRole.CUSTOMER, UserRole.VENDOR)
  async getCartSummary(@Param('userId') userId: string, @CurrentUser() user: any): Promise<CartSummaryDto> {
    if (user.id !== userId) {
      throw new ForbiddenException('Can only access own cart');
    }
    return this.cartService.getCartSummary(userId);
  }

  @Post(':userId/items')
  @Roles(UserRole.CUSTOMER, UserRole.VENDOR)
  @HttpCode(201)
  async addToCart(
    @Param('userId') userId: string,
    @Body() data: AddToCartDto,
    @CurrentUser() user: any,
  ): Promise<CartResponseDto> {
    if (user.id !== userId) {
      throw new ForbiddenException('Can only modify own cart');
    }
    return this.cartService.addToCart(userId, data);
  }

  @Patch('items/:itemId')
  @Roles(UserRole.CUSTOMER, UserRole.VENDOR)
  async updateCartItem(
    @Param('itemId') itemId: string,
    @Body() data: UpdateCartItemDto,
  ): Promise<CartResponseDto> {
    return this.cartService.updateCartItem(itemId, data);
  }

  @Delete('items/:itemId')
  @Roles(UserRole.CUSTOMER, UserRole.VENDOR)
  @HttpCode(204)
  async removeFromCart(@Param('itemId') itemId: string) {
    return this.cartService.removeFromCart(itemId);
  }

  @Delete(':userId')
  @Roles(UserRole.CUSTOMER, UserRole.VENDOR)
  @HttpCode(204)
  async clearCart(@Param('userId') userId: string, @CurrentUser() user: any) {
    if (user.id !== userId) {
      throw new ForbiddenException('Can only clear own cart');
    }
    return this.cartService.clearCart(userId);
  }
}
