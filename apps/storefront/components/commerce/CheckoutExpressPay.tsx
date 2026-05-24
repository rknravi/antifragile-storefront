"use client";

import type { CheckoutFlags } from "@/lib/checkout-flags";

type Gateway = "razorpay" | "cashfree" | "demo" | "cod";

type Props = {
  flags: CheckoutFlags;
  selected: Gateway;
  onSelect: (gw: Gateway) => void;
  variant?: "rays" | "classic";
};

export function CheckoutExpressPay({ flags, selected, onSelect, variant = "classic" }: Props) {
  const options: { id: Gateway; label: string; show: boolean; className: string }[] = [
    {
      id: "razorpay",
      label: "Razorpay",
      show: flags.showRazorpay,
      className: "bg-[#072654] text-white hover:bg-[#0a3270]",
    },
    {
      id: "cashfree",
      label: "Cashfree",
      show: flags.showCashfree,
      className: "bg-[#f97316] text-white hover:bg-[#ea580c]",
    },
    {
      id: "cod",
      label: "Cash on delivery",
      show: flags.showCod,
      className: "bg-neutral-800 text-white hover:bg-neutral-900",
    },
    {
      id: "demo",
      label: "Demo checkout",
      show: true,
      className: variant === "rays" ? "bg-rays-black text-rays-accent hover:bg-rays-gray" : "bg-neutral-200 text-neutral-900 hover:bg-neutral-300",
    },
  ];

  const visible = options.filter((o) => o.show);
  if (visible.length <= 1) return null;

  return (
    <section aria-label="Express checkout">
      <h2 className="text-sm font-semibold text-neutral-900">Express checkout</h2>
      <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
        {visible.map((opt) => (
          <button
            key={opt.id}
            type="button"
            onClick={() => onSelect(opt.id)}
            className={`rounded-lg px-3 py-3 text-center text-xs font-bold uppercase tracking-wide transition ${
              opt.className
            } ${selected === opt.id ? "ring-2 ring-neutral-900 ring-offset-2" : ""}`}
          >
            {opt.label}
          </button>
        ))}
      </div>
      <div className="relative my-8">
        <div className="absolute inset-0 flex items-center" aria-hidden>
          <div className="w-full border-t border-neutral-200" />
        </div>
        <p className="relative mx-auto w-fit bg-white px-3 text-xs uppercase tracking-widest text-neutral-400">
          Or
        </p>
      </div>
    </section>
  );
}
