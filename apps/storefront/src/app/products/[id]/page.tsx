import { Metadata } from "next";
import { notFound } from "next/navigation";
import ProductImageGallery from "@/components/products/ProductImageGallery";
import ProductInfo from "@/components/products/ProductInfo";
import AddToCartSection from "@/components/products/AddToCartSection";
import FeaturedProducts from "@/components/FeaturedProducts";
import { fetchProductById, fetchProducts } from "@/lib/api";

interface ProductDetailPageProps {
  params: {
    id: string;
  };
}

export const revalidate = 60; // Revalidate every 60 seconds

export async function generateMetadata({
  params,
}: ProductDetailPageProps): Promise<Metadata> {
  try {
    const product = await fetchProductById(params.id);

    if (!product) {
      return {
        title: "Product | SHALKAAR",
        description: "Product details",
      };
    }

    return {
      title: `${product.name} | SHALKAAR`,
      description: product.description || `Shop ${product.name} on SHALKAAR`,
    };
  } catch {
    return {
      title: "Product | SHALKAAR",
      description: "Product details",
    };
  }
}

export default async function ProductDetailPage({
  params,
}: ProductDetailPageProps) {
  try {
    // Fetch product details and related products in parallel
    const [product, productsResponse] = await Promise.all([
      fetchProductById(params.id),
      fetchProducts(0, 8),
    ]);

    if (!product) {
      notFound();
    }

    // Filter out current product from related products
    const otherProducts = productsResponse.products
      .filter((p) => p.id !== product.id)
      .slice(0, 4);

    return (
      <div className="min-h-screen bg-white">
        {/* Product Detail Section */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
            {/* Image Gallery */}
            <div>
              <ProductImageGallery productName={product.name} />
            </div>

            {/* Product Info and Add to Cart */}
            <div className="space-y-8">
              <ProductInfo product={product} />
              <AddToCartSection product={product} />
            </div>
          </div>
        </div>

        {/* Related Products Section */}
        {otherProducts.length > 0 && (
          <div className="border-t border-gray-200">
            <FeaturedProducts
              products={otherProducts}
              title="Related Products"
              description="You might also like these items"
            />
          </div>
        )}

        {/* Product Benefits Section */}
        <section className="bg-gray-50 border-t border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-8">
              Why Choose SHALKAAR
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="space-y-3">
                <div className="text-3xl">🏛️</div>
                <h3 className="font-semibold text-gray-900">
                  Authentic Heritage
                </h3>
                <p className="text-gray-600">
                  Every product reflects the rich cultural heritage of Indian
                  craftsmanship.
                </p>
              </div>
              <div className="space-y-3">
                <div className="text-3xl">🛡️</div>
                <h3 className="font-semibold text-gray-900">Quality Assured</h3>
                <p className="text-gray-600">
                  Rigorous quality checks ensure every item meets our standards.
                </p>
              </div>
              <div className="space-y-3">
                <div className="text-3xl">✨</div>
                <h3 className="font-semibold text-gray-900">
                  Artisan Support
                </h3>
                <p className="text-gray-600">
                  Support local artisans and preserve traditional crafts.
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>
    );
  } catch (error) {
    console.error("Failed to load product:", error);
    notFound();
  }
}
