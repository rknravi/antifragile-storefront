import type { StoreTheme } from "@/lib/theme-paths";

export function accountUi(theme: StoreTheme) {
  const rays = theme === "rays";

  return {
    pageBg: rays ? "bg-rays-white min-h-[70vh]" : "bg-brand-sand min-h-[70vh]",
    loginBg: rays ? "bg-rays-white" : "bg-brand-sand",
    loadingBg: rays ? "min-h-[50vh] bg-rays-white" : "min-h-[50vh] bg-brand-sand",
    eyebrow: rays
      ? "text-center text-xs font-bold uppercase tracking-[0.25em] text-rays-accent"
      : "text-center text-xs font-semibold uppercase tracking-[0.25em] text-neutral-500",
    title: rays
      ? "mt-6 text-center font-rays text-3xl font-extrabold uppercase text-rays-accent md:text-4xl"
      : "mt-6 text-center font-display text-3xl text-neutral-900 md:text-4xl",
    titleRecover: rays
      ? "mt-6 text-center font-rays text-3xl font-extrabold uppercase text-rays-accent"
      : "mt-6 text-center font-display text-3xl text-neutral-900",
    body: rays ? "text-rays-gray" : "text-neutral-600",
    accent: rays ? "text-rays-accent" : "text-brand-fresh",
    input: rays
      ? "w-full border-0 border-b-2 border-rays-line bg-transparent px-0 py-3 text-base text-rays-black placeholder:text-rays-gray focus:border-rays-accent focus:outline-none"
      : "w-full border-0 border-b border-neutral-300 bg-transparent px-0 py-3 text-base text-neutral-900 placeholder:text-neutral-400 focus:border-neutral-900 focus:outline-none focus:ring-0",
    btnPrimary: rays
      ? "w-full rounded-full bg-rays-accent py-3.5 text-sm font-bold uppercase tracking-wider text-rays-white transition hover:opacity-90 disabled:opacity-60"
      : "w-full rounded-sm bg-neutral-900 py-3.5 text-sm font-semibold uppercase tracking-wider text-white transition hover:bg-neutral-800 disabled:opacity-60",
    link: rays
      ? "font-bold text-rays-accent underline hover:opacity-80"
      : "font-semibold text-neutral-900 underline",
    linkMuted: rays
      ? "text-rays-gray underline hover:text-rays-accent"
      : "text-neutral-600 underline hover:text-neutral-900",
    sidebarLabel: rays
      ? "text-xs font-bold uppercase tracking-[0.2em] text-rays-accent"
      : "text-xs font-semibold uppercase tracking-[0.2em] text-neutral-500",
    sidebarName: rays
      ? "mt-2 font-rays text-2xl font-extrabold uppercase text-rays-black"
      : "mt-2 font-display text-2xl text-neutral-900",
    tabActive: rays
      ? "bg-rays-accent text-rays-white shadow-sm"
      : "bg-white text-neutral-900 shadow-sm",
    tabIdle: rays
      ? "text-rays-gray hover:bg-rays-cream hover:text-rays-accent"
      : "text-neutral-600 hover:bg-white/60 hover:text-neutral-900",
    panel: rays
      ? "min-w-0 flex-1 rounded-2xl border-2 border-rays-line bg-rays-white p-6 md:p-8"
      : "min-w-0 flex-1 rounded-2xl bg-white p-6 shadow-sm md:p-8",
    h2: rays
      ? "font-rays text-2xl font-extrabold uppercase text-rays-accent"
      : "font-display text-2xl text-neutral-900",
    card: rays
      ? "rounded-xl border-2 border-rays-line p-5 text-left transition hover:border-rays-accent"
      : "rounded-xl border border-black/5 p-5 text-left transition hover:border-brand-fresh/30",
    btnSecondary: rays
      ? "inline-block rounded-full border-2 border-rays-accent px-8 py-3 text-xs font-bold uppercase tracking-widest text-rays-accent hover:bg-rays-accent hover:text-rays-white"
      : "inline-block rounded-full bg-neutral-900 px-8 py-3 text-sm font-semibold text-white",
  };
}
