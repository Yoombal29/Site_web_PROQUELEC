// @ts-nocheck
/**
 * Bloc Craft.js design-locked pour pages fonctionnelles.
 *
 * Builder:
 * - mode bloc: placeholder verrouille, manipulable sans casser la logique
 * - mode apercu: rendu React reel pour verifier la page
 *
 * Public:
 * - rend le composant React reference par le registre fonctionnel
 */
import React, { Suspense } from 'react';
import { useEditor, useNode } from '@craftjs/core';
import { ExternalLink, Eye, FileCode, Loader2, Lock } from 'lucide-react';
import {
  getFunctionalPageDefinition,
  getFunctionalPageToolboxItems as getRegisteredFunctionalPageToolboxItems,
} from '@/lib/functional-pages';

const FunctionalPageSettings = () => {
  const { slug, pageTitle } = useNode((node) => ({
    slug: node.data.props.slug,
    pageTitle: node.data.props.pageTitle,
  }));

  const meta = getFunctionalPageDefinition(slug);

  return (
    <div className="space-y-4 p-2">
      <div className="flex items-center gap-2 rounded-lg border border-amber-500/20 bg-amber-500/10 p-3">
        <Lock className="h-4 w-4 text-amber-400" />
        <span className="text-xs font-medium text-amber-300">Bloc fonctionnel verrouille</span>
      </div>

      <div className="space-y-1">
        <p className="text-xs font-semibold uppercase text-slate-400">Page</p>
        <p className="text-sm font-bold text-white">{pageTitle || meta?.title || slug}</p>
      </div>

      {meta && (
        <>
          <div className="space-y-1">
            <p className="text-xs font-semibold uppercase text-slate-400">Description</p>
            <p className="text-sm text-slate-300">{meta.description}</p>
          </div>
          <div className="space-y-1">
            <p className="text-xs font-semibold uppercase text-slate-400">Route</p>
            <p className="text-sm font-mono text-indigo-400">{meta.route}</p>
          </div>
        </>
      )}

      <div className="border-t border-slate-700 pt-2">
        <p className="text-xs italic text-slate-500">
          Ce bloc encapsule une page React. Le design est visible, mais la logique metier reste
          protegee dans le composant source.
        </p>
      </div>
    </div>
  );
};

interface FunctionalPageBlockProps {
  slug: string;
  pageTitle?: string;
}

export const FunctionalPageBlock = (props: FunctionalPageBlockProps) => {
  const { slug = 'dashboard', pageTitle } = props;
  const [preview, setPreview] = React.useState(false);
  const {
    connectors: { connect, drag },
    selected,
  } = useNode();
  const { enabled } = useEditor((state) => ({ enabled: state.options.enabled }));

  const meta = getFunctionalPageDefinition(slug);
  const title = pageTitle || meta?.title || slug;
  const LazyComponent = meta?.component || null;

  const renderPublicComponent = () => {
    if (!LazyComponent) {
      return (
        <div className="flex min-h-[200px] items-center justify-center bg-slate-100">
          <div className="p-8 text-center">
            <FileCode className="mx-auto mb-2 h-8 w-8 text-slate-400" />
            <p className="text-sm text-slate-500">{title}</p>
            <a
              href={meta?.route || `/${slug}`}
              className="mt-1 inline-block text-xs text-blue-500 hover:underline"
            >
              Voir la page
            </a>
          </div>
        </div>
      );
    }

    return (
      <Suspense
        fallback={
          <div className="flex min-h-[200px] items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
          </div>
        }
      >
        <LazyComponent />
      </Suspense>
    );
  };

  if (enabled) {
    return (
      <div
        ref={(ref) => {
          if (ref) connect(drag(ref));
        }}
        className={`relative transition-all duration-200 ${
          selected
            ? 'ring-2 ring-amber-500 ring-offset-2 ring-offset-slate-900'
            : 'hover:ring-1 hover:ring-amber-500/50'
        }`}
      >
        <div className="overflow-hidden rounded-xl border border-slate-700 bg-gradient-to-br from-slate-800 to-slate-900">
          <div className="flex items-center justify-between border-b border-slate-700 bg-slate-800/80 px-4 py-3">
            <div className="flex items-center gap-2">
              <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-amber-500/20">
                <Lock className="h-3.5 w-3.5 text-amber-400" />
              </div>
              <span className="text-xs font-bold uppercase text-amber-400">Fonctionnel</span>
            </div>

            <div className="flex items-center gap-2">
              {LazyComponent && (
                <button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    setPreview((value) => !value);
                  }}
                  className="rounded bg-slate-700/50 px-2 py-1 text-xs text-slate-300 transition hover:bg-slate-700 hover:text-white"
                >
                  {preview ? 'Bloc' : 'Apercu'}
                </button>
              )}
              {meta?.route && (
                <a
                  href={meta.route}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(event) => event.stopPropagation()}
                  className="flex items-center gap-1 rounded bg-slate-700/50 px-2 py-1 text-xs text-slate-400 transition hover:bg-slate-700 hover:text-white"
                >
                  <ExternalLink className="h-3 w-3" />
                  Voir
                </a>
              )}
            </div>
          </div>

          {preview ? (
            <div className="bg-white">{renderPublicComponent()}</div>
          ) : (
            <>
              <div className="flex min-h-[120px] flex-col items-center justify-center p-6">
                <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-slate-700/50">
                  <FileCode className="h-6 w-6 text-slate-400" />
                </div>
                <p className="mb-1 text-sm font-bold text-slate-200">{title}</p>
                {meta?.description && (
                  <p className="max-w-xs text-center text-xs text-slate-500">{meta.description}</p>
                )}
                <div className="mt-3 flex items-center gap-2">
                  <Eye className="h-3 w-3 text-slate-600" />
                  <span className="text-[10px] text-slate-600">
                    Contenu gere par le composant React
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 border-t border-slate-700 bg-slate-800/50 px-4 py-2">
                <div className="h-1.5 w-1.5 rounded-full bg-amber-500/60" />
                <span className="text-[10px] text-slate-500">
                  Bloc design-locked - non modifiable dans le Builder
                </span>
              </div>
            </>
          )}
        </div>
      </div>
    );
  }

  return renderPublicComponent();
};

FunctionalPageBlock.craft = {
  displayName: 'Page Fonctionnelle',
  props: {
    slug: 'dashboard',
    pageTitle: 'Tableau de bord',
  },
  related: {
    settings: FunctionalPageSettings,
  },
};

export function getFunctionalPageToolboxItems() {
  return getRegisteredFunctionalPageToolboxItems();
}
