#!/bin/bash
# Backup script for PROQUELEC deployments
# Creates a timestamped backup of the current state.

set -euo pipefail

BACKUP_DIR="/var/www/proquelec-backups"
SOURCE_DIR="/var/www/proquelec"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_PATH="$BACKUP_DIR/$TIMESTAMP"

echo "📦 Creating backup at $BACKUP_PATH..."

mkdir -p "$BACKUP_PATH"

# Backup build artifacts and node_modules (skip large dirs)
cp -r "$SOURCE_DIR/dist" "$BACKUP_PATH/" 2>/dev/null || echo "  (no dist to backup)"
cp "$SOURCE_DIR/package.json" "$BACKUP_PATH/"
cp "$SOURCE_DIR/package-lock.json" "$BACKUP_PATH/"

# Backup environment config if present
cp "$SOURCE_DIR/.env" "$BACKUP_PATH/" 2>/dev/null || echo "  (no .env to backup)"

# Cleanup old backups (keep last 5)
echo "🧹 Cleaning old backups (keeping last 5)..."
ls -td "$BACKUP_DIR"/*/ 2>/dev/null | tail -n +6 | xargs rm -rf 2>/dev/null || true

echo "✅ Backup created: $BACKUP_PATH"
echo "Total backup size: $(du -sh "$BACKUP_PATH" | cut -f1)"
