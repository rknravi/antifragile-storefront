import Link from "next/link";

const links = [
  { href: "/admin/products", label: "Catalog", key: "catalog" },
  { href: "/admin/policies", label: "Policies", key: "policies" },
  { href: "/admin/blog", label: "Blog", key: "blog" },
  { href: "/admin/orders", label: "Orders", key: "orders" },
  { href: "/admin/reports", label: "Reports", key: "reports" },
] as const;

export type AdminNavKey = (typeof links)[number]["key"];

export function AdminPortalNav({ active }: { active: AdminNavKey }) {
  return (
    <nav className="flex flex-wrap gap-2" aria-label="Admin portal">
      {links.map((link) => {
        const key = link.key;
        const isActive = key === active;
        return (
          <Link
            key={link.href}
            href={link.href}
            className={`rounded-full px-4 py-2 text-sm font-semibold shadow-sm transition ${
              isActive
                ? "bg-neutral-900 text-white"
                : "border border-neutral-200 bg-white text-neutral-800 hover:bg-neutral-50"
            }`}
          >
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
