import type { Product, ProductBadge } from "./product-types";

const BADGES: ProductBadge[] = ["New", "Bestseller", "Bundle", "Launch Offer"];
const CATEGORIES = ["Cleanser", "Moisturizer", "Serum"] as const;
const USAGE = ["Morning", "Night", "Both"] as const;

function isRecord(x: unknown): x is Record<string, unknown> {
  return typeof x === "object" && x !== null && !Array.isArray(x);
}

/** Allow site-relative paths or https image URLs (CDN). Reject unsafe schemes. */
function parseOptionalImageField(value: unknown, field: string, slug: string): string | undefined {
  if (value === undefined || value === null) return undefined;
  if (typeof value !== "string") throw new Error(`${field} must be a string for ${slug}`);
  const s = value.trim();
  if (!s) return undefined;
  if (s.startsWith("https://")) {
    try {
      const u = new URL(s);
      if (u.protocol !== "https:") throw new Error("invalid");
      return s;
    } catch {
      throw new Error(`Invalid ${field} URL for ${slug}`);
    }
  }
  if (s.startsWith("/")) {
    if (s.includes("..") || s.includes("\\") || s.includes("\0")) throw new Error(`Invalid ${field} path for ${slug}`);
    if (!/^\/[\w./-]+$/.test(s)) throw new Error(`Invalid ${field} path for ${slug}`);
    return s;
  }
  throw new Error(`${field} must start with / or https:// for ${slug}`);
}

function parseOptionalImageList(value: unknown, field: string, slug: string): string[] | undefined {
  if (value === undefined || value === null) return undefined;
  if (!Array.isArray(value)) throw new Error(`${field} must be an array for ${slug}`);
  const out: string[] = [];
  value.forEach((item, i) => {
    const parsed = parseOptionalImageField(item, `${field}[${i}]`, slug);
    if (parsed) out.push(parsed);
  });
  return out.length ? out : undefined;
}

function parseOptionalHttpsUrl(value: unknown, field: string, slug: string): string | undefined {
  if (value === undefined || value === null) return undefined;
  if (typeof value !== "string") throw new Error(`${field} must be a string for ${slug}`);
  const s = value.trim();
  if (!s) return undefined;
  if (!s.startsWith("https://")) throw new Error(`${field} must be https:// for ${slug}`);
  try {
    const u = new URL(s);
    if (u.protocol !== "https:") throw new Error("invalid");
    return s;
  } catch {
    throw new Error(`Invalid ${field} URL for ${slug}`);
  }
}

/** Minimal validation for admin saves and remote catalog fetches. */
export function parseCatalogJson(data: unknown): Product[] {
  if (!Array.isArray(data)) throw new Error("Catalog must be a JSON array of products.");
  const out: Product[] = [];
  for (const row of data) {
    if (!isRecord(row)) throw new Error("Invalid product entry.");
    const badges = row.badges;
    if (!Array.isArray(badges) || !badges.every((b): b is ProductBadge => BADGES.includes(b as ProductBadge))) {
      throw new Error(`Invalid badges for product ${String(row.slug)}`);
    }
    const category = row.category;
    if (typeof category !== "string" || !CATEGORIES.includes(category as (typeof CATEGORIES)[number])) {
      throw new Error(`Invalid category for ${String(row.slug)}`);
    }
    const usageTime = row.usageTime;
    if (!Array.isArray(usageTime) || !usageTime.every((u) => USAGE.includes(u as (typeof USAGE)[number]))) {
      throw new Error(`Invalid usageTime for ${String(row.slug)}`);
    }
    const slug = String(row.slug);
    const image = parseOptionalImageField(row.image, "image", slug);
    const thumbnail = parseOptionalImageField(row.thumbnail, "thumbnail", slug);
    const gallery = parseOptionalImageList(row.gallery, "gallery", slug);
    const hoverImage = parseOptionalImageField(row.hoverImage, "hoverImage", slug);
    const videoUrl = parseOptionalHttpsUrl(row.videoUrl, "videoUrl", slug);
    const videoPoster = parseOptionalImageField(row.videoPoster, "videoPoster", slug);
    const lowStockThreshold =
      row.lowStockThreshold === undefined || row.lowStockThreshold === null
        ? undefined
        : Number(row.lowStockThreshold);

    let beforeAfter: Product["beforeAfter"];
    if (row.beforeAfter !== undefined && row.beforeAfter !== null) {
      if (!isRecord(row.beforeAfter)) throw new Error(`Invalid beforeAfter for ${slug}`);
      const before = parseOptionalImageField(row.beforeAfter.before, "beforeAfter.before", slug);
      const after = parseOptionalImageField(row.beforeAfter.after, "beforeAfter.after", slug);
      if (!before || !after) throw new Error(`beforeAfter requires before and after images for ${slug}`);
      beforeAfter = {
        before,
        after,
        ...(typeof row.beforeAfter.label === "string" && row.beforeAfter.label.trim()
          ? { label: row.beforeAfter.label.trim() }
          : {}),
      };
    }

    const p: Product = {
      id: String(row.id),
      sku: String(row.sku),
      name: String(row.name),
      slug,
      ...(image !== undefined ? { image } : {}),
      ...(thumbnail !== undefined ? { thumbnail } : {}),
      ...(gallery !== undefined ? { gallery } : {}),
      ...(hoverImage !== undefined ? { hoverImage } : {}),
      ...(videoUrl !== undefined ? { videoUrl } : {}),
      ...(videoPoster !== undefined ? { videoPoster } : {}),
      ...(beforeAfter !== undefined ? { beforeAfter } : {}),
      ...(lowStockThreshold !== undefined && Number.isFinite(lowStockThreshold) && lowStockThreshold >= 0
        ? { lowStockThreshold }
        : {}),
      category: category as Product["category"],
      shortDescription: String(row.shortDescription),
      longDescription: String(row.longDescription),
      size: String(row.size),
      mrp: Number(row.mrp),
      salePrice: Number(row.salePrice),
      currency: "INR",
      inventoryQuantity: Number(row.inventoryQuantity),
      skinTypes: Array.isArray(row.skinTypes) ? row.skinTypes.map(String) : [],
      skinConcerns: Array.isArray(row.skinConcerns) ? row.skinConcerns.map(String) : [],
      usageTime: usageTime as Product["usageTime"],
      ingredients: Array.isArray(row.ingredients) ? row.ingredients.map(String) : [],
      howToUse: Array.isArray(row.howToUse) ? row.howToUse.map(String) : [],
      warnings: Array.isArray(row.warnings) ? row.warnings.map(String) : [],
      badges,
      benefits: Array.isArray(row.benefits) ? row.benefits.map(String) : [],
      howItWorks: String(row.howItWorks),
      texture: String(row.texture),
      routinePairing: Array.isArray(row.routinePairing)
        ? row.routinePairing.map((rp) => {
            if (!isRecord(rp)) throw new Error("Invalid routinePairing");
            return { slug: String(rp.slug), label: String(rp.label) };
          })
        : [],
      seoTitle: String(row.seoTitle),
      seoDescription: String(row.seoDescription),
      status: row.status === "draft" || row.status === "archived" ? row.status : "active",
    };
    if (!p.slug || !p.name) throw new Error("Product missing slug or name.");
    if (!Number.isFinite(p.salePrice) || p.salePrice < 0) throw new Error(`Invalid salePrice for ${p.slug}`);
    out.push(p);
  }
  return out;
}
