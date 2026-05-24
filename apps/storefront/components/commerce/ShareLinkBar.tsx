"use client";

import { useEffect, useMemo, useState } from "react";
import { buildAbsoluteUrl, type SharePayload } from "@/lib/social-share";
import { SocialShareButtons } from "@/components/commerce/SocialShareButtons";

type Props = {
  path: string;
  title: string;
  text?: string;
  variant?: "rays" | "classic" | "compact";
  accent?: string;
  label?: string;
  className?: string;
};

/** Share any site path (shop, blog, bundles, order confirmation). */
export function ShareLinkBar({
  path,
  title,
  text,
  variant = "rays",
  accent,
  label = "Share",
  className = "",
}: Props) {
  const [url, setUrl] = useState("");

  useEffect(() => {
    setUrl(buildAbsoluteUrl(path));
  }, [path]);

  const payload: SharePayload = useMemo(
    () => ({ url, title, text }),
    [url, title, text]
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
