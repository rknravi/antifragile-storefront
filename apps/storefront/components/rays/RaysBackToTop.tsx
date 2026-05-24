"use client";

import { useEffect, useState } from "react";

export function RaysBackToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 500);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (!visible) return null;

  return (
    <button
      type="button"
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      className="fixed bottom-20 right-4 z-40 border-2 border-rays-accent bg-rays-accent px-4 py-2 text-xs font-bold uppercase tracking-widest text-rays-white shadow-lg md:bottom-6"
      aria-label="Back to top"
    >
      Top
    </button>
  );
}
