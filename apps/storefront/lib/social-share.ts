/** Share targets opened in a new window (hostname allowlist for SECURITY-REVIEW). */
const ALLOWED_SHARE_HOSTS = new Set([
  "www.facebook.com",
  "facebook.com",
  "twitter.com",
  "x.com",
  "www.linkedin.com",
  "linkedin.com",
  "pinterest.com",
  "www.pinterest.com",
  "wa.me",
  "api.whatsapp.com",
  "t.me",
  "telegram.me",
  "reddit.com",
  "www.reddit.com",
]);

export type SocialPlatform =
  | "facebook"
  | "twitter"
  | "linkedin"
  | "pinterest"
  | "whatsapp"
  | "telegram"
  | "reddit"
  | "email"
  | "instagram"
  | "copy"
  | "native";

export type SharePayload = {
  url: string;
  title: string;
  text?: string;
  imageUrl?: string;
};

export type SocialPlatformMeta = {
  id: SocialPlatform;
  label: string;
  /** Opens external share URL in a popup (not used for copy / native / instagram). */
  external?: boolean;
};

/**
 * Consumer skincare (India-first): high-intent shares only.
 * Removed LinkedIn, X, Pinterest, Telegram, Reddit — low use for product/bundle links.
 */
export const SOCIAL_PLATFORMS: SocialPlatformMeta[] = [
  { id: "whatsapp", label: "WhatsApp", external: true },
  { id: "copy", label: "Copy link" },
  { id: "facebook", label: "Facebook", external: true },
  { id: "instagram", label: "Instagram" },
  { id: "email", label: "Email" },
  { id: "native", label: "More options" },
];

export function buildAbsoluteUrl(path: string): string {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  if (typeof window !== "undefined") {
    return `${window.location.origin}${normalized}`;
  }
  const base = (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/$/, "");
  return `${base}${normalized}`;
}

export function buildAbsoluteAssetUrl(src: string | undefined): string | undefined {
  if (!src) return undefined;
  if (src.startsWith("https://") || src.startsWith("http://")) return src;
  return buildAbsoluteUrl(src.startsWith("/") ? src : `/${src}`);
}

export function getShareUrl(platform: SocialPlatform, payload: SharePayload): string | null {
  const { url, title, text } = payload;
  const description = text?.trim() || title;
  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);
  const encodedText = encodeURIComponent(description);
  const encodedImage = payload.imageUrl ? encodeURIComponent(payload.imageUrl) : "";

  switch (platform) {
    case "facebook":
      return `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`;
    case "twitter":
      return `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`;
    case "linkedin":
      return `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`;
    case "pinterest":
      return `https://pinterest.com/pin/create/button/?url=${encodedUrl}&description=${encodedText}${
        encodedImage ? `&media=${encodedImage}` : ""
      }`;
    case "whatsapp":
      return `https://wa.me/?text=${encodeURIComponent(`${title} — ${url}`)}`;
    case "telegram":
      return `https://t.me/share/url?url=${encodedUrl}&text=${encodedTitle}`;
    case "reddit":
      return `https://reddit.com/submit?url=${encodedUrl}&title=${encodedTitle}`;
    case "email":
      return `mailto:?subject=${encodedTitle}&body=${encodeURIComponent(`${description}\n\n${url}`)}`;
    default:
      return null;
  }
}

export function openShareWindow(url: string): void {
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== "https:" && parsed.protocol !== "http:") return;
    if (parsed.protocol === "https:" && !ALLOWED_SHARE_HOSTS.has(parsed.hostname)) return;
    window.open(parsed.toString(), "_blank", "noopener,noreferrer,width=640,height=520");
  } catch {
    /* invalid URL */
  }
}

export function buildInstagramCaption(payload: SharePayload): string {
  const parts = [payload.title];
  if (payload.text?.trim()) parts.push(payload.text.trim());
  parts.push(payload.url);
  return parts.join("\n\n");
}

export async function copyShareText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

export function canUseNativeShare(): boolean {
  return typeof navigator !== "undefined" && typeof navigator.share === "function";
}

export async function triggerNativeShare(payload: SharePayload): Promise<boolean> {
  if (!canUseNativeShare()) return false;
  try {
    await navigator.share({
      title: payload.title,
      text: payload.text,
      url: payload.url,
    });
    return true;
  } catch {
    return false;
  }
}
