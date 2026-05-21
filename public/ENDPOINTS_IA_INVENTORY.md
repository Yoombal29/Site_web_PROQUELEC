# Inventaire Complet des Endpoints IA - PROQUELEC

## Vue d'ensemble des Services IA

Ce document liste **tous les endpoints IA** du système PROQUELEC avec:
- URL de l'endpoint
- Type de requête (POST/GET)
- Modèle IA utilisé
- Configuration requise
- Exemple de payload

---

## 📋 Tableau Récapitulatif

| Endpoint | Méthode | Modèle IA | Type | Status |
|----------|---------|-----------|------|--------|
| `/api/ai/chat` | POST | GPT-4o / Claude 3.5 / Phi-3.5 | Conversations | ✅ Actif |
| `/api/ai/vision` | POST | Moondream / Claude Vision | Analyse images | ✅ Actif |
| `/api/ai/image` | POST | DALL-E 3 / SDXL | Génération images | ✅ Actif |
| `/api/ai/content-generation` | POST | GPT-4o / Claude 3.5 | Contenu texte | ✅ Actif |
| `/api/ai/generate-visual` | POST | DALL-E 3 / SDXL | Génération images | ✅ Actif |
| `/api/ai/status` | GET | N/A (Diagnostic) | Monitoring | ✅ Actif |
| `/api/ai/orchestrate` | POST | Multiple (Routing) | Orchestration | ✅ Actif |
| `/api/ai/ping-provider` | POST | Test de connectivité | Validation | ✅ Actif |
| `/api/ai/diagnostic` | POST | Audit système | Diagnostique | ✅ Actif |
| `/api/ai/scan-compliance` | POST | Analyse conformité | Vérification | ✅ Actif |
| `/api/ai/logs` | GET | N/A (Logs) | Audit | ✅ Actif |
| `/api/ai/seo-analyze` | POST | GPT-4o / Claude 3.5 | SEO Expert | ✅ Actif |

---

## 🎯 Endpoints Principaux (Production)

### 1. **Chat / Conversations** (/api/ai/chat)

**URL:** `POST /api/ai/chat`

**Modèle IA Utilisé:**
- **Mode Cloud (Recommandé):** 
  - OpenAI: `gpt-4o` (par défaut)
  - Anthropic: `claude-3.5-sonnet`
  - Custom: selon configuration
- **Mode Local:** `Phi-3.5-mini-instruct` (haystack_backend port 8002)

**Configuration Requise:**
```bash
# Mode Cloud
PROQUELEC_REMOTE_AI=1
PROQUELEC_AI_PROVIDER=openai  # ou anthropic
PROQUELEC_API_KEY=sk-proj-xxxxxxxxxxxxx
PROQUELEC_AI_MODEL=gpt-4o  # optionnel, défaut = gpt-4o

# Mode Local
PROQUELEC_REMOTE_AI=0
AI_BRAIN_URL=http://localhost:8002
```

**Payload Requis:**
```json
{
  "messages": [
    {
      "role": "system",
      "content": "Tu es un expert en électricité au Sénégal."
    },
    {
      "role": "user",
      "content": "Quelle est la meilleure pratique de mise à la terre?"
    }
  ],
  "max_tokens": 1024,
  "temperature": 0.5,
  "model": "gpt-4o"
}
```

**Réponse Attendue:**
```json
{
  "id": "chatcmpl-abc123",
  "object": "chat.completion",
  "model": "gpt-4o",
  "choices": [
    {
      "index": 0,
      "message": {
        "role": "assistant",
        "content": "La meilleure pratique est..."
      },
      "finish_reason": "stop"
    }
  ],
  "usage": {
    "prompt_tokens": 30,
    "completion_tokens": 150,
    "total_tokens": 180
  }
}
```

**Status:** ✅ Production | Timeout: 90s

---

### 2. **Analyse d'Images** (/api/ai/vision)

**URL:** `POST /api/ai/vision` (multipart/form-data)

**Modèle IA Utilisé:**
- **Mode Cloud:**
  - OpenAI: `gpt-4-vision` / `gpt-4o`
  - Anthropic: `claude-3.5-sonnet` (avec vision)
  - Custom: selon l'API
- **Mode Local:** `Moondream2` (port 8003)

**Configuration Requise:**
```bash
# Mode Cloud
PROQUELEC_REMOTE_VISION_API=https://api.openai.com/v1/vision/analyze
PROQUELEC_IMAGE_API_KEY=sk-proj-xxxxxxxxxxxxx

# Mode Local
PROQUELEC_REMOTE_AI=0
AI_VISION_URL=http://localhost:8003
```

**Payload Requis:**
```
POST /api/ai/vision
Content-Type: multipart/form-data

Fields:
- image (FILE) : fichier image (JPG, PNG, WebP)
- prompt (TEXT) : question sur l'image (ex: "Identifie les problèmes électriques")
```

**Réponse Attendue:**
```json
{
  "success": true,
  "analysis": "Détection de câbles non conformes à la norme NS 01-001...",
  "labels": ["câbles", "non-conformité", "risque-incendie"],
  "confidence": 0.92,
  "metadata": {
    "width": 1920,
    "height": 1080,
    "format": "jpg",
    "processing_time_ms": 2500
  }
}
```

**Status:** ✅ Production | Timeout: 30s

---

### 3. **Génération d'Images** (/api/ai/image)

**URL:** `POST /api/ai/image`

**Modèle IA Utilisé:**
- **Mode Cloud:**
  - OpenAI: `DALL-E 3` (par défaut)
  - Anthropic: N/A (utilise DALL-E via proxy)
  - Custom: SDXL compatible
- **Mode Local:** `SDXL 1.0` (port 8004)

**Configuration Requise:**
```bash
# Mode Cloud
PROQUELEC_REMOTE_IMAGE_API=https://api.openai.com/v1/images/generations
PROQUELEC_IMAGE_API_KEY=sk-proj-xxxxxxxxxxxxx

# Mode Local
PROQUELEC_REMOTE_AI=0
AI_IMAGE_URL=http://localhost:8004
```

**Payload Requis:**
```json
{
  "prompt": "Une installation électrique moderne conforme NS 01-001, photo réaliste",
  "size": "1024x1024",
  "quality": "hd",
  "n": 1
}
```

**Réponse Attendue:**
```json
{
  "created": 1620000000,
  "data": [
    {
      "url": "https://oaidalleapiprodscus.blob.core.windows.net/...",
      "revised_prompt": "Une installation électrique moderne et conforme..."
    }
  ]
}
```

**Status:** ✅ Production | Timeout: 120s

---

### 4. **Génération de Contenu** (/api/ai/content-generation)

**URL:** `POST /api/ai/content-generation`

**Modèle IA Utilisé:**
- **Mode Cloud:**
  - OpenAI: `gpt-4o` (par défaut)
  - Anthropic: `claude-3.5-sonnet`
- **Mode Local:** `Phi-3.5-mini-instruct` (port 8002)

**Configuration Requise:**
```bash
# Mode Cloud
PROQUELEC_REMOTE_AI=1
PROQUELEC_AI_PROVIDER=openai
PROQUELEC_API_KEY=sk-proj-xxxxxxxxxxxxx

# Mode Local
PROQUELEC_REMOTE_AI=0
AI_BRAIN_URL=http://localhost:8002
```

**Payload Requis:**
```json
{
  "prompt": "Génère un guide de maintenance électrique pour installations résidentielles",
  "system_prompt": "Tu es un expert en normes électriques au Sénégal (NS 01-001)",
  "max_tokens": 2000,
  "temperature": 0.7
}
```

**Réponse Attendue:**
```json
{
  "content": "# Guide de Maintenance Électrique...",
  "model": "gpt-4o",
  "usage": {
    "prompt_tokens": 50,
    "completion_tokens": 1500,
    "total_tokens": 1550
  }
}
```

**Status:** ✅ Production | Timeout: 90s

---

## 📊 Endpoints de Monitoring/Admin

### 5. **Statut des Services** (/api/ai/status)

**URL:** `GET /api/ai/status`

**Modèle:** N/A (Diagnostic système)

**Réponse:**
```json
[
  {
    "service": "Cerveau Expert (GPT-4o)",
    "key": "brain",
    "status": "online",
    "url": "remote:openai"
  },
  {
    "service": "Vision Remote",
    "key": "vision",
    "status": "online",
    "url": "https://api.openai.com/v1/vision"
  },
  {
    "service": "Générateur Image Remote",
    "key": "image",
    "status": "online",
    "url": "https://api.openai.com/v1/images"
  }
]
```

---

### 6. **Diagnostic Profond** (/api/ai/diagnostic)

**URL:** `POST /api/ai/diagnostic`

**Modèle:** Audit auto-diagnostique

**Payload:**
```json
{
  "providerId": "openai",
  "apiKey": "sk-proj-xxx"
}
```

**Réponse:**
```json
{
  "success": true,
  "diagnostics": {
    "overallGrade": "A",
    "performance": {
      "tps": 45.2,
      "ttft": 250
    },
    "network": {
      "status": "CONNECTED",
      "latency": 85
    }
  }
}
```

---

### 7. **SEO Analyzer** (/api/ai/seo-analyze)

**URL:** `POST /api/ai/seo-analyze`

**Modèle IA:** `gpt-4o` / `claude-3.5-sonnet`

**Payload:**
```json
{
  "content": "Contenu de la page à analyser...",
  "url": "https://proquelec.sn/page"
}
```

**Réponse:**
```json
{
  "seo_analysis": {
    "keywords": ["électricité", "normes", "sécurité"],
    "readability_score": 85,
    "recommendations": [...]
  }
}
```

---

## 🔄 Routing Automatique

### **Endpoint d'Orchestration** (/api/ai/orchestrate)

L'endpoint `/api/ai/orchestrate` décide automatiquement quel modèle utiliser selon:
- Type de requête (chat, image, vision)
- Configuration système (local/cloud)
- Disponibilité du service
- Performance/latence

```
Request → Orchestrate → Cloud (si actif) → Local (fallback)
```

---

## 📈 Matrice de Correspondance

| Task | Endpoint Cloud | Endpoint Local | Modèle Cloud | Modèle Local |
|------|---|---|---|---|
| Chat | `/api/ai/chat` | `/api/ai/chat` | GPT-4o | Phi-3.5 |
| Vision | `/api/ai/vision` | `/api/ai/vision` | GPT-4o Vision | Moondream2 |
| Image | `/api/ai/image` | `/api/ai/image` | DALL-E 3 | SDXL 1.0 |
| Contenu | `/api/ai/content-generation` | `/api/ai/content-generation` | GPT-4o | Phi-3.5 |

---

## ✅ Checklist de Validation

Pour chaque endpoint, vérifier:

- [ ] Modèle IA spécifié dans la configuration
- [ ] Variable d'environnement correcte (voir `.env.example`)
- [ ] Timeout approprié
- [ ] Format de réponse validé
- [ ] Authentification si requise
- [ ] Logs disponibles pour debug

---

## 🚀 Tests Automatisés

Utiliser le script de validation:

```bash
node test_ai_endpoints.js --verbose
```

Cela testera automatiquement:
1. Configuration des variables
2. Connectivité à chaque endpoint
3. Format des réponses
4. Statut global du système

---

## 📞 Support

Pour des questions ou problèmes:
- Documentation: Voir `AI_PROVIDER_CONFIG.md`
- Tests: Exécuter `test_ai_endpoints.js`
- Logs: Vérifier `server/index.js` pour [AI-GATEWAY]
