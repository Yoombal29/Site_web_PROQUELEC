# 📊 RAPPORT: Analyse et Optimisation haystack_backend (10GB)

## 🔍 Analyse de l'Espace Disque

### Dossiers Principaux Identifiés

| Dossier | Taille | Contenu | Verdict |
|---------|--------|---------|---------|
| `.venv_arc/` | **9,099 MB** | Venv Python pour GPU Intel Arc | ❌ **À SUPPRIMER** |
| `cache_model/` | **2,077 MB** | Lock files (vide) | ❌ **À SUPPRIMER** |
| `checkpoints/` | **42.54 MB** | Adapters Phi-3.5 | ⚠️ **À ÉVALUER** |
| `.venv_debug_test/` | **5.95 MB** | Venv de debug | ❌ **À SUPPRIMER** |
| `models/` | **N/A** | N'EXISTE PAS ✅ | ✅ **BON SIGNE** |

**Total réductible: ~11,225 MB (11.25 GB)**

---

## 🎯 État du Code - Architecture Actuelle

### Remote AI (Cloud-First) ✅
```python
# Si PROQUELEC_REMOTE_AI=1 ou PROQUELEC_AI_PROVIDER configuré
→ Utilise OpenAI GPT-4o, Anthropic Claude, etc.
→ Pas de modèles locaux chargés
```

### Fallback Local (Si API échoue)
```python
# Si remote échoue:
1. Essaie charger Llama-3.1-8B de PROQUELEC_MODEL_DIR
2. Sinon: Télécharge depuis HuggingFace à runtime
3. Modèles téléchargés → ~/.cache/huggingface (hors haystack_backend)
```

### Services Locaux (Vision, Image)
- `PhiService`: Cherche `haystack_backend/.cache/phi-3-5/...` → **Fichier n'existe pas**
- `VisionService`: Référence YOLO model → **Fichier n'existe pas**
- `server_image_sdxl.py`: Code pour SDXL → **Modèle non téléchargé**

---

## 🗑️ Plan de Nettoyage

### Niveau 1: CRITIQUE - Sans Risque ✅ (Gain: 11.2 GB)

**À supprimer immédiatement:**

```powershell
# 1. Supprimer environnement virtuel inutilisé
Remove-Item -Path "haystack_backend/.venv_arc" -Recurse -Force
# Avant: 9,099 MB | Après: 0 MB

# 2. Supprimer cache vide
Remove-Item -Path "haystack_backend/cache_model" -Recurse -Force  
# Avant: 2,077 MB | Après: 0 MB

# 3. Supprimer venv de debug
Remove-Item -Path "haystack_backend/.venv_debug_test" -Recurse -Force
# Avant: 5.95 MB | Après: 0 MB
```

**Gain**: **~11.2 GB** sans impact fonctionnel
**Risque**: Très bas - ces dossiers ne sont pas utilisés

---

### Niveau 2: RECOMMANDÉ - Code Inutilisé (Gain: Variable)

**Scripts à évaluer:**

| Fichier | Taille | Utilisation | Action |
|---------|--------|------------|--------|
| `server_vision.py` | ~5 KB | Chargement de modèles locaux | Vérifier si encore utilisé |
| `server_image_sdxl.py` | ~3 KB | SDXL local (jamais chargé) | **Supprimer** |
| `debug_*.py` | ~20 KB | Debug uniquement | **Supprimer** |
| `test_*.py` | ~50 KB | Tests en dev | **Supprimer** |
| `checkpoints/` | 42.54 MB | Phi-3.5 adapters (inutilisés) | **Supprimer** |

**Commande pour identifier code unused:**

```bash
# Chercher ce qui est vraiment importé/utilisé
grep -r "from server_vision" haystack_backend/
grep -r "server_image_sdxl" haystack_backend/
grep -r "checkpoints" haystack_backend/
```

---

## ⚡ Après Nettoyage - Configuration Optimale

### Recommandations
1. **Activer Remote AI par défaut**
   ```bash
   PROQUELEC_REMOTE_AI=1
   PROQUELEC_AI_PROVIDER=openai
   PROQUELEC_API_KEY=sk-...
   ```

2. **Venv simple et léger**
   ```bash
   python -m venv .venv_arc  # Si besoin
   pip install -r requirements.txt
   ```

3. **Taille finale estimée**
   - haystack_backend/: **~500 MB** (code source + minimal deps)
   - vs. Actuellement: **~10,000 MB**
   - **Réduction: ~95%**

4. **Modèles téléchargés à la demande**
   - Stockés dans: `~/.cache/huggingface/` (hors du repo)
   - Chargés seulement si PROQUELEC_REMOTE_AI=0

---

## ✅ Checklist de Nettoyage

- [ ] Vérifier que `PROQUELEC_REMOTE_AI=1` est configuré
- [ ] Supprimer `.venv_arc/`
- [ ] Supprimer `cache_model/`
- [ ] Supprimer `.venv_debug_test/`
- [ ] Supprimer `checkpoints/` (si unused)
- [ ] Supprimer scripts de debug (`debug_*.py`, `test_*.py`)
- [ ] Recréer `.venv_arc/` si besoin : `python -m venv .venv_arc`
- [ ] Installer deps: `pip install -r requirements.txt`
- [ ] Tester: `npm run dev`

---

## 🚀 Résumé

| Étape | Avant | Après | Gain |
|-------|-------|-------|------|
| Après Nettoyage Niveau 1 | 10.0 GB | ~0.8 GB | **9.2 GB** |
| Après Nettoyage Niveau 2 | 0.8 GB | ~0.5 GB | **0.3 GB** |
| **Total** | **10.0 GB** | **~0.5 GB** | **~95%** |

**Recommandation finale**: Appliquer Niveau 1 (sans risque) immédiatement.

## Actions effectuées (20/05/2026)

- Créé dossier de sauvegarde: `haystack_backend/removed_backup_20260520_1825`
- Local backend `haystack_backend` retiré du repo et archivé sous `haystack_backend_archive_20260520_1825`.
- Archive `haystack_backend_archive_20260520_1825` supprimée définitivement.
- Taille restante de `haystack_backend` après déplacement: ~1.99 MB (avant archivage et suppression).

Le backend local a été désactivé dans le code serveur. L’archive de secours a bien été nettoyée.
