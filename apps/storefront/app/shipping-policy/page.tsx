export const metadata = { title: "Shipping policy" };

export default function ShippingPolicyPage() {
  return (
    <article className="mx-auto max-w-3xl px-4 py-16 md:px-6">
      <h1 className="font-display text-4xl text-neutral-900">Shipping policy</h1>
      <p className="mt-6 leading-relaxed text-neutral-700">Pan-India shipping (placeholder). Processing 1–2 business days. Carriers and SLAs to be finalized at launch.</p>
      <p className="mt-4 leading-relaxed text-neutral-700">Free shipping applies on carts above ₹999 once Medusa shipping rules are configured.</p>
    </article>
  );
}
