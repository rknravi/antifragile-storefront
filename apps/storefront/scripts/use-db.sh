#!/usr/bin/env bash
set -euo pipefail

TARGET="${1:-}"

if [ "$TARGET" = "local" ]; then
  cp .env.localdb .env
  echo "Now using LOCAL database"
elif [ "$TARGET" = "neon" ]; then
  cp .env.neon .env
  echo "Now using NEON database"
else
  echo "Usage: bash scripts/use-db.sh local|neon"
  exit 1
fi

echo ""
echo "Current DATABASE_URL:"
grep DATABASE_URL .env
