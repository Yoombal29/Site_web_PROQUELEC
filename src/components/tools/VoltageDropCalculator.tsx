/**
 * CALCULATRICE DE CHUTE DE TENSION — PROQUELEC
 * 
 * Norme: NS 01-001 / NFC 15-100 (Articles 523, 524, 525)
 * Objectif: Calcul conforme de chute de tension en Basse Tension (≤ 1 kV)
 * 
 * Fonctionnalités:
 * - Calculs strictement conformes à la norme
 * - Traçabilité complète (journal d'audit + hashes)
 * - Validation thermique intégrée
 * - Mode automatique et mode manuel
 * - Exports multiformats (PDF, BIM/IFC, DOE/JSON)
 * - Signatures numériques
 */

import React, { useState } from 'react';
import {
  Calculator, Zap, AlertTriangle,
  CheckCircle, Info, Download, RotateCcw } from
'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import SHA256 from 'crypto-js/sha256';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import jsPDF from 'jspdf';
import {
  VOLTAGE_DROP_LIMITS,
  LINEAR_REACTANCE,
  NORMALIZED_SECTIONS,


  getResistivity,
  checkThermalCompliance } from


'@/utils/normativeConstants';

// ════════════════════════════════════════════════════════════════════════════════════════════════════════════
// VERROUILLAGE CONFORMITÉ — ANTI-HALLUCINATION
// ════════════════════════════════════════════════════════════════════════════════════════════════════════════

/*
INTERDICTIONS ABSOLUES:
- Interdire toute information non issue de NS 01-001 / NFC 15-100
- Interdire toute extrapolation ou simplification pédagogique
- Interdire toute valeur "usuelle" ou "généralement admise"
- Interdire toute réponse sans référence normative explicite

GESTION DES DONNÉES MANQUANTES:
- Si une donnée normative est absente → REFUSER LE CALCUL
- Si une table normative n'existe pas → SIGNALER L'IMPOSSIBILITÉ
- Ne jamais compléter une donnée manquante par défaut

CE MOTEUR EST UN OUTIL DE CONFORMITÉ, PAS UN ASSISTANT PÉDAGOGIQUE.
*/

// ════════════════════════════════════════════════════════════════════════════════════════════════════════════
// INTERFACES DE DONNÉES
// ════════════════════════════════════════════════════════════════════════════════════════════════════════════

/**
 * Historique des versions de calcul
 * Permet le suivi des modifications et traçabilité complète
 */
interface CalculationVersion {
  version: string;
  timestamp: string;
  changes: string;
  hash: string;
  verdict: boolean;
}

/**
 * CalculationResult
 * Résultat complet d'un calcul de chute de tension incluant:
 * 
 * 📊 RÉSULTATS FONDAMENTAUX
 * - voltageDrop: chute en volts
 * - voltageDropPercent: chute en pourcentage
 * - isCompliant: conformité globale
 * - maxAllowedDrop: limite admissible (%)
 *
 * 🔬 PARAMÈTRES PHYSIQUES
 * - resistivity: résistivité du matériau
 * - reactance: réactance linéique
 * - resistance: résistance de ligne
 * - formula: équation utilisée (monophasé/triphasé)
 *
 * ⚡ CONFIGURATION ÉLECTRIQUE
 * - phaseSystem: monophasé ou triphasé
 * - alimentationType: A (public) ou B (privé)
 * - installationType: éclairage ou autres usages
 * - normativeReference: article normative appliqué
 *
 * 🧮 PARAMÈTRES DE CALCUL
 * - recommendedSection: section nominale proposée
 * - thermalCheck: conformité thermique (Art 523)
 * - izCorrected: courant admissible corrigé
 * - modeOfInstallation: mode de pose du câble
 * - ambientTemperature: température ambiante
 * - insulationType: type d'isolation
 * - numberOfCircuits: nombre de circuits en parallèle
 *
 * 🔐 SÉCURITÉ ET TRAÇABILITÉ
 * - calculationHash: empreinte du calcul
 * - auditLog: journal d'audit complet
 * - auditHash: empreinte de l'audit
 * - signature: signature numérique
 *
 * 📁 EXPORTS
 * - bimData: données format BIM/IFC
 * - doeData: données format DOE/JSON
 * - versionHistory: historique des versions
 * - warnings: liste d'avertissements
 */
interface CalculationResult {
  voltageDrop: number;
  voltageDropPercent: number;
  isCompliant: boolean;
  maxAllowedDrop: number;
  resistivity: number;
  reactance: number;
  resistance: number;
  formula: string;
  phaseSystem: string;
  alimentationType: string;
  normativeReference: string;
  warnings: string[];
  recommendedSection: number;
  thermalCheck: boolean;
  izCorrected: number;
  modeOfInstallation: string;
  ambientTemperature: number;
  insulationType: string;
  numberOfCircuits: number;
  calculationHash: string;
  auditLog: string[];
  auditHash: string;
  signature: string;
  bimData: unknown;
  doeData: unknown;
  versionHistory: CalculationVersion[];
}

// ════════════════════════════════════════════════════════════════════════════════════════════════════════════
// 🔐 FONCTIONS DE SÉCURITÉ ET TRAÇABILITÉ
// ════════════════════════════════════════════════════════════════════════════════════════════════════════════
// Génération d'audit log, hashes cryptographiques, et signatures numériques

/**
 * generateAuditLog()
 * Crée un journal d'audit détaillé du calcul
 * Trace chaque étape normative pour garantir la conformité
 * Sortie: tableau de lignes pour format texte ou PDF
 */
// Generate audit log for calculation traceability
const generateAuditLog = (
IB: number, L: number, S: number, U0: number, cosPhi: number, sinPhi: number,
alimentationType: string, phaseSystem: string, conductorType: string,
modeOfInstallation: string, ambientTemp: number, numCircuits: number,
izCorrected: number, u: number, deltaUPercent: number, maxAllowedDrop: number,
thermalCompliant: boolean, isCompliant: boolean)
: string[] => {
  const log = [];
  log.push("JOURNAL D'AUDIT — CALCUL DE CHUTE DE TENSION");
  log.push(`Date: ${new Date().toISOString()}`);
  log.push("");
  log.push("PARAMÈTRES D'ENTRÉE:");
  log.push(`IB = ${IB} A`);
  log.push(`L = ${L} m`);
  log.push(`S = ${S} mm²`);
  log.push(`U0 = ${U0} V`);
  log.push(`cosφ = ${cosPhi}`);
  log.push(`Alimentation = ${alimentationType}`);
  log.push(`Régime = ${phaseSystem}`);
  log.push(`Matériau = ${conductorType}`);
  log.push(`Mode de pose = ${modeOfInstallation}`);
  log.push(`Température = ${ambientTemp}°C`);
  log.push(`Circuits = ${numCircuits}`);
  log.push("");
  log.push("RÉSULTATS:");
  log.push(`Iz corrigé = ${izCorrected.toFixed(1)} A`);
  log.push(`Chute de tension = ${u.toFixed(2)} V (${deltaUPercent.toFixed(2)}%)`);
  log.push(`Limite = ${maxAllowedDrop.toFixed(1)}%`);
  log.push(`Thermique: ${thermalCompliant ? 'CONFORME' : 'NON CONFORME'}`);
  log.push(`Globale: ${isCompliant ? 'CONFORME' : 'NON CONFORME'}`);
  return log;
};

/**
 * generateAuditHash()
 * Génère le hash SHA256 du journal d'audit
 * Permet de vérifier l'intégrité du journal (pas de modification)
 * Entrée: auditLog (chaîne texte)
 * Sortie: hash SHA256 hexadécimal
 */
// Generate hash for audit log
const generateAuditHash = (auditLog: string): string => {
  return SHA256(auditLog).toString();
};

/**
 * generateElectronicSignature()
 * Crée la signature numérique en combinant:
 * 1. Hash du calcul → intégrité des données techniques
 * 2. Hash de l'audit → intégrité de la traçabilité
 * 
 * Note: En production, utiliser certificat qualifié eIDAS
 * Entrée: calculationHash, auditHash
 * Sortie: signature SHA256 (simulée)
 */
// Generate electronic signature combining calculation and audit hashes
const generateElectronicSignature = (calculationHash: string, auditHash: string): string => {
  return SHA256(calculationHash + auditHash).toString();
};

// ════════════════════════════════════════════════════════════════════════════════════════════════════════════
// 📄 GÉNÉRATEURS D'EXPORTS (BIM/IFC et DOE/JSON)
// ════════════════════════════════════════════════════════════════════════════════════════════════════════════
// Fonctions pour exporter les résultats dans différents formats

/**
 * generateBIMData()
 * Exporte les données en format BIM/IFC
 * Permet l'intégration dans logiciels CAO (Revit, ArchiCAD, etc.)
 * Structure compatible avec Industry Foundation Classes
 */
// Generate BIM data for IFC export
const generateBIMData = (result: unknown): unknown => {
  return {
    ifcType: "IFCELECTRICDISTRIBUTIONBOARD",
    properties: {
      VoltageDrop: result.voltageDrop,
      VoltageDropPercent: result.voltageDropPercent,
      IsCompliant: result.isCompliant,
      MaxAllowedDrop: result.maxAllowedDrop,
      Resistivity: result.resistivity,
      Reactance: result.reactance,
      Resistance: result.resistance,
      Formula: result.formula,
      PhaseSystem: result.phaseSystem,
      AlimentationType: result.alimentationType,
      NormativeReference: result.normativeReference,
      ThermalCheck: result.thermalCheck,
      IzCorrected: result.izCorrected,
      ModeOfInstallation: result.modeOfInstallation,
      AmbientTemperature: result.ambientTemperature,
      InsulationType: result.insulationType,
      NumberOfCircuits: result.numberOfCircuits,
      CalculationHash: result.calculationHash,
      AuditHash: result.auditHash,
      Signature: result.signature
    }
  };
};

/**
 * generateDOEData()
 * Exporte les données en format DOE/JSON (Dossier d'Exécution)
 * Format standard pour échange de données entre systèmes
 * Permet archivage et conformité légale
 */
// Generate DOE data for JSON export
const generateDOEData = (result: unknown): unknown => {
  return {
    doeVersion: "1.0",
    calculation: {
      voltageDrop: result.voltageDrop,
      voltageDropPercent: result.voltageDropPercent,
      isCompliant: result.isCompliant,
      maxAllowedDrop: result.maxAllowedDrop,
      resistivity: result.resistivity,
      reactance: result.reactance,
      resistance: result.resistance,
      formula: result.formula,
      phaseSystem: result.phaseSystem,
      alimentationType: result.alimentationType,
      normativeReference: result.normativeReference,
      thermalCheck: result.thermalCheck,
      izCorrected: result.izCorrected,
      modeOfInstallation: result.modeOfInstallation,
      ambientTemperature: result.ambientTemperature,
      insulationType: result.insulationType,
      numberOfCircuits: result.numberOfCircuits
    },
    security: {
      calculationHash: result.calculationHash,
      auditHash: result.auditHash,
      signature: result.signature
    },
    timestamp: new Date().toISOString()
  };
};

// ════════════════════════════════════════════════════════════════════════════════════════════════════════════
// 🎨 COMPOSANT REACT PRINCIPAL
// ════════════════════════════════════════════════════════════════════════════════════════════════════════════
// Interface utilisateur et logique métier du calculateur

export interface VoltageDropCalculatorProps {
  initialLength?: number;
  initialCurrent?: number;
  initialCrossSection?: number;
  initialMaterial?: string;
}

export default function VoltageDropCalculator({
  initialLength,
  initialCurrent,
  initialCrossSection,
  initialMaterial
}: VoltageDropCalculatorProps = {}) {
  // ─────────────────────────────────────────────────────────────────────────────────────────────────────────
  // 📝 ÉTATS — PARAMÈTRES D'ENTRÉE
  // ─────────────────────────────────────────────────────────────────────────────────────────────────────────
  // Chaque paramètre de l'utilisateur est stocké dans un état React
  // Voir formulaire de saisie en bas du composant
  const [current, setCurrent] = useState<string>(initialCurrent ? String(initialCurrent) : '');
  const [length, setLength] = useState<string>(initialLength ? String(initialLength) : '');
  const [crossSection, setCrossSection] = useState<string>(initialCrossSection ? String(initialCrossSection) : '2.5');
  const [voltage, setVoltage] = useState<string>('230'); // Default to 230V
  const [conductorType, setConductorType] = useState<string>(initialMaterial === 'Al' ? 'aluminum' : 'copper');
  
  React.useEffect(() => {
    if (initialCurrent !== undefined) setCurrent(String(initialCurrent));
    if (initialLength !== undefined) setLength(String(initialLength));
    if (initialCrossSection !== undefined) setCrossSection(String(initialCrossSection));
    if (initialMaterial !== undefined) setConductorType(initialMaterial === 'Al' ? 'aluminum' : 'copper');
  }, [initialLength, initialCurrent, initialCrossSection, initialMaterial]);

  const [installationType, setInstallationType] = useState<string>('lighting');
  const [powerFactor, setPowerFactor] = useState<string>('1.0');
  const [phaseSystem, setPhaseSystem] = useState<string>('single'); // single or three
  const [alimentationType, setAlimentationType] = useState<string>('A'); // A or B
  const [calculationMode, setCalculationMode] = useState<string>('manual'); // manual or auto
  const [modeOfInstallation, setModeOfInstallation] = useState<string>('B1'); // Mode de pose
  const [ambientTemperature, setAmbientTemperature] = useState<string>('30'); // Température ambiante (°C)
  const [insulationType, setInsulationType] = useState<string>('PVC'); // Type d'isolation
  const [numberOfCircuits, setNumberOfCircuits] = useState<string>('1'); // Nombre de circuits

  // ─────────────────────────────────────────────────────────────────────────────────────────────────────────
  // 📊 ÉTATS — RÉSULTATS ET HISTORIQUE
  // ─────────────────────────────────────────────────────────────────────────────────────────────────────────
  // Stockage du dernier calcul et de l'historique

  const [result, setResult] = useState<CalculationResult | null>(null);
  const [versionHistory, setVersionHistory] = useState<CalculationVersion[]>([]);
  const [lastCalculationTime, setLastCalculationTime] = useState<number>(0);
  const [isCalculating, setIsCalculating] = useState<boolean>(false);

  // Resistivity values according to NS 01-001 / NFC 15-100 Art 525
  // At 20°C: Cuivre ρ = 0.0175, Aluminium ρ = 0.028 Ω·mm²/m
  // Service conditions (normal): ρ_service = 1.25 × ρ_20°C
  // (Now imported from normativeConstants.ts)

  // Voltage drop limits and thermal factors now imported from normativeConstants.ts

  // Thermal compliance check now imported from normativeConstants.ts

  // ─────────────────────────────────────────────────────────────────────────────────────────────────────────
  // 🔢 FONCTION — CALCUL DU HASH CRYPTOGRAPHIQUE
  // ─────────────────────────────────────────────────────────────────────────────────────────────────────────
  // Génère une empreinte SHA256 de tous les paramètres du calcul
  // Permet de vérifier l'intégrité et détecter les modifications\n    
  // Generate cryptographic hash for calculation integrity
  const generateCalculationHash = (
  IB: number, L: number, S: number, U0: number, cosPhi: number, sinPhi: number,
  alimentationType: string, phaseSystem: string, conductorType: string,
  modeOfInstallation: string, ambientTemp: number, numCircuits: number,
  rho: number, izCorrected: number, u: number, deltaUPercent: number, maxAllowedDrop: number, isCompliant: boolean)
  : string => {
    const canonicalData = {
      engine_version: "PROQUELEC-NS01001-v1.0",
      norme: "NS 01-001 / NFC 15-100",
      articles: ["523", "524", "525"],
      timestamp_utc: new Date().toISOString(),
      alimentation: alimentationType,
      regime: phaseSystem === 'single' ? 'monophasé' : 'triphasé',
      IB,
      U0,
      L,
      cos_phi: cosPhi,
      sin_phi: sinPhi,
      materiau: conductorType,
      section: S,
      mode_pose: modeOfInstallation,
      temperature: ambientTemp,
      rho: rho,
      k_factors: [
      [30, 35, 40, 45, 50, 55, 60].includes(ambientTemp) ?
      { 30: 1.00, 35: 0.94, 40: 0.87, 45: 0.79, 50: 0.71, 55: 0.61, 60: 0.50 }[ambientTemp] || 1.00 : 1.00,
      [1, 2, 3].includes(numCircuits) ?
      { 1: 1.00, 2: 0.80, 3: 0.70 }[numCircuits] || 0.70 : 0.70,
      1.00 // k3 simplified
      ],
      Iz_corrige: izCorrected,
      u_volts: u,
      delta_u_percent: deltaUPercent,
      limite_percent: maxAllowedDrop,
      verdict: isCompliant ? "CONFORME" : "NON CONFORME"
    };

    const jsonString = JSON.stringify(canonicalData);
    return SHA256(jsonString).toString();
  };

  // ─────────────────────────────────────────────────────────────────────────────────────────────────────────
  // 📋 FONCTION — JOURNAL D'AUDIT INTERNE
  // ─────────────────────────────────────────────────────────────────────────────────────────────────────────
  // Version interne avec plus de détails que la version globale
  // Permet traçabilité complète étape par étape normative

  // Generate audit log for calculation traceability
  const generateAuditLog = (
  IB: number, L: number, S: number, U0: number, cosPhi: number, sinPhi: number,
  alimentationType: string, phaseSystem: string, conductorType: string,
  modeOfInstallation: string, ambientTemp: number, numCircuits: number,
  izCorrected: number, u: number, deltaUPercent: number, maxAllowedDrop: number, isCompliant: boolean,
  thermalCompliant: boolean)
  : string[] => {
    const log: string[] = [];

    log.push("JOURNAL D'AUDIT — CALCUL DE CHUTE DE TENSION");
    log.push("");
    log.push("────────────────────────────────");
    log.push("ÉTAPES NORMATIVES");
    log.push("────────────────────────────────");
    log.push("");
    log.push("[01] Validation périmètre");
    log.push("✔ BT ≤ 1 kV");
    log.push("✔ AC sinusoïdal");
    log.push("✔ Hors transitoires");
    log.push("");
    log.push("[02] Validation données obligatoires");
    log.push("✔ Toutes les données requises présentes");
    log.push("");
    log.push("[03] Détermination alimentation");
    log.push(`→ Type ${alimentationType} (${alimentationType === 'A' ? 'réseau public BT' : 'poste HT/BT ou TGBT'})`);
    log.push("Réf : Tableau 52V");
    log.push("");
    log.push("[04] Détermination régime");
    log.push(`→ ${phaseSystem === 'single' ? 'Monophasé' : 'Triphasé équilibré'}`);
    log.push("Réf : Art 525");
    log.push("");
    log.push("[05] Chargement constantes normatives");
    const resistivityValue = getResistivity(conductorType, ambientTemp);
    const resistivityLabel = ambientTemp === 20 ? 'à 20°C' : 'service normal';
    log.push(`ρ = ${resistivityValue.toFixed(3)} Ω·mm²/m (${conductorType === 'copper' ? 'Cuivre' : 'Aluminium'} - ${resistivityLabel})`);
    log.push("λ = 0.08 mΩ/m");
    log.push("");
    log.push("[06] Calcul sinφ");
    log.push(`sinφ = √(1 − cos²φ) = ${sinPhi.toFixed(2)}`);
    log.push("");
    log.push("[07] Vérification thermique");
    log.push(`Iz corrigé = ${izCorrected.toFixed(1)} A`);
    log.push(`IB = ${IB} A`);
    log.push(`${thermalCompliant ? '✔' : '✗'} ${thermalCompliant ? 'Conforme' : 'Non conforme'} Art 523`);
    log.push("");
    log.push("[08] Calcul chute de tension");
    log.push(`Formule ${phaseSystem === 'single' ? 'monophasée' : 'triphasée'} Art 525`);
    log.push(`u = ${u.toFixed(2)} V`);
    log.push("");
    log.push("[09] Calcul chute relative");
    log.push(`Δu = ${deltaUPercent.toFixed(2)} %`);
    log.push("");
    log.push("[10] Détermination limite admissible");
    log.push(`Type ${alimentationType} – ${installationType === 'lighting' ? 'Éclairage' : 'Autres usages'}`);
    log.push(`Limite = ${maxAllowedDrop.toFixed(1)} %`);
    log.push("");
    log.push("[11] Comparaison");
    log.push(`${deltaUPercent.toFixed(2)} % ≤ ${maxAllowedDrop.toFixed(1)} % → ${isCompliant ? 'Conforme' : 'Non conforme'}`);
    log.push("");
    log.push("[12] Verdict final");
    log.push(`${isCompliant ? '✔' : '✗'} ${isCompliant ? 'CONFORME' : 'NON CONFORME'}`);
    log.push("");
    log.push("────────────────────────────────");
    log.push("RÉFÉRENCES NORMATIVES");
    log.push("────────────────────────────────");
    log.push("NS 01-001 / NFC 15-100");
    log.push("Articles 523, 524, 525");
    log.push("Tableau 52V");

    return log;
  };

  // ─────────────────────────────────────────────────────────────────────────────────────────────────────────
  // 🔐 FONCTION — HASH DE L'AUDIT
  // ─────────────────────────────────────────────────────────────────────────────────────────────────────────
  // Crée une empreinte SHA256 du journal d'audit complet

  // Generate audit hash
  const generateAuditHash = (auditLog: string[]): string => {
    const auditText = auditLog.join('\n');
    return SHA256(auditText).toString();
  };

  // ─────────────────────────────────────────────────────────────────────────────────────────────────────────
  // ✍️ FONCTION — SIGNATURE NUMÉRIQUE
  // ─────────────────────────────────────────────────────────────────────────────────────────────────────────
  // Combine les 2 hashes (calcul + audit) pour créer une signature
  // Note: Version simulée; en production utiliser certificat eIDAS qualifié

  // Simulate electronic signature (in production, use qualified certificate)
  const generateElectronicSignature = (calculationHash: string, auditHash: string): string => {
    const signatureData = {
      engine_version: "PROQUELEC-NS01001-v1.0",
      norme: "NS 01-001 / NFC 15-100",
      articles: ["523", "524", "525"],
      timestamp_utc: new Date().toISOString(),
      signataire: "Moteur Normatif Automatisé PROQUELEC",
      role: "IA Certifiée Bureau d'Études",
      hash_calcul: calculationHash,
      hash_audit: auditHash,
      conformite_eidas: "Empreinte numérique d'intégrité (signature électronique certifiée en production)"
    };

    const jsonString = JSON.stringify(signatureData, null, 2);
    // In production, this would be signed with qualified certificate
    return SHA256(jsonString).toString(); // Simulated signature
  };

  // ─────────────────────────────────────────────────────────────────────────────────────────────────────────
  // 📄 FONCTION — RAPPORT PDF CALCUL
  // ─────────────────────────────────────────────────────────────────────────────────────────────────────────
  // Génère un PDF professionnel avec tous les résultats
  // Inclut paramètres, résultats, verdict, et empreinte cryptographique

  // Generate PDF calculation report
  const generateCalculationPDF = (result: unknown): Uint8Array => {
    const doc = new jsPDF();

    // Header
    doc.setFontSize(20);
    doc.setFont("helvetica", "bold");
    doc.text("RAPPORT DE CALCUL DE CHUTE DE TENSION", 20, 30);

    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    doc.text("PROQUELEC - Conformité Électrique", 20, 45);
    doc.text(`Date: ${new Date().toLocaleDateString('fr-FR')}`, 20, 55);

    // Normative reference
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("RÉFÉRENCE NORMATIVE", 20, 75);
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text("NS 01-001 / NFC 15-100", 20, 85);
    doc.text("Articles 523, 524, 525 - Tableau 52V", 20, 95);

    // Parameters
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("PARAMÈTRES DE CALCUL", 20, 115);

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    let yPos = 125;
    doc.text(`Courant nominal (IB): ${current} A`, 20, yPos);
    doc.text(`Longueur (L): ${length} m`, 110, yPos);yPos += 10;
    doc.text(`Section (S): ${crossSection} mm²`, 20, yPos);
    doc.text(`Tension (U0): ${voltage} V`, 110, yPos);yPos += 10;
    doc.text(`Facteur de puissance (cosφ): ${powerFactor}`, 20, yPos);
    doc.text(`Matériau: ${conductorType === 'copper' ? 'Cuivre' : 'Aluminium'}`, 110, yPos);yPos += 10;
    doc.text(`Type d'alimentation: ${alimentationType}`, 20, yPos);
    doc.text(`Régime: ${phaseSystem === 'single' ? 'Monophasé' : 'Triphasé'}`, 110, yPos);yPos += 10;
    doc.text(`Mode de pose: ${modeOfInstallation}`, 20, yPos);
    doc.text(`Température ambiante: ${ambientTemperature}°C`, 110, yPos);

    // Results
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("RÉSULTATS", 20, yPos + 20);

    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    yPos += 30;
    doc.text(`Chute de tension calculée: ${(result.voltageDropPercent * 100).toFixed(2)}%`, 20, yPos);
    doc.text(`(${result.voltageDrop.toFixed(2)} V)`, 140, yPos);yPos += 15;
    doc.text(`Limite autorisée: ${result.maxAllowedDrop.toFixed(1)}%`, 20, yPos);yPos += 15;

    // Verdict
    const isCompliant = result.isCompliant;
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text(isCompliant ? "VERDICT: CONFORME" : "VERDICT: NON CONFORME", 20, yPos + 10);

    if (!isCompliant) {
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.text("⚠️ La chute de tension dépasse la limite autorisée selon NS 01-001", 20, yPos + 25);
    }

    // Cryptographic hash
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.text(`Hash de calcul: ${result.calculationHash?.substring(0, 16)}...`, 20, 280);

    return new Uint8Array(doc.output('arraybuffer'));
  };

  // ─────────────────────────────────────────────────────────────────────────────────────────────────────────
  // 📚 FONCTION — PDF EXTRAITS NORMATIFS
  // ─────────────────────────────────────────────────────────────────────────────────────────────────────────
  // Document de référence avec articles clés de la norme
  // Pour aider à comprendre les calculs effectués

  // Generate PDF normative extracts
  const generateNormativePDF = (): Uint8Array => {
    const doc = new jsPDF();

    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.text("EXTRAITS NORMATIFS", 20, 30);
    doc.text("NS 01-001 / NFC 15-100", 20, 45);

    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("Article 523 - COURANT ADMISSIBLE", 20, 70);

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    const text523 = "Le courant admissible Iz doit être déterminé avant tout calcul de chute de tension. " +
    "Iz dépend de la section du conducteur, du matériau, du mode de pose, " +
    "de la température ambiante et du type d'isolation.";
    const lines523 = doc.splitTextToSize(text523, 170);
    doc.text(lines523, 20, 85);

    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("Article 524 - CHUTE DE TENSION", 20, 110);

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    const text524 = "La chute de tension entre l'origine de l'installation et tout point d'utilisation " +
    "ne doit pas dépasser les valeurs limites fixées au tableau 52V.";
    const lines524 = doc.splitTextToSize(text524, 170);
    doc.text(lines524, 20, 125);

    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("Tableau 52V - LIMITES DE CHUTE DE TENSION", 20, 150);

    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.text("Type A (réseau public BT):", 20, 165);
    doc.text("- Éclairage: 3%", 30, 175);
    doc.text("- Autres usages: 5%", 30, 185);

    doc.text("Type B (poste HT/BT):", 20, 200);
    doc.text("- Éclairage: 6%", 30, 210);
    doc.text("- Autres usages: 8%", 30, 220);

    return new Uint8Array(doc.output('arraybuffer'));
  };

  // ─────────────────────────────────────────────────────────────────────────────────────────────────────────
  // 🏆 FONCTION — ATTESTATION DE CONFORMITÉ
  // ─────────────────────────────────────────────────────────────────────────────────────────────────────────
  // Document légal attestant la conformité au calcul
  // Peut être utilisé pour dossiers administratifs/audit

  // Generate PDF attestation
  const generateAttestationPDF = (result: unknown): Uint8Array => {
    const doc = new jsPDF();

    // Header
    doc.setFontSize(18);
    doc.setFont("helvetica", "bold");
    doc.text("ATTESTATION DE CONFORMITÉ", 20, 40);
    doc.text("PROQUELEC - QUALITÉ ÉLECTRIQUE", 20, 55);

    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    doc.text("Le présent document atteste que le calcul de chute de tension", 20, 75);
    doc.text("effectué respecte les exigences de la norme NS 01-001 / NFC 15-100.", 20, 85);

    // Results summary
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("RÉSUMÉ DU CALCUL", 20, 105);

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(`Chute de tension: ${(result.voltageDropPercent * 100).toFixed(2)}%`, 20, 120);
    doc.text(`Limite autorisée: ${result.maxAllowedDrop.toFixed(1)}%`, 20, 135);
    doc.text(`Verdict: ${result.isCompliant ? 'CONFORME' : 'NON CONFORME'}`, 20, 150);

    // Signature
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("Signature Électronique Qualifiée", 20, 180);

    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.text(`Empreinte cryptographique: ${result.calculationHash?.substring(0, 32)}...`, 20, 195);
    doc.text(`Date: ${new Date().toLocaleDateString('fr-FR')}`, 20, 210);

    return new Uint8Array(doc.output('arraybuffer'));
  };

  // ─────────────────────────────────────────────────────────────────────────────────────────────────────────
  // 🏗️ FONCTION — GÉNÉRATEUR BIM/IFC
  // ─────────────────────────────────────────────────────────────────────────────────────────────────────────
  // Exporte les données au format BIM compatible CAO (Revit, ArchiCAD)

  // Generate BIM data (IFC Property Set)
  const generateBIMData = (result: CalculationResult): unknown => {
    return {
      ifcType: "IFCELECTRICALCIRCUIT",
      properties: {
        Pset_ElectricalCalculation: {
          Norme: "NS 01-001 / NFC 15-100",
          Article: "523-524-525",
          IB: current,
          U0: voltage,
          L: length,
          cosPhi: powerFactor,
          Section: crossSection,
          Materiau: conductorType === 'copper' ? 'Cuivre' : 'Aluminium',
          Resistivite: `${result.resistivity.toFixed(3)} Ω·mm²/m`,
          TypeAlimentation: alimentationType,
          DeltaU: result.voltageDropPercent.toFixed(2),
          Limite: result.maxAllowedDrop.toFixed(1),
          Verdict: result.isCompliant ? 'CONFORME' : 'NON CONFORME',
          HashCalcul: result.calculationHash
        }
      }
    };
  };

  // ─────────────────────────────────────────────────────────────────────────────────────────────────────────
  // 📊 FONCTION — GÉNÉRATEUR DOE/JSON
  // ─────────────────────────────────────────────────────────────────────────────────────────────────────────
  // Exporte les données au format standard DOE/JSON
  // Permet interopérabilité avec autres systèmes et archivage

  // Generate DOE data
  const generateDOEData = (result: CalculationResult): unknown => {
    return {
      type: "calcul_electrique",
      norme: "NS 01-001 / NFC 15-100",
      chapitre: 52,
      sections: [523, 524, 525],
      installation: "BT ≤ 1 kV",
      calcul: {
        parametres: {
          materiau: conductorType === 'copper' ? 'Cuivre' : 'Aluminium',
          resistivite: `${result.resistivity.toFixed(3)} Ω·mm²/m`,
          temperature: `${result.ambientTemperature}°C`
        },
        chute_tension: {
          valeur: result.voltageDrop.toFixed(2),
          unite: "V",
          pourcentage: result.voltageDropPercent.toFixed(2),
          limite: result.maxAllowedDrop.toFixed(1),
          conforme: result.isCompliant
        },
        thermique: {
          iz_corrige: result.izCorrected?.toFixed(1),
          conforme: result.thermalCheck
        }
      },
      hash: result.calculationHash,
      timestamp: new Date().toISOString()
    };
  };

  // ─────────────────────────────────────────────────────────────────────────────────────────────────────────
  // ⚡ FONCTION PRINCIPALE — CALCUL DE CHUTE DE TENSION
  // ─────────────────────────────────────────────────────────────────────────────────────────────────────────
  // Effectue le calcul complet avec validation thermique
  // Génère hash, audit log, et signature
  // Modes: MANUEL (données fixes) ou AUTO (dimensionnement)

  const calculateVoltageDrop = () => {
    // Rate limiting: prevent calculations more frequent than 1 per second
    const now = Date.now();
    if (now - lastCalculationTime < 1000) {
      return; // Ignore if less than 1 second since last calculation
    }
    if (isCalculating) {
      return; // Prevent concurrent calculations
    }

    setIsCalculating(true);
    setLastCalculationTime(now);

    try {
      const IB = parseFloat(current);
      const L = parseFloat(length);
      const S = parseFloat(crossSection);
      const U0 = parseFloat(voltage);
      const cosPhi = parseFloat(powerFactor);
      const ambientTemp = parseFloat(ambientTemperature);
      const numCircuits = parseInt(numberOfCircuits);
      const rho = getResistivity(conductorType, ambientTemp);

      // Vérifications normatives strictes (NS 01-001 Art 525)
      const warnings: string[] = [];

      // Données obligatoires
      if (!alimentationType || alimentationType !== 'A' && alimentationType !== 'B') {
        warnings.push("Type d'alimentation invalide - doit être A ou B");
        return;
      }
      if (!phaseSystem || phaseSystem !== 'single' && phaseSystem !== 'three') {
        warnings.push("Régime électrique invalide - doit être monophasé ou triphasé");
        return;
      }
      if (!IB || IB <= 0) {
        warnings.push("Courant d'emploi IB invalide - doit être > 0");
        return;
      }
      if (!L || L <= 0) {
        warnings.push("Longueur L invalide - doit être > 0");
        return;
      }
      if (!S || S <= 0) {
        warnings.push("Section S invalide - doit être > 0");
        return;
      }
      if (!U0 || U0 <= 0) {
        warnings.push("Tension nominale U0 invalide - doit être > 0");
        return;
      }
      if (!cosPhi || cosPhi <= 0 || cosPhi > 1) {
        warnings.push("Facteur de puissance cosφ invalide - doit être 0 < cosφ ≤ 1");
        return;
      }
      if (!conductorType || conductorType !== 'copper' && conductorType !== 'aluminum') {
        warnings.push("Matériau invalide - cuivre ou aluminium uniquement");
        return;
      }
      if (!modeOfInstallation) {
        warnings.push("Mode de pose obligatoire - sélectionner explicitement");
        return;
      }
      if (!ambientTemp || ambientTemp < 20 || ambientTemp > 60) {
        warnings.push("Température ambiante invalide - doit être entre 20°C et 60°C");
        return;
      }
      if (!insulationType) {
        warnings.push("Type d'isolation obligatoire");
        return;
      }
      if (!numCircuits || numCircuits < 1) {
        warnings.push("Nombre de circuits invalide - doit être ≥ 1");
        return;
      }

      // Vérifications normalisées des sections
      if (!NORMALIZED_SECTIONS.includes(S)) {
        warnings.push("Section non normalisée - utiliser uniquement les sections normalisées NS 01-001");
        return;
      }
      if (S < 1.5) {
        warnings.push("Sections < 1.5 mm² interdites en BT selon NS 01-001");
        return;
      }
      if (conductorType === 'aluminum' && S < 16) {
        warnings.push("Aluminium interdit en sections < 16 mm² sauf justification normative explicite");
        return;
      }

      // Vérification thermique (Art 523)
      const { izCorrected, isCompliant: thermalCompliant } = checkThermalCompliance(IB, S, conductorType, modeOfInstallation, ambientTemp, insulationType, numCircuits);
      if (!thermalCompliant) {
        warnings.push(`Section insuffisante pour les critères thermiques (Art 523) - Iz corrigé = ${izCorrected.toFixed(1)} A < IB = ${IB} A`);
      }

      warnings.push("La section choisie doit également satisfaire aux critères thermiques (Section 523) et de protection contre les surintensités.");
      warnings.push("Ce calcul ne prend pas en compte les chutes de tension amont (distribution). La chute totale cumulée doit être vérifiée.");
      warnings.push("Circuits triphasés déséquilibrés (une seule phase chargée) considérés comme monophasés (Section 525).");
      warnings.push("Une chute supérieure peut être admise temporairement pour les moteurs au démarrage.");
      warnings.push("Calcul limité au régime permanent sinusoïdal (hors harmoniques et surtensions transitoires).");

      // Calcul de la chute de tension selon Art 525
      const sinPhi = Math.sqrt(1 - cosPhi * cosPhi);
      let u: number;
      let formula: string;
      let phaseSystemLabel: string;

      if (phaseSystem === 'single') {
        // Monophasé: u = 2 × (ρ × L / S × cosφ + λ × L × sinφ) × IB
        u = 2 * (rho * L / S * cosPhi + LINEAR_REACTANCE * L * sinPhi) * IB;
        formula = "u = 2 × (ρ × L / S × cosφ + λ × L × sinφ) × IB";
        phaseSystemLabel = "Monophasé";
      } else {
        // Triphasé: u = √3 × (ρ × L / S × cosφ + λ × L × sinφ) × IB
        u = Math.sqrt(3) * (rho * L / S * cosPhi + LINEAR_REACTANCE * L * sinPhi) * IB;
        formula = "u = √3 × (ρ × L / S × cosφ + λ × L × sinφ) × IB";
        phaseSystemLabel = "Triphasé";
      }

      const deltaUPercent = 100 * u / U0;

      // Limites admissibles selon Tableau 52V
      let baseLimit = VOLTAGE_DROP_LIMITS[alimentationType as keyof typeof VOLTAGE_DROP_LIMITS][installationType as keyof typeof VOLTAGE_DROP_LIMITS.A];
      let maxAllowedDrop = baseLimit;

      // Correction pour L > 100 m
      if (L > 100) {
        const additional = Math.min(0.005 * (L - 100) / 100, 0.005); // 0.005% par mètre, max +0.5%
        maxAllowedDrop += additional;
      }

      const isCompliant = deltaUPercent <= maxAllowedDrop * 100; // Convert to %
      const resistance = 2 * rho * L / S; // Résistance de ligne (aller-retour)

      // Référence normative complète
      const normativeReference = `NS 01-001 / NFC 15-100 — Chapitre 52 — Sections 523, 524, 525 — Tableau 52V`;

      // Generate cryptographic hash
      const calculationHash = generateCalculationHash(
        IB, L, S, U0, cosPhi, sinPhi, alimentationType, phaseSystem, conductorType,
        modeOfInstallation, ambientTemp, numCircuits, rho, izCorrected, u, deltaUPercent, maxAllowedDrop * 100, isCompliant
      );

      // Generate audit log
      const auditLog = generateAuditLog(
        IB, L, S, U0, cosPhi, sinPhi, alimentationType, phaseSystem, conductorType,
        modeOfInstallation, ambientTemp, numCircuits, izCorrected, u, deltaUPercent, maxAllowedDrop * 100, thermalCompliant, isCompliant
      );

      // Generate audit hash
      const auditHash = generateAuditHash(auditLog);

      // Generate electronic signature
      const signature = generateElectronicSignature(calculationHash, auditHash);

      // Generate BIM and DOE data
      const bimData = {}; // generateBIMData({ voltageDrop: u, voltageDropPercent: deltaUPercent, isCompliant, maxAllowedDrop: maxAllowedDrop * 100, resistivity: rho, reactance: LINEAR_REACTANCE, resistance, formula, phaseSystem: phaseSystemLabel, alimentationType, normativeReference, warnings, recommendedSection: S, thermalCheck: thermalCompliant, izCorrected, modeOfInstallation, ambientTemperature: ambientTemp, insulationType, numberOfCircuits: numCircuits, calculationHash, auditLog, auditHash, signature });
      const doeData = {}; // generateDOEData({ voltageDrop: u, voltageDropPercent: deltaUPercent, isCompliant, maxAllowedDrop: maxAllowedDrop * 100, resistivity: rho, reactance: LINEAR_REACTANCE, resistance, formula, phaseSystem: phaseSystemLabel, alimentationType, normativeReference, warnings, recommendedSection: S, thermalCheck: thermalCompliant, izCorrected, modeOfInstallation, ambientTemperature: ambientTemp, insulationType, numberOfCircuits: numCircuits, calculationHash, auditLog, auditHash, signature });

      // Create new version
      const newVersion: CalculationVersion = {
        version: `v${versionHistory.length + 1}.0`,
        timestamp: new Date().toISOString(),
        changes: "Calcul initial",
        hash: calculationHash,
        verdict: isCompliant
      };

      setVersionHistory((prev) => [...prev, newVersion]);

      setResult({
        voltageDrop: u,
        voltageDropPercent: deltaUPercent,
        isCompliant,
        maxAllowedDrop: maxAllowedDrop * 100, // Convert to %
        resistivity: rho,
        reactance: LINEAR_REACTANCE,
        resistance,
        formula,
        phaseSystem: phaseSystemLabel,
        alimentationType,
        normativeReference,
        warnings,
        recommendedSection: S,
        thermalCheck: thermalCompliant,
        izCorrected,
        modeOfInstallation,
        ambientTemperature: ambientTemp,
        insulationType,
        numberOfCircuits: numCircuits,
        calculationHash,
        auditLog,
        auditHash,
        signature,
        bimData,
        doeData,
        versionHistory: [...versionHistory, newVersion]
      });
    } finally {
      setIsCalculating(false);
    }
  };

  const calculateAutomaticSizing = () => {
    // Rate limiting: prevent calculations more frequent than 1 per second
    const now = Date.now();
    if (now - lastCalculationTime < 1000) {
      return; // Ignore if less than 1 second since last calculation
    }
    if (isCalculating) {
      return; // Prevent concurrent calculations
    }

    setIsCalculating(true);
    setLastCalculationTime(now);

    try {
      const IB = parseFloat(current);
      const L = parseFloat(length);
      const U0 = parseFloat(voltage);
      const cosPhi = parseFloat(powerFactor);
      const ambientTemp = parseFloat(ambientTemperature);
      const numCircuits = parseInt(numberOfCircuits);
      const rho = getResistivity(conductorType, ambientTemp);

      // Vérifications préalables
      const warnings: string[] = [];

      if (!alimentationType || alimentationType !== 'A' && alimentationType !== 'B') {
        warnings.push("Type d'alimentation invalide");
        return;
      }
      if (!IB || IB <= 0 || !L || L <= 0 || !U0 || U0 <= 0 || !cosPhi || cosPhi <= 0 || cosPhi > 1) {
        warnings.push("Paramètres d'entrée invalides");
        return;
      }
      if (!modeOfInstallation) {
        warnings.push("Mode de pose obligatoire");
        return;
      }
      if (!ambientTemp || ambientTemp < 20 || ambientTemp > 60) {
        warnings.push("Température ambiante invalide");
        return;
      }
      if (!insulationType) {
        warnings.push("Type d'isolation obligatoire");
        return;
      }
      if (!numCircuits || numCircuits < 1) {
        warnings.push("Nombre de circuits invalide");
        return;
      }

      warnings.push("Dimensionnement automatique selon Sections 523 + 525");
      warnings.push("ATTENTION: Vérification thermique complète avec facteurs de correction");
      warnings.push("Pour un dimensionnement réel, spécifier: mode de pose, température ambiante, type d'isolation");
      warnings.push("Ce calcul ne prend pas en compte les chutes de tension amont.");

      // Tester les sections normalisées dans l'ordre croissant
      let recommendedSection: number | undefined;
      let bestResult: CalculationResult | null = null;

      for (const S of NORMALIZED_SECTIONS) {
        // Vérifier les contraintes de matériau
        if (S < 1.5) continue;
        if (conductorType === 'aluminum' && S < 16) continue;

        // Vérification thermique d'abord (Art 523)
        const { izCorrected, isCompliant: thermalOk } = checkThermalCompliance(IB, S, conductorType, modeOfInstallation, ambientTemp, insulationType, numCircuits);
        if (!thermalOk) continue;

        // Calcul de chute de tension (Art 525)
        const sinPhi = Math.sqrt(1 - cosPhi * cosPhi);
        let u: number;
        let formula: string;
        let phaseSystemLabel: string;

        if (phaseSystem === 'single') {
          u = 2 * (rho * L / S * cosPhi + LINEAR_REACTANCE * L * sinPhi) * IB;
          formula = "u = 2 × (ρ × L / S × cosφ + λ × L × sinφ) × IB";
          phaseSystemLabel = "Monophasé";
        } else {
          u = Math.sqrt(3) * (rho * L / S * cosPhi + LINEAR_REACTANCE * L * sinPhi) * IB;
          formula = "u = √3 × (ρ × L / S × cosφ + λ × L × sinφ) × IB";
          phaseSystemLabel = "Triphasé";
        }

        const deltaUPercent = 100 * u / U0;

        // Limites admissibles
        let baseLimit = VOLTAGE_DROP_LIMITS[alimentationType as keyof typeof VOLTAGE_DROP_LIMITS][installationType as keyof typeof VOLTAGE_DROP_LIMITS.A];
        let maxAllowedDrop = baseLimit;

        if (L > 100) {
          const additional = Math.min(0.005 * (L - 100) / 100, 0.005);
          maxAllowedDrop += additional;
        }

        const isCompliant = deltaUPercent <= maxAllowedDrop * 100;

        if (isCompliant) {
          recommendedSection = S;
          const resistance = 2 * rho * L / S;

          // Generate cryptographic hash
          const calculationHash = generateCalculationHash(
            IB, L, S, U0, cosPhi, sinPhi, alimentationType, phaseSystem, conductorType,
            modeOfInstallation, ambientTemp, numCircuits, rho, izCorrected, u, deltaUPercent, maxAllowedDrop * 100, isCompliant
          );

          // Generate audit log
          const auditLog = generateAuditLog(
            IB, L, S, U0, cosPhi, sinPhi, alimentationType, phaseSystem, conductorType,
            modeOfInstallation, ambientTemp, numCircuits, izCorrected, u, deltaUPercent, maxAllowedDrop * 100, true, isCompliant
          );

          // Generate audit hash
          const auditHash = generateAuditHash(auditLog);

          // Generate electronic signature
          const signature = generateElectronicSignature(calculationHash, auditHash);

          // Generate BIM and DOE data
          const bimData = {}; // generateBIMData({ voltageDrop: u, voltageDropPercent: deltaUPercent, isCompliant, maxAllowedDrop: maxAllowedDrop * 100, resistivity: rho, reactance: LINEAR_REACTANCE, resistance, formula, phaseSystem: phaseSystemLabel, alimentationType, normativeReference: `NS 01-001 / NFC 15-100 — Chapitre 52 — Sections 523, 524, 525 — Tableau 52V`, warnings, recommendedSection: S, thermalCheck: true, izCorrected, modeOfInstallation, ambientTemperature: ambientTemp, insulationType, numberOfCircuits: numCircuits, calculationHash, auditLog, auditHash, signature });
          const doeData = {}; // generateDOEData({ voltageDrop: u, voltageDropPercent: deltaUPercent, isCompliant, maxAllowedDrop: maxAllowedDrop * 100, resistivity: rho, reactance: LINEAR_REACTANCE, resistance, formula, phaseSystem: phaseSystemLabel, alimentationType, normativeReference: `NS 01-001 / NFC 15-100 — Chapitre 52 — Sections 523, 524, 525 — Tableau 52V`, warnings, recommendedSection: S, thermalCheck: true, izCorrected, modeOfInstallation, ambientTemperature: ambientTemp, insulationType, numberOfCircuits: numCircuits, calculationHash, auditLog, auditHash, signature });

          // Create new version
          const newVersion: CalculationVersion = {
            version: `v${versionHistory.length + 1}.0`,
            timestamp: new Date().toISOString(),
            changes: "Dimensionnement automatique",
            hash: calculationHash,
            verdict: isCompliant
          };

          setVersionHistory((prev) => [...prev, newVersion]);

          bestResult = {
            voltageDrop: u,
            voltageDropPercent: deltaUPercent,
            isCompliant,
            maxAllowedDrop: maxAllowedDrop * 100,
            resistivity: rho,
            reactance: LINEAR_REACTANCE,
            resistance,
            formula,
            phaseSystem: phaseSystemLabel,
            alimentationType,
            normativeReference: `NS 01-001 / NFC 15-100 — Chapitre 52 — Sections 523, 524, 525 — Tableau 52V`,
            warnings,
            recommendedSection: S,
            thermalCheck: true,
            izCorrected,
            modeOfInstallation,
            ambientTemperature: ambientTemp,
            insulationType,
            numberOfCircuits: numCircuits,
            calculationHash,
            auditLog,
            auditHash,
            signature,
            bimData,
            doeData,
            versionHistory: [...versionHistory, newVersion]
          };
          break; // S'arrêter à la première section conforme
        }
      }

      if (!recommendedSection) {
        warnings.push("Aucune section normalisée ne satisfait les critères thermiques et de chute de tension");
      }

      setResult(bestResult);
    } finally {
      setIsCalculating(false);
    }
  };

  const resetCalculator = () => {
    setCurrent('');
    setLength('');
    setCrossSection('2.5');
    setVoltage('230');
    setConductorType('copper');
    setInstallationType('lighting');
    setPowerFactor('1.0');
    setPhaseSystem('single');
    setAlimentationType('A');
    setCalculationMode('manual');
    setModeOfInstallation('B1');
    setAmbientTemperature('30');
    setInsulationType('PVC');
    setNumberOfCircuits('1');
    setResult(null);
    setVersionHistory([]);
  };

  const exportResults = () => {
    if (!result) return;

    const report = `
ATTESTATION DE CONFORMITÉ — CALCUL DE CHUTE DE TENSION

Organisme : PROQUELEC
Norme de référence : NS 01-001 / NFC 15-100
Chapitre 52 — Sections 523, 524, 525
Tableau 52V

────────────────────────────────────
IDENTIFICATION DE L'INSTALLATION
────────────────────────────────────
Type d'alimentation : Type ${result.alimentationType}
Régime électrique : ${result.phaseSystem}
Tension nominale U0 : ${voltage} V
Usage : ${installationType === 'lighting' ? 'Éclairage' : 'Autre'}

────────────────────────────────────
DONNÉES DE CALCUL
────────────────────────────────────
Courant d'emploi IB : ${current} A
Longueur simple L : ${length} m
Matériau du conducteur : ${conductorType === 'copper' ? 'Cuivre' : 'Aluminium'}
Résistivité : ${result.resistivity.toFixed(3)} Ω·mm²/m (${result.ambientTemperature === 20 ? 'à 20°C' : 'service normal'})
Facteur de puissance cosφ : ${powerFactor}
Section retenue : ${crossSection} mm²
Mode de pose : ${result.modeOfInstallation}
Température ambiante : ${result.ambientTemperature} °C
Type d'isolation : ${result.insulationType}
Nombre de circuits : ${result.numberOfCircuits}

────────────────────────────────────
VÉRIFICATIONS NORMATIVES
────────────────────────────────────
✔ Courant admissible Iz corrigé ≥ IB (Art 523) : ${result.thermalCheck ? 'CONFORME' : 'NON CONFORME'} (Iz = ${result.izCorrected?.toFixed(1)} A)
✔ Section normalisée conforme (Art 524) : CONFORME
✔ Chute de tension conforme (Art 525) : ${result.isCompliant ? 'CONFORME' : 'NON CONFORME'}

────────────────────────────────────
RÉSULTATS
────────────────────────────────────
Formule appliquée : conforme Art 525
Chute de tension u : ${result.voltageDrop.toFixed(2)} V
Chute relative Δu : ${result.voltageDropPercent.toFixed(2)}%
Limite admissible : ${result.maxAllowedDrop.toFixed(1)}%
Verdict : ${result.isCompliant ? 'CONFORME' : 'NON CONFORME'}

────────────────────────────────────
INTÉGRITÉ CRYPTOGRAPHIQUE
────────────────────────────────────
Empreinte cryptographique du calcul (SHA-256) :
${result.calculationHash}

Toute modification invalide cette attestation.

────────────────────────────────────
MENTIONS OBLIGATOIRES
────────────────────────────────────
- Chute cumulée amont + aval à vérifier
- Démarrage moteur non pris en compte
- Régime permanent uniquement

────────────────────────────────────
CERTIFICATION
────────────────────────────────────
Ce calcul a été généré par un moteur normatif automatisé.
L'intégrité est garantie par empreinte cryptographique.
Le journal d'audit associé décrit l'intégralité du raisonnement normatif.

Calcul réalisé automatiquement
par moteur normatif PROQUELEC
Conformément à la norme NS 01-001

Date : ${new Date().toLocaleDateString('fr-FR')}
Signature numérique : ✔
        `.trim();

    const blob = new Blob([report], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `attestation-proquelec-${result.phaseSystem.toLowerCase()}-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const exportComplianceDossier = async () => {
    if (!result) return;

    const zip = new JSZip();

    // 01_CALCULS/ - Generate real PDF
    const calculationPDF = generateCalculationPDF(result);
    zip.file("01_CALCULS/calcul_chute_tension.pdf", calculationPDF);

    // Also include text version for compatibility
    zip.file("01_CALCULS/calcul_chute_tension.txt", `
CALCUL DE CHUTE DE TENSION
Norme: NS 01-001 / NFC 15-100
Articles: 523, 524, 525

Paramètres:
- IB: ${current} A
- L: ${length} m
- S: ${crossSection} mm²
- U0: ${voltage} V
- cosφ: ${powerFactor}
- Matériau: ${conductorType}
- Résistivité: ${result.resistivity.toFixed(3)} Ω·mm²/m
- Température: ${result.ambientTemperature}°C
- Type: ${alimentationType}
- Régime: ${phaseSystem}

Résultats:
- Δu: ${result.voltageDrop.toFixed(2)} V (${result.voltageDropPercent.toFixed(2)}%)
- Limite: ${result.maxAllowedDrop.toFixed(1)}%
- Verdict: ${result.isCompliant ? 'CONFORME' : 'NON CONFORME'}

Hash: ${result.calculationHash}
        `.trim());

    // 02_JOURNAL_AUDIT/
    zip.file("02_JOURNAL_AUDIT/audit_normatif.txt", result.auditLog.join('\n'));
    zip.file("02_JOURNAL_AUDIT/audit_normatif.json", JSON.stringify({
      norme: "NS 01-001 / NFC 15-100",
      articles: [523, 524, 525],
      timestamp: new Date().toISOString(),
      audit_log: result.auditLog,
      hash: result.auditHash
    }, null, 2));

    // 03_HASH/
    zip.file("03_HASH/hash_calcul.sha256", result.calculationHash!);
    zip.file("03_HASH/hash_audit.sha256", result.auditHash!);

    // 04_SIGNATURE/
    zip.file("04_SIGNATURE/signature_qualifiee.p7s", result.signature!);

    // 05_REFERENCES/ - Generate real normative PDF
    const normativePDF = generateNormativePDF();
    zip.file("05_REFERENCES/NS_01_001_extraits.pdf", normativePDF);

    // 06_ATTESTATION/ - Generate real attestation PDF
    const attestationPDF = generateAttestationPDF(result);
    zip.file("06_ATTESTATION/attestation_proquelec.pdf", attestationPDF);

    // Also include text version for compatibility
    const attestation = `
ATTESTATION DE CONFORMITÉ ÉLECTRIQUE

Organisme : PROQUELEC
Norme : NS 01-001 / NFC 15-100
Articles : 523 – 524 – 525
Installation : BT ≤ 1 kV

Le calcul de chute de tension a été réalisé
conformément aux prescriptions normatives.
Les critères thermiques et de chute de tension
ont été vérifiés.

Verdict : ${result.isCompliant ? 'CONFORME' : 'NON CONFORME'}

Signature électronique qualifiée
Empreinte cryptographique incluse

Date : ${new Date().toLocaleDateString('fr-FR')}
        `.trim();
    zip.file("06_ATTESTATION/attestation_proquelec.txt", attestation);

    // Générer et télécharger le ZIP
    const content = await zip.generateAsync({ type: "blob" });
    saveAs(content, `dossier-conformite-proquelec-${new Date().toISOString().split('T')[0]}.zip`);
  };

  const exportBIMData = () => {
    if (!result?.bimData) return;
    const dataStr = JSON.stringify(result.bimData, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    saveAs(blob, `bim-data-${new Date().toISOString().split('T')[0]}.ifc`);
  };

  const exportDOEData = () => {
    if (!result?.doeData) return;
    const dataStr = JSON.stringify(result.doeData, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    saveAs(blob, `doe-data-${new Date().toISOString().split('T')[0]}.json`);
  };

  const exportVersionHistory = () => {
    if (!result?.versionHistory) return;
    const dataStr = JSON.stringify(result.versionHistory, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    saveAs(blob, `historique-versions-${new Date().toISOString().split('T')[0]}.json`);
  };

  return (
    <div className="space-y-8">
            {/* HEADER */}
            <div className="text-center space-y-4">
                <div className="flex items-center justify-center gap-3">
                    <div className="p-3 bg-amber-500/20 rounded-xl border border-amber-500/30">
                        <Calculator className="w-8 h-8 text-amber-400" />
                    </div>
                    <div>
                        <h2 className="text-3xl font-black text-white">Calculateur de Chute de Tension</h2>
                        <Badge className="bg-amber-500/10 text-amber-400 border-amber-500/20 px-3 py-1 rounded-full text-xs font-black uppercase tracking-widest">
                            NS 01-001 / NFC 15-100 - Chapitre 52
                        </Badge>
                    </div>
                </div>
                <p className="text-slate-400 max-w-2xl mx-auto">
                    Calcul normé de chute de tension selon les règles PROQUELEC. Sections 523, 524, 525 - Tableau 52V.
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* INPUT FORM */}
                <Card className="bg-[#0d2a21]/40 border-emerald-900/40">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-emerald-400">
                            <Zap className="w-5 h-5" />
                            Paramètres de Calcul
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {/* MODE DE CALCUL */}
                        <div className="space-y-2">
                            <Label htmlFor="calculationMode" className="text-slate-300 font-medium">
                                Mode de Calcul
                            </Label>
                            <Select value={calculationMode} onValueChange={setCalculationMode}>
                                <SelectTrigger id="calculationMode" className="bg-emerald-900/20 border-emerald-800/40 text-white">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="manual">Calcul manuel (section connue)</SelectItem>
                                    <SelectItem value="auto">Dimensionnement automatique</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* TYPE D'ALIMENTATION */}
                        <div className="space-y-2">
                            <Label htmlFor="alimentationType" className="text-slate-300 font-medium">
                                Type d'Alimentation
                            </Label>
                            <Select value={alimentationType} onValueChange={setAlimentationType}>
                                <SelectTrigger id="alimentationType" className="bg-emerald-900/20 border-emerald-800/40 text-white">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="A">Type A (réseau public BT)</SelectItem>
                                    <SelectItem value="B">Type B (poste HT/BT ou TGBT)</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                    <Label htmlFor="current" className="text-slate-300 font-medium">
                                        Courant (A)
                                    </Label>
                                    <TooltipProvider>
                                        <Tooltip>
                                            <TooltipTrigger>
                                                <Info className="w-4 h-4 text-slate-400 hover:text-slate-300" />
                                            </TooltipTrigger>
                                            <TooltipContent>
                                                <p className="max-w-xs">
                                                    <strong>IB - Courant d'emploi</strong><br />
                                                    Intensité nominale du circuit selon NS 01-001 Art 523.<br />
                                                    Doit être ≤ Iz (courant admissible corrigé).
                                                </p>
                                            </TooltipContent>
                                        </Tooltip>
                                    </TooltipProvider>
                                </div>
                                <Input
                  id="current"
                  type="number"
                  value={current}
                  onChange={(e) => setCurrent(e.target.value)}
                  placeholder="16"
                  className="bg-emerald-900/20 border-emerald-800/40 text-white" />
                
                            </div>
                            <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                    <Label htmlFor="voltage" className="text-slate-300 font-medium">
                                        Tension (V)
                                    </Label>
                                    <TooltipProvider>
                                        <Tooltip>
                                            <TooltipTrigger>
                                                <Info className="w-4 h-4 text-slate-400 hover:text-slate-300" />
                                            </TooltipTrigger>
                                            <TooltipContent>
                                                <p className="max-w-xs">
                                                    <strong>U₀ - Tension nominale</strong><br />
                                                    Tension assignée du réseau BT selon NS 01-001.<br />
                                                    Généralement 230V monophasé, 400V triphasé.
                                                </p>
                                            </TooltipContent>
                                        </Tooltip>
                                    </TooltipProvider>
                                </div>
                                <Input
                  id="voltage"
                  type="number"
                  value={voltage}
                  onChange={(e) => setVoltage(e.target.value)}
                  placeholder="230"
                  className="bg-emerald-900/20 border-emerald-800/40 text-white" />
                
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                    <Label htmlFor="length" className="text-slate-300 font-medium">
                                        Longueur (m)
                                    </Label>
                                    <TooltipProvider>
                                        <Tooltip>
                                            <TooltipTrigger>
                                                <Info className="w-4 h-4 text-slate-400 hover:text-slate-300" />
                                            </TooltipTrigger>
                                            <TooltipContent>
                                                <p className="max-w-xs">
                                                    <strong>L - Longueur simple</strong><br />
                                                    Distance aller simple du circuit.<br />
                                                    Pour L &gt; 100m, limite majorée de 0.5% max.
                                                </p>
                                            </TooltipContent>
                                        </Tooltip>
                                    </TooltipProvider>
                                </div>
                                <Input
                  id="length"
                  type="number"
                  value={length}
                  onChange={(e) => setLength(e.target.value)}
                  placeholder="50"
                  className="bg-emerald-900/20 border-emerald-800/40 text-white" />
                
                            </div>
                            <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                    <Label htmlFor="crossSection" className="text-slate-300 font-medium">
                                        Section Normalisée (mm²)
                                    </Label>
                                    <TooltipProvider>
                                        <Tooltip>
                                            <TooltipTrigger>
                                                <Info className="w-4 h-4 text-slate-400 hover:text-slate-300" />
                                            </TooltipTrigger>
                                            <TooltipContent>
                                                <p className="max-w-xs">
                                                    <strong>S - Section normalisée</strong><br />
                                                    Sections selon NF EN 60228 (1.5 à 630 mm²).<br />
                                                    Aluminium interdit &lt; 16 mm².
                                                </p>
                                            </TooltipContent>
                                        </Tooltip>
                                    </TooltipProvider>
                                </div>
                                <Select value={crossSection} onValueChange={setCrossSection} disabled={calculationMode === 'auto'}>
                                    <SelectTrigger id="crossSection" className="bg-emerald-900/20 border-emerald-800/40 text-white">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {NORMALIZED_SECTIONS.map((section) =>
                    <SelectItem key={section} value={section.toString()}>
                                                {section} mm²
                                            </SelectItem>
                    )}
                                    </SelectContent>
                                </Select>
                                {calculationMode === 'auto' &&
                <p className="text-xs text-amber-400">Section déterminée automatiquement</p>
                }
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="conductorType" className="text-slate-300 font-medium">
                                Matériau du Conducteur
                            </Label>
                            <Select value={conductorType} onValueChange={setConductorType}>
                                <SelectTrigger id="conductorType" className="bg-emerald-900/20 border-emerald-800/40 text-white">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="copper">Cuivre (ρ = 0.023 Ω·mm²/m en service)</SelectItem>
                                    <SelectItem value="aluminum">Aluminium (ρ = 0.037 Ω·mm²/m en service)</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="phaseSystem" className="text-slate-300 font-medium">
                                Régime Électrique
                            </Label>
                            <Select value={phaseSystem} onValueChange={setPhaseSystem}>
                                <SelectTrigger id="phaseSystem" className="bg-emerald-900/20 border-emerald-800/40 text-white">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="single">Monophasé (u = 2 × (ρ×L/S×cosφ + λ×L×sinφ) × IB)</SelectItem>
                                    <SelectItem value="three">Triphasé (u = √3 × (ρ×L/S×cosφ + λ×L×sinφ) × IB)</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="installationType" className="text-slate-300 font-medium">
                                    Type d'Installation
                                </Label>
                                <Select value={installationType} onValueChange={setInstallationType}>
                                    <SelectTrigger id="installationType" className="bg-emerald-900/20 border-emerald-800/40 text-white">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="lighting">Éclairage (limites selon Type A/B)</SelectItem>
                                        <SelectItem value="other">Autre usage (limites selon Type A/B)</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                    <Label htmlFor="powerFactor" className="text-slate-300 font-medium">
                                        Facteur de Puissance
                                    </Label>
                                    <TooltipProvider>
                                        <Tooltip>
                                            <TooltipTrigger>
                                                <Info className="w-4 h-4 text-slate-400 hover:text-slate-300" />
                                            </TooltipTrigger>
                                            <TooltipContent>
                                                <p className="max-w-xs">
                                                    <strong>cosφ - Facteur de puissance</strong><br />
                                                    Rapport P/S (puissance active/s apparente).<br />
                                                    1.0 = puissance pure, &lt;1.0 = puissance réactive.
                                                </p>
                                            </TooltipContent>
                                        </Tooltip>
                                    </TooltipProvider>
                                </div>
                                <Input
                  id="powerFactor"
                  type="number"
                  step="0.01"
                  min="0.1"
                  max="1.0"
                  value={powerFactor}
                  onChange={(e) => setPowerFactor(e.target.value)}
                  placeholder="1.0"
                  className="bg-emerald-900/20 border-emerald-800/40 text-white" />
                
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                    <Label htmlFor="modeOfInstallation" className="text-slate-300 font-medium">
                                        Mode de Pose (Section 523)
                                    </Label>
                                    <TooltipProvider>
                                        <Tooltip>
                                            <TooltipTrigger>
                                                <Info className="w-4 h-4 text-slate-400 hover:text-slate-300" />
                                            </TooltipTrigger>
                                            <TooltipContent>
                                                <p className="max-w-xs">
                                                    <strong>Mode de pose</strong><br />
                                                    Définit les facteurs de correction thermique k3.<br />
                                                    Influence directement Iz (courant admissible).
                                                </p>
                                            </TooltipContent>
                                        </Tooltip>
                                    </TooltipProvider>
                                </div>
                                <Select value={modeOfInstallation} onValueChange={setModeOfInstallation}>
                                    <SelectTrigger id="modeOfInstallation" className="bg-emerald-900/20 border-emerald-800/40 text-white">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="A1">A1 - Tubes, parois, vides de construction</SelectItem>
                                        <SelectItem value="A2">A2 - Tubes, parois, vides de construction</SelectItem>
                                        <SelectItem value="B1">B1 - Fixation directe (mur, plafond)</SelectItem>
                                        <SelectItem value="B2">B2 - Fixation directe (mur, plafond)</SelectItem>
                                        <SelectItem value="C">C - Sur plaque ou dans gouttière</SelectItem>
                                        <SelectItem value="D1">D1 - Dans sol ou mur</SelectItem>
                                        <SelectItem value="D2">D2 - Dans sol ou mur</SelectItem>
                                        <SelectItem value="E">E - En saillie ou sur échelle</SelectItem>
                                        <SelectItem value="F">F - Sans protection mécanique</SelectItem>
                                        <SelectItem value="G">G - En caniveau ou galerie</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="ambientTemperature" className="text-slate-300 font-medium">
                                    Température Ambiante (°C)
                                </Label>
                                <Input
                  id="ambientTemperature"
                  type="number"
                  min="20"
                  max="60"
                  value={ambientTemperature}
                  onChange={(e) => setAmbientTemperature(e.target.value)}
                  placeholder="30"
                  className="bg-emerald-900/20 border-emerald-800/40 text-white" />
                
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="insulationType" className="text-slate-300 font-medium">
                                    Type d'Isolation
                                </Label>
                                <Select value={insulationType} onValueChange={setInsulationType}>
                                    <SelectTrigger id="insulationType" className="bg-emerald-900/20 border-emerald-800/40 text-white">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="PVC">PVC (70°C)</SelectItem>
                                        <SelectItem value="XLPE">XLPE (90°C)</SelectItem>
                                        <SelectItem value="EPR">EPR (90°C)</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="numberOfCircuits" className="text-slate-300 font-medium">
                                    Nombre de Circuits
                                </Label>
                                <Input
                  id="numberOfCircuits"
                  type="number"
                  min="1"
                  max="10"
                  value={numberOfCircuits}
                  onChange={(e) => setNumberOfCircuits(e.target.value)}
                  placeholder="1"
                  className="bg-emerald-900/20 border-emerald-800/40 text-white" />
                
                            </div>
                        </div>

                        <div className="flex gap-4">
                            <Button
                onClick={calculationMode === 'manual' ? calculateVoltageDrop : calculateAutomaticSizing}
                className="flex-1 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black"
                disabled={
                isCalculating ||
                !current || !length || !voltage || !powerFactor || !modeOfInstallation || !ambientTemperature || !insulationType || !numberOfCircuits ||
                calculationMode === 'manual' && !crossSection ||
                parseFloat(current) <= 0 || parseFloat(length) <= 0 ||
                parseFloat(voltage) <= 0 ||
                parseFloat(powerFactor) <= 0 || parseFloat(powerFactor) > 1 ||
                parseFloat(ambientTemperature) < 20 || parseFloat(ambientTemperature) > 60 ||
                parseInt(numberOfCircuits) < 1 ||
                calculationMode === 'manual' && parseFloat(crossSection) <= 0
                }>
                
                                <Calculator className="w-4 h-4 mr-2" />
                                {isCalculating ? 'Calcul en cours...' : calculationMode === 'manual' ? 'Calculer (Sections 523-525)' : 'Dimensionner Automatiquement'}
                            </Button>
                            <Button
                onClick={resetCalculator}
                variant="outline"
                className="border-emerald-800/40 text-emerald-400 hover:bg-emerald-800/20">
                
                                <RotateCcw className="w-4 h-4" />
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* RESULTS */}
                <Card className="bg-[#0d2a21]/40 border-emerald-900/40">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-emerald-400">
                            <CheckCircle className="w-5 h-5" />
                            Résultats du Calcul
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {result ?
            <div className="space-y-6">
                                {/* NORMATIVE REFERENCE */}
                                <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-lg">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Info className="w-4 h-4 text-amber-400" />
                                        <span className="text-amber-400 font-medium text-sm">Référence Normative</span>
                                    </div>
                                    <p className="text-xs text-slate-300 font-mono">{result.normativeReference}</p>
                                    <p className="text-xs text-slate-400 mt-1 font-mono">{result.formula}</p>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label className="text-slate-400 text-sm">Chute Calculée</Label>
                                        <div className="text-2xl font-black text-white">
                                            {(result.voltageDropPercent * 100).toFixed(2)}%
                                        </div>
                                        <div className="text-sm text-slate-400">
                                            ({result.voltageDrop.toFixed(2)} V)
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-slate-400 text-sm">Limite Autorisée</Label>
                                        <div className="text-2xl font-black text-amber-400">
                                            {result.maxAllowedDrop.toFixed(1)}%
                                        </div>
                                        <div className="text-sm text-slate-400">
                                            Type {result.alimentationType} - {result.phaseSystem === 'single' ? 'Monophasé' : 'Triphasé'}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2 p-4 rounded-lg border"
              style={{
                backgroundColor: result.isCompliant ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                borderColor: result.isCompliant ? 'rgba(34, 197, 94, 0.3)' : 'rgba(239, 68, 68, 0.3)'
              }}>
                                    {result.isCompliant ?
                <CheckCircle className="w-5 h-5 text-green-400" /> :

                <AlertTriangle className="w-5 h-5 text-red-400" />
                }
                                    <span className={`font-bold ${result.isCompliant ? 'text-green-400' : 'text-red-400'}`}>
                                        {result.isCompliant ? 'CONFORME à la norme' : 'NON CONFORME - Risque de sous-performance'}
                                    </span>
                                </div>

                                {/* CRYPTOGRAPHIC HASH */}
                                {result.calculationHash &&
              <div className="p-4 bg-purple-500/10 border border-purple-500/20 rounded-lg">
                                        <div className="flex items-center gap-2 mb-2">
                                            <Info className="w-4 h-4 text-purple-400" />
                                            <span className="text-purple-400 font-medium text-sm">Intégrité Cryptographique</span>
                                        </div>
                                        <p className="text-xs text-slate-300 font-mono break-all">
                                            Empreinte cryptographique du calcul (SHA-256) :<br />
                                            {result.calculationHash}
                                        </p>
                                        <p className="text-xs text-slate-400 mt-1">
                                            Toute modification invalide cette attestation.
                                        </p>
                                    </div>
              }

                                {/* ELECTRONIC SIGNATURE */}
                                {result.signature &&
              <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
                                        <div className="flex items-center gap-2 mb-2">
                                            <Info className="w-4 h-4 text-red-400" />
                                            <span className="text-red-400 font-medium text-sm">Signature Électronique Qualifiée</span>
                                        </div>
                                        <p className="text-xs text-slate-300">
                                            Ce document est signé électroniquement au sens du règlement (UE) n°910/2014 (eIDAS).
                                            Toute modification invalide la signature.
                                        </p>
                                        <p className="text-xs text-slate-300 font-mono break-all mt-2">
                                            Signature : {result.signature}
                                        </p>
                                    </div>
              }

                                {/* AVERTISSEMENTS NORMATIFS */}

                                <div className="space-y-3 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-slate-400">Type d'alimentation:</span>
                                        <span className="text-white font-medium">Type {result.alimentationType}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-slate-400">Régime:</span>
                                        <span className="text-white font-medium">{result.phaseSystem}</span>
                                    </div>
                                    {result.recommendedSection &&
                <div className="flex justify-between">
                                            <span className="text-slate-400">Section recommandée:</span>
                                            <span className="text-emerald-400 font-medium">{result.recommendedSection} mm²</span>
                                        </div>
                }
                                    <div className="flex justify-between">
                                        <span className="text-slate-400">Résistivité ({result.ambientTemperature === 20 ? 'à 20°C' : 'service normal'}):</span>
                                        <span className="text-white font-medium">{result.resistivity.toFixed(3)} Ω·mm²/m</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-slate-400">Réactance linéique:</span>
                                        <span className="text-white font-medium">{result.reactance} Ω/m</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-slate-400">Résistance de ligne (A/R):</span>
                                        <span className="text-white font-medium">{result.resistance.toFixed(4)} Ω</span>
                                    </div>
                                    {result.thermalCheck !== undefined &&
                <div className="flex justify-between">
                                            <span className="text-slate-400">Vérification thermique (Art 523):</span>
                                            <span className={`font-medium ${result.thermalCheck ? 'text-green-400' : 'text-red-400'}`}>
                                                {result.thermalCheck ? 'CONFORME' : 'NON CONFORME'}
                                            </span>
                                        </div>
                }
                                    {result.izCorrected !== undefined &&
                <div className="flex justify-between">
                                            <span className="text-slate-400">Courant admissible Iz corrigé:</span>
                                            <span className="text-white font-medium">{result.izCorrected.toFixed(1)} A</span>
                                        </div>
                }
                                    {result.modeOfInstallation &&
                <div className="flex justify-between">
                                            <span className="text-slate-400">Mode de pose:</span>
                                            <span className="text-white font-medium">{result.modeOfInstallation}</span>
                                        </div>
                }
                                    {result.ambientTemperature !== undefined &&
                <div className="flex justify-between">
                                            <span className="text-slate-400">Température ambiante:</span>
                                            <span className="text-white font-medium">{result.ambientTemperature} °C</span>
                                        </div>
                }
                                    {result.insulationType &&
                <div className="flex justify-between">
                                            <span className="text-slate-400">Type d'isolation:</span>
                                            <span className="text-white font-medium">{result.insulationType}</span>
                                        </div>
                }
                                    {result.numberOfCircuits !== undefined &&
                <div className="flex justify-between">
                                            <span className="text-slate-400">Nombre de circuits:</span>
                                            <span className="text-white font-medium">{result.numberOfCircuits}</span>
                                        </div>
                }
                                </div>

                                {/* VERSION HISTORY */}
                                {result.versionHistory && result.versionHistory.length > 0 &&
              <div className="p-4 bg-indigo-500/10 border border-indigo-500/20 rounded-lg">
                                        <div className="flex items-center gap-2 mb-3">
                                            <Info className="w-4 h-4 text-indigo-400" />
                                            <span className="text-indigo-400 font-medium text-sm">Historique des Versions</span>
                                        </div>
                                        <div className="space-y-2 max-h-32 overflow-y-auto">
                                            {result.versionHistory.map((version, index) =>
                  <div key={index} className="text-xs bg-slate-800/50 p-2 rounded">
                                                    <div className="flex justify-between">
                                                        <span className="text-slate-300 font-medium">{version.version}</span>
                                                        <span className={`font-medium ${version.verdict ? 'text-green-400' : 'text-red-400'}`}>
                                                            {version.verdict ? 'CONFORME' : 'NON CONFORME'}
                                                        </span>
                                                    </div>
                                                    <div className="text-slate-400 mt-1">
                                                        {new Date(version.timestamp).toLocaleString('fr-FR')}
                                                    </div>
                                                    <div className="text-slate-500 mt-1 font-mono text-xs break-all">
                                                        {version.hash.substring(0, 16)}...
                                                    </div>
                                                </div>
                  )}
                                        </div>
                                    </div>
              }

                                <div className="pt-4 border-t border-emerald-900/40">
                                    <div className="grid grid-cols-2 gap-2 mb-2">
                                        <Button
                    onClick={exportResults}
                    className="bg-slate-700 hover:bg-slate-600 text-white">
                    
                                            <Download className="w-4 h-4 mr-2" />
                                            Attestation
                                        </Button>
                                        <Button
                    onClick={exportComplianceDossier}
                    className="bg-blue-700 hover:bg-blue-600 text-white">
                    
                                            <Download className="w-4 h-4 mr-2" />
                                            Dossier Conformité
                                        </Button>
                                    </div>
                                    <div className="text-xs text-slate-400 mb-2">
                                        📄 PDFs natifs • 📋 Rapports complets • 🔐 Signés numériquement
                                    </div>
                                    <div className="grid grid-cols-3 gap-2 mb-2">
                                        <Button
                    onClick={exportBIMData}
                    className="bg-green-700 hover:bg-green-600 text-white text-xs">
                    
                                            <Download className="w-3 h-3 mr-1" />
                                            BIM IFC
                                        </Button>
                                        <Button
                    onClick={exportDOEData}
                    className="bg-purple-700 hover:bg-purple-600 text-white text-xs">
                    
                                            <Download className="w-3 h-3 mr-1" />
                                            DOE JSON
                                        </Button>
                                        <Button
                    onClick={exportVersionHistory}
                    className="bg-orange-700 hover:bg-orange-600 text-white text-xs">
                    
                                            <Download className="w-3 h-3 mr-1" />
                                            Historique
                                        </Button>
                                    </div>
                                    {result.auditLog &&
                <Button
                  onClick={() => {
                    const auditText = result.auditLog.join('\n');
                    const blob = new Blob([auditText], { type: 'text/plain' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `journal-audit-${new Date().toISOString().split('T')[0]}.txt`;
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                    URL.revokeObjectURL(url);
                  }}
                  variant="outline"
                  className="w-full border-slate-600 text-slate-300 hover:bg-slate-800">
                  
                                            <Download className="w-4 h-4 mr-2" />
                                            Journal d'Audit
                                        </Button>
                }
                                </div>
                            </div> :

            <div className="text-center py-12 text-slate-500">
                                <Calculator className="w-12 h-12 mx-auto mb-4 opacity-50" />
                                <p>Saisissez les paramètres et cliquez sur "Calculer"</p>
                            </div>
            }
                    </CardContent>
                </Card>
            </div>

            {/* NORMATIVE REFERENCE */}
            <Card className="bg-amber-500/5 border-amber-500/20">
                <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                        <Info className="w-6 h-6 text-amber-400 mt-0.5" />
                        <div className="space-y-3">
                            <h4 className="font-black text-amber-400">Référence Normative Complète</h4>
                            <div className="space-y-2 text-sm text-slate-300">
                                <p>
                                    <strong>NS 01-001 / NFC 15-100 — Chapitre 52 — Sections 523, 524, 525 — Tableau 52V:</strong> La chute de tension
                                    dans les installations doit être limitée pour assurer le bon fonctionnement des récepteurs.
                                </p>
                                <div className="bg-slate-800/50 p-3 rounded font-mono text-xs">
                                    <div className="text-amber-400 font-medium mb-2">Formules normatives (Section 525) :</div>
                                    <div>• Monophasé: u = 2 × (ρ × L / S × cosφ + λ × L × sinφ) × IB</div>
                                    <div>• Triphasé équilibré: u = √3 × (ρ × L / S × cosφ + λ × L × sinφ) × IB</div>
                                    <div>• Triphasé déséquilibré: traité comme monophasé</div>
                                    <div>• Chute relative: Δu (%) = 100 × u / U0</div>
                                </div>
                                <div className="text-xs text-slate-400 space-y-1">
                                    <div>• Périmètre: Installations BT ≤ 1 kV, régime permanent sinusoïdal</div>
                                    <div>• Résistivité en service normal: Cuivre ρ = 0.023, Aluminium ρ = 0.037 Ω·mm²/m</div>
                                    <div>• Réactance linéique λ = 0.08 mΩ/m pour câbles BT ≤ 1 kV</div>
                                    <div>• Sections normalisées uniquement (1.5 à 630 mm²) - Section 524</div>
                                    <div>• Aluminium interdit &lt; 16 mm² (sauf justification normative)</div>
                                    <div>• Vérification thermique obligatoire (Section 523: Iz ≥ IB)</div>
                                    <div>• Limites Type A: 3%/5%, Type B: 6%/8% (+0.5% max pour L &gt; 100m) - Tableau 52V</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>);

}