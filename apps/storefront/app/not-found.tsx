import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-lg px-4 py-24 text-center">
      <h1 className="font-display text-4xl">Page not found</h1>
      <p className="mt-4 text-neutral-600">The page you are looking for does not exist.</p>
      <Link href="/" className="mt-8 inline-block rounded-full bg-neutral-900 px-6 py-3 text-sm font-semibold text-white">
        Go home
      </Link>
    </div>
  );
}
