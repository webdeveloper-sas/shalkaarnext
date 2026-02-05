export default function ProductDetailPage({ params }: { params: { id: string } }) {
  return (
    <div>
      <div className="mb-8">
        {/* TODO: Back button */}
        <h1 className="text-4xl font-serif font-bold text-brand-indigo">Edit Product</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          {/* TODO: Product basic info form */}
          {/* - Product name */}
          {/* - Description */}
          {/* - Category/Collection */}
          {/* - Price */}
          {/* - Cost price */}

          {/* TODO: Product images section */}
          {/* - Upload images */}
          {/* - Manage image order */}

          {/* TODO: Variants section */}
          {/* - Size/Color variants */}
          {/* - Stock per variant */}

          {/* TODO: SEO section */}
          {/* - Meta title */}
          {/* - Meta description */}
          {/* - Slug */}
        </div>

        <aside className="space-y-6">
          {/* TODO: Product status */}
          {/* TODO: Save button */}
          {/* TODO: Delete button */}
          {/* TODO: Preview link */}
          {/* TODO: Artisan info */}
        </aside>
      </div>
    </div>
  );
}
