#!/usr/bin/env bash
# Copy antifragile-hero*.png from Antifragile-Pics → public/images/hero/
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
SRC="${ANTIFRAGILE_PICS_SRC:-$ROOT/../../../Antifragile-Pics}"
OUT="$ROOT/public/images/hero"
MAX_PX="${HERO_MAX_PX:-1200}"

if [ ! -d "$SRC" ]; then
  echo "Source folder not found: $SRC" >&2
  exit 1
fi

mkdir -p "$OUT"

shopt -s nullglob
files=("$SRC"/antifragile-hero*.png)
if [ ${#files[@]} -eq 0 ]; then
  echo "No antifragile-hero*.png in $SRC" >&2
  exit 1
fi

for f in "${files[@]}"; do
  base=$(basename "$f")
  sips -Z "$MAX_PX" "$f" --out "$OUT/$base" >/dev/null 2>&1
  echo "  → $base ($(du -h "$OUT/$base" | cut -f1))"
done

# Remove legacy sliced contact-sheet assets
rm -f "$OUT"/antifragile-hero-0[1-7]-*.png 2>/dev/null || true
echo "Done. Removed legacy antifragile-hero-01…07 slices if present."
