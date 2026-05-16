export const metadata = {
  title: "About us",
  description: "ANTIFRAGILE by RKN Overseas — our story and standards.",
};

export default function AboutPage() {
  return (
    <article className="mx-auto max-w-3xl px-4 py-16 md:px-6">
      <h1 className="font-display text-4xl text-neutral-900">About ANTIFRAGILE</h1>
      <p className="mt-6 text-lg leading-relaxed text-neutral-700">
        ANTIFRAGILE is a modern skincare line from RKN Overseas—built for daily resilience with honest textures and
        transparent guidance.
      </p>
      <h2 className="mt-10 font-display text-2xl text-neutral-900">Our philosophy</h2>
      <p className="mt-3 leading-relaxed text-neutral-700">
        Cleanse. Restore. Strengthen. We believe routines should be calm, credible, and easy to sustain—especially in
        demanding climates and busy schedules.
      </p>
      <h2 className="mt-10 font-display text-2xl text-neutral-900">Quality & safety</h2>
      <p className="mt-3 leading-relaxed text-neutral-700">
        Patch-test guidance, clear INCI lists, and conservative introductions for active products. Always read the label
        and consult a dermatologist for persistent concerns.
      </p>
    </article>
  );
}
