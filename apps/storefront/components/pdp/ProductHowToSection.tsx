"use client";

import { useState } from "react";

type Props = {
  title: string;
  images: string[];
  videoUrl?: string;
  videoPoster?: string;
};

/**
 * How-to usage block: brand stills now; optional MP4 when `videoUrl` is set in catalog.
 */
export function ProductHowToSection({ title, images, videoUrl, videoPoster }: Props) {
  const slides = images.filter(Boolean);
  const [active, setActive] = useState(0);
  const hasVideo = Boolean(videoUrl?.trim().startsWith("https://"));
  const still = slides[active] ?? slides[0] ?? videoPoster;

  if (!hasVideo && slides.length === 0) return null;

  return (
    <section className="mt-10">
      <h2 className="font-rays text-xl font-extrabold uppercase text-rays-accent md:text-2xl">How to use</h2>
      <p className="mt-1 text-sm text-neutral-600">
        {hasVideo ? "Watch the routine guide." : "Video coming soon — application guide below."}
      </p>

      {hasVideo ? (
        <div className="relative mt-4 aspect-video overflow-hidden rounded-2xl bg-neutral-900">
          {/* SECURITY-REVIEW: video URL from catalog JSON only */}
          <video
            className="h-full w-full object-cover"
            controls
            playsInline
            preload="metadata"
            poster={videoPoster ?? still}
            aria-label={`${title} usage video`}
          >
            <source src={videoUrl} type="video/mp4" />
          </video>
        </div>
      ) : (
        still && (
          <div className="mt-4">
            <div className="flex aspect-[4/5] max-h-[min(520px,70vh)] w-full items-center justify-center overflow-hidden rounded-2xl bg-rays-cream">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={still}
                alt={`${title} — how to apply`}
                decoding="async"
                loading="eager"
                className="max-h-full max-w-full object-contain object-center p-4 md:p-8"
              />
            </div>
            {slides.length > 1 && (
              <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
                {slides.map((img, i) => (
                  <button
                    key={`${img}-${i}`}
                    type="button"
                    onClick={() => setActive(i)}
                    className={`flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-xl border-2 bg-white p-1 md:h-20 md:w-20 ${
                      i === active ? "border-rays-accent" : "border-neutral-200"
                    }`}
                    aria-label={`How-to image ${i + 1}`}
                    aria-current={i === active}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={img} alt="" loading="lazy" decoding="async" className="max-h-full max-w-full object-contain" />
                  </button>
                ))}
              </div>
            )}
          </div>
        )
      )}

      {!hasVideo && slides.length > 0 && (
        <p className="mt-3 text-xs font-semibold uppercase tracking-wider text-neutral-500">
          Brand video will replace this preview when uploaded.
        </p>
      )}
    </section>
  );
}
