import React, { useState, useEffect } from 'react';
import {
  FileText, Plus, Edit2, Trash2, Eye, EyeOff, Save, X, 
  Clock, User, Globe, CheckCircle, AlertCircle, Copy,
  Grid, List, Search, Filter, ChevronDown
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { getSupabaseClient } from '@/utils/supabaseClient';

interface Page {
  id: string;
  title: string;
  slug: string;
  content: string;
  is_published?: boolean;
  meta_description?: string;
  [key: string]: any;
}

const AdminContentManager: React.FC = () => {
  const { toast } = useToast();
  const [pages, setPages] = useState<Page[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'published' | 'draft'>('all');
  const [isEditing, setIsEditing] = useState(false);
  const [editingPage, setEditingPage] = useState<Page | null>(null);
  const [formData, setFormData] = useState<Partial<Page>>({});

  useEffect(() => {
    fetchPages();
  }, []);

  const fetchPages = async () => {
    try {
      const supabase = getSupabaseClient();
      const { data, error } = await supabase
        .from('pages')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPages(data || []);
    } catch (error) {
      console.error('Erreur fetch pages:', error);
      toast({
        title: 'Erreur',
        description: 'Erreur lors du chargement des pages',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const filteredPages = pages.filter(page => {
    const matchesSearch = page.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         page.slug.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || 
                         (filterStatus === 'published' ? page.published : !page.published);
    return matchesSearch && matchesStatus;
  });

  const handleNewPage = () => {
    setFormData({
      title: '',
      slug: '',
      content: '',
      meta_description: '',
      is_published: false,
    });
    setEditingPage(null);
    setIsEditing(true);
  };

  const handleEditPage = (page: Page) => {
    setFormData(page);
    setEditingPage(page);
    setIsEditing(true);
  };

  const handleSavePage = async () => {
    try {
      const supabase = getSupabaseClient();
      if (!formData.title || !formData.slug) {
        toast({
          title: 'Erreur',
          description: 'Titre et slug sont requis',
          variant: 'destructive'
        });
        return;
      }

      if (editingPage) {
        // Mise à jour
        const { error } = await supabase
          .from('pages')
          .update({
            ...formData,
            updated_at: new Date().toISOString()
          })
          .eq('id', editingPage.id);

        if (error) throw error;
        toast({
          title: 'Succès',
          description: 'Page mise à jour avec succès',
          variant: 'default'
        });
      } else {
        // Création
        const { error } = await supabase
          .from('pages')
          .insert([{
            title: formData.title,
            slug: formData.slug,
            content: formData.content,
            is_published: formData.is_published,
            meta_description: formData.meta_description,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }]);

        if (error) throw error;
        toast({
          title: 'Succès',
          description: 'Page créée avec succès',
          variant: 'default'
        });
      }

      setIsEditing(false);
      setFormData({});
      fetchPages();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error('Erreur save page:', error);
      console.error('Détails:', errorMessage);
      toast({
        title: 'Erreur',
        description: `Erreur lors de la sauvegarde: ${errorMessage}`,
        variant: 'destructive'
      });
    }
  };

  const handleDeletePage = async (pageId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette page?')) return;

    try {
      const supabase = getSupabaseClient();
      const { error } = await supabase
        .from('pages')
        .delete()
        .eq('id', pageId);

      if (error) throw error;
      toast({
        title: 'Succès',
        description: 'Page supprimée avec succès',
        variant: 'default'
      });
      fetchPages();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error('Erreur delete page:', error);
      toast({
        title: 'Erreur',
        description: `Erreur lors de la suppression: ${errorMessage}`,
        variant: 'destructive'
      });
    }
  };

  const handleTogglePublish = async (page: Page) => {
    try {
      const supabase = getSupabaseClient();
      const { error } = await supabase
        .from('pages')
        .update({ is_published: !page.is_published })
        .eq('id', page.id);

      if (error) throw error;
      fetchPages();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error('Erreur toggle publish:', error);
      toast({
        title: 'Erreur',
        description: `Erreur lors de la mise à jour: ${errorMessage}`,
        variant: 'destructive'
      });
    }
  };

  const generateSlug = (title: string): string => {
    return title
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim()
      .replace(/^-+|-+$/g, '');
  };

  if (isEditing) {
    return (
      <div className="bg-white rounded-xl shadow p-8 animate-fade-in">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">
            {editingPage ? 'Modifier la page' : 'Nouvelle page'}
          </h2>
          <button onClick={() => setIsEditing(false)} className="p-2 hover:bg-gray-100 rounded-lg">
            <X className="w-6 h-6 text-gray-600" />
          </button>
        </div>

        <div className="space-y-6 max-w-4xl">
          {/* Titre */}
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">Titre</label>
            <input
              type="text"
              value={formData.title || ''}
              onChange={(e) => {
                setFormData(prev => ({ ...prev, title: e.target.value }));
                if (!editingPage) {
                  setFormData(prev => ({ ...prev, slug: generateSlug(e.target.value) }));
                }
              }}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
          </div>

          {/* Slug */}
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">Slug (URL)</label>
            <input
              type="text"
              value={formData.slug || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">Description (Meta)</label>
            <textarea
              value={formData.meta_description || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, meta_description: e.target.value }))}
              rows={2}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
          </div>

          {/* Contenu */}
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">Contenu</label>
            <textarea
              value={formData.content || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
              rows={12}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 font-mono text-sm"
            />
          </div>

          {/* SEO */}
          <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Globe className="w-5 h-5" />
              Paramètres SEO
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">Titre SEO</label>
                <input
                  type="text"
                  value={formData.seo_title || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, seo_title: e.target.value }))}
                  placeholder="Titre optimisé pour les moteurs de recherche"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">Meta description</label>
                <textarea
                  value={formData.seo_description || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, seo_description: e.target.value }))}
                  rows={2}
                  placeholder="Description pour les moteurs de recherche (155-160 caractères)"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">Mots-clés</label>
                <input
                  type="text"
                  value={formData.seo_keywords || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, seo_keywords: e.target.value }))}
                  placeholder="Mots-clés séparés par des virgules"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>
            </div>
          </div>

          {/* Statut */}
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.is_published || false}
                onChange={(e) => setFormData(prev => ({ ...prev, is_published: e.target.checked }))}
                className="w-4 h-4"
              />
              <span className="font-medium text-gray-900">Publié</span>
            </label>
          </div>

          {/* Boutons d'action */}
          <div className="flex gap-4 pt-6">
            <Button
              onClick={handleSavePage}
              className="bg-green-600 hover:bg-green-700 gap-2"
            >
              <Save className="w-4 h-4" />
              Enregistrer
            </Button>
            <Button
              onClick={() => setIsEditing(false)}
              variant="outline"
              className="gap-2"
            >
              <X className="w-4 h-4" />
              Annuler
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Toolbar */}
      <div className="bg-white rounded-xl shadow p-6">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="flex-1 flex gap-2">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher une page..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as any)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
            >
              <option value="all">Tous les statuts</option>
              <option value="published">Publiés</option>
              <option value="draft">Brouillons</option>
            </select>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg transition ${viewMode === 'list' ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-100'}`}
            >
              <List className="w-5 h-5" />
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg transition ${viewMode === 'grid' ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-100'}`}
            >
              <Grid className="w-5 h-5" />
            </button>
            <Button onClick={handleNewPage} className="bg-blue-600 hover:bg-blue-700 gap-2">
              <Plus className="w-4 h-4" />
              Nouvelle page
            </Button>
          </div>
        </div>
      </div>

      {/* Contenu */}
      {isLoading ? (
        <div className="text-center py-12">
          <p className="text-gray-500">Chargement...</p>
        </div>
      ) : filteredPages.length === 0 ? (
        <div className="bg-white rounded-xl shadow p-12 text-center">
          <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Aucune page trouvée</h3>
          <p className="text-gray-500 mb-6">Créez votre première page en cliquant sur le bouton ci-dessus.</p>
          <Button onClick={handleNewPage} className="bg-blue-600 hover:bg-blue-700">
            <Plus className="w-4 h-4 mr-2" />
            Créer une page
          </Button>
        </div>
      ) : viewMode === 'list' ? (
        <div className="bg-white rounded-xl shadow overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Titre</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Statut</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Auteur</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Dernière modification</th>
                <th className="px-6 py-3 text-right text-sm font-semibold text-gray-900">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filteredPages.map(page => (
                <tr key={page.id} className="hover:bg-gray-50 transition">
                  <td className="px-6 py-4">
                    <div>
                      <p className="font-medium text-gray-900">{page.title}</p>
                      <p className="text-sm text-gray-500">{page.slug}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${
                      page.is_published
                        ? 'bg-green-100 text-green-700'
                        : 'bg-yellow-100 text-yellow-700'
                    }`}>
                      {page.is_published ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                      {page.is_published ? 'Publié' : 'Brouillon'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">{page.author || 'Admin'}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{new Date(page.updated_at || new Date()).toLocaleDateString('fr-FR')}</td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => handleTogglePublish(page)}
                        className="p-2 hover:bg-gray-100 rounded-lg transition"
                        title={page.published ? 'Dépublier' : 'Publier'}
                      >
                        {page.published ? <Eye className="w-4 h-4 text-green-600" /> : <EyeOff className="w-4 h-4 text-gray-400" />}
                      </button>
                      <button
                        onClick={() => handleEditPage(page)}
                        className="p-2 hover:bg-gray-100 rounded-lg transition"
                      >
                        <Edit2 className="w-4 h-4 text-blue-600" />
                      </button>
                      <button
                        onClick={() => handleDeletePage(page.id)}
                        className="p-2 hover:bg-gray-100 rounded-lg transition"
                      >
                        <Trash2 className="w-4 h-4 text-red-600" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPages.map(page => (
            <div key={page.id} className="bg-white rounded-xl shadow hover:shadow-lg transition overflow-hidden">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">{page.title}</h3>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    page.is_published ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                  }`}>
                    {page.is_published ? 'Publié' : 'Brouillon'}
                  </span>
                </div>

                <p className="text-gray-600 text-sm mb-4 line-clamp-2">{page.meta_description || page.content}</p>

                <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
                  <span className="flex items-center gap-1">
                    <User className="w-3 h-3" />
                    {page.author || 'Admin'}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {new Date(page.updated_at || new Date()).toLocaleDateString('fr-FR')}
                  </span>
                </div>

                <div className="flex gap-2 pt-4 border-t">
                  <button
                    onClick={() => handleEditPage(page)}
                    className="flex-1 px-3 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg text-sm font-medium transition flex items-center justify-center gap-2"
                  >
                    <Edit2 className="w-4 h-4" />
                    Modifier
                  </button>
                  <button
                    onClick={() => handleDeletePage(page.id)}
                    className="flex-1 px-3 py-2 bg-red-50 hover:bg-red-100 text-red-700 rounded-lg text-sm font-medium transition flex items-center justify-center gap-2"
                  >
                    <Trash2 className="w-4 h-4" />
                    Supprimer
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <p className="text-center text-sm text-gray-500">
        {filteredPages.length} page{filteredPages.length > 1 ? 's' : ''}
      </p>
    </div>
  );
};

export default AdminContentManager;
