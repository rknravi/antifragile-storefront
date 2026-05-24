"use client";

import { useSearchParams } from "next/navigation";
import { RaysPageBreadcrumbs } from "@/components/rays/RaysPageBreadcrumbs";
import { RaysSearchPanel } from "@/components/rays/RaysSearchPanel";

export default function RaysSearchPageClient() {
  const searchParams = useSearchParams();
  const q = searchParams.get("q") ?? "";

  return (
    <div>
      <RaysPageBreadcrumbs trail={[{ label: "Search" }]} />
      <RaysSearchPanel variant="page" initialQuery={q} />
    </div>
  );
}
