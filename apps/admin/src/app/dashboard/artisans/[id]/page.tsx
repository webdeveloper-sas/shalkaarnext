export default function ArtisanDetailPage({ params }: { params: { id: string } }) {
  return (
    <div>
      <div className="mb-8">
        {/* TODO: Back button */}
        <h1 className="text-4xl font-serif font-bold text-brand-indigo">Artisan Profile</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          {/* TODO: Artisan basic info form */}
          {/* - Name, Email, Phone */}
          {/* - Bio/Story */}
          {/* - Specialty/Crafts */}
          {/* - Region/Location */}
          {/* - Social links */}

          {/* TODO: Products section */}
          {/* - List of products by this artisan */}

          {/* TODO: Performance metrics */}
          {/* - Sales, Products sold, Ratings */}
        </div>

        <aside className="space-y-6">
          {/* TODO: Artisan image/avatar */}
          {/* TODO: Status toggle */}
          {/* TODO: Save button */}
          {/* TODO: Contact artisan button */}
          {/* TODO: Payment/Commission info */}
        </aside>
      </div>
    </div>
  );
}
