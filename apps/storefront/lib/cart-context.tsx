"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { Product } from "./product-types";
import { computeOrderTotals } from "./pricing";

export type CartLine = {
  product: Product;
  quantity: number;
};

type CartContextValue = {
  lines: CartLine[];
  addItem: (product: Product, qty?: number) => void;
  setQuantity: (slug: string, quantity: number) => void;
  removeLine: (slug: string) => void;
  clear: () => void;
  coupon: string | null;
  setCoupon: (code: string | null) => void;
  subtotal: number;
  discount: number;
  estimatedTax: number;
  shippingEstimate: number;
  total: number;
};

const CartContext = createContext<CartContextValue | null>(null);

const STORAGE_KEY = "af_cart_v1";

function loadInitial(catalog: Product[]): CartLine[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as { slug: string; quantity: number }[];
    const lines: CartLine[] = [];
    for (const row of parsed) {
      const p = catalog.find((x) => x.slug === row.slug);
      if (p) lines.push({ product: p, quantity: row.quantity });
    }
    return lines;
  } catch {
    return [];
  }
}

export function CartProvider({
  children,
  initialCatalog,
}: {
  children: ReactNode;
  initialCatalog: Product[];
}) {
  const [lines, setLines] = useState<CartLine[]>([]);
  const [coupon, setCoupon] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setLines(loadInitial(initialCatalog));
    setHydrated(true);
  }, [initialCatalog]);

  useEffect(() => {
    if (!hydrated) return;
    const payload = lines.map((l) => ({ slug: l.product.slug, quantity: l.quantity }));
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  }, [lines, hydrated]);

  const addItem = useCallback((product: Product, qty = 1) => {
    setLines((prev) => {
      const i = prev.findIndex((l) => l.product.slug === product.slug);
      if (i === -1) return [...prev, { product, quantity: qty }];
      const next = [...prev];
      next[i] = { ...next[i], quantity: next[i].quantity + qty };
      return next;
    });
  }, []);

  const setQuantity = useCallback((slug: string, quantity: number) => {
    setLines((prev) => {
      if (quantity <= 0) return prev.filter((l) => l.product.slug !== slug);
      return prev.map((l) => (l.product.slug === slug ? { ...l, quantity } : l));
    });
  }, []);

  const removeLine = useCallback((slug: string) => {
    setLines((prev) => prev.filter((l) => l.product.slug !== slug));
  }, []);

  const clear = useCallback(() => setLines([]), []);

  const priced = useMemo(
    () => lines.map((l) => ({ salePrice: l.product.salePrice, quantity: l.quantity })),
    [lines]
  );
  const { subtotal, discount, estimatedTax, shippingEstimate, total } = useMemo(
    () => computeOrderTotals(priced, coupon),
    [priced, coupon]
  );

  const value: CartContextValue = {
    lines,
    addItem,
    setQuantity,
    removeLine,
    clear,
    coupon,
    setCoupon,
    subtotal,
    discount,
    estimatedTax,
    shippingEstimate,
    total,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
