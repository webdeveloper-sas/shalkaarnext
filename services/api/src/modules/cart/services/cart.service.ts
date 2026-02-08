import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { AddToCartDto, UpdateCartItemDto, CartResponseDto, CartSummaryDto } from '../dtos/cart.dto';

const GST_RATE = 0.17; // 17% GST
const SHIPPING_BASE = 50; // Base shipping amount
const FREE_SHIPPING_THRESHOLD = 500; // Free shipping above 500

@Injectable()
export class CartService {
  constructor(private readonly prisma: PrismaService) {}

  async getCart(userId: string): Promise<CartResponseDto> {
    let cart = await this.prisma.cart.findUnique({
      where: { userId },
      include: {
        items: {
          include: { product: true },
        },
      },
    });

    if (!cart) {
      cart = await this.prisma.cart.create({
        data: { userId },
        include: {
          items: {
            include: { product: true },
          },
        },
      });
    }

    return this.enrichCartWithCalculations(cart);
  }

  async addToCart(userId: string, data: AddToCartDto): Promise<CartResponseDto> {
    const product = await this.prisma.product.findUnique({
      where: { id: data.productId },
    });

    if (!product) {
      throw new NotFoundException(`Product with ID ${data.productId} not found`);
    }

    // Validate stock availability
    if (product.stock < data.quantity) {
      throw new BadRequestException(
        `Insufficient stock. Available: ${product.stock}, Requested: ${data.quantity}`,
      );
    }

    let cart = await this.prisma.cart.findUnique({
      where: { userId },
    });

    if (!cart) {
      cart = await this.prisma.cart.create({
        data: { userId },
      });
    }

    // Check if item already in cart
    const existingItem = await this.prisma.cartItem.findFirst({
      where: {
        cartId: cart.id,
        productId: data.productId,
      },
    });

    if (existingItem) {
      // Merge quantities
      const newQuantity = existingItem.quantity + data.quantity;
      if (product.stock < newQuantity) {
        throw new BadRequestException(
          `Total quantity exceeds available stock. Available: ${product.stock}, Requested: ${newQuantity}`,
        );
      }

      await this.prisma.cartItem.update({
        where: { id: existingItem.id },
        data: { quantity: newQuantity },
      });
    } else {
      // Add new item
      await this.prisma.cartItem.create({
        data: {
          cartId: cart.id,
          productId: data.productId,
          quantity: data.quantity,
        },
      });
    }

    // Fetch updated cart
    const updatedCart = await this.prisma.cart.findUnique({
      where: { id: cart.id },
      include: {
        items: {
          include: { product: true },
        },
      },
    });

    return this.enrichCartWithCalculations(updatedCart);
  }

  async updateCartItem(itemId: string, data: UpdateCartItemDto): Promise<CartResponseDto> {
    const item = await this.prisma.cartItem.findUnique({
      where: { id: itemId },
      include: { product: true },
    });

    if (!item) {
      throw new NotFoundException(`Cart item with ID ${itemId} not found`);
    }

    // Validate stock availability
    if (item.product.stock < data.quantity) {
      throw new BadRequestException(
        `Insufficient stock. Available: ${item.product.stock}, Requested: ${data.quantity}`,
      );
    }

    await this.prisma.cartItem.update({
      where: { id: itemId },
      data: { quantity: data.quantity },
    });

    const updatedCart = await this.prisma.cart.findUnique({
      where: { id: item.cartId },
      include: {
        items: {
          include: { product: true },
        },
      },
    });

    return this.enrichCartWithCalculations(updatedCart);
  }

  async removeFromCart(itemId: string): Promise<CartResponseDto> {
    const item = await this.prisma.cartItem.findUnique({
      where: { id: itemId },
    });

    if (!item) {
      throw new NotFoundException(`Cart item with ID ${itemId} not found`);
    }

    await this.prisma.cartItem.delete({
      where: { id: itemId },
    });

    const updatedCart = await this.prisma.cart.findUnique({
      where: { id: item.cartId },
      include: {
        items: {
          include: { product: true },
        },
      },
    });

    return this.enrichCartWithCalculations(updatedCart);
  }

  async clearCart(userId: string): Promise<CartResponseDto> {
    const cart = await this.prisma.cart.findUnique({
      where: { userId },
    });

    if (!cart) {
      throw new NotFoundException(`Cart for user ${userId} not found`);
    }

    await this.prisma.cartItem.deleteMany({
      where: { cartId: cart.id },
    });

    const clearedCart = await this.prisma.cart.findUnique({
      where: { id: cart.id },
      include: {
        items: {
          include: { product: true },
        },
      },
    });

    return this.enrichCartWithCalculations(clearedCart);
  }

  async getCartSummary(userId: string): Promise<CartSummaryDto> {
    const cart = await this.getCart(userId);

    return {
      itemCount: cart.items?.length || 0,
      totalItems: cart.items?.reduce((sum, item) => sum + item.quantity, 0) || 0,
      subtotal: cart.subtotal,
      tax: cart.tax,
      shippingCost: cart.shippingCost,
      discount: cart.discount,
      total: cart.total,
    };
  }

  private enrichCartWithCalculations(cart: any): CartResponseDto {
    // Calculate subtotal from items
    const subtotal = cart.items?.reduce((sum, item) => {
      const itemPrice = Number(item.product.basePrice);
      const itemTotal = itemPrice * item.quantity;
      return sum + itemTotal;
    }, 0) || 0;

    // Calculate tax (17% GST)
    const tax = Math.round(subtotal * GST_RATE * 100) / 100;

    // Calculate shipping (free above threshold)
    const shippingCost = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_BASE;

    // Discount (can be extended with coupon logic)
    const discount = 0;

    // Calculate total
    const total = Math.round((subtotal + tax + shippingCost - discount) * 100) / 100;

    return {
      id: cart.id,
      userId: cart.userId,
      items: cart.items?.map((item) => ({
        id: item.id,
        cartId: item.cartId,
        productId: item.productId,
        quantity: item.quantity,
        createdAt: item.createdAt,
        updatedAt: item.updatedAt,
      })) || [],
      subtotal,
      tax,
      shippingCost,
      discount,
      total,
      createdAt: cart.createdAt,
      updatedAt: cart.updatedAt,
    };
  }
}
