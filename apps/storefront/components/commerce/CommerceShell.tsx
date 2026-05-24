"use client";

import { useEffect, useState } from "react";
import { CartDrawer } from "./CartDrawer";
import { StickyCartBar } from "./StickyCartBar";
import { SearchDialog } from "./SearchDialog";
import { PromoPopup } from "./PromoPopup";
import { AgeVerifier } from "./AgeVerifier";

export function openSearchDialog() {
  if (typeof window === "undefined") return;
  const path = window.location.pathname;
  if (!path.startsWith("/admin")) {
    const params = new URLSearchParams(window.location.search);
    const q = params.get("q");
    window.location.assign(q ? `/search?q=${encodeURIComponent(q)}` : "/search");
    return;
  }
  window.dispatchEvent(new Event("af-open-search"));
}

/** Global commerce overlays (cart drawer, search, promos). */
export function CommerceShell() {
  const [searchOpen, setSearchOpen] = useState(false);

  useEffect(() => {
    const handler = () => setSearchOpen(true);
    window.addEventListener("af-open-search", handler);
    return () => window.removeEventListener("af-open-search", handler);
  }, []);

  return (
    <>
      <CartDrawer />
      <StickyCartBar />
      <SearchDialog open={searchOpen} onClose={() => setSearchOpen(false)} />
      <PromoPopup />
      <AgeVerifier />
    </>
  );
}
