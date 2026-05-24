import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { RaysProductCard } from "@/components/rays/RaysProductCard";
import { ProductGallery } from "@/components/pdp/ProductGallery";
import { ProductInfoPanel } from "@/components/pdp/ProductInfoPanel";
import { ProductVideo } from "@/components/pdp/ProductVideo";
import { BeforeAfterSlider } from "@/components/pdp/BeforeAfterSlider";
import { RecordRecentlyViewed } from "@/components/pdp/RecordRecentlyViewed";
import { FaqMini } from "@/app/products/[slug]/FaqMini";
import { ProductReviews } from "@/app/products/[slug]/ProductReviews";
import { getProductBySlug, getRelatedProducts } from "@/lib/products";
import { getActiveProducts } from "@/lib/get-catalog";
import { raysPath } from "@/lib/theme-paths";

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

export default async function RaysProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const catalog = await getActiveProducts();
  const product = getProductBySlug(catalog, slug);
  if (!product) notFound();

  const related = getRelatedProducts(catalog, product.slug);

  return (
    <div className="bg-rays-white pb-24 md:pb-12">
      <RecordRecentlyViewed slug={slug} />
      <div className="mx-auto max-w-[1440px] px-4 pt-6 md:px-8">
        <Breadcrumbs
          variant="rays"
          items={[
            { label: "Home", href: raysPath("/") },
            { label: "Shop", href: raysPath("/shop") },
            { label: product.name.replace(/^ANTIFRAGILE\s*/i, "").trim() },
          ]}
        />
      </div>
      <div className="mx-auto grid max-w-[1440px] gap-10 px-4 py-10 md:grid-cols-2 md:gap-14 md:px-8 md:py-14">
        <ProductGallery product={product} variant="rays" />
        <ProductInfoPanel product={product} variant="rays" theme="rays" />
      </div>

      {product.videoUrl && (
        <div className="mx-auto max-w-[1440px] px-4 md:px-8">
          <ProductVideo url={product.videoUrl} poster={product.videoPoster} title={product.name} />
        </div>
      )}

      {product.beforeAfter && (
        <div className="mx-auto max-w-[1440px] px-4 md:px-8">
          <BeforeAfterSlider
            before={product.beforeAfter.before}
            after={product.beforeAfter.after}
            label={product.beforeAfter.label}
          />
        </div>
      )}

      <ProductReviews slug={slug} />

      <section className="mx-auto max-w-[1440px] px-4 py-12 md:px-8">
        <h2 className="font-rays text-2xl font-extrabold uppercase text-rays-accent">Product FAQ</h2>
        <FaqMini variant="rays" />
      </section>

      <section className="mx-auto max-w-[1440px] px-4 pb-16 md:px-8">
        <h2 className="font-rays text-2xl font-extrabold uppercase text-rays-accent">You may also like</h2>
        <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {related.map((p) => (
            <RaysProductCard key={p.id} product={p} />
          ))}
        </div>
      </section>
    </div>
  );
}
