"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { getThemeFromPath, themeShopPath } from "@/lib/theme-paths";

const KEY = "af_promo_popup_v1";

export function PromoPopup() {
  const pathname = usePathname();
  const [show, setShow] = useState(false);
  const theme = getThemeFromPath(pathname);
  const rays = theme === "rays";

  useEffect(() => {
    if (typeof window === "undefined") return;
    const t = window.setTimeout(() => {
      if (!sessionStorage.getItem(KEY)) setShow(true);
    }, 4000);
    return () => window.clearTimeout(t);
  }, [pathname]);

  if (!show) return null;

  const shopHref = themeShopPath(pathname);

  return (
    <div className="fixed bottom-4 left-4 right-4 z-[90] md:left-auto md:right-6 md:max-w-sm">
      <div
        role="dialog"
        aria-label="Promotional offer"
        className={`relative overflow-hidden border p-6 shadow-2xl ${
          rays ? "border-rays-black bg-rays-black text-rays-white" : "rounded-2xl border-black/10 bg-white"
        }`}
      >
        <button
          type="button"
          aria-label="Close"
          className="absolute right-3 top-3 text-neutral-400 hover:text-neutral-800"
          onClick={() => {
            sessionStorage.setItem(KEY, "1");
            setShow(false);
          }}
        >
          ✕
        </button>
        <p className="text-xs font-semibold uppercase tracking-wider text-brand-fresh">
          Launch offer
        </p>
        <p
          className={`mt-2 ${rays ? "font-rays text-2xl uppercase text-rays-accent" : "font-display text-xl"}`}
        >
          10% off with LAUNCH10
        </p>
        <p className={`mt-2 text-sm ${rays ? "text-rays-line" : "text-neutral-600"}`}>
          Plus complimentary shipping above ₹999.
        </p>
        <Link
          href={shopHref}
          className={`mt-4 inline-flex w-full justify-center py-2.5 text-[10px] font-semibold uppercase tracking-[0.25em] ${
            rays ? "bg-rays-accent text-rays-black hover:bg-white" : "rounded-full bg-neutral-900 text-white"
          }`}
          onClick={() => {
            sessionStorage.setItem(KEY, "1");
            setShow(false);
          }}
        >
          Shop now
        </Link>
      </div>
    </div>
  );
}
