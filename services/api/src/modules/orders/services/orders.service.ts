import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { CreateOrderDto, UpdateOrderStatusDto, OrderResponseDto, OrderQueryDto } from '../dtos/order.dto';
import { OrderStatus, PaymentStatus } from '../../../common/enums';
import { PaymentService } from '../../payments/services/payment.service';

@Injectable()
export class OrdersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly paymentService: PaymentService,
  ) {}

  async getAllOrders(query: OrderQueryDto): Promise<{ orders: OrderResponseDto[]; total: number }> {
    const skip = query.skip || 0;
    const take = query.take || 10;

    const where: any = {};
    if (query.userId) where.userId = query.userId;
    if (query.status) where.status = query.status;

    const [orders, total] = await Promise.all([
      this.prisma.order.findMany({
        skip,
        take,
        where,
        include: {
          items: { include: { product: true } },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.order.count({ where }),
    ]);

    return {
      orders: orders.map((o) => this.formatOrder(o)) as OrderResponseDto[],
      total,
    };
  }

  async getOrderById(id: string): Promise<OrderResponseDto> {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: {
        items: { include: { product: true } },
      },
    });

    if (!order) {
      throw new NotFoundException(`Order with ID ${id} not found`);
    }

    return this.formatOrder(order);
  }

  async createOrder(data: CreateOrderDto): Promise<OrderResponseDto> {
    // Validate user and fetch cart for price calculation
    const user = await this.prisma.user.findUnique({ where: { id: data.userId } });
    if (!user) {
      throw new NotFoundException(`User with ID ${data.userId} not found`);
    }

    // Get user's cart for order items
    const cart = await this.prisma.cart.findUnique({
      where: { userId: data.userId },
      include: { items: { include: { product: true } } },
    });

    if (!cart || cart.items.length === 0) {
      throw new BadRequestException('Cart is empty - cannot create order');
    }

    // Validate stock for all cart items
    for (const item of cart.items) {
      const product = await this.prisma.product.findUnique({ where: { id: item.productId } });
      if (!product || product.stock < item.quantity) {
        throw new BadRequestException(
          `Insufficient stock for product ${item.productId}. Available: ${product?.stock || 0}, Requested: ${item.quantity}`,
        );
      }
    }

    // Calculate order totals from cart items
    const subtotal = cart.items.reduce((sum, item) => {
      const price = typeof item.product.basePrice === 'number' 
        ? item.product.basePrice 
        : Number(item.product.basePrice);
      return sum + price * item.quantity;
    }, 0);
    const tax = Math.round(subtotal * 0.17 * 100) / 100; // 17% GST
    const shippingCost = subtotal >= 500 ? 0 : 50; // Free shipping over ₹500
    const discount = 0; // Extensible for coupons
    const total = Math.round((subtotal + tax + shippingCost - discount) * 100) / 100;

    // Process payment via mock gateway
    const paymentResult = await this.paymentService.processPayment({
      orderId: `ORD-${Date.now()}`,
      amount: total,
      currency: 'INR',
      email: data.customerEmail || 'noreply@shalkaar.com',
    });

    if (!paymentResult.success) {
      throw new BadRequestException(`Payment failed: ${paymentResult.message}`);
    }

    // Create order with payment info within a transaction
    const order = await this.prisma.$transaction(async (tx) => {
      // Create order
      const newOrder = await tx.order.create({
        data: {
          orderNumber: `ORD-${Date.now()}`,
          userId: data.userId,
          customerEmail: data.customerEmail,
          customerPhone: data.customerPhone,
          status: OrderStatus.PENDING,
          paymentStatus: PaymentStatus.COMPLETED,
          transactionId: paymentResult.transactionId,
          subtotal,
          tax,
          shippingCost,
          discount,
          total,
        },
      });

      // Create order items from cart
      for (const item of cart.items) {
        const price = typeof item.product.basePrice === 'number' 
          ? item.product.basePrice 
          : Number(item.product.basePrice);
        await tx.orderItem.create({
          data: {
            orderId: newOrder.id,
            productId: item.productId,
            quantity: item.quantity,
            price,
          },
        });

        // Deduct stock from product
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: { decrement: item.quantity } },
        });
      }

      // Clear user's cart
      await tx.cartItem.deleteMany({ where: { cart: { userId: data.userId } } });

      return newOrder;
    });

    // Fetch complete order with items for response
    const completeOrder = await this.prisma.order.findUnique({
      where: { id: order.id },
      include: { items: { include: { product: true } } },
    });

    return this.formatOrder(completeOrder);
  }

  async updateOrderStatus(id: string, data: UpdateOrderStatusDto): Promise<OrderResponseDto> {
    await this.getOrderById(id); // Verify exists

    const order = await this.prisma.order.update({
      where: { id },
      data: { status: data.status },
      include: { items: { include: { product: true } } },
    });

    return this.formatOrder(order);
  }

  async cancelOrder(id: string): Promise<OrderResponseDto> {
    await this.getOrderById(id);

    const order = await this.prisma.order.update({
      where: { id },
      data: { status: OrderStatus.CANCELLED },
      include: { items: { include: { product: true } } },
    });

    return this.formatOrder(order);
  }

  private formatOrder(order: any): OrderResponseDto {
    return {
      ...order,
      subtotal: Number(order.subtotal),
      tax: Number(order.tax),
      shippingCost: Number(order.shippingCost),
      discount: Number(order.discount),
      total: Number(order.total),
    };
  }
}
