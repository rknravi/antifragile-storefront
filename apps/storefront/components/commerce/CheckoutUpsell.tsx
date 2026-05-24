"use client";

import { CartUpsellSuggestions } from "@/components/commerce/CartUpsellSuggestions";

type Props = {
  theme: "rays" | "classic";
  title?: string;
};

export function CheckoutUpsell({ theme, title }: Props) {
  return (
    <CartUpsellSuggestions
      theme={theme}
      layout="checkout"
      title={title}
      hideWhenQualified={false}
    />
  );
}
