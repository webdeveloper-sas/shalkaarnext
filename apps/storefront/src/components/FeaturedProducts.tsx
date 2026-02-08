import ProductCard from './ProductCard';

interface Product {
  id: string;
  name: string;
  description?: string;
  basePrice: number;
  stock: number;
  categoryId?: string;
  createdAt?: string;
}

interface FeaturedProductsProps {
  products: Product[];
  title?: string;
  description?: string;
}

export default function FeaturedProducts({
  products,
  title = 'Featured Collection',
  description = 'Explore our handpicked selection of premium Balochi fashion and artisan crafts',
}: FeaturedProductsProps) {
  if (!products || products.length === 0) {
    return (
      <section className="py-16 md:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="text-gray-600 text-lg">No products available at the moment.</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 md:py-24 bg-white" id="featured">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="mb-12 md:mb-16">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            {title}
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl">
            {description}
          </p>
        </div>

        {/* Products Grid */}
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

        {/* View All Link */}
        {products.length > 0 && (
          <div className="mt-12 md:mt-16 text-center">
            <a
              href="/products"
              className="inline-block px-8 py-3 bg-purple-600 text-white font-semibold rounded-lg hover:bg-purple-700 transition-colors duration-300"
            >
              View All Products
            </a>
          </div>
        )}
      </div>
    </section>
  );
}
