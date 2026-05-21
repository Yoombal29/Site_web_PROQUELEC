import { useState } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  GripVertical,
  Plus,
  Trash2,

  Eye,


  Type,
  Layout as LayoutIcon,
  Palette,
  Move } from
'lucide-react';


interface VisualEditorProps {
  sections: SectionContent[];
  onSectionsChange: (sections: SectionContent[]) => void;
}

/**
 * ÉDITEUR VISUEL DRAG & DROP
 * 
 * Fonctionnalités :
 * - ✅ Glisser-déposer les sections
 * - ✅ Édition inline des propriétés
 * - ✅ Ajout/suppression de sections
 * - ✅ Réorganisation visuelle
 * - ✅ Modification des styles
 */
export default function VisualPageEditor({ sections, onSectionsChange }: VisualEditorProps) {
  const [selectedSection, setSelectedSection] = useState<string | null>(null);
  const [editMode, setEditMode] = useState<'structure' | 'content' | 'style'>('structure');

  // Gestion du drag & drop
  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    const items = Array.from(sections);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    // Mise à jour de l'ordre
    const reordered = items.map((item, index) => ({
      ...item,
      order: index
    }));

    onSectionsChange(reordered);
  };

  // Ajout d'une nouvelle section
  const addNewSection = (type: SectionContent['type']) => {
    const newSection: SectionContent = {
      id: `section-${Date.now()}`,
      type,
      title: 'Nouvelle Section',
      subtitle: 'Cliquez pour éditer',
      visible: true,
      order: sections.length,
      styles: {
        padding: '80px 0',
        backgroundColor: '#ffffff'
      }
    };

    onSectionsChange([...sections, newSection]);
  };

  // Suppression d'une section
  const deleteSection = (id: string) => {
    onSectionsChange(sections.filter((s) => s.id !== id));
  };

  // Mise à jour d'une section
  const updateSection = (id: string, updates: Partial<SectionContent>) => {
    onSectionsChange(
      sections.map((s) => s.id === id ? { ...s, ...updates } : s)
    );
  };

  const selectedSectionData = sections.find((s) => s.id === selectedSection);

  return (
    <div className="grid grid-cols-12 gap-6 h-full">
            {/* Sidebar gauche - Liste des sections */}
            <div className="col-span-3 border-r overflow-y-auto">
                <div className="p-4 border-b bg-slate-50">
                    <h3 className="font-bold text-sm mb-3">📦 SECTIONS</h3>

                    {/* Boutons d'ajout rapide */}
                    <div className="space-y-2">
                        <Button
              size="sm"
              variant="outline"
              className="w-full justify-start text-xs"
              onClick={() => addNewSection('text-image')}>
              
                            <Plus className="w-3 h-3 mr-2" />
                            Texte + Image
                        </Button>
                        <Button
              size="sm"
              variant="outline"
              className="w-full justify-start text-xs"
              onClick={() => addNewSection('features-list')}>
              
                            <Plus className="w-3 h-3 mr-2" />
                            Liste Features
                        </Button>
                        <Button
              size="sm"
              variant="outline"
              className="w-full justify-start text-xs"
              onClick={() => addNewSection('stats')}>
              
                            <Plus className="w-3 h-3 mr-2" />
                            Statistiques
                        </Button>
                    </div>
                </div>

                {/* Liste drag & drop */}
                <DragDropContext onDragEnd={handleDragEnd}>
                    <Droppable droppableId="sections">
                        {(provided) =>
            <div {...provided.droppableProps} ref={provided.innerRef} className="p-4 space-y-2">
                                {sections.map((section, index) =>
              <Draggable key={section.id} draggableId={section.id} index={index}>
                                        {(provided, snapshot) =>
                <div
                  ref={provided.innerRef}
                  {...provided.draggableProps}
                  className={`
                          group relative border rounded-lg p-3 bg-white cursor-pointer
                          hover:border-blue-400 hover:shadow-md transition-all
                          ${selectedSection === section.id ? 'border-blue-500 shadow-lg ring-2 ring-blue-200' : ''}
                          ${snapshot.isDragging ? 'shadow-2xl ring-4 ring-blue-300' : ''}
                        `}
                  onClick={() => setSelectedSection(section.id)}>
                  
                                                {/* Handle de drag */}
                                                <div
                    {...provided.dragHandleProps}
                    className="absolute left-1 top-1/2 -translate-y-1/2 cursor-grab active:cursor-grabbing">
                    
                                                    <GripVertical className="w-4 h-4 text-slate-400" />
                                                </div>

                                                {/* Contenu */}
                                                <div className="pl-6">
                                                    <div className="flex items-center justify-between mb-1">
                                                        <span className="text-xs font-mono bg-slate-100 px-2 py-0.5 rounded">
                                                            {section.type}
                                                        </span>
                                                        <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteSection(section.id);
                        }}
                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                        title="Supprimer la section"
                        aria-label="Supprimer la section">
                        
                                                            <Trash2 className="w-3 h-3 text-red-500" />
                                                        </button>
                                                    </div>
                                                    <p className="text-sm font-semibold truncate">
                                                        {section.title || 'Sans titre'}
                                                    </p>
                                                    <p className="text-xs text-slate-500 truncate">
                                                        {section.subtitle || ''}
                                                    </p>
                                                </div>

                                                {/* Indicateur de visibilité */}
                                                {!section.visible &&
                  <div className="absolute top-1 right-1">
                                                        <Eye className="w-3 h-3 text-slate-400" />
                                                    </div>
                  }
                                            </div>
                }
                                    </Draggable>
              )}
                                {provided.placeholder}
                            </div>
            }
                    </Droppable>
                </DragDropContext>
            </div>

            {/* Zone centrale - Éditeur de propriétés */}
            <div className="col-span-5 overflow-y-auto">
                {selectedSectionData ?
        <div className="p-6 space-y-6">
                        {/* Titre de la section */}
                        <div>
                            <h2 className="text-2xl font-bold mb-1">{selectedSectionData.title}</h2>
                            <p className="text-sm text-slate-500">Type: {selectedSectionData.type}</p>
                        </div>

                        {/* Tabs de mode d'édition */}
                        <div className="flex gap-2 border-b">
                            <button
              onClick={() => setEditMode('content')}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${editMode === 'content' ?
              'border-blue-600 text-blue-600' :
              'border-transparent text-slate-600 hover:text-slate-900'}`
              }>
              
                                <Type className="w-4 h-4 inline mr-2" />
                                Contenu
                            </button>
                            <button
              onClick={() => setEditMode('style')}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${editMode === 'style' ?
              'border-blue-600 text-blue-600' :
              'border-transparent text-slate-600 hover:text-slate-900'}`
              }>
              
                                <Palette className="w-4 h-4 inline mr-2" />
                                Styles
                            </button>
                            <button
              onClick={() => setEditMode('structure')}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${editMode === 'structure' ?
              'border-blue-600 text-blue-600' :
              'border-transparent text-slate-600 hover:text-slate-900'}`
              }>
              
                                <LayoutIcon className="w-4 h-4 inline mr-2" />
                                Structure
                            </button>
                        </div>

                        {/* Contenu selon le mode */}
                        {editMode === 'content' &&
          <Card>
                                <CardHeader>
                                    <CardTitle className="text-base">📝 Éditer le Contenu</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div>
                                        <Label htmlFor="title">Titre</Label>
                                        <Input
                  id="title"
                  value={selectedSectionData.title || ''}
                  onChange={(e) => updateSection(selectedSectionData.id, { title: e.target.value })}
                  placeholder="Titre de la section" />
                
                                    </div>
                                    <div>
                                        <Label htmlFor="subtitle">Sous-titre</Label>
                                        <Input
                  id="subtitle"
                  value={selectedSectionData.subtitle || ''}
                  onChange={(e) => updateSection(selectedSectionData.id, { subtitle: e.target.value })}
                  placeholder="Sous-titre" />
                
                                    </div>
                                    <div>
                                        <Label htmlFor="description">Description</Label>
                                        <Textarea
                  id="description"
                  value={selectedSectionData.description || ''}
                  onChange={(e) => updateSection(selectedSectionData.id, { description: e.target.value })}
                  placeholder="Description longue..."
                  rows={4} />
                
                                    </div>
                                    <div>
                                        <Label htmlFor="badge">Badge</Label>
                                        <Input
                  id="badge"
                  value={selectedSectionData.badge || ''}
                  onChange={(e) => updateSection(selectedSectionData.id, { badge: e.target.value })}
                  placeholder="NOUVEAU" />
                
                                    </div>

                                    {/* Support pour les Features (Spécifique à features-list) */}
                                    {(selectedSectionData.type === 'features-list' || selectedSectionData.features) &&
              <div className="pt-4 border-t">
                                            <div className="flex items-center justify-between mb-4">
                                                <Label className="font-bold text-slate-900">✨ Liste des Caractéristiques</Label>
                                                <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      const currentFeatures = selectedSectionData.features || [];
                      updateSection(selectedSectionData.id, {
                        features: [...currentFeatures, { title: 'Nouvelle feature', description: 'Description', icon: 'Zap' }]
                      });
                    }}>
                    
                                                    <Plus className="w-3 h-3 mr-2" /> Ajouter
                                                </Button>
                                            </div>
                                            <div className="space-y-4">
                                                {(selectedSectionData.features || []).map((feature: unknown, idx: number) =>
                  <div key={idx} className="p-4 bg-slate-50 rounded-xl border border-slate-200 relative group/feat">
                                                        <Button
                      size="icon"
                      variant="ghost"
                      className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-white shadow-sm opacity-0 group-hover/feat:opacity-100 transition-opacity"
                      onClick={() => {
                        const newFeatures = [...selectedSectionData.features];
                        newFeatures.splice(idx, 1);
                        updateSection(selectedSectionData.id, { features: newFeatures });
                      }}>
                      
                                                            <Trash2 className="w-3 h-3 text-red-500" />
                                                        </Button>
                                                        <div className="grid gap-3">
                                                            <Input
                        value={typeof feature === 'string' ? feature : feature.title}
                        onChange={(e) => {
                          const newFeatures: unknown[] = [...selectedSectionData.features];
                          if (typeof feature === 'string') {
                            newFeatures[idx] = e.target.value;
                          } else {
                            newFeatures[idx] = { ...feature, title: e.target.value };
                          }
                          updateSection(selectedSectionData.id, { features: newFeatures });
                        }}
                        placeholder="Titre de la feature"
                        className="font-bold h-8"
                        title="Titre de la caractéristique" />
                      
                                                            {typeof feature !== 'string' &&
                      <Textarea
                        value={feature.description || ''}
                        onChange={(e) => {
                          const newFeatures: unknown[] = [...selectedSectionData.features];
                          newFeatures[idx] = { ...feature, description: e.target.value };
                          updateSection(selectedSectionData.id, { features: newFeatures });
                        }}
                        placeholder="Description..."
                        rows={2}
                        className="text-xs"
                        title="Description de la caractéristique" />

                      }
                                                        </div>
                                                    </div>
                  )}
                                            </div>
                                        </div>
              }
                                </CardContent>
                            </Card>
          }

                        {editMode === 'style' &&
          <Card>
                                <CardHeader>
                                    <CardTitle className="text-base">🎨 Personnaliser les Styles</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <Label htmlFor="bgColor">Couleur de fond</Label>
                                            <Input
                    id="bgColor"
                    type="color"
                    value={selectedSectionData.styles?.backgroundColor || '#ffffff'}
                    onChange={(e) => updateSection(selectedSectionData.id, {
                      styles: { ...selectedSectionData.styles, backgroundColor: e.target.value }
                    })} />
                  
                                        </div>
                                        <div>
                                            <Label htmlFor="textColor">Couleur du texte</Label>
                                            <Input
                    id="textColor"
                    type="color"
                    value={selectedSectionData.styles?.textColor || '#000000'}
                    onChange={(e) => updateSection(selectedSectionData.id, {
                      styles: { ...selectedSectionData.styles, textColor: e.target.value }
                    })} />
                  
                                        </div>
                                    </div>
                                    <div>
                                        <Label htmlFor="padding">Espacement (padding)</Label>
                                        <Input
                  id="padding"
                  value={selectedSectionData.styles?.padding || '80px 0'}
                  onChange={(e) => updateSection(selectedSectionData.id, {
                    styles: { ...selectedSectionData.styles, padding: e.target.value }
                  })}
                  placeholder="80px 0" />
                
                                    </div>
                                    <div>
                                        <Label htmlFor="borderRadius">Arrondi (border-radius)</Label>
                                        <Input
                  id="borderRadius"
                  value={selectedSectionData.styles?.borderRadius || '0'}
                  onChange={(e) => updateSection(selectedSectionData.id, {
                    styles: { ...selectedSectionData.styles, borderRadius: e.target.value }
                  })}
                  placeholder="0px" />
                
                                    </div>
                                </CardContent>
                            </Card>
          }

                        {editMode === 'structure' &&
          <Card>
                                <CardHeader>
                                    <CardTitle className="text-base">🏗️ Configurer la Structure</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div>
                                        <Label htmlFor="layout">Layout</Label>
                                        <Select
                  value={selectedSectionData.layout || 'left-right'}
                  onValueChange={(value: unknown) => updateSection(selectedSectionData.id, { layout: value })}>
                  
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="left-right">Texte à gauche, Image à droite</SelectItem>
                                                <SelectItem value="right-left">Image à gauche, Texte à droite</SelectItem>
                                                <SelectItem value="centered">Centré</SelectItem>
                                                <SelectItem value="full-width">Pleine largeur</SelectItem>
                                                <SelectItem value="grid-2">Grille 2 colonnes</SelectItem>
                                                <SelectItem value="grid-3">Grille 3 colonnes</SelectItem>
                                                <SelectItem value="grid-4">Grille 4 colonnes</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <Label htmlFor="visible">Section Visible</Label>
                                        <input
                  id="visible"
                  type="checkbox"
                  checked={selectedSectionData.visible !== false}
                  onChange={(e) => updateSection(selectedSectionData.id, { visible: e.target.checked })}
                  className="w-4 h-4"
                  title="Visibilité de la section" />
                
                                    </div>
                                </CardContent>
                            </Card>
          }
                    </div> :

        <div className="h-full flex items-center justify-center text-slate-400">
                        <div className="text-center">
                            <Move className="w-16 h-16 mx-auto mb-4 opacity-20" />
                            <p className="text-sm">Sélectionnez une section pour l'éditer</p>
                            <p className="text-xs mt-2">ou glissez-déposez pour réorganiser</p>
                        </div>
                    </div>
        }
            </div>

            {/* Panneau droit - Prévisualisation */}
            <div className="col-span-4 border-l bg-slate-50 overflow-y-auto">
                <div className="p-4 border-b bg-white sticky top-0 z-10">
                    <h3 className="font-bold text-sm flex items-center gap-2">
                        <Eye className="w-4 h-4" />
                        PRÉVISUALISATION
                    </h3>
                </div>
                <div className="p-4">
                    {selectedSectionData ?
          <div
            className="border rounded-lg overflow-hidden shadow-sm"
            style={{
              backgroundColor: selectedSectionData.styles?.backgroundColor || '#ffffff',
              color: selectedSectionData.styles?.textColor || '#000000',
              padding: selectedSectionData.styles?.padding || '40px 20px',
              borderRadius: selectedSectionData.styles?.borderRadius || '0'
            }}>
            
                            {selectedSectionData.badge &&
            <span className="text-xs font-bold bg-blue-100 text-blue-800 px-3 py-1 rounded-full inline-block mb-3">
                                    {selectedSectionData.badge}
                                </span>
            }
                            <h2 className="text-2xl font-bold mb-2">{selectedSectionData.title}</h2>
                            {selectedSectionData.subtitle &&
            <p className="text-lg opacity-70 mb-4">{selectedSectionData.subtitle}</p>
            }
                            {selectedSectionData.description &&
            <p className="opacity-60">{selectedSectionData.description}</p>
            }
                        </div> :

          <div className="text-center text-slate-400 py-20">
                            Aucune section sélectionnée
                        </div>
          }
                </div>
            </div>
        </div>);

}