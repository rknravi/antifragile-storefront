import type { StoreTheme } from "@/lib/theme-paths";
import { raysPath } from "@/lib/theme-paths";

export type ThemeNavPaths = {
  account: string;
  accountRegister: string;
  shop: string;
  cart: string;
  checkout: string;
  contact: string;
  routineBuilder: string;
  orderConfirmation: string;
  about: string;
  blog: string;
  ingredients: string;
  faq: string;
  shippingPolicy: string;
  returns: string;
  privacy: string;
  terms: string;
  cancellation: string;
};

/** Product detail page (e.g. `/products/soft-refresh-gel-cleanser`). */
export function themeProductPath(theme: StoreTheme, slug: string): string {
  const safe = slug.trim();
  return themedPath(theme, `/products/${encodeURIComponent(safe)}`);
}

function themedPath(theme: StoreTheme, path: string): string {
  if (theme === "rays") return raysPath(path);
  if (path === "/") return "/";
  return path.startsWith("/") ? path : `/${path}`;
}

export function themeNavPaths(theme: StoreTheme): ThemeNavPaths {
  return {
    account: themedPath(theme, "/account"),
    accountRegister: themedPath(theme, "/account/register"),
    shop: themedPath(theme, "/shop"),
    cart: themedPath(theme, "/cart"),
    checkout: themedPath(theme, "/checkout"),
    contact: themedPath(theme, "/contact"),
    routineBuilder: themedPath(theme, "/routine-builder"),
    orderConfirmation: themedPath(theme, "/order-confirmation"),
    about: themedPath(theme, "/about"),
    blog: themedPath(theme, "/blog"),
    ingredients: themedPath(theme, "/ingredients"),
    faq: themedPath(theme, "/faq"),
    shippingPolicy: themedPath(theme, "/shipping-policy"),
    returns: themedPath(theme, "/returns"),
    privacy: themedPath(theme, "/privacy"),
    terms: themedPath(theme, "/terms"),
    cancellation: themedPath(theme, "/cancellation"),
  };
}
