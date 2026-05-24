import Link from "next/link";
import { BRAND_IMAGES } from "@/lib/brand-images";
import { raysPath } from "@/lib/theme-paths";

const tiles = [
  {
    title: "Cleanse & seal",
    body: "Cleanser + moisturizer.",
    href: raysPath("/shop?bundle=1"),
    bundleImg: BRAND_IMAGES.cleanseSealBundle,
  },
  {
    title: "Cleanse & treat",
    body: "Cleanser + serum.",
    href: raysPath("/shop?bundle=1"),
    bundleImg: BRAND_IMAGES.cleanseTreatBundle,
  },
  {
    title: "Full ritual",
    body: "Complete cleanse · treat · seal.",
    href: raysPath("/shop?bundle=1"),
    bundleImg: BRAND_IMAGES.fullRitualBundle,
  },
];

export function RaysPromoTiles() {
  return (
    <section className="mx-auto max-w-[1440px] px-4 py-20 md:px-8">
      <div className="grid gap-4 md:grid-cols-3">
        {tiles.map((t) => (
          <Link
            key={t.title}
            href={t.href}
            className="group overflow-hidden border-2 border-rays-black bg-rays-white transition hover:shadow-[8px_8px_0_#0A0A0A]"
          >
            <div className="border-b-2 border-rays-black bg-white p-4">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={t.bundleImg} alt="" className="pack-shot-cutout mx-auto h-32 w-full object-contain" />
            </div>
            <div className="p-6 group-hover:bg-rays-accent">
              <p className="text-xs font-bold uppercase tracking-widest text-rays-gray group-hover:text-rays-white/80">
                Bundle
              </p>
              <h3 className="mt-2 font-rays text-2xl font-extrabold uppercase group-hover:text-rays-white">{t.title}</h3>
              <p className="mt-2 text-sm text-rays-gray group-hover:text-rays-white/90">{t.body}</p>
              <span className="mt-4 inline-block text-xs font-bold uppercase tracking-widest group-hover:text-rays-white">
                Explore →
              </span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
