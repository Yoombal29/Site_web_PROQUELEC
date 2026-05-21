import React from 'react';

import {
  Bold, Italic, Strikethrough,

  List, ListOrdered, Quote,
  Undo, Redo, LayoutGrid, Image as ImageIcon,
  AlignLeft, AlignCenter, AlignRight, AlignJustify,
  Palette, Highlighter, Underline as UnderlineIcon,
  Subscript as SubscriptIcon, Superscript as SuperscriptIcon,
  CheckSquare, Eraser, Printer,
  Table as TableIcon, Columns, Trash2, Combine,
  Search } from
'lucide-react';
import { Button } from '@/components/ui/button';

import { Toggle } from '@/components/ui/toggle';

interface DocumentToolbarProps {
  editor: unknown;
  onSearchToggle?: () => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export function DocumentToolbar({ editor, onSearchToggle, activeTab, setActiveTab }: DocumentToolbarProps) {
  if (!editor) return null;

  const renderTabContent = () => {
    switch (activeTab) {
      case 'accueil':
        return (
          <>
                        {/* Presse-papiers */}
                        <div className="ribbon-group">
                            <div className="ribbon-group-content">
                                <Button variant="ghost" className="ribbon-button-large" onClick={() => editor.chain().focus().undo().run()} disabled={!editor.can().undo()}>
                                    <Undo className="h-6 w-6" />
                                    <span>Annuler</span>
                                </Button>
                                <Button variant="ghost" className="ribbon-button-large" onClick={() => editor.chain().focus().redo().run()} disabled={!editor.can().redo()}>
                                    <Redo className="h-6 w-6" />
                                    <span>Rétablir</span>
                                </Button>
                            </div>
                            <div className="ribbon-group-label">Historique</div>
                        </div>

                        {/* Police */}
                        <div className="ribbon-group">
                            <div className="ribbon-group-content grid grid-cols-2 gap-x-1">
                                <div className="flex gap-0.5">
                                    <Toggle size="sm" pressed={editor.isActive('bold')} onPressedChange={() => editor.chain().focus().toggleBold().run()}>
                                        <Bold className="h-4 w-4" />
                                    </Toggle>
                                    <Toggle size="sm" pressed={editor.isActive('italic')} onPressedChange={() => editor.chain().focus().toggleItalic().run()}>
                                        <Italic className="h-4 w-4" />
                                    </Toggle>
                                    <Toggle size="sm" pressed={editor.isActive('underline')} onPressedChange={() => editor.chain().focus().toggleUnderline().run()}>
                                        <UnderlineIcon className="h-4 w-4" />
                                    </Toggle>
                                    <Toggle size="sm" pressed={editor.isActive('strike')} onPressedChange={() => editor.chain().focus().toggleStrike().run()}>
                                        <Strikethrough className="h-4 w-4" />
                                    </Toggle>
                                </div>
                                <div className="flex gap-0.5">
                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-proqblue" onClick={() => editor.chain().focus().setColor('#2b579a').run()}>
                                        <Palette className="h-4 w-4" />
                                    </Button>
                                    <Toggle size="sm" pressed={editor.isActive('highlight')} onPressedChange={() => editor.chain().focus().toggleHighlight().run()}>
                                        <Highlighter className="h-4 w-4" />
                                    </Toggle>
                                    <Toggle size="sm" pressed={editor.isActive('subscript')} onPressedChange={() => editor.chain().focus().toggleSubscript().run()}>
                                        <SubscriptIcon className="h-4 w-4" />
                                    </Toggle>
                                    <Toggle size="sm" pressed={editor.isActive('superscript')} onPressedChange={() => editor.chain().focus().toggleSuperscript().run()}>
                                        <SuperscriptIcon className="h-4 w-4" />
                                    </Toggle>
                                </div>
                            </div>
                            <div className="ribbon-group-label">Police</div>
                        </div>

                        {/* Paragraphe */}
                        <div className="ribbon-group">
                            <div className="ribbon-group-content flex-col items-start gap-1">
                                <div className="flex gap-0.5">
                                    <Toggle size="sm" pressed={editor.isActive({ textAlign: 'left' })} onPressedChange={() => editor.chain().focus().setTextAlign('left').run()}>
                                        <AlignLeft className="h-4 w-4" />
                                    </Toggle>
                                    <Toggle size="sm" pressed={editor.isActive({ textAlign: 'center' })} onPressedChange={() => editor.chain().focus().setTextAlign('center').run()}>
                                        <AlignCenter className="h-4 w-4" />
                                    </Toggle>
                                    <Toggle size="sm" pressed={editor.isActive({ textAlign: 'right' })} onPressedChange={() => editor.chain().focus().setTextAlign('right').run()}>
                                        <AlignRight className="h-4 w-4" />
                                    </Toggle>
                                    <Toggle size="sm" pressed={editor.isActive({ textAlign: 'justify' })} onPressedChange={() => editor.chain().focus().setTextAlign('justify').run()}>
                                        <AlignJustify className="h-4 w-4" />
                                    </Toggle>
                                </div>
                                <div className="flex gap-0.5">
                                    <Toggle size="sm" pressed={editor.isActive('bulletList')} onPressedChange={() => editor.chain().focus().toggleBulletList().run()}>
                                        <List className="h-4 w-4" />
                                    </Toggle>
                                    <Toggle size="sm" pressed={editor.isActive('orderedList')} onPressedChange={() => editor.chain().focus().toggleOrderedList().run()}>
                                        <ListOrdered className="h-4 w-4" />
                                    </Toggle>
                                    <Toggle size="sm" pressed={editor.isActive('taskList')} onPressedChange={() => editor.chain().focus().toggleTaskList().run()}>
                                        <CheckSquare className="h-4 w-4" />
                                    </Toggle>
                                </div>
                            </div>
                            <div className="ribbon-group-label">Paragraphe</div>
                        </div>

                        {/* Styles Quick Gallery */}
                        <div className="ribbon-group">
                            <div className="ribbon-group-content">
                                <div className="ribbon-gallery">
                                    <div
                    className={`ribbon-gallery-item ${editor.isActive('paragraph') ? 'active' : ''}`}
                    onClick={() => editor.chain().focus().setParagraph().run()}>
                    
                                        <span className="text-[14px]">AaBbCc</span>
                                        <span className="text-[8px] mt-1 uppercase">Normal</span>
                                    </div>
                                    <div
                    className={`ribbon-gallery-item ${editor.isActive('heading', { level: 1 }) ? 'active' : ''}`}
                    onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}>
                    
                                        <span className="text-[14px] font-bold">AaBb</span>
                                        <span className="text-[8px] mt-1 uppercase">Titre 1</span>
                                    </div>
                                    <div
                    className={`ribbon-gallery-item ${editor.isActive('heading', { level: 2 }) ? 'active' : ''}`}
                    onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}>
                    
                                        <span className="text-[12px] font-bold">AaBb</span>
                                        <span className="text-[8px] mt-1 uppercase">Titre 2</span>
                                    </div>
                                </div>
                            </div>
                            <div className="ribbon-group-label">Styles</div>
                        </div>

                        {/* Édition */}
                        <div className="ribbon-group">
                            <div className="ribbon-group-content flex-col">
                                <Button variant="ghost" size="sm" className="ribbon-button-small" onClick={() => onSearchToggle?.()}>
                                    <Search className="h-3 w-3" /> Rechercher
                                </Button>
                                <Button variant="ghost" size="sm" className="ribbon-button-small" onClick={() => editor.chain().focus().unsetAllMarks().clearNodes().run()}>
                                    <Eraser className="h-3 w-3" /> Effacer
                                </Button>
                            </div>
                            <div className="ribbon-group-label">Édition</div>
                        </div>
                    </>);

      case 'insertion':
        return (
          <>
                        <div className="ribbon-group">
                            <div className="ribbon-group-content gap-4 px-4">
                                <Button variant="ghost" className="ribbon-button-large" onClick={() => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()}>
                                    <TableIcon className="h-6 w-6" />
                                    <span>Tableau</span>
                                </Button>
                                <Button variant="ghost" className="ribbon-button-large" onClick={() => {
                  const url = window.prompt('URL de l\'image:');
                  if (url) editor.chain().focus().setImage({ src: url }).run();
                }}>
                                    <ImageIcon className="h-6 w-6" />
                                    <span>Image</span>
                                </Button>
                            </div>
                            <div className="ribbon-group-label">Illustrations</div>
                        </div>
                        {editor.isActive('table') &&
            <div className="ribbon-group">
                                <div className="ribbon-group-content gap-2">
                                    <Button variant="ghost" size="sm" onClick={() => editor.chain().focus().addColumnAfter().run()}>+ Col</Button>
                                    <Button variant="ghost" size="sm" onClick={() => editor.chain().focus().addRowAfter().run()}>+ Ligne</Button>
                                    <Button variant="ghost" size="sm" onClick={() => editor.chain().focus().mergeCells().run()}><Combine className="h-4 w-4" /></Button>
                                    <Button variant="ghost" size="sm" className="text-red-500" onClick={() => editor.chain().focus().deleteTable().run()}><Trash2 className="h-4 w-4" /></Button>
                                </div>
                                <div className="ribbon-group-label">Outils de tableau</div>
                            </div>
            }
                    </>);

      case 'conception':
        return (
          <>
                        <div className="ribbon-group">
                            <div className="ribbon-group-content gap-4 px-4">
                                <Button variant="ghost" className="ribbon-button-large">
                                    <Palette className="h-6 w-6" />
                                    <span>Thèmes</span>
                                </Button>
                                <div className="flex flex-col gap-1">
                                    <Button variant="ghost" size="sm" className="ribbon-button-small">
                                        <div className="w-3 h-3 bg-white border border-slate-300 mr-2" /> Couleur de page
                                    </Button>
                                    <Button variant="ghost" size="sm" className="ribbon-button-small">
                                        <LayoutGrid className="h-3 w-3 mr-2" /> Bordures
                                    </Button>
                                </div>
                            </div>
                            <div className="ribbon-group-label">Arrière-plan</div>
                        </div>
                    </>);

      case 'mise en page':
        return (
          <>
                        <div className="ribbon-group">
                            <div className="ribbon-group-content gap-2">
                                <Button variant="ghost" className="ribbon-button-large">
                                    <Columns className="h-6 w-6" />
                                    <span>Marges</span>
                                </Button>
                                <Button variant="ghost" className="ribbon-button-large">
                                    <RefreshCw className="h-6 w-6" />
                                    <span>Orientation</span>
                                </Button>
                                <Button variant="ghost" className="ribbon-button-large">
                                    <LayoutGrid className="h-6 w-6" />
                                    <span>Taille</span>
                                </Button>
                            </div>
                            <div className="ribbon-group-label">Mise en page</div>
                        </div>
                    </>);

      case 'références':
        return (
          <>
                        <div className="ribbon-group">
                            <div className="ribbon-group-content gap-4 px-4">
                                <Button variant="ghost" className="ribbon-button-large">
                                    <List className="h-6 w-6" />
                                    <span>Sommaire</span>
                                </Button>
                                <Button variant="ghost" className="ribbon-button-large">
                                    <Quote className="h-6 w-6" />
                                    <span>Note bas de page</span>
                                </Button>
                            </div>
                            <div className="ribbon-group-label">Table des matières</div>
                        </div>
                    </>);

      case 'révision':
        return (
          <>
                        <div className="ribbon-group">
                            <div className="ribbon-group-content gap-4 px-4">
                                <Button variant="ghost" className="ribbon-button-large">
                                    <CheckSquare className="h-6 w-6" />
                                    <span>Orthographe</span>
                                </Button>
                                <Button variant="ghost" className="ribbon-button-large">
                                    <Users className="h-6 w-6" />
                                    <span>Suivi</span>
                                </Button>
                            </div>
                            <div className="ribbon-group-label">Vérification</div>
                        </div>
                    </>);

      case 'affichage':
        return (
          <>
                        <div className="ribbon-group">
                            <div className="ribbon-group-content gap-4 px-4">
                                <Button variant="ghost" className="ribbon-button-large">
                                    <Printer className="h-6 w-6" />
                                    <span>Mode Lecture</span>
                                </Button>
                                <Button variant="ghost" className="ribbon-button-large">
                                    <LayoutGrid className="h-6 w-6" />
                                    <span>Page Web</span>
                                </Button>
                            </div>
                            <div className="ribbon-group-label">Vues</div>
                        </div>
                        <div className="ribbon-group">
                            <div className="ribbon-group-content px-4">
                                <Button variant="ghost" className="ribbon-button-large">
                                    <Search className="h-6 w-6" />
                                    <span>Zoom 100%</span>
                                </Button>
                            </div>
                            <div className="ribbon-group-label">Zoom</div>
                        </div>
                    </>);

    }
  };

  return (
    <div className="office-ribbon">
            <div className="ribbon-tabs">
                {['Accueil', 'Insertion', 'Conception', 'Mise en page', 'Références', 'Révision', 'Affichage'].map((tab) =>
        <div
          key={tab}
          className={`ribbon-tab ${activeTab === tab.toLowerCase() ? 'active' : ''}`}
          onClick={() => setActiveTab(tab.toLowerCase())}>
          
                        {tab}
                    </div>
        )}
            </div>
            <div className="ribbon-content">
                {renderTabContent()}
            </div>
        </div>);

}