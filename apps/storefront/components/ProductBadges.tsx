import type { ProductBadge } from "@/lib/products";

export function ProductBadges({
  badges = [],
  accent,
}: {
  badges?: ProductBadge[];
  /** Category primary — tints badge border for cohesion with product art */
  accent?: string;
}) {
  if (!badges.length) return null;

  return (
    <div className="flex flex-wrap gap-1.5">
      {badges.map((badge) => (
        <span
          key={badge}
          className="rounded-full bg-white/95 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-neutral-800 shadow-sm backdrop-blur"
          style={accent ? { boxShadow: `inset 0 0 0 1px ${accent}33` } : undefined}
        >
          {badge}
        </span>
      ))}
    </div>
  );
}