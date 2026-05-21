# 🏛 PROQUELEC DIGITAL CORE 2030 (Master Plan)
### Plateforme Nationale de Gouvernance et de Sécurité Électrique
**Statut :** Active Development | **Version :** 5.0.0 (Core Architecture)

> Ce document annule et remplace tous les précédents plans. Il définit la trajectoire technique pour transformer PROQUELEC en **Autorité Numérique de Régulation**.

---

## 🏗 1. ARCHITECTURE TECHNIQUE CIBLE (Microservices Ready)

Nous adoptons une architecture **Modular Monolith** (transition vers Microservices) pour garantir la robustesse immédiate et la scalabilité future.

### **Backend (Node.js API Core)**
*   **Structure** : Architecture Hexagonale (Domain, Application, Infrastructure).
*   **API First** : Tout passe par des API RESTful documentées (Swagger).
*   **Services Découplés** :
    *   `Auth Service` : Gestion identité, 2FA, RBAC.
    *   `Project Service` : Gestion des sites et chantiers (CRUD).
    *   `Inspection Service` : Cœur métier (Rapports, Checklists).
    *   `GED Service` : Stockage intelligent (MinIO/Local abstraction).
    *   `Cortex Bridge` : Passerelle vers les services IA Python.

### **Data Layer (PostgreSQL + Timescale)**
*   **PostgreSQL 16** : Données relationnelles structurantes.
*   **Redis** : Caching haute performance et Files d'attente (Jobs).
*   **MinIO** : Stockage Objet S3-compatible pour les documents (Souveraineté).

### **Cortex IA (Python Microservices cluster)**
*   **Brain 1 (NLP/RAG)** : Expert Normatif (Actif - Port 8002).
*   **Brain 2 (Vision)** : Analyse Photos Chantier (En cours - Port 8003).
*   **Brain 3 (Predictive)** : **NOUVEAU** - Moteur `Scikit-learn` pour le Scoring de Risque (NESI).

---

## 🧠 2. DATA MODEL & GOUVERNANCE

Le schéma de données s'étend pour couvrir l'ensemble du cycle de vie électrique.

### **Entités Majeures**
1.  **Sites & Infrastructure** : Bâtiments, Réseaux, Postes.
2.  **Acteurs** : Électriciens (Qualifiés/Non), Inspecteurs, Bailleurs.
3.  **Inspections** :
    *   `Checklist Data` (JSONB)
    *   `Findings` (Non-conformités atomiques liées aux normes)
    *   `Criticality Score` (Calculé)
4.  **Compliance Intelligence** :
    *   `Compliance_Score` (0-100)
    *   `Risk_Index` (Faible -> Critique)
    *   `NESI` (National Electrical Safety Index)

---

## 🛡 3. SÉCURITÉ & CONFORMITÉ (GovTech Standard)

*   **RBAC Strict** : Matrice de droits granulaire (Lecture/Écriture/Validation/Audit).
*   **Audit Logs Immuables** : Chaque action (Qui, Quoi, Quand, IP) est loggée dans `audit_trails`.
*   **Chiffrement** : Données au repos et en transit (TLS 1.3).
*   **Souveraineté** : Hébergement local/national des données sensibles.

---

## 📆 4. ROADMAP D'EXÉCUTION (Sans Cassure)

### **PHASE 1 : SOCLE & GED INTELLIGENTE (Mois 1-3) [ACTUEL]**
*   ✅ **Auth & Users** : Système robuste en place.
*   ✅ **GED Core** : Upload et gestion fichiers (Electro-GED).
*   🔄 **Module Projets** : Structure "Site/Chantier" (En cours de finalisation).
*   🔄 **IA RAG** : Chatbot normatif (En attente de modèles).
*   🎯 **Objectif** : Avoir une base de données fiable des chantiers et documents.

### **PHASE 2 : INSPECTION NUMÉRIQUE & IA ANALYTIQUE (Mois 3-9)**
*   🚧 **Inspection Engine** : Création des formulaires d'audit dynamiques.
*   🚧 **Mobile Companion** : PWA pour la saisie terrain (Mode déconnecté).
*   🚧 **IA Niveau 1** : Analyse automatique des rapports PDF (Extraction données).
*   🎯 **Objectif** : Digitaliser le flux terrain -> bureau. Plus de papier.

### **PHASE 3 : GOUVERNANCE & PRÉDICTION (Mois 9-18)**
*   🛑 **Scoring Algorithm** : Implémentation du calcul de risque (Pondération normes).
*   🛑 **IA Niveau 2** : Modèles prédictifs (Quelles zones vont avoir des pannes ?).
*   🛑 **Dashboard National** : Cartographie (Heatmap) des risques Sénégal.
*   🎯 **Objectif** : Passer du "Constat" à la "Prévision".

### **PHASE 4 : ÉCOSYSTÈME & OUVERTURE (Mois 18+)**
*   🛑 **API Publique** : Pour les partenaires (Bailleurs, Assurances).
*   🛑 **Blockchain** : Certification notariale des conformités.
*   🎯 **Objectif** : Devenir le standard national incontournable.

---

## 🛠 ACTION PLAN IMMÉDIAT (Cette semaine)

1.  **Consolider le Module Projet** : C'est le conteneur de toutes les futures données d'inspection.
2.  **Créer la Table `inspections`** : Pour ne plus dépendre de simples fichiers PDF, mais de données structurées.
3.  **Dockeriser les Services** : Pour préparer le déploiement "GovTech" propre.
4.  **Connecter l'IA au Flux** : Dès qu'un doc est uploadé -> Analyse -> Extraction -> Scoring.

---
*Validé par l'Architecte Système PROQUELEC.*
