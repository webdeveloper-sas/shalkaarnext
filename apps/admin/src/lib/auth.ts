export interface AuthUser {
  id: string;
  email: string;
  role: 'admin' | 'staff';
}

export interface AuthResponse {
  accessToken: string;
  user: AuthUser;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3333/api/v1';

/**
 * Login with email and password
 */
export async function loginUser(credentials: LoginCredentials): Promise<AuthResponse> {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(credentials),
    credentials: 'include', // Send cookies
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Login failed');
  }

  return response.json();
}

/**
 * Logout user
 */
export async function logoutUser(): Promise<void> {
  try {
    await fetch(`${API_BASE_URL}/auth/logout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });
  } catch (error) {
    console.error('Logout error:', error);
  }
}

/**
 * Verify token and get current user
 */
export async function verifyToken(token: string): Promise<AuthUser | null> {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/verify`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    return data.user || null;
  } catch (error) {
    console.error('Token verification error:', error);
    return null;
  }
}

/**
 * Check if user has required role
 */
export function hasRole(userRole: string, requiredRole: 'admin' | 'staff'): boolean {
  const roleHierarchy: Record<string, number> = {
    admin: 2,
    staff: 1,
  };

  const userLevel = roleHierarchy[userRole] || 0;
  const requiredLevel = roleHierarchy[requiredRole] || 0;

  return userLevel >= requiredLevel;
}

/**
 * Get token from storage
 */
export function getToken(): string | null {
  if (typeof window === 'undefined') {
    return null;
  }

  // Try to get from localStorage first
  try {
    return localStorage.getItem('auth_token');
  } catch (error) {
    console.error('Error reading token from localStorage:', error);
    return null;
  }
}

/**
 * Save token to storage
 */
export function saveToken(token: string): void {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    localStorage.setItem('auth_token', token);
  } catch (error) {
    console.error('Error saving token to localStorage:', error);
  }
}

/**
 * Clear token from storage
 */
export function clearToken(): void {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    localStorage.removeItem('auth_token');
  } catch (error) {
    console.error('Error clearing token from localStorage:', error);
  }
}
