"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import AccountInfo, { type UserProfile } from "@/components/account/AccountInfo";
import OrderHistoryList, { type Order } from "@/components/account/OrderHistoryList";

const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3333/api/v1";

function AccountPageContent() {
  const { user, token, isLoading: authLoading } = useAuth();
  const [activeTab, setActiveTab] = useState<"profile" | "orders">("profile");
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [isLoadingOrders, setIsLoadingOrders] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load user profile when user/token changes
  useEffect(() => {
    if (!authLoading && user && token) {
      loadProfile();
    }
  }, [user, token, authLoading]);

  // Load orders when tab changes
  useEffect(() => {
    if (activeTab === "orders" && user && token) {
      loadOrders();
    }
  }, [activeTab]);

  const loadProfile = async () => {
    if (!user || !token) return;
    setIsLoadingProfile(true);
    setError(null);

    try {
      const response = await fetch(`${API_URL}/users/${user.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        setProfile({
          id: data.id,
          fullName: `${data.firstName || ""} ${data.lastName || ""}`.trim(),
          email: data.email,
          phone: data.phone || "",
          street: data.street || "",
          city: data.city || "",
          postalCode: data.postalCode || "",
          country: data.country || "India",
        });
      } else {
        setProfile({
          id: user.id,
          fullName: `${user.firstName || ""} ${user.lastName || ""}`.trim(),
          email: user.email,
          phone: "",
          street: "",
          city: "",
          postalCode: "",
          country: "India",
        });
      }
    } catch (err) {
      console.error("Failed to load profile:", err);
      setError("Failed to load profile");
    } finally {
      setIsLoadingProfile(false);
    }
  };

  const loadOrders = async () => {
    if (!user || !token) return;
    setIsLoadingOrders(true);
    setError(null);

    try {
      const response = await fetch(`${API_URL}/orders?userId=${user.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        setOrders(
          data.orders?.map((order: any) => ({
            id: order.id,
            status: order.status || "confirmed",
            total: order.total || 0,
            itemCount: order.items?.length || 0,
            createdAt: order.createdAt || new Date().toISOString(),
            transactionId: order.transactionId,
          })) || []
        );
      }
    } catch (err) {
      console.error("Failed to load orders:", err);
      setError("Failed to load order history");
    } finally {
      setIsLoadingOrders(false);
    }
  };

  const handleSaveProfile = async (updatedProfile: UserProfile) => {
    if (!token) throw new Error("Not authenticated");

    const response = await fetch(`${API_URL}/users/${updatedProfile.id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        firstName: updatedProfile.fullName.split(" ")[0],
        lastName: updatedProfile.fullName.split(" ").slice(1).join(" "),
        email: updatedProfile.email,
        phone: updatedProfile.phone,
        street: updatedProfile.street,
        city: updatedProfile.city,
        postalCode: updatedProfile.postalCode,
        country: updatedProfile.country,
      }),
    });

    if (!response.ok) {
      throw new Error("Failed to update profile");
    }

    setProfile(updatedProfile);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 border-b border-gray-200">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Account</h1>
            {user && (
              <p className="text-gray-600 mt-2">{user.email}</p>
            )}
          </div>
          <Link
            href="/"
            className="text-purple-600 hover:text-purple-700 font-medium text-sm"
          >
            ← Back to Home
          </Link>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Tabs */}
        <div className="flex gap-4 mb-8 border-b border-gray-200">
          <button
            onClick={() => setActiveTab("profile")}
            className={`px-4 py-2 font-medium border-b-2 transition-colors ${
              activeTab === "profile"
                ? "border-purple-600 text-purple-600"
                : "border-transparent text-gray-600 hover:text-gray-900"
            }`}
          >
            Profile Information
          </button>
          <button
            onClick={() => setActiveTab("orders")}
            className={`px-4 py-2 font-medium border-b-2 transition-colors ${
              activeTab === "orders"
                ? "border-purple-600 text-purple-600"
                : "border-transparent text-gray-600 hover:text-gray-900"
            }`}
          >
            Order History
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {error}
          </div>
        )}

        {/* Tab Content */}
        {activeTab === "profile" && (
          <div>
            <AccountInfo
              profile={profile}
              isLoading={isLoadingProfile}
              onSave={handleSaveProfile}
            />
          </div>
        )}

        {activeTab === "orders" && (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Your Orders</h2>
            <OrderHistoryList orders={orders} isLoading={isLoadingOrders} />
          </div>
        )}
      </div>
    </div>
  );
}

export default function AccountPage() {
  return (
    <ProtectedRoute allowedRoles={["CUSTOMER", "ADMIN", "VENDOR"]}>
      <AccountPageContent />
    </ProtectedRoute>
  );
}
