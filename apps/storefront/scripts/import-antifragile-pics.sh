#!/usr/bin/env bash
# Rename + optimize Antifragile-Pics → public/products & public/images
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
SRC="${ANTIFRAGILE_PICS_SRC:-$ROOT/../../../Antifragile-Pics}"
PRODUCTS="$ROOT/public/products"
IMAGES="$ROOT/public/images"
MARKETING="$IMAGES/marketing"
MAX_PX="${ANTIFRAGILE_MAX_PX:-1600}"

if [ ! -d "$SRC" ]; then
  echo "Source folder not found: $SRC" >&2
  exit 1
fi

mkdir -p "$PRODUCTS" "$IMAGES" "$MARKETING"

optimize_copy() {
  local from="$1"
  local to="$2"
  if [ ! -f "$SRC/$from" ]; then
    echo "skip (missing): $from" >&2
    return 0
  fi
  sips -Z "$MAX_PX" "$SRC/$from" --out "$to" >/dev/null 2>&1
  echo "  → $(basename "$to") ($(du -h "$to" | cut -f1))"
}

rename_source() {
  local from="$1"
  local to="$2"
  if [ -f "$SRC/$from" ] && [ "$from" != "$to" ]; then
    mv "$SRC/$from" "$SRC/$to"
  fi
}

echo "Import from: $SRC"
echo "Max dimension: ${MAX_PX}px"
echo ""

# --- Single products (PDP gallery + hover) ---
echo "Products:"
pairs=(
  "antifragile-cleanser-only-background-text.png|antifragile-soft-refresh-gel-cleanser-lifestyle-01.png"
  "antifragile-cleanser-only-background-text-2.png|antifragile-soft-refresh-gel-cleanser-lifestyle-02.png"
  "antifragile-cleanser-only-background-text-3.png|antifragile-soft-refresh-gel-cleanser-lifestyle-03.png"
  "antifragile-cleanser-only-model-howto.png|antifragile-soft-refresh-gel-cleanser-howto-01.png"
  "antifragile-serum-only-background-text.png|antifragile-pre-shift-renewal-serum-lifestyle-01.png"
  "antifragile-serum-only-background-text-2.png|antifragile-pre-shift-renewal-serum-lifestyle-02.png"
  "antifragile-serum-only-background-text-3.png|antifragile-pre-shift-renewal-serum-lifestyle-03.png"
  "antifragile-serum-only-model-howto.png|antifragile-pre-shift-renewal-serum-howto-01.png"
  "antifragile-serum-only-model-howto-1.png|antifragile-pre-shift-renewal-serum-howto-02.png"
  "antifragile-moisturizer-only-background-text.png|antifragile-airy-veil-silk-cream-moisturizer-lifestyle-01.png"
  "antifragile-moisturizer-only-background-text-2.png|antifragile-airy-veil-silk-cream-moisturizer-lifestyle-02.png"
  "antifragile-moisturizer-only-background-text-3.png|antifragile-airy-veil-silk-cream-moisturizer-lifestyle-03.png"
  "antifragile-moisturizer-only-model-howto.png|antifragile-airy-veil-silk-cream-moisturizer-howto-01.png"
  "antifragile-moisturizer-only-model-howto-1.png|antifragile-airy-veil-silk-cream-moisturizer-howto-02.png"
)

for pair in "${pairs[@]}"; do
  from="${pair%%|*}"
  dest="${pair##*|}"
  optimize_copy "$from" "$PRODUCTS/$dest"
  rename_source "$from" "$dest"
done

# --- Bundle lifestyle / lineup (heroes: npm run import:hero) ---
# Copy 1:1 when Antifragile-Pics already uses matching slugs:
#   cleanse-seal = cleanser + moisturizer, cleanse-treat = cleanser + serum, treat-seal = serum + moisturizer.
# If lifestyle-02 overlays are wrong, run: bash scripts/fix-bundle-lifestyle-02.sh
echo ""
echo "Bundles:"
bundle_pairs=(
  "antifragile-cleanse-seal-bundle-lifestyle-01.png|antifragile-cleanse-seal-bundle-lifestyle-01.png"
  "antifragile-cleanse-seal-bundle-lifestyle-02.png|antifragile-cleanse-seal-bundle-lifestyle-02.png"
  "antifragile-cleanse-seal-bundle-lifestyle-03.png|antifragile-cleanse-seal-bundle-lifestyle-03.png"
  "antifragile-cleanse-seal-bundle-lifestyle-04.png|antifragile-cleanse-seal-bundle-lifestyle-04.png"
  "antifragile-cleanse-treat-bundle-lifestyle-01.png|antifragile-cleanse-treat-bundle-lifestyle-01.png"
  "antifragile-cleanse-treat-bundle-lifestyle-02.png|antifragile-cleanse-treat-bundle-lifestyle-02.png"
  "antifragile-cleanse-treat-bundle-lifestyle-03.png|antifragile-cleanse-treat-bundle-lifestyle-03.png"
  "antifragile-treat-seal-bundle-lifestyle-01.png|antifragile-treat-seal-bundle-lifestyle-01.png"
  "antifragile-treat-seal-bundle-lifestyle-02.png|antifragile-treat-seal-bundle-lifestyle-02.png"
  "antifragile-treat-seal-bundle-lifestyle-03.png|antifragile-treat-seal-bundle-lifestyle-03.png"
  "antifragile-full-ritual-bundle-lifestyle-02.png|antifragile-full-ritual-bundle-lifestyle-02.png"
  "antifragile-full-ritual-bundle-lifestyle-03.png|antifragile-full-ritual-bundle-lifestyle-03.png"
  "antifragile-full-ritual-bundle-lineup-01.png|antifragile-full-ritual-bundle-lineup-01.png"
  "antifragile-full-ritual-bundle-lineup-02.png|antifragile-full-ritual-bundle-lineup-02.png"
)

for pair in "${bundle_pairs[@]}"; do
  from="${pair%%|*}"
  dest="${pair##*|}"
  optimize_copy "$from" "$IMAGES/$dest"
done

# Rename bundle sources (after copies; primary bundle files consumed once)
# --- Site marketing (about, home, collections) ---
echo ""
echo "Marketing:"
marketing_pairs=(
  "antifragile-bundle-background-text.png|antifragile-brand-campaign-01.png"
  "antifragile-containers-three-background-added.png|antifragile-ritual-lineup-01.png"
  "antifragile-containers-three-transperant.png|antifragile-ritual-lineup-transparent-01.png"
  "antifragile-containers-six-collage-background.png|antifragile-ritual-collage-01.png"
  "antifragile-containers-bundle-six-background.png|antifragile-ritual-collage-02.png"
  "antifragile-containers-bundle-seven-background.png|antifragile-ritual-collage-03.png"
  "antifragile-containers-bundle-seven-background-1.png|antifragile-ritual-collage-04.png"
  "antifragile-containers-bundle-seven-background-2.png|antifragile-ritual-collage-05.png"
)

for pair in "${marketing_pairs[@]}"; do
  from="${pair%%|*}"
  dest="${pair##*|}"
  optimize_copy "$from" "$MARKETING/$dest"
  rename_source "$from" "$dest"
done

echo ""
echo "Done. Source folder renamed; assets under public/products and public/images."
