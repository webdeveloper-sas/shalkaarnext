export default function HomePage() {
  return (
    <main className="container-responsive py-12">
      <section className="text-center py-20">
        <h1 className="text-4xl md:text-5xl font-serif font-bold text-brand-indigo mb-6">
          Premium Balochi Fashion
        </h1>
        <p className="text-xl text-brand-dark mb-8 max-w-2xl mx-auto">
          Discover exquisite handwoven textiles and artisan crafts celebrating heritage and tradition.
        </p>
        <div className="inline-block bg-green-100 border border-green-500 text-green-700 px-6 py-3 rounded-lg font-semibold">
          ✅ Storefront ready
        </div>
      </section>

      <section className="py-16 border-t border-brand-dark/10">
        <h2 className="text-3xl font-serif font-bold text-brand-indigo mb-8">Featured Collections</h2>
        {/* TODO: Display featured collections grid */}
      </section>

      <section className="py-16 border-t border-brand-dark/10">
        <h2 className="text-3xl font-serif font-bold text-brand-indigo mb-8">Artisan Stories</h2>
        {/* TODO: Display artisan features */}
      </section>
    </main>
  );
}
