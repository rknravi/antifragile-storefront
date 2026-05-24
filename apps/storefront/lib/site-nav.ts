/** Primary top-bar links (all themes). */
export type NavItem = { href: string; label: string };

export const secondaryNav: NavItem[] = [
  { href: "/routine-builder", label: "Routine builder" },
  { href: "/blog", label: "Skin Journal" },
  { href: "/ingredients", label: "Ingredients" },
  { href: "/contact", label: "Contact" },
];

export function primaryNav(paths: { shop: string; bundle: string; about: string }): NavItem[] {
  return [
    { href: paths.shop, label: "Shop" },
    { href: paths.bundle, label: "Bundle" },
    { href: paths.about, label: "About" },
  ];
}

/** Shop URL filtered to bundle-badge products. */
export function bundleShopHref(themeShop: string): string {
  const sep = themeShop.includes("?") ? "&" : "?";
  return `${themeShop}${sep}bundle=1`;
}
