export default function AdminHomePage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-brand-indigo to-brand-dark text-white">
      <div className="container-responsive py-20">
        <div className="text-center">
          <h1 className="text-5xl font-serif font-bold mb-4">Admin CMS</h1>
          <p className="text-xl text-brand-cream mb-8">Management dashboard for SHALKAAR</p>
          <div className="inline-block bg-white/10 backdrop-blur px-6 py-4 rounded-lg border border-white/20">
            <p className="text-lg font-semibold">✅ Admin CMS ready</p>
          </div>
        </div>

        <div className="mt-16 grid md:grid-cols-3 gap-8">
          <div className="bg-white/5 p-6 rounded-lg border border-white/10">
            <h3 className="text-xl font-bold mb-2">Dashboard</h3>
            <p className="text-brand-cream/80">Manage store operations and analytics</p>
          </div>
          <div className="bg-white/5 p-6 rounded-lg border border-white/10">
            <h3 className="text-xl font-bold mb-2">Products</h3>
            <p className="text-brand-cream/80">Manage inventory and product catalog</p>
          </div>
          <div className="bg-white/5 p-6 rounded-lg border border-white/10">
            <h3 className="text-xl font-bold mb-2">Artisans</h3>
            <p className="text-brand-cream/80">Manage artisan profiles and content</p>
          </div>
        </div>
      </div>
    </main>
  );
}
