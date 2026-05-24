import type { Metadata } from "next";
import { RegisterClient } from "@/components/account/RegisterClient";

export const metadata: Metadata = {
  title: "Create account",
  robots: { index: false, follow: false },
};

export default function RaysRegisterPage() {
  return <RegisterClient variant="rays" />;
}
