/**
 * GlossaireElectrique.tsx
 * Lexique électrique basé sur les 232 définitions de la NS 01-001
 * Norme sénégalaise pour les installations électriques basse tension
 */
import React, { useState, useMemo, useRef } from 'react';
import { Search, BookOpen, ChevronDown, Bookmark } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';

const GLOSSARY_DATA = [
  { term: "Ame", definition: "Partie conductrice d'un câble ou d'un conducteur.", category: "Câbles" },
  { term: "Appareil d'utilisation", definition: "Appareil destiné à utiliser l'énergie électrique (lampe, moteur, radiateur, etc.).", category: "Matériels" },
  { term: "Barre de terre", definition: "Barre de connexion utilisée pour relier plusieurs conducteurs de terre entre eux.", category: "Mise à la terre" },
  { term: "Borne principale de terre", definition: "Point de connexion commun où sont reliés les conducteurs de terre, les conducteurs de protection et les liaisons équipotentielles.", category: "Mise à la terre" },
  { term: "Canalisation", definition: "Ensemble constitué d'un ou plusieurs conducteurs électriques et des éléments assurant leur fixation et leur protection mécanique.", category: "Câbles" },
  { term: "Caniveau", definition: "Canalisation fermée encastrée dans le sol ou les murs pour le passage des conducteurs.", category: "Câbles" },
  { term: "Chemin de câbles", definition: "Support continu en forme d'échelle ou de bac pour supporter les câbles.", category: "Câbles" },
  { term: "Circuit de distribution", definition: "Circuit situé entre un tableau de distribution et les circuits terminaux.", category: "Circuits" },
  { term: "Circuit terminal", definition: "Circuit situé en aval du dernier dispositif de protection contre les surintensités.", category: "Circuits" },
  { term: "Classe I", definition: "Matériel dont la protection contre les chocs électriques ne repose pas seulement sur l'isolation principale mais comporte un conducteur de protection relié à la terre.", category: "Protection" },
  { term: "Classe II", definition: "Matériel dont la protection contre les chocs électriques repose sur une isolation double ou renforcée, sans conducteur de protection.", category: "Protection" },
  { term: "Classe III", definition: "Matériel alimenté en TBTS dont la tension ne dépasse pas 50V en alternatif ou 120V en continu.", category: "Protection" },
  { term: "Coffret de chantier", definition: "Tableau électrique mobile destiné aux installations temporaires sur chantier.", category: "Installations" },
  { term: "Conducteur de phase", definition: "Conducteur actif qui transporte le courant sous tension en régime normal.", category: "Circuits" },
  { term: "Conducteur de protection (PE)", definition: "Conducteur reliant les masses à la prise de terre ou au neutre pour assurer la protection contre les contacts indirects.", category: "Mise à la terre" },
  { term: "Conducteur PEN", definition: "Conducteur combinant les fonctions de conducteur neutre et de conducteur de protection.", category: "Mise à la terre" },
  { term: "Conduit", definition: "Élément tubulaire destiné au passage des conducteurs électriques.", category: "Câbles" },
  { term: "Contact direct", definition: "Contact d'une personne avec une partie active de l'installation électrique.", category: "Protection" },
  { term: "Contact indirect", definition: "Contact d'une personne avec une masse mise sous tension par un défaut d'isolation.", category: "Protection" },
  { term: "Courant de défaut", definition: "Courant qui circule dans un circuit en raison d'un défaut d'isolation.", category: "Protection" },
  { term: "Courant de fuite", definition: "Courant s'écoulant à la terre en fonctionnement normal d'un appareil.", category: "Protection" },
  { term: "Court-circuit", definition: "Contact accidentel entre deux conducteurs de phases ou entre phase et neutre, créant un courant très élevé.", category: "Protection" },
  { term: "DDR (Dispositif Différentiel Résiduel)", definition: "Dispositif de protection qui coupe automatiquement l'alimentation en cas de courant de fuite à la terre.", category: "Protection" },
  { term: "Degré de protection (IP)", definition: "Classification numérique (IPXX) définissant la protection contre la pénétration de corps solides (1er chiffre) et de liquides (2e chiffre).", category: "Matériels" },
  { term: "Disjoncteur", definition: "Appareil de protection capable d'établir, de supporter et d'interrompre les courants dans les conditions normales et anormales du circuit.", category: "Matériels" },
  { term: "Dispositif de coupure d'urgence", definition: "Dispositif destiné à couper rapidement l'alimentation en cas de danger immédiat.", category: "Matériels" },
  { term: "Fusible", definition: "Dispositif de protection qui interrompt le courant par fusion d'un élément calibré.", category: "Matériels" },
  { term: "Gaine Technique Logement (GTL)", definition: "Gaine regroupant le panneau de contrôle, le tableau électrique et les équipements de communication du logement.", category: "Installations" },
  { term: "Goulotte", definition: "Canalisation de section rectangulaire, fermée, montée en saillie pour le passage des conducteurs.", category: "Câbles" },
  { term: "Habilité électrique", definition: "Reconnaissance de la capacité d'une personne à effectuer des opérations électriques en sécurité.", category: "Général" },
  { term: "IP (Indice de Protection)", definition: "Code normalisé indiquant le degré de protection d'un matériel contre la pénétration de corps solides et de liquides.", category: "Matériels" },
  { term: "Influence externe", definition: "Condition environnementale (température, eau, poussière, etc.) affectant le choix et la mise en œuvre des matériels.", category: "Installations" },
  { term: "Liaison équipotentielle", definition: "Connexion électrique entre des masses et/ou éléments conducteurs pour maintenir le même potentiel.", category: "Mise à la terre" },
  { term: "Masse", definition: "Partie conductrice d'un matériel électrique susceptible d'être touchée et normalement isolée des parties actives.", category: "Protection" },
  { term: "Moulure", definition: "Petite canalisation en bois ou plastique fixée en saillie pour passages apparents.", category: "Câbles" },
  { term: "Neutre", definition: "Point d'un réseau électrique dont le potentiel est la référence (généralement relié à la terre).", category: "Circuits" },
  { term: "Parafoudre", definition: "Dispositif de protection contre les surtensions d'origine atmosphérique ou de manœuvre.", category: "Protection" },
  { term: "Plan de bornes", definition: "Document représentant les connexions des différents appareils d'un tableau électrique.", category: "Schémas" },
  { term: "Pouvoir de coupure", definition: "Courant maximal qu'un dispositif de protection peut interrompre sans dommage.", category: "Matériels" },
  { term: "Prise de terre", definition: "Ensemble de conducteurs enfouis dans le sol assurant la liaison électrique avec la terre.", category: "Mise à la terre" },
  { term: "Régime de neutre", definition: "Manière dont le neutre du transformateur est relié à la terre et dont les masses sont connectées.", category: "Circuits" },
  { term: "Résistance de terre", definition: "Résistance électrique de la prise de terre par rapport au sol environnant, mesurée en ohms.", category: "Mise à la terre" },
  { term: "Schéma IT", definition: "Schéma où le neutre est isolé de la terre ou relié via une impédance, et les masses sont interconnectées et reliées à la terre.", category: "Schémas" },
  { term: "Schéma multifilaire", definition: "Représentation où tous les conducteurs actifs sont représentés individuellement.", category: "Schémas" },
  { term: "Schéma TN", definition: "Schéma de liaison à la terre où le neutre est directement relié à la terre et les masses au neutre via un conducteur PE.", category: "Schémas" },
  { term: "Schéma TT", definition: "Schéma où le neutre est relié à la terre et les masses sont reliées à une prise de terre indépendante.", category: "Schémas" },
  { term: "Schéma unifilaire", definition: "Représentation schématique d'une installation où chaque circuit est représenté par un seul trait.", category: "Schémas" },
  { term: "Section de câble", definition: "Surface de la section transversale du conducteur, exprimée en mm². Détermine le courant admissible.", category: "Câbles" },
  { term: "Sectionnement", definition: "Position d'un appareil qui assure l'isolation du circuit pour intervention en sécurité.", category: "Matériels" },
  { term: "Selectivité", definition: "Coordination des dispositifs de protection pour que seul le dispositif en amont du défaut fonctionne.", category: "Protection" },
  { term: "Surcharge", definition: "Fonctionnement d'un circuit au-delà de son courant nominal pendant une durée prolongée.", category: "Protection" },
  { term: "TBTS (Très Basse Tension de Sécurité)", definition: "Tension ne dépassant pas 50V en alternatif ou 120V en continu, issue d'une source de sécurité.", category: "Tensions" },
  { term: "Tableau de répartition", definition: "Ensemble d'appareillage regroupant les dispositifs de protection et de commande des circuits.", category: "Installations" },
  { term: "Tension de contact", definition: "Tension apparaissant entre une masse et la terre lors d'un défaut d'isolation.", category: "Tensions" },
  { term: "Tension de défaut", definition: "Tension apparaissant sur une masse lors d'un défaut d'isolation.", category: "Tensions" },
  { term: "Tension nominale", definition: "Tension de référence d'une installation ou d'un matériel pour laquelle il est conçu.", category: "Tensions" },
  { term: "Volume (salle d'eau)", definition: "Zones de 0 à 3 définies autour d'une baignoire ou douche avec des prescriptions électriques spécifiques.", category: "Installations" },
  { term: "Certification PROQUELEC", definition: "Label de qualité décerné aux installations électriques conformes à la NS 01-001.", category: "Général" },
];

function getFirstLetter(term: string): string {
  const c = term.charAt(0).toUpperCase();
  // Handle accented characters like "Â" -> A, "É" -> E, etc.
  const normalized = c.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  return normalized;
}

function groupByFirstLetter(entries: typeof GLOSSARY_DATA): Map<string, typeof GLOSSARY_DATA> {
  const map = new Map<string, typeof GLOSSARY_DATA>();
  for (const entry of entries) {
    const letter = getFirstLetter(entry.term);
    if (!map.has(letter)) map.set(letter, []);
    map.get(letter)!.push(entry);
  }
  return map;
}

const CATEGORIES = [
  ...new Set(GLOSSARY_DATA.map((e) => e.category)),
].sort();

export default function GlossaireElectrique() {
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [expandedTerm, setExpandedTerm] = useState<string | null>(null);
  const [activeLetter, setActiveLetter] = useState<string | null>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  // Filtered data based on search and category
  const filtered = useMemo(() => {
    return GLOSSARY_DATA.filter((entry) => {
      const matchSearch =
        !search.trim() ||
        entry.term.toLowerCase().includes(search.toLowerCase()) ||
        entry.definition.toLowerCase().includes(search.toLowerCase());
      const matchCategory =
        !activeCategory || entry.category === activeCategory;
      return matchSearch && matchCategory;
    });
  }, [search, activeCategory]);

  // Group filtered results by first letter
  const grouped = useMemo(() => groupByFirstLetter(filtered), [filtered]);

  // Sorted letters present in the filtered results
  const availableLetters = useMemo(
    () => Array.from(grouped.keys()).sort(),
    [grouped],
  );

  // All distinct letters across the full glossary (for the side index)
  const allLetters = useMemo(() => {
    const letters = new Set<string>();
    for (const entry of GLOSSARY_DATA) {
      letters.add(getFirstLetter(entry.term));
    }
    return Array.from(letters).sort();
  }, []);

  const toggleTerm = (term: string) => {
    setExpandedTerm((prev) => (prev === term ? null : term));
  };

  const scrollToLetter = (letter: string) => {
    setActiveLetter(letter);
    const el = document.getElementById(`gloss-letter-${letter}`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* ── Header ── */}
        <div className="flex items-center gap-4 mb-8">
          <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
            <BookOpen className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-900">
              Glossaire Électrique
            </h1>
            <p className="text-sm text-slate-500">
              58 définitions essentielles de la NS 01-001 — Norme sénégalaise
              pour les installations électriques BT
            </p>
          </div>
        </div>

        {/* ── Search bar ── */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            type="text"
            placeholder="Rechercher un terme ou une définition..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 h-12 text-base"
          />
        </div>

        {/* ── Category filters ── */}
        <div className="flex flex-wrap gap-2 mb-8">
          <button
            onClick={() => setActiveCategory(null)}
            className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
              !activeCategory
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Tous
          </button>
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() =>
                setActiveCategory(cat === activeCategory ? null : cat)
              }
              className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
                activeCategory === cat
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* ── Main layout: side index + results ── */}
        <div className="flex gap-6">
          {/* Letter index (sticky sidebar) */}
          <aside className="hidden lg:block sticky top-8 self-start flex-shrink-0">
            <nav className="flex flex-col gap-0.5 bg-white rounded-xl border border-slate-200 p-2 shadow-sm">
              {allLetters.map((letter) => {
                const isActive = availableLetters.includes(letter);
                const isCurrent = activeLetter === letter;
                return (
                  <button
                    key={letter}
                    onClick={() => isActive && scrollToLetter(letter)}
                    disabled={!isActive}
                    className={`w-8 h-8 text-xs font-bold rounded-lg flex items-center justify-center transition-all ${
                      isCurrent
                        ? 'bg-blue-600 text-white'
                        : isActive
                          ? 'text-blue-700 hover:bg-blue-50 cursor-pointer'
                          : 'text-slate-300 cursor-not-allowed'
                    }`}
                  >
                    {letter}
                  </button>
                );
              })}
            </nav>
          </aside>

          {/* Results */}
          <div ref={resultsRef} className="flex-1 min-w-0">
            {filtered.length === 0 && (
              <div className="text-center py-16 text-slate-400">
                <Bookmark className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p className="font-medium">Aucun terme trouvé</p>
                <p className="text-sm">
                  Essayez de modifier votre recherche ou vos filtres
                </p>
              </div>
            )}

            {Array.from(grouped.entries()).map(([letter, entries]) => (
              <section
                key={letter}
                id={`gloss-letter-${letter}`}
                className="mb-8 scroll-mt-20"
              >
                {/* Letter heading */}
                <div className="flex items-center gap-3 mb-4">
                  <span className="w-10 h-10 bg-blue-600 text-white font-black text-lg rounded-xl flex items-center justify-center shadow-sm">
                    {letter}
                  </span>
                  <span className="h-px flex-1 bg-slate-200" />
                  <span className="text-xs text-slate-400 font-medium">
                    {entries.length} terme{entries.length > 1 ? 's' : ''}
                  </span>
                </div>

                {/* Term cards */}
                <div className="space-y-2">
                  {entries.map((entry) => {
                    const isOpen = expandedTerm === entry.term;
                    return (
                      <Card
                        key={entry.term}
                        className={`border transition-all cursor-pointer hover:shadow-md ${
                          isOpen
                            ? 'border-blue-200 shadow-sm'
                            : 'border-slate-200'
                        }`}
                        onClick={() => toggleTerm(entry.term)}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <Badge
                                  variant="secondary"
                                  className="text-[10px] font-bold uppercase tracking-wider"
                                >
                                  {entry.category}
                                </Badge>
                              </div>
                              <h3 className="font-semibold text-slate-900 text-sm leading-relaxed">
                                {entry.term}
                              </h3>
                            </div>
                            <ChevronDown
                              className={`w-5 h-5 text-slate-400 mt-1 transition-transform flex-shrink-0 ${
                                isOpen ? 'rotate-180' : ''
                              }`}
                            />
                          </div>
                          {isOpen && (
                            <div className="mt-4 pt-3 border-t border-slate-100">
                              <p className="text-sm text-slate-600 leading-relaxed">
                                {entry.definition}
                              </p>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </section>
            ))}
          </div>
        </div>

        {/* Footer */}
        <p className="text-xs text-slate-400 text-center mt-12 border-t border-slate-100 pt-6">
          Source : NS 01-001 (JUIN 2008) — Titre 2 : Définitions &mdash;
          Association Sénégalaise de Normalisation (ASN) &amp; PROQUELEC
        </p>
      </div>
    </div>
  );
}
