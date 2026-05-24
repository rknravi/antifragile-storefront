"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { writeAccountSession } from "@/lib/account-session";
import type { StoreTheme } from "@/lib/theme-paths";
import { accountUi } from "@/lib/account-ui-styles";
import { themeNavPaths } from "@/lib/theme-nav-paths";
import { RaysPageBreadcrumbs } from "@/components/rays/RaysPageBreadcrumbs";

export function RegisterClient({ variant = "rays" }: { variant?: StoreTheme }) {
  const router = useRouter();
  const ui = accountUi(variant);
  const paths = themeNavPaths(variant);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const normalized = email.trim().toLowerCase();
    if (!normalized || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized)) {
      setError("Enter a valid email address.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    setBusy(true);
    writeAccountSession({
      email: normalized,
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      signedInAt: new Date().toISOString(),
    });
    router.push(paths.account);
    router.refresh();
  }

  return (
    <div className={ui.loginBg}>
      {variant === "rays" && (
        <RaysPageBreadcrumbs
          trail={[
            { label: "Account", href: paths.account },
            { label: "Create account" },
          ]}
        />
      )}
      <div className="mx-auto max-w-md px-4 py-10 md:py-16 md:px-6">
        <p className={ui.eyebrow}>Account</p>
        <h1 className={ui.title}>Create an account</h1>
        <p className={`mt-3 text-center text-sm ${ui.body}`}>
          Join ANTIFRAGILE to track orders and save your preferences on this device.
        </p>
        <form onSubmit={handleSubmit} className="mt-10 space-y-5">
          <div className="grid gap-5 sm:grid-cols-2">
            <input
              type="text"
              autoComplete="given-name"
              placeholder="First name"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className={ui.input}
            />
            <input
              type="text"
              autoComplete="family-name"
              placeholder="Last name"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className={ui.input}
            />
          </div>
          <input
            type="email"
            required
            autoComplete="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={ui.input}
          />
          <input
            type="password"
            required
            minLength={6}
            autoComplete="new-password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={ui.input}
          />
          {error && (
            <p className="text-sm text-red-700" role="alert">
              {error}
            </p>
          )}
          <button type="submit" disabled={busy} className={ui.btnPrimary}>
            {busy ? "Creating…" : "Create account"}
          </button>
        </form>
        <p className={`mt-8 text-center text-sm ${ui.body}`}>
          Already have an account?{" "}
          <Link href={paths.account} className={ui.link}>
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}
