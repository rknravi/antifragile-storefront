"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  buildRoutineRecommendation,
  type CompleteRoutineAnswers,
  type Concern,
  type RoutineAnswers,
  type RoutineScope,
  type RoutineTime,
  type SkinType,
  type TexturePref,
} from "@/lib/routine-rules";

const skinTypes: SkinType[] = ["Dry", "Oily", "Combination", "Normal", "Sensitive"];
const concerns: Concern[] = ["Dryness", "Dullness", "Daily care", "Sensitive", "Fine lines"];
const times: RoutineTime[] = ["Morning", "Night", "Full day"];
const textures: TexturePref[] = ["Lightweight", "Rich", "No preference"];
const scopes: RoutineScope[] = ["One hero product", "Full routine"];

export default function RoutineBuilderPage() {
  const [answers, setAnswers] = useState<RoutineAnswers>({
    skinType: "",
    concern: "",
    time: "",
    texture: "",
    scope: "",
  });

  const result = useMemo(() => {
    if (!answers.skinType || !answers.concern || !answers.time || !answers.texture || !answers.scope) {
      return null;
    }
    return buildRoutineRecommendation(answers as CompleteRoutineAnswers);
  }, [answers]);

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 md:px-6">
      <h1 className="font-display text-4xl text-neutral-900">Routine builder</h1>
      <p className="mt-3 text-neutral-600">
        Answer a few questions—we will suggest a morning and night flow (rules-based MVP).
      </p>

      <div className="mt-10 space-y-10">
        <fieldset>
          <legend className="text-sm font-semibold text-neutral-900">What is your skin type?</legend>
          <div className="mt-3 flex flex-wrap gap-2">
            {skinTypes.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setAnswers((a) => ({ ...a, skinType: s }))}
                className={`rounded-full px-3 py-1.5 text-sm ${
                  answers.skinType === s ? "bg-neutral-900 text-white" : "border border-neutral-200"
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </fieldset>

        <fieldset>
          <legend className="text-sm font-semibold text-neutral-900">Primary concern?</legend>
          <div className="mt-3 flex flex-wrap gap-2">
            {concerns.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setAnswers((a) => ({ ...a, concern: s }))}
                className={`rounded-full px-3 py-1.5 text-sm ${
                  answers.concern === s ? "bg-neutral-900 text-white" : "border border-neutral-200"
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </fieldset>

        <fieldset>
          <legend className="text-sm font-semibold text-neutral-900">When do you want to use products?</legend>
          <div className="mt-3 flex flex-wrap gap-2">
            {times.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setAnswers((a) => ({ ...a, time: s }))}
                className={`rounded-full px-3 py-1.5 text-sm ${
                  answers.time === s ? "bg-neutral-900 text-white" : "border border-neutral-200"
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </fieldset>

        <fieldset>
          <legend className="text-sm font-semibold text-neutral-900">Texture preference?</legend>
          <div className="mt-3 flex flex-wrap gap-2">
            {textures.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setAnswers((a) => ({ ...a, texture: s }))}
                className={`rounded-full px-3 py-1.5 text-sm ${
                  answers.texture === s ? "bg-neutral-900 text-white" : "border border-neutral-200"
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </fieldset>

        <fieldset>
          <legend className="text-sm font-semibold text-neutral-900">One product or full routine?</legend>
          <div className="mt-3 flex flex-wrap gap-2">
            {scopes.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setAnswers((a) => ({ ...a, scope: s }))}
                className={`rounded-full px-3 py-1.5 text-sm ${
                  answers.scope === s ? "bg-neutral-900 text-white" : "border border-neutral-200"
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </fieldset>
      </div>

      {result && (
        <div className="mt-12 rounded-2xl border border-black/5 bg-brand-mist/50 p-6">
          <h2 className="font-display text-2xl text-neutral-900">Your plan</h2>
          <div className="mt-6 grid gap-6 md:grid-cols-2">
            <div>
              <h3 className="text-sm font-semibold uppercase tracking-wider text-brand-fresh">
                Recommended morning
              </h3>
              <ol className="mt-2 list-decimal space-y-1 pl-5 text-sm text-neutral-800">
                {result.morning.length ? (
                  result.morning.map((s) => <li key={s}>{s}</li>)
                ) : (
                  <li>— (add serum later if desired)</li>
                )}
              </ol>
            </div>
            <div>
              <h3 className="text-sm font-semibold uppercase tracking-wider text-brand-night">
                Recommended night
              </h3>
              <ol className="mt-2 list-decimal space-y-1 pl-5 text-sm text-neutral-800">
                {result.night.map((s) => (
                  <li key={s}>{s}</li>
                ))}
              </ol>
            </div>
          </div>
          <p className="mt-6 text-sm text-neutral-600">{result.notes}</p>
          <Link
            href="/shop"
            className="mt-6 inline-flex rounded-full bg-neutral-900 px-6 py-3 text-sm font-semibold text-white"
          >
            Shop recommended products
          </Link>
        </div>
      )}
    </div>
  );
}
