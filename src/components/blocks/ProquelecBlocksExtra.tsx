import React, { useState } from 'react';
import { useNode } from '@craftjs/core';
import { getUniversalStyles } from './universalStyles';
import { resolveDynamicContent } from '@/lib/dynamic-data/resolver';
import { AutoSettingsPanel } from './AutoSettingsPanel';

// Helper for splitting text by pipes
const splitLines = (value: string) =>
  String(value || '')
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);

const parsePipeItems = <T,>(value: string, mapper: (parts: string[], raw: string) => T) =>
  splitLines(value).map((line) =>
    mapper(
      line.split('|').map((part) => part.trim()),
      line,
    ),
  );

// 1. HabilitationCardsBlock
export const HabilitationCardsBlock = (props: any) => {
  const { title = "Titres d'Habilitation électrique", cards = "Exécutant B0 | Basse Tension (BT) | Effectue des travaux non électriques\nChargé de chantier B0 | Basse Tension (BT) | Encadrement des B0, sécurisation du site" } = props;
  const { connectors: { connect, drag } } = useNode();
  const u = getUniversalStyles(props);
  const parsedCards = parsePipeItems(cards, (parts) => ({ title: parts[0], domain: parts[1], role: parts[2] }));

  return (
    <div ref={(r: any) => { if (r) connect(drag(r)); }} style={u.style} className={`proquelec-builder-node py-12 ${u.className || ''}`}>
      <div className="max-w-6xl mx-auto px-4">
        <h2 className="text-3xl font-bold text-center text-slate-900 mb-10">{resolveDynamicContent(title)}</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {parsedCards.map((c, i) => (
            <div key={i} className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-xl">⚡</div>
                <h3 className="font-bold text-lg text-slate-800">{resolveDynamicContent(c.title || '')}</h3>
              </div>
              <div className="mb-3">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Domaine</span>
                <p className="text-slate-700">{resolveDynamicContent(c.domain || '')}</p>
              </div>
              <div>
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Rôle</span>
                <p className="text-slate-600 text-sm leading-relaxed">{resolveDynamicContent(c.role || '')}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
HabilitationCardsBlock.craft = {
  displayName: 'Cartes Habilitation',
  props: { title: "Titres d'Habilitation électrique", cards: "Exécutant B0 | Basse Tension (BT) | Effectue des travaux non électriques\nChargé de chantier B0 | Basse Tension (BT) | Encadrement des B0, sécurisation du site" },
  related: { settings: AutoSettingsPanel },
};

// 2. TrainingPricingTableBlock
export const TrainingPricingTableBlock = (props: any) => {
  const { title = "Tarifs des Modules", rows = "Exécutants (B0) | 1 Session | 500 000 FCFA\nChargé de chantier (B0) | 2 Sessions | 1 000 000 FCFA" } = props;
  const { connectors: { connect, drag } } = useNode();
  const u = getUniversalStyles(props);
  const parsedRows = parsePipeItems(rows, (parts) => ({ name: parts[0], duration: parts[1], price: parts[2] }));

  return (
    <div ref={(r: any) => { if (r) connect(drag(r)); }} style={u.style} className={`proquelec-builder-node py-12 bg-slate-50 ${u.className || ''}`}>
      <div className="max-w-4xl mx-auto px-4">
        <h2 className="text-2xl font-bold text-slate-900 mb-6 text-center">{resolveDynamicContent(title)}</h2>
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-blue-600 text-white">
                <th className="p-4 font-semibold">Module</th>
                <th className="p-4 font-semibold">Durée</th>
                <th className="p-4 font-semibold text-right">Tarif</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {parsedRows.map((r, i) => (
                <tr key={i} className="hover:bg-slate-50 transition-colors">
                  <td className="p-4 font-medium text-slate-800">{resolveDynamicContent(r.name || '')}</td>
                  <td className="p-4 text-slate-600">{resolveDynamicContent(r.duration || '')}</td>
                  <td className="p-4 text-right font-bold text-blue-600">{resolveDynamicContent(r.price || '')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
TrainingPricingTableBlock.craft = {
  displayName: 'Tarifs Modules',
  props: { title: "Tarifs des Modules", rows: "Exécutants (B0) | 1 Session | 500 000 FCFA\nChargé de chantier (B0) | 2 Sessions | 1 000 000 FCFA" },
  related: { settings: AutoSettingsPanel },
};

// 3. ProquelecActivitiesGridBlock
export const ProquelecActivitiesGridBlock = (props: any) => {
  const { title = "Nos Activités", activities = "Diffusion d’informations | Élaboration et diffusion de documents techniques | 📚\nAssistance technique | Accompagnement dans les projets électriques | 🛠️\nFormation et sensibilisation | Sessions pour artisans électriciens | 🎓" } = props;
  const { connectors: { connect, drag } } = useNode();
  const u = getUniversalStyles(props);
  const parsed = parsePipeItems(activities, (parts) => ({ title: parts[0], desc: parts[1], icon: parts[2] }));

  return (
    <div ref={(r: any) => { if (r) connect(drag(r)); }} style={u.style} className={`proquelec-builder-node py-16 ${u.className || ''}`}>
      <div className="max-w-6xl mx-auto px-4">
        <h2 className="text-3xl font-black text-center text-slate-900 mb-12 uppercase tracking-wide">{resolveDynamicContent(title)}</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {parsed.map((a, i) => (
            <div key={i} className="group relative bg-white p-8 rounded-2xl shadow-sm border border-slate-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-blue-50 rounded-bl-full -z-10 group-hover:bg-blue-100 transition-colors"></div>
              <div className="text-4xl mb-6">{resolveDynamicContent(a.icon || '⚡')}</div>
              <h3 className="text-xl font-bold text-slate-800 mb-3">{resolveDynamicContent(a.title || '')}</h3>
              <p className="text-slate-600 leading-relaxed">{resolveDynamicContent(a.desc || '')}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
ProquelecActivitiesGridBlock.craft = {
  displayName: 'Grille Activités',
  props: { title: "Nos Activités", activities: "Diffusion d’informations | Élaboration et diffusion de documents techniques | 📚\nAssistance technique | Accompagnement dans les projets électriques | 🛠️\nFormation et sensibilisation | Sessions pour artisans électriciens | 🎓" },
  related: { settings: AutoSettingsPanel },
};

// 4. TargetAudienceTabsBlock
export const TargetAudienceTabsBlock = (props: any) => {
  const { title = "L'Information pour tous", tabs = "Professionnels | Mémentos et guides techniques pour appliquer les normes\nSyndics | Feuillets techniques et aides-mémoires pour les gérants\nGrand Public | Dépliants gratuits pour sensibiliser aux risques" } = props;
  const { connectors: { connect, drag } } = useNode();
  const u = getUniversalStyles(props);
  const parsed = parsePipeItems(tabs, (parts) => ({ name: parts[0], content: parts[1] }));
  const [activeTab, setActiveTab] = useState(0);

  return (
    <div ref={(r: any) => { if (r) connect(drag(r)); }} style={u.style} className={`proquelec-builder-node py-16 bg-white ${u.className || ''}`}>
      <div className="max-w-4xl mx-auto px-4">
        <h2 className="text-3xl font-bold text-center text-slate-900 mb-10">{resolveDynamicContent(title)}</h2>
        <div className="flex flex-wrap justify-center gap-2 mb-8">
          {parsed.map((t, i) => (
            <button
              key={i}
              onClick={() => setActiveTab(i)}
              className={`px-6 py-3 rounded-full font-semibold text-sm transition-all ${activeTab === i ? 'bg-blue-600 text-white shadow-md' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
            >
              {resolveDynamicContent(t.name || '')}
            </button>
          ))}
        </div>
        <div className="bg-slate-50 p-8 rounded-2xl border border-slate-100 min-h-[150px] flex items-center justify-center text-center">
          <p className="text-lg text-slate-700 leading-relaxed max-w-2xl">
            {parsed[activeTab] ? resolveDynamicContent(parsed[activeTab].content || '') : ''}
          </p>
        </div>
      </div>
    </div>
  );
};
TargetAudienceTabsBlock.craft = {
  displayName: 'Onglets Publics',
  props: { title: "L'Information pour tous", tabs: "Professionnels | Mémentos et guides techniques pour appliquer les normes\nSyndics | Feuillets techniques et aides-mémoires pour les gérants\nGrand Public | Dépliants gratuits pour sensibiliser aux risques" },
  related: { settings: AutoSettingsPanel },
};

// 5. OrganizationStructureBlock
export const OrganizationStructureBlock = (props: any) => {
  const { title = "Composition de l'Association", sections = "Membre Actif | Distributeurs, installateurs, bureaux d'études | #2563eb\nMembre Associé | Activités liées à la sécurité intérieure | #f59e0b\nMembre Observateur | Organisations de défense des consommateurs | #10b981" } = props;
  const { connectors: { connect, drag } } = useNode();
  const u = getUniversalStyles(props);
  const parsed = parsePipeItems(sections, (parts) => ({ name: parts[0], desc: parts[1], color: parts[2] || '#2563eb' }));

  return (
    <div ref={(r: any) => { if (r) connect(drag(r)); }} style={u.style} className={`proquelec-builder-node py-16 ${u.className || ''}`}>
      <div className="max-w-5xl mx-auto px-4">
        <h2 className="text-3xl font-bold text-center text-slate-900 mb-12">{resolveDynamicContent(title)}</h2>
        <div className="flex flex-col gap-6">
          {parsed.map((s, i) => (
            <div key={i} className="flex flex-col md:flex-row items-stretch bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden transition-transform hover:scale-[1.01]">
              <div className="md:w-1/3 w-full p-6 text-white text-center font-bold text-xl flex items-center justify-center min-h-[100px]" style={{ backgroundColor: s.color }}>
                {resolveDynamicContent(s.name || '')}
              </div>
              <div className="md:w-2/3 w-full p-6 text-slate-700 text-lg flex items-center">
                {resolveDynamicContent(s.desc || '')}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
OrganizationStructureBlock.craft = {
  displayName: 'Structure Organisation',
  props: { title: "Composition de l'Association", sections: "Membre Actif | Distributeurs, installateurs, bureaux d'études | #2563eb\nMembre Associé | Activités liées à la sécurité intérieure | #f59e0b\nMembre Observateur | Organisations de défense des consommateurs | #10b981" },
  related: { settings: AutoSettingsPanel },
};

// 6. ReferenceStatsBlock
export const ReferenceStatsBlock = (props: any) => {
  const { title = "Notre Impact", stats = "+10 000 | Artisans formés\n+250 | Sites contrôlés\n100% | Taux de satisfaction" } = props;
  const { connectors: { connect, drag } } = useNode();
  const u = getUniversalStyles(props);
  const parsed = parsePipeItems(stats, (parts) => ({ number: parts[0], label: parts[1] }));

  return (
    <div ref={(r: any) => { if (r) connect(drag(r)); }} style={u.style} className={`proquelec-builder-node py-16 bg-blue-900 text-white ${u.className || ''}`}>
      <div className="max-w-5xl mx-auto px-4">
        {title && <h2 className="text-3xl font-bold text-center text-blue-100 mb-12">{resolveDynamicContent(title)}</h2>}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          {parsed.map((s, i) => (
            <div key={i} className="p-6">
              <div className="text-5xl font-black text-yellow-400 mb-4">{resolveDynamicContent(s.number || '')}</div>
              <div className="text-lg font-medium text-blue-100 uppercase tracking-wider">{resolveDynamicContent(s.label || '')}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
ReferenceStatsBlock.craft = {
  displayName: 'Stats Références',
  props: { title: "Notre Impact", stats: "+10 000 | Artisans formés\n+250 | Sites contrôlés\n100% | Taux de satisfaction" },
  related: { settings: AutoSettingsPanel },
};

// 7. ProquelecSubdomainsBlock
export const ProquelecSubdomainsBlock = (props: any) => {
  const {
    title = "Écosystème Numérique PROQUELEC",
    subtitle = "Accédez aux plateformes et sous-domaines officiels de PROQUELEC pour la sécurité et la conformité électrique au Sénégal.",
    subdomains = "Site Principal | https://www.proquelec.sn | Portail officiel d'information, simulateurs et administration | 🌐 | Portail Principal\nGED OS | https://ged.proquelec.sn | Plateforme intelligente multidomaine (Système d'Exploitation Métier) pour créer, piloter et automatiser des écosystèmes | 📂 | Système d'Exploitation\nSuivi et traitement Inspection Cossuel (ST) | https://cossuel.proquelec.sn | Supervision de la conformité électrique nationale et statistiques | 📊 | Supervision & Stats\nAcadémie PROQUELEC | https://academie.proquelec.sn | Centre de formation numérique, e-learning et habilitations | 🎓 | E-Learning & Habilitation"
  } = props;
  
  const { connectors: { connect, drag } } = useNode();
  const u = getUniversalStyles(props);
  const parsed = parsePipeItems(subdomains, (parts) => ({
    name: parts[0],
    url: parts[1],
    desc: parts[2],
    icon: parts[3] || '⚡',
    role: parts[4] || 'Plateforme'
  }));

  return (
    <div ref={(r: any) => { if (r) connect(drag(r)); }} style={u.style} className={`proquelec-builder-node py-16 bg-slate-900 text-white ${u.className || ''}`}>
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-4xl font-extrabold tracking-tight text-white mb-4">
            {resolveDynamicContent(title)}
          </h2>
          <p className="text-lg text-slate-300">
            {resolveDynamicContent(subtitle)}
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {parsed.map((s, i) => (
            <div key={i} className="group relative bg-slate-800/50 backdrop-blur-sm border border-slate-700/60 p-8 rounded-2xl hover:bg-slate-800 hover:border-slate-600 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-6">
                  <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-3xl group-hover:scale-110 transition-transform duration-300">
                    {resolveDynamicContent(s.icon)}
                  </div>
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20">
                    {resolveDynamicContent(s.role)}
                  </span>
                </div>
                <h3 className="text-2xl font-bold text-white mb-3 group-hover:text-blue-400 transition-colors">
                  {resolveDynamicContent(s.name)}
                </h3>
                <p className="text-slate-400 leading-relaxed mb-6">
                  {resolveDynamicContent(s.desc)}
                </p>
              </div>
              <div>
                <a
                  href={s.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center w-full px-5 py-3 rounded-xl font-bold text-sm bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/10 hover:shadow-blue-500/20 transition-all duration-300"
                >
                  Accéder au site ({s.url.replace('https://', '')})
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

ProquelecSubdomainsBlock.craft = {
  displayName: 'Annuaire Sous-Domaines',
  props: {
    title: "Écosystème Numérique PROQUELEC",
    subtitle: "Accédez aux plateformes et sous-domaines officiels de PROQUELEC pour la sécurité et la conformité électrique au Sénégal.",
    subdomains: "Site Principal | https://www.proquelec.sn | Portail officiel d'information, simulateurs et administration | 🌐 | Portail Principal\nGED OS | https://ged.proquelec.sn | Plateforme intelligente multidomaine (Système d'Exploitation Métier) pour créer, piloter et automatiser des écosystèmes | 📂 | Système d'Exploitation\nSuivi et traitement Inspection Cossuel (ST) | https://cossuel.proquelec.sn | Supervision de la conformité électrique nationale et statistiques | 📊 | Supervision & Stats\nAcadémie PROQUELEC | https://academie.proquelec.sn | Centre de formation numérique, e-learning et habilitations | 🎓 | E-Learning & Habilitation"
  },
  related: { settings: AutoSettingsPanel },
};
