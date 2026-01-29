import { useState, useEffect } from "react";
import { useThemeSettings, useUpdateThemeSettings } from "@/hooks/useThemeSettings";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Palette, Save } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";

export default function AdminThemePanel() {
  const { data: themeSettings, isLoading } = useThemeSettings();
  const updateTheme = useUpdateThemeSettings();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    primary_color: "#2376df",
    secondary_color: "#054393",
    accent_color: "#1a73e8",
    background_color: "#f8f9fa",
    text_color: "#333333",
    font_family: "Roboto"
  });

  useEffect(() => {
    if (themeSettings) {
      setFormData({
        primary_color: themeSettings.primary_color || "#2376df",
        secondary_color: themeSettings.secondary_color || "#054393",
        accent_color: themeSettings.accent_color || "#1a73e8",
        background_color: themeSettings.background_color || "#f8f9fa",
        text_color: themeSettings.text_color || "#333333",
        font_family: themeSettings.font_family || "Roboto"
      });
    }
  }, [themeSettings]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateTheme.mutateAsync(formData);
      
      // Invalider le cache des paramètres en temps réel
      queryClient.invalidateQueries({ queryKey: ["liveSettings"] });
      
      toast({ 
        title: "Paramètres de thème mis à jour avec succès",
        description: "Les changements sont visibles immédiatement sur le site"
      });
    } catch (error) {
      toast({ 
        title: "Erreur", 
        description: "Une erreur est survenue", 
        variant: "destructive" 
      });
    }
  };

  if (isLoading) return <div>Chargement...</div>;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Palette className="w-6 h-6" />
          Paramètres de Design
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="primary_color">Couleur primaire</Label>
              <div className="flex gap-2">
                <Input
                  id="primary_color"
                  type="color"
                  value={formData.primary_color}
                  onChange={(e) => setFormData(prev => ({ ...prev, primary_color: e.target.value }))}
                  className="w-16 h-10"
                />
                <Input
                  value={formData.primary_color}
                  onChange={(e) => setFormData(prev => ({ ...prev, primary_color: e.target.value }))}
                  placeholder="#2376df"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="secondary_color">Couleur secondaire</Label>
              <div className="flex gap-2">
                <Input
                  id="secondary_color"
                  type="color"
                  value={formData.secondary_color}
                  onChange={(e) => setFormData(prev => ({ ...prev, secondary_color: e.target.value }))}
                  className="w-16 h-10"
                />
                <Input
                  value={formData.secondary_color}
                  onChange={(e) => setFormData(prev => ({ ...prev, secondary_color: e.target.value }))}
                  placeholder="#054393"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="accent_color">Couleur d'accent</Label>
              <div className="flex gap-2">
                <Input
                  id="accent_color"
                  type="color"
                  value={formData.accent_color}
                  onChange={(e) => setFormData(prev => ({ ...prev, accent_color: e.target.value }))}
                  className="w-16 h-10"
                />
                <Input
                  value={formData.accent_color}
                  onChange={(e) => setFormData(prev => ({ ...prev, accent_color: e.target.value }))}
                  placeholder="#1a73e8"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="background_color">Couleur de fond</Label>
              <div className="flex gap-2">
                <Input
                  id="background_color"
                  type="color"
                  value={formData.background_color}
                  onChange={(e) => setFormData(prev => ({ ...prev, background_color: e.target.value }))}
                  className="w-16 h-10"
                />
                <Input
                  value={formData.background_color}
                  onChange={(e) => setFormData(prev => ({ ...prev, background_color: e.target.value }))}
                  placeholder="#f8f9fa"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="text_color">Couleur du texte</Label>
              <div className="flex gap-2">
                <Input
                  id="text_color"
                  type="color"
                  value={formData.text_color}
                  onChange={(e) => setFormData(prev => ({ ...prev, text_color: e.target.value }))}
                  className="w-16 h-10"
                />
                <Input
                  value={formData.text_color}
                  onChange={(e) => setFormData(prev => ({ ...prev, text_color: e.target.value }))}
                  placeholder="#333333"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="font_family">Police de caractères</Label>
              <Select 
                value={formData.font_family} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, font_family: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Roboto">Roboto</SelectItem>
                  <SelectItem value="Inter">Inter</SelectItem>
                  <SelectItem value="Open Sans">Open Sans</SelectItem>
                  <SelectItem value="Lato">Lato</SelectItem>
                  <SelectItem value="Montserrat">Montserrat</SelectItem>
                  <SelectItem value="Poppins">Poppins</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex justify-end">
            <Button type="submit" disabled={updateTheme.isPending}>
              <Save className="w-4 h-4 mr-2" />
              Sauvegarder les paramètres
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
