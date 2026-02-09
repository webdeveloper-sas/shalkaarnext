"use client";

import { useState, useCallback, useMemo } from "react";
import { Product } from "@/lib/api";

interface SearchAndFilterProps {
  products: Product[];
  onFilter: (filteredProducts: Product[]) => void;
  categories: string[];
}

interface Filters {
  search: string;
  category: string;
  priceMin: number;
  priceMax: number;
  sort: "newest" | "price-low" | "price-high" | "name";
}

export default function SearchAndFilter({
  products,
  onFilter,
  categories,
}: SearchAndFilterProps) {
  const [filters, setFilters] = useState<Filters>({
    search: "",
    category: "",
    priceMin: 0,
    priceMax: 100000,
    sort: "newest",
  });

  const [showFilters, setShowFilters] = useState(true);

  // Apply filters and sorting
  const filteredProducts = useMemo(() => {
    let result = [...products];

    // Search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(searchLower) ||
          p.description?.toLowerCase().includes(searchLower)
      );
    }

    // Category filter
    if (filters.category) {
      result = result.filter((p) => p.categoryId === filters.category);
    }

    // Price filter
    result = result.filter(
      (p) => p.basePrice >= filters.priceMin && p.basePrice <= filters.priceMax
    );

    // Sorting
    if (filters.sort === "price-low") {
      result.sort((a, b) => a.basePrice - b.basePrice);
    } else if (filters.sort === "price-high") {
      result.sort((a, b) => b.basePrice - a.basePrice);
    } else if (filters.sort === "name") {
      result.sort((a, b) => a.name.localeCompare(b.name));
    } else if (filters.sort === "newest") {
      result.sort(
        (a, b) =>
          new Date(b.createdAt || 0).getTime() -
          new Date(a.createdAt || 0).getTime()
      );
    }

    return result;
  }, [products, filters]);

  // Update parent component with filtered results
  const handleFilterChange = useCallback(
    (newFilters: Partial<Filters>) => {
      const updated = { ...filters, ...newFilters };
      setFilters(updated);
    },
    [filters]
  );

  // Reset filters
  const handleReset = () => {
    setFilters({
      search: "",
      category: "",
      priceMin: 0,
      priceMax: 100000,
      sort: "newest",
    });
  };

  // Calculate price range from products
  const minPrice = Math.min(...products.map((p) => p.basePrice));
  const maxPrice = Math.max(...products.map((p) => p.basePrice));

  // Call parent callback with filtered products
  useState(() => {
    onFilter(filteredProducts);
  });

  return (
    <div className="mb-8">
      {/* Mobile Filter Toggle */}
      <div className="lg:hidden mb-6">
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="w-full px-4 py-2 bg-purple-100 text-purple-700 rounded-lg font-medium hover:bg-purple-200 transition-colors flex items-center justify-between"
        >
          <span>Filters & Search</span>
          <span>{showFilters ? "−" : "+"}</span>
        </button>
      </div>

      {/* Search and Filter Panel */}
      {(showFilters || window.innerWidth >= 1024) && (
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
          <div className="space-y-6">
            {/* Search Box */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Search Products
              </label>
              <input
                type="text"
                placeholder="Search by name or keywords..."
                value={filters.search}
                onChange={(e) => handleFilterChange({ search: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
              />
            </div>

            {/* Category Filter */}
            {categories.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category
                </label>
                <select
                  value={filters.category}
                  onChange={(e) => handleFilterChange({ category: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                >
                  <option value="">All Categories</option>
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Price Range Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Price Range
              </label>
              <div className="space-y-3">
                <div className="flex gap-4">
                  <div className="flex-1">
                    <input
                      type="number"
                      placeholder="Min"
                      value={filters.priceMin}
                      onChange={(e) =>
                        handleFilterChange({ priceMin: Number(e.target.value) })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>
                  <div className="flex-1">
                    <input
                      type="number"
                      placeholder="Max"
                      value={filters.priceMax}
                      onChange={(e) =>
                        handleFilterChange({ priceMax: Number(e.target.value) })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>
                </div>
                <input
                  type="range"
                  min={minPrice}
                  max={maxPrice}
                  value={filters.priceMax}
                  onChange={(e) =>
                    handleFilterChange({ priceMax: Number(e.target.value) })
                  }
                  className="w-full"
                />
              </div>
            </div>

            {/* Sort Options */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sort By
              </label>
              <select
                value={filters.sort}
                onChange={(e) =>
                  handleFilterChange({ sort: e.target.value as Filters["sort"] })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
              >
                <option value="newest">Newest First</option>
                <option value="name">Name (A-Z)</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
              </select>
            </div>

            {/* Reset Button */}
            <button
              onClick={handleReset}
              className="w-full px-4 py-2 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition-colors"
            >
              Reset Filters
            </button>
          </div>
        </div>
      )}

      {/* Results Summary */}
      <div className="flex justify-between items-center">
        <p className="text-gray-600 font-medium">
          Showing {filteredProducts.length} of {products.length} products
        </p>
        {(filters.search ||
          filters.category ||
          filters.priceMin > 0 ||
          filters.priceMax < maxPrice) && (
          <button
            onClick={handleReset}
            className="text-purple-600 hover:text-purple-700 font-medium text-sm underline"
          >
            Clear all filters
          </button>
        )}
      </div>
    </div>
  );
}
