"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import type { User } from "@shalkaar/shared-types";

interface UserContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (_email: string, _password: string) => Promise<void>;
  logout: () => Promise<void>;
  register: (_email: string, _password: string, _name: string) => Promise<void>;
  updateProfile: (_data: Partial<User>) => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  void setUser;

  // TODO: Initialize user session from NextAuth session
  useEffect(() => {
    const initializeUser = async () => {
      // TODO: Check for active session via NextAuth
      void setUser;
      setIsLoading(false);
    };
    initializeUser();
  }, []);

  const login = async (_email: string, _password: string) => {
    // TODO: Call API login endpoint
  };

  const logout = async () => {
    // TODO: Clear session and user state
  };

  const register = async (_email: string, _password: string, _name: string) => {
    // TODO: Call API register endpoint
  };

  const updateProfile = async (_data: Partial<User>) => {
    // TODO: Call API update profile endpoint
  };

  return (
    <UserContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        logout,
        register,
        updateProfile,
      }}
    >
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUser must be used within UserProvider");
  }
  return context;
}
