import Link from "next/link";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import type { StoreTheme } from "@/lib/theme-paths";
import { raysPath } from "@/lib/theme-paths";
import { themeNavPaths } from "@/lib/theme-nav-paths";

export function ThemedContentPage({
  variant = "classic",
  title,
  breadcrumbLabel,
  children,
}: {
  variant?: StoreTheme;
  title: string;
  breadcrumbLabel?: string;
  children: React.ReactNode;
}) {
  const rays = variant === "rays";
  const nav = themeNavPaths(variant);

  return (
    <article
      className={
        rays
          ? "mx-auto max-w-3xl bg-rays-white px-4 py-10 md:px-8 md:py-14"
          : "mx-auto max-w-3xl px-4 py-16 md:px-6"
      }
    >
      {rays && (
        <Breadcrumbs
          variant="rays"
          items={[
            { label: "Home", href: raysPath("/") },
            { label: "Shop", href: nav.shop },
            { label: breadcrumbLabel ?? title },
          ]}
        />
      )}
      <h1
        className={
          rays
            ? "mt-8 font-rays text-4xl font-extrabold uppercase text-rays-accent md:text-5xl"
            : "font-display text-4xl text-neutral-900"
        }
      >
        {title}
      </h1>
      <div
        className={
          rays
            ? "prose-rays mt-6 space-y-4 text-sm leading-relaxed text-rays-gray"
            : "mt-6 space-y-4 leading-relaxed text-neutral-700"
        }
      >
        {children}
      </div>
    </article>
  );
}

export function ThemedFaqList({
  variant = "classic",
  items,
}: {
  variant?: StoreTheme;
  items: { q: string; a: string }[];
}) {
  const rays = variant === "rays";

  return (
    <div
      className={
        rays
          ? "mt-8 divide-y-2 divide-rays-line border-2 border-rays-black"
          : "mt-10 divide-y divide-neutral-200 rounded-2xl border border-neutral-200"
      }
    >
      {items.map((f) => (
        <details key={f.q} className="group px-4 py-4">
          <summary
            className={
              rays
                ? "cursor-pointer list-none font-rays text-sm font-bold uppercase tracking-wide text-rays-black marker:content-none [&::-webkit-details-marker]:hidden"
                : "cursor-pointer list-none font-semibold text-neutral-900 marker:content-none [&::-webkit-details-marker]:hidden"
            }
          >
            {f.q}
          </summary>
          <p className={rays ? "mt-2 text-sm text-rays-gray" : "mt-2 text-sm text-neutral-600"}>{f.a}</p>
        </details>
      ))}
    </div>
  );
}

export function ThemedInlineLink({
  variant = "classic",
  href,
  children,
}: {
  variant?: StoreTheme;
  href: string;
  children: React.ReactNode;
}) {
  const rays = variant === "rays";
  return (
    <Link
      href={href}
      className={
        rays
          ? "font-semibold text-rays-accent underline hover:no-underline"
          : "font-medium text-brand-fresh underline hover:no-underline"
      }
    >
      {children}
    </Link>
  );
}
