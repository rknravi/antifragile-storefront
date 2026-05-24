import { Suspense } from "react";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import RaysShopGrid from "./RaysShopGrid";
import { getActiveProducts } from "@/lib/get-catalog";
import { raysPath } from "@/lib/theme-paths";

export const metadata = {
  title: "Shop",
  description: "Shop ANTIFRAGILE — filters, quick view, and the full resilience routine.",
};

export default async function RaysShopPage() {
  const products = await getActiveProducts();

  return (
    <div className="mx-auto max-w-[1440px] px-4 py-8 md:px-8">
      <Breadcrumbs
        variant="rays"
        items={[
          { label: "Home", href: raysPath("/") },
          { label: "Shop" },
        ]}
      />
      <Suspense
        fallback={
          <div className="py-20 text-center text-xs font-bold uppercase tracking-widest text-rays-gray">
            Loading…
          </div>
        }
      >
        <RaysShopGrid products={products} />
      </Suspense>
    </div>
  );
}
