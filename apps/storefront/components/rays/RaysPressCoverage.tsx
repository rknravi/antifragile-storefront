import Image from "next/image";
import { brandMarketing } from "@/lib/brand-images";

const PRESS = [
  { outlet: "Beauty Edit", quote: "Bold, conversion-focused skincare UX." },
  { outlet: "Skin Daily", quote: "A routine that feels as sharp as it performs." },
  { outlet: "RKN Journal", quote: "Transparent INCI, India-first checkout." },
];

/** Press coverage section — Zap / Rays marketing feature. */
export function RaysPressCoverage() {
  return (
    <section className="border-y-2 border-rays-black bg-rays-surface py-20">
      <div className="mx-auto max-w-[1440px] px-4 md:px-8">
        <p className="text-xs font-bold uppercase tracking-[0.35em] text-rays-gray">Press</p>
        <h2 className="mt-2 font-rays text-4xl font-extrabold uppercase md:text-5xl">As featured in</h2>
        <div className="mt-12 grid gap-8 md:grid-cols-3">
          {PRESS.map((p) => (
            <blockquote key={p.outlet} className="border-2 border-rays-black bg-rays-white p-6 shadow-[6px_6px_0_#0A0A0A]">
              <p className="font-rays text-xl font-bold uppercase">{p.outlet}</p>
              <p className="mt-3 text-sm text-rays-gray">&ldquo;{p.quote}&rdquo;</p>
            </blockquote>
          ))}
        </div>
        <div className="relative mt-12 aspect-[21/9] overflow-hidden border-2 border-rays-black">
          <Image src={brandMarketing.press} alt="Press feature" fill className="object-cover object-center" />
        </div>
      </div>
    </section>
  );
}
