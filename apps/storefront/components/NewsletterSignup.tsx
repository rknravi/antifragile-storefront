"use client";

export function NewsletterSignup() {
  return (
    <form
      className="mt-8 flex max-w-md flex-col gap-3 sm:flex-row"
      onSubmit={(e) => {
        e.preventDefault();
      }}
    >
      <label htmlFor="email" className="sr-only">
        Email
      </label>
      <input
        id="email"
        name="email"
        type="email"
        placeholder="you@example.com"
        className="flex-1 rounded-full border border-white/20 bg-white/10 px-4 py-3 text-sm text-white placeholder:text-neutral-400"
      />
      <button
        type="submit"
        className="rounded-full bg-white px-6 py-3 text-sm font-semibold text-neutral-900"
      >
        Join
      </button>
    </form>
  );
}
