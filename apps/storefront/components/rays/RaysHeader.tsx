"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { useCart } from "@/lib/cart-context";
import { raysPath } from "@/lib/theme-paths";
import { bundleShopHref } from "@/lib/site-nav";
import { themeNavPaths } from "@/lib/theme-nav-paths";
import { RaysMegaMenu } from "./RaysMegaMenu";
import { RaysAnnouncementBar } from "./RaysAnnouncementBar";

const shopHref = raysPath("/shop");
const searchHref = raysPath("/search");
const raysNav = themeNavPaths("rays");

const navLinks = [
  { href: bundleShopHref(shopHref), label: "Bundle" },
  { href: raysPath("/blog"), label: "Blog" },
  { href: raysPath("/about"), label: "About" },
];

export function RaysHeader() {
  const pathname = usePathname();
  const { lines, catalog, openCart } = useCart();
  const count = lines.reduce((n, l) => n + l.quantity, 0);

  const [mobileOpen, setMobileOpen] = useState(false);
  const [megaOpen, setMegaOpen] = useState(false);
  const [hidden, setHidden] = useState(false);
  const lastY = useRef(0);
  const megaTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const openMega = useCallback(() => {
    if (megaTimer.current) clearTimeout(megaTimer.current);
    setMegaOpen(true);
  }, []);

  const closeMega = useCallback(() => {
    megaTimer.current = setTimeout(() => setMegaOpen(false), 120);
  }, []);

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      if (y > lastY.current && y > 100) setHidden(true);
      else setHidden(false);
      lastY.current = y;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setMegaOpen(false);
    setMobileOpen(false);
  }, [pathname]);

  const onShopRoute =
    pathname === shopHref || pathname.startsWith(`${shopHref}/`) || pathname.startsWith("/products/");

  const onSearchRoute = pathname === searchHref;

  return (
    <>
      <header
        className={`sticky top-0 z-50 transition-transform duration-300 ease-out ${
          hidden ? "-translate-y-full" : "translate-y-0"
        }`}
      >
        <RaysAnnouncementBar />

        <div className="border-b border-rays-line bg-rays-white/98 backdrop-blur-md">
          <div className="relative mx-auto flex max-w-[1440px] items-center justify-between gap-4 px-4 py-4 md:px-8">
            <button
              type="button"
              className="md:hidden text-xs font-bold uppercase tracking-widest text-rays-accent"
              onClick={() => setMobileOpen((o) => !o)}
              aria-expanded={mobileOpen}
            >
              Menu
            </button>

            <Link
              href={raysPath("/")}
              className="font-rays text-xl font-extrabold uppercase tracking-tight text-rays-accent md:text-2xl"
            >
              ANTIFRAGILE
            </Link>

            <nav className="hidden items-center gap-8 md:flex" aria-label="Primary">
              <div
                className="relative"
                onMouseEnter={openMega}
                onMouseLeave={closeMega}
              >
                <Link
                  href={shopHref}
                  className={`flex items-center gap-1 text-xs font-bold uppercase tracking-[0.15em] ${
                    onShopRoute ? "text-rays-black" : "text-rays-accent hover:opacity-70"
                  }`}
                  aria-expanded={megaOpen}
                  aria-haspopup="true"
                  onFocus={openMega}
                >
                  Shop
                  <span className="text-[10px]" aria-hidden>
                    ▾
                  </span>
                </Link>
                <RaysMegaMenu products={catalog} open={megaOpen} onClose={() => setMegaOpen(false)} />
              </div>
              {navLinks.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`text-xs font-bold uppercase tracking-[0.15em] ${
                    pathname === item.href ? "text-rays-black" : "text-rays-accent hover:opacity-70"
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </nav>

            <div className="flex items-center gap-5 text-rays-accent">
              <Link
                href={searchHref}
                className={`text-xs font-bold uppercase tracking-[0.15em] hover:opacity-70 ${
                  onSearchRoute ? "text-rays-black" : ""
                }`}
              >
                Search
              </Link>
              <Link href={raysNav.account} className="hidden text-xs font-bold uppercase tracking-[0.15em] hover:opacity-70 sm:inline">
                Account
              </Link>
              <button
                type="button"
                onClick={openCart}
                className="text-xs font-bold uppercase tracking-[0.15em] hover:opacity-70"
              >
                Cart{count > 0 ? ` (${count})` : " (0)"}
              </button>
            </div>
          </div>
        </div>

        {mobileOpen && (
          <nav className="border-t border-rays-line bg-rays-white px-4 py-6 md:hidden" aria-label="Mobile">
            <Link
              href={shopHref}
              className="block py-2 font-rays text-2xl uppercase text-rays-accent"
              onClick={() => setMobileOpen(false)}
            >
              Shop
            </Link>
            {navLinks.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="block py-2 font-rays text-2xl uppercase text-rays-accent"
                onClick={() => setMobileOpen(false)}
              >
                {item.label}
              </Link>
            ))}
            <Link
              href={searchHref}
              className="block py-2 font-rays text-2xl uppercase text-rays-accent"
              onClick={() => setMobileOpen(false)}
            >
              Search
            </Link>
            <Link href={raysNav.account} className="block py-2 text-sm font-bold uppercase text-rays-gray" onClick={() => setMobileOpen(false)}>
              Account
            </Link>
          </nav>
        )}
      </header>

    </>
  );
}
