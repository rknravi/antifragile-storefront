"use client";

import { useEffect, useMemo, useState } from "react";
import type { Product } from "@/lib/product-types";
import type { StoreTheme } from "@/lib/theme-paths";
import { productDisplayName } from "@/lib/product-palette";
import { productPrimaryImageSrc } from "@/lib/product-images";
import { themeProductPath } from "@/lib/theme-nav-paths";
import { buildAbsoluteAssetUrl, buildAbsoluteUrl, type SharePayload } from "@/lib/social-share";
import { SocialShareButtons } from "@/components/commerce/SocialShareButtons";

type Props = {
  product: Product;
  theme?: StoreTheme;
  variant?: "rays" | "classic" | "compact";
  accent?: string;
  label?: string;
  className?: string;
};

export function ProductShareBar({
  product,
  theme = "rays",
  variant = "rays",
  accent,
  label = "Share this product",
  className = "",
}: Props) {
  const [url, setUrl] = useState("");

  useEffect(() => {
    const path = themeProductPath(theme, product.slug);
    setUrl(buildAbsoluteUrl(path));
  }, [product.slug, theme]);

  const payload: SharePayload = useMemo(
    () => ({
      url,
      title: productDisplayName(product.name),
      text: product.shortDescription,
      imageUrl: buildAbsoluteAssetUrl(productPrimaryImageSrc(product)),
    }),
    [url, product]
  );

  if (!url) return null;

  return (
    <SocialShareButtons
      payload={payload}
      variant={variant}
      accent={accent}
      label={label}
      className={className}
    />
  );
}
