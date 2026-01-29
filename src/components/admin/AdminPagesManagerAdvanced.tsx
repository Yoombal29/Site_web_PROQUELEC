import React, { useState, useEffect } from 'react';
import { getSupabaseClient } from '@/utils/supabaseClient';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertCircle, Plus, Trash2, Save, Eye, Edit2 } from 'lucide-react';

interface Page {
  id: string;
  slug: string;
  title: string;
  content: string;
  is_published: boolean;
  meta_description?: string;
  meta_keywords?: string;
  featured_image?: string;
  created_at: string;
  updated_at: string;
}

const AdminPagesManagerAdvanced: React.FC = () => {
  const [pages, setPages] = useState<Page[]>([]);
  const [selectedPage, setSelectedPage] = useState<Page | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [editForm, setEditForm] = useState<Partial<Page>>({});
  const [searchTerm, setSearchTerm] = useState('');

  const supabase = getSupabaseClient();

  // Charger les pages
  useEffect(() => {
    const fetchPages = async () => {
      try {
        const { data, error } = await supabase
          .from('pages')
          .select('*')
          .order('slug');

        if (error) {
          console.error('Erreur Supabase:', error);
          throw error;
        }
        setPages(data || []);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        console.error('Erreur lors du chargement des pages:', error);
        console.error('Détails:', errorMessage);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPages();
  }, []);

  // Sélectionner une page
  const handleSelectPage = (page: Page) => {
    setSelectedPage(page);
    setEditForm({ ...page });
    setIsCreating(false);
  };

  // Créer une nouvelle page
  const handleNewPage = () => {
    setSelectedPage(null);
    setEditForm({
      slug: '',
      title: '',
      content: '',
      is_published: false,
      meta_description: '',
      meta_keywords: ''
    });
    setIsCreating(true);
  };

  // Sauvegarder la page
  const handleSavePage = async () => {
    if (!editForm.slug || !editForm.title) {
      alert('Le slug et le titre sont requis');
      return;
    }

    setIsSaving(true);
    try {
      const pageData = {
        title: editForm.title?.trim() || '',
        content: editForm.content?.trim() || '',
        is_published: Boolean(editForm.is_published),
        meta_description: editForm.meta_description?.trim() || '',
        meta_keywords: editForm.meta_keywords?.trim() || ''
      };

      console.log('📝 Données à sauvegarder:', pageData);

      if (isCreating) {
        // Créer une nouvelle page
        pageData.slug = editForm.slug.trim().toLowerCase();
        console.log('✨ Création de page avec:', pageData);
        
        const { data, error } = await supabase
          .from('pages')
          .insert([pageData])
          .select();

        if (error) {
          console.error('❌ Erreur Supabase:', error);
          throw error;
        }
        console.log('✅ Page créée:', data);
        alert('Page créée avec succès');
      } else if (selectedPage) {
        // Mettre à jour la page existante
        console.log('✏️ Mise à jour de page id:', selectedPage.id);
        
        const { data, error } = await supabase
          .from('pages')
          .update(pageData)
          .eq('id', selectedPage.id)
          .select();

        if (error) {
          console.error('❌ Erreur Supabase:', error);
          throw error;
        }
        console.log('✅ Page mise à jour:', data);
        alert('Page mise à jour avec succès');
      }

      // Recharger les pages
      const { data } = await supabase
        .from('pages')
        .select('*')
        .order('slug');

      setPages(data || []);
      setSelectedPage(null);
      setEditForm({});
      setIsCreating(false);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error('Erreur lors de la sauvegarde:', error);
      console.error('Détails de l\'erreur:', errorMessage);
      alert(`Erreur lors de la sauvegarde: ${errorMessage}`);
    } finally {
      setIsSaving(false);
    }
  };

  // Supprimer une page
  const handleDeletePage = async (pageId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette page ?')) return;

    try {
      const { error } = await supabase
        .from('pages')
        .delete()
        .eq('id', pageId);

      if (error) throw error;
      alert('Page supprimée');

      const { data } = await supabase
        .from('pages')
        .select('*')
        .order('slug');

      setPages(data || []);
      setSelectedPage(null);
      setEditForm({});
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error('Erreur lors de la suppression:', error);
      alert(`Erreur lors de la suppression: ${errorMessage}`);
    }
  };

  // Filtrer les pages
  const filteredPages = pages.filter(page =>
    page.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    page.slug.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return <div className="p-8 text-center">Chargement des pages...</div>;
  }

  return (
    <div className="w-full space-y-6 p-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold">Gestionnaire de Pages Avancé</h2>
        <Button
          onClick={handleNewPage}
          className="gap-2 bg-proqblue hover:bg-blue-700"
        >
          <Plus className="w-4 h-4" /> Nouvelle Page
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Liste des pages */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-lg">Pages ({pages.length})</CardTitle>
            <Input
              placeholder="Rechercher..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="mt-2"
            />
          </CardHeader>
          <CardContent className="space-y-2 max-h-96 overflow-y-auto">
            {filteredPages.length === 0 ? (
              <p className="text-gray-500 text-sm">Aucune page trouvée</p>
            ) : (
              filteredPages.map(page => (
                <div
                  key={page.id}
                  onClick={() => handleSelectPage(page)}
                  className={`p-3 rounded cursor-pointer transition ${
                    selectedPage?.id === page.id
                      ? 'bg-blue-100 border border-proqblue'
                      : 'bg-gray-50 hover:bg-gray-100 border border-gray-200'
                  }`}
                >
                  <p className="font-medium text-sm text-gray-900">{page.title}</p>
                  <p className="text-xs text-gray-500">/{page.slug}</p>
                  <div className="flex items-center gap-2 mt-1">
                    {page.is_published ? (
                      <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                        Publiée
                      </span>
                    ) : (
                      <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                        Brouillon
                      </span>
                    )}
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Éditeur de page */}
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>
              {isCreating ? 'Créer une nouvelle page' : selectedPage ? 'Éditer: ' + selectedPage.title : 'Sélectionnez une page'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {(isCreating || selectedPage) && (
              <>
                {/* Slug */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Slug (URL)
                  </label>
                  <Input
                    value={editForm.slug || ''}
                    onChange={(e) => setEditForm({ ...editForm, slug: e.target.value })}
                    placeholder="ex: about"
                    disabled={!isCreating}
                  />
                </div>

                {/* Titre */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Titre
                  </label>
                  <Input
                    value={editForm.title || ''}
                    onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                    placeholder="Titre de la page"
                  />
                </div>

                {/* Contenu */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Contenu (HTML)
                  </label>
                  <Textarea
                    value={editForm.content || ''}
                    onChange={(e) => setEditForm({ ...editForm, content: e.target.value })}
                    placeholder="Contenu HTML de la page"
                    className="min-h-48 font-mono text-sm"
                  />
                  <p className="text-xs text-gray-500 mt-2">
                    💡 Utilisez les classes Tailwind pour le styling (ex: class="text-2xl font-bold")
                  </p>
                </div>

                {/* Meta Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description Meta (SEO)
                  </label>
                  <Textarea
                    value={editForm.meta_description || ''}
                    onChange={(e) => setEditForm({ ...editForm, meta_description: e.target.value })}
                    placeholder="Description pour les moteurs de recherche (160 caractères)"
                    className="min-h-16"
                  />
                </div>

                {/* Meta Keywords */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Mots-clés Meta (SEO)
                  </label>
                  <Input
                    value={editForm.meta_keywords || ''}
                    onChange={(e) => setEditForm({ ...editForm, meta_keywords: e.target.value })}
                    placeholder="Mots-clés séparés par des virgules"
                  />
                </div>

                {/* Statut */}
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={editForm.is_published || false}
                      onChange={(e) => setEditForm({ ...editForm, is_published: e.target.checked })}
                      className="w-4 h-4"
                    />
                    <span className="text-sm font-medium text-gray-700">Publier la page</span>
                  </label>
                </div>

                {/* Boutons d'action */}
                <div className="flex gap-3 pt-4">
                  <Button
                    onClick={handleSavePage}
                    disabled={isSaving}
                    className="gap-2 bg-green-600 hover:bg-green-700"
                  >
                    <Save className="w-4 h-4" />
                    {isSaving ? 'Sauvegarde...' : 'Sauvegarder'}
                  </Button>

                  {selectedPage && (
                    <Button
                      onClick={() => handleDeletePage(selectedPage.id)}
                      className="gap-2 bg-red-600 hover:bg-red-700"
                    >
                      <Trash2 className="w-4 h-4" /> Supprimer
                    </Button>
                  )}

                  {selectedPage && (
                    <Button
                      onClick={() => window.open(`/${selectedPage.slug}`, '_blank')}
                      className="gap-2 bg-blue-600 hover:bg-blue-700"
                    >
                      <Eye className="w-4 h-4" /> Voir
                    </Button>
                  )}
                </div>
              </>
            )}

            {!isCreating && !selectedPage && (
              <div className="flex flex-col items-center justify-center py-12 text-gray-500">
                <AlertCircle className="w-12 h-12 mb-4" />
                <p>Sélectionnez une page pour l'éditer</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Info */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="pt-6">
          <p className="text-sm text-blue-900">
            <strong>💡 Astuce:</strong> Utilisez du HTML avec les classes Tailwind CSS pour créer un contenu riche et stylisé. 
            Exemples: <code className="bg-white px-2 py-1 rounded text-xs">class="text-2xl font-bold"</code>, 
            <code className="bg-white px-2 py-1 rounded text-xs">class="bg-gray-50 rounded-lg p-6"</code>
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminPagesManagerAdvanced;