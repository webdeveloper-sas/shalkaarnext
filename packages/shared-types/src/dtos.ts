// Request DTOs
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

export interface CreateCollectionDTO {
  name: string;
  nameUrdu: string;
  slug: string;
  description: string;
  image: string;
}

export interface CreateOrderDTO {
  items: Array<{
    productId: string;
    quantity: number;
  }>;
  shippingAddress: string;
}

export interface CreateContentDTO {
  type: string;
  title: string;
  slug: string;
  content: string;
  author: string;
  image?: string;
  featured?: boolean;
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
