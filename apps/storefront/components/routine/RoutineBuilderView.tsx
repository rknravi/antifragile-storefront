"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { StoreTheme } from "@/lib/theme-paths";
import { themeNavPaths } from "@/lib/theme-nav-paths";
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

function chipClass(active: boolean, rays: boolean) {
  if (rays) {
    return active
      ? "border-2 border-rays-black bg-rays-black px-3 py-1.5 text-xs font-bold uppercase text-rays-accent"
      : "border-2 border-rays-line px-3 py-1.5 text-xs font-bold uppercase";
  }
  return active ? "rounded-full bg-neutral-900 px-3 py-1.5 text-sm text-white" : "rounded-full border border-neutral-200 px-3 py-1.5 text-sm";
}

export function RoutineBuilderView({ variant = "classic" }: { variant?: StoreTheme }) {
  const rays = variant === "rays";
  const nav = themeNavPaths(variant);
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

  const legendClass = rays
    ? "text-xs font-bold uppercase tracking-widest text-rays-black"
    : "text-sm font-semibold text-neutral-900";

  return (
    <div className={rays ? "mx-auto max-w-3xl bg-rays-white px-4 py-10 md:px-8 md:py-14" : "mx-auto max-w-3xl px-4 py-12 md:px-6"}>
      <h1
        className={
          rays
            ? "font-rays text-4xl font-extrabold uppercase text-rays-accent md:text-5xl"
            : "font-display text-4xl text-neutral-900"
        }
      >
        Routine builder
      </h1>
      <p className={rays ? "mt-4 text-sm text-rays-gray" : "mt-3 text-neutral-600"}>
        Answer a few questions—we will suggest a morning and night flow (rules-based MVP).
      </p>

      <div className="mt-10 space-y-10">
        {(
          [
            ["What is your skin type?", "skinType", skinTypes],
            ["Primary concern?", "concern", concerns],
            ["When do you want to use products?", "time", times],
            ["Texture preference?", "texture", textures],
            ["One product or full routine?", "scope", scopes],
          ] as const
        ).map(([label, key, options]) => (
          <fieldset key={key}>
            <legend className={legendClass}>{label}</legend>
            <div className="mt-3 flex flex-wrap gap-2">
              {options.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setAnswers((a) => ({ ...a, [key]: s }))}
                  className={chipClass(answers[key] === s, rays)}
                >
                  {s}
                </button>
              ))}
            </div>
          </fieldset>
        ))}
      </div>

      {result && (
        <div
          className={
            rays
              ? "mt-12 border-2 border-rays-black bg-rays-surface p-6"
              : "mt-12 rounded-2xl border border-black/5 bg-brand-mist/50 p-6"
          }
        >
          <h2 className={rays ? "font-rays text-2xl font-extrabold uppercase text-rays-accent" : "font-display text-2xl text-neutral-900"}>
            Your plan
          </h2>
          <div className="mt-6 grid gap-6 md:grid-cols-2">
            <div>
              <h3 className={rays ? "text-xs font-bold uppercase tracking-widest text-rays-accent" : "text-sm font-semibold uppercase tracking-wider text-brand-fresh"}>
                Recommended morning
              </h3>
              <ol className="mt-2 list-decimal space-y-1 pl-5 text-sm">
                {result.morning.length ? (
                  result.morning.map((s) => <li key={s}>{s}</li>)
                ) : (
                  <li>— (add serum later if desired)</li>
                )}
              </ol>
            </div>
            <div>
              <h3 className={rays ? "text-xs font-bold uppercase tracking-widest text-rays-black" : "text-sm font-semibold uppercase tracking-wider text-brand-night"}>
                Recommended night
              </h3>
              <ol className="mt-2 list-decimal space-y-1 pl-5 text-sm">
                {result.night.map((s) => (
                  <li key={s}>{s}</li>
                ))}
              </ol>
            </div>
          </div>
          <p className={rays ? "mt-6 text-sm text-rays-gray" : "mt-6 text-sm text-neutral-600"}>{result.notes}</p>
          <Link
            href={nav.shop}
            className={
              rays
                ? "mt-6 inline-flex border-2 border-rays-black bg-rays-accent px-8 py-3 text-xs font-bold uppercase tracking-widest text-rays-white"
                : "mt-6 inline-flex rounded-full bg-neutral-900 px-6 py-3 text-sm font-semibold text-white"
            }
          >
            Shop recommended products
          </Link>
        </div>
      )}
    </div>
  );
}
