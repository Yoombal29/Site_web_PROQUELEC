import React, { useEffect } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { ComponentRegistry } from './ComponentRegistry';


export interface PageRendererProps {
  blocks: Block[];
  className?: string; // Classe CSS additionnelle
  // Props d'édition
  isEditor?: boolean;
  selectedId?: string | null;
  onSelect?: (id: string) => void;
}

// Composant Interne pour rendre un bloc individuel avec Sortable
const SortableBlockWrapper: React.FC<{
  block: Block;
  isEditor: boolean;
  isSelected: boolean;
  onSelect?: (id: string) => void;
  children: React.ReactNode;
}> = ({ block, isEditor, isSelected, onSelect, children }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: block.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1
  };

  if (!isEditor) return <>{children}</>;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`relative group transition-all duration-200 mb-1 ${isSelected ?
      'outline outline-2 outline-blue-500 z-10 shadow-lg' :
      'hover:outline hover:outline-1 hover:outline-blue-300'}`
      }
      onClick={(e) => {
        e.stopPropagation();
        if (onSelect) onSelect(block.id);
      }}>
      
            {/* Drag Handle Overlay / Label */}
            <div
        {...attributes}
        {...listeners}
        className={`absolute -top-6 left-0 px-2 py-0.5 text-[10px] font-mono text-white rounded-t flex items-center gap-2 cursor-move
                    ${isSelected ? 'bg-blue-500' : 'bg-blue-300 opacity-0 group-hover:opacity-100'}
                    transition-opacity z-20 whitespace-nowrap
                `}>
        
                <div className="w-3 h-3 flex flex-col justify-between py-0.5">
                    <div className="h-px bg-white/60 w-full" />
                    <div className="h-px bg-white/60 w-full" />
                    <div className="h-px bg-white/60 w-full" />
                </div>
                {block.type}
            </div>

            {/* Insertion indicators (visual help) */}
            <div className="absolute inset-x-0 top-0 h-1 bg-blue-500 opacity-0 group-hover:opacity-10 pointer-events-none" />
            <div className="absolute inset-x-0 bottom-0 h-1 bg-blue-500 opacity-0 group-hover:opacity-10 pointer-events-none" />

            {children}
        </div>);

};

// Helper pour extraire toutes les polices utilisées
const getUsedFonts = (blocks: Block[]): Set<string> => {
  let fonts = new Set<string>();
  if (!blocks) return fonts;

  blocks.forEach((block) => {
    if (block.style?.fontFamily && !['sans', 'serif', 'mono', 'inherit'].includes(block.style.fontFamily)) {
      fonts.add(block.style.fontFamily);
    }
    if (block.children) {
      const childFonts = getUsedFonts(block.children);
      childFonts.forEach((f) => fonts.add(f));
    }
  });
  return fonts;
};

const BuilderPageRenderer: React.FC<PageRendererProps> = ({
  blocks,
  className,
  isEditor = false,
  selectedId,
  onSelect
}) => {
  // Dynamic Font Loading
  useEffect(() => {
    const usedFonts = getUsedFonts(blocks || []);
    if (usedFonts.size > 0) {
      const fontFamilies = Array.from(usedFonts).map((f) => f.replace(/ /g, '+'));
      const linkId = 'builder-google-fonts';
      let link = document.getElementById(linkId) as HTMLLinkElement;

      if (!link && fontFamilies.length > 0) {
        link = document.createElement('link');
        link.id = linkId;
        link.rel = 'stylesheet';
        document.head.appendChild(link);
      }

      if (fontFamilies.length > 0 && link) {
        const fontQuery = fontFamilies.map((f) => `family=${f}:wght@300;400;600;700`).join('&');
        link.href = `https://fonts.googleapis.com/css2?${fontQuery}&display=swap`;
      }
    }
  }, [blocks]);

  if (!blocks || blocks.length === 0) {
    if (isEditor) {
      return (
        <div className="text-gray-400 py-10 text-center italic border-2 border-dashed border-gray-200 rounded m-4">
                    Page vide. Glissez un bloc ici.
                </div>);

    }
    return null;
  }

  return (
    <div className={`page-builder-content ${className || ''}`}>
            {blocks.map((block) => {
        const Component = ComponentRegistry[block.type] || ComponentRegistry['section'];

        if (!Component) {
          return isEditor ?
          <div key={block.id} className="text-red-500 p-4 border border-red-300 bg-red-50 mb-2 rounded">
                            [Erreur Build: Type "{block.type}" inconnu]
                        </div> :
          null;
        }

        const componentRender =
        <Component
          id={block.id}
          content={block.content}
          style={block.style}
          className={block.style?.className}
          children={
          block.children && block.children.length > 0 ?
          <BuilderPageRenderer
            blocks={block.children}
            isEditor={isEditor}
            selectedId={selectedId}
            onSelect={onSelect} /> :

          undefined
          } />;



        return (
          <SortableBlockWrapper
            key={block.id}
            block={block}
            isEditor={isEditor}
            isSelected={selectedId === block.id}
            onSelect={onSelect}>
            
                        {componentRender}
                    </SortableBlockWrapper>);

      })}
        </div>);

};


export default BuilderPageRenderer;