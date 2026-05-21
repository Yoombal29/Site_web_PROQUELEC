# Architecture IA - Mapping Visuel des Composants

## 🎯 Vue d'ensemble : Qui utilise Quoi?

```
FRONTEND (React)                    BACKEND (Node.js)              PROVIDERS
┌─────────────────────────────┐    ┌──────────────────────────┐   ┌──────────────┐
│                             │    │                          │   │              │
│ LiveChat Component          ├───>│ /api/ai/chat             ├──>│ GPT-4o       │
│ (messages temps réel)       │    │ (callRemoteAI)           │   │ Claude 3.5   │
│                             │    │                          │   │ Phi-3.5      │
└─────────────────────────────┘    └──────────────────────────┘   └──────────────┘

┌─────────────────────────────┐    ┌──────────────────────────┐   ┌──────────────┐
│                             │    │                          │   │              │
│ MediaGallery                ├───>│ /api/ai/image            ├──>│ DALL-E 3     │
│ (génération d'images)       │    │ (callRemoteImage)        │   │ SDXL 1.0     │
│                             │    │                          │   │              │
└─────────────────────────────┘    └──────────────────────────┘   └──────────────┘

┌─────────────────────────────┐    ┌──────────────────────────┐   ┌──────────────┐
│                             │    │                          │   │              │
│ ImageAnalyzer               ├───>│ /api/ai/vision           ├──>│ GPT-4 Vision │
│ (upload + analyse)          │    │ (callRemoteVision)       │   │ Moondream2   │
│                             │    │                          │   │              │
└─────────────────────────────┘    └──────────────────────────┘   └──────────────┘

┌─────────────────────────────┐    ┌──────────────────────────┐   ┌──────────────┐
│                             │    │                          │   │              │
│ AdminDashboard              ├───>│ /api/ai/status           ├──>│ Monitoring   │
│ (monitoring IA)             │    │                          │   │ Diagnostic   │
│                             │    │                          │   │              │
└─────────────────────────────┘    └──────────────────────────┘   └──────────────┘
```

---

## 📦 Composants Frontend → Endpoints

### 1. **LiveChat** (Chat en Temps Réel)
```
Component: src/components/LiveChat.tsx
  ├─ Input message
  ├─ Call: POST /api/ai/chat
  │  ├─ If PROQUELEC_REMOTE_AI=1 → GPT-4o / Claude 3.5
  │  └─ Else → Phi-3.5 (local port 8002)
  └─ Display response
  
Models Used:
  - Production: GPT-4o (OpenAI)
  - Fallback: Claude 3.5 (Anthropic)
  - Local: Phi-3.5-mini-instruct
```

**Fichier:** `src/components/LiveChat.tsx`
**Endpoint:** `/api/ai/chat`
**Modèles:**
- Cloud: `gpt-4o` (défaut) ou `claude-3.5-sonnet`
- Local: `Phi-3.5-mini-instruct`

---

### 2. **MediaGallery** (Génération d'Images)
```
Component: src/components/MediaGallery.tsx
  ├─ Input prompt
  ├─ Call: POST /api/ai/image
  │  ├─ If PROQUELEC_REMOTE_IMAGE_API set → DALL-E 3
  │  └─ Else → SDXL 1.0 (local port 8004)
  └─ Display generated image
  
Models Used:
  - Production: DALL-E 3 (OpenAI)
  - Local: SDXL 1.0
```

**Fichier:** `src/components/MediaGallery.tsx`
**Endpoint:** `/api/ai/image`
**Modèles:**
- Cloud: `DALL-E 3` (OpenAI)
- Local: `SDXL 1.0`

---

### 3. **ImageAnalyzer** (Analyse d'Images)
```
Component: src/components/ImageAnalyzer.tsx
  ├─ Upload image
  ├─ Input prompt
  ├─ Call: POST /api/ai/vision (multipart/form-data)
  │  ├─ If PROQUELEC_REMOTE_VISION_API set → GPT-4 Vision
  │  └─ Else → Moondream2 (local port 8003)
  └─ Display analysis
  
Models Used:
  - Production: GPT-4o with Vision
  - Local: Moondream2
```

**Fichier:** `src/components/ImageAnalyzer.tsx`
**Endpoint:** `/api/ai/vision`
**Modèles:**
- Cloud: `gpt-4o-vision` (OpenAI)
- Local: `Moondream2`

---

### 4. **AdminDashboard** (AI Providers Management)
```
Component: src/expert-lab/pages/AIProvidersPage.tsx
  ├─ Display provider list with models
  ├─ Call: GET /api/ai/status
  │  └─ Returns: status of all services
  ├─ Call: POST /api/ai/ping-provider
  │  └─ Validate API keys
  └─ Call: POST /api/ai/diagnostic
     └─ Deep health check
```

**Fichier:** `src/expert-lab/pages/AIProvidersPage.tsx`
**Endpoints:**
- `/api/ai/status` - Monitoring
- `/api/ai/ping-provider` - Validation
- `/api/ai/diagnostic` - Health check

---

## 🔗 Endpoint Details par Service

### **Service: Chat / LLM**

```yaml
Endpoint: POST /api/ai/chat
Port Local: 8002
Provider Cloud: OpenAI / Anthropic / Custom
Models:
  OpenAI: gpt-4o (def), gpt-4-turbo, gpt-3.5-turbo
  Anthropic: claude-3.5-sonnet, claude-3-opus
  Local: Phi-3.5-mini-instruct
Timeout: 90 seconds
Authentication: Bearer Token (optionnel)

Used By:
  - LiveChat.tsx
  - ContentGenerator.tsx
  - AdminDashboard.tsx
  - SEO Analyzer
  - Inspection Report Generator
```

### **Service: Vision / Image Analysis**

```yaml
Endpoint: POST /api/ai/vision
Port Local: 8003
Provider Cloud: OpenAI Vision / Anthropic Claude
Models:
  OpenAI: gpt-4o, gpt-4-vision
  Anthropic: claude-3.5-sonnet (vision capable)
  Local: Moondream2
Timeout: 30 seconds
Input: multipart/form-data (image + prompt)

Used By:
  - ImageAnalyzer.tsx
  - InspectionPhotos.tsx
  - DocumentScanner.tsx
```

### **Service: Image Generation**

```yaml
Endpoint: POST /api/ai/image
Port Local: 8004
Provider Cloud: DALL-E 3 / Custom SDXL
Models:
  OpenAI: DALL-E 3
  Local: SDXL 1.0
Timeout: 120 seconds
Input: JSON (prompt, size, quality)

Used By:
  - MediaGallery.tsx
  - ProjectVisualizer.tsx
  - MarketingMaterials.tsx
```

### **Service: Content Generation**

```yaml
Endpoint: POST /api/ai/content-generation
Port Local: 8002
Provider Cloud: GPT-4o / Claude
Models:
  OpenAI: gpt-4o (def)
  Anthropic: claude-3.5-sonnet
  Local: Phi-3.5-mini-instruct
Timeout: 90 seconds
Input: JSON (prompt, system_prompt, max_tokens)

Used By:
  - BlogEditor.tsx
  - ArticleGenerator.tsx
  - SEOAnalyzer.tsx
  - InspectionReportGenerator.tsx
```

---

## 📊 Configuration Matrix

### Mode: **Cloud (Recommandé)**

```
Config:
  PROQUELEC_REMOTE_AI=1
  PROQUELEC_AI_PROVIDER=openai
  PROQUELEC_API_KEY=sk-proj-xxxxx

Routing:
  Chat              → OpenAI GPT-4o
  Vision            → OpenAI GPT-4o-vision
  Image             → OpenAI DALL-E 3
  Content Gen       → OpenAI GPT-4o
  Status/Monitoring → Local health check
```

### Mode: **Local (Fallback)**

```
Config:
  PROQUELEC_REMOTE_AI=0
  AI_BRAIN_URL=http://localhost:8002
  AI_VISION_URL=http://localhost:8003
  AI_IMAGE_URL=http://localhost:8004

Routing:
  Chat              → Haystack Phi-3.5 (port 8002)
  Vision            → Moondream2 (port 8003)
  Image             → SDXL 1.0 (port 8004)
  Content Gen       → Haystack Phi-3.5 (port 8002)
  Status/Monitoring → Local service checks
```

---

## 🎯 Checklist de Déploiement

- [ ] Tous les endpoints `/api/ai/*` sont exposés et accessibles
- [ ] Modèles IA affectés clairement dans chaque composant
- [ ] Variables d'environnement configurées (`.env`)
- [ ] Tests d'endpoints réussis (`test_ai_endpoints.js`)
- [ ] Documentation mise à jour (ce fichier)
- [ ] Admin dashboard affiche les modèles en cours d'utilisation
- [ ] Fallback local fonctionnel en cas d'erreur cloud
- [ ] Timeouts appropriés pour chaque service

---

## 🚀 Schéma de Flux Complet

```
User Interaction (Frontend)
        ↓
Detect Action Type (chat/image/vision/content)
        ↓
Prepare Request Payload
        ↓
Check PROQUELEC_REMOTE_AI Flag
        ├─ YES → Cloud Path
        │         ├─ Select Provider (OpenAI/Anthropic/Custom)
        │         ├─ Get API Key from env
        │         ├─ Call Remote API
        │         └─ Return Response
        │
        └─ NO → Local Path
                 ├─ Check port availability (8002/8003/8004)
                 ├─ Call Local Service
                 └─ Return Response

Parse Response
        ↓
Return to Frontend Component
        ↓
Update UI (display result)
```

---

## 📝 Notes Importantes

1. **Modèles Explicites:** Chaque endpoint affiche clairement le modèle utilisé dans les logs et la réponse
2. **Fallback Automatique:** Si cloud échoue, basculer vers local (si disponible)
3. **Timeouts:** Respecter les timeouts définis (chat/content: 90s, vision: 30s, image: 120s)
4. **Authentification:** Certains endpoints admin nécessitent Bearer Token
5. **Validation:** Utiliser `test_ai_endpoints.js` pour valider la configuration
