import AdminHeader from '../../components/AdminHeader';
import { fetchDashboardStats, fetchProducts, fetchOrders, fetchCustomers } from '@/lib/admin-api';

export const metadata = {
  title: 'Dashboard - SHALKAAR Admin',
  description: 'Admin dashboard overview',
};

export default async function DashboardPage() {
  const [stats, productsData, ordersData, customersData] = await Promise.all([
    fetchDashboardStats(),
    fetchProducts(0, 1),
    fetchOrders(0, 1),
    fetchCustomers(0, 1),
  ]);

  const kpis = [
    {
      label: 'Total Products',
      value: stats.totalProducts.toString(),
      change: '+0%',
    },
    {
      label: 'Total Orders',
      value: stats.totalOrders.toString(),
      change: '+0%',
    },
    {
      label: 'Total Customers',
      value: customersData.total.toString(),
      change: '+0%',
    },
    {
      label: 'Total Revenue',
      value: stats.totalRevenue.toLocaleString('en-US', { style: 'currency', currency: 'USD' }),
      change: '+0%',
    },
  ];

  return (
    <>
      <AdminHeader
        title="Dashboard"
        description="Store operations and analytics overview"
      />
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {kpis.map((kpi) => (
            <div key={kpi.label} className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
              <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wide">
                {kpi.label}
              </h3>
              <p className="text-3xl font-bold text-gray-900 mt-2">{kpi.value}</p>
              <p className="text-xs text-gray-500 mt-1">Peak period</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Orders */}
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Orders</h2>
            {ordersData.total === 0 ? (
              <p className="text-gray-600 text-sm">No orders yet</p>
            ) : (
              <p className="text-gray-600 text-sm">
                {ordersData.total} total order{ordersData.total !== 1 ? 's' : ''} in system
              </p>
            )}
          </div>

          {/* Recent Products */}
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Products</h2>
            {productsData.total === 0 ? (
              <p className="text-gray-600 text-sm">No products yet</p>
            ) : (
              <p className="text-gray-600 text-sm">
                {productsData.total} total product{productsData.total !== 1 ? 's' : ''} in catalog
              </p>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
