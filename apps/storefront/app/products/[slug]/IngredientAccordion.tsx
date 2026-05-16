"use client";

import { useState } from "react";

export function IngredientAccordion({ ingredients }: { ingredients: string[] }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="rounded-2xl border border-neutral-200 bg-white">
      <button
        type="button"
        className="flex w-full items-center justify-between px-4 py-3 text-left text-base font-semibold text-neutral-900"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
      >
        Ingredients
        <span className="text-neutral-400">{open ? "−" : "+"}</span>
      </button>
      {open && (
        <div className="border-t border-neutral-100 px-4 py-3 text-sm text-neutral-700">
          <ul className="list-disc space-y-1 pl-5">
            {ingredients.map((i) => (
              <li key={i}>{i}</li>
            ))}
          </ul>
          <p className="mt-3 text-xs text-neutral-500">
            Full INCI on pack. Glossary: <a className="underline" href="/ingredients">/ingredients</a>
          </p>
        </div>
      )}
    </div>
  );
}
