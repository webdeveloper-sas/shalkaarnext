import {
  UserRole,
  ProductStatus,
  OrderStatus,
  PaymentMethod,
  PaymentStatus,
  ContentType,
} from './enums';

// ============ USER TYPES ============
export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserProfile extends User {
  phone?: string;
  address?: string;
  city?: string;
  postalCode?: string;
  country?: string;
}

// ============ PRODUCT TYPES ============
export interface Product {
  id: string;
  name: string;
  nameUrdu: string;
  description: string;
  descriptionUrdu: string;
  slug: string;
  sku: string;
  price: number;
  currency: string;
  status: ProductStatus;
  collectionId: string;
  images: string[];
  materials: string[];
  embroideryTechniques: string[];
  origin: string;
  artisanId?: string;
  isFeatured: boolean;
  isLimited: boolean;
  quantity: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Collection {
  id: string;
  name: string;
  nameUrdu: string;
  slug: string;
  description: string;
  image: string;
  featured: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// ============ ORDER TYPES ============
export interface OrderItem {
  productId: string;
  quantity: number;
  price: number;
  total: number;
}

export interface Order {
  id: string;
  userId: string;
  items: OrderItem[];
  subtotal: number;
  shippingCost: number;
  tax: number;
  total: number;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  shippingAddress: string;
  trackingNumber?: string;
  createdAt: Date;
  updatedAt: Date;
}

// ============ CART TYPES ============
export interface CartItem {
  productId: string;
  quantity: number;
  price: number;
  addedAt: Date;
}

export interface Cart {
  userId: string;
  items: CartItem[];
  lastUpdated: Date;
}

// ============ WISHLIST TYPES ============
export interface Wishlist {
  userId: string;
  productIds: string[];
  createdAt: Date;
  updatedAt: Date;
}

// ============ PAYMENT TYPES ============
export interface Payment {
  id: string;
  orderId: string;
  method: PaymentMethod;
  amount: number;
  status: PaymentStatus;
  transactionId?: string;
  errorMessage?: string;
  createdAt: Date;
  updatedAt: Date;
}

// ============ CONTENT TYPES ============
export interface Content {
  id: string;
  type: ContentType;
  title: string;
  slug: string;
  content: string;
  author: string;
  image?: string;
  featured: boolean;
  published: boolean;
  publishedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// ============ ARTISAN TYPES ============
export interface Artisan {
  id: string;
  name: string;
  nameUrdu: string;
  bio: string;
  bioUrdu: string;
  region: string;
  image: string;
  specialties: string[];
  yearsOfExperience: number;
  featured: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// ============ ANALYTICS TYPES ============
export interface ProductAnalytics {
  productId: string;
  views: number;
  purchases: number;
  revenue: number;
  averageRating: number;
}

export interface SalesAnalytics {
  date: Date;
  totalOrders: number;
  totalRevenue: number;
  totalCustomers: number;
}

// ============ API RESPONSE TYPES ============
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  meta?: {
    pagination?: {
      total: number;
      limit: number;
      offset: number;
    };
  };
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  limit: number;
  offset: number;
}
