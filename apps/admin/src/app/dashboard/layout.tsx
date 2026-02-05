export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      {/* TODO: Create sidebar navigation with sections: */}
      {/* - Dashboard Overview */}
      {/* - Products Management */}
      {/* - Collections Management */}
      {/* - Order Management */}
      {/* - Artisan Management */}
      {/* - Content Management */}
      {/* - Customer Management */}
      {/* - Analytics */}
      {/* - Settings */}
      {/* - Logout */}

      <div className="flex-1">
        {/* TODO: Header with user menu and notifications */}
        <main className="p-8">{children}</main>
      </div>
    </div>
  );
}
