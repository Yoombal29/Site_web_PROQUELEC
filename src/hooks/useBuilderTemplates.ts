/**
 * Custom Hook for Builder Templates Management
 * Provides enhanced template operations with search and filtering
 */

import React from 'react';
import { useBuilderStore } from '@/stores/useBuilderStore';
import type { Block } from '@/types/builder';
import type { BlockTemplate } from '@/stores/useBuilderStore';

export const useBuilderTemplates = () => {
  const {
    templates,
    saveTemplate,
    deleteTemplate,
    loadTemplates
  } = useBuilderStore();

  const [searchQuery, setSearchQuery] = React.useState('');
  const [filterType, setFilterType] = React.useState<string>('all');

  // Filter templates by search query and type
  const filteredTemplates = React.useMemo(() => {
    return templates.filter(template => {
      const matchesSearch = template.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesType = filterType === 'all' || template.block.type === filterType;
      return matchesSearch && matchesType;
    });
  }, [templates, searchQuery, filterType]);

  // Get unique block types from templates
  const availableTypes = React.useMemo(() => {
    const types = new Set(templates.map(t => t.block.type));
    return Array.from(types);
  }, [templates]);

  // Save template with validation
  const saveTemplateSafe = React.useCallback((block: Block, name: string) => {
    if (!name || name.trim().length === 0) {
      throw new Error('Template name is required');
    }

    if (name.length > 100) {
      throw new Error('Template name must be less than 100 characters');
    }

    saveTemplate(block, name);
  }, [saveTemplate]);

  // Delete template with confirmation
  const deleteTemplateSafe = React.useCallback((templateId: string) => {
    const template = templates.find(t => t.id === templateId);
    if (!template) {
      throw new Error('Template not found');
    }

    deleteTemplate(templateId);
  }, [templates, deleteTemplate]);

  // Get template by ID
  const getTemplateById = React.useCallback((templateId: string) => {
    return templates.find(t => t.id === templateId);
  }, [templates]);

  // Get templates by block type
  const getTemplatesByType = React.useCallback((blockType: string) => {
    return templates.filter(t => t.block.type === blockType);
  }, [templates]);

  // Sort templates by creation date
  const sortedTemplates = React.useMemo(() => {
    return [...filteredTemplates].sort((a, b) => b.createdAt - a.createdAt);
  }, [filteredTemplates]);

  return {
    templates: sortedTemplates,
    allTemplates: templates,
    saveTemplate: saveTemplateSafe,
    deleteTemplate: deleteTemplateSafe,
    loadTemplates,
    getTemplateById,
    getTemplatesByType,
    searchQuery,
    setSearchQuery,
    filterType,
    setFilterType,
    availableTypes,
    templateCount: templates.length,
    filteredCount: filteredTemplates.length
  };
};

/**
 * Hook for template analytics
 */
export const useTemplateAnalytics = () => {
  const { templates } = useBuilderStore();

  const analytics = React.useMemo(() => {
    const typeCounts = templates.reduce((acc, template) => {
      const type = template.block.type;
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const mostUsedType = Object.entries(typeCounts)
      .sort(([, a], [, b]) => b - a)[0]?.[0] || null;

    const totalTemplates = templates.length;
    const averageAge = totalTemplates > 0
      ? Date.now() - (templates.reduce((sum, t) => sum + t.createdAt, 0) / totalTemplates)
      : 0;

    return {
      totalTemplates,
      typeCounts,
      mostUsedType,
      averageAge,
      recentTemplates: templates
        .sort((a, b) => b.createdAt - a.createdAt)
        .slice(0, 5)
    };
  }, [templates]);

  return analytics;
};
