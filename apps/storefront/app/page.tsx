import Link from "next/link";
import { ProductCard } from "@/components/ProductCard";
import { NewsletterSignup } from "@/components/NewsletterSignup";
import { HomeReviews } from "@/components/HomeReviews";
import { getActiveProducts } from "@/lib/get-catalog";

export default async function HomePage() {
  const featured = (await getActiveProducts()).filter((p) => p.status === "active");

  return (
    <div>
      <section className="relative overflow-hidden bg-hero-mesh">
        <div className="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-16 md:flex-row md:items-center md:px-6 md:py-24">
          <div className="max-w-xl">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-brand-fresh">
              RKN Overseas
            </p>

            <h1 className="mt-3 font-display text-4xl leading-tight text-neutral-900 md:text-5xl">
              Daily resilience for your skin
            </h1>

            <p className="mt-4 text-lg text-neutral-600">
              Cleanse. Restore. Strengthen. ANTIFRAGILE is a modern routine for real life—premium
              textures, transparent ingredients, India-first checkout.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/shop"
                className="rounded-full bg-neutral-900 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-neutral-800"
              >
                Shop the collection
              </Link>

              <Link
                href="/routine-builder"
                className="rounded-full border border-neutral-300 bg-white/80 px-6 py-3 text-sm font-semibold text-neutral-900 hover:border-neutral-500"
              >
                Build your routine
              </Link>
            </div>

            <p className="mt-6 text-sm text-neutral-500">
              Launch offer: use code{" "}
              <span className="font-mono font-semibold text-neutral-800">LAUNCH10</span> at checkout
              for 10% off (demo).
            </p>
          </div>

          <div className="flex flex-1 justify-center md:max-w-md">
            <Link
              href="/shop"
              className="group relative block w-full overflow-hidden rounded-[2rem] bg-white shadow-xl ring-1 ring-black/5 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-fresh focus-visible:ring-offset-2"
            >
              <video
                className="aspect-[4/5] h-full w-full object-cover transition duration-500 group-hover:scale-105"
                autoPlay
                muted
                loop
                playsInline
                preload="metadata"
                poster="/images/products/antifragile-airy-veil-silk-cream-moisturizer.png"
              >
                <source src="/videos/antifragile-hero.mp4" type="video/mp4" />
              </video>

              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 via-black/25 to-transparent p-6 text-white">
                <p className="text-xs font-semibold uppercase tracking-[0.25em] text-white/80">
                  ANTIFRAGILE
                </p>
                <p className="mt-2 font-display text-2xl">Cleanse. Restore. Strengthen.</p>
                <p className="mt-1 text-sm text-white/80">
                  A daily skincare ritual built for real life.
                </p>
              </div>
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16 md:px-6">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <h2 className="font-display text-3xl text-neutral-900">Featured products</h2>
            <p className="mt-2 text-neutral-600">Three anchors. One resilient routine.</p>
          </div>

          <Link href="/shop" className="text-sm font-semibold text-brand-fresh hover:underline">
            View all →
          </Link>
        </div>

        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {featured.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </section>

      <section className="border-y border-black/5 bg-brand-mist/40">
        <div className="mx-auto max-w-6xl px-4 py-16 md:px-6">
          <h2 className="font-display text-3xl text-neutral-900">Build your routine</h2>
          <p className="mt-3 max-w-2xl text-neutral-600">
            Not sure where to start? Answer a few questions—we will map a morning and night sequence
            you can refine over time.
          </p>

          <Link
            href="/routine-builder"
            className="mt-8 inline-flex rounded-full bg-neutral-900 px-6 py-3 text-sm font-semibold text-white hover:bg-neutral-800"
          >
            Start routine quiz
          </Link>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16 md:px-6">
        <h2 className="text-center font-display text-3xl text-neutral-900">
          Cleanse · Restore · Strengthen
        </h2>

        <div className="mt-10 grid gap-8 md:grid-cols-3">
          {[
            {
              title: "Cleanse",
              body: "Soft Refresh removes the day without stripping—prep for actives and hydration.",
              tone: "from-[#1E4A6E] to-[#3A7CA5]",
            },
            {
              title: "Restore",
              body: "Pre-Shift Renewal Serum supports overnight renewal for smoother-looking skin.",
              tone: "from-[#5B4B8A] to-[#8B7CB8]",
            },
            {
              title: "Strengthen",
              body: "Airy Whip seals comfort—barrier-friendly hydration for morning and night.",
              tone: "from-[#7EB8C4] to-[#B8DDE6]",
            },
          ].map((s) => (
            <div key={s.title} className="rounded-2xl border border-black/5 bg-white p-6 shadow-sm">
              <div className={`h-2 w-16 rounded-full bg-gradient-to-r ${s.tone}`} />
              <h3 className="mt-4 font-display text-xl">{s.title}</h3>
              <p className="mt-2 text-sm text-neutral-600">{s.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-neutral-900 py-16 text-white">
        <div className="mx-auto max-w-6xl px-4 md:px-6">
          <h2 className="font-display text-3xl">Product benefits</h2>

          <ul className="mt-8 grid gap-6 md:grid-cols-2">
            <li className="rounded-2xl border border-white/10 bg-white/5 p-6">
              <p className="text-sm uppercase tracking-widest text-brand-aqua">Barrier-first</p>
              <p className="mt-2 text-neutral-200">
                Textures designed to layer—no unnecessary heaviness, no rushed “actives overload.”
              </p>
            </li>

            <li className="rounded-2xl border border-white/10 bg-white/5 p-6">
              <p className="text-sm uppercase tracking-widest text-brand-aqua">
                Ingredient transparency
              </p>
              <p className="mt-2 text-neutral-200">
                Clear INCI lists, patch-test guidance, and pairing tips on every product page.
              </p>
            </li>
          </ul>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16 md:px-6">
        <h2 className="font-display text-3xl text-neutral-900">Shop by skin concern</h2>

        <div className="mt-8 flex flex-wrap gap-2">
          {["Dryness", "Dullness", "Daily care", "Night routine", "Sensitive skin"].map((c) => (
            <Link
              key={c}
              href={`/shop?concern=${encodeURIComponent(c)}`}
              className="rounded-full border border-neutral-200 bg-white px-4 py-2 text-sm font-medium text-neutral-800 hover:border-neutral-400"
            >
              {c}
            </Link>
          ))}
        </div>
      </section>

      <section className="border-t border-black/5 bg-brand-sand py-16">
        <div className="mx-auto max-w-6xl px-4 md:px-6">
          <h2 className="font-display text-3xl text-neutral-900">Ingredient transparency</h2>
          <p className="mt-3 max-w-2xl text-neutral-600">
            We publish what goes in—and why it is there. Explore our glossary for plain-language
            definitions.
          </p>

          <Link
            href="/ingredients"
            className="mt-6 inline-block text-sm font-semibold text-brand-fresh hover:underline"
          >
            Open ingredient glossary →
          </Link>
        </div>
      </section>

      <HomeReviews />

      <section className="bg-gradient-to-br from-brand-mist to-white py-16">
        <div className="mx-auto flex max-w-6xl flex-col items-start gap-6 px-4 md:flex-row md:items-center md:justify-between md:px-6">
          <div>
            <h2 className="font-display text-3xl text-neutral-900">Routine bundle</h2>
            <p className="mt-2 text-neutral-600">
              Cleanser + Moisturizer + Serum—complete resilience. Free shipping above ₹999 (demo
              threshold).
            </p>
          </div>

          <Link
            href="/shop"
            className="rounded-full bg-neutral-900 px-6 py-3 text-sm font-semibold text-white"
          >
            Shop bundles
          </Link>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16 md:px-6">
        <h2 className="font-display text-3xl text-neutral-900">Founder / brand story</h2>
        <p className="mt-4 max-w-3xl text-neutral-600">
          ANTIFRAGILE exists because skin faces constant change—climate, stress, travel, screens. RKN
          Overseas built this line to be calm, credible, and uncompromising on everyday experience:
          textures you want to use, guidance you can trust, and checkout that works for India.
        </p>

        <Link href="/about" className="mt-6 inline-block text-sm font-semibold text-brand-fresh hover:underline">
          Read more about us →
        </Link>
      </section>

      <section className="border-t border-black/5 bg-white py-16">
        <div className="mx-auto max-w-6xl px-4 md:px-6">
          <h2 className="font-display text-2xl text-neutral-900">FAQ preview</h2>

          <dl className="mt-6 space-y-4">
            <div>
              <dt className="font-semibold">Do you ship across India?</dt>
              <dd className="text-sm text-neutral-600">Yes—see our shipping policy for timelines.</dd>
            </div>

            <div>
              <dt className="font-semibold">Are your products tested on animals?</dt>
              <dd className="text-sm text-neutral-600">We do not conduct animal testing.</dd>
            </div>
          </dl>

          <Link href="/faq" className="mt-6 inline-block text-sm font-semibold text-brand-fresh hover:underline">
            View all FAQs →
          </Link>
        </div>
      </section>

      <section className="bg-neutral-900 py-16 text-white">
        <div className="mx-auto max-w-6xl px-4 md:px-6">
          <h2 className="font-display text-3xl">Newsletter & WhatsApp</h2>
          <p className="mt-2 max-w-xl text-neutral-300">
            Get launch updates and routine tips. WhatsApp support can be enabled with{" "}
            <code className="rounded bg-white/10 px-1">NEXT_PUBLIC_WHATSAPP_NUMBER</code>.
          </p>

          <NewsletterSignup />
        </div>
      </section>
    </div>
  );
}