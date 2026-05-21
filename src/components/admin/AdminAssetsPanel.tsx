
import React, { useState } from 'react';
import {
  FileText,
  Plus,
  Search,
  Filter,

  MoreVertical,
  Edit,
  Trash2,
  DollarSign,

  ShieldCheck,

  Clock,



  Star,
  Brain } from

'lucide-react';
import { expertRag } from '@/lib/expert-rag.service';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter } from
'@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger } from
"@/components/ui/dropdown-menu";
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useAssets, useCreateAsset, useUpdateAsset, useDeleteAsset, Asset } from '@/hooks/useAssets';
import { toast } from 'sonner';

const AdminAssetsPanel = () => {
  const { data: assets, isLoading } = useAssets();
  const createAsset = useCreateAsset();
  const updateAsset = useUpdateAsset();
  const deleteAsset = useDeleteAsset();

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedAsset, setSelectedAsset] = useState<Partial<Asset> | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isRenameDialogOpen, setIsRenameDialogOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");

  const handleRenameAsset = async () => {
    if (!selectedAsset?.id || !newTitle.trim()) return;

    try {
      const response = await fetch(`/api/storage/files/${selectedAsset.id}/rename`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ newName: newTitle })
      });

      if (!response.ok) throw new Error("Rename failed");

      toast.success("Fichier renommé avec succès");
      setIsRenameDialogOpen(false);
      window.location.reload();
    } catch (error) {
      toast.error("Erreur lors du renommage");
      console.error(error);
    }
  };

  const handleSaveAsset = async () => {
    if (!selectedAsset?.title || !selectedAsset?.file_url) {
      toast.error("Veuillez remplir les champs obligatoires (Titre et URL)");
      return;
    }

    try {
      let result;
      if (selectedAsset.id) {
        result = await updateAsset.mutateAsync(selectedAsset as Asset & {id: string;});
      } else {
        result = await createAsset.mutateAsync(selectedAsset);
      }

      // Auto-indexing if it's a technical document
      if (selectedAsset.category === 'Sécurité' || selectedAsset.category === 'Réglementation') {
        toast.promise(expertRag.ingest({
          title: selectedAsset.title,
          content: selectedAsset.description || "",
          type: 'norm'
        }), {
          loading: 'Indexage expert en cours...',
          success: 'Document absorbé par le Cerveau PROQUELEC',
          error: 'Échec de l\'indexage'
        });
      }

      setIsDialogOpen(false);
      setSelectedAsset(null);
    } catch (error) {

      // toast is handled in hook
    }};

  const handleBrainIndex = async (asset: Asset) => {
    toast.promise(expertRag.ingest({
      title: asset.title,
      content: asset.description || asset.title,
      type: asset.category === 'Réglementation' ? 'norm' : 'manual'
    }), {
      loading: `L'expert PROQUELEC analyse "${asset.title}"...`,
      success: 'Intelligence métier extraite avec succès',
      error: 'Erreur lors de l\'analyse'
    });
  };

  const filteredAssets = assets?.filter((asset) =>
  asset.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
  asset.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fade-in">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                        <FileText className="w-6 h-6 text-blue-600" />
                        Bibliothèque de Documents
                    </h2>
                    <p className="text-slate-500">Gérez vos guides, mementos et monétisation.</p>
                </div>

                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <Button onClick={() => setSelectedAsset({ category: 'Guides', is_premium: false, monetization_active: false })} className="bg-blue-600 hover:bg-blue-700">
                            <Plus className="w-4 h-4 mr-2" />
                            Nouveau Document
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                        <DialogHeader>
                            <DialogTitle>{selectedAsset?.id ? "Modifier le document" : "Ajouter un nouveau document"}</DialogTitle>
                        </DialogHeader>
                        <div className="grid grid-cols-2 gap-4 py-4">
                            <div className="col-span-2 space-y-2">
                                <Label>Titre du document</Label>
                                <Input
                  value={selectedAsset?.title || ""}
                  onChange={(e) => setSelectedAsset({ ...selectedAsset, title: e.target.value })}
                  placeholder="Ex: Guide Installation ERP" />
                
                            </div>
                            <div className="space-y-2">
                                <Label>Catégorie</Label>
                                <select
                className="w-full h-10 px-3 rounded-md border border-slate-200 bg-white text-sm"
                value={selectedAsset?.category || "Guides"}
                onChange={(e) => setSelectedAsset({ ...selectedAsset, category: e.target.value })}
                title="Sélectionner la catégorie du document">
                  
                                    <option value="Guides">Guides</option>
                                    <option value="Mémentos">Mémentos</option>
                                    <option value="Sécurité">Sécurité</option>
                                    <option value="Réglementation">Réglementation</option>
                                    <option value="Autre">Autre</option>
                                </select>
                            </div>
                            <div className="space-y-2">
                                <Label>Taille du fichier</Label>
                                <Input
                  value={selectedAsset?.file_size || ""}
                  onChange={(e) => setSelectedAsset({ ...selectedAsset, file_size: e.target.value })}
                  placeholder="Ex: 2.5 MB" />
                
                            </div>
                            <div className="col-span-2 space-y-2">
                                <Label>URL du fichier (ou Bucket Path)</Label>
                                <Input
                  value={selectedAsset?.file_url || ""}
                  onChange={(e) => setSelectedAsset({ ...selectedAsset, file_url: e.target.value })}
                  placeholder="Ex: /images/photo.jpg ou https://..." />
                
                                <p className="text-[10px] text-slate-400 italic">
                                    Format conseillé : <strong>bucket/nom-du-fichier.ext</strong> (ex: documents/guide.pdf)
                                </p>
                            </div>

                            <div className="col-span-2 space-y-2">
                                <Label>Commentaires / Description interne</Label>
                                <textarea
                  className="w-full min-h-[100px] p-3 rounded-md border border-slate-200 bg-white text-sm"
                  value={selectedAsset?.description || ""}
                  onChange={(e) => setSelectedAsset({ ...selectedAsset, description: e.target.value })}
                  placeholder="Notez ici les spécificités de ce document..." />
                
                            </div>

                            {selectedAsset?.id &&
              <div className="col-span-2 flex items-center gap-4 py-2 px-3 bg-slate-50 rounded-lg border border-slate-100">
                                    <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
                                        <Clock className="w-3 h-3" />
                                        Mise à jour : {new Date(selectedAsset.updated_at || "").toLocaleString()}
                                    </div>
                                    <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
                                        <ShieldCheck className="w-3 h-3 text-green-500" />
                                        ID: {selectedAsset.id.substring(0, 8)}...
                                    </div>
                                </div>
              }

                            <div className="pt-4 border-t col-span-2">
                                <h3 className="text-sm font-bold mb-4 flex items-center gap-2">
                                    <DollarSign className="w-4 h-4 text-green-600" />
                                    Paramètres de Monétisation
                                </h3>
                                <div className="grid grid-cols-2 gap-6">
                                    <div className="flex items-center justify-between p-3 border rounded-lg bg-slate-50">
                                        <div className="space-y-0.5">
                                            <Label>Document Premium</Label>
                                            <p className="text-xs text-slate-500">Badge spécial premium</p>
                                        </div>
                                        <Switch
                      checked={selectedAsset?.is_premium || false}
                      onCheckedChange={(val) => setSelectedAsset({ ...selectedAsset, is_premium: val })} />
                    
                                    </div>
                                    <div className="flex items-center justify-between p-3 border rounded-lg bg-slate-50">
                                        <div className="space-y-0.5">
                                            <Label>Activer Vente</Label>
                                            <p className="text-xs text-slate-500">Rendre l'achat obligatoire</p>
                                        </div>
                                        <Switch
                      checked={selectedAsset?.monetization_active || false}
                      onCheckedChange={(val) => setSelectedAsset({ ...selectedAsset, monetization_active: val })} />
                    
                                    </div>
                                    {selectedAsset?.monetization_active &&
                  <div className="col-span-2 space-y-2 animate-in slide-in-from-top-2">
                                            <Label>Prix (FCFA)</Label>
                                            <div className="relative">
                                                <Input
                        type="number"
                        value={selectedAsset?.price_fcfy || 0}
                        onChange={(e) => setSelectedAsset({ ...selectedAsset, price_fcfy: parseFloat(e.target.value) })}
                        className="pl-12" />
                      
                                                <span className="absolute left-4 top-2.5 text-slate-400 font-bold">FCFA</span>
                                            </div>
                                        </div>
                  }
                                </div>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Annuler</Button>
                            <Button onClick={handleSaveAsset} className="bg-blue-600">Enregistrer</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="flex items-center gap-4 bg-white p-4 rounded-xl border border-slate-200">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                    <Input
            placeholder="Rechercher par titre ou catégorie..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)} />
          
                </div>
                <Button variant="ghost" className="hidden md:flex gap-2">
                    <Filter className="w-4 h-4" />
                    Filtres
                </Button>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-200">
                                <th className="px-6 py-4 text-sm font-bold text-slate-600">Document</th>
                                <th className="px-6 py-4 text-sm font-bold text-slate-600">Catégorie</th>
                                <th className="px-6 py-4 text-sm font-bold text-slate-600">Modifié le</th>
                                <th className="px-6 py-4 text-sm font-bold text-slate-600">Statut</th>
                                <th className="px-6 py-4 text-sm font-bold text-slate-600 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {isLoading ?
              <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-slate-400">Chargement des documents...</td>
                                </tr> :
              filteredAssets?.length === 0 ?
              <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-slate-400">Aucun document trouvé.</td>
                                </tr> :
              filteredAssets?.map((asset) =>
              <tr key={asset.id} className="hover:bg-slate-50 transition-colors group">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
                                                <FileText className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <div className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors">{asset.title}</div>
                                                <div className="text-xs text-slate-400">{asset.asset_type} • {asset.file_size}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <Badge variant="secondary" className="font-medium">{asset.category}</Badge>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col text-[11px] text-slate-500">
                                            <div className="flex items-center gap-1">
                                                <Clock className="w-3 h-3" />
                                                {new Date(asset.updated_at).toLocaleDateString()}
                                            </div>
                                            <div className="font-medium text-slate-400">Par Admin</div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col gap-1">
                                            {asset.is_premium &&
                    <Badge className="bg-amber-100 text-amber-700 border-amber-200 hover:bg-amber-100 w-fit">
                                                    <Star className="w-3 h-3 mr-1 fill-amber-700" /> Premium
                                                </Badge>
                    }
                                            {asset.monetization_active ?
                    <Badge className="bg-green-100 text-green-700 border-green-200 hover:bg-green-100 w-fit">
                                                    <DollarSign className="w-3 h-3 mr-1" /> {asset.price_fcfy.toLocaleString()} FCFA
                                                </Badge> :

                    <Badge variant="outline" className="text-slate-400 w-fit">Gratuit</Badge>
                    }
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" className="h-8 w-8 p-0">
                                                    <MoreVertical className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end" className="w-48">
                                                <DropdownMenuItem onClick={() => handleBrainIndex(asset)}>
                                                    <Brain className="w-4 h-4 mr-2 text-purple-600" /> Indexer Expert
                                                </DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => {setSelectedAsset(asset);setNewTitle(asset.title);setIsRenameDialogOpen(true);}}>
                                                    <FileText className="w-4 h-4 mr-2" /> Renommer Fichier
                                                </DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => {setSelectedAsset(asset);setIsDialogOpen(true);}}>
                                                    <Edit className="w-4 h-4 mr-2" /> Modifier
                                                </DropdownMenuItem>
                                                <DropdownMenuItem className="text-red-600" onClick={() => deleteAsset.mutate(asset.id)}>
                                                    <Trash2 className="w-4 h-4 mr-2" /> Supprimer
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </td>
                                </tr>
              )}
                        </tbody>
                    </table>
                </div>
            </div>

            <Dialog open={isRenameDialogOpen} onOpenChange={setIsRenameDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Renommer le fichier</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label>Nouveau nom</Label>
                            <Input
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="Nouveau nom du fichier" />
              
                            <p className="text-xs text-slate-500">
                                L'extension sera conservée automatiquement. Ce changement renomme le fichier sur le disque.
                            </p>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsRenameDialogOpen(false)}>Annuler</Button>
                        <Button onClick={handleRenameAsset}>Renommer</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-xl border border-slate-200 flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
                        <FileText className="w-6 h-6" />
                    </div>
                    <div>
                        <div className="text-2xl font-bold">{assets?.length || 0}</div>
                        <div className="text-sm text-slate-500">Documents totaux</div>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-xl border border-slate-200 flex items-center gap-4">
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center text-green-600">
                        <DollarSign className="w-6 h-6" />
                    </div>
                    <div>
                        <div className="text-2xl font-bold text-green-600">
                            {assets?.filter((a) => a.monetization_active).length || 0}
                        </div>
                        <div className="text-sm text-slate-500">Documents payants</div>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-xl border border-slate-200 flex items-center gap-4">
                    <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center text-amber-600">
                        <Star className="w-6 h-6" />
                    </div>
                    <div>
                        <div className="text-2xl font-bold text-amber-600">
                            {assets?.filter((a) => a.is_premium).length || 0}
                        </div>
                        <div className="text-sm text-slate-500">Contenus Premium</div>
                    </div>
                </div>
            </div>
        </div>);

};

export default AdminAssetsPanel;