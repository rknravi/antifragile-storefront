import Link from "next/link";
import { CountdownTimer } from "@/components/commerce/CountdownTimer";
import { RaysHeroSlideshow } from "@/components/rays/RaysHeroSlideshow";
import { RaysTrustBar } from "@/components/rays/RaysTrustBar";
import { RaysFeaturedGrid } from "@/components/rays/RaysFeaturedGrid";
import { RaysPressCoverage } from "@/components/rays/RaysPressCoverage";
import { RaysPromoTiles } from "@/components/rays/RaysPromoTiles";
import { RaysLookbookHotspot } from "@/components/rays/RaysLookbookHotspot";
import { RaysContactStrip } from "@/components/rays/RaysContactStrip";
import { RaysRecentlyViewed } from "@/components/rays/RaysRecentlyViewed";
import { getActiveProducts } from "@/lib/get-catalog";
import { raysPath } from "@/lib/theme-paths";

export default async function RaysHomePage() {
  const products = (await getActiveProducts()).filter((p) => p.status === "active");

  return (
    <div>
      <RaysHeroSlideshow products={products} />
      <RaysTrustBar />

      <section className="border-b-2 border-rays-black bg-rays-white py-8">
        <div className="mx-auto flex max-w-[1440px] flex-col items-center justify-between gap-6 px-4 md:flex-row md:px-8">
          <p className="font-rays text-xl font-bold uppercase">Launch ends tonight</p>
          <CountdownTimer variant="rays" />
        </div>
      </section>

      <section className="mx-auto max-w-[1440px] px-4 py-20 md:px-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.35em] text-rays-gray">Featured</p>
            <h2 className="font-rays text-4xl font-extrabold uppercase md:text-5xl">The drop</h2>
          </div>
          <Link
            href={raysPath("/shop")}
            className="inline-flex border-2 border-rays-black px-6 py-3 text-xs font-bold uppercase tracking-widest hover:bg-rays-accent"
          >
            Shop all
          </Link>
        </div>
        <div className="mt-12">
          <RaysFeaturedGrid products={products} />
        </div>
      </section>

      <RaysLookbookHotspot products={products} />
      <RaysPressCoverage />
      <RaysPromoTiles />
      <RaysRecentlyViewed />

      <section className="bg-rays-black py-24 text-rays-white">
        <div className="mx-auto max-w-[1440px] px-4 text-center md:px-8">
          <h2 className="font-rays text-4xl font-extrabold uppercase md:text-6xl">LAUNCH10</h2>
          <p className="mx-auto mt-4 max-w-md text-rays-line">10% off at checkout. Recommended products on every PDP.</p>
          <Link
            href={raysPath("/shop")}
            className="mt-10 inline-flex bg-rays-accent px-10 py-4 text-xs font-bold uppercase tracking-widest text-rays-white"
          >
            Shop now
          </Link>
        </div>
      </section>

      <RaysContactStrip />
    </div>
  );
}
