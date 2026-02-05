export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-brand-cream">
      {/* TODO: Add brand logo/branding on left side */}
      {children}
    </div>
  );
}
