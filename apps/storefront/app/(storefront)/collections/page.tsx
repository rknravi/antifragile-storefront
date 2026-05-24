import Link from "next/link";
import Image from "next/image";
import { RoutineBundleImage } from "@/components/commerce/RoutineBundleImage";
import { getActiveProducts } from "@/lib/get-catalog";
import { ROUTINE_BUNDLES, getBundleProducts } from "@/lib/routine-bundles";
import { brandMarketing } from "@/lib/brand-images";
import { raysPath } from "@/lib/theme-paths";

export const metadata = {
  title: "Collections",
  description: "Browse ANTIFRAGILE collections and routine bundles.",
};

export default async function RaysCollectionsPage() {
  const products = await getActiveProducts();

  const categoryCollections = [
    {
      title: "Cleanse",
      href: raysPath("/shop?category=Cleanser"),
      image: brandMarketing.collectionSun,
    },
    {
      title: "Treat & seal",
      href: raysPath("/shop"),
      image: brandMarketing.collectionTreat,
    },
  ];

  return (
    <div className="bg-rays-white px-4 py-16 md:px-8 md:py-24">
      <div className="mx-auto max-w-[1440px]">
        <h1 className="text-center font-rays text-5xl font-extrabold uppercase text-rays-accent md:text-7xl">
          Collections
        </h1>

        <section className="mt-16">
          <h2 className="font-rays text-3xl font-extrabold uppercase">Routine bundles</h2>
          <p className="mt-2 max-w-xl text-sm text-rays-gray">
            Merged ANTIFRAGILE pack shots — all four ritual bundles from the Cleanse · Treat · Seal system.
          </p>
          <ul className="mt-10 grid gap-8 sm:grid-cols-2">
            {ROUTINE_BUNDLES.map((bundle) => {
              const items = getBundleProducts(products, bundle.id);
              return (
                <li key={bundle.id}>
                  <Link
                    href={raysPath("/shop?bundle=1")}
                    className="group block overflow-hidden rounded-3xl border-2 border-rays-black bg-rays-white shadow-[6px_6px_0_#0A0A0A] transition hover:-translate-y-1"
                  >
                    <RoutineBundleImage
                      products={items}
                      fallbackSrc={bundle.imageSrc}
                      size="lg"
                      className="rounded-none border-b-2 border-rays-black"
                    />
                    <div className="bg-rays-accent py-4 text-center">
                      <span className="font-rays text-lg font-extrabold uppercase text-rays-white">
                        {bundle.title}
                      </span>
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        </section>

        <ul className="mt-16 grid gap-8 md:grid-cols-2">
          {categoryCollections.map((c) => (
            <li key={c.title}>
              <Link href={c.href} className="group relative block overflow-hidden rounded-3xl">
                <div className="relative aspect-[4/3]">
                  <Image
                    src={c.image}
                    alt=""
                    fill
                    className="object-cover transition duration-500 group-hover:scale-105"
                    sizes="(max-width:768px) 100vw, 50vw"
                  />
                </div>
                <div className="absolute bottom-0 left-0 right-0 bg-rays-accent py-5 text-center">
                  <span className="font-rays text-xl font-extrabold uppercase text-rays-white">{c.title}</span>
                </div>
              </Link>
            </li>
          ))}
        </ul>

        <p className="mt-12 text-center">
          <Link
            href={raysPath("/shop?bundle=1")}
            className="text-sm font-bold uppercase tracking-widest text-rays-accent underline"
          >
            Shop all bundles
          </Link>
        </p>
      </div>
    </div>
  );
}
