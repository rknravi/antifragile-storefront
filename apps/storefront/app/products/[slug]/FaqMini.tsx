"use client";

import Link from "next/link";
import { useState } from "react";
import type { StoreTheme } from "@/lib/theme-paths";
import { themeNavPaths } from "@/lib/theme-nav-paths";

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

export function FaqMini({ variant = "classic" }: { variant?: StoreTheme }) {
  const [open, setOpen] = useState<number | null>(0);
  const rays = variant === "rays";
  const nav = themeNavPaths(variant);

  return (
    <div>
      <p className={rays ? "mb-3 text-sm text-rays-gray" : "mb-3 text-sm text-neutral-600"}>
        Product-specific questions below. For orders, shipping, and returns, see the{" "}
        <Link
          href={nav.faq}
          className={rays ? "font-semibold text-rays-accent underline hover:no-underline" : "font-medium text-brand-fresh underline hover:no-underline"}
        >
          full FAQ
        </Link>
        .
      </p>
      <div
        className={
          rays
            ? "mt-4 divide-y-2 divide-rays-line border-2 border-rays-black"
            : "mt-4 divide-y divide-neutral-200 rounded-2xl border border-neutral-200"
        }
      >
        {items.map((item, i) => (
          <div key={item.q}>
            <button
              type="button"
              className={
                rays
                  ? "flex w-full items-center justify-between px-4 py-3 text-left text-sm font-bold uppercase tracking-wide text-rays-black"
                  : "flex w-full items-center justify-between px-4 py-3 text-left text-sm font-semibold text-neutral-900"
              }
              onClick={() => setOpen(open === i ? null : i)}
              aria-expanded={open === i}
            >
              {item.q}
              <span className={rays ? "text-rays-accent" : "text-neutral-400"}>{open === i ? "−" : "+"}</span>
            </button>
            {open === i && (
              <p className={rays ? "px-4 pb-3 text-sm text-rays-gray" : "px-4 pb-3 text-sm text-neutral-600"}>
                {item.a}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
