import type { StoreTheme } from "@/lib/theme-paths";
import type { PolicyPage } from "@/lib/content-types";
import { ThemedContentPage } from "./ThemedContentPage";

export function PolicyPageView({
  variant = "classic",
  policy,
}: {
  variant?: StoreTheme;
  policy: PolicyPage;
}) {
  return (
    <ThemedContentPage variant={variant} title={policy.title}>
      {policy.paragraphs.map((paragraph) => (
        <p key={paragraph}>{paragraph}</p>
      ))}
    </ThemedContentPage>
  );
}
