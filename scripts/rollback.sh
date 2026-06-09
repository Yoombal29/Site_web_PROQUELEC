#!/bin/bash
# Rollback script for PROQUELEC
# Reverts to the previous deployment.

set -euo pipefail

echo "⏪ Rolling back to previous deployment..."

BACKUP_DIR="/var/www/proquelec-backups"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

# Find the most recent backup
LATEST_BACKUP=$(ls -td "$BACKUP_DIR"/*/ 2>/dev/null | head -1)

if [ -z "$LATEST_BACKUP" ]; then
  echo "❌ No backup found at $BACKUP_DIR"
  exit 1
fi

echo "📂 Restoring from: $LATEST_BACKUP"

# Restore application
cp -r "$LATEST_BACKUP/dist" /var/www/proquelec/
cp "$LATEST_BACKUP/node_modules" /var/www/proquelec/ 2>/dev/null || true

# Restart services
pm2 restart proquelec-app --update-env

# Health check
node /var/www/proquelec/scripts/health-check.js

echo "✅ Rollback completed successfully!"
