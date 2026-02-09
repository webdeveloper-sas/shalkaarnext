"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface DashboardStats {
  totalRevenue: number;
  ordersThisMonth: number;
  activeCustomers: number;
  totalProducts: number;
  pendingOrders: number;
}

interface RecentOrder {
  id: string;
  customerId: string;
  customerName: string;
  email: string;
  amount: number;
  status: "PENDING" | "PROCESSING" | "SHIPPED" | "DELIVERED" | "CANCELLED";
  createdAt: string;
}

const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3333/api/v1";

export default function DashboardPage() {
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats>({
    totalRevenue: 0,
    ordersThisMonth: 0,
    activeCustomers: 0,
    totalProducts: 0,
    pendingOrders: 0,
  });
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem("shalkaar_auth_token");
      if (!token) {
        router.push("/auth/login");
        return;
      }

      // Fetch dashboard stats
      const statsResponse = await fetch(`${API_URL}/dashboard/stats`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        setStats(statsData);
      }

      // Fetch recent orders
      const ordersResponse = await fetch(`${API_URL}/orders?limit=10&sort=-createdAt`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (ordersResponse.ok) {
        const ordersData = await ordersResponse.json();
        setRecentOrders(ordersData.orders || []);
      }
    } catch (err) {
      console.error("Failed to load dashboard data:", err);
      setError("Failed to load dashboard data");
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: string): string => {
    switch (status) {
      case "PENDING":
        return "bg-yellow-100 text-yellow-800";
      case "PROCESSING":
        return "bg-blue-100 text-blue-800";
      case "SHIPPED":
        return "bg-purple-100 text-purple-800";
      case "DELIVERED":
        return "bg-green-100 text-green-800";
      case "CANCELLED":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
    }).format(value);
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-indigo"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-serif font-bold text-brand-indigo mb-2">
            Dashboard Overview
          </h1>
          <p className="text-gray-600">Welcome back! Here's your business overview.</p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {error}
            <button
              onClick={loadDashboardData}
              className="ml-4 underline hover:no-underline"
            >
              Try again
            </button>
          </div>
        )}

        {/* Key Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          {/* Total Revenue */}
          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-brand-indigo">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Total Revenue</p>
                <p className="text-3xl font-bold text-brand-indigo mt-2">
                  {formatCurrency(stats.totalRevenue)}
                </p>
              </div>
              <div className="text-4xl text-brand-indigo opacity-20">₹</div>
            </div>
          </div>

          {/* Orders This Month */}
          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-blue-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Orders This Month</p>
                <p className="text-3xl font-bold text-blue-500 mt-2">{stats.ordersThisMonth}</p>
              </div>
              <div className="text-4xl text-blue-500 opacity-20">📦</div>
            </div>
          </div>

          {/* Pending Orders */}
          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-yellow-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Pending Orders</p>
                <p className="text-3xl font-bold text-yellow-500 mt-2">{stats.pendingOrders}</p>
              </div>
              <div className="text-4xl text-yellow-500 opacity-20">⏳</div>
            </div>
          </div>

          {/* Active Customers */}
          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-green-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Active Customers</p>
                <p className="text-3xl font-bold text-green-500 mt-2">
                  {stats.activeCustomers}
                </p>
              </div>
              <div className="text-4xl text-green-500 opacity-20">👥</div>
            </div>
          </div>

          {/* Total Products */}
          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-purple-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Total Products</p>
                <p className="text-3xl font-bold text-purple-500 mt-2">{stats.totalProducts}</p>
              </div>
              <div className="text-4xl text-purple-500 opacity-20">📚</div>
            </div>
          </div>
        </div>

        {/* Recent Orders Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-serif font-bold text-brand-indigo">Recent Orders</h2>
              <button
                onClick={() => router.push("/dashboard/orders")}
                className="text-brand-indigo hover:text-brand-indigo/80 font-medium text-sm"
              >
                View All Orders →
              </button>
            </div>
          </div>

          {recentOrders.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <p>No orders yet. Come back once customers start placing orders.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                      Order ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                      Customer
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {recentOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm font-medium text-brand-indigo">
                        #{order.id}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <div>
                          <p className="font-medium text-gray-900">{order.customerName}</p>
                          <p className="text-gray-500 text-xs">{order.email}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">
                        {formatCurrency(order.amount)}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(order.status)}`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {formatDate(order.createdAt)}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <button
                          onClick={() => router.push(`/dashboard/orders/${order.id}`)}
                          className="text-brand-indigo hover:text-brand-indigo/80 font-medium"
                        >
                          View →
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
