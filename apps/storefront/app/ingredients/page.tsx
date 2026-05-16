export const metadata = { title: "Ingredient glossary" };

const entries = [
  { term: "Humectants", def: "Ingredients that attract water into the upper layers of skin to support hydration." },
  { term: "Emollients", def: "Skin-softening ingredients that help reduce roughness and support comfort." },
  { term: "Surfactants", def: "Cleansing agents that lift oil and debris; mild variants prioritize barrier kindness." },
];

export default function IngredientsPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 md:px-6">
      <h1 className="font-display text-4xl text-neutral-900">Ingredient glossary</h1>
      <p className="mt-4 text-neutral-600">Plain-language anchors—expand with CMS in production.</p>
      <dl className="mt-10 space-y-6">
        {entries.map((e) => (
          <div key={e.term} className="rounded-2xl border border-black/5 bg-white p-5 shadow-sm">
            <dt className="font-semibold text-neutral-900">{e.term}</dt>
            <dd className="mt-2 text-sm text-neutral-600">{e.def}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
