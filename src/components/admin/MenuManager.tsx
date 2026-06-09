import React, { useState } from 'react';
import { useMenuItems, useCreateMenuItem, useUpdateMenuItem, useDeleteMenuItem } from '@/hooks/useMenuItems';
import { usePages } from '@/hooks/usePages';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Trash2, Edit2, Save, X } from 'lucide-react';

interface MenuItem {
  id?: string;
  title: string;
  url: string;
  target?: string;
  menu_order?: number;
  is_active?: boolean;
  menu_type?: 'main' | 'footer' | 'social';
  icon?: string;
  label?: string;
  linked_page_id?: string | null;
}

export function MenuManager() {
  const { data: menuItems = [], isLoading } = useMenuItems();
  const { data: pages = [] } = usePages();
  const createMutation = useCreateMenuItem();
  const updateMutation = useUpdateMenuItem();
  const deleteMutation = useDeleteMenuItem();

  const [editingId, setEditingId] = useState<string | null>(null);
  const [newItem, setNewItem] = useState<MenuItem>({
    title: '',
    url: '',
    menu_type: 'main',
    menu_order: 0,
    is_active: true,
    target: '_self',
    linked_page_id: null
  });

  const [editItem, setEditItem] = useState<MenuItem | null>(null);

  const handleAddMenuItem = async () => {
    if (!newItem.title || !newItem.url) {
      alert('Titre et URL sont requis');
      return;
    }

    try {
      await createMutation.mutateAsync({
        title: newItem.title,
        url: newItem.url,
        target: newItem.target || '_self',
        menu_order: menuItems.length,
        is_active: true,
        menu_type: newItem.menu_type as 'main' | 'footer' | 'social',
        icon: newItem.icon,
        label: newItem.label,
        linked_page_id: newItem.linked_page_id || null
      });

      setNewItem({
        title: '',
        url: '',
        menu_type: 'main',
        menu_order: 0,
        is_active: true,
        target: '_self',
        linked_page_id: null
      });
    } catch (error) {
      console.error('Erreur lors de l\'ajout:', error);
    }
  };

  const handleUpdateMenuItem = async (item: unknown) => {
    if (!editItem) return;

    try {
      await updateMutation.mutateAsync({
        id: item.id,
        ...editItem
      });
      setEditingId(null);
      setEditItem(null);
    } catch (error) {
      console.error('Erreur lors de la mise à jour:', error);
    }
  };

  const handleDeleteMenuItem = async (id: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce menu?')) {
      try {
        await deleteMutation.mutateAsync(id);
      } catch (error) {
        console.error('Erreur lors de la suppression:', error);
      }
    }
  };

  const mainMenuItems = menuItems.filter((item: unknown) => item.menu_type === 'main');
  const footerMenuItems = menuItems.filter((item: unknown) => item.menu_type === 'footer');
  const socialMenuItems = menuItems.filter((item: unknown) => item.menu_type === 'social');

  if (isLoading) {
    return <div>Chargement du menu...</div>;
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">Gestionnaire de Menu</h1>

      {/* Nouveau Menu Item */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Ajouter un menu</h2>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <Input
            type="text"
            placeholder="Titre du menu"
            value={newItem.title}
            onChange={(e) => setNewItem({ ...newItem, title: e.target.value })}
            className="p-2 border rounded" />
          
          <Input
            type="text"
            placeholder="URL (ex: /formations, /about)"
            value={newItem.url}
            onChange={(e) => setNewItem({ ...newItem, url: e.target.value })}
            className="p-2 border rounded" />
          
          <select title="Lier à une page"
          value={newItem.linked_page_id || ''}
          onChange={(e) => {
            const pageId = e.target.value;
            const page = pages.find((p: unknown) => p.id === pageId);
            setNewItem({
              ...newItem,
              linked_page_id: pageId || null,
              url: page ? '/' + page.slug : newItem.url
            });
          }}
          className="p-2 border rounded">
            <option value="">-- Lier à une page --</option>
            {pages.map((page: unknown) =>
          <option key={page.id} value={page.id}>/{page.slug} — {page.title}</option>
          )}
          </select>
          <select title="Sélectionner une option"
          value={newItem.menu_type}
          onChange={(e) => setNewItem({ ...newItem, menu_type: e.target.value as unknown })}
          className="p-2 border rounded"
          title="Type de menu">
            
            <option value="main">Menu Principal</option>
            <option value="footer">Pied de page</option>
            <option value="social">Social</option>
          </select>
          <Input
            type="text"
            placeholder="Icône (optionnel)"
            value={newItem.icon || ''}
            onChange={(e) => setNewItem({ ...newItem, icon: e.target.value })}
            className="p-2 border rounded" />
          
        </div>
        <Button
          onClick={handleAddMenuItem}
          disabled={createMutation.isPending}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
          
          <Plus className="w-4 h-4 mr-2" />
          Ajouter
        </Button>
      </div>

      {/* Menu Principal */}
      <MenuSection
        title="Menu Principal"
        items={mainMenuItems}
        editingId={editingId}
        editItem={editItem}
        onEdit={(item) => {
          setEditingId(item.id);
          setEditItem({ ...item });
        }}
        onSave={() => {
          const item = mainMenuItems.find((i: unknown) => i.id === editingId);
          if (item) handleUpdateMenuItem(item);
        }}
        onCancel={() => {
          setEditingId(null);
          setEditItem(null);
        }}
        onDelete={handleDeleteMenuItem}
        onEditChange={setEditItem} />
      

      {/* Menu Pied de page */}
      <MenuSection
        title="Menu Pied de Page"
        items={footerMenuItems}
        editingId={editingId}
        editItem={editItem}
        onEdit={(item) => {
          setEditingId(item.id);
          setEditItem({ ...item });
        }}
        onSave={() => {
          const item = footerMenuItems.find((i: unknown) => i.id === editingId);
          if (item) handleUpdateMenuItem(item);
        }}
        onCancel={() => {
          setEditingId(null);
          setEditItem(null);
        }}
        onDelete={handleDeleteMenuItem}
        onEditChange={setEditItem} />
      

      {/* Menu Social */}
      <MenuSection
        title="Menu Social"
        items={socialMenuItems}
        editingId={editingId}
        editItem={editItem}
        onEdit={(item) => {
          setEditingId(item.id);
          setEditItem({ ...item });
        }}
        onSave={() => {
          const item = socialMenuItems.find((i: unknown) => i.id === editingId);
          if (item) handleUpdateMenuItem(item);
        }}
        onCancel={() => {
          setEditingId(null);
          setEditItem(null);
        }}
        onDelete={handleDeleteMenuItem}
        onEditChange={setEditItem} />
      
    </div>);

}

function MenuSection({
  title,
  items,
  editingId,
  editItem,
  onEdit,
  onSave,
  onCancel,
  onDelete,
  onEditChange
}: {title: string;items: unknown[];editingId: string | null;editItem: unknown;onEdit: (item: unknown) => void;onSave: () => void;onCancel: () => void;onDelete: (id: string) => void;onEditChange: (item: unknown) => void;}) {
  const { data: pages = [] } = usePages();
  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <h2 className="text-xl font-semibold mb-4">{title}</h2>
      {items.length === 0 ?
      <p className="text-gray-500">Aucun menu configuré</p> :

      <div className="space-y-2">
          {items.map((item: unknown) =>
        <div
          key={item.id}
          className="flex items-center justify-between p-4 border rounded bg-gray-50 hover:bg-gray-100">
          
              {editingId === item.id && editItem ?
          <div className="flex-1 space-y-2">
                <div className="flex gap-2">
                  <Input
              type="text"
              value={editItem.title}
              onChange={(e) => onEditChange({ ...editItem, title: e.target.value })}
              className="flex-1 p-2 border rounded" />
            
                  <Input
              type="text"
              value={editItem.url}
              onChange={(e) => onEditChange({ ...editItem, url: e.target.value })}
              className="flex-1 p-2 border rounded" />
                </div>
                <select title="Lier à une page"
                value={editItem.linked_page_id || ''}
                onChange={(e) => {
                  const pageId = e.target.value;
                  const page = pages.find((p: unknown) => p.id === pageId);
                  onEditChange({
                    ...editItem,
                    linked_page_id: pageId || null,
                    url: page ? '/' + page.slug : editItem.url
                  });
                }}
                className="w-full p-2 border rounded">
                  <option value="">-- Lier à une page --</option>
                  {pages.map((page: unknown) =>
                <option key={page.id} value={page.id}>/{page.slug} — {page.title}</option>
                )}
                </select>
                <div className="flex gap-2">
                  <Button
              onClick={onSave}
              className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700">
              
                    <Save className="w-4 h-4" />
                  </Button>
                  <Button
              onClick={onCancel}
              className="bg-gray-600 text-white px-3 py-1 rounded hover:bg-gray-700">
              
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div> :

          <>
                  <div className="flex-1">
                    <p className="font-semibold">{item.title}</p>
                    <p className="text-sm text-gray-600">{item.url}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                onClick={() => onEdit(item)}
                className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700">
                
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button
                onClick={() => onDelete(item.id)}
                className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700">
                
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </>
          }
            </div>
        )}
        </div>
      }
    </div>);

}