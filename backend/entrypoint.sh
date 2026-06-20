#!/bin/sh
set -e

echo "Waiting for PostgreSQL to be ready..."
until nc -z postgres 5432; do
  echo "  postgres not ready — sleeping 1s"
  sleep 1
done
echo "PostgreSQL is ready."

if [ "$NODE_ENV" = "development" ]; then
  echo "Running migrations (dev)..."
  npx ts-node scripts/migrate.ts
  echo "Starting dev server..."
  exec npx ts-node-dev --respawn --transpile-only src/index.ts
else
  echo "Running migrations (prod)..."
  node dist/scripts/migrate.js
  echo "Starting server..."
  exec node dist/src/index.js
fi
