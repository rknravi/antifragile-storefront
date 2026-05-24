import Link from "next/link";
import type { StoreTheme } from "@/lib/theme-paths";
import { themeNavPaths } from "@/lib/theme-nav-paths";

export function ShippingDeliveryInfo({
  variant = "default",
}: {
  variant?: "default" | "rays";
}) {
  const theme: StoreTheme = variant === "rays" ? "rays" : "classic";
  const nav = themeNavPaths(theme);
  const rays = variant === "rays";

  return (
    <div className={rays ? "space-y-4 text-sm text-rays-gray" : "space-y-4"}>
      <p>
        <strong>India-wide delivery:</strong> 3–7 business days metro, 5–10 days elsewhere (demo timelines).
      </p>
      <p>
        <strong>Free shipping:</strong> Orders above ₹999 qualify for complimentary standard shipping.
      </p>
      <p>
        <strong>Returns:</strong> Unopened products within 7 days — see our{" "}
        <Link href={nav.returns} className={rays ? "font-semibold text-rays-accent underline" : "underline"}>
          returns policy
        </Link>
        .
      </p>
      <p className={rays ? "text-rays-gray" : "text-neutral-500"}>
        Tracking details are emailed after dispatch. COD available when enabled at checkout.
      </p>
    </div>
  );
}
