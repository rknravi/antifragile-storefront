import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getProductBySlug, getRelatedProducts } from "@/lib/products";
import { getActiveProducts } from "@/lib/get-catalog";
import { Money } from "@/components/Money";
import { ProductBadges } from "@/components/ProductBadges";
import { ProductCard } from "@/components/ProductCard";
import { ProductImage } from "@/components/ProductImage";
import { PdpActions } from "./PdpActions";
import { IngredientAccordion } from "./IngredientAccordion";
import { FaqMini } from "./FaqMini";
import { ProductReviews } from "./ProductReviews";

export async function generateStaticParams() {
  const products = await getActiveProducts();
  return products.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const catalog = await getActiveProducts();
  const p = getProductBySlug(catalog, slug);
  if (!p) return {};
  const base = (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/$/, "");
  const ogImage =
    p.image?.startsWith("https://") ? p.image : p.image?.startsWith("/") ? `${base}${p.image}` : undefined;

  return {
    title: p.seoTitle,
    description: p.seoDescription,
    openGraph: {
      title: p.name,
      description: p.shortDescription,
      ...(ogImage ? { images: [{ url: ogImage }] } : {}),
    },
  };
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const catalog = await getActiveProducts();
  const product = getProductBySlug(catalog, slug);
  if (!product) notFound();

  const related = getRelatedProducts(catalog, product.slug);

  const gradient =
    product.category === "Cleanser"
      ? "from-[#1E4A6E] to-[#3A7CA5]"
      : product.category === "Moisturizer"
        ? "from-[#7EB8C4] to-[#B8DDE6]"
        : "from-[#5B4B8A] to-[#8B7CB8]";

  const heroSrc = product.image;

  return (
    <div className="pb-24 md:pb-12">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-10 md:grid-cols-2 md:px-6">
        <div>
          <div className="relative aspect-[4/5] w-full overflow-hidden rounded-3xl shadow-lg">
            {heroSrc ? (
              <ProductImage
                src={heroSrc}
                alt={product.name}
                sizes="(min-width: 768px) 50vw, 100vw"
                priority
              />
            ) : (
              <div
                className={`absolute inset-0 bg-gradient-to-br ${gradient}`}
                role="img"
                aria-label={`${product.name} product visual placeholder`}
              />
            )}
          </div>
          <p className="mt-3 text-center text-xs text-neutral-500">
            {heroSrc
              ? "Swap `image` in catalog for final photography or a CDN URL when ready."
              : "Add `image` (and optional `thumbnail`) in data/catalog.json or the admin portal."}
          </p>
        </div>

        <div>
          <ProductBadges badges={product.badges} />
          <h1 className="mt-4 font-display text-3xl leading-tight md:text-4xl">{product.name}</h1>
          <p className="mt-2 text-sm text-neutral-500">
            {product.size} · {product.category}
          </p>
          <p className="mt-4 text-lg text-neutral-700">{product.shortDescription}</p>
          <p className="mt-4 text-sm leading-relaxed text-neutral-600">{product.longDescription}</p>

          <div className="mt-6 flex items-baseline gap-3">
            <span className="text-2xl font-semibold">
              <Money amount={product.salePrice} />
            </span>
            {product.salePrice < product.mrp && (
              <span className="text-lg text-neutral-400 line-through">
                <Money amount={product.mrp} />
              </span>
            )}
            <span className="text-sm text-neutral-500">MRP incl. of all taxes</span>
          </div>

          <PdpActions product={product} />

          <section className="mt-10 space-y-6 text-sm text-neutral-700">
            <div>
              <h2 className="text-base font-semibold text-neutral-900">Benefits</h2>
              <ul className="mt-2 list-disc space-y-1 pl-5">
                {product.benefits.map((b) => (
                  <li key={b}>{b}</li>
                ))}
              </ul>
            </div>
            <div>
              <h2 className="text-base font-semibold text-neutral-900">How it works</h2>
              <p className="mt-2">{product.howItWorks}</p>
            </div>
            <div>
              <h2 className="text-base font-semibold text-neutral-900">Texture / skin feel</h2>
              <p className="mt-2">{product.texture}</p>
            </div>
            <IngredientAccordion ingredients={product.ingredients} />
            <div>
              <h2 className="text-base font-semibold text-neutral-900">How to use</h2>
              <ol className="mt-2 list-decimal space-y-1 pl-5">
                {product.howToUse.map((s) => (
                  <li key={s}>{s}</li>
                ))}
              </ol>
            </div>
            <div>
              <h2 className="text-base font-semibold text-neutral-900">When to use</h2>
              <p className="mt-2">{product.usageTime.join(", ")}</p>
            </div>
            <div>
              <h2 className="text-base font-semibold text-neutral-900">Suitable skin types</h2>
              <p className="mt-2">{product.skinTypes.join(", ")}</p>
            </div>
            <div>
              <h2 className="text-base font-semibold text-neutral-900">Warnings</h2>
              <ul className="mt-2 list-disc space-y-1 pl-5 text-amber-900">
                {product.warnings.map((w) => (
                  <li key={w}>{w}</li>
                ))}
              </ul>
            </div>
            <div>
              <h2 className="text-base font-semibold text-neutral-900">Routine pairing</h2>
              <ul className="mt-2 space-y-2">
                {product.routinePairing.map((r) => (
                  <li key={r.slug}>
                    <Link href={`/products/${r.slug}`} className="font-medium text-brand-fresh hover:underline">
                      {r.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </section>
        </div>
      </div>

      <ProductReviews slug={slug} />

      <section className="mx-auto max-w-6xl px-4 py-12 md:px-6">
        <h2 className="font-display text-2xl">Product FAQ</h2>
        <FaqMini />
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-16 md:px-6">
        <h2 className="font-display text-2xl">Related products</h2>
        <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {related.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </section>
    </div>
  );
}
