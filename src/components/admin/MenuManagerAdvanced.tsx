import React, { useState, useMemo } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { useMenuItems, useUpdateMenuItem, useCreateMenuItem, useDeleteMenuItem } from '@/hooks/useMenuItems';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Trash2, Edit2, Save, X, GripHorizontal, ChevronDown, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';

interface MenuItem {
  id: string;
  title: string;
  url: string;
  menu_type: 'main' | 'secondary' | 'footer' | 'social';
  menu_order: number;
  is_active: boolean;
  target?: string;
  icon?: string;
  parent_id?: string | null;
}

export function MenuManagerAdvanced() {
  const { data: allMenuItems = [], isLoading } = useMenuItems();
  const updateMutation = useUpdateMenuItem();
  const createMutation = useCreateMenuItem();
  const deleteMutation = useDeleteMenuItem();

  const [editingId, setEditingId] = useState<string | null>(null);
  const [newItem, setNewItem] = useState<{title: string;url: string;menu_type: 'main' | 'secondary' | 'footer' | 'social';parent_id?: string | null;}>({
    title: '',
    url: '',
    menu_type: 'main',
    parent_id: null
  });
  const [editItem, setEditItem] = useState<MenuItem | null>(null);
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

  // Organiser les menus par parent
  const menusByType = useMemo(() => {
    return {
      main: allMenuItems.filter((item: unknown) => item.menu_type === 'main'),
      secondary: allMenuItems.filter((item: unknown) => item.menu_type === 'secondary'),
      footer: allMenuItems.filter((item: unknown) => item.menu_type === 'footer'),
      social: allMenuItems.filter((item: unknown) => item.menu_type === 'social')
    };
  }, [allMenuItems]);

  const buildMenuTree = (items: unknown[]) => {
    const root = items.filter((item) => !item.parent_id);
    const children = items.filter((item) => item.parent_id);

    const tree = root.map((item) => ({
      ...item,
      children: children.filter((child) => child.parent_id === item.id)
    }));

    return tree.sort((a, b) => (a.menu_order || 0) - (b.menu_order || 0));
  };

  const mainMenuTree = buildMenuTree(menusByType.main);
  const secondaryMenuTree = buildMenuTree(menusByType.secondary);
  const footerMenuTree = buildMenuTree(menusByType.footer);
  const socialMenuTree = buildMenuTree(menusByType.social);

  const handleAddMenuItem = async () => {
    if (!newItem.title || !newItem.url) {
      toast.error('Titre et URL sont requis');
      return;
    }

    try {
      await createMutation.mutateAsync({
        title: newItem.title,
        url: newItem.url,
        target: '_self',
        menu_order: menusByType[newItem.menu_type]?.length || 0,
        is_active: true,
        menu_type: newItem.menu_type,
        parent_id: newItem.parent_id
      });

      setNewItem({ title: '', url: '', menu_type: 'main', parent_id: null });
      toast.success('Élément ajouté au menu');
    } catch (error) {
      console.error('Erreur:', error);
      toast.error('Erreur lors de l’ajout');
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
      toast.success('Menu mis à jour');
    } catch (error) {
      console.error('Erreur:', error);
      toast.error('Erreur de mise à jour');
    }
  };

  const handleDeleteMenuItem = async (id: string) => {
    if (confirm('Voulez-vous vraiment supprimer cet élément ?')) {
      try {
        await deleteMutation.mutateAsync(id);
        toast.info('Élément supprimé');
      } catch (error) {
        toast.error('Erreur lors de la suppression');
        console.error('Erreur:', error);
      }
    }
  };

  const handleDragEnd = async (result: DropResult) => {
    const { source, destination, draggableId } = result;

    if (!destination) return;
    if (source.index === destination.index && source.droppableId === destination.droppableId) return;

    const menuItem = allMenuItems.find((item) => item.id === draggableId);
    if (!menuItem) return;

    try {
      // Mettre à jour parent_id si changement de groupe
      if (source.droppableId !== destination.droppableId) {
        // Extraction robuste du type (main, footer, social)
        const destType = destination.droppableId.split('-')[0];

        // Si l'ID contient "-children-", c'est un sous-menu, on récupère l'ID du parent
        const newParentId = destination.droppableId.includes('-children-') ?
        destination.droppableId.split('-children-')[1] :
        null;

        await updateMutation.mutateAsync({
          id: draggableId,
          menu_type: destType as unknown,
          parent_id: newParentId, // Null si retour à la racine
          menu_order: destination.index
        });
      } else {
        // Juste mettre à jour l'ordre dans le même conteneur
        await updateMutation.mutateAsync({
          id: draggableId,
          menu_order: destination.index
        });
      }
      toast.success('Position enregistrée');
    } catch (error) {
      console.error('Erreur reordering:', error);
      toast.error('Erreur de repositionnement');
    }
  };

  const toggleExpanded = (id: string) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedItems(newExpanded);
  };

  if (isLoading) {
    return <div>Chargement...</div>;
  }

  const renderMenuItems = (items: unknown, type: string, parentId: string | null = null) => {
    const itemsToRender = items.filter((item: unknown) => item.parent_id === parentId);

    return itemsToRender.map((item: unknown, index: number) =>
    <Draggable key={item.id} draggableId={item.id} index={index}>
        {(provided, snapshot) =>
      <div ref={provided.innerRef} {...provided.draggableProps}>
            <div
          className={`flex items-center gap-3 p-4 mb-2 rounded border ${snapshot.isDragging ? 'bg-blue-50 border-blue-300' : 'bg-gray-50 border-gray-200 hover:border-gray-300'} transition`
          }>
          
              <div {...provided.dragHandleProps} className="cursor-grab active:cursor-grabbing">
                <GripHorizontal className="w-5 h-5 text-gray-400" />
              </div>

              {editingId === item.id && editItem ?
          <div className="flex-1 flex gap-2">
                  <Input
              type="text"
              value={editItem.title}
              onChange={(e) => setEditItem({ ...editItem, title: e.target.value })}
              placeholder="Titre"
              className="flex-1" />
            
                  <Input
              type="text"
              value={editItem.url}
              onChange={(e) => setEditItem({ ...editItem, url: e.target.value })}
              placeholder="URL"
              className="flex-1" />
            
                  <Button
              onClick={() => handleUpdateMenuItem(item)}
              className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700">
              
                    <Save className="w-4 h-4" />
                  </Button>
                  <Button
              onClick={() => {
                setEditingId(null);
                setEditItem(null);
              }}
              className="bg-gray-600 text-white px-3 py-1 rounded hover:bg-gray-700">
              
                    <X className="w-4 h-4" />
                  </Button>
                </div> :

          <>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <button
                  onClick={() => toggleExpanded(item.id)}
                  className="p-1 hover:bg-slate-200 rounded-full transition-colors"
                  title={expandedItems.has(item.id) ? "Réduire" : "Développer pour ajouter des sous-menus"}>
                  
                        {expandedItems.has(item.id) ?
                  <ChevronDown className="w-4 h-4 text-slate-600" /> :

                  <ChevronRight className="w-4 h-4 text-slate-400 hover:text-blue-500" />
                  }
                      </button>
                      <p className="font-semibold">{item.title}</p>
                    </div>
                    <p className="text-sm text-gray-600">{item.url}</p>
                    {item.children && item.children.length > 0 &&
              <p className="text-xs text-blue-600 mt-1">{item.children.length} sous-menu(s)</p>
              }
                  </div>

                  <div className="flex gap-2">
                    <Button
                onClick={() => {
                  setEditingId(item.id);
                  setEditItem({ ...item });
                }}
                className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 text-sm">
                
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button
                onClick={() => handleDeleteMenuItem(item.id)}
                className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700 text-sm">
                
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </>
          }
            </div>

            {/* Sous-menus (Droppable même si vide pour permettre le DND) */}
            {expandedItems.has(item.id) &&
        <div className="ml-8 mb-3">
                <Droppable droppableId={`${type}-children-${item.id}`} type="MENU_ITEM">
                  {(provided, snapshot) =>
            <div
              ref={provided.innerRef}
              {...provided.droppableProps}
              className={`p-3 rounded border-2 border-dashed ${snapshot.isDraggingOver ? 'border-blue-400 bg-blue-50' : 'border-gray-300 bg-gray-50'}`
              }>
              
                      {item.children.map((child: unknown, childIndex: number) =>
              <Draggable key={child.id} draggableId={child.id} index={childIndex}>{(provided, snapshot) =>
                <div ref={provided.innerRef} {...provided.draggableProps}>
                            <div
                    className={`flex items-center gap-3 p-3 mb-2 rounded border text-sm ${snapshot.isDragging ? 'bg-blue-100 border-blue-300' : 'bg-white border-gray-200'}`
                    }>
                    
                              <div {...provided.dragHandleProps} className="cursor-grab">
                                <GripHorizontal className="w-4 h-4 text-gray-400" />
                              </div>
                              <div className="flex-1">
                                <p className="font-medium">{child.title}</p>
                                <p className="text-xs text-gray-600">{child.url}</p>
                              </div>
                              <Button
                      onClick={() => handleDeleteMenuItem(child.id)}
                      className="bg-red-600 text-white px-2 py-1 rounded hover:bg-red-700 text-xs">
                      
                                <Trash2 className="w-3 h-3" />
                              </Button>
                            </div>
                          </div>
                }</Draggable>
              )}
                      {item.children.length === 0 &&
              <p className="text-[10px] text-slate-400 text-center py-2 italic">Glissez un élément ici pour créer un sous-menu</p>
              }
                      {provided.placeholder}
                    </div>
            }
                </Droppable>
              </div>
        }
          </div>
      }
      </Draggable>
    );
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-2">Structure des Menus</h1>
      <p className="text-gray-600 mb-8 font-medium">Réorganisez le menu principal, le pied de page et les réseaux sociaux par glisser-déposer.</p>

      {/* Nouveau Menu Item */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4 text-slate-800">Ajouter un menu</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Titre</label>
            <Input
              type="text"
              placeholder="ex: Nos Services"
              value={newItem.title}
              onChange={(e) => setNewItem({ ...newItem, title: e.target.value })} />
            
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">URL</label>
            <Input
              type="text"
              placeholder="ex: /services"
              value={newItem.url}
              onChange={(e) => setNewItem({ ...newItem, url: e.target.value })} />
            
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Type</label>
            <select
            value={newItem.menu_type}
            onChange={(e) => setNewItem({ ...newItem, menu_type: e.target.value as unknown, parent_id: null })}
            className="w-full h-10 px-3 border border-slate-200 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-sm"
            title="Type de menu"
            aria-label="Sélectionner le type de menu">
              
              <option value="main">Menu Principal</option>
              <option value="secondary">Barre Supérieure (Sticker)</option>
              <option value="footer">Pied de Page</option>
              <option value="social">Social</option>
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Parent (Optionnel)</label>
            <select
            value={newItem.parent_id || ''}
            onChange={(e) => setNewItem({ ...newItem, parent_id: e.target.value || null })}
            className="w-full h-10 px-3 border border-slate-200 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-sm"
            title="Parent du menu"
            aria-label="Sélectionner le parent">
              
              <option value="">-- Aucun (Racine) --</option>
              {allMenuItems.
              filter((item) => item.menu_type === newItem.menu_type && !item.parent_id).
              map((item) =>
              <option key={item.id} value={item.id}>{item.title}</option>
              )
              }
            </select>
          </div>
        </div>
        <Button
          onClick={handleAddMenuItem}
          disabled={createMutation.isPending}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold h-10 px-6">
          
          <Plus className="w-4 h-4 mr-2" />
          Ajouter au Menu
        </Button>
      </div>

      {/* Drag & Drop Context */}
      <DragDropContext onDragEnd={handleDragEnd}>
        {/* Barre Supérieure (Sticker) */}
        <div className="bg-slate-900 text-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2 text-blue-400">
            <span className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></span>
            ⚡ Barre Supérieure (Sticker)
          </h2>
          <Droppable droppableId="secondary-root" type="MENU_ITEM">
            {(provided, snapshot) =>
            <div
              ref={provided.innerRef}
              {...provided.droppableProps}
              className={`p-4 rounded border-2 border-dashed ${snapshot.isDraggingOver ? 'border-blue-400 bg-blue-900/40' : 'border-slate-700 bg-slate-800/50'}`
              }>
              
                {renderMenuItems(secondaryMenuTree, 'secondary', null)}
                {secondaryMenuTree.length === 0 &&
              <p className="text-slate-400 text-center py-8">Aucun menu dans la barre supérieure</p>
              }
                {provided.placeholder}
              </div>
            }
          </Droppable>
        </div>

        {/* Menu Principal */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">📍 Menu Principal</h2>
          <Droppable droppableId="main-root" type="MENU_ITEM">
            {(provided, snapshot) =>
            <div
              ref={provided.innerRef}
              {...provided.droppableProps}
              className={`p-4 rounded border-2 border-dashed ${snapshot.isDraggingOver ? 'border-blue-400 bg-blue-50' : 'border-gray-300 bg-gray-50'}`
              }>
              
                {renderMenuItems(mainMenuTree, 'main', null)}
                {mainMenuTree.length === 0 &&
              <p className="text-gray-500 text-center py-8">Aucun menu principal</p>
              }
                {provided.placeholder}
              </div>
            }
          </Droppable>
        </div>

        {/* Menu Pied de Page */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">🔗 Menu Pied de Page</h2>
          <Droppable droppableId="footer-root" type="MENU_ITEM">
            {(provided, snapshot) =>
            <div
              ref={provided.innerRef}
              {...provided.droppableProps}
              className={`p-4 rounded border-2 border-dashed ${snapshot.isDraggingOver ? 'border-blue-400 bg-blue-50' : 'border-gray-300 bg-gray-50'}`
              }>
              
                {renderMenuItems(footerMenuTree, 'footer', null)}
                {footerMenuTree.length === 0 &&
              <p className="text-gray-500 text-center py-8">Aucun menu pied de page</p>
              }
                {provided.placeholder}
              </div>
            }
          </Droppable>
        </div>

        {/* Menu Social */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">🌐 Menu Social</h2>
          <Droppable droppableId="social-root" type="MENU_ITEM">
            {(provided, snapshot) =>
            <div
              ref={provided.innerRef}
              {...provided.droppableProps}
              className={`p-4 rounded border-2 border-dashed ${snapshot.isDraggingOver ? 'border-blue-400 bg-blue-50' : 'border-gray-300 bg-gray-50'}`
              }>
              
                {renderMenuItems(socialMenuTree, 'social', null)}
                {socialMenuTree.length === 0 &&
              <p className="text-gray-500 text-center py-8">Aucun menu social</p>
              }
                {provided.placeholder}
              </div>
            }
          </Droppable>
        </div>
      </DragDropContext>

      {/* Instructions */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-8">
        <h3 className="font-bold text-blue-900 mb-2">💡 Comment ça marche?</h3>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>✅ Glissez-déposez les menus pour les réordonner</li>
          <li>✅ Glissez un menu SOUS un autre menu pour le transformer en sous-menu</li>
          <li>✅ Cliquez sur la flèche pour développer/réduire les sous-menus</li>
          <li>✅ Glissez les menus entre les catégories (Principal, Pied de page, Social)</li>
        </ul>
      </div>
    </div>);

}