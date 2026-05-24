import type { Metadata } from "next";
import { AccountClient } from "@/components/account/AccountClient";

export const metadata: Metadata = {
  title: "My account",
  robots: { index: false, follow: false },
};

export default function RaysAccountPage() {
  return <AccountClient variant="rays" />;
}
