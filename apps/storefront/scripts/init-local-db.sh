#!/usr/bin/env bash
# Start local Postgres (docker-compose) and apply Prisma schema. Run from repo root or anywhere via npm run db:init.
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

export DATABASE_URL="${DATABASE_URL:-postgresql://antifragile:antifragile@127.0.0.1:5433/storefront}"

if ! command -v docker >/dev/null 2>&1; then
  echo "docker not found. Install Docker Desktop or CLI, then retry." >&2
  exit 1
fi

if ! docker info >/dev/null 2>&1; then
  echo "Docker is not running. Start Docker Desktop, then retry." >&2
  exit 1
fi

echo "Starting Postgres (docker compose)…"
docker compose up -d db

echo "Waiting for database to accept connections…"
for i in $(seq 1 90); do
  if docker compose exec -T db pg_isready -U antifragile -d storefront >/dev/null 2>&1; then
    echo "Postgres is ready."
    break
  fi
  if [ "$i" -eq 90 ]; then
    echo "Timed out waiting for Postgres. Check: docker compose logs db" >&2
    exit 1
  fi
  sleep 1
done

echo "Applying Prisma schema (db push)…"
npx prisma db push

echo ""
echo "Done. Use this in apps/storefront/.env.local (if not already set):"
echo "DATABASE_URL=${DATABASE_URL}"
echo ""
echo "Then restart: npm run dev"
