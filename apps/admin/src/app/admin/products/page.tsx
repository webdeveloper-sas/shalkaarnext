import AdminHeader from '../../components/AdminHeader';
import { fetchProducts } from '@/lib/admin-api';

export const metadata = {
  title: 'Products - SHALKAAR Admin',
  description: 'Manage product inventory and catalog',
};

export default async function ProductsPage() {
  const { products, total } = await fetchProducts(0, 50);

  return (
    <>
      <AdminHeader
        title="Products"
        description="Manage inventory and product catalog"
      />
      <div className="p-6">
        <div className="mb-6 flex justify-between items-center">
          <h2 className="text-lg font-semibold text-gray-900">
            Product List ({total} products)
          </h2>
          <a
            href="/admin/products/new"
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            Add Product
          </a>
        </div>

        {total === 0 ? (
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
            <p className="text-gray-600">No products found. Create your first product.</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Name</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Price</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Stock</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Category</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Created</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <tr key={product.id} className="border-b border-gray-200 hover:bg-gray-50">
                    <td className="px-6 py-3 text-sm text-gray-900 font-medium">{product.name}</td>
                    <td className="px-6 py-3 text-sm text-gray-600">
                      ${product.basePrice.toFixed(2)}
                    </td>
                    <td className="px-6 py-3 text-sm text-gray-600">
                      <span className={product.stock > 0 ? 'text-green-600' : 'text-red-600'}>
                        {product.stock}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-sm text-gray-600">{product.categoryId || '—'}</td>
                    <td className="px-6 py-3 text-sm text-gray-600">
                      {new Date(product.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}
