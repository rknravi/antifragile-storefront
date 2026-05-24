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
import { computeCartBundles, type AppliedCartBundle } from "./bundle-cart";
import { computeOrderTotals, normalizeCouponCode } from "./pricing";
import { getBundleProducts, type RoutineBundleId } from "./routine-bundles";

export type CartLine = {
  product: Product;
  quantity: number;
};

type CartExtras = {
  cartNote: string;
  giftWrap: boolean;
  coupon: string | null;
};

type CartContextValue = {
  catalog: Product[];
  getProduct: (slug: string) => Product | undefined;
  lines: CartLine[];
  addItem: (product: Product, qty?: number, opts?: { openDrawer?: boolean }) => void;
  addBundle: (bundleId: RoutineBundleId) => void;
  setQuantity: (slug: string, quantity: number) => void;
  removeLine: (slug: string) => void;
  clear: () => void;
  coupon: string | null;
  setCoupon: (code: string | null) => void;
  cartNote: string;
  setCartNote: (note: string) => void;
  giftWrap: boolean;
  setGiftWrap: (on: boolean) => void;
  giftWrapFee: number;
  cartOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  subtotal: number;
  bundleDiscount: number;
  couponDiscount: number;
  appliedBundles: AppliedCartBundle[];
  discount: number;
  estimatedTax: number;
  shippingEstimate: number;
  total: number;
};

const CartContext = createContext<CartContextValue | null>(null);

const STORAGE_KEY = "af_cart_v1";
const EXTRAS_KEY = "af_cart_extras_v1";
const GIFT_WRAP_FEE = 49;

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

function loadExtras(): CartExtras {
  if (typeof window === "undefined") return { cartNote: "", giftWrap: false, coupon: null };
  try {
    const raw = localStorage.getItem(EXTRAS_KEY);
    if (!raw) return { cartNote: "", giftWrap: false, coupon: null };
    const parsed = JSON.parse(raw) as CartExtras;
    return {
      cartNote: typeof parsed.cartNote === "string" ? parsed.cartNote.slice(0, 500) : "",
      giftWrap: Boolean(parsed.giftWrap),
      coupon: normalizeCouponCode(parsed.coupon),
    };
  } catch {
    return { cartNote: "", giftWrap: false, coupon: null };
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
  const [cartNote, setCartNote] = useState("");
  const [giftWrap, setGiftWrap] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setLines(loadInitial(initialCatalog));
    const extras = loadExtras();
    setCartNote(extras.cartNote);
    setGiftWrap(extras.giftWrap);
    setCoupon(extras.coupon);
    setHydrated(true);
  }, [initialCatalog]);

  useEffect(() => {
    if (!hydrated) return;
    const payload = lines.map((l) => ({ slug: l.product.slug, quantity: l.quantity }));
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  }, [lines, hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(
      EXTRAS_KEY,
      JSON.stringify({ cartNote, giftWrap, coupon: normalizeCouponCode(coupon) })
    );
  }, [cartNote, giftWrap, coupon, hydrated]);

  const getProduct = useCallback(
    (slug: string) => initialCatalog.find((p) => p.slug === slug && p.status === "active"),
    [initialCatalog]
  );

  const addItem = useCallback((product: Product, qty = 1, opts?: { openDrawer?: boolean }) => {
    setLines((prev) => {
      const i = prev.findIndex((l) => l.product.slug === product.slug);
      if (i === -1) return [...prev, { product, quantity: qty }];
      const next = [...prev];
      next[i] = { ...next[i], quantity: next[i].quantity + qty };
      return next;
    });
    if (opts?.openDrawer !== false) setCartOpen(true);
  }, []);

  const addBundle = useCallback(
    (bundleId: RoutineBundleId) => {
      const items = getBundleProducts(initialCatalog, bundleId);
      if (!items.length) return;
      setLines((prev) => {
        const next = [...prev];
        for (const product of items) {
          const i = next.findIndex((l) => l.product.slug === product.slug);
          if (i === -1) next.push({ product, quantity: 1 });
          else next[i] = { ...next[i], quantity: next[i].quantity + 1 };
        }
        return next;
      });
      setCartOpen(true);
    },
    [initialCatalog]
  );

  const setQuantity = useCallback((slug: string, quantity: number) => {
    setLines((prev) => {
      if (quantity <= 0) return prev.filter((l) => l.product.slug !== slug);
      return prev.map((l) => (l.product.slug === slug ? { ...l, quantity } : l));
    });
  }, []);

  const removeLine = useCallback((slug: string) => {
    setLines((prev) => prev.filter((l) => l.product.slug !== slug));
  }, []);

  const clear = useCallback(() => {
    setLines([]);
    setCoupon(null);
  }, []);

  const setCouponValidated = useCallback((code: string | null) => {
    setCoupon(normalizeCouponCode(code));
  }, []);

  const openCart = useCallback(() => setCartOpen(true), []);
  const closeCart = useCallback(() => setCartOpen(false), []);

  const priced = useMemo(
    () => lines.map((l) => ({ salePrice: l.product.salePrice, quantity: l.quantity })),
    [lines]
  );

  const bundleResult = useMemo(
    () =>
      computeCartBundles(
        initialCatalog,
        lines.map((l) => ({ slug: l.product.slug, quantity: l.quantity }))
      ),
    [initialCatalog, lines]
  );

  const giftWrapFee = giftWrap ? GIFT_WRAP_FEE : 0;
  const baseTotals = useMemo(
    () => computeOrderTotals(priced, coupon, bundleResult.totalSavings),
    [priced, coupon, bundleResult.totalSavings]
  );
  const total = baseTotals.total + giftWrapFee;

  const value: CartContextValue = {
    catalog: initialCatalog,
    getProduct,
    lines,
    addItem,
    addBundle,
    setQuantity,
    removeLine,
    clear,
    coupon,
    setCoupon: setCouponValidated,
    cartNote,
    setCartNote,
    giftWrap,
    setGiftWrap,
    giftWrapFee,
    cartOpen,
    openCart,
    closeCart,
    subtotal: baseTotals.subtotal,
    bundleDiscount: baseTotals.bundleDiscount,
    couponDiscount: baseTotals.couponDiscount,
    appliedBundles: bundleResult.applied,
    discount: baseTotals.discount,
    estimatedTax: baseTotals.estimatedTax,
    shippingEstimate: baseTotals.shippingEstimate,
    total,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
