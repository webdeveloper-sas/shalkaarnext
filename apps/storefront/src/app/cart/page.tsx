export default function CartPage() {
  return (
    <div className="container-responsive py-12">
      <h1 className="text-4xl font-serif font-bold text-brand-indigo mb-8">Shopping Cart</h1>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          {/* TODO: Display cart items list */}
          {/* TODO: Show empty cart state if no items */}
        </div>
        <aside>
          {/* TODO: Display order summary and checkout button */}
        </aside>
      </div>
    </div>
  );
}
