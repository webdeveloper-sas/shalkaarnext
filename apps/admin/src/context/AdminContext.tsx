"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import type { User, UserRole } from "@shalkaar/shared-types";

interface AdminContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  role: UserRole | null;
  canAccess: (requiredRole: UserRole) => boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

export function AdminProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initializeAdmin = async () => {
      // TODO: Check for active admin session
      // TODO: Verify user has admin or super_admin role
      setIsLoading(false);
    };
    initializeAdmin();
  }, []);

  const canAccess = (requiredRole: UserRole): boolean => {
    if (!user) return false;
    // TODO: Implement role-based access control
    return user.role === "admin" || user.role === "super_admin";
  };

  const login = async (email: string, password: string) => {
    // TODO: Call admin auth API endpoint
    // TODO: Verify response user has admin role
  };

  const logout = async () => {
    // TODO: Clear session and user state
  };

  return (
    <AdminContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        role: user?.role || null,
        canAccess,
        login,
        logout,
      }}
    >
      {children}
    </AdminContext.Provider>
  );
}

export function useAdmin() {
  const context = useContext(AdminContext);
  if (!context) {
    throw new Error("useAdmin must be used within AdminProvider");
  }
  return context;
}
