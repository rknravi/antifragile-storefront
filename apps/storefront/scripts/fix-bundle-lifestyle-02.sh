#!/usr/bin/env bash
# Rotate mis-assigned bundle lifestyle-02 PNGs so filename slug matches products in frame.
# Overlay text on -02 may still be wrong — re-export from design or use -01/-03 in the site gallery.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
IMAGES="$ROOT/public/images"
PICS="${ANTIFRAGILE_PICS_SRC:-$ROOT/../../../Antifragile-Pics}"
TMP="${TMPDIR:-/tmp}/af-bundle-02-$$"
mkdir -p "$TMP"

rotate_dir() {
  local dir="$1"
  [ -d "$dir" ] || return 0
  echo "Rotate lifestyle-02 in: $dir"
  local a="$dir/antifragile-treat-seal-bundle-lifestyle-02.png"
  local b="$dir/antifragile-cleanse-treat-bundle-lifestyle-02.png"
  local c="$dir/antifragile-cleanse-seal-bundle-lifestyle-02.png"
  for f in "$a" "$b" "$c"; do
    [ -f "$f" ] || { echo "  skip (missing): $f" >&2; return 0; }
  done
  cp -f "$a" "$TMP/c+s.png"
  cp -f "$b" "$TMP/c+m.png"
  cp -f "$c" "$TMP/s+m.png"
  cp -f "$TMP/c+m.png" "$dir/antifragile-cleanse-seal-bundle-lifestyle-02.png"
  cp -f "$TMP/c+s.png" "$dir/antifragile-cleanse-treat-bundle-lifestyle-02.png"
  cp -f "$TMP/s+m.png" "$dir/antifragile-treat-seal-bundle-lifestyle-02.png"
  echo "  cleanse-seal-02 ← cleanser+moisturizer shot"
  echo "  cleanse-treat-02 ← cleanser+serum shot"
  echo "  treat-seal-02 ← serum+moisturizer shot"
}

rotate_dir "$IMAGES"
rotate_dir "$PICS"
rm -rf "$TMP"
echo "Done. Update overlay text in source art if labels still disagree with products."
