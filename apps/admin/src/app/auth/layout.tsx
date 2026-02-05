export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-brand-cream">
      <div className="max-w-md w-full">
        {/* TODO: Add SHALKAAR branding header */}
        {children}
      </div>
    </div>
  );
}
