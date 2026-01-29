
import { useState, useCallback, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
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

  // Recherche dans les pages
  const searchPages = useCallback(async (searchQuery: string): Promise<SearchResult[]> => {
    if (!searchQuery || searchQuery.length < 2) return [];
    
    const { data, error } = await supabase
      .from('pages')
      .select('id, title, content, slug, updated_at')
      .eq('is_published', true)
      .textSearch('title', searchQuery, { type: 'websearch' });

    if (error) {
      console.error('Erreur recherche pages:', error);
      return [];
    }

    return data.map(page => ({
      id: page.id,
      title: page.title,
      content: page.content || '',
      excerpt: page.content?.substring(0, 150) + '...' || '',
      type: 'page' as const,
      url: `/${page.slug}`,
      relevance: calculateRelevance(searchQuery, page.title, page.content),
      date: page.updated_at
    }));
  }, []);

  // Recherche dans le blog
  const searchBlog = useCallback(async (searchQuery: string): Promise<SearchResult[]> => {
    if (!searchQuery || searchQuery.length < 2) return [];
    
    const { data, error } = await supabase
      .from('blog_posts')
      .select(`
        id, title, content, excerpt, slug, published_at,
        blog_categories (name)
      `)
      .not('published_at', 'is', null)
      .textSearch('title', searchQuery, { type: 'websearch' });

    if (error) {
      console.error('Erreur recherche blog:', error);
      return [];
    }

    return data.map(post => ({
      id: post.id,
      title: post.title,
      content: post.content || '',
      excerpt: post.excerpt || '',
      type: 'blog' as const,
      url: `/blog/${post.slug}`,
      relevance: calculateRelevance(searchQuery, post.title, post.content),
      category: post.blog_categories?.name,
      date: post.published_at
    }));
  }, []);

  // Recherche dans les documents
  const searchDocuments = useCallback(async (searchQuery: string): Promise<SearchResult[]> => {
    if (!searchQuery || searchQuery.length < 2) return [];
    
    const { data, error } = await supabase
      .from('documents')
      .select('id, title, description, file_url, uploaded_at')
      .textSearch('title', searchQuery, { type: 'websearch' });

    if (error) {
      console.error('Erreur recherche documents:', error);
      return [];
    }

    return data.map(doc => ({
      id: doc.id,
      title: doc.title,
      content: doc.description || '',
      excerpt: doc.description?.substring(0, 150) + '...' || '',
      type: 'document' as const,
      url: doc.file_url,
      relevance: calculateRelevance(searchQuery, doc.title, doc.description),
      date: doc.uploaded_at
    }));
  }, []);

  // Recherche dans les événements
  const searchEvents = useCallback(async (searchQuery: string): Promise<SearchResult[]> => {
    if (!searchQuery || searchQuery.length < 2) return [];
    
    const { data, error } = await supabase
      .from('events')
      .select('id, title, details, location, date')
      .textSearch('title', searchQuery, { type: 'websearch' });

    if (error) {
      console.error('Erreur recherche événements:', error);
      return [];
    }

    return data.map(event => ({
      id: event.id,
      title: event.title,
      content: event.details || '',
      excerpt: `${event.details?.substring(0, 100) || ''}... | Lieu: ${event.location || 'Non spécifié'}`,
      type: 'event' as const,
      url: `/events#${event.id}`,
      relevance: calculateRelevance(searchQuery, event.title, event.details),
      date: event.date
    }));
  }, []);

  // Fonction de calcul de pertinence
  const calculateRelevance = (query: string, title?: string, content?: string): number => {
    let score = 0;
    const queryLower = query.toLowerCase();
    const titleLower = title?.toLowerCase() || '';
    const contentLower = content?.toLowerCase() || '';

    // Score pour le titre (plus important)
    if (titleLower.includes(queryLower)) score += 10;
    if (titleLower.startsWith(queryLower)) score += 5;
    
    // Score pour le contenu
    const contentMatches = (contentLower.match(new RegExp(queryLower, 'g')) || []).length;
    score += contentMatches * 2;

    return score;
  };

  // Recherche principale
  const { data: results = [], isLoading, error } = useQuery({
    queryKey: ['globalSearch', query, filters],
    queryFn: async () => {
      if (!query || query.length < 2) return [];

      const searchPromises = [];
      
      if (filters.types.includes('page')) searchPromises.push(searchPages(query));
      if (filters.types.includes('blog')) searchPromises.push(searchBlog(query));
      if (filters.types.includes('document')) searchPromises.push(searchDocuments(query));
      if (filters.types.includes('event')) searchPromises.push(searchEvents(query));

      const allResults = await Promise.all(searchPromises);
      const combined = allResults.flat();
      
      // Tri par pertinence
      return combined.sort((a, b) => b.relevance - a.relevance);
    },
    enabled: query.length >= 2,
    staleTime: 30000 // Cache pendant 30 secondes
  });

  // Résultats filtrés et paginés
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
