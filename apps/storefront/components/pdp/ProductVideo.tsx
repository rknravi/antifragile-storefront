"use client";

type Props = {
  url: string;
  poster?: string;
  title: string;
};

export function ProductVideo({ url, poster, title }: Props) {
  return (
    <section className="mt-10">
      <h2 className="text-base font-semibold text-neutral-900">How to use — video</h2>
      <p className="mt-1 text-xs text-neutral-500">Sample routine video for demo (replace with brand asset).</p>
      <div className="relative mt-4 aspect-video overflow-hidden bg-neutral-900">
        {/* SECURITY-REVIEW: video URL from catalog JSON, not user input */}
        <video
          className="h-full w-full object-cover"
          controls
          playsInline
          preload="metadata"
          poster={poster}
          aria-label={`${title} usage video`}
        >
          <source src={url} type="video/mp4" />
        </video>
      </div>
    </section>
  );
}
