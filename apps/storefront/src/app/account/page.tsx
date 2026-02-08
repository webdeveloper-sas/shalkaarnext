// import { redirect } from "next/navigation";
// redirect function needed for future authentication checks

export default function AccountPage() {
  // TODO: Check if user is authenticated, redirect to auth if not
  // if (!user) redirect('/auth/login');

  return (
    <div className="container-responsive py-12">
      <h1 className="text-4xl font-serif font-bold text-brand-indigo mb-8">My Account</h1>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        <aside>
          {/* TODO: Account navigation sidebar */}
          {/* TODO: Profile, Orders, Wishlist, Settings, Logout */}
        </aside>
        <main className="md:col-span-3">
          {/* TODO: Display account content based on active tab */}
        </main>
      </div>
    </div>
  );
}
