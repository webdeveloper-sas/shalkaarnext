export default function CollectionDetailPage({ params: _params }: { params: { slug: string } }) {
  return (
    <div className="container-responsive py-12">
      <h1 className="text-4xl font-serif font-bold text-brand-indigo mb-8">
        {/* TODO: Display collection name from slug */}
      </h1>
      {/* TODO: Display collection products grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* TODO: Product cards */}
      </div>
    </div>
  );
}
