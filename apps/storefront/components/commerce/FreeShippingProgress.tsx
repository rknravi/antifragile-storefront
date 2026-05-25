"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useCart } from "@/lib/cart-context";
import { getFreeShippingProgress } from "@/lib/free-shipping";
import { Money } from "@/components/Money";

type Props = {
  variant?: "rays" | "classic";
  shopHref: string;
  onShopClick?: () => void;
  className?: string;
  align?: "center" | "left";
  /** White text + light bar on orange announcement/cart header */
  onAccentBackground?: boolean;
  /** When true, render nothing once free shipping applies (totals still show FREE). */
  hideWhenQualified?: boolean;
};

export function FreeShippingProgress({
  variant = "classic",
  shopHref,
  onShopClick,
  className = "",
  align = "center",
  onAccentBackground = false,
  hideWhenQualified = false,
}: Props) {
  const { lines, subtotal, discount } = useCart();
  const rays = variant === "rays";

  const qualifyingTotal = Math.max(0, subtotal - discount);
  const isEmpty = lines.length === 0;

  const state = useMemo(
    () => getFreeShippingProgress(qualifyingTotal, isEmpty),
    [qualifyingTotal, isEmpty]
  );

  if (hideWhenQualified && !isEmpty && state.qualified) return null;

  const barTrack = onAccentBackground
    ? "border-rays-white/40 bg-rays-white/20"
    : rays
      ? "border-rays-line bg-rays-white"
      : "border-neutral-300 bg-white";
  const barFill = onAccentBackground ? "bg-rays-white" : rays ? "bg-rays-accent" : "bg-neutral-900";

  const mutedText = onAccentBackground ? "text-rays-white/90" : rays ? "text-rays-gray" : "text-neutral-600";
  const strongText = onAccentBackground ? "text-rays-white" : rays ? "text-rays-black" : "text-neutral-800";
  const linkClass = onAccentBackground
    ? "text-rays-white underline hover:text-rays-white/90"
    : rays
      ? "text-rays-accent"
      : "text-neutral-900";

  const alignClass = align === "left" ? "text-left" : "text-center";

  return (
    <section
      className={`${alignClass} ${className}`}
      aria-label="Free shipping progress"
    >
      {isEmpty ? (
        <p className={`text-sm ${mutedText}`}>Your cart is currently empty</p>
      ) : state.qualified ? (
        <p className={`text-sm font-medium ${strongText}`}>
          You&apos;ve unlocked <span className="font-bold">FREE</span> shipping
        </p>
      ) : (
        <p className={`text-sm ${mutedText}`}>
          Free shipping on orders <Money amount={state.threshold} />+
        </p>
      )}

      <div
        className={`mt-3 h-2.5 w-full max-w-xs overflow-hidden rounded-full border ${barTrack} ${
          align === "center" ? "mx-auto" : ""
        }`}
        role="progressbar"
        aria-valuenow={state.progress}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={
          state.qualified
            ? "Free shipping unlocked"
            : `${state.progress}% toward free shipping`
        }
      >
        <div
          className={`h-full rounded-full transition-all duration-500 ease-out ${barFill}`}
          style={{ width: `${state.progress}%` }}
        />
      </div>

      {!state.qualified ? (
        <p className={`mt-3 text-sm ${strongText}`}>
          Add{" "}
          <span className="font-semibold tabular-nums">
            <Money amount={state.remaining} />
          </span>{" "}
          more for <span className="font-bold">FREE</span> shipping
        </p>
      ) : null}

      {isEmpty ? (
        <Link
          href={shopHref}
          onClick={onShopClick}
          className={`mt-4 inline-block text-xs font-bold uppercase tracking-widest underline-offset-2 hover:underline ${linkClass}`}
        >
          Shop to qualify
        </Link>
      ) : null}
    </section>
  );
}
