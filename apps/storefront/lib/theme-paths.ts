/** Customer storefront uses the Rays layout at root paths (no `/rays` prefix). */
export const RAYS_PREFIX = "";

/** Legacy prefix — middleware redirects to root. */
export const LEGACY_RAYS_PREFIX = "/rays";

export type StoreTheme = "classic" | "rays";

function isAdminPath(pathname: string): boolean {
  return pathname === "/admin" || pathname.startsWith("/admin/");
}

/** Storefront routes use Rays styling; admin stays neutral. */
export function getThemeFromPath(pathname: string): StoreTheme {
  if (isAdminPath(pathname)) return "classic";
  return "rays";
}

export function isAlternateThemePath(pathname: string): boolean {
  return !isAdminPath(pathname);
}

export function isRaysPath(_pathname: string): boolean {
  return true;
}

/** Theme-aware path (Rays is root — no prefix). */
export function raysPath(path: string): string {
  if (!path.startsWith("/")) return `/${path}`;
  return path === "" ? "/" : path;
}

export function themeShopPath(_pathname: string): string {
  return "/shop";
}

export function classicPath(path: string): string {
  if (path.startsWith(LEGACY_RAYS_PREFIX)) {
    return path.slice(LEGACY_RAYS_PREFIX.length) || "/";
  }
  return path;
}
