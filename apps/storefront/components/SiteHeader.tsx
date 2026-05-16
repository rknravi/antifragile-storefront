"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCart } from "@/lib/cart-context";

const nav = [
  { href: "/shop", label: "Shop" },
  { href: "/routine-builder", label: "Routine builder" },
  { href: "/blog", label: "Skin Journal" },
  { href: "/ingredients", label: "Ingredients" },
  { href: "/about", label: "About" },
];

export function SiteHeader() {
  const pathname = usePathname();
  const { lines } = useCart();
  const count = lines.reduce((n, l) => n + l.quantity, 0);

  return (
    <header className="sticky top-0 z-40 border-b border-black/5 bg-white/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 md:px-6">
        <Link href="/" className="font-display text-xl tracking-tight text-neutral-900">
          ANTIFRAGILE
        </Link>
        <nav className="hidden items-center gap-6 md:flex" aria-label="Primary">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`text-sm font-medium transition hover:text-neutral-600 ${
                pathname === item.href ? "text-neutral-900" : "text-neutral-500"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-3">
          <Link
            href="/account"
            className="hidden text-sm font-medium text-neutral-600 hover:text-neutral-900 sm:inline"
          >
            Account
          </Link>
          <Link
            href="/cart"
            className="relative rounded-full border border-neutral-200 px-3 py-1.5 text-sm font-semibold text-neutral-900 hover:border-neutral-400"
          >
            Cart
            {count > 0 && (
              <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-neutral-900 px-1 text-[10px] text-white">
                {count}
              </span>
            )}
          </Link>
        </div>
      </div>
      <nav
        className="flex gap-3 overflow-x-auto border-t border-black/5 px-4 py-2 md:hidden"
        aria-label="Mobile primary"
      >
        {nav.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="whitespace-nowrap rounded-full bg-neutral-100 px-3 py-1 text-xs font-medium text-neutral-800"
          >
            {item.label}
          </Link>
        ))}
      </nav>
    </header>
  );
}
