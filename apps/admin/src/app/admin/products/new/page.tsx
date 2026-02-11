import AdminHeader from '../../../components/AdminHeader';

export const metadata = {
  title: 'Add Product - SHALKAAR Admin',
  description: 'Create a new product',
};

export default function NewProductPage() {
  return (
    <>
      <AdminHeader
        title="Add New Product"
        description="Create a new product in your catalog"
      />
      <div className="p-6">
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6 max-w-2xl">
          <form className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Product Name
              </label>
              <input
                type="text"
                placeholder="Enter product name"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                disabled
              />
              <p className="text-xs text-gray-500 mt-1">
                Form fields disabled in Phase 15 (UI only)
              </p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Description
              </label>
              <textarea
                placeholder="Enter product description"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                rows={4}
                disabled
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Price
                </label>
                <input
                  type="number"
                  placeholder="0.00"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  disabled
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Stock
                </label>
                <input
                  type="number"
                  placeholder="0"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  disabled
                />
              </div>
            </div>

            <button
              type="submit"
              disabled
              className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Save Product
            </button>
          </form>
        </div>
      </div>
    </>
  );
}
