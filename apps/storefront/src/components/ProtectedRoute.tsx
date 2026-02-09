"use client";

import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useEffect } from "react";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: Array<"CUSTOMER" | "VENDOR" | "ADMIN">;
}

export default function ProtectedRoute({
  children,
  allowedRoles = ["CUSTOMER"],
}: ProtectedRouteProps) {
  const router = useRouter();
  const { isAuthenticated, user, isLoading } = useAuth();

  useEffect(() => {
    if (isLoading) return;

    if (!isAuthenticated || !user) {
      router.push("/auth/login?redirect=" + encodeURIComponent(window.location.pathname));
      return;
    }

    if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
      router.push("/unauthorized");
    }
  }, [isAuthenticated, user, isLoading, router, allowedRoles]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return null;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    return null;
  }

  return <>{children}</>;
}
