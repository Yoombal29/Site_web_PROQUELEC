# Site Web Officiel PROQUELEC Sénégal

Infrastructure web souveraine pour la Promotion de la Qualité des Installations Électriques au Sénégal.

## 🏗️ Architecture

- **Frontend**: React + TypeScript + Vite
- **Backend API**: Node / Express + PostgreSQL
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

3. Configurer l'IA cloud
- Activez `PROQUELEC_REMOTE_AI=1`
- Choisissez `PROQUELEC_AI_PROVIDER=openai` ou `anthropic`
- Renseignez `PROQUELEC_API_KEY` (clé API du fournisseur)
- Si vous utilisez un service d'images distant, renseignez `PROQUELEC_REMOTE_IMAGE_API` et `PROQUELEC_IMAGE_API_KEY`

4. Démarrer l'infrastructure Docker
```bash
docker-compose up -d

5. Installer les dépendances frontend
```bash
npm install
```

6. Démarrer le serveur de développement
```bash
npm run dev
```

Le site sera accessible sur `http://localhost:5175`

### ✅ Valider la Configuration IA

Après configuration, validez les endpoints distants:

```bash
# Valider tous les endpoints
node test_ai_endpoints.js

# Avec détails verbeux
node test_ai_endpoints.js --verbose
```

## 📖 Configuration Détaillée

Pour la configuration complète des fournisseurs IA distants, voir **[AI_PROVIDER_CONFIG.md](AI_PROVIDER_CONFIG.md)**

### Inventaire Complet des Endpoints IA

Pour une vue détaillée de **tous les endpoints IA** avec modèles utilisés, payloads et exemples:
→ **[ENDPOINTS_IA_INVENTORY.md](ENDPOINTS_IA_INVENTORY.md)**

### Résumé Rapide

| Variable | Description | Exemple |
|----------|-------------|----------|
| `PROQUELEC_REMOTE_AI` | Activer IA distante | `1` ou `true` |
| `PROQUELEC_AI_PROVIDER` | Fournisseur (openai/anthropic/custom) | `openai` |
| `PROQUELEC_API_KEY` | Clé API du fournisseur | `sk-proj-...` |
| `PROQUELEC_AI_MODEL` | Modèle à utiliser (optionnel) | `gpt-4o` |
| `PROQUELEC_REMOTE_IMAGE_API` | URL service images (optionnel) | `https://api.openai.com/v1/images/...` |
| `PROQUELEC_IMAGE_API_KEY` | Clé API images (optionnel) | `sk-proj-...` |

### Endpoints Principaux (Quick Reference)

| Endpoint | Modèle Cloud | Modèle Local | Timeout |
|----------|---|---|---|
| `/api/ai/chat` | GPT-4o | Phi-3.5 | 90s |
| `/api/ai/vision` | GPT-4o Vision | Moondream2 | 30s |
| `/api/ai/image` | DALL-E 3 | SDXL 1.0 | 120s |
| `/api/ai/content-generation` | GPT-4o | Phi-3.5 | 90s |
| `/api/ai/status` | Diagnostic | Diagnostic | 5s |


## 📦 Services Docker

- **PostgreSQL**: Port 5436 (interne 5432)
- **Backend API**: Port 3000
- **Cortex Brain (IA)**: Port 8000
- **Cortex Vision (IA)**: Port 8003
- **Cortex Image (IA)**: Port 8004
- **Frontend Dev**: Port 5175

## 🤖 Endpoints IA Disponibles

### Chat / Conversations
```
POST /api/ai/chat
Content-Type: application/json
Authorization: Bearer <token>

{
  "messages": [{"role":"user","content":"Question?"}],
  "max_tokens": 1024,
  "temperature": 0.2
}
```

### Génération d'Images
```
POST /api/ai/image
Content-Type: application/json

{
  "prompt": "Description de l'image",
  "size": "1024x1024",
  "n": 1
}
```

### Analyse d'Images
```
POST /api/ai/vision
Content-Type: multipart/form-data

file: [image]
prompt: "Description de ce qu'il faut analyser"
```

### Génération de Contenu
```
POST /api/ai/content-generation
Content-Type: application/json

{
  "prompt": "Contenu à générer",
  "system_prompt": "Instructions spécifiques",
  "max_tokens": 2048
}
```

### Statut des Services
```
GET /api/ai/status
Authorization: Bearer <token>
```

Retourne le statut de tous les services IA configurés.

## 🐛 Dépannage

### Configuration IA ne fonctionne pas

**Vérifier:**
1. `PROQUELEC_REMOTE_AI=1` est activé dans `.env`
2. `PROQUELEC_API_KEY` est valide
3. Le fournisseur (`openai`, `anthropic`, etc.) est configuré
4. Relancer le serveur Node après modification de `.env`

**Tester:**
```bash
node test_ai_endpoints.js --verbose
```

### Erreur: "Invalid API Key"

- Vérifier la clé sur le dashboard du fournisseur
- Vérifier que la clé n'est pas expirée
- S'assurer qu'il n'y a pas d'espaces au début/fin

### Erreur: "Remote AI indisponible"

- Vérifier la connectivité internet
- Vérifier que l'URL du fournisseur est accessible
- Vérifier les logs du serveur Node: `server/index.js`

### Vision/Images ne fonctionne pas

- Vérifier que `PROQUELEC_REMOTE_IMAGE_API` est configurée
- Pour vision: s'assurer que l'image est uploadée correctement (multipart/form-data)
- Vérifier `PROQUELEC_IMAGE_API_KEY` est valide

### Le chat répond mais vision échoue

- Les services chat et vision peuvent avoir des APIs différentes
- Vérifier que `PROQUELEC_REMOTE_VISION_API` est correctement configurée
- Si non définie, le système utilise `PROQUELEC_REMOTE_IMAGE_API`

## 📙 Ressources Complètes

### Documentation IA & Endpoints

- **Inventaire Complet Endpoints IA** (avec modèles):
  → [ENDPOINTS_IA_INVENTORY.md](ENDPOINTS_IA_INVENTORY.md) - Détail de tous les endpoints, payloads, modèles

- **Mapping Visuel Composants ↔ Endpoints**:
  → [ENDPOINTS_MAPPING.md](ENDPOINTS_MAPPING.md) - Qui utilise quoi, flux complets, configuration

- **Configuration des Fournisseurs IA**:
  → [AI_PROVIDER_CONFIG.md](AI_PROVIDER_CONFIG.md) - Variables d'env, formats, dépannage

### Validation & Tests

- **Script de Test**: `test_ai_endpoints.js`
  ```bash
  node test_ai_endpoints.js --verbose
  ```

### Ressources Externes

- **OpenAI Docs**: https://platform.openai.com/docs
- **Anthropic Docs**: https://docs.anthropic.com
- **Haystack Docs**: https://haystack.deepset.ai

Les migrations SQL sont dans `corpus-db/migrations/` et s'exécutent automatiquement au premier démarrage.

## 💳 Configuration des Paiements

Le système supporte **13 providers** de paiement, gérables depuis l'interface Admin → Paiements.

### Providers disponibles

| Provider | Type | Frais | Reversement |
|----------|------|-------|-------------|
| Wave Business | Opérateur Direct | 1% | Immédiat |
| Orange Money Web | Opérateur Direct | 1% (plaf. 500 F) | 24h-48h |
| Free Money | Opérateur Direct | 1% à 1,5% | 24h-48h |
| PayTech | Agrégateur Local | 1,5% à 3% | 24h-72h |
| SenePay | Agrégateur Local | 1,8% + frais op. | 24h-48h |
| InTouch (TouchPay) | Agrégateur Local | 2% à 3,5% | 48h-72h |
| CinetPay | Panafricain | 1,5% à 3,5% | 72h |
| Flutterwave | Panafricain/Global | 2,9% à 3,8% | 48h-72h |
| FedaPay | Panafricain | 1% à 4% | 72h |
| Kkiapay | Panafricain | 2,5% à 3,5% | 48h |
| Julaya (B2B) | Panafricain B2B | Sur mesure | Immédiat |
| PayDunya | Agrégateur Local | Variable | 48h-72h |
| 💰 Espèces | Hors-ligne | 0% | Immédiat |

### Configuration rapide

1. Allez dans **Dashboard → Admin → Paiements**
2. Activez les providers souhaités (curseur)
3. Cliquez sur le **❓** pour voir le guide de configuration
4. Entrez vos clés API et cliquez sur **Test**
5. Sélectionnez le provider par défaut avec **⭐ Défaut**

### Variables d'environnement

```env
# PayDunya (activé par défaut)
PAYDUNYA_API_KEY=votre_cle_api
PAYDUNYA_SECRET_KEY=votre_cle_secrete

# Wave Business
WAVE_API_KEY=wave_live_xxx
WAVE_SECRET_KEY=xxx

# Orange Money Web
ORANGE_CLIENT_ID=orange_client_xxx
ORANGE_CLIENT_SECRET=xxx
ORANGE_MERCHANT_CODE=OM_MERCHANT_xxx

# Free Money
FREE_API_KEY=free_live_xxx
FREE_MERCHANT_ID=FREE_xxx

# PayTech
PAYTECH_API_KEY=paytech_live_xxx
PAYTECH_SECRET_KEY=xxx

# CinetPay (panafricain)
CINETPAY_API_KEY=cp_live_xxx
CINETPAY_SITE_ID=CP_SITE_xxx

# Flutterwave (global)
FW_SECRET_KEY=FLWSECK_xxx
```

### Initialisation

```bash
# Initialiser les paramètres de paiement en base
node scripts/seed-payment-settings.cjs
```

### Architecture technique

```
Frontend (AdminPaymentPanel.tsx)
  ↓ fetch /api/admin/payment-settings
Express (payments.admin.routes.js)
  ↓
Provider Registry (providers/index.js)
  ↓ auto-découverte
12 providers .service.js + Cash
  ↓ interface unifiée
processPayment() / verifyPayment() / handleWebhook()
```

Tous les providers partagent la même interface. La commutation se fait par le champ `provider` dans la table `orders`.

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
