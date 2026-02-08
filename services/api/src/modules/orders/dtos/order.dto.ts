import { IsUUID, IsString, IsOptional, IsEnum } from 'class-validator';
import { OrderStatus } from '../../../common/enums';

export class CreateOrderDto {
  @IsUUID()
  userId: string;

  @IsOptional()
  @IsString()
  customerEmail?: string;

  @IsOptional()
  @IsString()
  customerPhone?: string;

  @IsOptional()
  @IsUUID()
  shippingAddressId?: string;
}

export class UpdateOrderStatusDto {
  @IsEnum(OrderStatus)
  status: OrderStatus;
}

export class OrderItemResponseDto {
  id: string;
  orderId: string;
  productId: string;
  quantity: number;
  price: number;
  createdAt: Date;
}

export class OrderResponseDto {
  id: string;
  orderNumber: string;
  userId: string;
  status: string;
  paymentStatus: string;
  subtotal: number;
  tax: number;
  shippingCost: number;
  discount: number;
  total: number;
  items: OrderItemResponseDto[];
  createdAt: Date;
  updatedAt: Date;
}

export class OrderQueryDto {
  skip?: number;
  take?: number;
  userId?: string;
  status?: string;
}
