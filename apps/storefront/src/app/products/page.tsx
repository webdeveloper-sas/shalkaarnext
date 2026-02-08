'use client';

import { useState, useEffect } from 'react';
import ProductCard from '@/components/ProductCard';
import { fetchProducts, Product } from '@/lib/api';

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'newest' | 'price-low' | 'price-high'>('newest');

  useEffect(() => {
    const loadProducts = async () => {
      try {
        setIsLoading(true);
        const { products: fetchedProducts } = await fetchProducts(0, 100);
        
        // Sort products based on selected option
        let sortedProducts = [...fetchedProducts];
        if (sortBy === 'price-low') {
          sortedProducts.sort((a, b) => a.basePrice - b.basePrice);
        } else if (sortBy === 'price-high') {
          sortedProducts.sort((a, b) => b.basePrice - a.basePrice);
        } else if (sortBy === 'newest') {
          sortedProducts.sort((a, b) => 
            new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
          );
        }
        
        setProducts(sortedProducts);
        setError(null);
      } catch (err) {
        setError('Failed to load products');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    loadProducts();
  }, [sortBy]);

  return (
    <main className="min-h-screen bg-white">
      {/* Page Header */}
      <div className="bg-gradient-to-br from-purple-50 to-white py-12 md:py-16 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Our Collection
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl">
            Browse our complete collection of premium Balochi fashion and artisan crafts. Each piece tells a story of heritage and craftsmanship.
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Filter and Sort Section */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 pb-8 border-b border-gray-200">
          <div>
            <p className="text-gray-600 font-medium">
              {isLoading ? 'Loading...' : `${products.length} products`}
            </p>
          </div>

          {/* Sort Dropdown */}
          <div className="mt-4 sm:mt-0">
            <label htmlFor="sort" className="inline-block mr-3 text-gray-700 font-medium">
              Sort by:
            </label>
            <select
              id="sort"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'newest' | 'price-low' | 'price-high')}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="newest">Newest</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
            </select>
          </div>
        </div>

        {/* Products Grid */}
        {isLoading ? (
          <div className="flex justify-center items-center min-h-96">
            <div className="animate-spin">
              <svg className="w-12 h-12 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </div>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <p className="text-red-800 font-medium">{error}</p>
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-12">
            <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
            </svg>
            <p className="text-gray-600 text-lg">No products available at the moment.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
            {products.map((product) => (
              <ProductCard
                key={product.id}
                id={product.id}
                name={product.name}
                basePrice={product.basePrice}
                stock={product.stock}
                categoryId={product.categoryId}
              />
            ))}
          </div>
        )}
      </div>

      {/* CTA Section */}
      {products.length > 0 && (
        <section className="bg-gray-50 py-12 md:py-16 mt-12">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
              Can't find what you're looking for?
            </h2>
            <p className="text-gray-600 mb-8">
              Contact our customer service team for custom orders and special requests.
            </p>
            <button className="px-8 py-3 bg-purple-600 text-white font-semibold rounded-lg hover:bg-purple-700 transition-colors duration-300">
              Contact Us
            </button>
          </div>
        </section>
      )}
    </main>
  );
}
