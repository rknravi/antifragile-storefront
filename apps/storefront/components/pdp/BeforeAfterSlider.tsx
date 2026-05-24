"use client";

import { useState } from "react";
import Image from "next/image";

type Props = {
  before: string;
  after: string;
  label?: string;
};

export function BeforeAfterSlider({ before, after, label }: Props) {
  const [pos, setPos] = useState(50);

  return (
    <section className="mt-12">
      <h2 className="font-display text-xl">Before & after</h2>
      {label && <p className="mt-1 text-sm text-neutral-500">{label}</p>}
      <div className="relative mt-4 aspect-[16/10] w-full overflow-hidden bg-neutral-100">
        <Image src={after} alt="After" fill className="object-cover" sizes="(min-width:768px) 50vw, 100vw" unoptimized />
        <div
          className="absolute inset-0 overflow-hidden"
          style={{ clipPath: `inset(0 ${100 - pos}% 0 0)` }}
        >
          <Image src={before} alt="Before" fill className="object-cover" sizes="(min-width:768px) 50vw, 100vw" unoptimized />
        </div>
        <div
          className="pointer-events-none absolute bottom-0 top-0 w-0.5 bg-white shadow-md"
          style={{ left: `${pos}%` }}
          aria-hidden
        />
        <input
          type="range"
          min={5}
          max={95}
          value={pos}
          onChange={(e) => setPos(Number(e.target.value))}
          className="absolute inset-x-4 bottom-4 z-10 w-[calc(100%-2rem)] cursor-ew-resize accent-neutral-900"
          aria-label="Drag to compare before and after"
        />
      </div>
    </section>
  );
}
