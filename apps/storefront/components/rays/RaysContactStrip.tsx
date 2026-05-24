"use client";

import { useState } from "react";

/** Customizable contact form strip — Rays / Zap feature (client-side demo). */
export function RaysContactStrip() {
  const [sent, setSent] = useState(false);
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  return (
    <section className="border-t-2 border-rays-black bg-rays-accent py-20">
      <div className="mx-auto max-w-xl px-4 md:px-8">
        <h2 className="font-rays text-3xl font-extrabold uppercase text-rays-white">Get in touch</h2>
        <p className="mt-2 text-sm text-rays-white/90">Questions about your routine or order? We respond within one business day.</p>
        {sent ? (
          <p className="mt-8 font-bold uppercase tracking-widest">Thanks — we&apos;ll be in touch.</p>
        ) : (
          <form
            className="mt-8 space-y-4"
            onSubmit={(e) => {
              e.preventDefault();
              if (!email.trim() || !message.trim()) return;
              setSent(true);
            }}
          >
            <label className="block text-xs font-bold uppercase tracking-widest">
              Email
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 w-full border-2 border-rays-black bg-rays-white px-4 py-3 text-sm"
              />
            </label>
            <label className="block text-xs font-bold uppercase tracking-widest">
              Message
              <textarea
                required
                rows={4}
                value={message}
                onChange={(e) => setMessage(e.target.value.slice(0, 1000))}
                className="mt-1 w-full border-2 border-rays-black bg-rays-white px-4 py-3 text-sm"
              />
            </label>
            <button type="submit" className="w-full bg-rays-black py-4 text-xs font-bold uppercase tracking-widest text-rays-accent">
              Send message
            </button>
          </form>
        )}
      </div>
    </section>
  );
}
