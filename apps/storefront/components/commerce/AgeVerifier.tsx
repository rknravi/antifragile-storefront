"use client";

import { useEffect, useState } from "react";

const KEY = "af_age_verified_v1";

export function AgeVerifier() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!localStorage.getItem(KEY)) setShow(true);
  }, []);

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div
        role="dialog"
        aria-labelledby="age-title"
        className="max-w-md rounded-2xl bg-white p-8 shadow-2xl"
      >
        <h2 id="age-title" className="font-display text-2xl text-neutral-900">
          Welcome to ANTIFRAGILE
        </h2>
        <p className="mt-3 text-sm text-neutral-600">
          Our skincare is formulated for adults. Please confirm you are 18 or older to continue browsing.
        </p>
        <div className="mt-8 flex flex-col gap-2 sm:flex-row">
          <button
            type="button"
            className="flex-1 rounded-full bg-neutral-900 py-3 text-sm font-semibold text-white hover:bg-neutral-800"
            onClick={() => {
              localStorage.setItem(KEY, "1");
              setShow(false);
            }}
          >
            I am 18 or older
          </button>
          <button
            type="button"
            className="flex-1 rounded-full border border-neutral-300 py-3 text-sm font-medium text-neutral-700"
            onClick={() => {
              window.location.href = "https://www.google.com";
            }}
          >
            Leave
          </button>
        </div>
      </div>
    </div>
  );
}
