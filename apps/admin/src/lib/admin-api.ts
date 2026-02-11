import { getToken } from '@/lib/auth';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3333/api/v1';

/**
 * Get auth headers with JWT token
 */
function getAuthHeaders(): HeadersInit {
  const token = getToken();
  return {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
  };
}

/**
 * Dashboard Statistics
 */
export interface DashboardStats {
  totalOrders: number;
  totalRevenue: number;
  totalCustomers: number;
  totalProducts: number;
}

export async function fetchDashboardStats(): Promise<DashboardStats> {
  try {
    // For now, calculate from other endpoints
    const [products, orders] = await Promise.all([
      fetch(`${API_BASE_URL}/products?take=1`, { headers: getAuthHeaders() }).then(r => r.json()),
      fetch(`${API_BASE_URL}/orders?take=1`, { headers: getAuthHeaders() }).then(r => r.json()),
    ]);

    return {
      totalProducts: products.total || 0,
      totalOrders: orders.total || 0,
      totalRevenue: 0, // Would come from aggregation endpoint
      totalCustomers: 0, // Would come from customers endpoint
    };
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return {
      totalProducts: 0,
      totalOrders: 0,
      totalRevenue: 0,
      totalCustomers: 0,
    };
  }
}

/**
 * Product
 */
export interface Product {
  id: string;
  name: string;
  description?: string;
  basePrice: number;
  stock: number;
  categoryId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProductsResponse {
  products: Product[];
  total: number;
}

export async function fetchProducts(skip: number = 0, take: number = 20): Promise<ProductsResponse> {
  try {
    const response = await fetch(
      `${API_BASE_URL}/products?skip=${skip}&take=${take}`,
      { headers: getAuthHeaders() }
    );

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    return response.json();
  } catch (error) {
    console.error('Error fetching products:', error);
    return { products: [], total: 0 };
  }
}

/**
 * Order
 */
export interface Order {
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
  customerEmail?: string;
  customerPhone?: string;
  createdAt: string;
  updatedAt: string;
}

export interface OrdersResponse {
  orders: Order[];
  total: number;
}

export async function fetchOrders(skip: number = 0, take: number = 20): Promise<OrdersResponse> {
  try {
    const response = await fetch(
      `${API_BASE_URL}/orders?skip=${skip}&take=${take}`,
      { headers: getAuthHeaders() }
    );

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    return response.json();
  } catch (error) {
    console.error('Error fetching orders:', error);
    return { orders: [], total: 0 };
  }
}

/**
 * User / Customer
 */
export interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  role: string;
  createdAt: string;
  updatedAt: string;
}

export interface UsersResponse {
  users: User[];
  total: number;
}

export async function fetchCustomers(skip: number = 0, take: number = 20): Promise<UsersResponse> {
  try {
    const response = await fetch(
      `${API_BASE_URL}/users?skip=${skip}&take=${take}`,
      { headers: getAuthHeaders() }
    );

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    return response.json();
  } catch (error) {
    console.error('Error fetching customers:', error);
    return { users: [], total: 0 };
  }
}

/**
 * Category
 */
export interface Category {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

export interface CategoriesResponse {
  categories: Category[];
  total: number;
}

export async function fetchCategories(): Promise<CategoriesResponse> {
  try {
    const response = await fetch(
      `${API_BASE_URL}/categories`,
      { headers: getAuthHeaders() }
    );

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    return response.json();
  } catch (error) {
    console.error('Error fetching categories:', error);
    return { categories: [], total: 0 };
  }
}
