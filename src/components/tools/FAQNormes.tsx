/**
 * FAQNormes.tsx
 * Foire aux questions sur les normes NS 01-001
 * Alimentée par les données extraites du corpus normatif
 */
import React, { useState, useMemo } from 'react';
import { Search, BookOpen, ChevronDown, FileText } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';

// FAQ extraites du corpus NS 01-001 et des données PROQUELEC
const FAQ_DATA = [
  {
    q: "Qu'est-ce que PROQUELEC ?",
    r: "PROQUELEC est une association à but non lucratif, régie par la loi n° 68-08 du 26 mars 1968, établie en 1995. Sa mission est de promouvoir la qualité des équipements et installations électriques dans les bâtiments neufs et anciens au Sénégal.",
    tag: 'Général',
  },
  {
    q: "Où se trouve le siège de PROQUELEC ?",
    r: "Le siège social est situé à l'Immeuble Coumba Castel, 12 rue Saint-Michel, 4e étage, Dakar. Contact : +221 33 848 68 55, email : proquelec@proquelec.sn",
    tag: 'Général',
  },
  {
    q: "Qu'est-ce que la norme NS 01-001 ?",
    r: "La NS 01-001 (JUIN 2008) est la norme sénégalaise qui définit les règles des installations électriques à basse tension. Elle est équivalente à la norme française NF C 15-100 (2002), avec les adaptations nécessaires à la réglementation sénégalaise (Code du travail, Code de l'urbanisme, Code de l'environnement, etc.).",
    tag: 'Normes',
  },
  {
    q: "Quels sont les 7 titres de la NS 01-001 ?",
    r: "TITRE 1 : Domaine d'application, objet et principes fondamentaux\nTITRE 2 : Définitions (232 définitions techniques)\nTITRE 3 : Détermination des caractéristiques générales\nTITRE 4 : Protection pour assurer la sécurité\nTITRE 5 : Choix et mise en œuvre des matériels\nTITRE 6 : Vérifications et entretien des installations\nTITRE 7 : Règles pour les installations et emplacements spécifiques",
    tag: 'Normes',
  },
  {
    q: "Quels types de bâtiments sont couverts par la NS 01-001 ?",
    r: "La norme s'applique aux : bâtiments d'habitation, commerciaux, ERP (établissements recevant du public), industriels, agricoles, terrains de camping, chantiers, installations d'éclairage public, marinas.",
    tag: 'Normes',
  },
  {
    q: "Quels sont les 3 critères d'une installation électrique de qualité ?",
    r: "1. L'aptitude à assurer le bon fonctionnement des appareils alimentés\n2. La sécurité des personnes et la protection des biens (contre l'électrocution et l'incendie)\n3. Une conception et une utilisation économiques",
    tag: 'Sécurité',
  },
  {
    q: "Quelle est la tension maximale couverte par la NS 01-001 ?",
    r: "La norme s'applique aux installations alimentées sous une tension au plus égale à 1000 volts en courant alternatif et à 1500 volts en courant continu.",
    tag: 'Normes',
  },
  {
    q: "Quels sont les principes fondamentaux de protection ?",
    r: "La norme NS 01-001 énumère 5 principes fondamentaux de protection (article 131) :\n1. Protection contre les contacts directs (131.2.1)\n2. Protection contre les contacts indirects (131.2.2)\n3. Protection contre les effets thermiques (131.3)\n4. Protection contre les surintensités (131.4)\n5. Protection contre les courants de défaut (131.5)",
    tag: 'Sécurité',
  },
  {
    q: "Qu'est-ce qu'un DDR et à quoi sert-il ?",
    r: "Un DDR (Dispositif Différentiel Résiduel) est un appareil de protection qui coupe automatiquement le courant en cas de fuite à la terre. Pour les installations domestiques, un DDR 30mA est obligatoire pour protéger les personnes contre les chocs électriques. La norme impose que tous les circuits doivent être protégés par des DDR appropriés.",
    tag: 'Sécurité',
  },
  {
    q: "Quelles sont les sections minimales de conducteurs de terre ?",
    r: "Selon l'article 542.3.1 de la NS 01-001 :\n- Conducteurs isolés : 16 mm² en cuivre\n- Conducteurs nus enterrés : 25 mm² en cuivre ou 50 mm² en acier galvanisé/inox",
    tag: 'Technique',
  },
  {
    q: "Qu'est-ce qu'une GTL (Gaine Technique Logement) ?",
    r: "La GTL est une gaine technique qui doit contenir : le panneau de contrôle, le tableau de répartition principal, le tableau de communication, et 2 socles de prise de courant 16A. Elle permet de regrouper tous les équipements électriques et de communication du logement.",
    tag: 'Technique',
  },
  {
    q: "Quelles sont les hauteurs de pose recommandées ?",
    r: "Selon l'article 771.558.1 : les organes de manœuvre des dispositifs de coupure doivent être situés entre 1,00m et 1,80m du sol. Cette hauteur est limitée à 1,30m dans les locaux pour handicapés ou personnes âgées.",
    tag: 'Technique',
  },
  {
    q: "Combien de personnes PROQUELEC a-t-elle formées ?",
    r: "Plus de 10 000 formations ont été dispensées entre 2005 et 2024 dans presque toutes les régions du Sénégal. Les modules incluent l'habilitation électrique (B0, B1, B2, BR, BC) et la formation gratuite pour les artisans.",
    tag: 'Formation',
  },
  {
    q: "Quels documents PROQUELEC propose-t-elle ?",
    r: "PROQUELEC propose des Mémentos (synthèses pour rappel rapide des normes NS 01-001), des Guides Techniques (instructions détaillées), des Feuillets techniques (prise de terre, triphasé, liaisons équipotentielles), et des dépliants grand public comme 'L'électricité chez vous'.",
    tag: 'Général',
  },
  {
    q: "Comment protéger contre les contacts directs ?",
    r: "Selon l'article 412 de la NS 01-001, la protection contre les contacts directs peut être assurée par :\n- Isolation des parties actives\n- Barrières ou enveloppes (IP2X minimum)\n- Obstacles\n- Mise hors de portée par distance\n- Limitation de la tension (TBTS/TBTP)",
    tag: 'Sécurité',
  },
  {
    q: "Qu'est-ce que le schéma TN ?",
    r: "Le schéma TN est un système de liaison à la terre où le neutre est relié directement à la terre au poste source, et les masses sont reliées à ce neutre via un conducteur de protection (PE). Variantes : TN-S (PE séparé), TN-C (PEN combiné), TN-C-S (mixte).",
    tag: 'Technique',
  },
  {
    q: "Quel est le rôle de l'ASN ?",
    r: "L'ASN (Association Sénégalaise de Normalisation) est l'organisme national de normalisation et membre de PROQUELEC. C'est elle qui édite officiellement les normes au Sénégal. PROQUELEC assure la promotion et la vulgarisation des normes édictées par l'ASN.",
    tag: 'Général',
  },
  {
    q: "Quelles sont les règles pour les salles d'eau ?",
    r: "Les salles d'eau sont divisées en volumes (0, 1, 2, 3) avec des prescriptions spécifiques. Les boîtes de connexion ne sont pas admises dans les volumes 0, 1 et 2. Tous les matériels électriques situés hors volumes dans les locaux contenant une baignoire ou douche doivent être protégés par DDR 30mA.",
    tag: 'Sécurité',
  },
];

export default function FAQNormes() {
  const [search, setSearch] = useState('');
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [activeTag, setActiveTag] = useState<string | null>(null);

  const tags = useMemo(() => {
    const t = new Set(FAQ_DATA.map((f) => f.tag));
    return ['Tous', ...Array.from(t)];
  }, []);

  const filtered = useMemo(() => {
    return FAQ_DATA.filter((f) => {
      const matchSearch =
        !search.trim() ||
        f.q.toLowerCase().includes(search.toLowerCase()) ||
        f.r.toLowerCase().includes(search.toLowerCase());
      const matchTag = !activeTag || activeTag === 'Tous' || f.tag === activeTag;
      return matchSearch && matchTag;
    });
  }, [search, activeTag]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
            <BookOpen className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-900">FAQ Normes Électriques</h1>
            <p className="text-sm text-slate-500">
              Questions fréquentes sur la NS 01-001 et les normes électriques sénégalaises
            </p>
          </div>
        </div>

        {/* Search */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            type="text"
            placeholder="Rechercher une question..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 h-12 text-base"
          />
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-2 mb-6">
          {tags.map((tag) => (
            <button
              key={tag}
              onClick={() => setActiveTag(tag === 'Tous' ? null : tag)}
              className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
                (tag === 'Tous' && !activeTag) || activeTag === tag
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {tag}
            </button>
          ))}
        </div>

        {/* Questions */}
        <div className="space-y-3">
          {filtered.length === 0 && (
            <div className="text-center py-12 text-slate-400">
              <FileText className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p className="font-medium">Aucune question trouvée</p>
              <p className="text-sm">Essayez d'autres mots-clés</p>
            </div>
          )}
          {filtered.map((faq, i) => (
            <Card
              key={i}
              className={`border transition-all cursor-pointer hover:shadow-md ${
                openIndex === i ? 'border-blue-200 shadow-sm' : 'border-slate-200'
              }`}
              onClick={() => setOpenIndex(openIndex === i ? null : i)}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge
                        variant="secondary"
                        className="text-[10px] font-bold uppercase tracking-wider"
                      >
                        {faq.tag}
                      </Badge>
                    </div>
                    <h3 className="font-semibold text-slate-900 text-sm leading-relaxed">
                      {faq.q}
                    </h3>
                  </div>
                  <ChevronDown
                    className={`w-5 h-5 text-slate-400 mt-1 transition-transform flex-shrink-0 ${
                      openIndex === i ? 'rotate-180' : ''
                    }`}
                  />
                </div>
                {openIndex === i && (
                  <div className="mt-4 pt-3 border-t border-slate-100">
                    <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">
                      {faq.r}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        <p className="text-xs text-slate-400 text-center mt-8">
          Source : NS 01-001 (2008) — Norme sénégalaise pour les installations électriques BT
        </p>
      </div>
    </div>
  );
}
