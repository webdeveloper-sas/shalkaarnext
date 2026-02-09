"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: "CUSTOMER" | "VENDOR" | "ADMIN";
}

export default function ProtectedRoute({
  children,
  requiredRole = "CUSTOMER",
}: ProtectedRouteProps) {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!isLoading && mounted) {
      if (!user) {
        router.push("/auth/login");
        return;
      }

      // Check role-based access
      const roleHierarchy: Record<string, number> = {
        CUSTOMER: 1,
        VENDOR: 2,
        ADMIN: 3,
      };

      const userLevel = roleHierarchy[user.role] || 0;
      const requiredLevel = roleHierarchy[requiredRole] || 0;

      if (userLevel < requiredLevel) {
        router.push("/");
      }
    }
  }, [user, isLoading, mounted, router, requiredRole]);

  if (isLoading || !mounted) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return <>{children}</>;
}
