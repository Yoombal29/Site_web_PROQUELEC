import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSearchParams } from "react-router-dom";
import {
  History, Target, ShieldCheck, Award, Lightbulb,
  Building2, CheckCircle2, Download, Eye,
  Globe, Scale, Handshake, FileText, ArrowRight,
  Users2, Landmark, PieChart, Briefcase, Zap, BookOpen, Check, Settings
} from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { SEO } from "@/components/SEO";
import { ScrollToTopButton } from "@/components/ScrollToTopButton";
import { cn } from "@/lib/utils";
import { useGlobalHeader } from '@/components/MainLayout';

type AboutSection = 'presentation' | 'governance' | 'activities' | 'information' | 'formation' | 'international' | 'edito' | 'association';

interface SectionConfig {
  id: AboutSection;
  label: string;
  icon: any;
}

const sections: SectionConfig[] = [
  { id: 'edito', label: 'Édito', icon: FileText },
  { id: 'presentation', label: 'Présentation', icon: Building2 },
  { id: 'association', label: 'L\'Association', icon: History },
  { id: 'governance', label: 'Gouvernance', icon: Scale },
  { id: 'activities', label: 'Nos Activités', icon: Zap },
  { id: 'information', label: 'L\'Information', icon: BookOpen },
  { id: 'formation', label: 'La Formation', icon: Users2 },
  { id: 'international', label: 'International', icon: Globe }
];

// --- Sub-components (Sections) ---

const SectionPresentation = () => {
  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700 max-w-4xl mx-auto">
      <div className="space-y-6 text-center">
        <h3 className="text-4xl font-black text-slate-900 tracking-tighter uppercase">
          À propos de <span className="text-blue-600">PROQUELEC</span>
        </h3>
        <p className="text-xl text-slate-600 leading-relaxed font-light">
          PROQUELEC est une association à but non lucratif régie par la loi n° 68-08 du 26 mars 1968 et établie en 1995. Elle vise à promouvoir la qualité des équipements et des installations électriques dans les bâtiments neufs et anciens.
        </p>
      </div>

      <div className="bg-slate-50 rounded-[2rem] p-10 border border-slate-100">
        <h4 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-3">
          <Target className="w-8 h-8 text-blue-600" />
          Champ d'action
        </h4>
        <p className="text-slate-600 leading-relaxed mb-0">
          Son champ d’action couvre les habitations, les bâtiments artisanaux, industriels, agricoles, ainsi que les établissements recevant du public et des travailleurs, tels que les marchés, hôtels, écoles, établissements sanitaires et bureaux.
        </p>
      </div>

      <div className="bg-white shadow-xl shadow-slate-200/50 rounded-[2rem] p-10 border border-slate-100 relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full blur-[80px] group-hover:bg-amber-500/20 transition-all duration-700"></div>
        <h4 className="text-2xl font-bold text-slate-900 mb-8 flex items-center gap-3 relative z-10">
          <ShieldCheck className="w-8 h-8 text-amber-500" />
          L’installation électrique de qualité se caractérise par :
        </h4>
        <ul className="space-y-6 relative z-10">
          <li className="flex items-start gap-4">
            <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0 mt-1">
              <Check className="w-5 h-5" />
            </div>
            <div>
              <p className="text-slate-700 leading-relaxed">
                <strong className="text-slate-900">Son aptitude</strong> à assurer correctement le fonctionnement des appareils et machines qu’elle alimente.
              </p>
            </div>
          </li>
          <li className="flex items-start gap-4">
            <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0 mt-1">
              <Check className="w-5 h-5" />
            </div>
            <div>
              <p className="text-slate-700 leading-relaxed">
                <strong className="text-slate-900">Sa capacité</strong> à garantir la sécurité des personnes et la conservation des biens, c’est-à-dire à éliminer les risques d’électrocution et d’incendie.
              </p>
            </div>
          </li>
          <li className="flex items-start gap-4">
            <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0 mt-1">
              <Check className="w-5 h-5" />
            </div>
            <div>
              <p className="text-slate-700 leading-relaxed">
                <strong className="text-slate-900">Sa conception</strong>, sa réalisation et son utilisation économiques.
              </p>
            </div>
          </li>
        </ul>
      </div>
    </div>
  );
};

const SectionGovernance = () => {
  return (
    <div className="space-y-16 animate-in fade-in slide-in-from-bottom-4 duration-700 max-w-5xl mx-auto">
      
      <div className="text-center space-y-4">
        <h3 className="text-3xl font-black text-slate-900 tracking-tighter uppercase">Composition de l'Association</h3>
        <p className="text-slate-500">L’association est constituée de trois catégories de membres.</p>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 hover:shadow-lg hover:-translate-y-1 transition-all">
          <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-6">
            <Briefcase className="w-7 h-7" />
          </div>
          <h4 className="text-xl font-bold text-slate-900 mb-4">Membre actif</h4>
          <ul className="text-sm text-slate-600 space-y-3">
            <li className="flex gap-2"><div className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-1.5"></div> Distributeur d’énergie</li>
            <li className="flex gap-2"><div className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-1.5"></div> Installateur électricien</li>
            <li className="flex gap-2"><div className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-1.5"></div> Constructeur / matériel</li>
            <li className="flex gap-2"><div className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-1.5"></div> Bureaux d’étude & architecture</li>
          </ul>
        </div>
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 hover:shadow-lg hover:-translate-y-1 transition-all">
          <div className="w-14 h-14 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center mb-6">
            <Handshake className="w-7 h-7" />
          </div>
          <h4 className="text-xl font-bold text-slate-900 mb-4">Membre associé</h4>
          <p className="text-sm text-slate-600 leading-relaxed">
            Toute personne morale dont les activités sont différentes de celles d’un membre actif, mais étroitement liées à la sécurité et la qualité des installations électriques intérieures.
          </p>
        </div>
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 hover:shadow-lg hover:-translate-y-1 transition-all">
          <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mb-6">
            <Eye className="w-7 h-7" />
          </div>
          <h4 className="text-xl font-bold text-slate-900 mb-4">Membre observateur</h4>
          <p className="text-sm text-slate-600 leading-relaxed">
            Toute organisation à but non lucratif chargée de défendre les droits des consommateurs et des citoyens.
          </p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-8 pt-8 border-t border-slate-100">
        <div className="bg-slate-900 text-white p-10 rounded-[2.5rem] relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/20 rounded-full blur-[100px]"></div>
          <h3 className="text-2xl font-bold mb-6 relative z-10">Le Conseil d'Administration</h3>
          <p className="text-slate-300 mb-8 relative z-10 leading-relaxed">
            L’association est administrée par un conseil d’administration (CA) composé de huit (8) administrateurs, renouvelé par quart tous les deux ans. Le CA élit parmi ses membres :
          </p>
          <div className="space-y-4 relative z-10">
            <div className="flex items-center gap-4 bg-white/5 p-4 rounded-xl border border-white/10">
              <div className="w-10 h-10 rounded-full bg-blue-500/20 text-blue-300 flex items-center justify-center font-bold">1</div>
              <span className="font-medium text-lg">Un Président</span>
            </div>
            <div className="flex items-center gap-4 bg-white/5 p-4 rounded-xl border border-white/10">
              <div className="w-10 h-10 rounded-full bg-blue-500/20 text-blue-300 flex items-center justify-center font-bold">2</div>
              <span className="font-medium text-lg">Deux Vice-Présidents</span>
            </div>
            <div className="flex items-center gap-4 bg-white/5 p-4 rounded-xl border border-white/10">
              <div className="w-10 h-10 rounded-full bg-blue-500/20 text-blue-300 flex items-center justify-center font-bold">1</div>
              <span className="font-medium text-lg">Un Trésorier</span>
            </div>
          </div>
        </div>
        
        <div className="space-y-8 flex flex-col justify-center">
          <div className="bg-blue-50/50 p-8 rounded-3xl border border-blue-100/50">
            <h3 className="text-xl font-bold text-slate-900 mb-3">La Direction Générale</h3>
            <p className="text-slate-600 text-sm leading-relaxed">
              Le <strong>Directeur général</strong> est chargé de l’exécution des décisions du CA et de la coordination des activités. Il définit la politique à mener par l’association, prépare l'information à diffuser et étudie les moyens pour lancer les opérations.
            </p>
          </div>
          <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
            <h3 className="text-xl font-bold text-slate-900 mb-4">Les Commissions Opérationnelles</h3>
            <ul className="text-sm text-slate-600 space-y-3">
              <li className="flex gap-3"><div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0"></div> L’élaboration de documents traitant des règles et normes.</li>
              <li className="flex gap-3"><div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0"></div> La diffusion de l’information.</li>
              <li className="flex gap-3"><div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0"></div> La conduite du processus de création des labels.</li>
              <li className="flex gap-3"><div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0"></div> La participation aux réunions et manifestations régionales et locales.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

const SectionActivities = () => {
  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700 max-w-5xl mx-auto">
      <div className="text-center mb-12">
        <h3 className="text-3xl font-black text-slate-900 tracking-tighter uppercase mb-4">Activités de PROQUELEC</h3>
        <p className="text-lg text-slate-500 max-w-2xl mx-auto">
          Toutes ces actions sont menées par PROQUELEC à titre bénévole. Elles ont un indiscutable caractère d’intérêt général pour assurer sécurité et confort.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="p-8 bg-white rounded-3xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow flex gap-6">
          <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center shrink-0">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <h4 className="text-xl font-bold text-slate-900 mb-2">Diffusion d’informations</h4>
            <p className="text-slate-600 text-sm leading-relaxed">
              Élaboration et diffusion de documents techniques adaptés aux besoins des concepteurs, prescripteurs, installateurs et utilisateurs. Campagnes sur les normes en vigueur.
            </p>
          </div>
        </div>

        <div className="p-8 bg-white rounded-3xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow flex gap-6">
          <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center shrink-0">
            <Target className="w-6 h-6" />
          </div>
          <div>
            <h4 className="text-xl font-bold text-slate-900 mb-2">Assistance technique et Conseil</h4>
            <p className="text-slate-600 text-sm leading-relaxed">
              Accompagnement des professionnels et particuliers dans leurs projets électriques, recommandations sur la conception, le choix des équipements et bonnes pratiques d’installation.
            </p>
          </div>
        </div>

        <div className="p-8 bg-white rounded-3xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow flex gap-6">
          <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center shrink-0">
            <Scale className="w-6 h-6" />
          </div>
          <div>
            <h4 className="text-xl font-bold text-slate-900 mb-2">Réglementation et Normalisation</h4>
            <p className="text-slate-600 text-sm leading-relaxed">
              Contribution aux travaux de normalisation et à l’élaboration des textes réglementaires pour garantir la conformité et la sécurité des installations.
            </p>
          </div>
        </div>

        <div className="p-8 bg-white rounded-3xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow flex gap-6">
          <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center shrink-0">
            <Users2 className="w-6 h-6" />
          </div>
          <div>
            <h4 className="text-xl font-bold text-slate-900 mb-2">Formation et sensibilisation</h4>
            <p className="text-slate-600 text-sm leading-relaxed">
              Organisation de sessions de formation pour les artisans électriciens et les professionnels afin d’améliorer les compétences techniques et sensibiliser aux risques.
            </p>
          </div>
        </div>

        <div className="p-8 bg-white rounded-3xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow flex gap-6">
          <div className="w-12 h-12 bg-rose-50 text-red-600 rounded-2xl flex items-center justify-center shrink-0">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h4 className="text-xl font-bold text-slate-900 mb-2">Contrôle et diagnostic</h4>
            <p className="text-slate-600 text-sm leading-relaxed">
              Réalisation d’inspections et de vérifications des installations pour identifier les non-conformités et proposer des solutions d’amélioration.
            </p>
          </div>
        </div>

        <div className="p-8 bg-white rounded-3xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow flex gap-6">
          <div className="w-12 h-12 bg-teal-50 text-teal-600 rounded-2xl flex items-center justify-center shrink-0">
            <Lightbulb className="w-6 h-6" />
          </div>
          <div>
            <h4 className="text-xl font-bold text-slate-900 mb-2">Audit énergétique</h4>
            <p className="text-slate-600 text-sm leading-relaxed">
              Analyse des installations pour optimiser la consommation d’énergie, réduire les pertes et améliorer la performance des équipements électriques.
            </p>
          </div>
        </div>
      </div>

      <div className="mt-16 bg-slate-900 text-white rounded-[2rem] p-10 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-[80px]"></div>
        <h4 className="text-2xl font-bold mb-8 relative z-10">Conseils et Accompagnement Technique</h4>
        <div className="grid md:grid-cols-2 gap-6 relative z-10">
          <div className="space-y-6">
            <div className="bg-white/5 p-6 rounded-2xl border border-white/10 hover:bg-white/10 transition-colors">
              <h5 className="font-bold text-blue-400 mb-2 flex items-center gap-2"><ShieldCheck className="w-4 h-4" /> Projet COSSUEL</h5>
              <p className="text-sm text-slate-300">
                Création en 1996, suivi de la signature du Décret n° 1333 (2017) rendant obligatoire le contrôle de conformité. Partenariat pour renforcer les équipes d'inspection.
              </p>
            </div>
            <div className="bg-white/5 p-6 rounded-2xl border border-white/10 hover:bg-white/10 transition-colors">
              <h5 className="font-bold text-blue-400 mb-2 flex items-center gap-2"><Building2 className="w-4 h-4" /> Appui aux ménages</h5>
              <p className="text-sm text-slate-300">
                Ciblage de ménages à faible revenu, étude de solutions sécurisées adaptées, suivi et contrôle de conformité des travaux d'installation réalisés par les prestataires formés.
              </p>
            </div>
          </div>
          <div className="space-y-6">
            <div className="bg-white/5 p-6 rounded-2xl border border-white/10 hover:bg-white/10 transition-colors">
              <h5 className="font-bold text-blue-400 mb-2 flex items-center gap-2"><Lightbulb className="w-4 h-4" /> Éclairage Public & Marchés</h5>
              <p className="text-sm text-slate-300">
                Sécurisation de 20 cantines dans les marchés. Mise en conformité de l'éclairage public (recensement des postes, correction d'anomalies critiques).
              </p>
            </div>
            <div className="bg-white/5 p-6 rounded-2xl border border-white/10 hover:bg-white/10 transition-colors">
              <h5 className="font-bold text-blue-400 mb-2 flex items-center gap-2"><Zap className="w-4 h-4" /> Mise en Service Senelec</h5>
              <p className="text-sm text-slate-300">
                Plus de 600 000 mises en service entre 2021 et 2024. Étude, suivi, densification et mise aux normes des réseaux HTA/BT Senelec.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const SectionInformation = () => {
  return (
    <div className="space-y-16 animate-in fade-in slide-in-from-bottom-4 duration-700 max-w-5xl mx-auto">
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <h3 className="text-3xl font-black text-slate-900 tracking-tighter uppercase">L'Information au cœur de nos actions</h3>
        <p className="text-lg text-slate-500">
          L’information s’adresse aux différents acteurs du secteur électrique et aux usagers de l’électricité.
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Pros */}
        <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-full blur-3xl -z-10 group-hover:bg-blue-100 transition-colors"></div>
          <h4 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-3">
            <Briefcase className="w-6 h-6 text-blue-600" /> Professionnels
          </h4>
          <div className="space-y-6">
            <div>
              <h5 className="font-bold text-slate-800 mb-2 flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-blue-600"></div> Les Mémentos</h5>
              <p className="text-sm text-slate-600 mb-2 pl-4">Documents synthétiques pour rappel rapide des bonnes pratiques (NS 01-001, Protection, Caractéristiques générales).</p>
            </div>
            <div>
              <h5 className="font-bold text-slate-800 mb-2 flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-blue-600"></div> Les Guides techniques</h5>
              <p className="text-sm text-slate-600 pl-4">Détaillés pour appliquer les normes (Marchés, Ménages à faible revenu, Emplacements spécifiques, Vérifications, Matériels).</p>
            </div>
          </div>
        </div>

        {/* Syndics */}
        <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-amber-50 rounded-full blur-3xl -z-10 group-hover:bg-amber-100 transition-colors"></div>
          <h4 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-3">
            <Building2 className="w-6 h-6 text-amber-600" /> Syndics & Gérants
          </h4>
          <p className="text-sm text-slate-600 mb-6">
            <strong>Les feuillets techniques</strong> permettent une information rapide et précise pour résoudre les problèmes techniques.
          </p>
          <ul className="text-sm text-slate-600 space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-100">
            <li className="flex gap-2"><Check className="w-4 h-4 text-amber-600 shrink-0" /> Prise et mise à la terre</li>
            <li className="flex gap-2"><Check className="w-4 h-4 text-amber-600 shrink-0" /> Installation triphasée</li>
            <li className="flex gap-2"><Check className="w-4 h-4 text-amber-600 shrink-0" /> Liaison équipotentielle</li>
            <li className="flex gap-2"><Check className="w-4 h-4 text-amber-600 shrink-0" /> Canalisations enterrées</li>
          </ul>
        </div>

        {/* Public & Enseignement */}
        <div className="flex flex-col gap-6">
          <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm relative overflow-hidden group flex-grow">
            <h4 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-3">
              <Users2 className="w-5 h-5 text-emerald-600" /> Grand Public
            </h4>
            <p className="text-sm text-slate-600 mb-4">
              Dépliants et brochures distribués gratuitement pour la prise de conscience des risques.
            </p>
            <ul className="text-sm text-slate-600 space-y-2">
              <li className="flex gap-2"><Check className="w-4 h-4 text-emerald-500 shrink-0" /> L'électricité chez vous</li>
              <li className="flex gap-2"><Check className="w-4 h-4 text-emerald-500 shrink-0" /> Votre installation vieillit ?</li>
            </ul>
          </div>
          
          <div className="bg-slate-900 text-white rounded-3xl p-8 shadow-sm">
            <h4 className="text-xl font-bold mb-3 flex items-center gap-3">
              <BookOpen className="w-5 h-5 text-blue-400" /> Enseignement
            </h4>
            <p className="text-sm text-slate-300 leading-relaxed">
              Mise à disposition pour les professeurs et élèves de l'enseignement technique de l'ensemble des documents pour intégration dans leurs programmes.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

const SectionFormation = () => {
  return (
    <div className="space-y-16 animate-in fade-in slide-in-from-bottom-4 duration-700 max-w-5xl mx-auto">
      <div className="grid md:grid-cols-2 gap-12 items-center">
        <div>
          <h3 className="text-3xl font-black text-slate-900 tracking-tighter uppercase mb-6">Formation des artisans</h3>
          <p className="text-slate-600 leading-relaxed mb-8">
            Depuis 2005, un programme de formation gratuite est destiné aux artisans-électriciens sur le territoire national, pour garantir une protection optimale contre les risques.
          </p>
          <div className="space-y-6">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center shrink-0 font-bold">1</div>
              <p className="text-sm text-slate-700 mt-2 font-medium">Améliorer la qualité des installations domestiques.</p>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center shrink-0 font-bold">2</div>
              <p className="text-sm text-slate-700 mt-2 font-medium">Garantir la protection des personnes et équipements.</p>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center shrink-0 font-bold">3</div>
              <p className="text-sm text-slate-700 mt-2 font-medium">Instaurer une culture de la sécurité et de l'efficacité énergétique.</p>
            </div>
          </div>
        </div>
        <div className="bg-amber-50 rounded-[3rem] p-10 relative border border-amber-100">
          <h4 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-3">
            <Settings className="w-6 h-6 text-amber-600" />
            Modules abordés (Artisans)
          </h4>
          <ul className="space-y-4 text-sm text-slate-700">
            <li className="flex items-start gap-3"><div className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5 shrink-0"></div><strong>Mod 1 :</strong> Fondamentaux et Cadre Normatif</li>
            <li className="flex items-start gap-3"><div className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5 shrink-0"></div><strong>Mod 2 :</strong> Conception et Schémas Électriques</li>
            <li className="flex items-start gap-3"><div className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5 shrink-0"></div><strong>Mod 3 :</strong> Techniques de Câblage et Raccordement</li>
            <li className="flex items-start gap-3"><div className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5 shrink-0"></div><strong>Mod 4 :</strong> Mise à la Terre et Protection</li>
            <li className="flex items-start gap-3"><div className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5 shrink-0"></div><strong>Mod 5 :</strong> Équipements de Protection et Sécurité</li>
            <li className="flex items-start gap-3"><div className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5 shrink-0"></div><strong>Mod 6 :</strong> Performance Énergétique</li>
            <li className="flex items-start gap-3"><div className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5 shrink-0"></div><strong>Mod 7 :</strong> Innovations (Domotique, Solaire)</li>
          </ul>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-[2.5rem] p-10 shadow-sm relative overflow-hidden">
        <div className="absolute -top-10 -right-10 opacity-5"><Zap className="w-64 h-64" /></div>
        <h3 className="text-2xl font-black text-slate-900 mb-8 uppercase tracking-tighter">Professionnels en Activité</h3>
        <p className="text-slate-600 mb-8 max-w-2xl">Formations en habilitation électrique structurées en modules adaptés aux différents niveaux d'intervention :</p>
        <div className="grid md:grid-cols-3 gap-6">
          <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100 hover:-translate-y-1 transition-transform">
            <h4 className="font-bold text-slate-800 mb-3 flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-rose-500"></div> Travaux non électriques</h4>
            <p className="text-sm text-slate-600"><strong>B0, H0, H0V :</strong> Exécutant et Chargé de chantier. <br/><br/><strong>BF-HF :</strong> Opérations de fouille BT et HT.</p>
          </div>
          <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100 hover:-translate-y-1 transition-transform">
            <h4 className="font-bold text-slate-800 mb-3 flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-blue-500"></div> Ordre électrique BT</h4>
            <p className="text-sm text-slate-600"><strong>B1, B2, B1V, B2V :</strong> Exécutant et Chargé.<br/><br/><strong>BR, BC, BS :</strong> Intervention, consignation, interventions élémentaires.</p>
          </div>
          <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100 hover:-translate-y-1 transition-transform">
            <h4 className="font-bold text-slate-800 mb-3 flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-emerald-500"></div> Haute tension & Autres</h4>
            <p className="text-sm text-slate-600"><strong>H1, H2, HC :</strong> Chargé de travaux et consignation HT.<br/><br/><strong>Autres :</strong> BE Manœuvre, Vérification, Mesure, Essai.</p>
          </div>
        </div>
      </div>

      <div className="bg-slate-900 text-white rounded-[3rem] p-12 text-center shadow-xl relative overflow-hidden">
        <div className="absolute inset-0 bg-blue-600/10"></div>
        <div className="relative z-10">
          <h3 className="text-3xl font-black mb-4 uppercase tracking-tighter">Bilan et Impact</h3>
          <p className="text-blue-200 text-lg mb-10 max-w-2xl mx-auto">
            Plus de <strong>10 000 artisans formés</strong> et attestés à travers le Sénégal, avec un taux de satisfaction de 100%. Réduction mesurable des sinistres d'origine électrique dans les zones d'intervention.
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 border-t border-white/10 pt-10">
            <div><div className="text-4xl font-black text-white mb-2">5 718</div><div className="text-xs text-blue-300 uppercase tracking-widest font-bold">Dakar</div></div>
            <div><div className="text-4xl font-black text-white mb-2">1 380</div><div className="text-xs text-blue-300 uppercase tracking-widest font-bold">Senelec <br/>(2015-17)</div></div>
            <div><div className="text-4xl font-black text-white mb-2">381</div><div className="text-xs text-blue-300 uppercase tracking-widest font-bold">Sonatel <br/>(2013-17)</div></div>
            <div><div className="text-4xl font-black text-emerald-400 mb-2">100%</div><div className="text-xs text-blue-300 uppercase tracking-widest font-bold">Satisfaction</div></div>
          </div>
        </div>
      </div>
    </div>
  );
};

const SectionInternational = () => {
  return (
    <div className="space-y-16 animate-in fade-in slide-in-from-bottom-4 duration-700 max-w-4xl mx-auto">
      <div className="bg-blue-600 text-white rounded-[3rem] p-12 relative overflow-hidden shadow-xl">
        <div className="absolute top-0 right-0 opacity-10">
          <Globe className="w-64 h-64 -mt-10 -mr-10" />
        </div>
        <div className="relative z-10">
          <h3 className="text-3xl font-black uppercase tracking-tighter mb-6">Activités Internationales</h3>
          <h4 className="text-xl font-bold mb-6">Participation FISUEL / GTA</h4>
          <ul className="space-y-4 text-blue-50">
            <li className="flex items-center gap-4 bg-white/10 p-4 rounded-xl border border-white/20"><div className="w-2 h-2 bg-white rounded-full shrink-0"></div> Implication dans la Fédération Internationale pour la Sécurité des Usagers de l'Électricité</li>
            <li className="flex items-center gap-4 bg-white/10 p-4 rounded-xl border border-white/20"><div className="w-2 h-2 bg-white rounded-full shrink-0"></div> Participation aux réunions du Groupe de Travail Afrique</li>
            <li className="flex items-center gap-4 bg-white/10 p-4 rounded-xl border border-white/20"><div className="w-2 h-2 bg-white rounded-full shrink-0"></div> Échanges techniques internationaux et partage de bonnes pratiques</li>
          </ul>
        </div>
      </div>

      <div className="text-center space-y-10">
        <h3 className="text-3xl font-black text-slate-900 uppercase tracking-tighter">Nos références d'audits et diagnostics</h3>
        <p className="text-slate-500 max-w-2xl mx-auto">
          Parmi les nombreuses missions d’audit et diagnostic électrique effectuées par PROQUELEC, on peut citer :
        </p>
        <div className="grid md:grid-cols-2 gap-4 text-left">
          {[
            "Agence de l’Informatique de l’État",
            "Building Administratif (3 niveaux)",
            "Caisse de Sécurité Sociale",
            "CGF Bourse",
            "Convention technique Tigo (259 sites)",
            "Crédit Mutuel du Sénégal (Siège)",
            "Gouvernances de Dakar et Saint-Louis",
            "Ministère des Affaires Étrangères",
            "OMVS / OXFAM / UNESCO",
            "Prytanée militaire de Saint-Louis",
            "Tous les sites SENELEC (Dakar)",
            "Tous les sites de la SODEFITEX"
          ].map((ref, idx) => (
            <div key={idx} className="bg-white p-5 rounded-2xl border border-slate-100 flex items-center gap-4 shadow-sm hover:-translate-y-1 transition-transform">
              <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                <Check className="w-4 h-4" />
              </div>
              <span className="text-sm font-bold text-slate-700">{ref}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};


const SectionEdito = () => {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-slate-900 text-white rounded-[2.5rem] p-12 md:p-16 relative overflow-hidden">
        <div className="absolute -top-10 left-8 text-8xl font-serif opacity-10 text-blue-500 select-none">"</div>
        <div className="relative z-10 space-y-8">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 text-xs font-semibold tracking-wider uppercase bg-blue-500/10 border border-blue-500/20 rounded-full text-blue-400">
            <FileText className="w-3.5 h-3.5" /> Édito
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-white leading-tight">Message du Directeur Général</h2>
          <div className="space-y-6 text-lg text-slate-300 leading-relaxed">
            <p>L'information et la communication en direction des usagers et des professionnels de l'électricité constituent les actions fondamentales de PROQUELEC.</p>
            <p>La <strong className="text-white">vulgarisation des normes et des dispositions sécuritaires</strong> en matière d'installations électriques intérieures sont la raison d'être de notre organisme.</p>
            <p>Eu égard au rôle de service public qui nous est dévolu dans la préservation des personnes et des biens contre les risques d'origine électrique, l'outil Internet est irremplaçable dans le contexte actuel des Technologies de l'Information et de la Communication.</p>
            <p className="text-white font-semibold text-xl">Ce site est le vôtre ; profitez-en pour bénéficier de conseils, consulter notre agenda, nous écrire et prendre toute information utile pour faire bon ménage avec l'électricité.</p>
          </div>
          <div className="pt-8 border-t border-slate-700 flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-500 to-blue-700"></div>
            <div>
              <p className="text-white font-bold text-lg">Le Directeur Général</p>
              <p className="text-sm text-slate-400">PROQUELEC Sénégal</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const SectionAssociation = () => {
  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700 max-w-5xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        <div className="space-y-6">
          <h3 className="text-3xl font-black text-slate-900 tracking-tighter uppercase">L'Association</h3>
          <p className="text-lg text-slate-500">Pour la Promotion de la Qualité des Installations Électriques Intérieures</p>
          <div className="h-1 w-20 rounded-full bg-gradient-to-r from-blue-600 to-blue-800"></div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="p-6 rounded-2xl border border-slate-200 bg-slate-50 text-center">
            <div className="text-3xl font-bold text-blue-600">1995</div>
            <div className="text-sm text-slate-500 mt-1">Fondée le 12 octobre</div>
          </div>
          <div className="p-6 rounded-2xl border border-slate-200 bg-slate-50 text-center">
            <div className="text-3xl font-bold text-blue-600">60-08</div>
            <div className="text-sm text-slate-500 mt-1">Loi sénégalaise</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-8 rounded-2xl border border-slate-200 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 bg-slate-50">
          <div className="w-12 h-12 rounded-lg flex items-center justify-center mb-4 text-xl bg-blue-100 text-blue-600">
            <Scale className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 mb-3">Statut Légal</h3>
          <p className="text-slate-600 text-sm leading-relaxed">Association de service public régie par la loi sénégalaise n° 60-08 du 26 mars 1968. Récépissé n° 8470 MINT/DAGAT du 12 octobre 1995.</p>
        </div>
        <div className="p-8 rounded-2xl border border-slate-200 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 bg-slate-50">
          <div className="w-12 h-12 rounded-lg flex items-center justify-center mb-4 text-xl bg-emerald-100 text-emerald-600">
            <Globe className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 mb-3">Rayonnement International</h3>
          <p className="text-slate-600 text-sm leading-relaxed">Membre fondateur de la <strong>FISUEL</strong> (Fédération Internationale pour la Sécurité des Usagers de l'Électricité), créée le 1er février 2002 à Beyrouth.</p>
        </div>
        <div className="p-8 rounded-2xl border border-slate-200 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 bg-slate-50">
          <div className="w-12 h-12 rounded-lg flex items-center justify-center mb-4 text-xl bg-amber-100 text-amber-600">
            <Target className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 mb-3">Mission</h3>
          <p className="text-slate-600 text-sm leading-relaxed">Promotion de la qualité du matériel et des installations électriques dans les bâtiments neufs et anciens par la vulgarisation des normes.</p>
        </div>
      </div>

      <div className="p-8 rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <p className="text-slate-300 text-center text-lg leading-relaxed">"Une installation électrique de qualité se caractérise par son aptitude à assurer le fonctionnement des appareils, sa capacité à garantir la sécurité des personnes et la conservation des biens, et sa conception économique."</p>
      </div>
    </div>
  );
};

// --- Main Page ---

export default function AboutPage() {
  useGlobalHeader().setHide(true);
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeSection, setActiveSection] = useState<AboutSection>('presentation');

  useEffect(() => {
    const handleHashChange = () => {
      let hash = window.location.hash.replace('#', '');
      
      // Aliases pour l'ancienne structure si quelqu'un vient de l'extérieur
      if (hash === 'values' || hash === 'valeurs' || hash === 'vision' || hash === 'history') {
        hash = 'presentation';
        window.history.replaceState(null, '', '#presentation');
      } else if (hash === 'team') {
        hash = 'governance';
        window.history.replaceState(null, '', '#governance');
      } else if (hash === 'partners') {
        hash = 'international';
        window.history.replaceState(null, '', '#international');
      } else if (hash === 'reports') {
        hash = 'information';
        window.history.replaceState(null, '', '#information');
      }

      if (hash && sections.find((s) => s.id === hash)) {
        setActiveSection(hash as AboutSection);
      } else if (hash) {
        // Redirection par défaut si l'ancre n'est pas reconnue
        setActiveSection('presentation');
        window.history.replaceState(null, '', '#presentation');
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    handleHashChange(); // Vérification au chargement initial

    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const handleSectionChange = (id: AboutSection) => {
    setActiveSection(id);
    window.location.hash = id;
  };

  const renderContent = () => {
    switch (activeSection) {
      case 'edito': return <SectionEdito />;
      case 'presentation': return <SectionPresentation />;
      case 'association': return <SectionAssociation />;
      case 'governance': return <SectionGovernance />;
      case 'activities': return <SectionActivities />;
      case 'information': return <SectionInformation />;
      case 'formation': return <SectionFormation />;
      case 'international': return <SectionInternational />;
      default: return <SectionPresentation />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/50 flex flex-col font-sans">
      <SEO
        title="Découvrir PROQUELEC - Histoire, Vision et Engagement"
        description="Plongez au cœur de PROQUELEC. Découvrez notre histoire depuis 1995, notre vision pour le Sénégal et l'équipe qui certifie votre sécurité." />
      
      <Header solid={true} />

      <main className="flex-grow pt-8">
        {/* Hero Minimalist */}
        <section className="bg-slate-900 pt-32 pb-64 relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10"></div>
          <div className="container max-w-7xl mx-auto px-4 relative z-10 text-center space-y-8">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500/10 border border-blue-500/20 rounded-full text-blue-400 text-xs font-black uppercase tracking-[0.2em]">
              <Globe className="w-4 h-4" /> Excellence Normative
            </motion.div>
            <h1 className="text-5xl md:text-7xl font-black text-white uppercase tracking-tighter leading-none">
              Informations sur <br /> <span className="text-blue-600">PROQUELEC</span>.
            </h1>
          </div>
        </section>

        {/* Sticky Nav Sub-menu */}
        <div className="sticky top-[var(--effective-header-height,110px)] z-[40] mt-[-80px] flex justify-center px-4 w-full">
          <div className="bg-white/90 backdrop-blur-xl border border-white/40 shadow-2xl shadow-blue-900/5 rounded-full p-2 max-w-full overflow-hidden">
            <div className="flex items-center gap-1 md:gap-2 overflow-x-auto max-w-[90vw] [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none'] px-1">
              {sections.map((section) => {
                const isActive = activeSection === section.id;
                return (
                  <button
                    key={section.id}
                    onClick={() => handleSectionChange(section.id)}
                    className={cn(
                      "group flex items-center gap-2 px-6 py-3 rounded-full font-bold text-sm transition-all duration-300 whitespace-nowrap",
                      isActive ?
                      "bg-slate-900 text-white shadow-lg ring-1 ring-blue-500/20 translate-y-[-1px]" :
                      "text-slate-500 hover:bg-slate-100 hover:text-blue-600 hover:shadow-sm"
                    )} aria-label={section.label}>
                    
                    <section.icon className={cn("w-4 h-4 transition-colors duration-300", isActive ? "text-blue-400" : "text-slate-400 group-hover:text-blue-600")} />
                    {section.label}
                  </button>);
              })}
            </div>
          </div>
        </div>

        {/* Content Area */}
        <section className="py-24 px-4 bg-white min-h-[600px]">
          <div className="container max-w-7xl mx-auto">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeSection}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -30 }}
                transition={{ duration: 0.4, ease: "easeOut" }}>
                
                <div className="mb-16 text-center">
                  <span className="text-blue-600 font-black uppercase tracking-widest text-sm block mb-3">PROQUELEC</span>
                  <h2 className="text-4xl font-black text-slate-900 uppercase tracking-tighter">{sections.find((s) => s.id === activeSection)?.label}</h2>
                </div>

                <div>
                  {renderContent()}
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </section>

        {/* Global CTA */}
        <section className="py-32 bg-slate-50 border-t border-slate-100 overflow-hidden relative">
          <div className="absolute -bottom-64 -right-64 w-[500px] h-[500px] bg-blue-100 rounded-full blur-[150px] opacity-50"></div>
          <div className="container max-w-5xl mx-auto px-4 text-center space-y-12">
            <h2 className="text-4xl md:text-5xl font-black text-slate-900 uppercase tracking-tighter italic">
              Assurez votre sécurité <br /> électrique <span className="text-blue-600 underline">dès aujourd'hui.</span>
            </h2>
            <div className="flex flex-wrap justify-center gap-6 relative z-10">
              <a href="/contact" className="group flex items-center gap-3 px-12 py-6 bg-slate-900 text-white rounded-[2rem] font-black text-lg transition-transform hover:scale-105 hover:bg-slate-800">
                Nous Contacter
                <ArrowRight className="w-6 h-6 group-hover:translate-x-2 transition-transform text-blue-400" />
              </a>
            </div>
          </div>
        </section>
      </main>

      <Footer />
      <ScrollToTopButton aria-label="Action" />
    </div>
  );
}