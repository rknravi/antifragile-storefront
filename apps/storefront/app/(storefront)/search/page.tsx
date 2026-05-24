import { Suspense } from "react";
import RaysSearchPageClient from "./RaysSearchPageClient";

export const metadata = {
  title: "Search",
  description: "Search ANTIFRAGILE skincare — cleansers, serums, moisturizers, and ritual bundles.",
};

export default function SearchPage() {
  return (
    <Suspense
      fallback={
        <div className="py-24 text-center text-xs font-bold uppercase tracking-widest text-rays-gray">
          Loading search…
        </div>
      }
    >
      <RaysSearchPageClient />
    </Suspense>
  );
}
