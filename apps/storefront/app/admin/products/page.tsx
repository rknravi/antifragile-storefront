import type { Metadata } from "next";
import Link from "next/link";
import { CatalogEditor } from "./CatalogEditor";

export const metadata: Metadata = {
  title: "Catalog",
  robots: { index: false, follow: false },
};

export default function AdminProductsPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-10 md:px-6">
      <p className="text-sm">
        <Link href="/admin/orders" className="font-semibold text-brand-fresh underline">
          View orders
        </Link>
      </p>
      <h1 className="mt-4 font-display text-3xl text-neutral-900">Catalog JSON</h1>
      <p className="mt-2 text-sm text-neutral-600">
        Edit <code className="rounded bg-neutral-100 px-1">data/catalog.json</code> via this portal. Writes work on
        your dev machine or any host with a writable project directory. On read-only hosts (typical serverless), use{" "}
        <code className="rounded bg-neutral-100 px-1">CATALOG_JSON_URL</code> pointing to hosted JSON and update that
        file through your CDN or object store workflow.
      </p>
      <CatalogEditor />
    </div>
  );
}
