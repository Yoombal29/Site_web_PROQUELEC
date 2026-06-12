import React, { useState } from 'react';
import {
  Award,
  BadgeCheck,
  BookOpen,
  Calculator,
  FileSpreadsheet,
  Gavel,
  Moon,
  ShieldCheck,
  Stethoscope,
  User,
  Zap,
} from 'lucide-react';
import LabelRequestForm from './LabelRequestForm';
import NormativeDatabase from './NormativeDatabase';
import QuoteGenerator from './QuoteGenerator';
import SafetyChecklist from './SafetyChecklist';
import SafetyDiagnostic from './SafetyDiagnostic';

type SauvegardeTab =
  | 'label'
  | 'energy'
  | 'guides'
  | 'quotes'
  | 'safety'
  | 'diagnostic'
  | 'regulations';

interface SauvegardeToolsExperienceProps {
  onOpenTool: (toolId: string) => void;
  onOpenDocuments: () => void;
}

const tabs: Array<{
  id: SauvegardeTab;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}> = [
  { id: 'label', label: 'Label Qualité', icon: Award },
  { id: 'energy', label: 'Simulateurs', icon: Zap },
  { id: 'guides', label: 'Guides', icon: BookOpen },
  { id: 'quotes', label: 'Devis', icon: FileSpreadsheet },
  { id: 'safety', label: 'Sécurité', icon: ShieldCheck },
  { id: 'diagnostic', label: 'Diagnostic', icon: Stethoscope },
  { id: 'regulations', label: 'Réglementation', icon: Gavel },
];

const simulatorTools = [
  {
    id: 'simulateur-consommation',
    title: 'Consommation',
    description: "Estimer la consommation d'un logement et identifier les économies possibles.",
    icon: Zap,
  },
  {
    id: 'dimensionnement-cables',
    title: 'Calcul de câbles',
    description: 'Choisir une section de câble adaptée au courant, à la longueur et à l’usage.',
    icon: Calculator,
  },
  {
    id: 'eng-calcs',
    title: 'Chute de tension',
    description: 'Contrôler la chute de tension selon les contraintes de l’installation.',
    icon: BadgeCheck,
  },
  {
    id: 'dimensionnement-solaire',
    title: 'Dimensionnement solaire',
    description: 'Préparer un pré-dimensionnement photovoltaïque simple et exploitable.',
    icon: Moon,
  },
];

const quickSafetyTools = [
  {
    id: 'guide-terre-differentiel',
    title: 'Mise à la terre & différentiel',
    description: 'Rappels pratiques sur la terre, le DDR et les points de vigilance.',
  },
  {
    id: 'checklist-securite',
    title: 'Checklist complète',
    description: "Audit rapide de l'installation avant intervention ou mise sous tension.",
  },
];

export default function SauvegardeToolsExperience({
  onOpenTool,
  onOpenDocuments,
}: SauvegardeToolsExperienceProps) {
  const [activeTab, setActiveTab] = useState<SauvegardeTab>('label');

  return (
    <div className="space-y-10">
      <section className="rounded-[2rem] border border-white/10 bg-[#111827] px-5 py-8 shadow-2xl shadow-black/20 md:px-8 lg:px-10">
        <div className="mb-10 flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10 text-white">
              <Zap className="h-5 w-5" />
            </div>
            <div>
              <p className="text-2xl font-black leading-none text-white">PROQUELEC</p>
              <p className="mt-1 text-sm font-medium text-slate-300">
                Solutions électriques intelligentes
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              className="rounded-xl border border-white/30 px-4 py-2 text-sm font-bold text-white"
            >
              Français
            </button>
            <button
              type="button"
              className="flex h-12 w-16 items-center justify-center rounded-xl bg-green-600 text-white"
              aria-label="Mode sombre"
            >
              <Moon className="h-5 w-5" />
            </button>
            <button
              type="button"
              className="flex items-center gap-2 rounded-xl bg-blue-700 px-4 py-3 text-sm font-black text-white shadow-lg shadow-blue-900/30"
              onClick={() => onOpenTool('label-qualite')}
            >
              <User className="h-4 w-4" />
              Espace Pro
            </button>
          </div>
        </div>

        <div className="mx-auto max-w-5xl text-center">
          <h1 className="text-4xl font-black tracking-tight text-white md:text-6xl">
            Outils Techniques Avancés PROQUELEC
          </h1>
          <p className="mx-auto mt-6 max-w-3xl text-lg font-semibold leading-relaxed text-slate-300 md:text-2xl">
            Découvrez nos outils professionnels pour optimiser vos installations électriques,
            réaliser des économies d&apos;énergie et garantir la sécurité.
          </p>
        </div>

        <nav
          className="mt-12 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-7"
          aria-label="Navigation des outils sauvegarde"
        >
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => {
                  if (tab.id === 'guides') {
                    onOpenDocuments();
                    return;
                  }
                  setActiveTab(tab.id);
                }}
                className={`flex min-h-[92px] flex-col items-center justify-center gap-2 rounded-2xl px-3 py-4 text-sm font-black transition ${
                  active
                    ? 'bg-blue-700 text-white shadow-xl shadow-blue-950/40'
                    : 'bg-[#0f1b2d] text-white hover:bg-[#17243a]'
                }`}
              >
                <Icon className="h-6 w-6" />
                <span className="text-center leading-tight">{tab.label}</span>
              </button>
            );
          })}
        </nav>
      </section>

      <section className="bg-slate-50 p-5 text-[#071225] shadow-2xl shadow-black/20 md:p-8 lg:p-10">
        {activeTab === 'label' && (
          <div className="space-y-8">
            <div className="rounded-2xl border border-blue-100 bg-white p-6">
              <span className="inline-flex rounded-full bg-blue-700 px-4 py-2 text-sm font-black text-white">
                Label Qualité
              </span>
              <h2 className="mt-5 text-3xl font-black text-blue-900">
                Label PROQUELEC - Reconnaissance de la Qualité
              </h2>
              <p className="mt-3 max-w-4xl text-base leading-relaxed text-slate-700">
                Le label PROQUELEC récompense les entreprises et installateurs respectant les
                critères stricts de sécurité, d&apos;expertise et de conformité, selon le référentiel
                établi par l&apos;association.
              </p>
              <a
                href="/word/Referentiel-PROQUELEC.doc"
                download
                className="mt-5 inline-flex rounded-xl bg-blue-700 px-5 py-3 text-sm font-black text-white shadow-lg shadow-blue-900/20"
              >
                Télécharger le référentiel PROQUELEC
              </a>
            </div>
            <LabelRequestForm />
          </div>
        )}

        {activeTab === 'energy' && (
          <div className="space-y-8">
            <div>
              <span className="inline-flex rounded-full bg-blue-700 px-4 py-2 text-sm font-black text-white">
                Simulateurs et calculateurs techniques
              </span>
              <h2 className="mt-5 text-3xl font-black text-blue-900">
                Choisissez un outil de calcul
              </h2>
              <p className="mt-2 max-w-3xl text-slate-700">
                Les simulateurs historiques de la sauvegarde sont conservés et reliés aux
                composants dynamiques actuels.
              </p>
            </div>
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {simulatorTools.map((tool) => {
                const Icon = tool.icon;
                return (
                  <button
                    key={tool.id}
                    type="button"
                    onClick={() => onOpenTool(tool.id)}
                    className="rounded-2xl border border-slate-200 bg-white p-5 text-left shadow-sm transition hover:-translate-y-1 hover:shadow-xl"
                  >
                    <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-blue-700 text-white">
                      <Icon className="h-5 w-5" />
                    </div>
                    <h3 className="text-lg font-black text-blue-900">{tool.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-slate-600">{tool.description}</p>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {activeTab === 'quotes' && (
          <div className="space-y-8">
            <div className="rounded-2xl border border-blue-100 bg-white p-6">
              <span className="inline-flex rounded-full bg-blue-700 px-4 py-2 text-sm font-black text-white">
                Devis
              </span>
              <h2 className="mt-5 text-3xl font-black text-blue-900">
                Générateur de devis PROQUELEC
              </h2>
              <p className="mt-2 max-w-3xl text-slate-700">
                Module dynamique pour préparer un devis technique à partir des prestations,
                fournitures et contraintes de chantier.
              </p>
            </div>
            <QuoteGenerator />
          </div>
        )}

        {activeTab === 'safety' && (
          <div className="space-y-8">
            <div>
              <span className="inline-flex rounded-full bg-red-500 px-4 py-2 text-sm font-black text-white">
                Sécurité
              </span>
              <h2 className="mt-5 text-3xl font-black text-blue-900">
                Contrôles et prévention des risques électriques
              </h2>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              {quickSafetyTools.map((tool) => (
                <button
                  key={tool.id}
                  type="button"
                  onClick={() => onOpenTool(tool.id)}
                  className="rounded-2xl border border-slate-200 bg-white p-5 text-left shadow-sm transition hover:-translate-y-1 hover:shadow-xl"
                >
                  <h3 className="text-lg font-black text-blue-900">{tool.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600">{tool.description}</p>
                </button>
              ))}
            </div>
            <SafetyChecklist />
          </div>
        )}

        {activeTab === 'diagnostic' && <SafetyDiagnostic />}

        {activeTab === 'regulations' && <NormativeDatabase />}
      </section>
    </div>
  );
}
