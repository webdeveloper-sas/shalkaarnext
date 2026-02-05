export default function OrderDetailPage({ params }: { params: { id: string } }) {
  return (
    <div>
      <div className="mb-8">
        {/* TODO: Back button */}
        <h1 className="text-4xl font-serif font-bold text-brand-indigo">Order #{params.id}</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          {/* TODO: Order status timeline */}

          {/* TODO: Customer information section */}
          {/* - Name, Email, Phone */}

          {/* TODO: Shipping information */}
          {/* - Address, Shipping method, Tracking number */}

          {/* TODO: Order items table */}
          {/* - Product image, name, quantity, price, subtotal */}

          {/* TODO: Order timeline/notes */}
        </div>

        <aside className="space-y-6">
          {/* TODO: Order summary card */}
          {/* - Subtotal, Shipping, Tax, Total */}

          {/* TODO: Payment information */}
          {/* - Payment method, Status, Date */}

          {/* TODO: Status update section */}
          {/* - Dropdown to change fulfillment status */}

          {/* TODO: Actions buttons */}
          {/* - Print invoice, Send confirmation email, Refund */}
        </aside>
      </div>
    </div>
  );
}
