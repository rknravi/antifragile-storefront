import Link from "next/link";
import { themeNavPaths } from "@/lib/theme-nav-paths";
import type { StoreTheme } from "@/lib/theme-paths";

/** FAQ & help links in the shop / product discovery area (not top nav). */
export function ShopProductHelp({ variant = "classic" }: { variant?: StoreTheme }) {
  const nav = themeNavPaths(variant);
  const box =
    variant === "rays"
      ? "border-2 border-rays-black bg-rays-surface p-6"
      : "rounded-2xl border border-black/5 bg-brand-mist/40 p-6";

  return (
    <section className={`mt-16 ${box}`}>
      <h2 className={variant === "rays" ? "font-rays text-xl font-bold uppercase" : "font-display text-xl text-neutral-900"}>
        Product help
      </h2>
      <p className={`mt-2 max-w-2xl text-sm ${variant === "rays" ? "text-rays-gray" : "text-neutral-600"}`}>
        Every product page includes usage FAQ, ingredients, and pairing tips. For general ordering and shipping
        questions, see the full FAQ.
      </p>
      <div className="mt-4 flex flex-wrap gap-4 text-sm font-medium">
        <Link
          href={nav.faq}
          className={variant === "rays" ? "font-semibold text-rays-accent underline hover:no-underline" : "text-brand-fresh underline hover:no-underline"}
        >
          View all FAQs →
        </Link>
        <Link
          href={nav.ingredients}
          className={variant === "rays" ? "text-rays-black underline hover:text-rays-accent" : "text-neutral-700 underline hover:no-underline"}
        >
          Ingredient glossary
        </Link>
        <Link
          href={nav.routineBuilder}
          className={variant === "rays" ? "text-rays-black underline hover:text-rays-accent" : "text-neutral-700 underline hover:no-underline"}
        >
          Build your routine
        </Link>
      </div>
    </section>
  );
}
