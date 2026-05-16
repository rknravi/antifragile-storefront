export const metadata = {
  title: "Contact",
  description: "Contact ANTIFRAGILE / RKN Overseas.",
};

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-xl px-4 py-16 md:px-6">
      <h1 className="font-display text-4xl text-neutral-900">Contact us</h1>
      <p className="mt-4 text-neutral-600">
        Replace with production support email, phone, and ticketing when operations go live.
      </p>
      <dl className="mt-8 space-y-4 text-sm">
        <div>
          <dt className="font-semibold text-neutral-900">Email</dt>
          <dd>
            <a className="text-brand-fresh underline" href="mailto:hello@antifragileskin.com">
              hello@antifragileskin.com
            </a>{" "}
            (placeholder)
          </dd>
        </div>
        <div>
          <dt className="font-semibold text-neutral-900">WhatsApp</dt>
          <dd>Set NEXT_PUBLIC_WHATSAPP_NUMBER to enable the floating button.</dd>
        </div>
      </dl>
    </div>
  );
}
