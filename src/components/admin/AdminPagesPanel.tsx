import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { usePages, useCreatePage, useUpdatePage, useDeletePage } from '@/hooks/usePages';
import { useContentVersioning, ContentVersion } from '@/hooks/useContentVersioning';
import { useAnalytics } from '@/hooks/useAnalytics';
import { useCmsPlugins, useCmsThemes, useTogglePlugin } from '@/hooks/useCmsRegistry';


import { pageSchema } from '@/lib/schemas';
import { useAutoSave } from '@/hooks/useAutosave';
import {
  FileText, Search, Palette, Code, Image, Settings, Plus, Trash2, Save, X,
  Bold, Italic, Underline, Link, List, ListOrdered,
  Eye, History, Smartphone, Monitor, GitBranch,
  Zap, AlertTriangle,
  BarChart3,
  Workflow,
  Layout,




  Sparkles,



  Tablet } from






'lucide-react';
import { AdminPageEditor } from './AdminPageEditor';
import { MonacoTabContent } from './MonacoTabContent';
import { MediaSelector } from '@/components/MediaLibrary';

interface Page {
  id?: string;
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  content_blocks?: unknown[];
  meta_description: string;
  meta_keywords: string;
  meta_robots: string;
  featured_image: string;
  template: string;
  design_options?: unknown;
  seo_options?: unknown;
  show_hero: boolean;
  show_footer: boolean;
  custom_css: string;
  custom_js: string;
  header_html: string;
  footer_html: string;
  hero_title: string;
  hero_subtitle: string;
  hero_background_image: string;
  hero_cta_text: string;
  hero_cta_link: string;
  is_published: boolean;
  workflow_status?: string;
  publish_date: string;
  unpublish_date: string;
  menu_order: number;
  categories: string[];
  tags: string[];
  author: string;
  reading_time: number;
  language_code?: string;
  created_at?: string;
  updated_at?: string;
  structure_json?: unknown;
}

const AdminPagesPanel: React.FC = () => {
  const { toast } = useToast();
  const { data: pages, isLoading: loading, refetch } = usePages();
  const createPageMutation = useCreatePage();
  const updatePageMutation = useUpdatePage();
  const deletePageMutation = useDeletePage();

  const [activeTab, setActiveTab] = useState('content');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPage, setEditingPage] = useState<Page | null>(null);
  const [isIceEditorOpen, setIsIceEditorOpen] = useState(false);

  const [formData, setFormData] = useState<Page>({
    title: '',
    slug: '',
    content: '',
    excerpt: '',
    content_blocks: [],
    meta_description: '',
    meta_keywords: '',
    meta_robots: 'index,follow',
    featured_image: '',
    template: 'default',
    design_options: {},
    seo_options: {},
    show_hero: true,
    show_footer: true,
    structure_json: [],
    custom_css: '',
    custom_js: '',
    header_html: '',
    footer_html: '',
    hero_title: '',
    hero_subtitle: '',
    hero_background_image: '',
    hero_cta_text: '',
    hero_cta_link: '',
    is_published: false,
    workflow_status: 'draft',
    publish_date: '',
    unpublish_date: '',
    menu_order: 0,
    categories: [],
    tags: [],
    author: '',
    reading_time: 0,
    language_code: 'fr'
  });

  // Auto-generate slug from title
  useEffect(() => {
    if (!editingPage && formData.title) {
      const autoSlug = formData.title.
      toLowerCase().
      normalize('NFD') // decompose accents
      .replace(/[\u0300-\u036f]/g, '') // remove accents
      .replace(/[^a-z0-9]+/g, '-') // non-alphanum to hyphens
      .replace(/^-+|-+$/g, ''); // trim hyphens

      // Only update if slug is empty or looks like a draft slug
      if (!formData.slug || formData.slug === autoSlug.slice(0, -1)) {
        setFormData((prev) => ({ ...prev, slug: autoSlug }));
      }
    }
  }, [formData.title, formData.slug, editingPage]);

  const resetForm = () => {
    setFormData({
      title: '',
      slug: '',
      structure_json: [],
      content: '',
      excerpt: '',
      content_blocks: [],
      meta_description: '',
      meta_keywords: '',
      meta_robots: 'index,follow',
      featured_image: '',
      template: 'default',
      design_options: {},
      seo_options: {},
      show_hero: true,
      show_footer: true,
      custom_css: '',
      custom_js: '',
      header_html: '',
      footer_html: '',
      hero_title: '',
      hero_subtitle: '',
      hero_background_image: '',
      hero_cta_text: '',
      hero_cta_link: '',
      is_published: false,
      workflow_status: 'draft',
      publish_date: '',
      unpublish_date: '',
      menu_order: 0,
      categories: [],
      tags: [],
      author: '',
      reading_time: 0,
      language_code: 'fr'
    });
    setEditingPage(null);
    setActiveTab('content');
  };

  const ErrorMessage = ({ field }: {field: string;}) => {
    if (!formErrors[field]) return null;
    return <span className="text-xs text-red-500 mt-1 animate-in fade-in slide-in-from-top-1">{formErrors[field]}</span>;
  };

  // Hooks pour les fonctionnalités avancées
  const { createVersion, getVersions, restoreVersion } = useContentVersioning();
  const { trackEvent, getPageAnalytics } = useAnalytics();

  // États pour les fonctionnalités avancées
  const [versions, setVersions] = useState<ContentVersion[]>([]);
  const [showVersions, setShowVersions] = useState(false);
  const [analyticsData, setAnalyticsData] = useState<unknown>(null);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [previewMode, setPreviewMode] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [showPreview, setShowPreview] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'published' | 'draft'>('all');
  const [sortBy, setSortBy] = useState<'title' | 'updated_at' | 'created_at'>('updated_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [selectedPages, setSelectedPages] = useState<string[]>([]);
  const [bulkAction, setBulkAction] = useState<'publish' | 'unpublish' | 'delete' | null>(null);
  const [showWorkflow, setShowWorkflow] = useState(false);
  const [workflowStatus, setWorkflowStatus] = useState<'draft' | 'review' | 'approved' | 'published'>('draft');
  const [seoScore, setSeoScore] = useState<number>(0);
  const [readabilityScore, setReadabilityScore] = useState<number>(0);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const { restore: restoreDraft, clear: clearDraft } = useAutoSave(
    editingPage ? `page_${editingPage.id}` : 'new_page',
    formData,
    isDialogOpen
  );

  const handleRestoreDraft = () => {
    const draft = restoreDraft();
    if (draft) {
      setFormData(draft);
      toast({ title: "Brouillon restauré" });
    }
  };

  // Hooks pour les nouvelles fonctionnalités Phase 3
  const { data: availablePlugins, isLoading: loadingPlugins } = useCmsPlugins();
  const { data: availableThemes, isLoading: loadingThemes } = useCmsThemes();
  const togglePluginMutation = useTogglePlugin();

  const handleEdit = (page: unknown) => {
    // Removed auto-switch to ICE Editor to prioritize Settings Dialog
    // if (page.editor_engine === 'code') { ... }

    setEditingPage(page);
    setWorkflowStatus(page.workflow_status || 'draft');
    setFormData({
      id: page.id,
      title: page.title || '',
      slug: page.slug || '',
      content: page.content || '',
      excerpt: page.excerpt || '',
      content_blocks: page.content_blocks || [],
      meta_description: page.meta_description || '',
      meta_keywords: page.meta_keywords || '',
      meta_robots: page.meta_robots || 'index,follow',
      featured_image: page.featured_image || '',
      template: page.template || 'default',
      design_options: page.design_options || {},
      seo_options: page.seo_options || {},
      show_hero: page.show_hero !== false,
      show_footer: page.show_footer !== false,
      custom_css: page.custom_css || '',
      custom_js: page.custom_js || '',
      header_html: page.header_html || '',
      footer_html: page.footer_html || '',
      hero_title: page.hero_title || '',
      hero_subtitle: page.hero_subtitle || '',
      hero_background_image: page.hero_background_image || '',
      hero_cta_text: page.hero_cta_text || '',
      hero_cta_link: page.hero_cta_link || '',
      is_published: page.is_published || false,
      workflow_status: page.workflow_status || 'draft',
      publish_date: page.publish_date || '',
      unpublish_date: page.unpublish_date || '',
      menu_order: page.menu_order || 0,
      categories: Array.isArray(page.categories) ? page.categories : [],
      tags: Array.isArray(page.tags) ? page.tags : [],
      author: page.author || '',
      reading_time: page.reading_time || 0,
      structure_json: page.structure_json || []
    });
    setIsDialogOpen(true);
  };

  const handleApplyTheme = async (theme: CmsTheme) => {
    if (!window.confirm(`Appliquer le thème "${theme.display_name}" ? Vos réglages de design actuels seront mis à jour.`)) return;

    setFormData((prev) => ({
      ...prev,
      template: theme.name,
      design_options: {
        ...prev.design_options,
        ...theme.design_config
      }
    }));

    toast({
      title: 'Thème appliqué',
      description: `Le thème ${theme.display_name} a été préchargé dans le formulaire. N'oubliez pas de sauvegarder la page.`
    });
  };

  const handleTogglePlugin = async (plugin: CmsPlugin) => {
    try {
      await togglePluginMutation.mutateAsync({
        id: plugin.id,
        is_active: !plugin.is_active_globally
      });
      toast({
        title: plugin.is_active_globally ? 'Plugin désactivé' : 'Plugin activé',
        description: `Le plugin ${plugin.display_name} a été mis à jour globalement.`
      });
    } catch (err) {
      toast({
        title: 'Erreur',
        description: 'Impossible de changer l\'état du plugin.',
        variant: 'destructive'
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormErrors({});

    const submitData = {
      ...formData,
      workflow_status: workflowStatus,
      is_published: workflowStatus === 'published' || formData.is_published,
      publish_date: formData.publish_date || null,
      unpublish_date: formData.unpublish_date || null,
      reading_time: Math.floor(Number(formData.reading_time) || 0),
      menu_order: Math.floor(Number(formData.menu_order) || 0)
    };

    // Validation avec Zod
    const validation = pageSchema.safeParse(submitData);
    if (!validation.success) {
      const errors: Record<string, string> = {};
      validation.error.errors.forEach((err) => {
        if (err.path[0]) errors[err.path[0].toString()] = err.message;
      });
      setFormErrors(errors);
      toast({
        title: "Erreur de validation",
        description: "Veuillez corriger les erreurs dans le formulaire.",
        variant: "destructive"
      });
      return;
    }

    const validatedData = validation.data;


    try {
      if (editingPage) {
        await updatePageMutation.mutateAsync({ id: editingPage.id!, ...validatedData });
        toast({
          title: 'Page mise à jour',
          description: 'La page a été mise à jour avec succès.'
        });
      } else {
        await createPageMutation.mutateAsync(validatedData);
        toast({
          title: 'Page créée',
          description: 'La page a été créée avec succès.'
        });
      }
      setIsDialogOpen(false);
      resetForm();
    } catch (error: unknown) {
      console.error('Submit error details:', error);
      toast({
        title: 'Erreur Serveur',
        description: error.message || 'Une erreur est survenue lors de la sauvegarde.',
        variant: 'destructive'
      });
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette page ?')) {
      try {
        await deletePageMutation.mutateAsync(id);
        toast({
          title: 'Page supprimée',
          description: 'La page a été supprimée avec succès.'
        });
      } catch (error) {
        toast({
          title: 'Erreur',
          description: 'Une erreur est survenue lors de la suppression.',
          variant: 'destructive'
        });
      }
    }
  };

  // Fonctions pour les fonctionnalités avancées
  const handleCreateVersion = async () => {
    if (!editingPage) return;

    try {
      await createVersion(
        editingPage.id!,
        formData.title,
        JSON.stringify(formData),
        'Mise à jour manuelle'
      );
      toast({
        title: 'Version créée',
        description: 'Une nouvelle version de la page a été créée.'
      });
      loadVersions();
    } catch (error) {
      toast({
        title: 'Erreur',
        description: 'Erreur lors de la création de la version.',
        variant: 'destructive'
      });
    }
  };

  const loadVersions = useCallback(async () => {
    if (!editingPage) return;

    try {
      const pageVersions = getVersions(editingPage.id!);
      setVersions(pageVersions);
    } catch (error) {
      console.error('Erreur lors du chargement des versions:', error);
    }
  }, [editingPage, getVersions]);

  const handleRestoreVersion = async (versionId: string) => {
    if (!editingPage) return;

    try {
      const restoredVersion = await restoreVersion(versionId);
      if (restoredVersion) {
        setFormData(JSON.parse(restoredVersion.content));
        toast({
          title: 'Version restaurée',
          description: `La version ${restoredVersion.version} a été restaurée avec succès.`
        });
        loadVersions();
      }
    } catch (error) {
      toast({
        title: 'Erreur',
        description: 'Erreur lors de la restauration de la version.',
        variant: 'destructive'
      });
    }
  };

  const loadAnalytics = useCallback(async () => {
    if (!editingPage) return;

    try {
      const analytics = await getPageAnalytics(editingPage.id!);
      setAnalyticsData(analytics);
    } catch (error) {
      console.error('Erreur lors du chargement des analytics:', error);
    }
  }, [editingPage, getPageAnalytics]);

  const handlePreview = () => {
    setShowPreview(true);
    trackEvent('page_preview', { pageId: editingPage?.id || 'new' });
  };

  const filteredPages = (pages || []).filter((page) => {
    const matchesSearch = (page.title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (page.content || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' ||
    filterStatus === 'published' && page.is_published ||
    filterStatus === 'draft' && !page.is_published;
    return matchesSearch && matchesStatus;
  }).sort((a, b) => {
    const aValue = a[sortBy] || '';
    const bValue = b[sortBy] || '';
    const comparison = aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
    return sortOrder === 'asc' ? comparison : -comparison;
  });

  const handleBulkAction = async () => {
    if (!bulkAction || selectedPages.length === 0) return;

    try {
      for (const pageId of selectedPages) {
        const page = (pages || []).find((p) => p.id === pageId);
        if (!page) continue;

        switch (bulkAction) {
          case 'publish':
            await updatePageMutation.mutateAsync({ id: pageId, is_published: true });
            break;
          case 'unpublish':
            await updatePageMutation.mutateAsync({ id: pageId, is_published: false });
            break;
          case 'delete':
            await deletePageMutation.mutateAsync(pageId);
            break;
        }
      }

      toast({
        title: 'Action groupée terminée',
        description: `${selectedPages.length} pages ont été traitées.`
      });
      setSelectedPages([]);
      setBulkAction(null);
    } catch (error) {
      toast({
        title: 'Erreur',
        description: 'Erreur lors de l\'action groupée.',
        variant: 'destructive'
      });
    }
  };

  const calculateSeoScore = (content: string, title: string, metaDescription: string) => {
    let score = 0;
    if (title.length > 0) score += 20;
    if (title.length >= 30 && title.length <= 60) score += 20;
    if (metaDescription.length >= 120 && metaDescription.length <= 160) score += 20;
    if (content.includes('<h1>') || content.includes('<h2>')) score += 15;
    if (content.includes('alt=')) score += 10;
    if (content.length > 300) score += 15;
    return Math.min(score, 100);
  };

  const calculateReadabilityScore = (content: string) => {
    // Score de lisibilité simple basé sur la longueur des phrases
    const sentences = content.split(/[.!?]+/).filter((s) => s.trim().length > 0);
    const words = content.split(/\s+/).filter((w) => w.length > 0);
    const avgWordsPerSentence = words.length / sentences.length;
    const score = Math.max(0, 100 - (avgWordsPerSentence - 15) * 5);
    return Math.min(Math.max(score, 0), 100);
  };

  // Effets pour charger les données avancées
  useEffect(() => {
    if (editingPage && showVersions) {
      loadVersions();
    }
  }, [editingPage, showVersions, loadVersions]);

  useEffect(() => {
    if (editingPage && showAnalytics) {
      loadAnalytics();
    }
  }, [editingPage, showAnalytics, loadAnalytics]);

  useEffect(() => {
    setSeoScore(calculateSeoScore(formData.content, formData.title, formData.meta_description));
    setReadabilityScore(calculateReadabilityScore(formData.content));
  }, [formData.content, formData.title, formData.meta_description]);

  const insertFormatting = (tag: string, isBlock: boolean = false) => {
    const textarea = document.getElementById('content-editor') as HTMLTextAreaElement;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = textarea.value.substring(start, end);

    let replacement = '';
    if (isBlock) {
      replacement = `<${tag}>${selectedText || 'Texte ici'}</${tag}>`;
    } else {
      replacement = `<${tag}>${selectedText || 'Texte ici'}</${tag}>`;
    }

    const newValue = textarea.value.substring(0, start) + replacement + textarea.value.substring(end);
    setFormData((prev) => ({ ...prev, content: newValue }));

    // Focus back on textarea
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + replacement.length, start + replacement.length);
    }, 0);
  };

  const insertLink = () => {
    const url = prompt('Entrez l\'URL du lien:');
    if (!url) return;

    const textarea = document.getElementById('content-editor') as HTMLTextAreaElement;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = textarea.value.substring(start, end);

    const linkText = selectedText || 'Texte du lien';
    const replacement = `<a href="${url}" target="_blank" rel="noopener noreferrer">${linkText}</a>`;

    const newValue = textarea.value.substring(0, start) + replacement + textarea.value.substring(end);
    setFormData((prev) => ({ ...prev, content: newValue }));
  };

  const insertImage = () => {
    const url = prompt('Entrez l\'URL de l\'image:');
    if (!url) return;

    const alt = prompt('Texte alternatif (alt):') || '';

    const textarea = document.getElementById('content-editor') as HTMLTextAreaElement;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const replacement = `<img src="${url}" alt="${alt}" class="max-w-full h-auto" />`;

    const newValue = textarea.value.substring(0, start) + replacement + textarea.value.substring(textarea.selectionEnd);
    setFormData((prev) => ({ ...prev, content: newValue }));
  };

  const addCategory = () => {
    const category = prompt('Nouvelle catégorie:');
    const currentCategories = Array.isArray(formData.categories) ? formData.categories : [];
    if (category && !currentCategories.includes(category)) {
      setFormData((prev) => ({
        ...prev,
        categories: [...(Array.isArray(prev.categories) ? prev.categories : []), category]
      }));
    }
  };

  const removeCategory = (category: string) => {
    setFormData((prev) => ({
      ...prev,
      categories: (Array.isArray(prev.categories) ? prev.categories : []).filter((c) => c !== category)
    }));
  };

  const addTag = () => {
    const tag = prompt('Nouveau tag:');
    const currentTags = Array.isArray(formData.tags) ? formData.tags : [];
    if (tag && !currentTags.includes(tag)) {
      setFormData((prev) => ({
        ...prev,
        tags: [...(Array.isArray(prev.tags) ? prev.tags : []), tag]
      }));
    }
  };

  const removeTag = (tag: string) => {
    setFormData((prev) => ({
      ...prev,
      tags: (Array.isArray(prev.tags) ? prev.tags : []).filter((t) => t !== tag)
    }));
  };

  const tabs = [
  { id: 'content', label: 'Contenu', icon: FileText },
  { id: 'seo', label: 'SEO', icon: Search },
  { id: 'design', label: 'Design', icon: Palette },
  { id: 'code', label: 'Code', icon: Code },
  { id: 'monaco', label: 'Code Pro (AI)', icon: Sparkles },
  { id: 'hero', label: 'Hero', icon: Image },
  { id: 'settings', label: 'Paramètres', icon: Settings }];


  return (
    <div className="p-6">
      {/* ICE EDITOR VIEW */}
      {isIceEditorOpen && editingPage ?
      <div className="flex flex-col gap-4">
          <Button
          variant="outline"
          onClick={() => {
            setIsIceEditorOpen(false);
            setEditingPage(null);
            refetch();
          }}
          className="w-fit">
          
            ← Retour à la liste
          </Button>
          {/* @ts-expect-error: pageId type is validated at runtime and AdminPageEditor expects a string */}
          <AdminPageEditor pageId={editingPage.id} onSave={() => refetch()} />
        </div> :

      <>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">Gestion des Pages</h2>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={() => {resetForm();setIsDialogOpen(true);}}>
                  <Plus className="w-4 h-4 mr-2" />
                  Nouvelle Page
                </Button>
              </DialogTrigger>
              <DialogContent
              className="max-w-4xl max-h-[90vh] overflow-y-auto"
              aria-describedby="page-editor-description">
              
                <DialogHeader>
                  <DialogTitle>
                    {editingPage ? 'Modifier la Page' : 'Créer une Nouvelle Page'}
                  </DialogTitle>
                  <p id="page-editor-description" className="text-sm text-gray-600">
                    {editingPage ? 'Modifiez les paramètres et le contenu de la page.' : 'Créez une nouvelle page avec du contenu personnalisé.'}
                  </p>
                </DialogHeader>

                {/* Advanced Toolbar */}
                {editingPage &&
              <div className="flex flex-wrap gap-2 p-3 bg-gray-50 rounded-md border mb-4">
                    <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleCreateVersion}
                  className="flex items-center gap-1">
                  
                      <GitBranch className="w-4 h-4" />
                      Créer Version
                    </Button>
                    <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowVersions(!showVersions)}
                  className="flex items-center gap-1">
                  
                      <History className="w-4 h-4" />
                      Versions ({versions.length})
                    </Button>
                    <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowAnalytics(!showAnalytics)}
                  className="flex items-center gap-1">
                  
                      <BarChart3 className="w-4 h-4" />
                      Analytics
                    </Button>
                    <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handlePreview}
                  className="flex items-center gap-1">
                  
                      <Eye className="w-4 h-4" />
                      Aperçu
                    </Button>
                    <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowWorkflow(!showWorkflow)}
                  className="flex items-center gap-1">
                  
                      <Workflow className="w-4 h-4" />
                      Workflow
                    </Button>
                  </div>
              }

                {/* Versions Panel */}
                {showVersions && editingPage &&
              <div className="mb-4 p-4 border rounded-md bg-blue-50">
                    <h4 className="font-medium mb-2 flex items-center gap-2">
                      <History className="w-4 h-4" />
                      Historique des Versions
                    </h4>
                    <div className="space-y-2 max-h-40 overflow-y-auto">
                      {versions.map((version) =>
                  <div key={version.id} className="flex items-center justify-between p-2 bg-white rounded border">
                          <div>
                            <p className="text-sm font-medium">{version.author}</p>
                            <p className="text-xs text-gray-500">
                              {new Date(version.timestamp).toLocaleString('fr-FR')}
                            </p>
                            {version.changeLog &&
                      <p className="text-xs text-gray-600">{version.changeLog}</p>
                      }
                          </div>
                          <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => handleRestoreVersion(version.id)}>
                      
                            Restaurer
                          </Button>
                        </div>
                  )}
                    </div>
                  </div>
              }

                {/* Analytics Panel */}
                {showAnalytics && editingPage &&
              <div className="mb-4 p-4 border rounded-md bg-green-50">
                    <h4 className="font-medium mb-2 flex items-center gap-2">
                      <BarChart3 className="w-4 h-4" />
                      Analytics de la Page
                    </h4>
                    {analyticsData ?
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-blue-600">
                            {analyticsData.views || 0}
                          </div>
                          <div className="text-sm text-gray-600">Vues</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-green-600">
                            {analyticsData.uniqueVisitors || 0}
                          </div>
                          <div className="text-sm text-gray-600">Visiteurs uniques</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-purple-600">
                            {analyticsData.avgTime || '0s'}
                          </div>
                          <div className="text-sm text-gray-600">Temps moyen</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-orange-600">
                            {analyticsData.bounceRate || '0%'}
                          </div>
                          <div className="text-sm text-gray-600">Taux de rebond</div>
                        </div>
                      </div> :

                <div className="text-center py-4 text-gray-500">
                        Chargement des analytics...
                      </div>
                }
                  </div>
              }

                {/* Workflow Panel */}
                {showWorkflow &&
              <div className="mb-4 p-4 border rounded-md bg-yellow-50">
                    <h4 className="font-medium mb-2 flex items-center gap-2">
                      <Workflow className="w-4 h-4" />
                      Workflow d'Approbation
                    </h4>
                    <div className="space-y-3">
                      <div>
                        <Label>Statut du workflow</Label>
                        <select
                      value={workflowStatus}
                      onChange={(e) => setWorkflowStatus(e.target.value as unknown)}
                      className="w-full p-2 border rounded-md"
                      title="Sélectionner le statut du workflow">
                      
                          <option value="draft">Brouillon</option>
                          <option value="review">En révision</option>
                          <option value="approved">Approuvé</option>
                          <option value="published">Publié</option>
                        </select>
                      </div>
                    </div>
                  </div>
              }

                {/* SEO Score */}
                <div className="mb-4 p-3 bg-blue-50 rounded-md border">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Score SEO</span>
                    <span className={`text-sm font-bold ${seoScore >= 70 ? 'text-green-600' : seoScore >= 50 ? 'text-yellow-600' : 'text-red-600'}`}>
                      {seoScore}/100
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Lisibilité</span>
                    <span className={`text-sm font-bold ${readabilityScore >= 70 ? 'text-green-600' : readabilityScore >= 50 ? 'text-yellow-600' : 'text-red-600'}`}>
                      {readabilityScore}/100
                    </span>
                  </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Custom Tab Navigation */}
                  <div className="flex flex-wrap gap-2 border-b pb-4">
                    {tabs.map((tab) => {
                    const Icon = tab.icon;
                    return (
                      <button
                        key={tab.id}
                        type="button"
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === tab.id ?
                        'bg-blue-100 text-blue-700 border-blue-200' :
                        'text-gray-600 hover:text-gray-900 hover:bg-gray-100'}`
                        } aria-label="Action">
                        
                          <Icon className="w-4 h-4" />
                          {tab.label}
                        </button>);

                  })}
                  </div>

                  {/* Tab Content */}
                  {activeTab === 'content' &&
                <div className="space-y-4">
                      <div>
                        <Label htmlFor="title">Titre *</Label>
                        <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
                      required
                      className={formErrors.title ? "border-red-500 shadow-[0_0_0_1px_rgba(239,68,68,0.5)]" : ""} />
                    
                        <ErrorMessage field="title" />
                      </div>

                      <div>
                        <Label htmlFor="slug">Slug *</Label>
                        <Input
                      id="slug"
                      value={formData.slug}
                      onChange={(e) => setFormData((prev) => ({ ...prev, slug: e.target.value }))}
                      required
                      className={formErrors.slug ? "border-red-500 shadow-[0_0_0_1px_rgba(239,68,68,0.5)]" : ""} />
                    
                        <ErrorMessage field="slug" />
                        <p className="text-[10px] text-orange-600 mt-1 flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3" />
                          Attention: Si vous modifiez ce slug, mettez à jour le Menu correspondant.
                        </p>
                      </div>

                      <div>
                        <Label htmlFor="content">Contenu</Label>
                        {/* WYSIWYG Toolbar */}
                        <div className="flex flex-wrap gap-1 p-2 border border-gray-200 rounded-t-md bg-gray-50">
                          <button
                        type="button"
                        onClick={() => insertFormatting('strong')}
                        className="p-1 hover:bg-gray-200 rounded"
                        title="Gras">
                        
                            <Bold className="w-4 h-4" />
                          </button>
                          <button
                        type="button"
                        onClick={() => insertFormatting('em')}
                        className="p-1 hover:bg-gray-200 rounded"
                        title="Italique">
                        
                            <Italic className="w-4 h-4" />
                          </button>
                          <button
                        type="button"
                        onClick={() => insertFormatting('u')}
                        className="p-1 hover:bg-gray-200 rounded"
                        title="Souligné">
                        
                            <Underline className="w-4 h-4" />
                          </button>
                          <div className="w-px h-6 bg-gray-300 mx-1" />
                          <button
                        type="button"
                        onClick={() => insertFormatting('h1', true)}
                        className="p-1 hover:bg-gray-200 rounded text-xs"
                        title="Titre 1">
                        
                            H1
                          </button>
                          <button
                        type="button"
                        onClick={() => insertFormatting('h2', true)}
                        className="p-1 hover:bg-gray-200 rounded text-xs"
                        title="Titre 2">
                        
                            H2
                          </button>
                          <button
                        type="button"
                        onClick={() => insertFormatting('h3', true)}
                        className="p-1 hover:bg-gray-200 rounded text-xs"
                        title="Titre 3">
                        
                            H3
                          </button>
                          <div className="w-px h-6 bg-gray-300 mx-1" />
                          <button
                        type="button"
                        onClick={insertLink}
                        className="p-1 hover:bg-gray-200 rounded"
                        title="Lien">
                        
                            <Link className="w-4 h-4" />
                          </button>
                          <button
                        type="button"
                        onClick={insertImage}
                        className="p-1 hover:bg-gray-200 rounded"
                        title="Image">
                        
                            <Image className="w-4 h-4" />
                          </button>
                          <button
                        type="button"
                        onClick={() => insertFormatting('ul', true)}
                        className="p-1 hover:bg-gray-200 rounded"
                        title="Liste">
                        
                            <List className="w-4 h-4" />
                          </button>
                          <button
                        type="button"
                        onClick={() => insertFormatting('ol', true)}
                        className="p-1 hover:bg-gray-200 rounded"
                        title="Liste numérotée">
                        
                            <ListOrdered className="w-4 h-4" />
                          </button>
                        </div>
                        <Textarea
                      id="content-editor"
                      value={formData.content}
                      onChange={(e) => setFormData((prev) => ({ ...prev, content: e.target.value }))}
                      className="min-h-[300px] rounded-t-none"
                      placeholder="Contenu de la page..." />
                    
                      </div>
                    </div>
                }

                  {activeTab === 'seo' &&
                <div className="space-y-4">
                      <div>
                        <Label htmlFor="meta_description">
                          Meta Description ({(formData.meta_description || '').length}/160)
                        </Label>
                        <Textarea
                      id="meta_description"
                      value={formData.meta_description}
                      onChange={(e) => setFormData((prev) => ({ ...prev, meta_description: e.target.value }))}
                      maxLength={160}
                      placeholder="Description pour les moteurs de recherche..." />
                    
                      </div>

                      <div>
                        <Label htmlFor="meta_keywords">Meta Keywords</Label>
                        <Input
                      id="meta_keywords"
                      value={formData.meta_keywords}
                      onChange={(e) => setFormData((prev) => ({ ...prev, meta_keywords: e.target.value }))}
                      placeholder="mot-clé1, mot-clé2, mot-clé3" />
                    
                      </div>

                      <div>
                        <Label htmlFor="meta_robots">Meta Robots</Label>
                        <select
                      id="meta_robots"
                      value={formData.meta_robots}
                      onChange={(e) => setFormData((prev) => ({ ...prev, meta_robots: e.target.value }))}
                      className="w-full p-2 border border-gray-300 rounded-md"
                      title="Sélectionner les directives Meta Robots">
                      
                          <option value="index,follow">index,follow</option>
                          <option value="noindex,follow">noindex,follow</option>
                          <option value="index,nofollow">index,nofollow</option>
                          <option value="noindex,nofollow">noindex,nofollow</option>
                        </select>
                      </div>

                      <div>
                        <Label htmlFor="language_code">Langue de la page</Label>
                        <select
                      id="language_code"
                      value={formData.language_code || 'fr'}
                      onChange={(e) => setFormData((prev) => ({ ...prev, language_code: e.target.value }))}
                      className="w-full p-2 border border-gray-300 rounded-md"
                      title="Sélectionner la langue de la page">
                      
                          <option value="fr">Français</option>
                          <option value="en">English</option>
                          <option value="wo">Wolof</option>
                        </select>
                      </div>

                      <div>
                        <Label className="mb-2 block">Image en Vedette</Label>
                        <MediaSelector
                      currentValue={formData.featured_image}
                      onSelect={(url) => setFormData((prev) => ({ ...prev, featured_image: url }))} />
                    
                      </div>
                    </div>
                }

                  {activeTab === 'design' &&
                <div className="space-y-4">
                      <div>
                        <Label htmlFor="template">Template</Label>
                        <select
                      id="template"
                      value={formData.template}
                      onChange={(e) => setFormData((prev) => ({ ...prev, template: e.target.value }))}
                      className="w-full p-2 border border-gray-300 rounded-md"
                      title="Sélectionner le template de la page">
                      
                          <option value="default">Par défaut</option>
                          <option value="full-width">Pleine largeur</option>
                          <option value="sidebar-left">Barre latérale gauche</option>
                          <option value="sidebar-right">Barre latérale droite</option>
                          <option value="landing">Page d'atterrissage</option>
                        </select>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Switch
                      id="show_hero"
                      checked={formData.show_hero}
                      onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, show_hero: checked }))} />
                    
                        <Label htmlFor="show_hero">Afficher la section Hero</Label>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Switch
                      id="show_footer"
                      checked={formData.show_footer}
                      onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, show_footer: checked }))} />
                    
                        <Label htmlFor="show_footer">Afficher le pied de page</Label>
                      </div>
                    </div>
                }

                  {activeTab === 'code' &&
                <div className="space-y-4">
                      <div>
                        <Label htmlFor="custom_css">CSS Personnalisé</Label>
                        <Textarea
                      id="custom_css"
                      value={formData.custom_css}
                      onChange={(e) => setFormData((prev) => ({ ...prev, custom_css: e.target.value }))}
                      className="min-h-[200px] font-mono text-sm"
                      placeholder="CSS personnalisé pour cette page..." />
                    
                      </div>

                      <div>
                        <Label htmlFor="custom_js">JavaScript Personnalisé</Label>
                        <Textarea
                      id="custom_js"
                      value={formData.custom_js}
                      onChange={(e) => setFormData((prev) => ({ ...prev, custom_js: e.target.value }))}
                      className="min-h-[200px] font-mono text-sm"
                      placeholder="JavaScript personnalisé pour cette page..." />
                    
                      </div>

                      <div>
                        <Label htmlFor="header_html">HTML Header Supplémentaire</Label>
                        <Textarea
                      id="header_html"
                      value={formData.header_html}
                      onChange={(e) => setFormData((prev) => ({ ...prev, header_html: e.target.value }))}
                      className="min-h-[150px] font-mono text-sm"
                      placeholder="HTML à ajouter dans le <head>..." />
                    
                      </div>

                      <div>
                        <Label htmlFor="footer_html">HTML Footer Supplémentaire</Label>
                        <Textarea
                      id="footer_html"
                      value={formData.footer_html}
                      onChange={(e) => setFormData((prev) => ({ ...prev, footer_html: e.target.value }))}
                      className="min-h-[150px] font-mono text-sm"
                      placeholder="HTML à ajouter avant la fermeture du <body>..." />
                    
                      </div>
                    </div>
                }

                  {activeTab === 'monaco' && editingPage &&
                <div className="h-[600px]">
                      <MonacoTabContent
                    content={formData.content}
                    onChange={(value) => setFormData((prev) => ({ ...prev, content: value }))}
                    pageId={editingPage.id || ''}
                    userId={editingPage.author || ''}
                    immutable={false} />
                  
                    </div>
                }

                  {activeTab === 'hero' &&
                <div className="space-y-4">
                      <div>
                        <Label htmlFor="hero_title">Titre du Hero</Label>
                        <Input
                      id="hero_title"
                      value={formData.hero_title}
                      onChange={(e) => setFormData((prev) => ({ ...prev, hero_title: e.target.value }))}
                      placeholder="Titre principal de la section hero" />
                    
                      </div>

                      <div>
                        <Label htmlFor="hero_subtitle">Sous-titre du Hero</Label>
                        <Textarea
                      id="hero_subtitle"
                      value={formData.hero_subtitle}
                      onChange={(e) => setFormData((prev) => ({ ...prev, hero_subtitle: e.target.value }))}
                      placeholder="Sous-titre ou description de la section hero" />
                    
                      </div>

                      <div>
                        <Label className="mb-2 block">Image de Fond du Hero</Label>
                        <MediaSelector
                      currentValue={formData.hero_background_image}
                      onSelect={(url) => setFormData((prev) => ({ ...prev, hero_background_image: url }))} />
                    
                      </div>

                      <div>
                        <Label htmlFor="hero_cta_text">Texte du Bouton CTA</Label>
                        <Input
                      id="hero_cta_text"
                      value={formData.hero_cta_text}
                      onChange={(e) => setFormData((prev) => ({ ...prev, hero_cta_text: e.target.value }))}
                      placeholder="En savoir plus" />
                    
                      </div>

                      <div>
                        <Label htmlFor="hero_cta_link">Lien du Bouton CTA</Label>
                        <Input
                      id="hero_cta_link"
                      value={formData.hero_cta_link}
                      onChange={(e) => setFormData((prev) => ({ ...prev, hero_cta_link: e.target.value }))}
                      placeholder="/contact ou https://example.com" />
                    
                      </div>
                    </div>
                }

                  {activeTab === 'settings' &&
                <div className="space-y-4">
                      <div className="flex items-center space-x-2">
                        <Switch
                      id="is_published"
                      checked={formData.is_published}
                      onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, is_published: checked }))} />
                    
                        <Label htmlFor="is_published">Publier la page</Label>
                      </div>

                      <div>
                        <Label htmlFor="publish_date">Date de Publication</Label>
                        <Input
                      id="publish_date"
                      type="datetime-local"
                      value={formData.publish_date}
                      onChange={(e) => setFormData((prev) => ({ ...prev, publish_date: e.target.value }))} />
                    
                      </div>

                      <div>
                        <Label htmlFor="unpublish_date">Date de Dépublication</Label>
                        <Input
                      id="unpublish_date"
                      type="datetime-local"
                      value={formData.unpublish_date}
                      onChange={(e) => setFormData((prev) => ({ ...prev, unpublish_date: e.target.value }))} />
                    
                      </div>

                      <div>
                        <Label htmlFor="menu_order">Ordre dans le Menu</Label>
                        <Input
                      id="menu_order"
                      type="number"
                      value={formData.menu_order}
                      onChange={(e) => setFormData((prev) => ({ ...prev, menu_order: parseInt(e.target.value) || 0 }))}
                      min="0" />
                    
                      </div>

                      <div>
                        <Label htmlFor="author">Auteur</Label>
                        <Input
                      id="author"
                      value={formData.author}
                      onChange={(e) => setFormData((prev) => ({ ...prev, author: e.target.value }))}
                      placeholder="Nom de l'auteur" />
                    
                      </div>

                      <div>
                        <Label htmlFor="reading_time">Temps de Lecture (minutes)</Label>
                        <Input
                      id="reading_time"
                      type="number"
                      value={formData.reading_time}
                      onChange={(e) => setFormData((prev) => ({ ...prev, reading_time: parseInt(e.target.value) || 0 }))}
                      min="0" />
                    
                      </div>

                      <div>
                        <Label>Catégories</Label>
                        <div className="flex flex-wrap gap-2 mb-2">
                          {(Array.isArray(formData.categories) ? formData.categories : []).map((category, index) =>
                      <span
                        key={index}
                        className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                        
                              {category}
                              <button
                          type="button"
                          onClick={() => removeCategory(category)}
                          className="ml-1 hover:text-red-600"
                          title={`Supprimer la catégorie ${category}`}>
                          
                                <X className="w-3 h-3" />
                              </button>
                            </span>
                      )}
                        </div>
                        <Button type="button" variant="outline" size="sm" onClick={addCategory}>
                          <Plus className="w-4 h-4 mr-1" />
                          Ajouter une Catégorie
                        </Button>
                      </div>

                      <div>
                        <Label>Tags</Label>
                        <div className="flex flex-wrap gap-2 mb-2">
                          {(Array.isArray(formData.tags) ? formData.tags : []).map((tag, index) =>
                      <span
                        key={index}
                        className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                        
                              {tag}
                              <button
                          type="button"
                          onClick={() => removeTag(tag)}
                          className="ml-1 hover:text-red-600"
                          title={`Supprimer le tag ${tag}`}>
                          
                                <X className="w-3 h-3" />
                              </button>
                            </span>
                      )}
                        </div>
                        <Button type="button" variant="outline" size="sm" onClick={addTag}>
                          <Plus className="w-4 h-4 mr-1" />
                          Ajouter un Tag
                        </Button>
                      </div>
                    </div>
                }

                  <div className="flex justify-end gap-2 pt-4 border-t">
                    <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                      Annuler
                    </Button>
                    {isDialogOpen &&
                  <Button type="button" variant="ghost" size="sm" onClick={handleRestoreDraft} className="text-xs">
                        Restaurer brouillon local
                      </Button>
                  }
                    <Button type="submit">
                      <Save className="w-4 h-4 mr-2" />
                      {editingPage ? 'Mettre à Jour' : 'Créer'}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          {/* Navigation Principale Dashboard */}
          <div className="flex gap-4 mb-6 border-b pb-4 overflow-x-auto">
            <Button
            variant={activeTab === 'pages' ? 'default' : 'ghost'}
            onClick={() => setActiveTab('pages')}
            className="flex items-center gap-2">
            
              <FileText className="w-4 h-4" />
              Pages
            </Button>
            <Button
            variant={activeTab === 'themes' ? 'default' : 'ghost'}
            onClick={() => setActiveTab('themes')}
            className="flex items-center gap-2">
            
              <Palette className="w-4 h-4" />
              Thèmes
            </Button>
            <Button
            variant={activeTab === 'plugins' ? 'default' : 'ghost'}
            onClick={() => setActiveTab('plugins')}
            className="flex items-center gap-2">
            
              <Zap className="w-4 h-4" />
              Plugins
            </Button>
          </div>

          {activeTab === 'themes' &&
        <div className="space-y-6">
              {loadingThemes ?
          <div className="text-center py-12">Chargement de la bibliothèque de thèmes...</div> :

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {availableThemes?.map((theme) =>
            <div key={theme.id} className="bg-white border rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                      <div className="aspect-video bg-gray-100 flex items-center justify-center border-b">
                        {theme.preview_image ?
                <img src={theme.preview_image} alt={theme.display_name} className="w-full h-full object-cover" loading="lazy" /> :

                <Palette className="w-12 h-12 text-gray-300" />
                }
                      </div>
                      <div className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-bold text-lg">{theme.display_name}</h4>
                          {theme.is_premium &&
                  <span className="bg-yellow-100 text-yellow-800 text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                              Premium
                            </span>
                  }
                        </div>
                        <p className="text-sm text-gray-600 mb-4 line-clamp-2">{theme.description}</p>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-400 capitalize">{theme.category}</span>
                          <Button size="sm" onClick={() => handleApplyTheme(theme)}>
                            Appliquer
                          </Button>
                        </div>
                      </div>
                    </div>
            )}
                </div>
          }
            </div>
        }

          {activeTab === 'plugins' &&
        <div className="space-y-6">
              {loadingPlugins ?
          <div className="text-center py-12">Chargement du store de plugins...</div> :

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {availablePlugins?.map((plugin) =>
            <div key={plugin.id} className="bg-white border rounded-lg p-5 flex flex-col justify-between hover:border-blue-200 transition-colors">
                      <div>
                        <div className="flex items-start justify-between mb-4">
                          <div className="p-2 bg-blue-50 rounded-lg">
                            <Zap className="w-6 h-6 text-blue-600" />
                          </div>
                          <Switch
                    checked={plugin.is_active_globally}
                    onCheckedChange={() => handleTogglePlugin(plugin)} />
                  
                        </div>
                        <h4 className="font-bold text-lg mb-1">{plugin.display_name}</h4>
                        <p className="text-xs text-gray-500 mb-3">v{plugin.version} • par PROQUELEC</p>
                        <p className="text-sm text-gray-600">{plugin.description}</p>
                      </div>
                      <div className="mt-6 pt-4 border-t flex items-center justify-between">
                        <span className="text-[10px] bg-gray-100 px-2 py-1 rounded text-gray-500 uppercase font-medium">
                          {plugin.category}
                        </span>
                        <Button variant="ghost" size="sm" disabled={!plugin.is_active_globally}>
                          <Settings className="w-4 h-4 mr-2" />
                          Configurer
                        </Button>
                      </div>
                    </div>
            )}
                </div>
          }
            </div>
        }

          <div className={`${activeTab !== 'pages' ? 'hidden' : 'block'}`}>
            <div className="bg-white rounded-lg shadow">
              <div className="p-4 border-b">
                <h3 className="text-lg font-semibold">Gestion des Pages</h3>
              </div>

              {/* Advanced Filters and Search */}
              <div className="p-4 border-b bg-gray-50">
                <div className="flex flex-wrap gap-4 items-center">
                  <div className="flex-1 min-w-64">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <Input
                      placeholder="Rechercher dans les pages..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10" />
                    
                    </div>
                  </div>

                  <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as unknown)}
                className="px-3 py-2 border rounded-md"
                title="Filtrer par statut">
                  
                    <option value="all">Tous les statuts</option>
                    <option value="published">Publiées</option>
                    <option value="draft">Brouillons</option>
                  </select>

                  <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as unknown)}
                className="px-3 py-2 border rounded-md"
                title="Trier par">
                  
                    <option value="updated_at">Date de modification</option>
                    <option value="title">Titre</option>
                    <option value="created_at">Date de création</option>
                  </select>

                  <select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value as unknown)}
                className="px-3 py-2 border rounded-md"
                title="Ordre de tri">
                  
                    <option value="desc">Décroissant</option>
                    <option value="asc">Croissant</option>
                  </select>
                </div>

                {/* Bulk Actions */}
                {selectedPages.length > 0 &&
              <div className="flex items-center gap-2 mt-3">
                    <span className="text-sm text-gray-600">
                      {selectedPages.length} page(s) sélectionnée(s)
                    </span>
                    <select
                  value={bulkAction || ''}
                  onChange={(e) => setBulkAction(e.target.value as unknown)}
                  className="px-3 py-1 border rounded text-sm"
                  title="Actions groupées">
                  
                      <option value="">Action groupée</option>
                      <option value="publish">Publier</option>
                      <option value="unpublish">Dépublier</option>
                      <option value="delete">Supprimer</option>
                    </select>
                    <Button
                  onClick={handleBulkAction}
                  size="sm"
                  disabled={!bulkAction}>
                  
                      Appliquer
                    </Button>
                    <Button
                  onClick={() => setSelectedPages([])}
                  variant="outline"
                  size="sm">
                  
                      Annuler
                    </Button>
                  </div>
              }
              </div>

              <div className="p-4">
                {loading ?
              <div className="text-center py-8">Chargement...</div> :
              filteredPages.length === 0 ?
              <div className="text-center py-8 text-gray-500">
                    {searchTerm || filterStatus !== 'all' ?
                'Aucune page ne correspond aux critères de recherche.' :
                'Aucune page trouvée. Créez votre première page !'
                }
                  </div> :

              <div className="space-y-4">
                    {filteredPages.map((page: unknown) =>
                <div key={page?.id || Math.random()} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                        <div className="flex items-start gap-3 flex-1">
                          <input
                      type="checkbox"
                      checked={selectedPages.includes(page.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedPages((prev) => [...prev, page.id]);
                        } else {
                          setSelectedPages((prev) => prev.filter((id) => id !== page.id));
                        }
                      }}
                      className="mt-1"
                      title={`Sélectionner la page ${page?.title || ''}`}
                      aria-label={`Sélectionner la page ${page?.title || ''}`} />
                    
                          <div className="flex-1">
                            <h4 className="font-medium">{page?.title || 'Sans titre'}</h4>
                            <p className="text-sm text-gray-600">Slug: {page?.slug || 'sans-slug'}</p>
                            <div className="flex items-center gap-4 mt-1">
                              <span className={`text-xs px-2 py-1 rounded ${page?.is_published ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`
                        }>
                                {page?.is_published ? 'Publié' : 'Brouillon'}
                              </span>
                              {page?.template &&
                        <span className="text-xs text-gray-500">
                                  Template: {page.template}
                                </span>
                        }
                              {page?.updated_at &&
                        <span className="text-xs text-gray-500">
                                  Modifié: {new Date(page.updated_at).toLocaleDateString('fr-FR')}
                                </span>
                        }
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(page)}
                      title="Paramètres & SEO (Titre, Slug, Meta)">
                      
                            <Settings className="w-4 h-4" />
                          </Button>
                          <Button
                      variant="default"
                      size="sm"
                      onClick={() => window.open(`/admin/builder/${page.id}`, '_blank')}
                      title="Éditeur Visuel (Builder PRO)"
                      className="bg-blue-600 hover:bg-blue-700 text-white border-blue-600">
                      
                            <Layout className="w-4 h-4" />
                          </Button>
                          <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const url = `/${page.slug}`;
                        window.open(url, '_blank');
                      }}
                      title="Voir la page">
                      
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(page?.id)}
                      className="text-red-600 hover:text-red-700"
                      title="Supprimer">
                      
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                )}
                  </div>
              }
              </div>
            </div>
          </div>

          {/* Preview Modal */}
          <Dialog open={showPreview} onOpenChange={setShowPreview}>
            <DialogContent
            className="max-w-6xl max-h-[90vh]"
            aria-describedby="preview-description">
            
              <DialogHeader>
                <DialogTitle className="flex items-center justify-between">
                  <span>Aperçu de la page</span>
                  <div className="flex gap-2">
                    <Button
                    variant={previewMode === 'desktop' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setPreviewMode('desktop')}>
                    
                      <Monitor className="w-4 h-4" />
                    </Button>
                    <Button
                    variant={previewMode === 'tablet' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setPreviewMode('tablet')}>
                    
                      <Tablet className="w-4 h-4" />
                    </Button>
                    <Button
                    variant={previewMode === 'mobile' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setPreviewMode('mobile')}>
                    
                      <Smartphone className="w-4 h-4" />
                    </Button>
                  </div>
                </DialogTitle>
                <p id="preview-description" className="text-sm text-gray-600">
                  Aperçu responsive de la page dans différents formats d'écran.
                </p>
              </DialogHeader>
              <div className="flex-1 overflow-hidden">
                <div
                className={`mx-auto border rounded-lg overflow-hidden h-[70vh] bg-white ${previewMode === 'desktop' ? 'w-full max-w-4xl' :
                previewMode === 'tablet' ? 'w-full max-w-md' : 'w-full max-w-sm'}`
                }>
                
                  <iframe
                  srcDoc={`
                  <!DOCTYPE html>
                  <html>
                    <head>
                      <meta charset="utf-8">
                      <meta name="viewport" content="width=device-width, initial-scale=1">
                      <title>${formData.title || 'Aperçu'}</title>
                      <script src="https://cdn.tailwindcss.com"></script>
                      <style>
                        body {
                          margin: 0;
                          padding: 0;
                        }
                        /* Scrollbar styling for modern feel */
                        ::-webkit-scrollbar { width: 8px; }
                        ::-webkit-scrollbar-track { background: #f1f1f1; }
                        ::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 4px; }
                        ::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
                      </style>
                      ${formData.custom_css ? `<style>${formData.custom_css}</style>` : ''}
                    </head>
                    <body>
                      ${formData.show_hero ? `
                        <div class="hero-section">
                          <h1 class="hero-title">${formData.hero_title || formData.title}</h1>
                          ${formData.hero_subtitle ? `<p class="hero-subtitle">${formData.hero_subtitle}</p>` : ''}
                          ${formData.hero_cta_text ? `<a href="${formData.hero_cta_link || '#'}" class="hero-cta">${formData.hero_cta_text}</a>` : ''}
                        </div>
                      ` : ''}
                      <div>
                        ${formData.content || '<p>Contenu de la page...</p>'}
                      </div>
                      ${formData.custom_js ? `<script>${formData.custom_js}</script>` : ''}
                    </body>
                  </html>
                `}
                  className="w-full h-full border-0"
                  title="Aperçu de la page" />
                
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </>

      }
    </div>);

};

export default AdminPagesPanel;