export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col min-h-screen">
      {/* TODO: Add header/navigation for marketing pages */}
      <main className="flex-1">{children}</main>
      {/* TODO: Add footer */}
    </div>
  );
}
