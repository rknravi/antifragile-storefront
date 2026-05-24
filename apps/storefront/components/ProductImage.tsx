import Image from "next/image";

type Props = {
  src: string;
  alt: string;
  sizes: string;
  className?: string;
  priority?: boolean;
  /** `fill` = cover/contain inside parent box; `intrinsic` = natural size (cards, search thumbs) */
  layout?: "fill" | "intrinsic";
};

/**
 * Product visuals: optimized `next/image` for same-origin paths; plain `img` for https CDN
 * so `next.config` does not need remotePatterns for every host.
 *
 * `fill` mode wraps in `relative` so absolutely positioned images cannot escape to the viewport.
 */
export function ProductImage({
  src,
  alt,
  sizes,
  className = "",
  priority,
  layout = "fill",
}: Props) {
  const hasObjectFit = /\bobject-(contain|cover|fill|none|scale-down)\b/.test(className);
  const fit = hasObjectFit ? "" : "object-cover";
  const intrinsic = layout === "intrinsic";

  if (src.startsWith("https://")) {
    const img = (
      // SECURITY-REVIEW: `src` comes from validated catalog (https only), not raw user input in the DOM.
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={src}
        alt={alt}
        sizes={sizes}
        loading={priority ? "eager" : "lazy"}
        decoding="async"
        className={
          intrinsic
            ? `max-h-full max-w-full ${fit} ${className}`.trim()
            : `absolute inset-0 h-full w-full ${fit} ${className}`.trim()
        }
      />
    );
    if (intrinsic) return img;
    return <span className="relative block h-full w-full min-h-0 min-w-0 overflow-hidden">{img}</span>;
  }

  if (!src.startsWith("/")) return null;

  if (intrinsic) {
    return (
      <Image
        src={src}
        alt={alt}
        width={800}
        height={1000}
        sizes={sizes}
        priority={priority}
        className={`h-auto max-h-full w-auto max-w-full ${fit} ${className}`.trim()}
      />
    );
  }

  return (
    <span className="relative block h-full w-full min-h-0 min-w-0 overflow-hidden">
      <Image
        src={src}
        alt={alt}
        fill
        sizes={sizes}
        priority={priority}
        className={`${fit} ${className}`.trim()}
      />
    </span>
  );
}
