# Configuration des Fournisseurs IA Distants

## Vue d'ensemble

Ce document détaille la configuration, la validation et les formats attendus pour les fournisseurs d'IA distants.

## Variables d'Environnement Requises

### 1. Configuration Générale

```bash
# Activer le mode IA distant (0/1, true/false)
PROQUELEC_REMOTE_AI=1

# Fournisseur IA (openai, anthropic, custom)
PROQUELEC_AI_PROVIDER=openai

# Clé API du fournisseur IA
PROQUELEC_API_KEY=sk-proj-xxxxxxxxxxxxx

# URL personnalisée (optionnel, pour les APIs custom)
PROQUELEC_AI_API_URL=https://api.example.com/v1/completions

# Modèle IA à utiliser (par défaut: gpt-4o pour OpenAI, claude-3.5 pour Anthropic)
PROQUELEC_AI_MODEL=gpt-4o
```

### 2. Configuration des Services Vision et Images

```bash
# URL du service d'images/vision distant
PROQUELEC_REMOTE_IMAGE_API=https://api.example.com/generate-image
PROQUELEC_REMOTE_VISION_API=https://api.example.com/analyze-image

# Clé API pour les services d'images
PROQUELEC_IMAGE_API_KEY=image_api_key_xxxxx
```

## Formats des Endpoints

### 1. `/api/ai/chat` (LLM - Conversations)

**Requête:**
```json
{
  "messages": [
    { "role": "system", "content": "Tu es un assistant utile." },
    { "role": "user", "content": "Bonjour!" }
  ],
  "prompt": "Optional si pas de messages",
  "system_prompt": "Optional système directive",
  "model": "gpt-4o",
  "max_tokens": 1024,
  "temperature": 0.2
}
```

**Réponse (OpenAI):**
```json
{
  "id": "chatcmpl-abc123",
  "object": "chat.completion",
  "created": 1620000000,
  "model": "gpt-4o",
  "choices": [
    {
      "index": 0,
      "message": {
        "role": "assistant",
        "content": "Bonjour! Comment puis-je vous aider?"
      },
      "finish_reason": "stop"
    }
  ],
  "usage": {
    "prompt_tokens": 10,
    "completion_tokens": 15,
    "total_tokens": 25
  }
}
```

**Réponse (Anthropic):**
```json
{
  "id": "msg_abc123",
  "type": "message",
  "role": "assistant",
  "content": [
    {
      "type": "text",
      "text": "Bonjour! Comment puis-je vous aider?"
    }
  ],
  "model": "claude-3.5",
  "stop_reason": "end_turn",
  "usage": {
    "input_tokens": 10,
    "output_tokens": 15
  }
}
```

### 2. `/api/ai/vision` (Analyse d'images)

**Requête (multipart/form-data):**
```
POST /api/ai/vision
Content-Type: multipart/form-data

file: [binary image data]
prompt: "Décris cette image"
```

**Réponse attendue:**
```json
{
  "success": true,
  "analysis": "Description détaillée de l'image...",
  "labels": ["étiquette1", "étiquette2"],
  "confidence": 0.95,
  "metadata": {
    "width": 1920,
    "height": 1080,
    "format": "jpg"
  }
}
```

### 3. `/api/ai/image` (Génération d'images)

**Requête:**
```json
{
  "prompt": "Une maison électrique moderne au Sénégal",
  "size": "1024x1024",
  "quality": "hd",
  "n": 1
}
```

**Réponse (OpenAI DALL-E):**
```json
{
  "created": 1620000000,
  "data": [
    {
      "url": "https://oaidalleapiprodscus.blob.core.windows.net/...",
      "revised_prompt": "Une maison électrique moderne..."
    }
  ]
}
```

### 4. `/api/ai/content-generation` (Génération de contenu)

**Requête:**
```json
{
  "prompt": "Génère un article sur la sécurité électrique",
  "system_prompt": "Tu es expert en électricité au Sénégal",
  "messages": [],
  "model": "gpt-4o",
  "max_tokens": 2048,
  "temperature": 0.7
}
```

**Réponse:**
```json
{
  "id": "chatcmpl-xyz789",
  "content": "Article détaillé sur la sécurité électrique...",
  "model": "gpt-4o",
  "usage": {
    "prompt_tokens": 50,
    "completion_tokens": 500,
    "total_tokens": 550
  }
}
```

## Configuration par Fournisseur

### OpenAI (Recommandé)

**Endpoint:** `https://api.openai.com/v1/chat/completions`

**Variables d'environnement:**
```bash
PROQUELEC_REMOTE_AI=1
PROQUELEC_AI_PROVIDER=openai
PROQUELEC_API_KEY=sk-proj-xxxxxxxxxxxxx  # Voir https://platform.openai.com/account/api-keys
PROQUELEC_AI_MODEL=gpt-4o
```

**Image/Vision:**
```bash
PROQUELEC_REMOTE_IMAGE_API=https://api.openai.com/v1/images/generations
PROQUELEC_IMAGE_API_KEY=sk-proj-xxxxxxxxxxxxx
```

### Anthropic Claude

**Endpoint:** `https://api.anthropic.com/v1/complete`

**Variables d'environnement:**
```bash
PROQUELEC_REMOTE_AI=1
PROQUELEC_AI_PROVIDER=anthropic
PROQUELEC_API_KEY=sk-ant-xxxxxxxxxxxxx  # Voir https://console.anthropic.com
PROQUELEC_AI_MODEL=claude-3.5
```

### API Personnalisée (Custom)

**Endpoint:** N'importe quel service compatible OpenAI/Claude

**Variables d'environnement:**
```bash
PROQUELEC_REMOTE_AI=1
PROQUELEC_AI_PROVIDER=custom
PROQUELEC_AI_API_URL=https://votre-api.com/v1/chat/completions
PROQUELEC_API_KEY=your_api_key_here
```

**Format attendu:** Compatible OpenAI (même schéma que OpenAI `/v1/chat/completions`)

## Script de Validation

Créez `test_ai_config.sh` pour valider la configuration:

```bash
#!/bin/bash

echo "=== Validation Configuration IA Distante ==="
echo ""

# Vérifier les variables requises
check_env() {
    if [ -z "${!1}" ]; then
        echo "❌ $1 non définie"
        return 1
    else
        echo "✅ $1 = ${!1:0:20}..."
        return 0
    fi
}

echo "1️⃣ Variables Globales:"
check_env PROQUELEC_REMOTE_AI
check_env PROQUELEC_AI_PROVIDER
check_env PROQUELEC_API_KEY

echo ""
echo "2️⃣ Services Optionnels:"
check_env PROQUELEC_REMOTE_IMAGE_API
check_env PROQUELEC_IMAGE_API_KEY

echo ""
echo "3️⃣ Test de Connexion aux Endpoints:"

# Test Chat
echo "   Testing /api/ai/chat..."
curl -s -X POST http://localhost:3000/api/ai/chat \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -d '{
    "messages": [{"role":"user","content":"Test"}],
    "max_tokens": 10
  }' | jq . || echo "❌ Chat endpoint failed"

# Test Vision
echo "   Testing /api/ai/vision..."
# Nécessite une image

# Test Image
echo "   Testing /api/ai/image..."
curl -s -X POST http://localhost:3000/api/ai/image \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -d '{
    "prompt": "test",
    "n": 1
  }' | jq . || echo "❌ Image endpoint failed"

echo ""
echo "=== Validation Complète ==="
```

## Checklist de Configuration

- [ ] `PROQUELEC_REMOTE_AI=1` activé
- [ ] `PROQUELEC_AI_PROVIDER` défini (openai/anthropic/custom)
- [ ] `PROQUELEC_API_KEY` valide et testée
- [ ] Pour images: `PROQUELEC_REMOTE_IMAGE_API` et `PROQUELEC_IMAGE_API_KEY` configurés
- [ ] Tester `/api/ai/chat` avec un message simple
- [ ] Tester `/api/ai/image` avec un prompt simple
- [ ] Vérifier les logs dans `server/index.js` pour les erreurs
- [ ] Valider les réponses en JSON
- [ ] Tester les timeouts (90s pour chat, 120s pour images)

## Dépannage

### Erreur: "PROQUELEC_API_KEY requis"
- Vérifier que la clé API est définie dans `.env`
- Relancer le serveur Node après modification

### Erreur: "Invalid API Key"
- Vérifier la clé sur le dashboard du fournisseur
- S'assurer que la clé n'est pas expirée

### Endpoint retourne 502 Bad Gateway
- Vérifier la connectivité vers l'API distante
- Vérifier les logs du serveur Node pour les détails

### Vision ne fonctionne pas
- Vérifier que `PROQUELEC_REMOTE_VISION_API` est configurée
- L'image doit être uploadée en `multipart/form-data`

## Tests Locaux

Pour tester sans déployer, utilisez:

```bash
# Test Chat
curl -X POST http://localhost:3000/api/ai/chat \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "Salut, comment ça va?",
    "max_tokens": 50
  }'

# Test Image
curl -X POST http://localhost:3000/api/ai/image \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "Une maison moderne",
    "n": 1
  }'
```

## Support

Pour des questions ou problèmes, consultez:
- OpenAI Docs: https://platform.openai.com/docs
- Anthropic Docs: https://docs.anthropic.com
- Issues: https://github.com/Yoombal29/Site_web_PROQUELEC/issues
