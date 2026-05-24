import Link from "next/link";
import { themeNavPaths } from "@/lib/theme-nav-paths";

export function RaysFooter() {
  const nav = themeNavPaths("rays");

  const moreLinks = [
    { href: nav.routineBuilder, label: "Routine builder" },
    { href: nav.blog, label: "Skin Journal" },
    { href: nav.ingredients, label: "Ingredients" },
    { href: nav.contact, label: "Contact" },
    { href: nav.faq, label: "FAQ (shop & products)" },
  ];

  const policyLinks = [
    { href: nav.shippingPolicy, label: "Shipping" },
    { href: nav.returns, label: "Returns" },
    { href: nav.privacy, label: "Privacy" },
    { href: nav.terms, label: "Terms" },
    { href: nav.cancellation, label: "Cancellation" },
  ];

  return (
    <footer className="mt-24 border-t-2 border-rays-black bg-rays-black text-rays-white">
      <div className="mx-auto grid max-w-[1440px] gap-12 px-4 py-16 md:grid-cols-4 md:px-8">
        <div className="md:col-span-2">
          <p className="font-rays text-3xl font-extrabold uppercase">ANTIFRAGILE</p>
          <p className="mt-4 max-w-md text-sm text-rays-line">
            Cleanse. Restore. Strengthen. Premium textures, transparent ingredients, checkout built for India.
          </p>
        </div>
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-rays-accent">More</p>
          <ul className="mt-4 space-y-2 text-sm text-rays-line">
            {moreLinks.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="hover:text-white">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-rays-accent">Policies</p>
          <ul className="mt-4 space-y-2 text-sm text-rays-line">
            {policyLinks.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="hover:text-white">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <p className="border-t border-white/10 py-4 text-center text-[10px] uppercase tracking-widest text-rays-gray">
        © {new Date().getFullYear()} RKN Overseas · ANTIFRAGILE
      </p>
    </footer>
  );
}
