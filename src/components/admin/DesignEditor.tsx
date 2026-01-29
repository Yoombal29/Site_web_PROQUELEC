import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { 
  Palette, Layout, Eye, Code, Sparkles, Sliders, Type, 
  Copy, Trash2, Save, X, Plus
} from 'lucide-react';
import type { PageDesignOptions, PageRecord, PageSeoOptions, CustomSection } from '@/types/PageSystem';
import { LAYOUT_TEMPLATES } from '@/utils/pageLayouts';

interface DesignEditorProps {
  page: PageRecord;
  onDesignChange: (design: PageDesignOptions) => void;
  onSeoChange: (seo: PageSeoOptions) => void;
  onLayoutChange: (layout: string) => void;
  previewMode: 'desktop' | 'tablet' | 'mobile';
  onPreviewModeChange: (mode: 'desktop' | 'tablet' | 'mobile') => void;
}

export const DesignEditor: React.FC<DesignEditorProps> = ({
  page,
  onDesignChange,
  onSeoChange,
  onLayoutChange,
  previewMode,
  onPreviewModeChange
}) => {
  const [activeTab, setActiveTab] = useState<'layout' | 'colors' | 'typography' | 'sections' | 'seo' | 'css'>('layout');
  const design = page.design_options;
  const seo = page.seo_options;

  const updateDesign = (updates: Partial<PageDesignOptions>) => {
    onDesignChange({ ...design, ...updates });
  };

  const updateSeo = (updates: Partial<PageSeoOptions>) => {
    onSeoChange({ ...seo, ...updates });
  };

  return (
    <div className="space-y-6">
      {/* Onglets de prévisualisation */}
      <div className="flex items-center gap-2 border-b pb-4">
        <button
          onClick={() => onPreviewModeChange('desktop')}
          className={`px-3 py-2 rounded ${previewMode === 'desktop' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100'}`}
        >
          🖥️ Desktop
        </button>
        <button
          onClick={() => onPreviewModeChange('tablet')}
          className={`px-3 py-2 rounded ${previewMode === 'tablet' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100'}`}
        >
          📱 Tablet
        </button>
        <button
          onClick={() => onPreviewModeChange('mobile')}
          className={`px-3 py-2 rounded ${previewMode === 'mobile' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100'}`}
        >
          📲 Mobile
        </button>
      </div>

      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="w-full">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="layout" className="flex items-center gap-2">
            <Layout className="w-4 h-4" />
            <span className="hidden sm:inline">Layout</span>
          </TabsTrigger>
          <TabsTrigger value="colors" className="flex items-center gap-2">
            <Palette className="w-4 h-4" />
            <span className="hidden sm:inline">Couleurs</span>
          </TabsTrigger>
          <TabsTrigger value="typography" className="flex items-center gap-2">
            <Type className="w-4 h-4" />
            <span className="hidden sm:inline">Police</span>
          </TabsTrigger>
          <TabsTrigger value="sections" className="flex items-center gap-2">
            <Sparkles className="w-4 h-4" />
            <span className="hidden sm:inline">Sections</span>
          </TabsTrigger>
          <TabsTrigger value="seo" className="flex items-center gap-2">
            <Eye className="w-4 h-4" />
            <span className="hidden sm:inline">SEO</span>
          </TabsTrigger>
          <TabsTrigger value="css" className="flex items-center gap-2">
            <Code className="w-4 h-4" />
            <span className="hidden sm:inline">CSS</span>
          </TabsTrigger>
        </TabsList>

        {/* TAB: LAYOUT */}
        <TabsContent value="layout" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Layout className="w-5 h-5" />
                Sélectionner un Template
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {Object.values(LAYOUT_TEMPLATES).map((template) => (
                  <button
                    key={template.id}
                    onClick={() => onLayoutChange(template.id)}
                    className={`p-4 rounded-lg border-2 transition ${
                      page.layout_type === template.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="font-semibold text-sm">{template.name}</div>
                    <div className="text-xs text-gray-600 mt-1">{template.description}</div>
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
                <div>
                  <Label>Largeur du contenu</Label>
                  <select
                    value={design.content_width}
                    onChange={(e) => updateDesign({ content_width: e.target.value as any })}
                    className="w-full border rounded px-3 py-2 mt-1"
                  >
                    <option value="narrow">Étroite (800px)</option>
                    <option value="default">Standard (1000px)</option>
                    <option value="wide">Large (1200px)</option>
                    <option value="full">Pleine largeur</option>
                  </select>
                </div>

                <div>
                  <Label>Type de layout</Label>
                  <select
                    value={design.layout}
                    onChange={(e) => updateDesign({ layout: e.target.value as any })}
                    className="w-full border rounded px-3 py-2 mt-1"
                  >
                    <option value="default">Par défaut</option>
                    <option value="full-width">Pleine largeur</option>
                    <option value="boxed">En boîte</option>
                    <option value="card">Avec cartes</option>
                  </select>
                </div>
              </div>

              <div className="pt-4 space-y-3">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                  <label className="font-medium">
                    Hero Section
                  </label>
                  <input
                    type="checkbox"
                    checked={design.hero_enabled}
                    onChange={(e) => updateDesign({ hero_enabled: e.target.checked })}
                    className="w-5 h-5"
                  />
                </div>

                {design.hero_enabled && (
                  <div className="grid grid-cols-2 gap-3 ml-4 p-3 bg-blue-50 rounded">
                    <div>
                      <Label className="text-sm">Hauteur Hero</Label>
                      <select
                        value={design.hero_height}
                        onChange={(e) => updateDesign({ hero_height: e.target.value as any })}
                        className="w-full border rounded px-3 py-2 mt-1 text-sm"
                      >
                        <option value="small">Petite</option>
                        <option value="medium">Moyenne</option>
                        <option value="large">Grande</option>
                        <option value="fullscreen">Plein écran</option>
                      </select>
                    </div>

                    <div>
                      <Label className="text-sm">Alignment Hero</Label>
                      <select
                        value={design.hero_alignment}
                        onChange={(e) => updateDesign({ hero_alignment: e.target.value as any })}
                        className="w-full border rounded px-3 py-2 mt-1 text-sm"
                      >
                        <option value="left">Gauche</option>
                        <option value="center">Centre</option>
                        <option value="right">Droite</option>
                      </select>
                    </div>

                    <div className="col-span-2">
                      <Label className="text-sm">Opacité Overlay (0-1)</Label>
                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.1"
                        value={design.hero_overlay}
                        onChange={(e) => updateDesign({ hero_overlay: parseFloat(e.target.value) })}
                        className="w-full mt-1"
                      />
                      <span className="text-xs text-gray-600">{design.hero_overlay}</span>
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                  <label className="font-medium">
                    Sidebar
                  </label>
                  <input
                    type="checkbox"
                    checked={design.sidebar_enabled}
                    onChange={(e) => updateDesign({ sidebar_enabled: e.target.checked })}
                    className="w-5 h-5"
                  />
                </div>

                {design.sidebar_enabled && (
                  <div className="ml-4 p-3 bg-blue-50 rounded">
                    <Label className="text-sm">Position Sidebar</Label>
                    <select
                      value={design.sidebar_position}
                      onChange={(e) => updateDesign({ sidebar_position: e.target.value as any })}
                      className="w-full border rounded px-3 py-2 mt-1 text-sm"
                    >
                      <option value="left">Gauche</option>
                      <option value="right">Droite</option>
                    </select>
                  </div>
                )}

                <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                  <label className="font-medium">
                    CTA Footer
                  </label>
                  <input
                    type="checkbox"
                    checked={design.footer_cta_enabled}
                    onChange={(e) => updateDesign({ footer_cta_enabled: e.target.checked })}
                    className="w-5 h-5"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB: COLORS */}
        <TabsContent value="colors" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="w-5 h-5" />
                Couleurs du site
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label>Couleur de fond</Label>
                  <div className="flex gap-2 mt-2">
                    <input
                      type="color"
                      value={design.background_color}
                      onChange={(e) => updateDesign({ background_color: e.target.value })}
                      className="w-12 h-12 border rounded cursor-pointer"
                    />
                    <Input
                      value={design.background_color}
                      onChange={(e) => updateDesign({ background_color: e.target.value })}
                      placeholder="#ffffff"
                      className="flex-1"
                    />
                  </div>
                </div>

                <div>
                  <Label>Couleur d'accent</Label>
                  <div className="flex gap-2 mt-2">
                    <input
                      type="color"
                      value={design.accent_color}
                      onChange={(e) => updateDesign({ accent_color: e.target.value })}
                      className="w-12 h-12 border rounded cursor-pointer"
                    />
                    <Input
                      value={design.accent_color}
                      onChange={(e) => updateDesign({ accent_color: e.target.value })}
                      placeholder="#0066cc"
                      className="flex-1"
                    />
                  </div>
                </div>

                <div>
                  <Label>Couleur du texte</Label>
                  <div className="flex gap-2 mt-2">
                    <input
                      type="color"
                      value={design.text_color}
                      onChange={(e) => updateDesign({ text_color: e.target.value })}
                      className="w-12 h-12 border rounded cursor-pointer"
                    />
                    <Input
                      value={design.text_color}
                      onChange={(e) => updateDesign({ text_color: e.target.value })}
                      placeholder="#333333"
                      className="flex-1"
                    />
                  </div>
                </div>

                <div>
                  <Label>Preview</Label>
                  <div
                    className="mt-2 p-6 rounded border-2 text-center font-semibold"
                    style={{
                      backgroundColor: design.background_color,
                      color: design.text_color,
                      borderColor: design.accent_color
                    }}
                  >
                    Preview Text
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB: TYPOGRAPHY */}
        <TabsContent value="typography" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Type className="w-5 h-5" />
                Typographie
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Police des titres</Label>
                <select
                  value={design.heading_font}
                  onChange={(e) => updateDesign({ heading_font: e.target.value })}
                  className="w-full border rounded px-3 py-2 mt-2"
                >
                  <option value="system-ui, -apple-system, sans-serif">System (Défaut)</option>
                  <option value="Georgia, serif">Georgia (Serif)</option>
                  <option value="'Times New Roman', serif">Times New Roman</option>
                  <option value="'Arial', sans-serif">Arial</option>
                  <option value="'Courier New', monospace">Courier New</option>
                </select>
              </div>

              <div>
                <Label>Police du corps</Label>
                <select
                  value={design.body_font}
                  onChange={(e) => updateDesign({ body_font: e.target.value })}
                  className="w-full border rounded px-3 py-2 mt-2"
                >
                  <option value="system-ui, -apple-system, sans-serif">System (Défaut)</option>
                  <option value="Georgia, serif">Georgia (Serif)</option>
                  <option value="'Times New Roman', serif">Times New Roman</option>
                  <option value="'Arial', sans-serif">Arial</option>
                  <option value="'Courier New', monospace">Courier New</option>
                </select>
              </div>

              <div className="p-4 bg-gray-50 rounded">
                <div style={{ fontFamily: design.heading_font }}>
                  <h2 className="text-2xl font-bold mb-2">Ceci est un exemple de titre</h2>
                </div>
                <div style={{ fontFamily: design.body_font }}>
                  <p className="text-base">Ceci est un exemple de texte du corps du document.</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB: SECTIONS */}
        <TabsContent value="sections" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="w-5 h-5" />
                Sections Personnalisées
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                {design.custom_sections.map((section, idx) => (
                  <div key={section.id} className="p-4 border rounded-lg bg-gray-50 space-y-3">
                    <div className="flex justify-between items-center">
                      <h4 className="font-semibold">{section.title || `Section ${idx + 1}`}</h4>
                      <button
                        onClick={() => {
                          const newSections = design.custom_sections.filter((_, i) => i !== idx);
                          updateDesign({ custom_sections: newSections });
                        }}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    
                    <Input
                      placeholder="Titre de section"
                      value={section.title || ''}
                      onChange={(e) => {
                        const updated = [...design.custom_sections];
                        updated[idx].title = e.target.value;
                        updateDesign({ custom_sections: updated });
                      }}
                    />

                    <select
                      value={section.type}
                      onChange={(e) => {
                        const updated = [...design.custom_sections];
                        updated[idx].type = e.target.value as any;
                        updateDesign({ custom_sections: updated });
                      }}
                      className="w-full border rounded px-3 py-2"
                    >
                      <option value="text">Texte</option>
                      <option value="image">Image</option>
                      <option value="gallery">Galerie</option>
                      <option value="testimonials">Témoignages</option>
                      <option value="cta">Call-to-Action</option>
                      <option value="stats">Statistiques</option>
                      <option value="features">Caractéristiques</option>
                    </select>

                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={section.enabled}
                        onChange={(e) => {
                          const updated = [...design.custom_sections];
                          updated[idx].enabled = e.target.checked;
                          updateDesign({ custom_sections: updated });
                        }}
                      />
                      <label>Activer cette section</label>
                    </div>
                  </div>
                ))}
              </div>

              <Button
                onClick={() => {
                  const newSection: CustomSection = {
                    id: `section-${Date.now()}`,
                    type: 'text',
                    title: 'Nouvelle section',
                    content: '',
                    position: design.custom_sections.length,
                    enabled: true
                  };
                  updateDesign({ custom_sections: [...design.custom_sections, newSection] });
                }}
                className="w-full"
                variant="outline"
              >
                <Plus className="w-4 h-4 mr-2" />
                Ajouter une section
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB: SEO */}
        <TabsContent value="seo" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="w-5 h-5" />
                Options SEO
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Mot-clé focus</Label>
                <Input
                  value={seo.focus_keyword}
                  onChange={(e) => updateSeo({ focus_keyword: e.target.value })}
                  placeholder="ex: développement web"
                  className="mt-2"
                />
              </div>

              <div>
                <Label>Meta Description</Label>
                <Textarea
                  value={seo.meta_description}
                  onChange={(e) => updateSeo({ meta_description: e.target.value })}
                  placeholder="Décrivez votre page en 150-160 caractères"
                  maxLength={160}
                  className="mt-2 resize-none"
                  rows={3}
                />
                <span className="text-xs text-gray-600">{seo.meta_description.length}/160</span>
              </div>

              <div>
                <Label>URL Canonique</Label>
                <Input
                  value={seo.canonical_url}
                  onChange={(e) => updateSeo({ canonical_url: e.target.value })}
                  placeholder="https://example.com/page"
                  className="mt-2"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>OG Title (Facebook/Twitter)</Label>
                  <Input
                    value={seo.og_title}
                    onChange={(e) => updateSeo({ og_title: e.target.value })}
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label>Twitter Card Type</Label>
                  <select
                    value={seo.twitter_card}
                    onChange={(e) => updateSeo({ twitter_card: e.target.value as any })}
                    className="w-full border rounded px-3 py-2 mt-2"
                  >
                    <option value="summary">Summary</option>
                    <option value="summary_large_image">Summary Large Image</option>
                    <option value="app">App</option>
                    <option value="player">Player</option>
                  </select>
                </div>
              </div>

              <div>
                <Label>OG Description</Label>
                <Textarea
                  value={seo.og_description}
                  onChange={(e) => updateSeo({ og_description: e.target.value })}
                  placeholder="Description pour les réseaux sociaux"
                  className="mt-2 resize-none"
                  rows={3}
                />
              </div>

              <div>
                <Label>Schema Type</Label>
                <select
                  value={seo.schema_type}
                  onChange={(e) => updateSeo({ schema_type: e.target.value })}
                  className="w-full border rounded px-3 py-2 mt-2"
                >
                  <option value="WebPage">WebPage</option>
                  <option value="Article">Article</option>
                  <option value="BlogPosting">BlogPosting</option>
                  <option value="Product">Product</option>
                  <option value="LocalBusiness">LocalBusiness</option>
                </select>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB: CUSTOM CSS */}
        <TabsContent value="css" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Code className="w-5 h-5" />
                CSS Personnalisé
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-sm text-gray-600">
                Ajoutez du CSS personnalisé pour cette page. Ce CSS sera appliqué après les styles par défaut.
              </div>
              <Textarea
                value={design.custom_css}
                onChange={(e) => updateDesign({ custom_css: e.target.value })}
                placeholder="/* Entrez votre CSS personnalisé ici */
.custom-section { padding: 40px; }
h1 { color: #0066cc; }"
                className="font-mono text-sm resize-vertical"
                rows={12}
              />
              <div className="text-xs text-amber-600 bg-amber-50 p-3 rounded">
                ⚠️ Attention: Le CSS personnalisé peut surcharger les styles existants. Testez bien sur tous les appareils.
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DesignEditor;
