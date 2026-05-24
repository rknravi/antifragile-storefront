"use client";

import { useEffect, useId, useRef, useState } from "react";
import {
  SHOP_SORT_OPTIONS,
  shopSortLabel,
  type ShopSortKey,
} from "@/lib/shop-sort";

type Props = {
  value: ShopSortKey;
  onChange: (value: ShopSortKey) => void;
  className?: string;
  /** Menu alignment relative to trigger */
  menuAlign?: "left" | "right";
};

export function ShopSortDropdown({ value, onChange, className = "", menuAlign = "right" }: Props) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const listId = useId();

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const select = (key: ShopSortKey) => {
    onChange(key);
    setOpen(false);
  };

  return (
    <div ref={rootRef} className={`relative ${className}`}>
      <button
        type="button"
        className="flex items-center gap-1.5 text-sm text-neutral-800"
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-controls={listId}
        onClick={() => setOpen((o) => !o)}
      >
        <span className="text-neutral-600">Sort:</span>
        <span className="font-semibold">{shopSortLabel(value)}</span>
        <svg
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className={`shrink-0 transition ${open ? "rotate-180" : ""}`}
          aria-hidden
        >
          <path d="M6 9l6 6 6-6" />
        </svg>
      </button>

      {open ? (
        <div
          className={`absolute z-30 mt-2 w-56 rounded-xl border border-neutral-200/80 bg-neutral-100 p-2 shadow-lg ${
            menuAlign === "left" ? "left-0" : "right-0"
          }`}
          role="listbox"
          id={listId}
          aria-label="Sort products"
        >
          <div className="mb-1 flex justify-end">
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="flex h-6 w-6 items-center justify-center rounded-full bg-neutral-700 text-white"
              aria-label="Close sort menu"
            >
              <span className="block h-0.5 w-2.5 rounded-full bg-white" />
            </button>
          </div>
          <ul className="space-y-0.5">
            {SHOP_SORT_OPTIONS.map((opt) => {
              const selected = opt.value === value;
              return (
                <li key={opt.value}>
                  <button
                    type="button"
                    role="option"
                    aria-selected={selected}
                    onClick={() => select(opt.value)}
                    className={`w-full rounded-lg px-3 py-2.5 text-left text-sm lowercase transition ${
                      selected
                        ? "bg-white font-medium text-neutral-900 shadow-sm"
                        : "text-neutral-700 hover:bg-white/60"
                    }`}
                  >
                    {opt.label}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
