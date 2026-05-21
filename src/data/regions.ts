import { ElectricityProfile, Infrastructure, Professionals, Statistics, RegionData } from "@/types/energy";

/**
 * Métadonnées des 14 régions administratives du Sénégal
 * Données régionales du Sénégal pour l'Observatoire PROQUELEC
 */
export const regionsInfo: Record<string, RegionData> = {
    dakar: {
        name: "Dakar",
        slug: "dakar",
        capital: "Dakar",
        population: "3 630 000",
        description: "Capitale et plus grande ville du Sénégal, centre économique et culturel du pays.",
        color: "hsl(161, 84%, 39%)",
        gadmName: "Dakar",
        profile: {
            rate: 98.5,
            mainSource: "Thermique / Gaz",
            installedPower: "1200 MW",
            urbanRate: 99,
            ruralRate: 85
        },
        infrastructure: {
            plants: ["Centrale de Cap des Biches", "Centrale de Bel Air"],
            substations: "18 Postes HT/MT",
            lines: "Boucle 225kV / 90kV",
            underservedZones: ["Certaines zones de banlieue lointaine"]
        },
        professionals: {
            count: 450,
            companies: ["Senelec", "GE", "PME Agréées"],
            specialties: ["Industriel", "Bâtiment", "Maintenance"],
            interventionZone: "Région de Dakar"
        },
        stats: {
            avgConsumption: "1200 kWh/an/hab",
            sectors: [
                { name: "Résidentiel", value: 45 },
                { name: "Industriel", value: 35 },
                { name: "Services", value: 20 }
            ],
            technicalLosses: 12,
            avgOutages: 4,
            reliabilityIdx: "Moyen-Élevé"
        },
        issues: ["Surcharges transformateurs"],
        compliance: {
            normRespect: "Élevé",
            compliantRate: 75,
            needs: ["Audit installations anciennes"]
        },
        renewable: {
            solarPotential: "Moyen",
            existingProjects: ["Solaire toiture"],
            miniGrids: 2
        },
        training: {
            centers: ["ESP Dakar"],
            certifications: ["BEP Électrotechnique"]
        },
        publicProjects: {
            senelec: ["Modernisation réseau"],
            rural: "N/A",
            progress: 65
        }
    },
    thies: {
        name: "Thiès",
        slug: "thies",
        capital: "Thiès",
        population: "1 788 000",
        description: "Deuxième région économique, connue pour ses industries et le lac Rose.",
        color: "hsl(161, 94%, 30%)",
        gadmName: "Thiès",
        profile: { rate: 82.3, mainSource: "Solaire / Thermique", installedPower: "450 MW", urbanRate: 92, ruralRate: 65 },
        infrastructure: { plants: ["Centrale Solaire de Méouane"], substations: "12 Postes", lines: "Ligne 225kV", underservedZones: ["Zones rurales Mbour"] },
        professionals: { count: 280, companies: ["PME locales"], specialties: ["Solaire", "Industriel"], interventionZone: "Thiès, Mbour" },
        stats: { avgConsumption: "850 kWh/an/hab", sectors: [{ name: "Industriel", value: 40 }, { name: "Résidentiel", value: 40 }], technicalLosses: 14, avgOutages: 6 },
        issues: ["Variations de tension"],
        compliance: { normRespect: "Moyen", compliantRate: 60, needs: ["Formation normes NF"] },
        renewable: { solarPotential: "Elevé", existingProjects: ["Tobène Solar"], miniGrids: 15 },
        training: { centers: ["ISEP Thiès"], certifications: ["Installateur Solaire"] },
        publicProjects: { senelec: ["Extension réseau"], rural: "ASER Phase II", progress: 45 }
    },
    "saint-louis": {
        name: "Saint-Louis",
        slug: "saint-louis",
        capital: "Saint-Louis",
        population: "1 013 000",
        description: "Ancienne capitale coloniale, patrimoine mondial UNESCO.",
        color: "hsl(175, 84%, 32%)",
        gadmName: "Saint-Louis",
        profile: { rate: 75.0, mainSource: "Hydro (Manantali)", installedPower: "300 MW", urbanRate: 88, ruralRate: 55 },
        infrastructure: { plants: ["Bokhol Solar"], substations: "8 Postes", lines: "Boucle Nord", underservedZones: ["Dandé Mayo"] },
        professionals: { count: 150, companies: ["Senelec", "PME"], specialties: ["Solaire", "Hydro"], interventionZone: "Vallée du fleuve" },
        stats: { avgConsumption: "600 kWh/an/hab", sectors: [{ name: "Agriculture", value: 35 }, { name: "Résidentiel", value: 45 }], technicalLosses: 15, avgOutages: 8 },
        issues: ["Corrosion saline"],
        compliance: { normRespect: "Moyen", compliantRate: 50, needs: ["Protection corrosion"] },
        renewable: { solarPotential: "Très Elevé", existingProjects: ["Bokhol"], miniGrids: 28 },
        training: { centers: ["UGB"], certifications: ["Ingénierie Énergétique"] },
        publicProjects: { senelec: ["Rénovation ville historique"], rural: "ASER", progress: 70 }
    },
    diourbel: {
        name: "Diourbel",
        slug: "diourbel",
        capital: "Diourbel",
        population: "1 801 000",
        description: "Centre religieux (Touba). Croissance urbaine exceptionnelle.",
        color: "hsl(175, 77%, 26%)",
        gadmName: "Diourbel",
        profile: { rate: 68.5, mainSource: "Réseau Interconnecté", installedPower: "250 MW", urbanRate: 90, ruralRate: 40 },
        infrastructure: { plants: ["Centrale Touba"], substations: "6 Postes", lines: "Lignes 90kV", underservedZones: ["Périphérie Touba"] },
        professionals: { count: 320, companies: ["Artisans"], specialties: ["Bâtiment"], interventionZone: "Touba" },
        stats: { avgConsumption: "550 kWh/an/hab", sectors: [{ name: "Résidentiel", value: 65 }, { name: "Commerce", value: 25 }], technicalLosses: 18, avgOutages: 10 },
        issues: ["Surcharges Magal"],
        compliance: { normRespect: "Faible", compliantRate: 35, needs: ["Régularisation Touba"] },
        renewable: { solarPotential: "Elevé", existingProjects: ["Auto-consommation"], miniGrids: 10 },
        training: { centers: ["CFA Diourbel"], certifications: ["CAP"] },
        publicProjects: { senelec: ["Renforcement Touba"], rural: "ASER", progress: 30 }
    },
    louga: {
        name: "Louga",
        slug: "louga",
        capital: "Louga",
        population: "985 000",
        description: "Région agropastorale, zone de transition Sahel-côte.",
        color: "hsl(173, 80%, 40%)",
        gadmName: "Louga",
        profile: { rate: 60.2, mainSource: "Solaire / Réseau", installedPower: "120 MW", urbanRate: 85, ruralRate: 35 },
        infrastructure: { plants: ["Kébémer Solar"], substations: "4 Postes", lines: "MT Longue portée", underservedZones: ["Zone sylvopastorale"] },
        professionals: { count: 80, companies: ["PME"], specialties: ["Solaire"], interventionZone: "Louga, Linguère" },
        stats: { avgConsumption: "400 kWh/an/hab", sectors: [{ name: "Résidentiel", value: 70 }, { name: "Élevage", value: 15 }], technicalLosses: 16, avgOutages: 9 },
        issues: ["Chutes de tension"],
        compliance: { normRespect: "Moyen", compliantRate: 45, needs: ["Compteurs"] },
        renewable: { solarPotential: "Très Elevé", existingProjects: ["Kébémer"], miniGrids: 22 },
        training: { centers: ["Lycée Louga"], certifications: ["BT"] },
        publicProjects: { senelec: ["Boucle Louga"], rural: "ASER III", progress: 40 }
    },
    fatick: {
        name: "Fatick",
        slug: "fatick",
        capital: "Fatick",
        population: "870 000",
        description: "Région du Sine-Saloum, mangroves et bolongs.",
        color: "hsl(172, 66%, 50%)",
        gadmName: "Fatick",
        profile: { rate: 55.4, mainSource: "Mixte", installedPower: "80 MW", urbanRate: 75, ruralRate: 30 },
        infrastructure: { plants: ["Mini-réseaux"], substations: "3 Postes", lines: "Lignes BT", underservedZones: ["Iles du Saloum"] },
        professionals: { count: 60, companies: ["ONG/Privé"], specialties: ["Solaire isolé"], interventionZone: "Iles" },
        stats: { avgConsumption: "350 kWh/an/hab", sectors: [{ name: "Pêche", value: 30 }, { name: "Tourisme", value: 20 }], technicalLosses: 14, avgOutages: 7 },
        issues: ["Enclavement insulaire"],
        compliance: { normRespect: "Correct", compliantRate: 40, needs: ["Kits certifiés"] },
        renewable: { solarPotential: "Elevé", existingProjects: ["Iles Solaires"], miniGrids: 18 },
        training: { centers: ["CRFP Fatick"], certifications: ["CAP"] },
        publicProjects: { senelec: ["Câbles sous-marins"], rural: "ERIL", progress: 55 }
    },
    kaolack: {
        name: "Kaolack",
        slug: "kaolack",
        capital: "Kaolack",
        population: "1 066 000",
        description: "Centre commercial, capitale de l'arachide.",
        color: "hsl(164, 86%, 20%)",
        gadmName: "Kaolack",
        profile: { rate: 72.8, mainSource: "Thermique", installedPower: "180 MW", urbanRate: 88, ruralRate: 45 },
        infrastructure: { plants: ["Kahone Solar"], substations: "5 Postes", lines: "Lignes 90kV", underservedZones: ["Villages périphériques"] },
        professionals: { count: 140, companies: ["Senelec/PME"], specialties: ["Industriel"], interventionZone: "Bassin Arachidier" },
        stats: { avgConsumption: "500 kWh/an/hab", sectors: [{ name: "Industriel", value: 40 }, { name: "Résidentiel", value: 35 }], technicalLosses: 15, avgOutages: 6 },
        issues: ["Salinité isolateurs"],
        compliance: { normRespect: "Moyen", compliantRate: 55, needs: ["Maintenance"] },
        renewable: { solarPotential: "Elevé", existingProjects: ["Kahone"], miniGrids: 8 },
        training: { centers: ["Lycée Kaolack"], certifications: ["BT"] },
        publicProjects: { senelec: ["Poste Kahone"], rural: "PUDC", progress: 60 }
    },
    kolda: {
        name: "Kolda",
        slug: "kolda",
        capital: "Kolda",
        population: "750 000",
        description: "Haute Casamance, riche en agriculture et forêts.",
        color: "hsl(164, 85%, 16%)",
        gadmName: "Kolda",
        profile: { rate: 42.1, mainSource: "Hybride", installedPower: "50 MW", urbanRate: 60, ruralRate: 20 },
        infrastructure: { plants: ["Centrale Kolda"], substations: "2 Postes", lines: "Réseau local", underservedZones: ["Sud Kolda"] },
        professionals: { count: 45, companies: ["Indépendants"], specialties: ["Solaire"], interventionZone: "Haute Casamance" },
        stats: { avgConsumption: "280 kWh/an/hab", sectors: [{ name: "Agriculture", value: 30 }, { name: "Résidentiel", value: 60 }], technicalLosses: 20, avgOutages: 12 },
        issues: ["Accès hivernage"],
        compliance: { normRespect: "Faible", compliantRate: 30, needs: ["Formation"] },
        renewable: { solarPotential: "Modéré", existingProjects: ["Mini-Grids"], miniGrids: 35 },
        training: { centers: ["ASER"], certifications: ["Opérateur"] },
        publicProjects: { senelec: ["Désenclavement"], rural: "PROMER", progress: 25 }
    },
    ziguinchor: {
        name: "Ziguinchor",
        slug: "ziguinchor",
        capital: "Ziguinchor",
        population: "650 000",
        description: "Basse Casamance, région verdoyante et touristique.",
        color: "hsl(174, 96%, 26%)",
        gadmName: "Ziguinchor",
        profile: { rate: 65.9, mainSource: "Thermique / Solaire", installedPower: "110 MW", urbanRate: 85, ruralRate: 42 },
        infrastructure: { plants: ["Centrale Boutoute"], substations: "4 Postes", lines: "Boucle Casamance", underservedZones: ["Forêts reculées"] },
        professionals: { count: 95, companies: ["Privé"], specialties: ["Froid", "Tourisme"], interventionZone: "Ziguinchor, Cap Skirring" },
        stats: { avgConsumption: "480 kWh/an/hab", sectors: [{ name: "Tourisme", value: 40 }, { name: "Pêche", value: 20 }], technicalLosses: 15, avgOutages: 7 },
        issues: ["Foudroiement"],
        compliance: { normRespect: "Correct", compliantRate: 50, needs: ["Parafoudres"] },
        renewable: { solarPotential: "Moyen", existingProjects: ["Hotels Solaire"], miniGrids: 12 },
        training: { centers: ["UASZ"], certifications: ["Licence Energie"] },
        publicProjects: { senelec: ["Interconnexion OMVG"], rural: "OFOR", progress: 50 }
    },
    tambacounda: {
        name: "Tambacounda",
        slug: "tambacounda",
        capital: "Tambacounda",
        population: "840 000",
        description: "Plus grande région, abrite le parc Niokolo-Koba.",
        color: "hsl(172, 75%, 17%)",
        gadmName: "Tambacounda",
        profile: { rate: 45.3, mainSource: "Diesel / OMVS", installedPower: "90 MW", urbanRate: 65, ruralRate: 25 },
        infrastructure: { plants: ["Centrale Goth"], substations: "3 Postes", lines: "Lignes radiales", underservedZones: ["Frontière Mali"] },
        professionals: { count: 70, companies: ["Entretien"], specialties: ["MT"], interventionZone: "Est Sénégal" },
        stats: { avgConsumption: "320 kWh/an/hab", sectors: [{ name: "Mines", value: 35 }, { name: "Résidentiel", value: 50 }], technicalLosses: 22, avgOutages: 14 },
        issues: ["Maintenance difficile"],
        compliance: { normRespect: "Initial", compliantRate: 35, needs: ["Infrastructures"] },
        renewable: { solarPotential: "Très Elevé", existingProjects: ["Goth Solar"], miniGrids: 40 },
        training: { centers: ["Lycée Tamba"], certifications: ["CAP"] },
        publicProjects: { senelec: ["Interconnexion"], rural: "PUDC", progress: 35 }
    },
    kaffrine: {
        name: "Kaffrine",
        slug: "kaffrine",
        capital: "Kaffrine",
        population: "660 000",
        description: "Région agricole, bassin arachidier.",
        color: "hsl(180, 70%, 27%)",
        gadmName: "Kaffrine",
        profile: { rate: 48.7, mainSource: "Reseau Interconnecte", installedPower: "40 MW", urbanRate: 68, ruralRate: 28 },
        infrastructure: { plants: ["Poste Kaffrine"], substations: "2 Postes", lines: "Antennes MT", underservedZones: ["Brousse"] },
        professionals: { count: 40, companies: ["Indépendants"], specialties: ["Bâtiment"], interventionZone: "Centre" },
        stats: { avgConsumption: "290 kWh/an/hab", sectors: [{ name: "Agriculture", value: 45 }, { name: "Résidentiel", value: 45 }], technicalLosses: 18, avgOutages: 11 },
        issues: ["Densité faible"],
        compliance: { normRespect: "Correct", compliantRate: 40, needs: ["Standardisation"] },
        renewable: { solarPotential: "Très Elevé", existingProjects: ["PUDC"], miniGrids: 14 },
        training: { centers: ["Formations mobiles"], certifications: ["CAP"] },
        publicProjects: { senelec: ["Poste Malem Hodar"], rural: "COSEER", progress: 20 }
    },
    kedougou: {
        name: "Kédougou",
        slug: "kedougou",
        capital: "Kédougou",
        population: "180 000",
        description: "Région montagneuse, mines d'or.",
        color: "hsl(185, 82%, 31%)",
        gadmName: "Kédougou",
        profile: { rate: 35.8, mainSource: "Diesel / OMVG", installedPower: "150 MW", urbanRate: 55, ruralRate: 15 },
        infrastructure: { plants: ["Centrales Minières"], substations: "2 Postes", lines: "OMVG HT", underservedZones: ["Zones Minières"] },
        professionals: { count: 55, companies: ["Mines"], specialties: ["Industriel"], interventionZone: "Sud-Est" },
        stats: { avgConsumption: "400 kWh/an/hab", sectors: [{ name: "Mines", value: 70 }, { name: "Résidentiel", value: 20 }], technicalLosses: 12, avgOutages: 15 },
        issues: ["Relief complexe"],
        compliance: { normRespect: "Elevé (Mines)", compliantRate: 45, needs: ["Sécurité"] },
        renewable: { solarPotential: "Elevé", existingProjects: ["Solaire Minier"], miniGrids: 8 },
        training: { centers: ["ISEP Kédougou"], certifications: ["BT"] },
        publicProjects: { senelec: ["Raccordement OMVG"], rural: "ASER", progress: 40 }
    },
    matam: {
        name: "Matam",
        slug: "matam",
        capital: "Matam",
        population: "650 000",
        description: "Région du fleuve Sénégal, agriculture irriguée.",
        color: "hsl(176, 69%, 22%)",
        gadmName: "Matam",
        profile: { rate: 52.6, mainSource: "Hydro (OMVS)", installedPower: "70 MW", urbanRate: 72, ruralRate: 32 },
        infrastructure: { plants: ["Hydro OMVS"], substations: "3 Postes", lines: "Ligne Fleuve", underservedZones: ["Dandé Mayo"] },
        professionals: { count: 50, companies: ["PME locales"], specialties: ["Irrigation"], interventionZone: "Nord-Est" },
        stats: { avgConsumption: "310 kWh/an/hab", sectors: [{ name: "Agriculture", value: 50 }, { name: "Résidentiel", value: 40 }], technicalLosses: 17, avgOutages: 10 },
        issues: ["Chaleur extrême"],
        compliance: { normRespect: "Moyen", compliantRate: 42, needs: ["Isolation"] },
        renewable: { solarPotential: "Maximum", existingProjects: ["Irrigation Solaire"], miniGrids: 20 },
        training: { centers: ["Lycée Matam"], certifications: ["CAP"] },
        publicProjects: { senelec: ["Extension Ranérou"], rural: "ASER", progress: 45 }
    },
    sedhiou: {
        name: "Sédhiou",
        slug: "sedhiou",
        capital: "Sédhiou",
        population: "520 000",
        description: "Moyenne Casamance, patrimoine mandingue.",
        color: "hsl(185, 91%, 36%)",
        gadmName: "Sédhiou",
        profile: { rate: 38.9, mainSource: "Interconnecté", installedPower: "30 MW", urbanRate: 58, ruralRate: 18 },
        infrastructure: { plants: ["Import Kolda"], substations: "1 Poste", lines: "Antenne Sédhiou", underservedZones: ["Rive gauche"] },
        professionals: { count: 35, companies: ["Indépendants"], specialties: ["Bâtiment"], interventionZone: "Moyenne Casamance" },
        stats: { avgConsumption: "260 kWh/an/hab", sectors: [{ name: "Résidentiel", value: 65 }, { name: "Agriculture", value: 25 }], technicalLosses: 21, avgOutages: 13 },
        issues: ["Chutes de tension"],
        compliance: { normRespect: "Initial", compliantRate: 30, needs: ["Mise aux normes"] },
        renewable: { solarPotential: "Elevé", existingProjects: ["Kits"], miniGrids: 12 },
        training: { centers: ["N/A"], certifications: ["N/A"] },
        publicProjects: { senelec: ["Poste Sédhiou"], rural: "ASER", progress: 15 }
    }
};

/**
 * Mapping des noms GADM vers slugs
 */
export const gadmNameToSlug = (gadmName: string): string => {
    const mapping: Record<string, string> = {
        "Dakar": "dakar",
        "Thiès": "thies",
        "Saint-Louis": "saint-louis",
        "Diourbel": "diourbel",
        "Louga": "louga",
        "Fatick": "fatick",
        "Kaolack": "kaolack",
        "Kolda": "kolda",
        "Ziguinchor": "ziguinchor",
        "Tambacounda": "tambacounda",
        "Kaffrine": "kaffrine",
        "Kédougou": "kedougou",
        "Matam": "matam",
        "Sédhiou": "sedhiou"
    };

    return mapping[gadmName] || gadmName.toLowerCase().replace(/\s+/g, '-');
};

/**
 * Récupère les infos d'une région à partir du nom GADM
 */
export const getRegionByGadmName = (gadmName: string): RegionData | null => {
    const slug = gadmNameToSlug(gadmName);
    return regionsInfo[slug] || null;
};
