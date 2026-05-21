
/**
 * FRONTEND CONFIG — PROQUELEC V2
 * Mirrors: PROQUELEC_AI_NORMATIF.yaml
 * Backend authority: Python Haystack + ProquelecAuditor
 */

export const EXPERT_CONFIG = {
    version: '3.1 (Refinements V2)',
    modelName: 'PROQUELEC-NS01-MASTER',

    // --- 1. PERSONA & ALIGNEMENT TEXTUEL ---
    persona: {
        name: "Inspecteur KEBE (KEBE-PROQ AI)",
        tone: "scientifique_impératif",
        openings: {
            // Must strictly match backend keys for coherence
            general: "Ici l'Inspecteur KEBE. En application de la norme NS 01-001, voici mon analyse.",
            dimensionnement: "Calcul certifié par KEBE-PROQ AI (Conforme NS 01-001)...",
            audit: "AUDIT OFFICIEL (Inspecteur KEBE) : Contrôle de conformité activé.",
            safety: "URGENCE SÉCURITAIRE - STOP CHANTIER : Risque critique identifié par KEBE-PROQ AI."
        },
        fallback: "## 🔍 RECHERCHE INFRACTUEUSE\nKEBE-PROQ AI ne trouve pas de correspondance NS 01-001. Contactez le Département Technique."
    },

    // --- 2. CODES MÉTIERS ( STRICTEMENT IDENTIQUES AU YAML ) ---
    rooms: {
        SDB: {
            label: "Salle de Bain",
            fastPath: true,
            keywords: ['douche', 'salle de bain', 'baignoire', 'lavabo', 'eau', 'zone humide']
        },
        GTL: {
            label: "Gaine Technique Logement",
            fastPath: false,
            keywords: ['gtl', 'gaine technique', 'tableau principal', 'arrivée', 'panneau de contrôle']
        },
        CUI: {
            label: "Cuisine",
            fastPath: true, // Some rules like heights/counts are static
            keywords: ['cuisine', 'four', 'hotte', 'plaque', 'frigo', 'plan de travail']
        },
        EXT: {
            label: "Espace Extérieur",
            fastPath: false,
            keywords: ['extérieur', 'jardin', 'terrasse', 'piscine', 'garage']
        },
        COM: {
            label: "Parties Communes",
            fastPath: false,
            keywords: ['escalier', 'hall', 'couloir', 'ascenseur', 'parking']
        }
    },

    concepts: {
        TERRE: { label: "Mise à la terre", keys: ['piquet', 'liaison', 'équipotentielle', 'pe', 'barrette', 'lep', 'les'] },
        DDR: { label: "Dispositif Différentiel", keys: ['interrupteur', 'protection', 'sectionneur', 'différentiel', 'ddr', 'magnéto-thermique'] },
        SDB_VOL2: { label: "Volume 2 (SDB)", keys: ['volume 2', 'vol 2', 'zone 2'] }
    },

    // --- 3. WORKFLOWS (Format Objet + Flag Backend) ---
    workflows: {
        dimensionnement: {
            label: "Dimensionnement",
            description: "Analyse technique complète (Section, Chute de tension, Protection)",
            requiresBackend: true
        },
        mise_en_conformite_sdb: {
            label: "Mise en conformité SDB",
            description: "Vérification des Volumes 0, 1, 2 et indices IP",
            requiresBackend: "hybrid" // Partial fast path possible
        },
        audit_securite: {
            label: "Audit Sécurité",
            description: "Checklist critique Protection des Personnes (DDR, Terre)",
            requiresBackend: true
        }
    },

    // --- 4. FAST PATH (RÈGLES STATIQUES) ---
    staticRules: {
        heights: {
            SDB: "1,20 m minimum pour appareillage hors Volume 0 et 1 (NS 01-001).",
            general: "Axe à 50 mm (0,05 m) du sol fini minimum pour socles ≤ 20A (120 mm pour > 20A)."
        },
        volumes: {
            SDB_VOL2: "IPX4 minimum requis. Prises rasoir ou TBTS uniquement."
        },
        counts: {
            CUI: "6 socles dont 4 sur plan de travail (courant nominal 16A)."
        }
    },

    // --- 5. CONFIGURATION HAYSTACK (ROUTING) ---
    haystackConnection: {
        // FORCED V6/V7 PORT 8002
        endpoint: 'http://localhost:8002/api/v1/chat',
        enabled: true,
        apiKey: import.meta.env.VITE_HAYSTACK_API_KEY || '',
        pipeline: 'proquelec_rag_pipeline'
    },

    // --- 6. FACTEURS CONTEXTUELS SÉNÉGAL (MIRROR) ---
    contextualFactors: {
        climate: "Température ambiante de référence : 40°C (Correction obligatoire)",
        correctionFactors: {
            '40C': 0.81,
            '45C': 0.71
        }
    }
};
