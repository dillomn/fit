#!/bin/sh
set -e

# Ensure the SQLite schema exists / is up to date on the mounted volume.
echo "→ Syncing database schema…"
node node_modules/prisma/build/index.js db push --skip-generate

# Seed starter data (idempotent — safe to run on every boot).
if [ "${SEED_ON_START:-true}" = "true" ]; then
  echo "→ Seeding starter data (idempotent)…"
  node prisma/seed.mjs || echo "  (seed skipped)"
fi

echo "→ Starting Fit on :${PORT:-3000}"
exec node server.js
