#!/bin/bash
# ============================================================
#  deploy.sh — PROQUELEC
#  1. Backup DB du VPS → GitHub
#  2. Push code local → GitHub
#  3. Build sur le VPS
# ============================================================

SSH_KEY="$HOME/.ssh/gem_vps"
SSH_HOST="root@proquelec.sn"
REMOTE_PATH="/var/www/proquelec/www.proquelec.sn"
GIT_BRANCH="main"

echo ""
echo "  === PROQUELEC DEPLOY ==="
echo "  VPS → GitHub → VPS (boucle securisee)"
echo ""

# 1. Backup DB du VPS (les donnees VPS sont la reference)
echo "[1/5] Backup des donnees du VPS..."
ssh -i "$SSH_KEY" "$SSH_HOST" "cd $REMOTE_PATH && node scripts/db-export.cjs"
# Copier les fichiers exportes du VPS vers le local
mkdir -p db
scp -i "$SSH_KEY" "$SSH_HOST":"$REMOTE_PATH/db/*.json" db/
echo "✅ DB du VPS sauvegardee dans db/"
echo ""

# 2. Git status
echo "[2/5] Modifications en cours :"
git status --short
echo ""
read -p "Continuer le déploiement ? (O/n) " confirm
if [ "$confirm" != "" ] && [ "$confirm" != "O" ] && [ "$confirm" != "o" ]; then
    echo "Annulé."
    exit 0
fi

# 3. Commit + Push
echo ""
echo "[3/5] Ajout des fichiers (code + DB)..."
git add -A
read -p "Message de commit : " commit_msg
if [ -z "$commit_msg" ]; then
    commit_msg="Mise à jour $(date +'%Y-%m-%d %H:%M')"
fi

echo "Commit et push vers GitHub..."
git commit -m "$commit_msg"
if ! git push origin "$GIT_BRANCH"; then
    echo "❌ ERREUR: Push échoué"
    exit 1
fi
echo "✅ Push GitHub réussi"
echo ""

# 4. Pull sur le VPS
echo "[4/5] Pull code sur le VPS..."
if ! ssh -i "$SSH_KEY" "$SSH_HOST" "cd $REMOTE_PATH && git pull origin $GIT_BRANCH"; then
    echo "❌ ERREUR: Pull VPS échoué"
    exit 1
fi
echo "✅ Code mis à jour sur le VPS"
echo ""

# 5. Build + Restart
echo "[5/5] Build..."
if ! ssh -i "$SSH_KEY" "$SSH_HOST" "cd $REMOTE_PATH && NODE_OPTIONS='--max-old-space-size=4096' npm run build"; then
    echo "❌ ERREUR: Build échoué"
    exit 1
fi
echo "✅ Build réussi"

echo "Redémarrage du serveur API..."
ssh -i "$SSH_KEY" "$SSH_HOST" "pm2 restart proquelec-api"

echo ""
echo "============================================"
echo "  ✅ DÉPLOIEMENT TERMINÉ !"
echo "============================================"
echo "  https://www.proquelec.sn"
echo ""
echo "  Données VPS backupées sur GitHub"
echo "  Les modifications faites via le builder sont conservees"
echo ""
