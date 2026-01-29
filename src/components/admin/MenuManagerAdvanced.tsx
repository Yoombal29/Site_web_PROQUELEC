import React, { useState, useMemo } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';
import { useMenuItems, useUpdateMenuItem, useCreateMenuItem, useDeleteMenuItem } from '@/hooks/useMenuItems';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Trash2, Edit2, Save, X, GripHorizontal, ChevronDown, ChevronRight } from 'lucide-react';

interface MenuItem {
  id: string;
  title: string;
  url: string;
  menu_type: 'main' | 'footer' | 'social';
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
  const [newItem, setNewItem] = useState({
    title: '',
    url: '',
    menu_type: 'main' as const,
  });
  const [editItem, setEditItem] = useState<MenuItem | null>(null);
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

  // Organiser les menus par parent
  const menusByType = useMemo(() => {
    return {
      main: allMenuItems.filter((item: any) => item.menu_type === 'main'),
      footer: allMenuItems.filter((item: any) => item.menu_type === 'footer'),
      social: allMenuItems.filter((item: any) => item.menu_type === 'social'),
    };
  }, [allMenuItems]);

  const buildMenuTree = (items: any[]) => {
    const root = items.filter(item => !item.parent_id);
    const children = items.filter(item => item.parent_id);

    const tree = root.map(item => ({
      ...item,
      children: children.filter(child => child.parent_id === item.id),
    }));

    return tree.sort((a, b) => (a.menu_order || 0) - (b.menu_order || 0));
  };

  const mainMenuTree = buildMenuTree(menusByType.main);
  const footerMenuTree = buildMenuTree(menusByType.footer);
  const socialMenuTree = buildMenuTree(menusByType.social);

  const handleAddMenuItem = async () => {
    if (!newItem.title || !newItem.url) {
      alert('Titre et URL sont requis');
      return;
    }

    try {
      await createMutation.mutateAsync({
        title: newItem.title,
        url: newItem.url,
        target: '_self',
        menu_order: (menusByType[newItem.menu_type]?.length || 0),
        is_active: true,
        menu_type: newItem.menu_type,
        parent_id: null,
      });

      setNewItem({
        title: '',
        url: '',
        menu_type: 'main',
      });
    } catch (error) {
      console.error('Erreur:', error);
    }
  };

  const handleUpdateMenuItem = async (item: any) => {
    if (!editItem) return;
    try {
      await updateMutation.mutateAsync({
        id: item.id,
        ...editItem,
      });
      setEditingId(null);
      setEditItem(null);
    } catch (error) {
      console.error('Erreur:', error);
    }
  };

  const handleDeleteMenuItem = async (id: string) => {
    if (confirm('Supprimer ce menu?')) {
      try {
        await deleteMutation.mutateAsync(id);
      } catch (error) {
        console.error('Erreur:', error);
      }
    }
  };

  const handleDragEnd = async (result: DropResult) => {
    const { source, destination, draggableId } = result;

    if (!destination) return;
    if (source.index === destination.index && source.droppableId === destination.droppableId) return;

    const menuItem = allMenuItems.find(item => item.id === draggableId);
    if (!menuItem) return;

    try {
      // Mettre à jour parent_id si changement de groupe
      if (source.droppableId !== destination.droppableId) {
        const destType = destination.droppableId.split('-')[0];
        const newParentId = destination.droppableId.includes('-children-')
          ? destination.droppableId.split('-children-')[1]
          : null;

        await updateMutation.mutateAsync({
          id: draggableId,
          menu_type: destType as any,
          parent_id: newParentId || null,
          menu_order: destination.index,
        });
      } else {
        // Juste mettre à jour l'ordre
        await updateMutation.mutateAsync({
          id: draggableId,
          menu_order: destination.index,
        });
      }
    } catch (error) {
      console.error('Erreur:', error);
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

  const renderMenuItems = (items: any, type: string, parentId: string | null = null) => {
    const itemsToRender = items.filter((item: any) => item.parent_id === parentId);

    return itemsToRender.map((item: any, index: number) => (
      <Draggable key={item.id} draggableId={item.id} index={index}>
        {(provided, snapshot) => (
          <div ref={provided.innerRef} {...provided.draggableProps}>
            <div
              className={`flex items-center gap-3 p-4 mb-2 rounded border ${
                snapshot.isDragging ? 'bg-blue-50 border-blue-300' : 'bg-gray-50 border-gray-200 hover:border-gray-300'
              } transition`}
            >
              <div {...provided.dragHandleProps} className="cursor-grab active:cursor-grabbing">
                <GripHorizontal className="w-5 h-5 text-gray-400" />
              </div>

              {editingId === item.id && editItem ? (
                <div className="flex-1 flex gap-2">
                  <Input
                    type="text"
                    value={editItem.title}
                    onChange={(e) => setEditItem({ ...editItem, title: e.target.value })}
                    placeholder="Titre"
                    className="flex-1"
                  />
                  <Input
                    type="text"
                    value={editItem.url}
                    onChange={(e) => setEditItem({ ...editItem, url: e.target.value })}
                    placeholder="URL"
                    className="flex-1"
                  />
                  <Button
                    onClick={() => handleUpdateMenuItem(item)}
                    className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700"
                  >
                    <Save className="w-4 h-4" />
                  </Button>
                  <Button
                    onClick={() => {
                      setEditingId(null);
                      setEditItem(null);
                    }}
                    className="bg-gray-600 text-white px-3 py-1 rounded hover:bg-gray-700"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ) : (
                <>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      {item.children && item.children.length > 0 && (
                        <button
                          onClick={() => toggleExpanded(item.id)}
                          className="p-0 hover:bg-gray-200 rounded"
                        >
                          {expandedItems.has(item.id) ? (
                            <ChevronDown className="w-4 h-4" />
                          ) : (
                            <ChevronRight className="w-4 h-4" />
                          )}
                        </button>
                      )}
                      <p className="font-semibold">{item.title}</p>
                    </div>
                    <p className="text-sm text-gray-600">{item.url}</p>
                    {item.children && item.children.length > 0 && (
                      <p className="text-xs text-blue-600 mt-1">{item.children.length} sous-menu(s)</p>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <Button
                      onClick={() => {
                        setEditingId(item.id);
                        setEditItem({ ...item });
                      }}
                      className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 text-sm"
                    >
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button
                      onClick={() => handleDeleteMenuItem(item.id)}
                      className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700 text-sm"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </>
              )}
            </div>

            {/* Sous-menus */}
            {item.children && item.children.length > 0 && expandedItems.has(item.id) && (
              <div className="ml-8 mb-3">
                <Droppable droppableId={`${type}-children-${item.id}`} type="SUBMENU">
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className={`p-3 rounded border-2 border-dashed ${
                        snapshot.isDraggingOver ? 'border-blue-400 bg-blue-50' : 'border-gray-300 bg-gray-50'
                      }`}
                    >
                      {item.children.map((child: any, childIndex: number) => (
                        <Draggable key={child.id} draggableId={child.id} index={childIndex}>
                          {(provided, snapshot) => (
                            <div ref={provided.innerRef} {...provided.draggableProps}>
                              <div
                                className={`flex items-center gap-3 p-3 mb-2 rounded border text-sm ${
                                  snapshot.isDragging ? 'bg-blue-100 border-blue-300' : 'bg-white border-gray-200'
                                }`}
                              >
                                <div {...provided.dragHandleProps} className="cursor-grab">
                                  <GripHorizontal className="w-4 h-4 text-gray-400" />
                                </div>
                                <div className="flex-1">
                                  <p className="font-medium">{child.title}</p>
                                  <p className="text-xs text-gray-600">{child.url}</p>
                                </div>
                                <Button
                                  onClick={() => handleDeleteMenuItem(child.id)}
                                  className="bg-red-600 text-white px-2 py-1 rounded hover:bg-red-700 text-xs"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </Button>
                              </div>
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </div>
            )}
          </div>
        )}
      </Draggable>
    ));
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-2">Gestionnaire de Menu WordPress</h1>
      <p className="text-gray-600 mb-8">Organisez vos menus par glisser-déposer. Créez des sous-menus en les glissant sous un menu parent.</p>

      {/* Nouveau Menu Item */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Ajouter un menu</h2>
        <div className="grid grid-cols-3 gap-4 mb-4">
          <Input
            type="text"
            placeholder="Titre du menu"
            value={newItem.title}
            onChange={(e) => setNewItem({ ...newItem, title: e.target.value })}
            className="p-2 border rounded"
          />
          <Input
            type="text"
            placeholder="URL (ex: /formations)"
            value={newItem.url}
            onChange={(e) => setNewItem({ ...newItem, url: e.target.value })}
            className="p-2 border rounded"
          />
          <select
            value={newItem.menu_type}
            onChange={(e) => setNewItem({ ...newItem, menu_type: e.target.value as any })}
            className="p-2 border rounded"
          >
            <option value="main">Menu Principal</option>
            <option value="footer">Pied de Page</option>
            <option value="social">Social</option>
          </select>
        </div>
        <Button
          onClick={handleAddMenuItem}
          disabled={createMutation.isPending}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          Ajouter
        </Button>
      </div>

      {/* Drag & Drop Context */}
      <DragDropContext onDragEnd={handleDragEnd}>
        {/* Menu Principal */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">📍 Menu Principal</h2>
          <Droppable droppableId="main">
            {(provided, snapshot) => (
              <div
                ref={provided.innerRef}
                {...provided.droppableProps}
                className={`p-4 rounded border-2 border-dashed ${
                  snapshot.isDraggingOver ? 'border-blue-400 bg-blue-50' : 'border-gray-300 bg-gray-50'
                }`}
              >
                {renderMenuItems(mainMenuTree, 'main', null)}
                {mainMenuTree.length === 0 && (
                  <p className="text-gray-500 text-center py-8">Aucun menu principal</p>
                )}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </div>

        {/* Menu Pied de Page */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">🔗 Menu Pied de Page</h2>
          <Droppable droppableId="footer">
            {(provided, snapshot) => (
              <div
                ref={provided.innerRef}
                {...provided.droppableProps}
                className={`p-4 rounded border-2 border-dashed ${
                  snapshot.isDraggingOver ? 'border-blue-400 bg-blue-50' : 'border-gray-300 bg-gray-50'
                }`}
              >
                {renderMenuItems(footerMenuTree, 'footer', null)}
                {footerMenuTree.length === 0 && (
                  <p className="text-gray-500 text-center py-8">Aucun menu pied de page</p>
                )}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </div>

        {/* Menu Social */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">🌐 Menu Social</h2>
          <Droppable droppableId="social">
            {(provided, snapshot) => (
              <div
                ref={provided.innerRef}
                {...provided.droppableProps}
                className={`p-4 rounded border-2 border-dashed ${
                  snapshot.isDraggingOver ? 'border-blue-400 bg-blue-50' : 'border-gray-300 bg-gray-50'
                }`}
              >
                {renderMenuItems(socialMenuTree, 'social', null)}
                {socialMenuTree.length === 0 && (
                  <p className="text-gray-500 text-center py-8">Aucun menu social</p>
                )}
                {provided.placeholder}
              </div>
            )}
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
    </div>
  );
}
