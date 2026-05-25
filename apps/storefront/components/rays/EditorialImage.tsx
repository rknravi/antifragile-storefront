type Props = {
  src: string;
  alt: string;
  /** Tailwind aspect ratio utility, e.g. aspect-[16/10] */
  aspect?: string;
  className?: string;
  priority?: boolean;
  sizes?: string;
};

/**
 * Marketing / hero stills — object-contain so labels and packs are never cropped.
 */
export function EditorialImage({
  src,
  alt,
  aspect = "aspect-[16/10]",
  className = "",
  priority = false,
}: Props) {
  return (
    <div
      className={`relative overflow-hidden rounded-2xl border border-rays-line/80 bg-gradient-to-b from-rays-cream to-white ${aspect} ${className}`}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={alt}
        loading={priority ? "eager" : "lazy"}
        decoding="async"
        className="absolute inset-0 m-auto h-full w-full max-h-full max-w-full object-contain object-center p-5 md:p-8"
        draggable={false}
      />
    </div>
  );
}
