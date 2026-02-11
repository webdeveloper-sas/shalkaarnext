import type { Metadata } from "next";
import { AdminProvider } from "@/context/AdminContext";
import { AuthProvider } from "@/context/AuthContext";
import "./globals.css";

export const metadata: Metadata = {
  title: "SHALKAAR Admin Dashboard",
  description: "Admin dashboard for managing SHALKAAR e-commerce platform",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="theme-color" content="#2a1555" />
      </head>
      <body>
        <AuthProvider>
          <AdminProvider>{children}</AdminProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
