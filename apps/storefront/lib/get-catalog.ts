import "server-only";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { unstable_cache } from "next/cache";
import type { Product } from "./product-types";
import { parseCatalogJson } from "./catalog-parse";

const CATALOG_PATH = path.join(process.cwd(), "data", "catalog.json");

async function readCatalogFromDisk(): Promise<Product[]> {
  const raw = await readFile(CATALOG_PATH, "utf8");
  return parseCatalogJson(JSON.parse(raw) as unknown);
}

async function fetchCatalogFromUrl(url: string): Promise<Product[]> {
  const res = await fetch(url, { next: { revalidate: 60 } });
  if (!res.ok) throw new Error(`Catalog URL returned ${res.status}`);
  const data = (await res.json()) as unknown;
  return parseCatalogJson(data);
}

const cachedDiskCatalog = unstable_cache(
  async () => readCatalogFromDisk(),
  ["af-catalog-disk"],
  { revalidate: 30, tags: ["catalog"] }
);

/**
 * Storefront catalog: prefer remote JSON when CATALOG_JSON_URL is set (e.g. CDN),
 * else read data/catalog.json from disk (rebuild or ISR refresh after admin save in dev).
 */
export async function getCatalog(): Promise<Product[]> {
  const remote = process.env.CATALOG_JSON_URL;
  if (remote?.startsWith("https://")) {
    // SECURITY-REVIEW: URL is allowlisted to https only; do not pass user-controlled URLs into this env.
    return fetchCatalogFromUrl(remote);
  }
  return cachedDiskCatalog();
}

export async function getActiveProducts(): Promise<Product[]> {
  const all = await getCatalog();
  return all.filter((p) => p.status === "active");
}
