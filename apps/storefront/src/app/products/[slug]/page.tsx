export default function ProductDetailPage({ params }: { params: { slug: string } }) {
  return (
    <div className="container-responsive py-12">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          {/* TODO: Product images gallery */}
        </div>
        <div>
          <h1 className="text-3xl font-serif font-bold text-brand-indigo mb-4">
            {/* TODO: Display product name */}
          </h1>
          {/* TODO: Display price, description, variants, add to cart button */}
          {/* TODO: Display artisan information, reviews */}
        </div>
      </div>

      <section className="mt-16">
        <h2 className="text-2xl font-serif font-bold text-brand-indigo mb-8">Related Products</h2>
        {/* TODO: Display related products */}
      </section>
    </div>
  );
}
