import Image from "next/image";

type Props = {
  src: string;
  alt: string;
  sizes: string;
  className?: string;
  priority?: boolean;
};

/**
 * Product visuals: optimized `next/image` for same-origin paths; plain `img` for https CDN
 * so `next.config` does not need remotePatterns for every host.
 */
export function ProductImage({ src, alt, sizes, className = "", priority }: Props) {
  if (src.startsWith("https://")) {
    return (
      // SECURITY-REVIEW: `src` comes from validated catalog (https only), not raw user input in the DOM.
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={src}
        alt={alt}
        sizes={sizes}
        loading={priority ? "eager" : "lazy"}
        decoding="async"
        className={`absolute inset-0 h-full w-full object-cover ${className}`.trim()}
      />
    );
  }

  if (!src.startsWith("/")) return null;

  return (
    <Image
      src={src}
      alt={alt}
      fill
      sizes={sizes}
      priority={priority}
      className={`object-cover ${className}`.trim()}
    />
  );
}
