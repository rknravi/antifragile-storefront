import type { ProductBadge } from "@/lib/products";

export function ProductBadges({ badges = [] }: { badges?: ProductBadge[] }) {
  if (!badges.length) return null;

  return (
    <div className="flex flex-wrap gap-1.5">
      {badges.map((badge) => (
        <span
          key={badge}
          className="rounded-full bg-white/90 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-neutral-800 shadow-sm backdrop-blur"
        >
          {badge}
        </span>
      ))}
    </div>
  );
}