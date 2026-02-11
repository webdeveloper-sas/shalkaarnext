'use client';

import { useRequireRole } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

interface AdminOnlyProps {
  children: React.ReactNode;
}

export default function AdminOnly({ children }: AdminOnlyProps) {
  const router = useRouter();
  const isAdmin = useRequireRole('admin');

  useEffect(() => {
    if (!isAdmin) {
      router.push('/admin/dashboard');
    }
  }, [isAdmin, router]);

  if (!isAdmin) {
    return null;
  }

  return <>{children}</>;
}
