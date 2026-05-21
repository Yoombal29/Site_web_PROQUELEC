
import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { DesignEditor } from '@/components/admin/DesignEditor';
import { FileText, Eye, Zap, Save, X, Copy, Plus } from 'lucide-react';
import { apiFetch } from '@/lib/api-client';
import { LAYOUT_TEMPLATES, getDefaultDesignForLayout } from '@/utils/pageLayouts';
import type { PageRecord, PageDesignOptions, PageSeoOptions } from '@/types/PageSystem';
import { useToast } from '@/hooks/use-toast';

interface AdvancedPageEditorProps {
  pageId?: string;
  onClose?: () => void;
  onSaved?: (page: PageRecord) => void;
}

export const AdvancedPageEditor: React.FC<AdvancedPageEditorProps> = ({
  pageId,
  onClose,
  onSaved
}) => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<'content' | 'design' | 'preview'>('content');
  const [previewMode, setPreviewMode] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [page, setPage] = useState<PageRecord | null>(null);
  const [isLoading, setIsLoading] = useState(!!pageId);
  const [isSaving, setIsSaving] = useState(false);
  const [unsavedChanges, setUnsavedChanges] = useState(false);

  // Charger la page si c'est une modification
  useEffect(() => {
    if (pageId) {
      loadPage();
    } else {
      // Créer une nouvelle page vide
      initNewPage();
    }
  }, [pageId]);

  const loadPage = async () => {
    try {
      const data = await apiFetch<PageRecord>(`/api/pages/${pageId}`);

      if (!data) {
        toast({
          title: 'Erreur',
          description: 'Impossible de charger la page',
          variant: 'destructive'
        });
        return;
      }

      const pageData = {
        ...data,
        design_options: typeof data.design_options === 'string'
          ? JSON.parse(data.design_options)
          : data.design_options,
        seo_options: typeof data.seo_options === 'string'
          ? JSON.parse(data.seo_options)
          : data.seo_options
      } as PageRecord;

      setPage(pageData);
    } catch (err) {
      console.error('Erreur:', err);
      toast({
        title: 'Erreur',
        description: 'Erreur lors du chargement',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const initNewPage = () => {
    const newPage: PageRecord = {
      id: '',
      title: 'Nouvelle page',
      slug: 'nouvelle-page',
      content: '<h2>Commencez à écrire votre contenu ici...</h2>',
      template: 'default',
      layout_type: 'standard',
      design_options: getDefaultDesignForLayout('standard'),
      seo_options: {
        focus_keyword: '',
        meta_description: '',
        canonical_url: '',
        og_image: '',
        og_title: '',
        og_description: '',
        twitter_card: 'summary',
        schema_type: 'WebPage'
      },
      is_published: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    setPage(newPage);
    setIsLoading(false);
  };

  const handleSave = async () => {
    if (!page) return;

    if (!page.title || !page.slug) {
      toast({
        title: 'Erreur',
        description: 'Le titre et le slug sont requis',
        variant: 'destructive'
      });
      return;
    }

    setIsSaving(true);
    try {
      const pageToSave = {
        ...page,
        design_options: JSON.stringify(page.design_options),
        seo_options: JSON.stringify(page.seo_options),
        updated_at: new Date().toISOString()
      };

      if (page.id) {
        // Mise à jour
        await apiFetch(`/api/pages/${page.id}`, {
          method: 'PUT',
          body: JSON.stringify(pageToSave)
        });

        toast({
          title: 'Succès',
          description: 'Page mise à jour',
          variant: 'default'
        });
      } else {
        // Création
        const data = await apiFetch<PageRecord>('/api/pages', {
          method: 'POST',
          body: JSON.stringify(pageToSave)
        });

        setPage(data);
        toast({
          title: 'Succès',
          description: 'Page créée',
          variant: 'default'
        });
      }

      setUnsavedChanges(false);
      onSaved?.(page);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      console.error('Erreur:', err);
      toast({
        title: 'Erreur',
        description: `Erreur lors de la sauvegarde: ${errorMessage}`,
        variant: 'destructive'
      });
    } finally {
      setIsSaving(false);
    }
  };

  const updatePageField = (field: keyof PageRecord, value: any) => {
    setPage((prev) => prev ? { ...prev, [field]: value } : null);
    setUnsavedChanges(true);
  };

  const handleDesignChange = (design: PageDesignOptions) => {
    setPage((prev) => prev ? { ...prev, design_options: design } : null);
    setUnsavedChanges(true);
  };

  const handleSeoChange = (seo: PageSeoOptions) => {
    setPage((prev) => prev ? { ...prev, seo_options: seo } : null);
    setUnsavedChanges(true);
  };

  const handleLayoutChange = (layoutType: string) => {
    const defaultDesign = getDefaultDesignForLayout(layoutType);
    setPage((prev) =>
      prev
        ? {
          ...prev,
          layout_type: layoutType as any,
          design_options: {
            ...prev.design_options,
            ...defaultDesign
          }
        }
        : null
    );
    setUnsavedChanges(true);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mb-4"></div>
          <p>Chargement...</p>
        </div>
      </div>
    );
  }

  if (!page) return null;

  return (
    <div className="w-full space-y-6">
      {/* Barre de titre et actions */}
      <div className="flex items-center justify-between gap-4 p-4 bg-gray-50 rounded-lg border">
        <div className="flex-1">
          <h2 className="text-2xl font-bold">
            {page.id ? 'Éditer la page' : 'Créer une nouvelle page'}
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            {unsavedChanges && '⚠️ Changements non sauvegardés'}
          </p>
        </div>
        <div className="flex gap-2">
          {onClose && (
            <Button variant="outline" onClick={onClose}>
              <X className="w-4 h-4 mr-2" />
              Fermer
            </Button>
          )}
          <Button onClick={handleSave} disabled={isSaving} className="bg-green-600 hover:bg-green-700">
            <Save className="w-4 h-4 mr-2" />
            {isSaving ? 'Sauvegarde...' : 'Sauvegarder'}
          </Button>
        </div>
      </div>

      {/* Onglets */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="content" className="flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Contenu
          </TabsTrigger>
          <TabsTrigger value="design" className="flex items-center gap-2">
            <Zap className="w-4 h-4" />
            Design
          </TabsTrigger>
          <TabsTrigger value="preview" className="flex items-center gap-2">
            <Eye className="w-4 h-4" />
            Aperçu
          </TabsTrigger>
        </TabsList>

        {/* TAB: CONTENU */}
        <TabsContent value="content" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Informations Générales</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Titre *</Label>
                <Input
                  value={page.title}
                  onChange={(e) => updatePageField('title', e.target.value)}
                  placeholder="Titre de la page"
                  className="mt-2"
                />
              </div>

              <div>
                <Label>Slug *</Label>
                <Input
                  value={page.slug}
                  onChange={(e) => updatePageField('slug', e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-'))}
                  placeholder="mon-page"
                  className="mt-2"
                />
                <p className="text-xs text-gray-600 mt-1">
                  📌 URL: /page/{page.slug}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Auteur</Label>
                  <Input
                    value={page.author || ''}
                    onChange={(e) => updatePageField('author', e.target.value)}
                    placeholder="Nom de l'auteur"
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label>Image En Vedette</Label>
                  <Input
                    value={page.featured_image || ''}
                    onChange={(e) => updatePageField('featured_image', e.target.value)}
                    placeholder="URL de l'image"
                    className="mt-2"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input
                  id="page-published"
                  type="checkbox"
                  checked={page.is_published}
                  onChange={(e) => updatePageField('is_published', e.target.checked)}
                  className="w-4 h-4"
                />
                <label htmlFor="page-published" className="font-medium">Publier cette page</label>
              </div>
            </CardContent>
          </Card>
          ...
          {/* TAB: APERÇU */}
          <TabsContent value="preview" className="space-y-4">
            <div className="bg-gray-100 p-4 rounded-lg">
              <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                {previewMode === 'desktop' && (
                  <div className="w-full aspect-[16/9]">
                    {/* Aperçu Desktop */}
                    <iframe
                      title="Preview"
                      srcDoc={`<!DOCTYPE html>
<html>
<head>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: ${page.design_options.body_font};
      color: ${page.design_options.text_color};
      background-color: ${page.design_options.background_color};
    }
    h1, h2, h3 { font-family: ${page.design_options.heading_font}; }
    a { color: ${page.design_options.accent_color}; }
  </style>
</head>
<body>
  <h1>${page.title}</h1>
  <p>${page.hero_subtitle || ''}</p>
</body>
</html>`}
                      className="w-full h-full border-none"
                    />
                  </div>
                )}
                {previewMode === 'tablet' && (
                  <div className="mx-auto w-[768px] max-w-full">
                    <p className="text-center p-4 text-gray-600">Aperçu Tablet (768px)</p>
                  </div>
                )}
                {previewMode === 'mobile' && (
                  <div className="mx-auto w-[375px] max-w-full">
                    <p className="text-center p-4 text-gray-600">Aperçu Mobile (375px)</p>
                  </div>
                )}
              </div>
            </div>
          </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdvancedPageEditor;
