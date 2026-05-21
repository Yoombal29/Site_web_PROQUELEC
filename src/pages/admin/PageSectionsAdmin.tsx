import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Trash2, Save, Eye, Layout, GripVertical, AlertCircle, Layers, Code, MoveVertical, Settings } from "lucide-react";
import { SectionRenderer } from "@/components/cms/SectionRenderer";

import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { SEO } from '@/components/SEO';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useLiveSettings } from '@/hooks/useLiveSettings';
import { useSession } from '@/hooks/useSession';
import { useNavigate } from 'react-router-dom';
import { DEFAULT_PAGE_SECTIONS } from '@/data/defaultPageSections';
import * as LucideIcons from 'lucide-react';
import VisualPageEditor from '@/components/VisualPageEditor';
import AIContentEditor from '@/components/AIContentEditor';
import { MediaSelector } from '@/components/MediaLibrary';

const ICON_OPTIONS = [
'Landmark', 'Home', 'Briefcase', 'Building2', 'ShoppingBag', 'BookOpen',
'Calendar', 'Award', 'ShieldCheck', 'FileBarChart', 'Camera', 'MessageSquare',
'Zap', 'Users2', 'Scale', 'Newspaper', 'Mic2', 'Phone', 'Mail', 'MapPin',
'Handshake', 'Banknote', 'Settings', 'Hammer', 'GraduationCap', 'Download',
'HelpCircle', 'PenTool', 'Building', 'Globe', 'Palette', 'Star', 'Images', 'QuestionMark'];


const COMPONENT_TYPES = [
{ value: 'hero', label: 'Hero (En-tête)', icon: 'Layout' },
{ value: 'text-image', label: 'Texte & Image', icon: 'FileText' },
{ value: 'features-list', label: 'Liste de Services', icon: 'Zap' },
{ value: 'stats', label: 'Chiffres Clés', icon: 'BarChart' },
{ value: 'testimonials', label: 'Témoignages', icon: 'Users2' },
{ value: 'gallery', label: 'Galerie Photos', icon: 'Images' },
{ value: 'faq', label: 'Foire aux Questions', icon: 'HelpCircle' },
{ value: 'custom-html', label: 'HTML sur mesure', icon: 'Code' }];


const PAGE_CONFIGS = {
  'home_page': { label: 'Portail (Accueil)', color: 'blue' },
  'public_utility': { label: 'Utilité Publique', color: 'blue' },
  'autorites': { label: 'Espace Autorités', color: 'slate' },
  'menages': { label: 'Espace Ménages', color: 'rose' },
  'professionnels': { label: 'Espace Professionnels', color: 'blue' },
  'presse': { label: 'Espace Presse', color: 'indigo' },
  'social': { label: 'Réseaux & Social', color: 'sky' },
  'formation_certification': { label: 'Formation & Certification', color: 'orange' },
  'normes_ressources': { label: 'Normes & Ressources', color: 'teal' },
  'projets_realisations': { label: 'Projets & Réalisations', color: 'indigo' },
  'actualites_evenements': { label: 'Actualités & Événements', color: 'rose' },
  'partenaires': { label: 'Partenaires', color: 'yellow' },
  'about': { label: 'À Propos', color: 'purple' },
  'activities': { label: 'Activités', color: 'blue' },
  'certifications': { label: 'Certifications', color: 'indigo' },
  'advantages': { label: 'Avantages', color: 'emerald' },
  'labels': { label: 'Labels', color: 'amber' },
  'trainings': { label: 'Formations', color: 'blue' },
  'showroom': { label: 'Showroom', color: 'cyan' },
  'legal': { label: 'Mentions Légales', color: 'slate' },
  'contact': { label: 'Contact Principal', color: 'orange' },
  'contact_premium': { label: 'Contact Premium', color: 'green' },
  'outils': { label: 'Outils Métiers', color: 'emerald' }
};

interface PageSectionsAdminProps {
  standalone?: boolean;
  defaultPage?: string;
}

export default function PageSectionsAdmin({ standalone = true, defaultPage }: PageSectionsAdminProps) {
  const { settings, refetch } = useLiveSettings();
  const { session } = useSession();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [selectedPage, setSelectedPage] = useState<string>(defaultPage || 'public_utility');
  const [viewMode, setViewMode] = useState<'editor' | 'json' | 'preview' | 'html' | 'visual' | 'ai' | 'settings'>('visual');

  const [pageSections, setPageSections] = useState<unknown>({});
  const [activeSection, setActiveSection] = useState<string>('');

  useEffect(() => {
    if (standalone && (!session?.user || session.user.role !== 'admin')) {
      toast({
        title: "Accès refusé",
        description: "Seuls les administrateurs peuvent accéder à cette page.",
        variant: "destructive"
      });
      navigate('/');
    }
  }, [session, standalone]);

  useEffect(() => {
    if (settings?.page_sections) {
      setPageSections(settings.page_sections);
      const pageData = settings.page_sections[selectedPage];

      const firstSection = pageData?.sections?.[0]?.id;
      if (firstSection) setActiveSection(firstSection);
    }
  }, [settings, selectedPage]);

  const currentPageData = pageSections[selectedPage] || { sections: [], content: {}, renderMode: 'sections', customHTML: '' };
  const currentSections = currentPageData.sections || [];
  const currentContent = currentPageData.content || {};
  const renderMode = currentPageData.renderMode || 'sections';
  const customHTML = currentPageData.customHTML || '';

  // Helper to update the current page's data in the master object
  const updateCurrentPageData = (updates: unknown) => {
    setPageSections((prev) => ({
      ...prev,
      [selectedPage]: {
        ...currentPageData,
        ...updates
      }
    }));
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      // All data is already in pageSections due to unified sync
      const response = await fetch('/api/site-settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token}`
        },
        body: JSON.stringify({
          ...settings,
          page_sections: pageSections
        })
      });

      if (!response.ok) throw new Error('Erreur lors de la sauvegarde');

      await refetch();
      toast({
        title: "✅ Sauvegarde réussie",
        description: "Les modifications ont été enregistrées avec succès."
      });
    } catch (error) {
      toast({
        title: "❌ Erreur",
        description: "Impossible de sauvegarder les modifications.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const addSection = () => {
    const newId = `section_${Date.now()} `;
    const updatedSections = [
    ...currentSections,
    { id: newId, label: 'Nouvelle Section', icon: 'Briefcase' }];

    const updatedContent = {
      ...currentContent,
      [newId]: {
        title: 'Titre de la section',
        subtitle: 'Sous-titre',
        features: ['Feature 1', 'Feature 2'],
        image: 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=800&q=80'
      }
    };

    setPageSections({
      ...pageSections,
      [selectedPage]: {
        sections: updatedSections,
        content: updatedContent
      }
    });
    setActiveSection(newId);
  };

  const syncLegacyHomeSettings = () => {
    if (!settings) return;

    const homeData = (DEFAULT_PAGE_SECTIONS as unknown).home_page;
    const syncedContent = {
      ...homeData.content,
      hero: {
        ...homeData.content.hero,
        title: settings.site_name || homeData.content.hero.title,
        subtitle: settings.slogan || homeData.content.hero.subtitle
      },
      audience: {
        ...homeData.content.audience,
        title: settings.audience_section_title || homeData.content.audience.title,
        subtitle: settings.audience_section_subtitle || homeData.content.audience.subtitle,
        features: [
        {
          title: settings.audience_title_electrician || "Électriciens",
          subtitle: settings.audience_subtitle_electrician || "Indépendants",
          description: settings.audience_desc_electrician || "Normes gratuites et calculateurs pro.",
          icon: "Zap"
        },
        {
          title: settings.audience_title_company || "Professionnels",
          subtitle: settings.audience_subtitle_company || "Entreprises",
          description: settings.audience_desc_company || "Gestion de chantiers et certifications.",
          icon: "Building2"
        },
        {
          title: settings.audience_title_member || "Membres",
          subtitle: settings.audience_subtitle_member || "Experts",
          description: settings.audience_desc_member || "Veille normative et support prioritaire.",
          icon: "Users"
        }]

      }
    };

    setPageSections({
      ...pageSections,
      home_page: {
        ...homeData,
        content: syncedContent
      }
    });

    toast({
      title: "🔄 Centralisation réussie",
      description: "Les anciens réglages de la page d'accueil ont été importés dans le nouveau système."
    });
  };

  const initializePageFromDefaults = () => {
    const defaultData = (DEFAULT_PAGE_SECTIONS as unknown)[selectedPage];
    if (defaultData) {
      setPageSections({
        ...pageSections,
        [selectedPage]: defaultData
      });
      toast({
        title: "✅ Données initialisées",
        description: `Contenu par défaut chargé pour ${PAGE_CONFIGS[selectedPage as keyof typeof PAGE_CONFIGS]?.label} `
      });
      if (defaultData.sections?.[0]?.id) {
        setActiveSection(defaultData.sections[0].id);
      }
    } else {
      toast({
        title: "⚠️ Aucun modèle disponible",
        description: "Pas de données par défaut pour cette page.",
        variant: "destructive"
      });
    }
  };

  const deleteSection = (sectionId: string) => {
    const updatedSections = currentSections.filter((s: unknown) => s.id !== sectionId);
    const updatedContent = { ...currentContent };
    delete updatedContent[sectionId];

    setPageSections({
      ...pageSections,
      [selectedPage]: {
        sections: updatedSections,
        content: updatedContent
      }
    });
    setActiveSection(updatedSections[0]?.id || '');
  };

  const handleOnDragEnd = (result: unknown) => {
    if (!result.destination) return;

    const items = Array.from(currentSections);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    setPageSections({
      ...pageSections,
      [selectedPage]: {
        ...currentPageData,
        sections: items
      }
    });
  };

  const updateSectionMeta = (sectionId: string, field: string, value: unknown) => {
    const updatedSections = currentSections.map((s: unknown) =>
    s.id === sectionId ? { ...s, [field]: value } : s
    );

    setPageSections({
      ...pageSections,
      [selectedPage]: {
        ...currentPageData,
        sections: updatedSections
      }
    });
  };

  const updateSectionContent = (sectionId: string, field: string, value: unknown) => {
    const updatedContent = {
      ...currentContent,
      [sectionId]: {
        ...currentContent[sectionId],
        [field]: value
      }
    };

    setPageSections({
      ...pageSections,
      [selectedPage]: {
        ...currentPageData,
        content: updatedContent
      }
    });
  };

  const updateFeature = (sectionId: string, index: number, value: string) => {
    const features = [...(currentContent[sectionId]?.features || [])];
    features[index] = value;
    updateSectionContent(sectionId, 'features', features);
  };

  const addFeature = (sectionId: string) => {
    const features = [...(currentContent[sectionId]?.features || []), 'Nouvelle caractéristique'];
    updateSectionContent(sectionId, 'features', features);
  };

  const deleteFeature = (sectionId: string, index: number) => {
    const features = [...(currentContent[sectionId]?.features || [])];
    features.splice(index, 1);
    updateSectionContent(sectionId, 'features', features);
  };

  const currentSectionData = currentContent[activeSection] || {};

  return (
    <div className={`min-h-screen ${standalone ? 'bg-slate-50' : 'bg-transparent'}`}>
            {standalone && <SEO title="Admin - Gestion des Pages" description="Panel d'administration pour gérer le contenu des pages premium." />}
            {standalone && <Header solid={true} />}

            <main className={standalone ? "pt-32 pb-16" : "pb-16"}>
                <div className={standalone ? "container max-w-7xl mx-auto px-4" : "w-full mx-auto"}>
                    {/* Header */}
                    <div className="mb-8 flex items-center justify-between">
                        <div>
                            <h1 className="text-4xl font-black text-slate-900">Gestion des Pages Premium</h1>
                            <p className="text-slate-600 mt-2">Modifiez le contenu et les sous-menus de chaque page</p>
                        </div>
                        <Button onClick={handleSave} disabled={loading} className="gap-2">
                            <Save className="w-4 h-4" />
                            {loading ? 'Sauvegarde...' : 'Sauvegarder'}
                        </Button>
                    </div>

                    {/* Page Selector */}
                    <Card className="mb-6">
                        <CardContent className="pt-6">
                            <div className="flex items-center gap-4">
                                <Label className="font-bold">Page:</Label>
                                <Select value={selectedPage} onValueChange={setSelectedPage}>
                                    <SelectTrigger className="w-[300px]">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent position="popper" side="bottom" sideOffset={12} avoidCollisions={false} className="z-[1001]">
                                        {Object.entries(PAGE_CONFIGS).map(([key, config]) =>
                    <SelectItem key={key} value={key}>{config.label}</SelectItem>
                    )}
                                    </SelectContent>
                                </Select>

                                {selectedPage === 'home_page' &&
                <Button
                  variant="outline"
                  size="sm"
                  onClick={syncLegacyHomeSettings}
                  className="bg-purple-50 border-purple-200 text-purple-700 hover:bg-purple-100">
                  
                                        <LucideIcons.RefreshCcw className="w-4 h-4 mr-2" />
                                        Centraliser Réglages Accueil
                                    </Button>
                }

                                {/* Render Mode Toggle */}
                                <div className="flex gap-2 ml-4 p-1 bg-slate-100 rounded-lg">
                                    <Button
                    variant={renderMode === 'sections' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => updateCurrentPageData({ renderMode: 'sections' })}
                    className="text-xs">
                    
                                        📋 Sections
                                    </Button>
                                    <Button
                    variant={renderMode === 'html' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => updateCurrentPageData({ renderMode: 'html' })}
                    className="text-xs">
                    
                                        💻 HTML
                                    </Button>
                                </div>

                                <div className="ml-auto flex gap-2">
                                    <Button variant={viewMode === 'visual' ? 'default' : 'outline'} size="sm" onClick={() => setViewMode('visual')}>
                                        <GripVertical className="w-4 h-4 mr-2" /> Visuel
                                    </Button>
                                    <Button variant={viewMode === 'ai' ? 'default' : 'outline'} size="sm" onClick={() => setViewMode('ai')}>
                                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                        </svg>
                                        IA
                                    </Button>
                                    <Button variant={viewMode === 'editor' ? 'default' : 'outline'} size="sm" onClick={() => setViewMode('editor')}>
                                        <Layout className="w-4 h-4 mr-2" /> Formulaire
                                    </Button>
                                    {renderMode === 'html' &&
                  <Button variant={viewMode === 'html' ? 'default' : 'outline'} size="sm" onClick={() => setViewMode('html')}>
                                            <Code className="w-4 h-4 mr-2" /> HTML
                                        </Button>
                  }
                                    <Button variant={viewMode === 'settings' ? 'default' : 'outline'} size="sm" onClick={() => setViewMode('settings')}>
                                        <Settings className="w-4 h-4 mr-2" /> Réglages
                                    </Button>
                                    <Button variant={viewMode === 'preview' ? 'default' : 'outline'} size="sm" onClick={() => setViewMode('preview')}>
                                        <Eye className="w-4 h-4 mr-2" /> Preview
                                    </Button>
                                    <Button variant={viewMode === 'json' ? 'default' : 'outline'} size="sm" onClick={() => setViewMode('json')}>
                                        <Code className="w-4 h-4 mr-2" /> JSON
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {viewMode === 'visual' ?
          <Card className="border-none shadow-none bg-transparent">
                            <VisualPageEditor
              sections={currentSections}
              onSectionsChange={(newSections) => {
                setPageSections({
                  ...pageSections,
                  [selectedPage]: {
                    ...currentPageData,
                    sections: newSections
                  }
                });
              }} />
            
                        </Card> :
          viewMode === 'ai' ?
          <div className="max-w-4xl mx-auto">
                            <AIContentEditor
              currentContent={currentPageData}
              onContentUpdate={(newContent) => {
                setPageSections({
                  ...pageSections,
                  [selectedPage]: {
                    ...currentPageData,
                    ...newContent
                  }
                });
              }}
              pageKey={selectedPage} />
            
                        </div> :
          viewMode === 'settings' ?
          <div className="max-w-4xl mx-auto">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Settings className="w-5 h-5 text-blue-600" />
                                        Configuration Générale de la Page
                                    </CardTitle>
                                    <CardDescription>
                                        Modifiez l'en-tête (Hero) et les réglages globaux de cette page.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <Label>Badge (Petit texte en haut)</Label>
                                            <Input
                      value={currentPageData.badge || ''}
                      onChange={(e) => updateCurrentPageData({ badge: e.target.value })}
                      placeholder="ex: ENGAGEMENT PROQUELEC" />
                    
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Libellé du Menu (Fil d'Ariane)</Label>
                                            <Input
                      value={currentPageData.label || ''}
                      onChange={(e) => updateCurrentPageData({ label: e.target.value })}
                      placeholder="ex: Action Publique" />
                    
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label>Titre du Hero (Utilisez | pour un retour à la ligne)</Label>
                                        <Input
                    value={currentPageData.hero_title || ''}
                    onChange={(e) => updateCurrentPageData({ hero_title: e.target.value })}
                    className="font-bold text-lg"
                    placeholder="ex: Au service de | toute la Nation" />
                  
                                    </div>

                                    <div className="space-y-2">
                                        <Label>Sous-titre du Hero</Label>
                                        <Textarea
                    value={currentPageData.hero_subtitle || ''}
                    onChange={(e) => updateCurrentPageData({ hero_subtitle: e.target.value })}
                    rows={3}
                    placeholder="Description longue apparaissant sous le titre principal..." />
                  
                                    </div>

                                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                                        <h4 className="font-bold text-slate-800 mb-2 flex items-center gap-2 text-sm uppercase tracking-wider">
                                            <Eye className="w-4 h-4" /> Aperçu Rapide
                                        </h4>
                                        <div className="bg-slate-900 p-8 rounded-lg text-center space-y-4">
                                            <span className="text-[10px] font-black text-blue-400 border border-blue-400/30 px-2 py-0.5 rounded-full uppercase tracking-widest">{currentPageData.badge || 'BADGE'}</span>
                                            <h3 className="text-2xl font-black text-white leading-tight">
                                                {currentPageData.hero_title?.split('|').map((t: string, i: number) =>
                      <React.Fragment key={i}>
                                                        {i > 0 && <br />}
                                                        <span className={i === 1 ? 'text-blue-600' : ''}>{t}</span>
                                                    </React.Fragment>
                      ) || 'Titre de la Page'}
                                            </h3>
                                            <p className="text-slate-400 text-sm line-clamp-2">{currentPageData.hero_subtitle || 'Sous-titre de la page...'}</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div> :
          viewMode === 'json' ?
          <Card>
                            <CardHeader>
                                <CardTitle>Édition JSON Brute</CardTitle>
                                <CardDescription>Attention : Une erreur de syntaxe peut casser la page</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Textarea
                value={JSON.stringify(currentPageData, null, 2)}
                onChange={(e) => {
                  try {
                    const parsed = JSON.parse(e.target.value);
                    setPageSections({ ...pageSections, [selectedPage]: parsed });
                  } catch (err) {


                    // Invalid JSON, don't update
                  }}} className="font-mono text-sm h-[500px]" />
              
                            </CardContent>
                        </Card> :
          viewMode === 'html' && renderMode === 'html' ?
          <Card>
                            <CardHeader>
                                <CardTitle>💻 Éditeur HTML Personnalisé</CardTitle>
                                <CardDescription>
                                    Créez votre propre mise en page HTML. Le code sera injecté dans la page publique.
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-start gap-3">
                                        <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                                        <div className="text-sm text-amber-800">
                                            <p className="font-semibold mb-1">Mode HTML Avancé</p>
                                            <p>Vous avez un contrôle total sur le rendu. Utilisez TailwindCSS pour le styling.</p>
                                        </div>
                                    </div>

                                    <Textarea
                  value={customHTML}
                  onChange={(e) => updateCurrentPageData({ customHTML: e.target.value })}
                  placeholder={`<div class="max-w-4xl mx-auto px-6 py-20">
  <h2 class="text-3xl font-bold text-blue-900 mb-4">
    Régulation et Gouvernance
  </h2>
  <p class="text-lg text-slate-700 leading-relaxed">
    PROQUELEC accompagne les autorités publiques dans l'élaboration, la mise en œuvre
    et le suivi de la politique nationale de sécurité électrique...
  </p>
  
  <div class="bg-blue-50 border-l-4 border-blue-600 p-6 my-10 rounded-r-xl shadow-sm">
    <h4 class="text-blue-900 font-bold text-xl mt-0 mb-3">
      Nos services aux instances publiques
    </h4>
    <ul class="space-y-2">
      <li>✓ Audits d'infrastructures critiques</li>
      <li>✓ Conseil technique et normatif</li>
      <li>✓ Rapports sectoriels sur la conformité</li>
    </ul>
  </div>
</div > `}
                  className="font-mono text-sm h-[600px] bg-slate-900 text-green-400 border-slate-700" />
                

                                    <div className="flex gap-2">
                                        <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setViewMode('preview')}>
                    
                                            <Eye className="w-4 h-4 mr-2" />
                                            Prévisualiser
                                        </Button>
                                        <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const template = `< div class="max-w-4xl mx-auto px-6 py-20" >
  <h2 class="text-3xl font-bold text-blue-900 mb-4">Titre de la page</h2>
  <p class="text-lg text-slate-700">Votre contenu ici...</p>
</div > `;
                      setCustomHTML(template);
                    }}>
                    
                                            📄 Template de base
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card> :
          viewMode === 'preview' ?
          <div className="space-y-8">
                            <Card className="overflow-hidden border-2 border-slate-900/10 shadow-2xl">
                                <CardHeader className="bg-slate-900 text-white">
                                    <CardTitle className="text-xl flex items-center gap-2">
                                        <Eye className="w-5 h-5 text-blue-400" /> Prévisualisation Live : {PAGE_CONFIGS[selectedPage as keyof typeof PAGE_CONFIGS]?.label}
                                    </CardTitle>
                                    <CardDescription className="text-slate-400 italic">
                                        {renderMode === 'html' ? 'Rendu HTML personnalisé' : 'Ceci est une simulation du rendu final sur le site public.'}
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="p-0">
                                    <div className="bg-slate-50 min-h-[600px] p-8 md:p-16">
                                        {renderMode === 'html' ?
                  // Custom HTML Preview
                  <div
                    className="prose prose-lg max-w-none"
                    dangerouslySetInnerHTML={{ __html: customHTML || '<p class="text-slate-400 text-center py-20">Aucun contenu HTML. Passez en mode "HTML" pour éditer.</p>' }} /> :


                  // Sections Preview
                  <div className="max-w-6xl mx-auto space-y-12">
                                                {/* Preview Hero Area Simulation */}
                                                <div className="text-center space-y-4 mb-12">
                                                    <div className="w-24 h-1 bg-blue-600 mx-auto rounded-full mb-4"></div>
                                                    <h2 className="text-5xl font-black text-slate-900 tracking-tighter uppercase">{PAGE_CONFIGS[selectedPage as keyof typeof PAGE_CONFIGS]?.label}</h2>
                                                    <p className="text-lg text-slate-500 max-w-2xl mx-auto font-light">Contenu dynamique synchronisé au pixel près.</p>
                                                </div>

                                                {/* Unified Sections Preview */}
                                                {currentSections.map((section: unknown, sIdx: number) =>
                    <SectionRenderer
                      key={section.id}
                      section={{
                        ...currentContent[section.id],
                        id: section.id,
                        type: currentContent[section.id]?.type || (sIdx === 0 && selectedPage === 'home_page' ? 'hero' : 'text-image'),
                        layout: currentContent[section.id]?.layout || (sIdx % 2 === 1 ? 'right-left' : 'left-right')
                      }}
                      themeColor={PAGE_CONFIGS[selectedPage as keyof typeof PAGE_CONFIGS]?.color || 'blue'}
                      isAdmin={true}
                      isSelected={activeSection === section.id}
                      onEdit={(id) => {
                        setActiveSection(id);
                        setViewMode('editor');
                      }} />

                    )}
                                            </div>
                  }
                                    </div>
                                </CardContent>
                            </Card>
                        </div> :

          <div className="grid grid-cols-12 gap-6">
                            {/* Sections List */}
                            <div className="col-span-4">
                                <Card>
                                    <CardHeader>
                                        <div className="flex items-center justify-between">
                                            <CardTitle className="text-lg">Sous-Sections</CardTitle>
                                            <div className="flex gap-2">
                                                {currentSections.length === 0 && (DEFAULT_PAGE_SECTIONS as unknown)[selectedPage] &&
                      <Button size="sm" onClick={initializePageFromDefaults} variant="default" className="bg-blue-600 hover:bg-blue-700">
                                                        <Layout className="w-4 h-4 mr-2" />
                                                        Modèle
                                                    </Button>
                      }
                                                <Button size="sm" onClick={addSection} variant="outline">
                                                    <Plus className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="space-y-2">
                                        <DragDropContext onDragEnd={handleOnDragEnd}>
                                            <Droppable droppableId="sections">
                                                {(provided) =>
                      <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-2">
                                                        {currentSections.length === 0 ?
                        <div className="text-center py-8 text-slate-500">
                                                                <AlertCircle className="w-12 h-12 mx-auto mb-2 opacity-50" />
                                                                Aucune section. Cliquez sur "+" pour en ajouter.
                                                            </div> :

                        currentSections.map((section: unknown, index: number) =>
                        <Draggable key={section.id} draggableId={section.id} index={index}>
                                                                    {(provided, snapshot) =>
                          <motion.div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            className={`group p - 3 rounded - lg border - 2 cursor - pointer transition - all ${activeSection === section.id ?
                            'border-blue-600 bg-blue-50 shadow-md ring-2 ring-blue-600/10' :
                            'border-slate-200 hover:border-blue-300 bg-white'} ${
                            snapshot.isDragging ? 'shadow-2xl scale-[1.02] border-blue-400 z-50' : ''} `}
                            onClick={() => setActiveSection(section.id)}>
                            
                                                                            <div className="flex items-center gap-2">
                                                                                <div {...provided.dragHandleProps} className="p-1 hover:bg-slate-100 rounded">
                                                                                    <MoveVertical className="w-4 h-4 text-slate-400" />
                                                                                </div>
                                                                                <div className="flex-1">
                                                                                    <p className="font-bold text-sm">{section.label}</p>
                                                                                    <div className="flex items-center gap-2 mt-1">
                                                                                        <span className="text-[10px] bg-slate-100 px-1.5 py-0.5 rounded text-slate-500 font-mono">{section.id.substring(0, 8)}</span>
                                                                                        <span className="text-[10px] text-slate-400">{section.icon}</span>
                                                                                    </div>
                                                                                </div>
                                                                                <Button
                                size="icon"
                                variant="ghost"
                                className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  const confirm = window.confirm('Supprimer cette section ?');
                                  if (confirm) deleteSection(section.id);
                                }}>
                                
                                                                                    <Trash2 className="w-4 h-4 text-red-600" />
                                                                                </Button>
                                                                            </div>
                                                                        </motion.div>
                          }
                                                                </Draggable>
                        )
                        }
                                                        {provided.placeholder}
                                                    </div>
                      }
                                            </Droppable>
                                        </DragDropContext>
                                    </CardContent>
                                </Card>
                            </div>

                            {/* Content Editor */}
                            <div className="col-span-8">
                                {activeSection ?
              <Card>
                                        <CardHeader>
                                            <CardTitle>Édition de la Section</CardTitle>
                                            <CardDescription>ID: {activeSection}</CardDescription>
                                        </CardHeader>
                                        <CardContent className="space-y-6">
                                            {/* Section Meta */}
                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <Label>Label (Nom affiché)</Label>
                                                    <Input
                        value={currentSections.find((s: unknown) => s.id === activeSection)?.label || ''}
                        onChange={(e) => updateSectionMeta(activeSection, 'label', e.target.value)} />
                      
                                                </div>
                                                <div>
                                                    <Label>Icône Menus</Label>
                                                    <Select
                        value={currentSections.find((s: unknown) => s.id === activeSection)?.icon || ''}
                        onValueChange={(val) => updateSectionMeta(activeSection, 'icon', val)}>
                        
                                                        <SelectTrigger>
                                                            <SelectValue />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {ICON_OPTIONS.map((icon) =>
                          <SelectItem key={icon} value={icon}>{icon}</SelectItem>
                          )}
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                            </div>

                                            <div className="p-4 bg-blue-50/50 rounded-2xl border border-blue-100 flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center">
                                                        <Layers className="w-5 h-5" />
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-slate-900">Type de Composant</p>
                                                        <p className="text-xs text-slate-500">Définit la structure visuelle de la section</p>
                                                    </div>
                                                </div>
                                                <Select
                      value={currentSectionData.type || 'text-image'}
                      onValueChange={(val) => updateSectionContent(activeSection, 'type', val)}>
                      
                                                    <SelectTrigger className="w-[200px] bg-white ring-offset-blue-50">
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {COMPONENT_TYPES.map((type) =>
                        <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                        )}
                                                    </SelectContent>
                                                </Select>
                                            </div>

                                            {/* Content */}
                                            <div>
                                                <Label>Titre Principal</Label>
                                                <Input
                      value={currentSectionData.title || ''}
                      onChange={(e) => updateSectionContent(activeSection, 'title', e.target.value)} />
                    
                                            </div>

                                            <div>
                                                <Label>Sous-titre</Label>
                                                <Textarea
                      value={currentSectionData.subtitle || ''}
                      onChange={(e) => updateSectionContent(activeSection, 'subtitle', e.target.value)}
                      rows={2} />
                    
                                            </div>

                                            <div>
                                                <Label className="mb-2 block">Image de la section</Label>
                                                <MediaSelector
                      currentValue={currentSectionData.image}
                      onSelect={(url) => updateSectionContent(activeSection, 'image', url)}
                      label="Choisir une image" />
                    
                                            </div>

                                            {currentSectionData.type === 'testimonials' &&
                  <div className="space-y-4">
                                                    <div className="flex items-center justify-between">
                                                        <Label className="font-bold">Avis Clients</Label>
                                                        <Button size="sm" variant="outline" onClick={() => {
                        const tests = [...(currentSectionData.testimonials || []), { name: 'Nouveau Client', content: 'Super service !', rating: 5 }];
                        updateSectionContent(activeSection, 'testimonials', tests);
                      }}>
                                                            + Avis
                                                        </Button>
                                                    </div>
                                                    <div className="space-y-4">
                                                        {(currentSectionData.testimonials || []).map((t: unknown, idx: number) =>
                      <div key={idx} className="p-4 bg-slate-50 rounded-xl space-y-3 relative group">
                                                                <Button
                          size="icon" variant="ghost" className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 h-6 w-6"
                          onClick={() => {
                            const tests = [...currentSectionData.testimonials];
                            tests.splice(idx, 1);
                            updateSectionContent(activeSection, 'testimonials', tests);
                          }}>
                          
                                                                    <Trash2 className="w-3 h-3 text-red-600" />
                                                                </Button>
                                                                <div className="grid grid-cols-2 gap-2">
                                                                    <Input placeholder="Nom" value={t.name} onChange={(e) => {
                            const tests = [...currentSectionData.testimonials];
                            tests[idx].name = e.target.value;
                            updateSectionContent(activeSection, 'testimonials', tests);
                          }} />
                                                                    <Input placeholder="Rôle" value={t.role} onChange={(e) => {
                            const tests = [...currentSectionData.testimonials];
                            tests[idx].role = e.target.value;
                            updateSectionContent(activeSection, 'testimonials', tests);
                          }} />
                                                                </div>
                                                                <Textarea placeholder="Contenu" value={t.content} onChange={(e) => {
                          const tests = [...currentSectionData.testimonials];
                          tests[idx].content = e.target.value;
                          updateSectionContent(activeSection, 'testimonials', tests);
                        }} />
                                                            </div>
                      )}
                                                    </div>
                                                </div>
                  }

                                            {currentSectionData.type === 'faq' &&
                  <div className="space-y-4">
                                                    <div className="flex items-center justify-between">
                                                        <Label className="font-bold">FAQ Items</Label>
                                                        <Button size="sm" variant="outline" onClick={() => {
                        const items = [...(currentSectionData.faq || []), { question: '?', answer: '' }];
                        updateSectionContent(activeSection, 'faq', items);
                      }}>
                                                            + Question
                                                        </Button>
                                                    </div>
                                                    <div className="space-y-3">
                                                        {(currentSectionData.faq || []).map((q: unknown, idx: number) =>
                      <div key={idx} className="p-4 bg-slate-50 rounded-xl space-y-2">
                                                                <Input placeholder="Question" value={q.question} onChange={(e) => {
                          const items = [...currentSectionData.faq];
                          items[idx].question = e.target.value;
                          updateSectionContent(activeSection, 'faq', items);
                        }} />
                                                                <Textarea placeholder="Réponse" value={q.answer} onChange={(e) => {
                          const items = [...currentSectionData.faq];
                          items[idx].answer = e.target.value;
                          updateSectionContent(activeSection, 'faq', items);
                        }} />
                                                            </div>
                      )}
                                                    </div>
                                                </div>
                  }

                                            {currentSectionData.type === 'gallery' &&
                  <div className="space-y-4">
                                                    <Label className="font-bold">Images de la Galerie</Label>
                                                    <div className="grid grid-cols-2 gap-4">
                                                        {(currentSectionData.media?.urls || []).map((url: string, idx: number) =>
                      <div key={idx} className="relative group">
                                                                <Input value={url} onChange={(e) => {
                          const urls = [...currentSectionData.media.urls];
                          urls[idx] = e.target.value;
                          updateSectionContent(activeSection, 'media', { ...currentSectionData.media, urls });
                        }} className="text-xs" />
                                                                <img src={url} alt={`Aperçu galerie ${idx}`} className="mt-1 h-20 w-full object-cover rounded-md" loading="lazy" />
                                                            </div>
                      )}
                                                        <Button variant="outline" className="h-20 border-dashed" onClick={() => {
                        const urls = [...(currentSectionData.media?.urls || []), ''];
                        updateSectionContent(activeSection, 'media', { ...(currentSectionData.media || { type: 'gallery' }), urls });
                      }}>+</Button>
                                                    </div>
                                                </div>
                  }

                                            {(!currentSectionData.type || ['text-image', 'features-list', 'hero'].includes(currentSectionData.type)) &&
                  <div>
                                                    <div className="flex items-center justify-between mb-2">
                                                        <Label>Caractéristiques (Features)</Label>
                                                        <Button size="sm" variant="outline" onClick={() => addFeature(activeSection)}>
                                                            <Plus className="w-4 h-4" />
                                                        </Button>
                                                    </div>
                                                    <div className="space-y-2">
                                                        {(currentSectionData.features || []).map((feature: string, idx: number) =>
                      <div key={idx} className="flex gap-2">
                                                                <Input
                          value={feature}
                          onChange={(e) => updateFeature(activeSection, idx, e.target.value)}
                          placeholder={`Feature ${idx + 1}`} />
                        
                                                                <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => deleteFeature(activeSection, idx)}>
                          
                                                                    <Trash2 className="w-4 h-4 text-red-600" />
                                                                </Button>
                                                            </div>
                      )}
                                                    </div>
                                                </div>
                  }
                                        </CardContent>
                                    </Card> :

              <Card>
                                        <CardContent className="py-16 text-center text-slate-500">
                                            <Eye className="w-16 h-16 mx-auto mb-4 opacity-30" />
                                            Sélectionnez une section pour l'éditer
                                        </CardContent>
                                    </Card>
              }
                            </div>
                        </div>
          }
                </div>
            </main>

            {standalone && <Footer />
      }
        </div>);

}