import { POLICY_SLUGS, type PolicyPage, type PolicySlug } from "./content-types";

function isRecord(x: unknown): x is Record<string, unknown> {
  return typeof x === "object" && x !== null && !Array.isArray(x);
}

function parseParagraphs(value: unknown, slug: string): string[] {
  if (!Array.isArray(value) || value.length === 0) {
    throw new Error(`${slug}: paragraphs must be a non-empty array of strings`);
  }
  return value.map((p, i) => {
    if (typeof p !== "string" || !p.trim()) {
      throw new Error(`${slug}: paragraphs[${i}] must be a non-empty string`);
    }
    return p.trim();
  });
}

function parsePolicyEntry(slug: PolicySlug, value: unknown): PolicyPage {
  if (!isRecord(value)) throw new Error(`Policy "${slug}" must be an object`);
  const title = value.title;
  if (typeof title !== "string" || !title.trim()) {
    throw new Error(`${slug}: title is required`);
  }
  const paragraphs = parseParagraphs(value.paragraphs, slug);
  return { slug, title: title.trim(), paragraphs };
}

export type PoliciesDocument = Record<PolicySlug, PolicyPage>;

export function parsePoliciesJson(body: unknown): PoliciesDocument {
  if (!isRecord(body)) throw new Error("Policies must be a JSON object keyed by slug");
  const out = {} as PoliciesDocument;
  for (const slug of POLICY_SLUGS) {
    if (!(slug in body)) throw new Error(`Missing policy: ${slug}`);
    out[slug] = parsePolicyEntry(slug, body[slug]);
  }
  const extra = Object.keys(body).filter((k) => !POLICY_SLUGS.includes(k as PolicySlug));
  if (extra.length) throw new Error(`Unknown policy keys: ${extra.join(", ")}`);
  return out;
}
