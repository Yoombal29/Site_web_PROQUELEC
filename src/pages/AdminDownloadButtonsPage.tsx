import { useDownloadButtons } from '../hooks/useDownloadButtons';
import { DownloadButtonAdminForm } from '../components/DownloadButtonAdminForm';
import { ConfigurableDownloadButton } from '../components/ConfigurableDownloadButton';
import { useState } from 'react';
import {
  Plus, Edit2, Trash2, Settings2,
  ChevronLeft, Loader2, ClipboardList } from
'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

export default function AdminDownloadButtonsPage() {
  const { buttons, loading, error, upsertButton, deleteButton } = useDownloadButtons();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);

  const handleEdit = (id: string) => {
    setEditingId(id);
    setIsAdding(false);
  };

  const handleCancel = () => {
    setEditingId(null);
    setIsAdding(false);
  };

  const onSave = async (config: DownloadButtonConfig) => {
    try {
      await upsertButton(config);
      toast.success("Bouton configuré avec succès !");
      handleCancel();
    } catch (err: unknown) {
      toast.error(`Erreur: ${err.message}`);
    }
  };

  const onDelete = async (id: string) => {
    if (confirm("Supprimer définitivement ce bouton ?")) {
      try {
        await deleteButton(id);
        toast.success("Bouton supprimé.");
      } catch (err: unknown) {
        toast.error("Erreur lors de la suppression.");
      }
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header Panneau */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b pb-6">
        <div>
          <h2 className="text-3xl font-black text-proqblue flex items-center gap-3">
            <ClipboardList className="text-proqblue" />
            Gestion des Boutons de Téléchargement
          </h2>
          <p className="text-slate-500 mt-1">Configurez des boutons intelligents liés à vos ressources industrielles.</p>
        </div>
        {!isAdding && !editingId &&
        <Button onClick={() => setIsAdding(true)} className="bg-proqblue hover:bg-proqblue/90 h-12 px-6 rounded-xl font-bold shadow-lg">
            <Plus className="mr-2 h-5 w-5" /> Ajouter un bouton
          </Button>
        }
      </div>

      {/* Zone Formulaire (Mode Ajout ou Édition) */}
      {(isAdding || editingId) &&
      <div className="max-w-3xl mx-auto space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <Button variant="ghost" size="sm" onClick={handleCancel} className="text-slate-500">
              <ChevronLeft className="h-4 w-4 mr-1" /> Retour à la liste
            </Button>
          </div>
          <DownloadButtonAdminForm
          buttonConfig={buttons.find((b) => b.id === editingId)}
          onSave={onSave}
          onCancel={handleCancel} aria-label="Action" />
        
        </div>
      }

      {/* Liste des Boutons */}
      {!isAdding && !editingId &&
      <div className="space-y-6">
          {loading ?
        <div className="h-64 flex flex-col items-center justify-center text-slate-400">
              <Loader2 className="animate-spin h-10 w-10 mb-4" />
              <p>Synchronisation des configurations...</p>
            </div> :
        buttons.length === 0 ?
        <div className="bg-white border-2 border-dashed border-slate-200 rounded-3xl p-16 text-center">
              <div className="bg-slate-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                <Settings2 className="h-10 w-10 text-slate-300" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Aucun bouton configuré</h3>
              <p className="text-slate-500 mb-8 max-w-sm mx-auto">Commencez par créer votre premier bouton de téléchargement pour vos fiches techniques.</p>
              <Button onClick={() => setIsAdding(true)} variant="outline" className="rounded-xl border-slate-200">
                Lancer la première config
              </Button>
            </div> :

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {buttons.map((btn) =>
          <Card key={btn.id} className="group overflow-hidden border-slate-200 hover:border-proqblue/30 transition-all rounded-2xl shadow-sm hover:shadow-md">
                  <CardContent className="p-0">
                    <div className="flex flex-col md:flex-row">
                      {/* Section Prévisualisation */}
                      <div className="md:w-56 bg-slate-50 p-6 flex items-center justify-center border-b md:border-b-0 md:border-r border-slate-100">
                        <ConfigurableDownloadButton buttonConfig={btn} aria-label="Action" />
                      </div>

                      {/* Section Infos */}
                      <div className="flex-grow p-6">
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <h4 className="font-bold text-slate-900 text-lg">{btn.title}</h4>
                            <div className="flex gap-2 mt-2">
                              <Badge variant="secondary" className="font-mono text-[10px] uppercase">
                                {btn.bucket}
                              </Badge>
                              {!btn.visible &&
                        <Badge variant="outline" className="text-red-500 border-red-100 bg-red-50 text-[10px]">
                                  MASQUÉ
                                </Badge>
                        }
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <button
                        onClick={() => handleEdit(btn.id)}
                        className="p-2 text-slate-400 hover:text-proqblue hover:bg-blue-50 rounded-lg transition-colors" aria-label="Action">
                        
                              <Edit2 className="h-4 w-4" />
                            </button>
                            <button
                        onClick={() => onDelete(btn.id)}
                        className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors" aria-label="Action">
                        
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>

                        <div className="space-y-1.5 border-t pt-4">
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Chemin Technique</p>
                          <p className="text-sm font-medium text-slate-600 truncate bg-slate-50 px-2.5 py-1.5 rounded-md border border-slate-100">
                            {btn.path}
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
          )}
            </div>
        }
        </div>
      }
    </div>);

}