import React from 'react';
import { Plus, LayoutTemplate, Box, Trash2 } from 'lucide-react';
import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { BlockTemplate } from '@/stores/useBuilderStore';

// Draggable components (moved from BuilderPage)
const DraggableItem = ({ type, label, icon }: {type: string;label: string;icon?: React.ReactNode;}) => {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: `sidebar-item-${type}`,
    data: { type }
  });

  const style = {
    transform: CSS.Translate.toString(transform),
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className="p-3 bg-white hover:bg-blue-50 border border-slate-200 hover:border-blue-200 rounded cursor-grab active:cursor-grabbing flex items-center gap-3 transition-colors shadow-sm select-none">
      
            <div className="w-8 h-8 bg-slate-100 rounded flex items-center justify-center text-slate-500">
                {icon}
            </div>
            <span className="text-sm font-medium text-slate-700">{label}</span>
        </div>);

};

const DraggableTemplate = ({ template }: {template: BlockTemplate;}) => {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: `sidebar-template-${template.id}`,
    data: { block: template.block }
  });

  const style = {
    transform: CSS.Translate.toString(transform),
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className="p-3 bg-white hover:bg-purple-50 border border-slate-200 hover:border-purple-200 rounded cursor-grab active:cursor-grabbing flex flex-col gap-1 transition-colors shadow-sm select-none relative overflow-hidden">
      
            <div className="flex items-center gap-2 mb-1">
                <Box size={14} className="text-purple-500" />
                <span className="text-sm font-bold text-slate-800 truncate pr-4">{template.name}</span>
            </div>
            <span className="text-[10px] text-slate-400 capitalize">{template.block.type} • {new Date(template.createdAt).toLocaleDateString()}</span>
        </div>);

};

interface BuilderSidebarProps {
  templates: BlockTemplate[];
  deleteTemplate: (id: string) => void;
}

export const BuilderSidebar: React.FC<BuilderSidebarProps> = ({
  templates,
  deleteTemplate
}) => {
  return (
    <aside className="w-72 bg-white border-r border-slate-200 flex flex-col shadow-sm z-10 shrink-0">
      <div className="h-14 border-b flex items-center px-4 font-semibold text-slate-700 bg-slate-50">
        <Plus className="w-5 h-5 mr-2 text-blue-600" /> Bibliothèque
      </div>

      <Tabs defaultValue="elements" className="flex-1 flex flex-col overflow-hidden">
        <div className="px-2 pt-2 border-b bg-slate-50">
          <TabsList className="w-full grid grid-cols-2">
            <TabsTrigger value="elements" className="text-xs">Éléments</TabsTrigger>
            <TabsTrigger value="templates" className="text-xs">Modèles</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="elements" className="flex-1 overflow-y-auto p-4 space-y-2">
          <div className="uppercase text-[10px] font-bold text-slate-400 mb-2 tracking-wider">Base</div>
          <DraggableItem type="hero" label="Hero Section" icon={<LayoutTemplate size={16} />} />
          <DraggableItem type="section" label="Section Vide" icon={<Box size={16} />} />
          <DraggableItem type="text-block" label="Bloc Texte" icon={<Box size={16} />} />
          <DraggableItem type="image" label="Image Seule" icon={<Box size={16} />} />
          <DraggableItem type="html" label="Code HTML" icon={<Box size={16} />} />

          <div className="uppercase text-[10px] font-bold text-emerald-600 mb-2 mt-5 tracking-wider border-t border-slate-100 pt-4">
            🏠 Sections Page d'accueil
          </div>
          <DraggableItem type="HeroBanner" label="🎞 Carrousel Hero" icon={<LayoutTemplate size={16} />} />
          <DraggableItem type="AudienceOffers" label="🎯 Offres Audience" icon={<Box size={16} />} />
          <DraggableItem type="VisionMission" label="🎖 Vision & Mission" icon={<Box size={16} />} />
          <DraggableItem type="LandingStats" label="📊 Statistiques" icon={<Box size={16} />} />
          <DraggableItem type="LatestNews" label="📰 Actualités" icon={<Box size={16} />} />
          <DraggableItem type="PartnerLogos" label="🤝 Partenaires" icon={<Box size={16} />} />
        </TabsContent>

        <TabsContent value="templates" className="flex-1 overflow-y-auto p-4 space-y-3">
          <div className="uppercase text-[10px] font-bold text-slate-400 mb-2 tracking-wider">Mes Modèles</div>
          {templates.length === 0 && (
            <div className="text-center py-8 text-slate-400 text-xs italic border border-dashed rounded bg-slate-50">
              Aucun modèle sauvegardé.<br />
              Utilisez le panneau de droite.
            </div>
          )}
          {templates.map((tpl) => (
            <div key={tpl.id} className="group relative">
              <DraggableTemplate template={tpl} />
              <button
                className="absolute top-2 right-2 p-1 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={(e) => {e.stopPropagation();deleteTemplate(tpl.id);}}
                title="Supprimer le modèle">
                <Trash2 size={12} />
              </button>
            </div>
          ))}
        </TabsContent>
      </Tabs>
    </aside>
  );
};
