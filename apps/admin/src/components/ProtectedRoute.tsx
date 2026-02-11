'use client';

import { useAuth, useRequireRole } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'admin' | 'staff';
}

export default function ProtectedRoute({ children, requiredRole = 'staff' }: ProtectedRouteProps) {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();
  const hasRequiredRole = useRequireRole(requiredRole);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/admin/login');
    }
  }, [isAuthenticated, isLoading, router]);

  useEffect(() => {
    if (!isLoading && isAuthenticated && !hasRequiredRole) {
      router.push('/admin/dashboard');
    }
  }, [isAuthenticated, hasRequiredRole, isLoading, router]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-gray-600">Loading...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // Redirect is in progress
  }

  if (!hasRequiredRole) {
    return null; // Redirect is in progress
  }

  return <>{children}</>;
}
