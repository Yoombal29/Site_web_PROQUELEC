# 🐳 Docker + GPU Intel Arc - Guide Complet

## 📋 État Actuel (23 Février 2026)

✅ **Terminé:**
- Docker configuré avec support IPEX-LLM XPU
- Llama-3.1-8B-Instruct centralisé dans `haystack_backend/models/`
- Dockerfile adapté pour Intel Arc GPU
- docker-compose.yml mis à jour pour `cortex-brain` (port 8000)
- Script d'aide PowerShell : `docker-gpu-setup.ps1`

⚠️ **En cours:**
- Build de l'image Docker (transfert des modèles ~ 12.6 GB)

---

## 🚀 Démarrage Rapide

### 1️⃣ **Attendre la complétion du build** (30-40 minutes la première fois)

```powershell
# Afficher la progression en temps réel
docker-compose logs -f cortex-brain
```

### 2️⃣ **Démarrer le conteneur une fois le build terminé**

```powershell
cd "C:\Mes Sites Web\Site_web_PROQUELEC-main"
docker-compose up -d cortex-brain
```

### 3️⃣ **Vérifier la santé du conteneur**

```powershell
docker-compose ps
# Attend "healthy" status
```

### 4️⃣ **Accéder l'API**

🌐 **API:** http://localhost:8000
📚 **Swagger Docs:** http://localhost:8000/docs
📋 **ReDoc:** http://localhost:8000/redoc

---

## 🛠️ Commandes Utiles

### Script d'aide PowerShell

```powershell
# Démarrer (ou reconstruire)
.\haystack_backend\scripts\docker-gpu-setup.ps1 -Action up

# Voir les logs
.\haystack_backend\scripts\docker-gpu-setup.ps1 -Action logs

# Tester l'API
.\haystack_backend\scripts\docker-gpu-setup.ps1 -Action test

# Shell interactif
.\haystack_backend\scripts\docker-gpu-setup.ps1 -Action shell

# Arrêter
.\haystack_backend\scripts\docker-gpu-setup.ps1 -Action down
```

### Docker Compose Direct

```powershell
# Logs en temps réel
docker-compose logs -f cortex-brain

# Vérifier l'état
docker-compose ps

# Arrêter le conteneur
docker-compose stop cortex-brain

# Supprimer et reconstruire
docker-compose down
docker-compose build cortex-brain
```

---

## 🔧 Configuration GPU Intel Arc

### Variables d'environnement (dans docker-compose.yml)

```yaml
environment:
  IPEX_XPU_BACKEND=level_zero      # Use Level Zero for Intel Arc
  ONEAPI_DEVICE_SELECTOR=gpu       # Select GPU device
  PROQUELEC_MODEL_DIR=/app/models/models--NousResearch--Meta-Llama-3.1-8B-Instruct
```

### Volumes montés

```yaml
volumes:
  - ./haystack_backend/models:/app/models   # Modèle Llama
  - ./haystack_backend/.cache:/app/.cache   # Cache HuggingFace
  - ./haystack_backend:/app                 # Code (dev only)
```

### Devices passés au conteneur

```yaml
devices:
  - /dev/dri:/dev/dri  # Intel GPU access
```

---

## 🧪 Test de l'API

### Via PowerShell

```powershell
$payload = @{
    prompt = "Bonjour, qui es-tu?"
    max_tokens = 100
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:8000/api/ai/content-generation" `
    -Method POST `
    -Body $payload `
    -ContentType "application/json"
```

### Via curl

```bash
curl -X POST "http://localhost:8000/api/ai/content-generation" \
  -H "Content-Type: application/json" \
  -d '{"prompt": "Bonjour, qui es-tu?", "max_tokens": 100}'
```

### Via Python

```python
import requests

response = requests.post(
    "http://localhost:8000/api/ai/content-generation",
    json={
        "prompt": "Bonjour, comment ça marche?",
        "max_tokens": 100,
        "temperature": 0.7
    }
)
print(response.json())
```

---

## 📊 Monitoring en temps réel

```powershell
# CPU/Mémoire du conteneur
docker stats cortex-brain

# Logs avec filtrage
docker-compose logs cortex-brain --tail 100 -f

# Inspecter le conteneur
docker inspect cortex-brain
```

---

## 🆘 Dépannage

### Le conteneur ne démarre pas

```powershell
# Voir les erreurs
docker-compose logs cortex-brain

# Reconstruire (possiblement besoin d'une nouvelle tentative)
docker-compose down
docker-compose build --no-cache cortex-brain
docker-compose up -d cortex-brain
```

### GPU non détecté

```powershell
# Vérifier à l'intérieur du conteneur
docker exec cortex-brain python -c "import torch; print(torch.cuda.is_available())"

# Ou avec IPEX
docker exec cortex-brain python -c "import intel_extension_for_pytorch as ipex; print(ipex.xpu.is_available())"
```

### Out of Memory

```powershell
# Augmenter mémoire Docker Desktop:
# Settings > Resources > Memory (recommandé: 16+ GB)
```

---

## 📈 Performance Attendue

### Sur Intel Arc GPU (IPEX-LLM XPU):
- ⚡ Model loading: ~30-60 secondes (première fois)
- ⚡ Inference (100 tokens): ~2-5 secondes
- 🔋 Utilisation mémoire: ~8-12 GB GPU

### Sur CPU (fallback):
- 🔧 Model loading: ~100-120 secondes
- 🔧 Inference (100 tokens): ~15-30 secondes
- 💾 Utilisation mémoire: ~16-20 GB RAM

---

## 🔄 Mise à jour du modèle

Si vous voulez changer de modèle Llama:

1. **Téléchargez le nouveau modèle** dans `haystack_backend/models/`
2. **Mettez à jour** `PROQUELEC_MODEL_DIR` dans `docker-compose.yml`
3. **Relancez** le conteneur:
   ```powershell
   docker-compose down
   docker-compose up -d cortex-brain
   ```

---

## 📚 Ressources Additionnelles

- [IPEX-LLM Docs](https://github.com/intel-analytics/ipex-llm)
- [Intel Arc GPU Drivers](https://ark.intel.com/content/www/us/en/ark/products/230500/intel-arcgpu-graphics.html)
- [Docker Documentation](https://docs.docker.com/)

---

## ✨ Notes

- Le premier build prend **30-40 minutes** (téléchargement + installation des dépendances)
- Les builds suivants sont **beaucoup plus rapides** (cache de couches)
- Le modèle Llama-3.1-8B (~15 GB) est **bind-mounted**, pas copié dans l'image
- La configuration GPU utilise **Level Zero runtime** (Intel's open standard)

---

**Dernière mise à jour:** 23 février 2026
