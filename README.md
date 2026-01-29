# Site Web Officiel PROQUELEC Sénégal

Infrastructure web souveraine pour la Promotion de la Qualité des Installations Électriques au Sénégal.

## 🏗️ Architecture

- **Frontend**: React + TypeScript + Vite
- **Backend API**: PostgREST (API REST auto-générée depuis PostgreSQL)
- **Base de données**: PostgreSQL 15
- **Gateway**: Nginx (reverse proxy avec CORS)
- **Containerisation**: Docker Compose

## 🚀 Démarrage rapide

### Prérequis

- Docker & Docker Compose
- Node.js 18+ (pour le développement frontend)
- Git

### Installation

1. Cloner le repository
```bash
git clone https://github.com/Yoombal29/Site_web_PROQUELEC.git
cd Site_web_PROQUELEC
```

2. Copier le fichier d'environnement
```bash
cp .env.example .env
# Éditer .env avec vos clés API
```

3. Démarrer l'infrastructure Docker
```bash
cd docker
docker-compose up -d
```

4. Installer les dépendances frontend
```bash
npm install
```

5. Démarrer le serveur de développement
```bash
npm run dev
```

Le site sera accessible sur `http://localhost:8080`

## 📦 Services Docker

- **PostgreSQL**: Port 5433
- **PostgREST API**: Port 3000 (interne)
- **Nginx Gateway**: Port 3102
- **Frontend Dev**: Port 8080

## 🔧 Configuration

### Variables d'environnement

Voir `.env.example` pour la liste complète des variables requises.

### Base de données

Les migrations SQL sont dans `docker/postgres/init/` et s'exécutent automatiquement au premier démarrage.

## 📚 Documentation

- Architecture technique: voir `lot_5_6_atomization_review.md`
- Rapport de complétion: voir `completion_report.md`

## 🔒 Sécurité

- Pas de secrets en clair dans le code
- CORS configuré pour le développement local
- JWT pour l'authentification API

## 📄 Licence

Projet propriétaire - PROQUELEC Sénégal

## 🤝 Contribution

Contact: contact@proquelec.sn
