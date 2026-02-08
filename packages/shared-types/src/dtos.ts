// ============================================================================
// USER DTOs
// ============================================================================

export enum UserRoleEnum {
  CUSTOMER = 'CUSTOMER',
  ADMIN = 'ADMIN',
  SUPER_ADMIN = 'SUPER_ADMIN',
}

export interface CreateUserDto {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  role?: UserRoleEnum;
}

export interface UpdateUserDto {
  firstName?: string;
  lastName?: string;
  phone?: string;
  email?: string;
}

export interface UserResponseDto {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  role: UserRoleEnum;
  isEmailVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface AuthResponseDto {
  accessToken: string;
  refreshToken: string;
  user: UserResponseDto;
}

// ============================================================================
// PRODUCT DTOs (Enhanced from Phase 0)
// ============================================================================

export interface CreateProductDto {
  name: string;
  nameUrdu?: string;
  slug: string;
  description?: string;
  descriptionUrdu?: string;
  categoryId: string;
  collectionId?: string;
  basePrice: number;
  originRegion?: string;
  artisanName?: string;
  craftTechnique?: string;
  materials?: string;
  careInstructions?: string;
}

export interface UpdateProductDto {
  name?: string;
  nameUrdu?: string;
  slug?: string;
  description?: string;
  descriptionUrdu?: string;
  categoryId?: string;
  collectionId?: string;
  basePrice?: number;
  isFeatured?: boolean;
  isArchived?: boolean;
  originRegion?: string;
  artisanName?: string;
  craftTechnique?: string;
  materials?: string;
  careInstructions?: string;
}

export interface ProductVariantDto {
  size?: string;
  color?: string;
  price: number;
  comparePrice?: number;
  costPrice?: number;
  sku: string;
  barcode?: string;
}

export interface ProductResponseDto {
  id: string;
  sku: string;
  name: string;
  nameUrdu?: string;
  slug: string;
  description?: string;
  descriptionUrdu?: string;
  basePrice: number;
  isFeatured: boolean;
  isArchived: boolean;
  originRegion?: string;
  artisanName?: string;
  craftTechnique?: string;
  materials?: string;
  careInstructions?: string;
  isAuthentic: boolean;
  categoryId: string;
  collectionId?: string;
  variants?: ProductVariantDto[];
  media?: ProductMediaDto[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ProductMediaDto {
  id: string;
  url: string;
  altText?: string;
  mediaType: 'IMAGE' | 'VIDEO';
  isThumbnail: boolean;
  order: number;
}

// Legacy DTOs (Phase 0) - kept for backwards compatibility
export interface CreateProductDTO {
  name: string;
  nameUrdu: string;
  description: string;
  descriptionUrdu: string;
  sku: string;
  price: number;
  collectionId: string;
  images: string[];
  materials: string[];
  embroideryTechniques: string[];
  origin: string;
  artisanId?: string;
  quantity: number;
}

export interface UpdateProductDTO {
  name?: string;
  description?: string;
  price?: number;
  quantity?: number;
  status?: string;
}

// ============================================================================
// CATEGORY DTOs
// ============================================================================

export interface CreateCategoryDto {
  name: string;
  slug: string;
  description?: string;
}

export interface UpdateCategoryDto {
  name?: string;
  slug?: string;
  description?: string;
}

export interface CategoryResponseDto {
  id: string;
  name: string;
  slug: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

// ============================================================================
// COLLECTION DTOs (Enhanced from Phase 0)
// ============================================================================

export interface CreateCollectionDTO {
  name: string;
  nameUrdu: string;
  slug: string;
  description: string;
  image: string;
}

export interface CreateCollectionDto {
  name: string;
  slug: string;
  description?: string;
  image?: string;
}

// ============================================================================
// CART DTOs
// ============================================================================

export interface AddToCartDto {
  productId: string;
  variantId?: string;
  quantity: number;
}

export interface UpdateCartItemDto {
  quantity: number;
}

export interface CartItemDto {
  id: string;
  productId: string;
  product?: ProductResponseDto;
  variantId?: string;
  quantity: number;
  priceAtAdd: number;
  subtotal: number;
}

export interface CartResponseDto {
  id: string;
  userId: string;
  items: CartItemDto[];
  itemCount: number;
  subtotal: number;
  tax: number;
  shippingCost: number;
  discount: number;
  total: number;
  createdAt: Date;
  updatedAt: Date;
}

// ============================================================================
// ORDER DTOs (Enhanced from Phase 0)
// ============================================================================

export enum OrderStatusEnum {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  PROCESSING = 'PROCESSING',
  SHIPPED = 'SHIPPED',
  DELIVERED = 'DELIVERED',
  CANCELLED = 'CANCELLED',
  RETURNED = 'RETURNED',
}

export enum OrderPaymentStatusEnum {
  PENDING = 'PENDING',
  PAID = 'PAID',
  FAILED = 'FAILED',
  REFUNDED = 'REFUNDED',
}

export interface CreateOrderDto {
  userId: string;
  cartId: string;
  shippingAddressId: string;
  customerEmail: string;
  customerPhone?: string;
  notes?: string;
}

export interface CreateOrderDTO {
  items: Array<{
    productId: string;
    quantity: number;
  }>;
  shippingAddress: string;
}

export interface OrderItemResponseDto {
  id: string;
  productId: string;
  productName: string;
  variantId?: string;
  quantity: number;
  pricePerUnit: number;
  subtotal: number;
}

export interface OrderResponseDto {
  id: string;
  orderNumber: string;
  userId: string;
  status: OrderStatusEnum;
  paymentStatus: OrderPaymentStatusEnum;
  subtotal: number;
  tax: number;
  shippingCost: number;
  discount: number;
  total: number;
  customerEmail: string;
  customerPhone?: string;
  items: OrderItemResponseDto[];
  trackingNumber?: string;
  estimatedDeliveryDate?: Date;
  actualDeliveryDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// ============================================================================
// ADDRESS DTOs
// ============================================================================

export enum AddressTypeEnum {
  BILLING = 'BILLING',
  SHIPPING = 'SHIPPING',
  BOTH = 'BOTH',
}

export interface CreateAddressDto {
  label?: string;
  type: AddressTypeEnum;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  country?: string;
  isDefault?: boolean;
}

export interface UpdateAddressDto {
  label?: string;
  type?: AddressTypeEnum;
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
  isDefault?: boolean;
}

export interface AddressResponseDto {
  id: string;
  userId: string;
  label?: string;
  type: AddressTypeEnum;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  isDefault: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// ============================================================================
// CONTENT DTOs (Legacy - Phase 0)
// ============================================================================

export interface CreateContentDTO {
  type: string;
  title: string;
  slug: string;
  content: string;
  author: string;
  image?: string;
  featured?: boolean;
}

// ============================================================================
// GENERIC RESPONSE DTOs
// ============================================================================

export interface PaginatedResponseDto<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface ApiResponseDto<T> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
  timestamp: Date;
}

export interface PaginationDto {
  page?: number;
  limit?: number;
}


export interface RegisterDTO {
  email: string;
  password: string;
  name: string;
}

export interface LoginDTO {
  email: string;
  password: string;
}

export interface AddToCartDTO {
  productId: string;
  quantity: number;
}

// Response DTOs (same as domain types, can extend)
export type ProductResponseDTO = any; // Will import from types.ts
export type OrderResponseDTO = any;
export type CollectionResponseDTO = any;
