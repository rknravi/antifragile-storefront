import type { Metadata } from "next";
import "./globals.css";
import { CartProvider } from "@/lib/cart-context";
import { Ga4 } from "@/components/Ga4";
import { MetaPixel } from "@/components/MetaPixel";
import { getActiveProducts } from "@/lib/get-catalog";
import { CommerceShell } from "@/components/commerce/CommerceShell";
import { Analytics } from "@vercel/analytics/next";

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
    <html lang="en">
      <body>
        <Ga4 />
        <MetaPixel />
        <CartProvider initialCatalog={catalog}>
          {children}
          <CommerceShell />
        </CartProvider>
        <Analytics />
      </body>
    </html>
  );
}
