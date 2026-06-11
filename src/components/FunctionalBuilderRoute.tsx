import React, { Suspense, useEffect, useMemo, useState } from 'react';
import {
  getFunctionalStructureForPage,
} from '@/lib/functional-page-structure';
import { getFunctionalPageDefinition } from '@/lib/functional-pages';

const CraftPageRenderer = React.lazy(() => import('@/components/CraftPageRenderer'));

type FunctionalBuilderRouteProps = {
  slug: string;
  title: string;
  fallback: React.ReactNode;
};

type PageLike = {
  title?: string;
  slug?: string;
  immutable?: boolean;
  is_published?: boolean;
  status?: string;
  workflow_status?: string;
  design_options?: unknown;
  structure_json?: unknown;
  draft_json?: unknown;
};

const LoadingFallback = () => (
  <div className="min-h-[100svh] bg-slate-50 flex items-center justify-center">
    <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
  </div>
);

const normalizePagesResponse = (responseData: unknown): PageLike[] => {
  const rows = Array.isArray(responseData)
    ? responseData
    : (responseData as { rows?: unknown[]; data?: unknown[] })?.rows ||
      (responseData as { rows?: unknown[]; data?: unknown[] })?.data ||
      [];

  return rows.filter((page): page is PageLike => {
    if (!page || typeof page !== 'object') return false;
    const candidate = page as Partial<PageLike>;
    return typeof candidate.slug === 'string';
  });
};

const isPublishedPage = (page: PageLike) => {
  if (page.status) return page.status === 'published';
  if (page.workflow_status) return page.workflow_status === 'published';
  return page.is_published !== false;
};

const parseJsonField = (value: unknown) => {
  if (typeof value !== 'string') return value;
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
};

async function fetchFunctionalPage(slug: string): Promise<PageLike | null> {
  const encodedSlug = encodeURIComponent(slug);
  const directEndpoints = slug.includes('/')
    ? []
    : [`/api/public/pages/slug/${encodedSlug}`, `/api/pages/slug/${encodedSlug}`];

  for (const endpoint of directEndpoints) {
    try {
      const response = await fetch(endpoint);
      if (!response.ok) throw new Error(`Page ${slug} introuvable`);
      const page = normalizePagesResponse([await response.json()])[0];
      if (page && isPublishedPage(page)) return page;
    } catch (error) {
      console.warn(`[FunctionalBuilderRoute] Chargement direct impossible depuis ${endpoint}:`, error);
    }
  }

  const listEndpoints = ['/api/public/pages', '/api/pages'];
  for (const endpoint of listEndpoints) {
    try {
      const response = await fetch(endpoint);
      if (!response.ok) throw new Error(`Liste pages indisponible`);
      const pages = normalizePagesResponse(await response.json()).filter(isPublishedPage);
      return pages.find((page) => page.slug?.replace(/^\//, '') === slug) || null;
    } catch (error) {
      console.warn(`[FunctionalBuilderRoute] Liste pages impossible depuis ${endpoint}:`, error);
    }
  }

  return null;
}

export const FunctionalBuilderRoute: React.FC<FunctionalBuilderRouteProps> = ({
  slug,
  title,
  fallback,
}) => {
  const [page, setPage] = useState<PageLike | null>(null);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);
  const definition = useMemo(() => getFunctionalPageDefinition(slug), [slug]);

  useEffect(() => {
    let cancelled = false;

    const loadPage = async () => {
      setLoading(true);
      setFailed(false);

      try {
        const data = await fetchFunctionalPage(slug);
        if (!data) throw new Error(`Page ${slug} introuvable`);
        if (!cancelled) setPage(data);
      } catch (error) {
        // Pages fonctionnelles sans entrée DB : comportement normal, fallback React utilisé
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
    if (!page?.immutable) return null;

    const designOptions = parseJsonField(page.design_options) || {};
    const normalizedPage = { ...page, design_options: designOptions };

    return getFunctionalStructureForPage(
      normalizedPage,
      definition?.slug || slug,
      definition?.title || title,
    ).structure;
  }, [definition?.slug, definition?.title, page, slug, title]);

  if (loading) return <LoadingFallback />;
  if (failed || !structure) return <>{fallback}</>;

  return (
    <Suspense fallback={<LoadingFallback />}>
      <CraftPageRenderer structureJson={structure as any} fallback={fallback} />
    </Suspense>
  );
};

export default FunctionalBuilderRoute;
