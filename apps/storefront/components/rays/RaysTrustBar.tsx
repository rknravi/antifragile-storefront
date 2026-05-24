const items = ["Cruelty-free", "India shipping", "Secure checkout", "Ingredient transparency"];

export function RaysTrustBar() {
  return (
    <div className="overflow-hidden border-y-2 border-rays-black bg-rays-accent py-3">
      <div className="rays-marquee flex whitespace-nowrap">
        {[...items, ...items].map((label, i) => (
          <span key={`${label}-${i}`} className="mx-8 text-xs font-bold uppercase tracking-[0.35em] text-rays-white">
            {label} ·
          </span>
        ))}
      </div>
    </div>
  );
}
