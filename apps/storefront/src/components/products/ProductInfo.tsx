import type { Product } from "@/lib/api";

interface ProductInfoProps {
  product: Product;
}

export default function ProductInfo({ product }: ProductInfoProps) {
  const inStock = product.stock && product.stock > 0;

  return (
    <div className="space-y-6">
      {/* Name and Price */}
      <div>
        <h1 className="text-4xl font-bold text-gray-900 mb-2">{product.name}</h1>
        <div className="flex items-center gap-4">
          <span className="text-3xl font-bold text-purple-600">
            ₹{(product.basePrice || 0).toLocaleString()}
          </span>
        </div>
      </div>

      {/* Stock Status */}
      <div>
        {inStock ? (
          <div className="inline-block px-4 py-2 bg-green-100 text-green-700 rounded-full text-sm font-medium">
            ✓ In Stock ({product.stock} available)
          </div>
        ) : (
          <div className="inline-block px-4 py-2 bg-gray-200 text-gray-700 rounded-full text-sm font-medium">
            Out of Stock
          </div>
        )}
      </div>

      {/* Description */}
      {product.description && (
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-2">
            Description
          </h2>
          <p className="text-gray-600 leading-relaxed">{product.description}</p>
        </div>
      )}

      {/* Product Details */}
      <div className="border-t border-gray-200 pt-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Details</h3>
        <div className="space-y-3 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">SKU</span>
            <span className="font-medium text-gray-900">{product.id}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Price</span>
            <span className="font-medium text-gray-900">
              ₹{(product.basePrice || 0).toLocaleString()}
            </span>
          </div>
          {product.categoryId && (
            <div className="flex justify-between">
              <span className="text-gray-600">Category</span>
              <span className="font-medium text-gray-900">
                {product.categoryId}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Shipping Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-2">
        <p className="text-sm font-medium text-blue-900">📦 Free shipping</p>
        <p className="text-sm text-blue-800">
          Free shipping on orders over ₹500. Order will arrive within 5-7
          business days.
        </p>
      </div>
    </div>
  );
}
