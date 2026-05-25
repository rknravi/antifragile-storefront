import { ABOUT_GALLERY } from "@/lib/about-images";
import { EditorialImage } from "@/components/rays/EditorialImage";

export function RaysAboutGallery() {
  return (
    <section className="border-t border-rays-line bg-rays-cream/30 py-14 md:py-20">
      <div className="mx-auto max-w-[1000px] px-4 md:px-8">
        <h2 className="text-center font-rays text-2xl font-extrabold uppercase text-rays-accent md:text-3xl">
          Our world
        </h2>
        <p className="mx-auto mt-3 max-w-lg text-center text-sm leading-relaxed text-rays-gray">
          The full ritual, then how each step pairs — separate from the journal and shop heroes.
        </p>
        <ul className="mt-12 flex flex-col gap-12">
          {ABOUT_GALLERY.map((t) => (
            <li key={t.src} className="text-center">
              <EditorialImage src={t.src} alt={t.alt} aspect="aspect-[16/10]" className="mx-auto max-w-3xl" />
              <p className="mt-4 text-xs font-bold uppercase tracking-wider text-rays-accent">{t.caption}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
