'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth, useRequireRole } from '@/context/AuthContext';

interface NavItem {
  label: string;
  href: string;
  icon: string;
  requiredRole?: 'admin' | 'staff';
}

const navItems: NavItem[] = [
  { label: 'Dashboard', href: '/admin/dashboard', icon: '📊' },
  { label: 'Products', href: '/admin/products', icon: '📦' },
  { label: 'Artisans', href: '/admin/artisans', icon: '👥' },
  { label: 'Orders', href: '/admin/orders', icon: '🛒' },
  { label: 'Customers', href: '/admin/customers', icon: '👤' },
  { label: 'Settings', href: '/admin/settings', icon: '⚙️', requiredRole: 'admin' },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const { user } = useAuth();
  const isAdmin = useRequireRole('admin');

  const isActive = (href: string): boolean => {
    if (href === '/admin/dashboard') {
      return pathname === '/admin/dashboard' || pathname === '/admin';
    }
    return pathname.startsWith(href);
  };

  const shouldShowItem = (item: NavItem): boolean => {
    if (!item.requiredRole) return true;
    if (item.requiredRole === 'admin') return isAdmin;
    return true;
  };

  return (
    <aside className="w-64 bg-gray-900 text-white min-h-screen flex flex-col border-r border-gray-800">
      {/* Logo Section */}
      <div className="p-6 border-b border-gray-800">
        <h1 className="text-2xl font-bold text-purple-400">SHALKAAR</h1>
        <p className="text-xs text-gray-400 mt-1">Admin Panel</p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-6 space-y-2">
        {navItems
          .filter(shouldShowItem)
          .map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors duration-200 ${
                  active
                    ? 'bg-purple-600 text-white font-semibold'
                    : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                }`}
              >
                <span className="text-lg">{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            );
          })}
      </nav>

      {/* Footer */}
      <div className="p-6 border-t border-gray-800">
        <p className="text-xs text-gray-500 text-center">
          {user?.role && <span className="capitalize">{user.role}</span>}
        </p>
      </div>
    </aside>
  );
}
