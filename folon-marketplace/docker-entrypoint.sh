#!/bin/sh
set -e

echo "Waiting for PostgreSQL..."
until nc -z folon-db 5432; do
  echo "  postgres not ready — sleeping 1s"
  sleep 1
done
echo "PostgreSQL ready."

echo "Generating Prisma client..."
npx prisma generate

echo "Running migrations..."
npx prisma migrate deploy

echo "Seeding admin user..."
npx tsx scripts/seed-admin.ts

if [ "$NODE_ENV" = "development" ]; then
  echo "Starting Next.js dev server..."
  exec npm run dev
else
  echo "Starting Next.js server..."
  exec npm start
fi
