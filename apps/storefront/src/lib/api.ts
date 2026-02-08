const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3333/api/v1';

export interface Product {
  id: string;
  name: string;
  description?: string;
  basePrice: number;
  stock: number;
  categoryId?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ProductsResponse {
  products: Product[];
  total: number;
}

/**
 * Fetch all products from the API
 */
export async function fetchProducts(
  skip: number = 0,
  take: number = 100,
): Promise<ProductsResponse> {
  try {
    const response = await fetch(
      `${API_BASE_URL}/products?skip=${skip}&take=${take}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        // Use 'no-store' for real-time data in development
        cache: 'no-store',
      },
    );

    if (!response.ok) {
      throw new Error(`API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching products:', error);
    return {
      products: [],
      total: 0,
    };
  }
}

/**
 * Fetch a single product by ID
 */
export async function fetchProductById(id: string): Promise<Product | null> {
  try {
    const response = await fetch(`${API_BASE_URL}/products/${id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status} ${response.statusText}`);
    }

    const product = await response.json();
    return product;
  } catch (error) {
    console.error(`Error fetching product ${id}:`, error);
    return null;
  }
}

/**
 * Fetch categories
 */
export async function fetchCategories() {
  try {
    const response = await fetch(`${API_BASE_URL}/categories`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status} ${response.statusText}`);
    }

    const categories = await response.json();
    return categories;
  } catch (error) {
    console.error('Error fetching categories:', error);
    return [];
  }
}
