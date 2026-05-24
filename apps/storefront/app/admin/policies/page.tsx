import type { Metadata } from "next";
import { AdminPortalNav } from "@/components/admin/AdminPortalNav";
import { PolicyContentEditor } from "@/components/admin/PolicyContentEditor";

export const metadata: Metadata = {
  title: "Policies",
  robots: { index: false, follow: false },
};

export default function AdminPoliciesPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-10 md:px-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="font-display text-3xl text-neutral-900">Policies</h1>
        <AdminPortalNav active="policies" />
      </div>
      <p className="mt-2 text-sm text-neutral-600">
        Edit shipping, returns, privacy, terms, and cancellation copy. Content is stored in{" "}
        <code className="rounded bg-neutral-100 px-1">data/policies.json</code> and shown on the
        storefront policy pages.
      </p>
      <PolicyContentEditor />
    </div>
  );
}
