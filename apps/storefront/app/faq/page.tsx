export const metadata = {
  title: "FAQ",
  description: "Frequently asked questions about ANTIFRAGILE.",
};

const faqs = [
  {
    q: "How do I patch test?",
    a: "Apply a small amount behind the ear or on the inner arm. Wait 24 hours. If redness or itching occurs, discontinue.",
  },
  {
    q: "When will my order ship?",
    a: "See the shipping policy for processing timelines. Integrate carrier webhooks in Medusa for live tracking.",
  },
  {
    q: "Can I return opened products?",
    a: "Refer to the return and refund policy. Many hygiene SKUs restrict returns once opened unless defective.",
  },
];

export default function FaqPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 md:px-6">
      <h1 className="font-display text-4xl text-neutral-900">FAQ</h1>
      <div className="mt-10 divide-y divide-neutral-200 rounded-2xl border border-neutral-200">
        {faqs.map((f) => (
          <details key={f.q} className="group px-4 py-4">
            <summary className="cursor-pointer list-none font-semibold text-neutral-900 marker:content-none [&::-webkit-details-marker]:hidden">
              {f.q}
            </summary>
            <p className="mt-2 text-sm text-neutral-600">{f.a}</p>
          </details>
        ))}
      </div>
    </div>
  );
}
