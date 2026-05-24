/** Static policy pages editable via admin → data/policies.json */
export const POLICY_SLUGS = [
  "shipping",
  "returns",
  "privacy",
  "terms",
  "cancellation",
] as const;

export type PolicySlug = (typeof POLICY_SLUGS)[number];

export type PolicyPage = {
  slug: PolicySlug;
  title: string;
  /** Plain-text paragraphs rendered as <p> elements */
  paragraphs: string[];
};

export type BlogPost = {
  slug: string;
  title: string;
  excerpt: string;
  /** ISO date YYYY-MM-DD */
  date: string;
  body: string[];
};

export const POLICY_LABELS: Record<PolicySlug, string> = {
  shipping: "Shipping",
  returns: "Returns",
  privacy: "Privacy",
  terms: "Terms",
  cancellation: "Cancellation",
};
