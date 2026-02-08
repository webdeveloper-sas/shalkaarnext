import { ApiResponse } from '@shalkaar/shared-types';

export class ApiClient {
  private baseUrl: string;

  constructor(baseUrl?: string) {
    this.baseUrl = baseUrl || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3333';
  }

  async get<T>(path: string, options?: RequestInit): Promise<ApiResponse<T>> {
    return this.request<T>(path, { ...options, method: 'GET' });
  }

  async post<T>(path: string, body?: unknown, options?: RequestInit): Promise<ApiResponse<T>> {
    return this.request<T>(path, {
      ...options,
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  async put<T>(path: string, body?: unknown, options?: RequestInit): Promise<ApiResponse<T>> {
    return this.request<T>(path, {
      ...options,
      method: 'PUT',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  async delete<T>(path: string, options?: RequestInit): Promise<ApiResponse<T>> {
    return this.request<T>(path, { ...options, method: 'DELETE' });
  }

  private async request<T>(
    path: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseUrl}${path}`;
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }
}

export const apiClient = new ApiClient();

// Endpoint helpers
export const productEndpoints = {
  list: (limit?: number, offset?: number) =>
    `/api/v1/products${limit ? `?limit=${limit}&offset=${offset || 0}` : ''}`,
  detail: (id: string) => `/api/v1/products/${id}`,
  create: () => '/api/v1/products',
  update: (id: string) => `/api/v1/products/${id}`,
  delete: (id: string) => `/api/v1/products/${id}`,
};

export const collectionEndpoints = {
  list: () => '/api/v1/collections',
  detail: (slug: string) => `/api/v1/collections/${slug}`,
};

export const orderEndpoints = {
  create: () => '/api/v1/orders',
  detail: (id: string) => `/api/v1/orders/${id}`,
  userOrders: (userId: string) => `/api/v1/orders/user/${userId}`,
};

export const authEndpoints = {
  register: () => '/api/v1/auth/register',
  login: () => '/api/v1/auth/login',
  logout: () => '/api/v1/auth/logout',
  refreshToken: () => '/api/v1/auth/refresh-token',
};

export const cartEndpoints = {
  get: () => '/api/v1/cart',
  addItem: () => '/api/v1/cart/items',
  removeItem: (itemId: string) => `/api/v1/cart/items/${itemId}`,
};

export const contentEndpoints = {
  list: () => '/api/v1/content/stories',
  detail: (slug: string) => `/api/v1/content/stories/${slug}`,
};
