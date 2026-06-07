#!/bin/bash
# Post-deployment tasks for PROQUELEC
# Runs on the VPS after code is pulled and built.

set -euo pipefail

echo "🔧 Running post-deployment tasks..."

# 1. Database migrations
echo "📦 Running database migrations..."
npm run migrate:auto || {
  echo "⚠️ Migration failed, attempting rollback..."
  npm run migrate:rollback || true
}

# 2. Cache clearing
echo "🧹 Clearing caches..."
rm -rf .cache/ node_modules/.cache/
pm2 flush proquelec-app || true

# 3. Seed templates if empty
echo "🌱 Checking seed data..."
node scripts/seed-premium-templates.cjs --check || {
  echo "🌱 Seeding premium templates..."
  node scripts/seed-premium-templates.cjs
}

# 4. Verify build
echo "🔍 Verifying build artifacts..."
if [ ! -d "dist" ]; then
  echo "❌ Build directory missing!"
  exit 1
fi

# 5. Health check
echo "🏥 Running health check..."
node scripts/health-check.js http://localhost:5175 30000 3

echo "✅ Post-deployment tasks completed!"
