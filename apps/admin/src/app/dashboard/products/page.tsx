"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface Product {
  id: string;
  name: string;
  sku: string;
  collection: string;
  price: number;
  stock: number;
  status: "ACTIVE" | "INACTIVE" | "OUT_OF_STOCK";
  image: string;
  artisan?: string;
  description?: string;
}

const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3333/api/v1";

export default function ProductsPage() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCollection, setFilterCollection] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [collections, setCollections] = useState<string[]>([]);
  const itemsPerPage = 10;

  useEffect(() => {
    loadProducts();
    loadCollections();
  }, [searchTerm, filterCollection, filterStatus, currentPage]);

  const loadProducts = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem("shalkaar_auth_token");
      if (!token) {
        router.push("/auth/login");
        return;
      }

      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: itemsPerPage.toString(),
        ...(searchTerm && { search: searchTerm }),
        ...(filterCollection && { collection: filterCollection }),
        ...(filterStatus && { status: filterStatus }),
      });

      const response = await fetch(`${API_URL}/products?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        setProducts(data.products || []);
        setTotalPages(Math.ceil((data.total || 0) / itemsPerPage));
      }
    } catch (err) {
      console.error("Failed to load products:", err);
      setError("Failed to load products");
    } finally {
      setIsLoading(false);
    }
  };

  const loadCollections = async () => {
    try {
      const token = localStorage.getItem("shalkaar_auth_token");
      if (!token) return;

      const response = await fetch(`${API_URL}/categories`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        setCollections(
          data.categories?.map((cat: any) => cat.name) || []
        );
      }
    } catch (err) {
      console.error("Failed to load collections:", err);
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    if (!window.confirm("Are you sure you want to delete this product?")) return;

    try {
      const token = localStorage.getItem("shalkaar_auth_token");
      if (!token) return;

      const response = await fetch(`${API_URL}/products/${productId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        setProducts(products.filter((p) => p.id !== productId));
      } else {
        setError("Failed to delete product");
      }
    } catch (err) {
      console.error("Failed to delete product:", err);
      setError("Failed to delete product");
    }
  };

  const getStatusColor = (status: string): string => {
    switch (status) {
      case "ACTIVE":
        return "bg-green-100 text-green-800";
      case "INACTIVE":
        return "bg-gray-100 text-gray-800";
      case "OUT_OF_STOCK":
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

  if (isLoading && products.length === 0) {
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
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-serif font-bold text-brand-indigo mb-2">
              Products
            </h1>
            <p className="text-gray-600">Manage your product catalog</p>
          </div>
          <button
            onClick={() => router.push("/dashboard/products/new")}
            className="bg-brand-indigo hover:bg-brand-indigo/90 text-white px-6 py-2 rounded-lg font-medium transition-colors"
          >
            + Create Product
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {error}
            <button
              onClick={loadProducts}
              className="ml-4 underline hover:no-underline"
            >
              Try again
            </button>
          </div>
        )}

        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Search
              </label>
              <input
                type="text"
                placeholder="Product name or SKU..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-indigo focus:border-transparent"
              />
            </div>

            {/* Collection Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Collection
              </label>
              <select
                value={filterCollection}
                onChange={(e) => {
                  setFilterCollection(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-indigo focus:border-transparent"
              >
                <option value="">All Collections</option>
                {collections.map((col) => (
                  <option key={col} value={col}>
                    {col}
                  </option>
                ))}
              </select>
            </div>

            {/* Status Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <select
                value={filterStatus}
                onChange={(e) => {
                  setFilterStatus(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-indigo focus:border-transparent"
              >
                <option value="">All Status</option>
                <option value="ACTIVE">Active</option>
                <option value="INACTIVE">Inactive</option>
                <option value="OUT_OF_STOCK">Out of Stock</option>
              </select>
            </div>

            {/* Reset Filters */}
            <div className="flex items-end">
              <button
                onClick={() => {
                  setSearchTerm("");
                  setFilterCollection("");
                  setFilterStatus("");
                  setCurrentPage(1);
                }}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium text-gray-700 transition-colors"
              >
                Reset Filters
              </button>
            </div>
          </div>
        </div>

        {/* Products Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {products.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <p>No products found. Create your first product to get started.</p>
              <button
                onClick={() => router.push("/dashboard/products/new")}
                className="mt-4 text-brand-indigo hover:text-brand-indigo/80 font-medium"
              >
                Create Product →
              </button>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                        Product
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                        SKU
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                        Collection
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                        Price
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                        Stock
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {products.map((product) => (
                      <tr key={product.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-4">
                            {product.image && (
                              <img
                                src={product.image}
                                alt={product.name}
                                className="h-10 w-10 rounded object-cover"
                              />
                            )}
                            <div>
                              <p className="font-medium text-gray-900">{product.name}</p>
                              {product.artisan && (
                                <p className="text-xs text-gray-500">{product.artisan}</p>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm font-mono text-gray-600">
                          {product.sku}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {product.collection}
                        </td>
                        <td className="px-6 py-4 text-sm font-medium text-gray-900">
                          {formatCurrency(product.price)}
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              product.stock > 0
                                ? "bg-green-100 text-green-800"
                                : "bg-red-100 text-red-800"
                            }`}
                          >
                            {product.stock} units
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(product.status)}`}
                          >
                            {product.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm space-x-2">
                          <button
                            onClick={() => router.push(`/dashboard/products/${product.id}`)}
                            className="text-brand-indigo hover:text-brand-indigo/80 font-medium"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteProduct(product.id)}
                            className="text-red-600 hover:text-red-800 font-medium"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
                <div className="text-sm text-gray-600">
                  Page {currentPage} of {totalPages}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    Next
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
