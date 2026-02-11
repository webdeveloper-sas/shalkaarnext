import AdminHeader from '../../components/AdminHeader';
import { fetchOrders } from '@/lib/admin-api';

export const metadata = {
  title: 'Orders - SHALKAAR Admin',
  description: 'View and manage customer orders',
};

export default async function OrdersPage() {
  const { orders, total } = await fetchOrders(0, 50);

  return (
    <>
      <AdminHeader
        title="Orders"
        description="View and manage all customer orders"
      />
      <div className="p-6">
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-900">
            Orders ({total} total)
          </h2>
        </div>

        {total === 0 ? (
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
            <p className="text-gray-600">No orders found.</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Order ID</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Customer</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Total</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Status</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Date</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order.id} className="border-b border-gray-200 hover:bg-gray-50">
                    <td className="px-6 py-3 text-sm text-gray-900 font-medium">
                      #{order.id.slice(0, 8).toUpperCase()}
                    </td>
                    <td className="px-6 py-3 text-sm text-gray-600">
                      {order.userId ? `Customer ${order.userId.slice(0, 8)}` : '—'}
                    </td>
                    <td className="px-6 py-3 text-sm text-gray-900 font-medium">
                      ${order.total.toFixed(2)}
                    </td>
                    <td className="px-6 py-3 text-sm">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        order.status === 'completed'
                          ? 'bg-green-100 text-green-700'
                          : order.status === 'pending'
                          ? 'bg-yellow-100 text-yellow-700'
                          : order.status === 'cancelled'
                          ? 'bg-red-100 text-red-700'
                          : 'bg-gray-100 text-gray-700'
                      }`}>
                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-sm text-gray-600">
                      {new Date(order.createdAt).toLocaleDateString()}
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
