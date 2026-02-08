import HeroSection from '@/components/HeroSection';
import FeaturedProducts from '@/components/FeaturedProducts';
import { fetchProducts } from '@/lib/api';

export const metadata = {
  title: 'SHALKAAR - Premium Balochi Fashion & Artisan Crafts',
  description:
    'Discover exquisite Balochi textiles, handwoven crafts, and premium fashion celebrating heritage and artisan craftsmanship.',
};

export default async function HomePage() {
  // Fetch featured products (first 8)
  const { products } = await fetchProducts(0, 8);

  return (
    <main className="min-h-screen bg-white">
      {/* Hero Section */}
      <HeroSection />

      {/* Featured Products */}
      <FeaturedProducts
        products={products}
        title="Featured Collection"
        description="Explore our handpicked selection of premium Balochi fashion and artisan crafts, curated to celebrate heritage and timeless elegance."
      />

      {/* Newsletter Section */}
      <section className="bg-gradient-to-r from-purple-900 to-black py-16 md:py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Stay Updated
          </h2>
          <p className="text-gray-300 mb-8 text-lg">
            Subscribe to our newsletter for exclusive collections and special offers
          </p>
          <form className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 px-4 py-3 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500"
              required
            />
            <button
              type="submit"
              className="px-8 py-3 bg-purple-600 text-white font-semibold rounded-lg hover:bg-purple-700 transition-colors duration-300"
            >
              Subscribe
            </button>
          </form>
        </div>
      </section>

      {/* Footer Info Section */}
      <section className="bg-gray-50 py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
            {/* Artisan Crafted */}
            <div className="text-center">
              <div className="mb-4 flex justify-center">
                <svg className="w-12 h-12 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Artisan Crafted</h3>
              <p className="text-gray-600">
                Each piece is meticulously handwoven and crafted by skilled artisans
              </p>
            </div>

            {/* Heritage Inspired */}
            <div className="text-center">
              <div className="mb-4 flex justify-center">
                <svg className="w-12 h-12 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Heritage Inspired</h3>
              <p className="text-gray-600">
                Celebrating Balochi traditions and cultural heritage through modern design
              </p>
            </div>

            {/* Premium Quality */}
            <div className="text-center">
              <div className="mb-4 flex justify-center">
                <svg className="w-12 h-12 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Premium Quality</h3>
              <p className="text-gray-600">
                Finest materials selected for durability, comfort, and timeless elegance
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
