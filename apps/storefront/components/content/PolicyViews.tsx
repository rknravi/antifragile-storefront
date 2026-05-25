import type { StoreTheme } from "@/lib/theme-paths";
import { themeNavPaths } from "@/lib/theme-nav-paths";
import { SITE_FAQS } from "@/lib/site-faqs";
import { ThemedContentPage, ThemedFaqList, ThemedInlineLink } from "./ThemedContentPage";

export function FaqPageView({ variant = "classic" }: { variant?: StoreTheme }) {
  const nav = themeNavPaths(variant);
  return (
    <ThemedContentPage variant={variant} title="FAQ">
      <p>
        Ordering, shipping, and product care. For product-specific usage, open any product page or visit{" "}
        <ThemedInlineLink href={nav.shop}>shop</ThemedInlineLink>.
      </p>
      <ThemedFaqList variant={variant} items={[...SITE_FAQS]} />
    </ThemedContentPage>
  );
}

export function ContactPageView({ variant = "classic" }: { variant?: StoreTheme }) {
  return (
    <ThemedContentPage variant={variant} title="Contact us">
      <p>Replace with production support email, phone, and ticketing when operations go live.</p>
      <dl className="mt-8 space-y-4">
        <div>
          <dt className={variant === "rays" ? "font-bold uppercase tracking-wider text-rays-black" : "font-semibold text-neutral-900"}>
            Email
          </dt>
          <dd className="mt-1">
            <a
              className={variant === "rays" ? "text-rays-accent underline" : "text-brand-fresh underline"}
              href="mailto:hello@antifragileskin.com"
            >
              hello@antifragileskin.com
            </a>{" "}
            (placeholder)
          </dd>
        </div>
        <div>
          <dt className={variant === "rays" ? "font-bold uppercase tracking-wider text-rays-black" : "font-semibold text-neutral-900"}>
            WhatsApp
          </dt>
          <dd className="mt-1">Set NEXT_PUBLIC_WHATSAPP_NUMBER to enable the floating button.</dd>
        </div>
      </dl>
    </ThemedContentPage>
  );
}

const INGREDIENT_ENTRIES = [
  { term: "Humectants", def: "Ingredients that attract water into the upper layers of skin to support hydration." },
  { term: "Emollients", def: "Skin-softening ingredients that help reduce roughness and support comfort." },
  { term: "Surfactants", def: "Cleansing agents that lift oil and debris; mild variants prioritize barrier kindness." },
  { term: "Ceramide-supporting esters", def: "Lipid-related ingredients formulated to reinforce the moisture barrier without a heavy feel." },
  { term: "Renewal-focused actives", def: "Evening-oriented ingredients chosen for texture and tone support; introduce gradually and use daytime SPF." },
  { term: "Buffered vehicle", def: "The serum base that helps distribute actives while moderating irritation risk for sensitive users." },
];

export function IngredientsPageView({ variant = "classic" }: { variant?: StoreTheme }) {
  const rays = variant === "rays";
  const nav = themeNavPaths(variant);
  return (
    <ThemedContentPage variant={variant} title="Ingredient glossary">
      <p>
        Plain-language anchors for our formulas. Full INCI lists live on each product page; deeper context in the{" "}
        <ThemedInlineLink href={nav.blog}>Skin Journal</ThemedInlineLink>.
      </p>
      <dl className="mt-10 space-y-4">
        {INGREDIENT_ENTRIES.map((e) => (
          <div
            key={e.term}
            className={
              rays
                ? "border-2 border-rays-line bg-rays-surface p-5"
                : "rounded-2xl border border-black/5 bg-white p-5 shadow-sm"
            }
          >
            <dt className={rays ? "font-rays font-bold uppercase text-rays-accent" : "font-semibold text-neutral-900"}>
              {e.term}
            </dt>
            <dd className={rays ? "mt-2 text-sm text-rays-gray" : "mt-2 text-sm text-neutral-600"}>{e.def}</dd>
          </div>
        ))}
      </dl>
    </ThemedContentPage>
  );
}
