import { useState, useMemo } from 'react';
import { apiFetch } from '@/lib/api-client';
import { useQuery } from '@tanstack/react-query';

export interface SearchResult {
  id: string;
  title: string;
  content: string;
  excerpt: string;
  type: 'page' | 'blog' | 'document' | 'event';
  url: string;
  relevance: number;
  category?: string;
  date?: string;
}

export function useGlobalSearch() {
  const [query, setQuery] = useState('');
  const [filters, setFilters] = useState<{
    types: string[];
    dateRange?: { start: Date; end: Date };
  }>({
    types: ['page', 'blog', 'document', 'event']
  });

  // Recherche principale via API
  const { data: results = [], isLoading, error } = useQuery({
    queryKey: ['globalSearch', query, filters],
    queryFn: async () => {
      if (!query || query.length < 2) return [];

      try {
        // We use a single endpoint that handles all search types
        // This endpoint should be implemented in server/index.js as '/api/search'
        const searchResults = await apiFetch<SearchResult[]>(`/api/search?q=${encodeURIComponent(query)}&types=${filters.types.join(',')}`);
        return searchResults || [];
      } catch (err) {
        console.error('Global search error:', err);
        return [];
      }
    },
    enabled: query.length >= 2,
    staleTime: 30000 // Cache pendant 30 secondes
  });

  // Résultats filtrés et paginés (client-side specific filtering if needed)
  const filteredResults = useMemo(() => {
    let filtered = results;

    // Filtre par date si spécifié
    if (filters.dateRange) {
      filtered = filtered.filter(result => {
        if (!result.date) return true;
        const resultDate = new Date(result.date);
        return resultDate >= filters.dateRange!.start && resultDate <= filters.dateRange!.end;
      });
    }

    return filtered;
  }, [results, filters]);

  return {
    query,
    setQuery,
    filters,
    setFilters,
    results: filteredResults,
    isLoading,
    error,
    hasResults: filteredResults.length > 0,
    totalResults: filteredResults.length
  };
}
