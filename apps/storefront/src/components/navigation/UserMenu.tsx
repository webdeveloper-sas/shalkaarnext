"use client";

import { useAuth } from "@/context/AuthContext";
import Link from "next/link";
import { useState } from "react";

export default function UserMenu() {
  const { user, isAuthenticated, logout, isLoading } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  if (isLoading) {
    return null;
  }

  if (!isAuthenticated || !user) {
    return (
      <div className="flex gap-3">
        <Link
          href="/auth/login"
          className="px-4 py-2 text-purple-600 font-medium hover:text-purple-700"
        >
          Sign In
        </Link>
        <Link
          href="/auth/register"
          className="px-4 py-2 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700"
        >
          Sign Up
        </Link>
      </div>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors"
      >
        <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
          {user.firstName?.charAt(0).toUpperCase() || user.email.charAt(0).toUpperCase()}
        </div>
        <span className="hidden sm:inline text-sm font-medium text-gray-700">
          {user.firstName || user.email.split("@")[0]}
        </span>
        <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
        </svg>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
          {/* User Info */}
          <div className="px-4 py-3 border-b border-gray-200">
            <p className="text-sm font-medium text-gray-900">{user.firstName} {user.lastName}</p>
            <p className="text-xs text-gray-600">{user.email}</p>
            <span className="inline-block mt-2 px-2 py-1 text-xs font-semibold bg-purple-100 text-purple-800 rounded">
              {user.role}
            </span>
          </div>

          {/* Menu Items */}
          <nav className="py-2">
            <Link
              href="/account"
              className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
              onClick={() => setIsOpen(false)}
            >
              My Account
            </Link>
            {user.role === "ADMIN" && (
              <Link
                href="/dashboard"
                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                onClick={() => setIsOpen(false)}
              >
                Admin Dashboard
              </Link>
            )}
            <button
              onClick={() => {
                logout();
                setIsOpen(false);
              }}
              className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors border-t border-gray-200"
            >
              Sign Out
            </button>
          </nav>
        </div>
      )}
    </div>
  );
}
