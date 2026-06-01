#!/bin/bash
# ============================================================
#  deploy.sh — PROQUELEC
#  Push to GitHub + Deploy to VPS (proquelec.sn)
#  INCLUDES: Database sync (Docker → GitHub → VPS)
# ============================================================

SSH_KEY="$HOME/.ssh/gem_vps"
SSH_HOST="root@proquelec.sn"
REMOTE_PATH="/var/www/proquelec/www.proquelec.sn"
GIT_BRANCH="main"

echo ""
echo "  === PROQUELEC DEPLOY ==="
echo ""

# 1. Git status
echo "[1/6] Modifications en cours :"
git status --short
echo ""
read -p "Continuer le déploiement ? (O/n) " confirm
if [ "$confirm" != "" ] && [ "$confirm" != "O" ] && [ "$confirm" != "o" ]; then
    echo "Annulé."
    exit 0
fi

# 2. Commit
echo ""
echo "[2/6] Ajout des fichiers..."
git add -A
read -p "Message de commit : " commit_msg
if [ -z "$commit_msg" ]; then
    commit_msg="Mise à jour $(date +'%Y-%m-%d %H:%M')"
fi

# 3. Push
echo "[3/6] Commit et push vers GitHub..."
git commit -m "$commit_msg"
if ! git push origin "$GIT_BRANCH"; then
    echo "❌ ERREUR: Push échoué"
    exit 1
fi
echo "✅ Push GitHub réussi"
echo ""

# 4. Pull on VPS
echo "[4/6] Mise à jour du code sur le VPS..."
if ! ssh -i "$SSH_KEY" "$SSH_HOST" "cd $REMOTE_PATH && git pull origin $GIT_BRANCH"; then
    echo "❌ ERREUR: Pull VPS échoué"
    exit 1
fi
echo "✅ Code mis à jour"
echo ""

# 5. Option: Sync DB (attention: ecrase les donnees VPS par les donnees locales)
echo "[5/6] Sync DB ?"
read -p "  Importer la DB locale vers le VPS ? (o/N) " sync_db
if [ "$sync_db" = "o" ] || [ "$sync_db" = "O" ]; then
    echo "  Export de la DB locale..."
    node scripts/db-export.cjs
    echo "  Import vers le VPS..."
    ssh -i "$SSH_KEY" "$SSH_HOST" "cd $REMOTE_PATH && node scripts/db-import.cjs"
    echo "  ✅ DB synchronisee (local -> VPS)"
else
    echo "  ⏭️  DB locale ignoree, les donnees VPS sont conservees"
fi
echo ""

echo "[6/6] Build..."
if ! ssh -i "$SSH_KEY" "$SSH_HOST" "cd $REMOTE_PATH && NODE_OPTIONS='--max-old-space-size=4096' npm run build"; then
    echo "❌ ERREUR: Build échoué"
    exit 1
fi
echo "✅ Build réussi"

# Restart PM2
echo "Redémarrage du serveur API..."
ssh -i "$SSH_KEY" "$SSH_HOST" "pm2 restart proquelec-api"

echo ""
echo "============================================"
echo "  ✅ DÉPLOIEMENT TERMINÉ !"
echo "============================================"
echo "  https://www.proquelec.sn"
echo ""
echo "  Pensez à faire Ctrl+Shift+R pour vider le cache"
echo ""
