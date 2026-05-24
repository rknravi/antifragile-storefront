import "server-only";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { unstable_cache } from "next/cache";
import type { PolicyPage, PolicySlug } from "./content-types";
import { parsePoliciesJson, type PoliciesDocument } from "./policies-parse";

const POLICIES_PATH = path.join(process.cwd(), "data", "policies.json");

async function readPoliciesFromDisk(): Promise<PoliciesDocument> {
  const raw = await readFile(POLICIES_PATH, "utf8");
  return parsePoliciesJson(JSON.parse(raw) as unknown);
}

async function fetchPoliciesFromUrl(url: string): Promise<PoliciesDocument> {
  const res = await fetch(url, { next: { revalidate: 60 } });
  if (!res.ok) throw new Error(`Policies URL returned ${res.status}`);
  return parsePoliciesJson((await res.json()) as unknown);
}

const cachedDiskPolicies = unstable_cache(
  async () => readPoliciesFromDisk(),
  ["af-policies-disk"],
  { revalidate: 30, tags: ["policies"] }
);

export async function getPolicies(): Promise<PoliciesDocument> {
  const remote = process.env.POLICIES_JSON_URL;
  if (remote?.startsWith("https://")) {
    return fetchPoliciesFromUrl(remote);
  }
  return cachedDiskPolicies();
}

export async function getPolicy(slug: PolicySlug): Promise<PolicyPage> {
  const all = await getPolicies();
  return all[slug];
}
