# 📋 TASK PLAN: MODULE INSPECTION INTELLIGENTE (PROQUELEC CORE)

> Ce plan détaille la construction du moteur d'inspection numérique, transformant les fichiers PDF statiques en **Données Structurées de Conformité**.

---

## 🏗 PHASE 1 : ARCHITECTURE DE DONNÉES (SQL)
- [ ] **1.1 Créer la table `inspections`** : Conteneur principal (Date, Inspecteur, Projet, géolocalisation).
- [ ] **1.2 Créer la table `inspection_checklists`** : Modèles de contrôle (ex: "Résidentiel T3", "Industriel").
- [ ] **1.3 Créer la table `inspection_items`** : Points de contrôle unitaires (ex: "Prise de terre < 50Ω").
- [ ] **1.4 Créer la table `findings`** : Anomalies détectées (Lien vers Norme, Photo, Gravité).
- [ ] **1.5 Migration** : Exécuter le script SQL pour appliquer ces structures.

## ⚙️ PHASE 2 : BACKEND API (Node.js)
- [ ] **2.1 Routes API CRUD** : `GET/POST /api/inspections`, `GET /api/checklists`.
- [ ] **2.2 Logique de Scoring** : Algorithme backend pour calculer le `compliance_score` en temps réel.
- [ ] **2.3 Génération de Rapport** : Service qui transforme les données JSON en PDF signé (via `pdfmake` ou `Simplex`).

## 🖥 PHASE 3 : FRONTEND (Interface Saisie)
- [ ] **3.1 Intégration Projet** : Ajouter un onglet "Inspections" dans `ProjectDetail.tsx`.
- [ ] **3.2 Formulaire Intelligent** : Créer le composant `InspectionForm.tsx` (Wizard step-by-step).
- [ ] **3.3 Widget Conformité** : Jauge de score en temps réel dans le dashboard projet.

## 🧠 PHASE 4 : INTELLIGENCE (Cortex)
- [ ] **4.1 Validation IA** : Bouton "Vérifier avec Cortex" qui analyse les commentaires de l'inspecteur.
- [ ] **4.2 Auto-Tagging** : L'IA suggère la gravité (Critique/Majeur/Mineur) selon la description.

---

## 🚀 OBJECTIF FINAL
Remplacer le "Rapport Word" par une **Inspection Numérique** qui alimente automatiquement la Base de Données Nationale de Sécurité.
