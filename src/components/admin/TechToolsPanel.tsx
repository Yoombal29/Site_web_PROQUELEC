import { useState, useEffect, useCallback } from "react";
import {
  Wrench, Plus, Edit, Trash2, Eye, EyeOff,
  Save, X, Search, Loader2, Check, Shield,
  Zap, Building2, User, FileText, Droplet,
  BarChart3, BookOpen, Calculator, Cable,
  TrendingDown
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger
} from "@/components/ui/dialog";
import {
  Table, TableHeader, TableBody, TableHead, TableRow, TableCell
} from "@/components/ui/table";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiFetch } from "@/lib/api-client";

interface TechTool {
  id: string;
  name: string;
  description: string;
  icon: string;
  route: string;
  roles: string[];
  is_paid: boolean;
  price: number;
  is_active: boolean;
}

const DEFAULT_TOOLS: TechTool[] = [
  {
    id: "calc-section-cables",
    name: "Calculateur de section de câbles",
    description: "Calcule la section optimale des conducteurs électriques selon la norme NS 01-001",
    icon: "Cable",
    route: "/tools/cable-section",
    roles: ["electricien", "entreprise", "membre", "admin"],
    is_paid: false,
    price: 0,
    is_active: true,
  },
  {
    id: "simulateur-consommation",
    name: "Simulateur de consommation",
    description: "Simule la consommation électrique d'un logement ou d'une entreprise",
    icon: "BarChart3",
    route: "/tools/consumption",
    roles: ["membre", "entreprise", "admin"],
    is_paid: false,
    price: 0,
    is_active: true,
  },
  {
    id: "guide-protection-differentielle",
    name: "Guide de protection différentielle",
    description: "Guide interactif sur les dispositifs différentiels (30mA, type A, AC, etc.)",
    icon: "Shield",
    route: "/tools/differential-guide",
    roles: ["electricien", "entreprise", "membre", "admin"],
    is_paid: false,
    price: 0,
    is_active: true,
  },
  {
    id: "checklist-ns-01-001",
    name: "Checklist de conformité NS 01-001",
    description: "Checklist complète de conformité à la norme sénégalaise NS 01-001",
    icon: "FileText",
    route: "/tools/ns01-checklist",
    roles: ["electricien", "entreprise", "admin"],
    is_paid: true,
    price: 15000,
    is_active: true,
  },
  {
    id: "audit-energetique",
    name: "Audit énergétique en ligne",
    description: "Réalisez un audit énergétique complet de votre installation",
    icon: "Zap",
    route: "/tools/energy-audit",
    roles: ["entreprise", "admin"],
    is_paid: true,
    price: 25000,
    is_active: true,
  },
  {
    id: "generateur-schema-unifilaire",
    name: "Générateur de schéma unifilaire",
    description: "Génère un schéma unifilaire conforme aux normes en vigueur",
    icon: "Droplet",
    route: "/tools/single-line-diagram",
    roles: ["electricien", "admin"],
    is_paid: true,
    price: 20000,
    is_active: true,
  },
  {
    id: "bibliotheque-technique-pdf",
    name: "Bibliothèque technique PDF",
    description: "Accès à une bibliothèque de documents techniques et normatifs",
    icon: "BookOpen",
    route: "/tools/tech-library",
    roles: ["electricien", "entreprise", "membre", "admin"],
    is_paid: true,
    price: 10000,
    is_active: true,
  },
  {
    id: "calculateur-chute-tension",
    name: "Calculateur de chute de tension",
    description: "Calcule la chute de tension dans les circuits électriques",
    icon: "TrendingDown",
    route: "/tools/voltage-drop",
    roles: ["electricien", "entreprise", "membre", "admin"],
    is_paid: false,
    price: 0,
    is_active: true,
  },
];

const ROLE_OPTIONS = [
  { value: "electricien", label: "Électricien" },
  { value: "entreprise", label: "Entreprise" },
  { value: "membre", label: "Membre" },
  { value: "admin", label: "Admin" },
];

const ICON_OPTIONS = [
  { value: "Cable", label: "Câble" },
  { value: "BarChart3", label: "Graphique" },
  { value: "Shield", label: "Bouclier" },
  { value: "FileText", label: "Document" },
  { value: "Zap", label: "Éclair" },
  { value: "Droplet", label: "Goutte" },
  { value: "BookOpen", label: "Livre" },
  { value: "TrendingDown", label: "Tendance" },
  { value: "Calculator", label: "Calculatrice" },
  { value: "Wrench", label: "Clé" },
  { value: "Building2", label: "Bâtiment" },
  { value: "User", label: "Utilisateur" },
];

export default function TechToolsPanel() {
  const { toast } = useToast();
  const [tools, setTools] = useState<TechTool[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTool, setEditingTool] = useState<TechTool | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    icon: "Cable",
    route: "",
    roles: [] as string[],
    is_paid: false,
    price: 0,
  });

  const fetchTools = useCallback(async () => {
    try {
      const data = await apiFetch("/api/tech-tools");
      setTools(data || []);
    } catch {
      // Fallback: use default tools if API not available
      setTools(DEFAULT_TOOLS);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTools();
  }, [fetchTools]);

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      icon: "Cable",
      route: "",
      roles: [],
      is_paid: false,
      price: 0,
    });
    setEditingTool(null);
  };

  const handleEdit = (tool: TechTool) => {
    setEditingTool(tool);
    setFormData({
      name: tool.name,
      description: tool.description,
      icon: tool.icon,
      route: tool.route,
      roles: tool.roles,
      is_paid: tool.is_paid,
      price: tool.price,
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      const payload = {
        ...formData,
        roles: formData.roles,
        is_paid: formData.is_paid,
        price: formData.is_paid ? formData.price : 0,
      };

      if (editingTool) {
        await apiFetch(`/api/tech-tools/${editingTool.id}`, {
          method: "PUT",
          body: JSON.stringify(payload),
        });
        toast({ title: "Outil technique mis à jour avec succès" });
      } else {
        await apiFetch("/api/tech-tools", {
          method: "POST",
          body: JSON.stringify(payload),
        });
        toast({ title: "Outil technique créé avec succès" });
      }

      setIsDialogOpen(false);
      resetForm();
      fetchTools();
    } catch {
      toast({
        title: "Erreur",
        description: "Impossible de sauvegarder l'outil",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleActive = async (tool: TechTool) => {
    try {
      await apiFetch(`/api/tech-tools/${tool.id}`, {
        method: "PUT",
        body: JSON.stringify({ ...tool, is_active: !tool.is_active }),
      });
      setTools((prev) =>
        prev.map((t) => (t.id === tool.id ? { ...t, is_active: !t.is_active } : t))
      );
      toast({
        title: tool.is_active ? "Outil désactivé" : "Outil activé",
      });
    } catch {
      toast({
        title: "Erreur",
        description: "Impossible de modifier le statut",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer cet outil technique ?")) return;

    try {
      await apiFetch(`/api/tech-tools/${id}`, { method: "DELETE" });
      setTools((prev) => prev.filter((t) => t.id !== id));
      toast({ title: "Outil technique supprimé avec succès" });
    } catch {
      toast({
        title: "Erreur",
        description: "Impossible de supprimer l'outil",
        variant: "destructive",
      });
    }
  };

  const toggleRole = (role: string) => {
    setFormData((prev) => ({
      ...prev,
      roles: prev.roles.includes(role)
        ? prev.roles.filter((r) => r !== role)
        : [...prev.roles, role],
    }));
  };

  const getRoleBadgeVariant = (role: string) => {
    const variants: Record<string, string> = {
      electricien: "bg-amber-100 text-amber-800 hover:bg-amber-200",
      entreprise: "bg-blue-100 text-blue-800 hover:bg-blue-200",
      membre: "bg-green-100 text-green-800 hover:bg-green-200",
      admin: "bg-purple-100 text-purple-800 hover:bg-purple-200",
    };
    return variants[role] || "bg-gray-100 text-gray-800";
  };

  const getRoleLabel = (role: string) => {
    const labels: Record<string, string> = {
      electricien: "Électricien",
      entreprise: "Entreprise",
      membre: "Membre",
      admin: "Admin",
    };
    return labels[role] || role;
  };

  const getIconPreview = (iconName: string) => {
    const icons: Record<string, React.ReactNode> = {
      Cable: <Cable className="w-4 h-4" />,
      BarChart3: <BarChart3 className="w-4 h-4" />,
      Shield: <Shield className="w-4 h-4" />,
      FileText: <FileText className="w-4 h-4" />,
      Zap: <Zap className="w-4 h-4" />,
      Droplet: <Droplet className="w-4 h-4" />,
      BookOpen: <BookOpen className="w-4 h-4" />,
      TrendingDown: <TrendingDown className="w-4 h-4" />,
      Calculator: <Calculator className="w-4 h-4" />,
      Wrench: <Wrench className="w-4 h-4" />,
      Building2: <Building2 className="w-4 h-4" />,
      User: <User className="w-4 h-4" />,
    };
    return icons[iconName] || <Wrench className="w-4 h-4" />;
  };

  const formatPrice = (price: number, isPaid: boolean) => {
    if (!isPaid) {
      return (
        <span className="inline-flex items-center gap-1 text-green-600 font-medium">
          <Check className="w-3.5 h-3.5" />
          Gratuit
        </span>
      );
    }
    return (
      <span className="font-semibold text-amber-700">
        {price.toLocaleString("fr-FR")} FCFA
      </span>
    );
  };

  const filteredTools = tools.filter(
    (tool) =>
      tool.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tool.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 animate-spin text-proqblue" />
        <span className="ml-2 text-muted-foreground">Chargement des outils techniques...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold flex items-center gap-2">
            <Wrench className="w-6 h-6" />
            Outils techniques
          </h2>
          <p className="text-sm text-muted-foreground">
            Gérez les outils techniques accessibles par rôle, avec monétisation
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="w-4 h-4 mr-2" />
              Nouvel outil
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingTool ? "Modifier l'outil technique" : "Créer un nouvel outil technique"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <Label htmlFor="name">Nom de l'outil</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                    placeholder="Ex: Calculateur de section de câbles"
                    required
                  />
                </div>

                <div className="col-span-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                    placeholder="Description de l'outil..."
                    rows={3}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="icon">Icône</Label>
                  <Select
                    value={formData.icon}
                    onValueChange={(value) => setFormData((prev) => ({ ...prev, icon: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Choisir une icône" />
                    </SelectTrigger>
                    <SelectContent>
                      {ICON_OPTIONS.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          <span className="flex items-center gap-2">
                            {getIconPreview(opt.value)}
                            {opt.label}
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="route">Route</Label>
                  <Input
                    id="route"
                    value={formData.route}
                    onChange={(e) => setFormData((prev) => ({ ...prev, route: e.target.value }))}
                    placeholder="Ex: /tools/cable-section"
                    required
                  />
                </div>

                <div className="col-span-2">
                  <Label>Rôles autorisés</Label>
                  <div className="flex flex-wrap gap-2 mt-1.5">
                    {ROLE_OPTIONS.map((role) => (
                      <Badge
                        key={role.value}
                        className={`cursor-pointer transition ${
                          formData.roles.includes(role.value)
                            ? getRoleBadgeVariant(role.value) + " ring-2 ring-offset-1"
                            : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                        }`}
                        onClick={() => toggleRole(role.value)}
                      >
                        {formData.roles.includes(role.value) ? (
                          <Check className="w-3 h-3 mr-1" />
                        ) : (
                          <Plus className="w-3 h-3 mr-1" />
                        )}
                        {role.label}
                      </Badge>
                    ))}
                  </div>
                  {formData.roles.length === 0 && (
                    <p className="text-xs text-amber-600 mt-1">
                      Sélectionnez au moins un rôle autorisé
                    </p>
                  )}
                </div>

                <div className="col-span-2 border-t pt-4">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <Label>Outil payant</Label>
                      <p className="text-xs text-muted-foreground">
                        Activer la monétisation de cet outil
                      </p>
                    </div>
                    <Switch
                      checked={formData.is_paid}
                      onCheckedChange={(checked) =>
                        setFormData((prev) => ({ ...prev, is_paid: checked, price: checked ? prev.price : 0 }))
                      }
                    />
                  </div>

                  {formData.is_paid && (
                    <div>
                      <Label htmlFor="price">Prix (FCFA)</Label>
                      <Input
                        id="price"
                        type="number"
                        min={0}
                        value={formData.price}
                        onChange={(e) =>
                          setFormData((prev) => ({ ...prev, price: Number(e.target.value) }))
                        }
                        placeholder="Ex: 15000"
                        required
                      />
                    </div>
                  )}
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-2 border-t">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsDialogOpen(false);
                    resetForm();
                  }}
                >
                  <X className="w-4 h-4 mr-2" />
                  Annuler
                </Button>
                <Button type="submit" disabled={isSaving || formData.roles.length === 0}>
                  {isSaving ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4 mr-2" />
                  )}
                  {editingTool ? "Mettre à jour" : "Créer l'outil"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search */}
      <div className="bg-card border border-border rounded-xl p-4">
        <div className="flex items-center gap-3">
          <Search className="w-5 h-5 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Rechercher un outil par nom ou description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 border-0 outline-none focus-visible:ring-0"
          />
        </div>
      </div>

      {/* Tools Table */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[40px]">Icône</TableHead>
              <TableHead>Nom</TableHead>
              <TableHead className="hidden md:table-cell">Description</TableHead>
              <TableHead>Rôles</TableHead>
              <TableHead>Prix</TableHead>
              <TableHead className="text-center">Actif</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredTools.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-10 text-muted-foreground">
                  Aucun outil technique trouvé
                </TableCell>
              </TableRow>
            ) : (
              filteredTools.map((tool) => (
                <TableRow key={tool.id}>
                  <TableCell>
                    <div className="w-8 h-8 bg-cyan-100 rounded-lg flex items-center justify-center">
                      {getIconPreview(tool.icon)}
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="font-medium">{tool.name}</span>
                  </TableCell>
                  <TableCell className="hidden md:table-cell text-sm text-muted-foreground max-w-[250px] truncate">
                    {tool.description}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {tool.roles.map((role) => (
                        <Badge key={role} className={`text-xs ${getRoleBadgeVariant(role)}`}>
                          {getRoleLabel(role)}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>{formatPrice(tool.price, tool.is_paid)}</TableCell>
                  <TableCell className="text-center">
                    <Switch
                      checked={tool.is_active}
                      onCheckedChange={() => handleToggleActive(tool)}
                    />
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEdit(tool)}
                        title="Modifier"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(tool.id)}
                        title="Supprimer"
                        className="text-red-500 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Summary */}
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>
          {filteredTools.length} outil{filteredTools.length !== 1 ? "s" : ""} technique
          {filteredTools.length !== tools.length && ` (sur ${tools.length})`}
        </span>
        <span>
          {tools.filter((t) => t.is_paid).length} payant
          {tools.filter((t) => t.is_paid).length !== 1 ? "s" : ""} |{" "}
          {tools.filter((t) => !t.is_paid).length} gratuit
          {tools.filter((t) => !t.is_paid).length !== 1 ? "s" : ""}
        </span>
      </div>
    </div>
  );
}
