import React, { Suspense, useEffect, useMemo, useState } from 'react';
import CraftPageRenderer from '@/components/CraftPageRenderer';
import {
  createFunctionalPageStructure,
  isFunctionalPageStructure,
} from '@/lib/functional-page-structure';

type FunctionalBuilderRouteProps = {
  slug: string;
  title: string;
  fallback: React.ReactNode;
};

type PageLike = {
  title?: string;
  slug?: string;
  immutable?: boolean;
  structure_json?: unknown;
  draft_json?: unknown;
};

const LoadingFallback = () => (
  <div className="min-h-[100svh] bg-slate-50 flex items-center justify-center">
    <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
  </div>
);

function parseJsonField(value: unknown) {
  if (typeof value !== 'string') return value;
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
}

export const FunctionalBuilderRoute: React.FC<FunctionalBuilderRouteProps> = ({
  slug,
  title,
  fallback,
}) => {
  const [page, setPage] = useState<PageLike | null>(null);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const loadPage = async () => {
      setLoading(true);
      setFailed(false);

      try {
        const response = await fetch(`/api/pages/slug/${encodeURIComponent(slug)}`);
        if (!response.ok) throw new Error(`Page ${slug} introuvable`);
        const data = (await response.json()) as PageLike;
        if (!cancelled) setPage(data);
      } catch (error) {
        console.warn(`[FunctionalBuilderRoute] Fallback React pour /${slug}:`, error);
        if (!cancelled) {
          setFailed(true);
          setPage(null);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    loadPage();

    return () => {
      cancelled = true;
    };
  }, [slug]);

  const structure = useMemo(() => {
    if (!page || page.immutable !== true) return null;

    const dbStructure = parseJsonField(page.structure_json);
    if (isFunctionalPageStructure(dbStructure)) return dbStructure;

    return createFunctionalPageStructure(page.slug || slug, page.title || title);
  }, [page, slug, title]);

  if (loading) return <LoadingFallback />;
  if (failed || !structure) return <>{fallback}</>;

  return (
    <Suspense fallback={<LoadingFallback />}>
      <CraftPageRenderer structureJson={structure} fallback={fallback} />
    </Suspense>
  );
};

export default FunctionalBuilderRoute;
