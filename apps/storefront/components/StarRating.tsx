/** Accessible star display for ratings 0–5 (supports decimals e.g. 4.8). */
export function StarRating({
  value,
  max = 5,
  size = "md",
  accent = "#1E4A6E",
}: {
  value: number;
  max?: number;
  size?: "sm" | "md" | "lg";
  accent?: string;
}) {
  const clamped = Math.min(max, Math.max(0, value));
  const px = size === "sm" ? 14 : size === "lg" ? 20 : 16;

  return (
    <span
      className="inline-flex items-center gap-px"
      role="img"
      aria-label={`${clamped.toFixed(1)} out of ${max} stars`}
    >
      {Array.from({ length: max }, (_, i) => {
        const fill = Math.min(1, Math.max(0, clamped - i));
        return (
          <span key={i} className="relative inline-block" style={{ width: px, height: px }}>
            <svg viewBox="0 0 24 24" className="absolute inset-0 h-full w-full text-neutral-200" aria-hidden>
              <path
                fill="currentColor"
                d="M12 2l3.09 6.26L22 9.27l-5 4.87L18.18 22 12 18.56 5.82 22 7 14.14l-5-4.87 6.91-1.01L12 2z"
              />
            </svg>
            <span
              className="absolute inset-0 overflow-hidden"
              style={{ width: `${fill * 100}%` }}
              aria-hidden
            >
              <svg viewBox="0 0 24 24" className="h-full w-full" style={{ color: accent, minWidth: px }}>
                <path
                  fill="currentColor"
                  d="M12 2l3.09 6.26L22 9.27l-5 4.87L18.18 22 12 18.56 5.82 22 7 14.14l-5-4.87 6.91-1.01L12 2z"
                />
              </svg>
            </span>
          </span>
        );
      })}
    </span>
  );
}
