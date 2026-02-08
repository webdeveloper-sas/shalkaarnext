import Link from 'next/link';

interface ProductCardProps {
  id: string;
  name: string;
  basePrice: number;
  stock: number;
  categoryId?: string;
}

export default function ProductCard({ id, name, basePrice, stock }: ProductCardProps) {
  const isOutOfStock = stock === 0;

  return (
    <Link href={`/products/${id}`}>
      <div className="group cursor-pointer">
        {/* Image Container */}
        <div className="relative mb-4 bg-gray-200 rounded-lg overflow-hidden aspect-square">
          {/* Placeholder Image */}
          <div className="w-full h-full bg-gradient-to-br from-purple-100 to-purple-200 flex items-center justify-center">
            <svg className="w-16 h-16 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>

          {/* Out of Stock Badge */}
          {isOutOfStock && (
            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
              <span className="text-white font-semibold text-lg">Out of Stock</span>
            </div>
          )}

          {/* Stock Badge */}
          {!isOutOfStock && (
            <div className="absolute top-3 right-3 bg-green-500 text-white px-3 py-1 rounded-full text-sm font-medium">
              In Stock
            </div>
          )}

          {/* Overlay on hover */}
          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all duration-300" />
        </div>

        {/* Product Info */}
        <div>
          {/* Product Name */}
          <h3 className="text-lg font-semibold text-gray-900 group-hover:text-purple-600 transition-colors duration-200 mb-2 line-clamp-2">
            {name}
          </h3>

          {/* Price */}
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-gray-900">
              ₹{basePrice.toLocaleString('en-IN')}
            </span>
          </div>

          {/* Stock Info */}
          <p className="text-sm text-gray-600 mt-2">
            {isOutOfStock ? (
              <span className="text-red-600 font-medium">Out of Stock</span>
            ) : (
              <span className="text-green-600 font-medium">{stock} available</span>
            )}
          </p>

          {/* View Details Link */}
          <div className="mt-4 inline-block">
            <span className="text-purple-600 font-medium text-sm group-hover:text-purple-800 transition-colors duration-200">
              View Details →
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
