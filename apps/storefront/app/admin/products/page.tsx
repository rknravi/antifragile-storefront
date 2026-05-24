import type { Metadata } from "next";
import { CatalogEditor } from "./CatalogEditor";
import { AdminPortalNav } from "@/components/admin/AdminPortalNav";

export const metadata: Metadata = {
  title: "Catalog",
  robots: { index: false, follow: false },
};

export default function AdminProductsPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-10 md:px-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="font-display text-3xl text-neutral-900">Catalog JSON</h1>
        <AdminPortalNav active="catalog" />
      </div>
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
