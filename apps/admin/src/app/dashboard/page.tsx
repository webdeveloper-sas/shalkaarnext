export default function DashboardPage() {
  return (
    <div>
      <h1 className="text-4xl font-serif font-bold text-brand-indigo mb-8">Dashboard Overview</h1>

      {/* TODO: Key metrics cards section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* TODO: Total Sales */}
        {/* TODO: Orders This Month */}
        {/* TODO: Active Users */}
        {/* TODO: Products */}
      </div>

      {/* TODO: Charts section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* TODO: Sales chart (line or bar) */}
        {/* TODO: Orders by status chart (pie or donut) */}
      </div>

      {/* TODO: Recent orders table */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-2xl font-serif font-bold text-brand-indigo mb-4">Recent Orders</h2>
        {/* TODO: Orders table with columns: Order ID, Customer, Amount, Status, Date */}
      </div>
    </div>
  );
}
