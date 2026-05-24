import { headers } from "next/headers";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { WhatsAppFloat } from "@/components/WhatsAppFloat";

import { isAlternateThemePath } from "@/lib/theme-paths";

export async function SiteChrome({ children }: { children: React.ReactNode }) {
  const pathname = (await headers()).get("x-pathname") ?? "";

  if (isAlternateThemePath(pathname)) {
    return <>{children}</>;
  }

  return (
    <>
      <SiteHeader />
      <main className="min-h-[60vh]">{children}</main>
      <SiteFooter />
      <WhatsAppFloat />
    </>
  );
}
