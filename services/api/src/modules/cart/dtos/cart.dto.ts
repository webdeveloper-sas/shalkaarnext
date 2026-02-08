import { IsUUID, IsNumber, IsOptional } from 'class-validator';

export class AddToCartDto {
  @IsUUID()
  productId: string;

  @IsNumber()
  quantity: number;

  @IsOptional()
  @IsUUID()
  variantId?: string;
}

export class UpdateCartItemDto {
  @IsNumber()
  quantity: number;
}

export class CartItemResponseDto {
  id: string;
  cartId: string;
  productId: string;
  quantity: number;
  createdAt: Date;
  updatedAt: Date;
}

export class CartResponseDto {
  id: string;
  userId: string;
  items: CartItemResponseDto[];
  subtotal: number; // Pre-tax total
  tax: number; // 17% GST
  shippingCost: number;
  discount: number;
  total: number; // Final total (subtotal + tax + shipping - discount)
  createdAt: Date;
  updatedAt: Date;
}

export class CartSummaryDto {
  itemCount: number; // Number of unique items
  totalItems: number; // Total quantity across all items
  subtotal: number;
  tax: number;
  shippingCost: number;
  discount: number;
  total: number;
}

