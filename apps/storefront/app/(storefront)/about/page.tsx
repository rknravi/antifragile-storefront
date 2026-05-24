import Link from "next/link";
import { RaysAboutGallery } from "@/components/rays/RaysAboutGallery";
import { RaysPageBreadcrumbs } from "@/components/rays/RaysPageBreadcrumbs";
import { raysPath } from "@/lib/theme-paths";

export const metadata = {
  title: "About",
  description: "Our story — ANTIFRAGILE by RKN Overseas.",
};

export default function RaysAboutPage() {
  return (
    <div className="bg-rays-white">
      <RaysPageBreadcrumbs trail={[{ label: "About" }]} />
      <section className="mx-auto max-w-3xl px-4 py-10 text-center md:px-8 md:py-20">
        <h1 className="font-rays text-4xl font-extrabold uppercase text-rays-accent md:text-6xl">About us</h1>
        <p className="mt-8 font-display text-xl italic leading-relaxed text-rays-accent md:text-2xl">
          Clarity, depth, and the kind of stories that stay with you.
        </p>
        <p className="mt-8 text-base leading-relaxed text-rays-gray">
          ANTIFRAGILE is a modern skincare line from RKN Overseas—built for daily resilience with honest textures and
          transparent guidance. Cleanse. Restore. Strengthen.
        </p>
        <Link
          href={raysPath("/shop")}
          className="mt-10 inline-flex rounded-full bg-rays-accent px-10 py-4 text-xs font-bold uppercase tracking-widest text-rays-white"
        >
          Shop the collection
        </Link>
      </section>
      <RaysAboutGallery />
      <section className="mx-auto max-w-2xl px-4 pb-20 text-center md:px-8">
        <h2 className="font-rays text-2xl font-extrabold uppercase text-rays-accent">Quality & safety</h2>
        <p className="mt-4 text-sm leading-relaxed text-rays-gray">
          Patch-test guidance, clear INCI lists, and conservative introductions for active products. Always read the
          label and consult a dermatologist for persistent concerns.
        </p>
      </section>
    </div>
  );
}
