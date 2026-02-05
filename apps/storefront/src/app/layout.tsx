import type { Metadata } from "next";
import { CartProvider } from "@/context/CartContext";
import { UserProvider } from "@/context/UserContext";
import { ThemeProvider } from "@/context/ThemeContext";
import "./globals.css";

export const metadata: Metadata = {
  title: "SHALKAAR - Premium Balochi Fashion",
  description:
    "Discover exquisite Balochi textiles, handwoven crafts, and premium fashion celebrating heritage and artisan craftsmanship.",
  keywords: [
    "Balochi fashion",
    "handwoven textiles",
    "artisan crafts",
    "premium fashion",
    "heritage",
  ],
  viewport: "width=device-width, initial-scale=1",
  icons: {
    icon: "/favicon.ico",
  },
  openGraph: {
    title: "SHALKAAR - Premium Balochi Fashion",
    description: "Discover exquisite Balochi textiles and artisan crafts",
    url: "https://shalkaar.com",
    siteName: "SHALKAAR",
    type: "website",
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
        <ThemeProvider>
          <UserProvider>
            <CartProvider>{children}</CartProvider>
          </UserProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
