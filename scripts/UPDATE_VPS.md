# === MISE À JOUR VPS PROQUELEC ===
# À exécuter sur le VPS via SSH

# 1. Se connecter au VPS
# ssh user@ton-vps

# 2. Aller dans le projet
cd /chemin/vers/Site_web_PROQUELEC

# 3. Sauvegarder la base de données existante
pg_dump -U postgres -d proquelec > backup_$(date +%Y%m%d_%H%M%S).sql

# 4. Pull les dernières modifications
git pull origin chore/remove-unused-docker-services

# 5. Régénérer le cache RAG (embeddings)
cd server/knowledge_base
# Supprimer l'ancien cache s'il existe
rm -f .chunks_cache.json
# Générer les chunks depuis les fichiers sources
cd ../..
npm run sync:docs  # Synchroniser les documents

# 6. Lancer les migrations base de données
# Les tables sont créées automatiquement au démarrage du serveur
# (ai_config, colonnes billing_mode/credits, permissions)

# 7. Démarrer le serveur
docker compose up -d db-1  # Démarrer PostgreSQL
npm run migrate:auto       # Migrations automatiques
node server/index.js       # Démarrer le backend

# 8. Démarrer Vite (frontend)
npm run dev                # Mode développement
# OU
npm run build && npm run preview  # Mode production
