import { useState } from "react";
import { useMenuItems, useCreateMenuItem, useUpdateMenuItem, useDeleteMenuItem, MenuItem } from "@/hooks/useMenuItems";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Edit, Trash2, Eye, EyeOff, Menu } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";

export default function AdminMenuPanel() {
  const { data: menuItems, isLoading } = useMenuItems();
  const createMenuItem = useCreateMenuItem();
  const updateMenuItem = useUpdateMenuItem();
  const deleteMenuItem = useDeleteMenuItem();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    url: "",
    menu_order: 0,
    is_active: true,
    target: "_self"
  });

  const resetForm = () => {
    setFormData({
      title: "",
      url: "",
      menu_order: 0,
      is_active: true,
      target: "_self"
    });
    setEditingItem(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingItem) {
        await updateMenuItem.mutateAsync({ id: editingItem.id, ...formData });
        toast({ title: "Élément de menu mis à jour avec succès" });
      } else {
        await createMenuItem.mutateAsync(formData);
        toast({ title: "Élément de menu créé avec succès" });
      }
      
      // Invalider le cache pour actualiser le header
      queryClient.invalidateQueries({ queryKey: ["menuItems"] });
      queryClient.invalidateQueries({ queryKey: ["liveSettings"] });
      
      setIsDialogOpen(false);
      resetForm();
    } catch (error) {
      toast({ 
        title: "Erreur", 
        description: "Une erreur est survenue", 
        variant: "destructive" 
      });
    }
  };

  const handleEdit = (item: MenuItem) => {
    setEditingItem(item);
    setFormData({
      title: item.title,
      url: item.url,
      menu_order: item.menu_order,
      is_active: item.is_active,
      target: item.target || "_self"
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Êtes-vous sûr de vouloir supprimer cet élément de menu ?")) {
      try {
        await deleteMenuItem.mutateAsync(id);
        
        // Invalider le cache pour actualiser le header
        queryClient.invalidateQueries({ queryKey: ["menuItems"] });
        
        toast({ title: "Élément de menu supprimé avec succès" });
      } catch (error) {
        toast({ 
          title: "Erreur", 
          description: "Impossible de supprimer l'élément", 
          variant: "destructive" 
        });
      }
    }
  };

  if (isLoading) return <div>Chargement...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold flex items-center gap-2">
          <Menu className="w-6 h-6" />
          Gestion du Menu
        </h2>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="w-4 h-4 mr-2" />
              Nouvel Élément
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingItem ? "Modifier l'élément" : "Créer un nouvel élément"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="title">Titre</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  required
                />
              </div>
              <div>
                <Label htmlFor="url">URL</Label>
                <Input
                  id="url"
                  value={formData.url}
                  onChange={(e) => setFormData(prev => ({ ...prev, url: e.target.value }))}
                  placeholder="ex: /ma-page"
                  required
                />
              </div>
              <div>
                <Label htmlFor="menu_order">Ordre</Label>
                <Input
                  id="menu_order"
                  type="number"
                  value={formData.menu_order}
                  onChange={(e) => setFormData(prev => ({ ...prev, menu_order: parseInt(e.target.value) || 0 }))}
                />
              </div>
              <div>
                <Label htmlFor="target">Cible</Label>
                <Select 
                  value={formData.target} 
                  onValueChange={(value) => setFormData(prev => ({ ...prev, target: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="_self">Même fenêtre</SelectItem>
                    <SelectItem value="_blank">Nouvelle fenêtre</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="is_active"
                  checked={formData.is_active}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_active: checked }))}
                />
                <Label htmlFor="is_active">Élément actif</Label>
              </div>
              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Annuler
                </Button>
                <Button type="submit" disabled={createMenuItem.isPending || updateMenuItem.isPending}>
                  {editingItem ? "Mettre à jour" : "Créer"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {menuItems?.map((item: MenuItem) => (
          <Card key={item.id}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                {item.is_active ? (
                  <Eye className="w-4 h-4 text-green-600" />
                ) : (
                  <EyeOff className="w-4 h-4 text-gray-400" />
                )}
                {item.title}
                <span className="text-sm text-gray-500">({item.menu_order})</span>
              </CardTitle>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={() => handleEdit(item)}>
                  <Edit className="w-4 h-4" />
                </Button>
                <Button 
                  size="sm" 
                  variant="destructive" 
                  onClick={() => handleDelete(item.id)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">URL: {item.url}</p>
              <p className="text-sm text-gray-600">Cible: {item.target}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
