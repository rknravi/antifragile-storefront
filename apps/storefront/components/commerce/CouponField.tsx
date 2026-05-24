"use client";

import { useEffect, useState } from "react";
import { useCart } from "@/lib/cart-context";
import { couponHint, isValidCouponCode, normalizeCouponCode } from "@/lib/pricing";

type Props = {
  variant?: "classic" | "rays";
  compact?: boolean;
  /** Rhode-style row in checkout sidebar */
  layout?: "default" | "sidebar";
};

export function CouponField({ variant = "rays", compact = false, layout = "default" }: Props) {
  const { coupon, setCoupon } = useCart();
  const [draft, setDraft] = useState(coupon ?? "");
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    setDraft(coupon ?? "");
    if (coupon) setMessage("10% discount applied.");
    else setMessage(null);
  }, [coupon]);

  const sidebar = layout === "sidebar";

  const inputClass = sidebar
    ? "min-w-0 flex-1 rounded-md border border-neutral-300 bg-white px-3 py-2.5 text-sm focus:border-neutral-900 focus:outline-none"
    : variant === "rays"
      ? "flex-1 border-2 border-rays-line bg-white px-3 py-2 text-sm uppercase focus:border-rays-accent focus:outline-none"
      : "flex-1 rounded-lg border border-neutral-200 px-3 py-2 text-sm";

  const btnClass = sidebar
    ? "shrink-0 rounded-md border border-neutral-300 bg-neutral-100 px-4 py-2.5 text-sm font-medium text-neutral-800 hover:bg-neutral-200"
    : variant === "rays"
      ? "shrink-0 border-2 border-rays-black bg-rays-black px-4 py-2 text-xs font-bold uppercase tracking-wider text-rays-accent hover:bg-rays-gray"
      : "shrink-0 rounded-lg bg-neutral-900 px-4 py-2 text-sm font-semibold text-white";

  function apply() {
    const trimmed = draft.trim();
    if (!trimmed) {
      setCoupon(null);
      setMessage(null);
      return;
    }
    if (!isValidCouponCode(trimmed)) {
      setCoupon(null);
      setMessage(`Invalid code. Try ${couponHint()}.`);
      return;
    }
    const normalized = normalizeCouponCode(trimmed)!;
    setCoupon(normalized);
    setDraft(normalized);
    setMessage("10% discount applied.");
  }

  function remove() {
    setDraft("");
    setCoupon(null);
    setMessage(null);
  }

  return (
    <div className={compact ? "space-y-2" : "space-y-2"}>
      <label
        htmlFor="cart-coupon"
        className={
          sidebar
            ? "sr-only"
            : variant === "rays"
              ? "text-xs font-bold uppercase tracking-wider text-rays-gray"
              : "text-sm text-neutral-600"
        }
      >
        {sidebar ? "Discount code" : "Promo code"}
      </label>
      <div className="flex gap-2">
        <input
          id="cart-coupon"
          value={draft}
          onChange={(e) => setDraft(e.target.value.toUpperCase())}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              apply();
            }
          }}
          placeholder={sidebar ? "Discount code" : "LAUNCH10"}
          autoComplete="off"
          maxLength={32}
          className={inputClass}
          aria-describedby={message ? "coupon-message" : undefined}
        />
        <button type="button" onClick={apply} className={btnClass}>
          Apply
        </button>
      </div>
      {coupon ? (
        <button
          type="button"
          onClick={remove}
          className={`text-xs underline ${variant === "rays" ? "text-rays-gray hover:text-rays-accent" : "text-neutral-500"}`}
        >
          Remove code
        </button>
      ) : null}
      {message ? (
        <p
          id="coupon-message"
          className={`text-xs ${message.includes("Invalid") ? "text-red-700" : variant === "rays" ? "text-rays-accent font-semibold" : "text-emerald-800"}`}
          role="status"
        >
          {message}
        </p>
      ) : sidebar ? null : (
        <p className={`text-xs ${variant === "rays" ? "text-rays-gray" : "text-neutral-500"}`}>
          {couponHint()} — 10% off subtotal
        </p>
      )}
    </div>
  );
}
