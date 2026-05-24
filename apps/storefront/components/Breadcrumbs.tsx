import Link from "next/link";

export type Crumb = { label: string; href?: string };

export function Breadcrumbs({
  items,
  variant = "classic",
}: {
  items: Crumb[];
  variant?: "classic" | "rays";
}) {
  const linkClass =
    variant === "rays"
      ? "text-rays-gray hover:text-rays-accent"
      : "text-neutral-500 hover:text-neutral-900";

  const currentClass = variant === "rays" ? "text-rays-black font-medium" : "text-neutral-900";

  return (
    <nav aria-label="Breadcrumb" className="text-xs uppercase tracking-[0.2em]">
      <ol className="flex flex-wrap items-center gap-2">
        {items.map((item, i) => (
          <li key={`${item.label}-${i}`} className="flex items-center gap-2">
            {i > 0 && <span className="text-neutral-300" aria-hidden>/</span>}
            {item.href && i < items.length - 1 ? (
              <Link href={item.href} className={linkClass}>
                {item.label}
              </Link>
            ) : (
              <span className={currentClass} aria-current={i === items.length - 1 ? "page" : undefined}>
                {item.label}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
