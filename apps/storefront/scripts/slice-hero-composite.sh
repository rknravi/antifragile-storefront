#!/usr/bin/env bash
# Slice 4+3 hero contact sheet into seven slides under public/images/hero/
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
SRC="${1:-$ROOT/public/images/marketing/antifragile-ritual-collage-04.png}"
OUT="$ROOT/public/images/hero"
MAX_PX="${HERO_MAX_PX:-1600}"

if [ ! -f "$SRC" ]; then
  echo "Missing source composite: $SRC" >&2
  exit 1
fi

mkdir -p "$OUT"

read -r W H <<<"$(sips -g pixelWidth -g pixelHeight "$SRC" 2>/dev/null | awk '/pixel/ {print $2}' | tr '\n' ' ')"

ROW1_H=$((H / 2))
ROW2_H=$((H - ROW1_H))
TOP_W=$((W / 4))
BOT_W1=$((W / 3))
BOT_W2=$((W / 3))
BOT_W3=$((W - BOT_W1 - BOT_W2))
BOT_X2=$BOT_W1
BOT_X3=$((BOT_W1 + BOT_W2))

crop() {
  local h=$1 w=$2 y=$3 x=$4 name=$5
  sips -c "$h" "$w" --cropOffset "$y" "$x" "$SRC" --out "$OUT/$name" >/dev/null
  sips -Z "$MAX_PX" "$OUT/$name" --out "$OUT/$name" >/dev/null 2>&1 || true
  echo "  $name (${w}x${h})"
}

echo "Slicing ${W}x${H} from $(basename "$SRC")"
crop "$ROW1_H" "$TOP_W" 0 0 "antifragile-hero-01-all-three.png"
crop "$ROW1_H" "$TOP_W" 0 "$TOP_W" "antifragile-hero-02-cleanse-seal.png"
crop "$ROW1_H" "$TOP_W" 0 "$((TOP_W * 2))" "antifragile-hero-03-cleanse-treat.png"
crop "$ROW1_H" "$TOP_W" 0 "$((TOP_W * 3))" "antifragile-hero-04-treat-seal.png"
crop "$ROW2_H" "$BOT_W1" "$ROW1_H" 0 "antifragile-hero-05-serum.png"
crop "$ROW2_H" "$BOT_W2" "$ROW1_H" "$BOT_X2" "antifragile-hero-06-moisturizer.png"
crop "$ROW2_H" "$BOT_W3" "$ROW1_H" "$BOT_X3" "antifragile-hero-07-cleanser.png"
echo "Done → $OUT"
