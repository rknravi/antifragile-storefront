import Link from "next/link";
import { secondaryNav } from "@/lib/site-nav";

const policies = [
  { href: "/shipping-policy", label: "Shipping" },
  { href: "/returns", label: "Returns & refunds" },
  { href: "/cancellation", label: "Cancellation" },
  { href: "/privacy", label: "Privacy" },
  { href: "/terms", label: "Terms" },
];

export function SiteFooter() {
  return (
    <footer className="border-t border-black/5 bg-brand-sand">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 md:grid-cols-3 md:px-6">
        <div>
          <p className="font-display text-xl text-neutral-900">ANTIFRAGILE</p>
          <p className="mt-2 text-sm text-neutral-600">
            A modern skincare routine built for daily resilience. Cleanse. Restore. Strengthen.
          </p>
          <p className="mt-4 text-xs text-neutral-500">RKN Overseas</p>
        </div>
        <div>
          <p className="text-sm font-semibold text-neutral-900">More</p>
          <ul className="mt-3 space-y-2 text-sm text-neutral-600">
            {secondaryNav.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="hover:text-neutral-900">
                  {item.label}
                </Link>
              </li>
            ))}
            <li>
              <Link href="/faq" className="hover:text-neutral-900">
                FAQ
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <p className="text-sm font-semibold text-neutral-900">Policies</p>
          <ul className="mt-3 flex flex-wrap gap-x-4 gap-y-2 text-sm text-neutral-600">
            {policies.map((p) => (
              <li key={p.href}>
                <Link href={p.href} className="hover:text-neutral-900">
                  {p.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="border-t border-black/5 py-4 text-center text-xs text-neutral-500">
        © {new Date().getFullYear()} RKN Overseas. All rights reserved.
      </div>
    </footer>
  );
}
