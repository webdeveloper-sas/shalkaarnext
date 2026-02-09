"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";

export interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  role: "CUSTOMER" | "VENDOR" | "ADMIN";
}

export interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, firstName: string, lastName: string) => Promise<void>;
  logout: () => void;
  token: string | null;
  refreshToken: () => Promise<void>;
  updateUser: (user: User) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);
const TOKEN_STORAGE_KEY = "shalkaar_auth_token";
const REFRESH_TOKEN_KEY = "shalkaar_refresh_token";
const USER_STORAGE_KEY = "shalkaar_user";
const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3333/api/v1";
const TOKEN_EXPIRY_BUFFER = 5 * 60 * 1000; // Refresh 5 minutes before expiry

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [refreshTokenTimeout, setRefreshTokenTimeout] = useState<any | null>(null);

  // Helper function to decode JWT and get expiry time
  const getTokenExpiry = useCallback((jwtToken: string): number => {
    try {
      const parts = jwtToken.split(".");
      if (parts.length !== 3) return 0;

      const decoded = JSON.parse(atob(parts[1]));
      return (decoded.exp || 0) * 1000; // Convert to milliseconds
    } catch {
      return 0;
    }
  }, []);

  // Helper function to schedule token refresh
  const scheduleTokenRefresh = useCallback(
    (jwtToken: string) => {
      if (refreshTokenTimeout) clearTimeout(refreshTokenTimeout);

      const expiryTime = getTokenExpiry(jwtToken);
      if (!expiryTime) return;

      const now = Date.now();
      const timeUntilRefresh = expiryTime - now - TOKEN_EXPIRY_BUFFER;

      if (timeUntilRefresh > 0) {
        const timeout = setTimeout(async () => {
          try {
            await refreshToken();
          } catch (error) {
            console.error("Token refresh failed, logging out:", error);
            logout();
          }
        }, timeUntilRefresh);

        setRefreshTokenTimeout(timeout);
      }
    },
    [getTokenExpiry, refreshTokenTimeout]
  );

  // Hydrate from localStorage on mount
  useEffect(() => {
    try {
      const savedToken = localStorage.getItem(TOKEN_STORAGE_KEY);
      const savedUser = localStorage.getItem(USER_STORAGE_KEY);

      if (savedToken && savedUser) {
        setToken(savedToken);
        setUser(JSON.parse(savedUser));
        scheduleTokenRefresh(savedToken);
      }
    } catch (error) {
      console.error("Failed to restore auth state:", error);
      localStorage.removeItem(TOKEN_STORAGE_KEY);
      localStorage.removeItem(REFRESH_TOKEN_KEY);
      localStorage.removeItem(USER_STORAGE_KEY);
    } finally {
      setIsLoading(false);
    }
  }, [scheduleTokenRefresh]);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Login failed");
      }

      const data = await response.json();
      const { access_token, refresh_token, user: userData } = data;

      setToken(access_token);
      setUser(userData);

      localStorage.setItem(TOKEN_STORAGE_KEY, access_token);
      if (refresh_token) {
        localStorage.setItem(REFRESH_TOKEN_KEY, refresh_token);
      }
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(userData));

      scheduleTokenRefresh(access_token);
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (
    email: string,
    password: string,
    firstName: string,
    lastName: string
  ) => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_URL}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          password,
          firstName,
          lastName,
          role: "CUSTOMER",
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Registration failed");
      }

      const data = await response.json();
      const { access_token, refresh_token, user: userData } = data;

      setToken(access_token);
      setUser(userData);

      localStorage.setItem(TOKEN_STORAGE_KEY, access_token);
      if (refresh_token) {
        localStorage.setItem(REFRESH_TOKEN_KEY, refresh_token);
      }
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(userData));

      scheduleTokenRefresh(access_token);
    } finally {
      setIsLoading(false);
    }
  };

  const refreshToken = async () => {
    try {
      const refreshTokenValue = localStorage.getItem(REFRESH_TOKEN_KEY);
      if (!refreshTokenValue) {
        throw new Error("No refresh token available");
      }

      const response = await fetch(`${API_URL}/auth/refresh-token`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refresh_token: refreshTokenValue }),
      });

      if (!response.ok) {
        logout();
        throw new Error("Token refresh failed");
      }

      const data = await response.json();
      const { access_token, refresh_token: newRefreshToken, user: userData } = data;

      setToken(access_token);
      setUser(userData);

      localStorage.setItem(TOKEN_STORAGE_KEY, access_token);
      if (newRefreshToken) {
        localStorage.setItem(REFRESH_TOKEN_KEY, newRefreshToken);
      }
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(userData));

      scheduleTokenRefresh(access_token);
    } catch (error) {
      console.error("Token refresh error:", error);
      logout();
      throw error;
    }
  };

  const updateUser = (updatedUser: User) => {
    setUser(updatedUser);
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(updatedUser));
  };

  const logout = () => {
    if (refreshTokenTimeout) clearTimeout(refreshTokenTimeout);
    setUser(null);
    setToken(null);
    localStorage.removeItem(TOKEN_STORAGE_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem(USER_STORAGE_KEY);
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (refreshTokenTimeout) clearTimeout(refreshTokenTimeout);
    };
  }, [refreshTokenTimeout]);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        logout,
        refreshToken,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
