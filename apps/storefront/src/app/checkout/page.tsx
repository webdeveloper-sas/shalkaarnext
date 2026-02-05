export default function CheckoutPage() {
  return (
    <div className="container-responsive py-12">
      <h1 className="text-4xl font-serif font-bold text-brand-indigo mb-8">Checkout</h1>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div>
          {/* TODO: Shipping and billing form */}
          {/* TODO: Shipping method selection */}
        </div>
        <aside>
          {/* TODO: Order summary with items */}
          {/* TODO: Payment method selection */}
        </aside>
      </div>
    </div>
  );
}
