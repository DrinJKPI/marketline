import type { Metadata, Viewport } from "next";
// Self-hosted Geist fonts (bundled from npm, no Google Fonts request at build time).
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Marketline — everything you need, in one place",
    template: "%s · Marketline",
  },
  description:
    "Shop electronics, home, fashion and more. Browse categories, search and filter products, and save favourites to your wishlist.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${GeistSans.variable} ${GeistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">{children}</body>
    </html>
  );
}