// Script pour convertir toutes les pages restantes en dynamique
// À exécuter en plusieurs étapes

const conversions = {
    "ProjetsRealisations.tsx": {
        page_key: "projets_realisations",
        type: "ProjetsSection",
        defaultSection: "marches",
        icons: "Briefcase, Building2, FileBarChart, Camera, MessageSquare, CheckCircle2, ArrowRight, Zap, Target"
    },
    "ActualitesEvenements.tsx": {
        page_key: "actualites_evenements",
        type: "ActualitesSection",
        defaultSection: "anniversaires",
        icons: "Calendar, Users, VideoIcon, Mic2, Newspaper, Camera, CheckCircle2, ArrowRight, PartyPopper"
    }
};

// Les modifications à faire pour chaque fichier:
// 1. Import useLiveSettings
// 2. Cr
