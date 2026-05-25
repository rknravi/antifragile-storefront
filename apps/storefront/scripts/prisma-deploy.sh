#!/usr/bin/env bash
# Apply Prisma schema during Vercel build (and local `npm run build` when DATABASE_URL is set).
set -euo pipefail

if [ -z "${DATABASE_URL:-}" ]; then
  echo "prisma-deploy: DATABASE_URL unset — skipping db push."
  exit 0
fi

echo "prisma-deploy: applying schema (db push)…"
npx prisma db push --skip-generate
