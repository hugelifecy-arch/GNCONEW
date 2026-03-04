#!/bin/bash
# Database setup script for GNCO Platform
# Run this after configuring DATABASE_URL in .env.local

set -e

echo "=== GNCO Database Setup ==="
echo ""

# Check if DATABASE_URL is set
if [ -z "$DATABASE_URL" ]; then
  if [ -f .env.local ]; then
    export $(grep -v '^#' .env.local | grep DATABASE_URL | xargs)
  fi
fi

if [ -z "$DATABASE_URL" ]; then
  echo "ERROR: DATABASE_URL is not set."
  echo "Please set DATABASE_URL in your .env.local file or environment."
  echo ""
  echo "Example for Neon:     postgresql://user:pass@ep-xxx.us-east-2.aws.neon.tech/gnco?sslmode=require"
  echo "Example for Supabase: postgresql://postgres:pass@db.xxx.supabase.co:5432/postgres"
  exit 1
fi

echo "1. Generating Prisma client..."
npx prisma generate

echo ""
echo "2. Running database migrations..."
npx prisma migrate dev --name init

echo ""
echo "3. Validating schema..."
npx prisma validate

echo ""
echo "=== Database setup complete ==="
echo "You can now run 'npm run dev' to start the platform with a live database."
