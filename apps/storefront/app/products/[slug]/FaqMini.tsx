"use client";

import { useState } from "react";

const items = [
  {
    q: "Is this suitable for sensitive skin?",
    a: "We include patch-test guidance. Start slow with serums and monitor tolerance.",
  },
  {
    q: "Can I use the serum in the morning?",
    a: "Pre-Shift is designed for PM use. Always use SPF during the day when using renewal products.",
  },
];

export function FaqMini() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <div className="mt-4 divide-y divide-neutral-200 rounded-2xl border border-neutral-200">
      {items.map((item, i) => (
        <div key={item.q}>
          <button
            type="button"
            className="flex w-full items-center justify-between px-4 py-3 text-left text-sm font-semibold text-neutral-900"
            onClick={() => setOpen(open === i ? null : i)}
            aria-expanded={open === i}
          >
            {item.q}
            <span className="text-neutral-400">{open === i ? "−" : "+"}</span>
          </button>
          {open === i && <p className="px-4 pb-3 text-sm text-neutral-600">{item.a}</p>}
        </div>
      ))}
    </div>
  );
}
