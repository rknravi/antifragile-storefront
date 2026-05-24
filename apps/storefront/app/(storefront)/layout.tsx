import type { Metadata } from "next";
import { Syne, DM_Sans } from "next/font/google";
import { RaysHeader } from "@/components/rays/RaysHeader";
import { RaysFooter } from "@/components/rays/RaysFooter";
import { RaysBackToTop } from "@/components/rays/RaysBackToTop";
import "./rays.css";

const raysDisplay = Syne({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-rays-display",
});

const raysSans = DM_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-rays-sans",
});

export const metadata: Metadata = {
  title: {
    default: "ANTIFRAGILE Skincare | RKN Overseas",
    template: "%s | ANTIFRAGILE",
  },
  description:
    "Cleanse. Restore. Strengthen. Premium ANTIFRAGILE skincare—full-width storytelling, fast checkout, India-ready.",
};

export default function StorefrontLayout({ children }: { children: React.ReactNode }) {
  return (
    <div
      className={`rays-theme min-h-screen bg-rays-white font-rays-sans text-rays-black ${raysDisplay.variable} ${raysSans.variable}`}
    >
      <RaysHeader />
      <main>{children}</main>
      <RaysFooter />
      <RaysBackToTop />
    </div>
  );
}
