import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/lib/cart-context";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { WhatsAppFloat } from "@/components/WhatsAppFloat";
import { Ga4 } from "@/components/Ga4";
import { MetaPixel } from "@/components/MetaPixel";
import { getActiveProducts } from "@/lib/get-catalog";

const sans = Inter({
  subsets: ["latin"],
  variable: "--font-geist-sans",
});

const display = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-display",
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"),
  title: {
    default: "ANTIFRAGILE Skincare | RKN Overseas",
    template: "%s | ANTIFRAGILE",
  },
  description:
    "Cleanse. Restore. Strengthen. Premium ANTIFRAGILE skincare by RKN Overseas—built for daily resilience.",
  openGraph: {
    title: "ANTIFRAGILE Skincare",
    description: "Modern skincare for daily resilience.",
    siteName: "ANTIFRAGILE",
  },
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const catalog = await getActiveProducts();

  return (
    <html lang="en" className={`${sans.variable} ${display.variable}`}>
      <body className="font-sans">
        <Ga4 />
        <MetaPixel />
        <CartProvider initialCatalog={catalog}>
          <SiteHeader />
          <main className="min-h-[60vh]">{children}</main>
          <SiteFooter />
          <WhatsAppFloat />
        </CartProvider>
      </body>
    </html>
  );
}
