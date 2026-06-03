import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ChevronRight } from 'lucide-react';
import { freeApps, premiumApps, type ProquelecApp } from '@/data/applications-catalog';

const toolSections = [
  {
    title: 'Outils Gratuits',
    subtitle: 'Accédez aux ressources gratuites pour sécuriser, sensibiliser et vérifier vos installations.',
    apps: freeApps,
    accent: 'emerald'
  },
  {
    title: 'Outils Premium',
    subtitle: 'Solutions métiers avancées pour électriciens, bureaux d’études et ingénierie.',
    apps: premiumApps,
    accent: 'amber'
  }
];

const getStatusColor = (status: string) => {
  switch (status) {
    case 'active':
      return 'bg-emerald-500/10 text-emerald-600 border-emerald-200';
    case 'coming':
      return 'bg-amber-500/10 text-amber-600 border-amber-200';
    case 'development':
      return 'bg-sky-500/10 text-sky-600 border-sky-200';
    default:
      return 'bg-slate-100 text-slate-700 border-slate-200';
  }
};

const getBadgeLabel = (status: string) => {
  switch (status) {
    case 'active':
      return 'Actif';
    case 'coming':
      return 'Bientôt';
    case 'development':
      return 'En dev';
    default:
      return 'Info';
  }
};

export const AvailableToolsSection: React.FC = () => {
  return (
    <section id="available-tools-section" className="relative overflow-hidden bg-slate-50 py-20 px-4 sm:px-6 lg:px-8">
      <div className="absolute inset-x-0 top-0 h-48 bg-gradient-to-b from-proqblue/10 to-transparent pointer-events-none" />

      <div className="relative mx-auto max-w-6xl">
        <div className="text-center mb-12">
          <span className="inline-flex items-center rounded-full bg-proqblue/10 px-4 py-1 text-sm font-semibold uppercase tracking-[0.2em] text-proqblue">
            Outils disponibles
          </span>
          <h2 className="mt-6 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            Tous les outils classés en gratuit et premium
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-base text-slate-600">
            Découvrez l’ensemble des outils PROQUELEC, depuis les utilitaires gratuits jusqu’aux solutions premium dédiées aux professionnels.
          </p>
        </div>

        <div className="space-y-16">
          {toolSections.map((section) => (
            <div key={section.title} className="rounded-[2rem] border border-slate-200 bg-white shadow-sm overflow-hidden">
              <div className="bg-slate-950/5 px-6 py-6 sm:px-8">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h3 className="text-2xl font-black text-slate-900">{section.title}</h3>
                    <p className="mt-2 text-sm text-slate-500">{section.subtitle}</p>
                  </div>
                  <span className={
                    `inline-flex items-center rounded-full border px-3 py-1 text-xs font-black uppercase tracking-[0.2em] ${section.accent === 'emerald' ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : 'border-amber-200 bg-amber-50 text-amber-700'}`
                  }>
                    {section.apps.length} outils
                  </span>
                </div>
              </div>

              <div className="grid gap-4 p-6 sm:grid-cols-2 xl:grid-cols-3">
                {section.apps.map((tool) => {
                  const Icon = tool.icon as React.ComponentType<{ className?: string }>;
                  return (
                    <Link
                      key={tool.id}
                      to={tool.route || '/outils'}
                      className="group block rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-center gap-4">
                          <div className="flex h-14 w-14 items-center justify-center rounded-3xl bg-slate-100 text-slate-700">
                            {Icon ? <Icon className="h-6 w-6" /> : <ChevronRight className="h-6 w-6" />}
                          </div>
                          <div>
                            <h4 className="text-lg font-semibold text-slate-900">{tool.title}</h4>
                            <p className="mt-1 text-sm text-slate-500">{tool.group}</p>
                          </div>
                        </div>
                        <span className={
                          `inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-black uppercase tracking-[0.2em] ${getStatusColor(tool.status)}`
                        }>
                          {getBadgeLabel(tool.status)}
                        </span>
                      </div>
                      <p className="mt-5 text-sm leading-6 text-slate-600">{tool.description}</p>
                      <div className="mt-6 flex items-center gap-2 text-sm font-semibold text-proqblue">
                        <span>Voir</span>
                        <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}

          <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              to="/outils"
              className="inline-flex items-center justify-center rounded-full bg-proqblue px-7 py-3 text-sm font-semibold text-white transition hover:bg-proqblue-dark"
            >
              Voir tous les outils
            </Link>
            <Link to="/outils" className="text-sm font-medium text-slate-700 hover:text-proqblue">
              Accéder à la plateforme complète des outils
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};
