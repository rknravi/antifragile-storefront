"use client";

import { useState } from "react";
import type { Product } from "@/lib/product-types";
import type { StoreTheme } from "@/lib/theme-paths";
import { themeNavPaths } from "@/lib/theme-nav-paths";
import { IngredientAccordion } from "@/app/products/[slug]/IngredientAccordion";
import { ShippingDeliveryInfo } from "./ShippingDeliveryInfo";

const TABS = ["Description", "How to use", "Ingredients", "Shipping"] as const;

export function ProductTabs({
  product,
  variant = "default",
}: {
  product: Product;
  variant?: "default" | "rays";
}) {
  const [tab, setTab] = useState<(typeof TABS)[number]>("Description");
  const rays = variant === "rays";
  const theme: StoreTheme = rays ? "rays" : "classic";
  const nav = themeNavPaths(theme);

  return (
    <div className={rays ? "mt-10 border-t-2 border-rays-line pt-8" : "mt-10"}>
      <div className={rays ? "flex flex-wrap gap-1 border-b-2 border-rays-black" : "flex flex-wrap gap-1 border-b border-black/10"}>
        {TABS.map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={`px-4 py-2 text-sm font-medium transition ${
              tab === t
                ? rays
                  ? "border-b-2 border-rays-accent font-bold uppercase tracking-wide text-rays-accent"
                  : "border-b-2 border-neutral-900 text-neutral-900"
                : rays
                  ? "text-rays-gray hover:text-rays-black"
                  : "text-neutral-500 hover:text-neutral-800"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      <div className={rays ? "py-6 text-sm text-rays-gray" : "py-6 text-sm text-neutral-700"}>
        {tab === "Description" && (
          <div className="space-y-4">
            <p>{product.longDescription}</p>
            <div>
              <h3 className="font-semibold text-neutral-900">Benefits</h3>
              <ul className="mt-2 list-disc pl-5">
                {product.benefits.map((b) => (
                  <li key={b}>{b}</li>
                ))}
              </ul>
            </div>
            <p>
              <strong>Texture:</strong> {product.texture}
            </p>
            <p>
              <strong>How it works:</strong> {product.howItWorks}
            </p>
          </div>
        )}
        {tab === "How to use" && (
          <div className="space-y-4">
            <p className="text-xs uppercase tracking-wider text-neutral-500">Usage information</p>
            <p>
              <strong>When:</strong> {product.usageTime.join(", ")}
            </p>
            <p>
              <strong>Skin types:</strong> {product.skinTypes.join(", ")}
            </p>
            <ol className="list-decimal space-y-2 pl-5">
              {product.howToUse.map((s) => (
                <li key={s}>{s}</li>
              ))}
            </ol>
            <ul className="list-disc space-y-1 pl-5 text-amber-900">
              {product.warnings.map((w) => (
                <li key={w}>{w}</li>
              ))}
            </ul>
          </div>
        )}
        {tab === "Ingredients" && (
          <IngredientAccordion ingredients={product.ingredients} glossaryHref={nav.ingredients} />
        )}
        {tab === "Shipping" && <ShippingDeliveryInfo variant={variant} />}
      </div>
    </div>
  );
}
