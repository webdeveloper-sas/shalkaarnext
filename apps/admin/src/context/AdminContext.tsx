"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import type { User } from "@shalkaar/shared-types";
import { UserRole } from "@shalkaar/shared-types";

interface AdminContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  role: UserRole | null;
  canAccess: (_requiredRole: UserRole) => boolean;
  login: (_email: string, _password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

export function AdminProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  void setUser;

  useEffect(() => {
    const initializeAdmin = async () => {
      // TODO: Check for active admin session
      // TODO: Verify user has admin or super_admin role
      void setUser;
      setIsLoading(false);
    };
    initializeAdmin();
  }, []);

  const canAccess = (_requiredRole: UserRole): boolean => {
    if (!user) return false;
    // TODO: Implement role-based access control
    return user.role === UserRole.ADMIN || user.role === UserRole.SUPER_ADMIN;
  };

  const login = async (_email: string, _password: string) => {
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
