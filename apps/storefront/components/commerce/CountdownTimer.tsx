"use client";

import { useEffect, useState } from "react";

/** Launch promo countdown — resets daily for demo. */
export function CountdownTimer({ variant = "classic" }: { variant?: "classic" | "rays" }) {
  const [left, setLeft] = useState({ h: 0, m: 0, s: 0 });

  useEffect(() => {
    const tick = () => {
      const end = new Date();
      end.setHours(23, 59, 59, 999);
      const diff = Math.max(0, end.getTime() - Date.now());
      setLeft({
        h: Math.floor(diff / 3_600_000),
        m: Math.floor((diff % 3_600_000) / 60_000),
        s: Math.floor((diff % 60_000) / 1000),
      });
    };
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, []);

  const pad = (n: number) => String(n).padStart(2, "0");
  const box =
    variant === "rays"
      ? "min-w-[2.5rem] border-2 border-rays-line bg-rays-white px-2 py-1 font-mono text-sm text-rays-black"
      : "min-w-[2.5rem] rounded-lg bg-white/90 px-2 py-1 font-mono text-sm text-neutral-900 shadow-sm";
  const labelClass =
    variant === "rays"
      ? "text-xs font-bold uppercase tracking-wider text-rays-accent"
      : "text-xs text-neutral-600";
  const sepClass = variant === "rays" ? "text-rays-gray" : "text-neutral-400";

  return (
    <div className="flex items-center gap-2" aria-live="polite" aria-label="Offer ends at midnight">
      <span className={labelClass}>Ends in</span>
      <span className={box}>{pad(left.h)}</span>
      <span className={sepClass}>:</span>
      <span className={box}>{pad(left.m)}</span>
      <span className={sepClass}>:</span>
      <span className={box}>{pad(left.s)}</span>
    </div>
  );
}
