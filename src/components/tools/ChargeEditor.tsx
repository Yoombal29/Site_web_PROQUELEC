/**
 * ⚡ ChargeEditor — Éditeur de Charges Électriques
 *
 * Interface pour définir et gérer les charges connectées aux nœuds récepteurs
 * selon NF C 15-100 et normes associées.
 */

import React, { useState } from 'react';
import { Plus, Trash2, Edit3, Zap, Lightbulb, Wrench, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';



interface ChargeEditorProps {
  nodeId: string;
  charges: Charge[];
  onAddCharge: (charge: Omit<Charge, 'id' | 'courantNominal'>) => void;
  onUpdateCharge: (chargeId: string, updates: Partial<Omit<Charge, 'id'>>) => void;
  onRemoveCharge: (chargeId: string) => void;
  onClose?: () => void; // Optionnel pour fermer l'éditeur
}

// Fonction utilitaire pour calculer le courant
const calculateCurrent = (puissance: number, tension: number, cosPhi: number): number => {
  return puissance / (tension * cosPhi);
};

export const ChargeEditor: React.FC<ChargeEditorProps> = ({
  nodeId,
  charges,
  onAddCharge,
  onUpdateCharge,
  onRemoveCharge,
  onClose
}) => {
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showPresets, setShowPresets] = useState(false);
  const [formData, setFormData] = useState({
    nom: '',
    puissance: 0,
    tension: 230, // Défaut monophasé
    cosPhi: 1.0, // Facteur de puissance
    type: 'MONOPHASE' as 'MONOPHASE' | 'TRIPHASE' | 'DC',
    categorie: 'FORCE' as 'FORCE' | 'ECLAIRAGE' | 'SPECIALISE'
  });

  // Presets de charges courantes
  const chargePresets = {
    ECLAIRAGE: [
    { nom: 'Éclairage LED Bureau', puissance: 150, cosPhi: 1.0 },
    { nom: 'Éclairage fluorescent', puissance: 80, cosPhi: 0.95 },
    { nom: 'Éclairage halogène', puissance: 200, cosPhi: 1.0 },
    { nom: 'Éclairage néon', puissance: 120, cosPhi: 0.9 }],

    FORCE: [
    { nom: 'Ordinateur portable', puissance: 65, cosPhi: 0.95 },
    { nom: 'Ordinateur fixe', puissance: 300, cosPhi: 0.9 },
    { nom: 'Imprimante', puissance: 200, cosPhi: 0.9 },
    { nom: 'Climatisation mobile', puissance: 800, cosPhi: 0.85 },
    { nom: 'Ventilateur', puissance: 50, cosPhi: 0.95 }],

    SPECIALISE: [
    { nom: 'Réfrigérateur', puissance: 120, cosPhi: 0.85 },
    { nom: 'Congélateur', puissance: 150, cosPhi: 0.85 },
    { nom: 'Micro-ondes', puissance: 800, cosPhi: 0.95 },
    { nom: 'Lave-linge', puissance: 2000, cosPhi: 0.8 },
    { nom: 'Sèche-linge', puissance: 2500, cosPhi: 0.85 }]

  };

  const applyPreset = (preset: unknown) => {
    setFormData({
      ...formData,
      nom: preset.nom,
      puissance: preset.puissance,
      cosPhi: preset.cosPhi
    });
    setShowPresets(false);
  };

  // Validation des données
  const validateChargeData = (data: typeof formData): string[] => {
    const errors: string[] = [];

    if (!data.nom.trim()) {
      errors.push("Le nom de la charge est requis");
    }

    if (data.puissance <= 0) {
      errors.push("La puissance doit être supérieure à 0");
    }

    if (data.tension <= 0) {
      errors.push("La tension doit être supérieure à 0");
    }

    if (data.cosPhi < 0.1 || data.cosPhi > 1.0) {
      errors.push("Le facteur de puissance doit être entre 0.1 et 1.0");
    }

    const courantCalcule = calculateCurrent(data.puissance, data.tension, data.cosPhi);
    if (courantCalcule > 63) {
      errors.push("Courant calculé trop élevé (>63A) - vérifier les valeurs");
    }

    return errors;
  };

  const validationErrors = validateChargeData(formData);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (editingId) {
      // Modification
      onUpdateCharge(editingId, formData);
      setEditingId(null);
    } else {
      // Ajout
      onAddCharge(formData);
      setIsAdding(false);
    }

    // Reset form
    setFormData({
      nom: '',
      puissance: 0,
      tension: 230,
      cosPhi: 1.0,
      type: 'MONOPHASE',
      categorie: 'FORCE'
    });
  };

  const handleCancel = () => {
    setIsAdding(false);
    setEditingId(null);
    setFormData({
      nom: '',
      puissance: 0,
      tension: 230,
      cosPhi: 1.0,
      type: 'MONOPHASE',
      categorie: 'FORCE'
    });
  };

  const handleEdit = (charge: Charge) => {
    setFormData({
      nom: charge.nom,
      puissance: charge.puissance,
      tension: charge.tension,
      cosPhi: charge.cosPhi,
      type: charge.type,
      categorie: charge.categorie
    });
    setEditingId(charge.id);
    setIsAdding(true);
  };

  // Gestion automatique de la tension selon le type
  const getDefaultTension = (type: string): number => {
    switch (type) {
      case 'MONOPHASE':return 230;
      case 'TRIPHASE':return 400;
      case 'DC':return 24;
      default:return 230;
    }
  };

  const handleTypeChange = (newType: string) => {
    const newTension = getDefaultTension(newType);
    setFormData({
      ...formData,
      type: newType as unknown,
      tension: newTension
    });
  };

  const getChargeIcon = (categorie: string) => {
    switch (categorie) {
      case 'ECLAIRAGE':return <Lightbulb className="w-4 h-4" />;
      case 'FORCE':return <Wrench className="w-4 h-4" />;
      case 'SPECIALISE':return <Settings className="w-4 h-4" />;
      default:return <Zap className="w-4 h-4" />;
    }
  };

  const getTotalPower = () => charges.reduce((sum, charge) => sum + charge.puissance, 0);
  const getTotalCurrent = () => charges.reduce((sum, charge) => sum + charge.courantNominal, 0);

  return (
    <div className="space-y-4">
      {/* En-tête avec statistiques */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Zap className="w-5 h-5" />
            Charges Électriques - Nœud {nodeId}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between items-center text-sm">
            <div className="text-center">
              <span className="text-slate-500 block">Puissance totale</span>
              <div className="font-semibold text-lg text-blue-600">{getTotalPower().toFixed(0)} W</div>
            </div>
            <div className="text-center">
              <span className="text-slate-500 block">Courant total</span>
              <div className="font-semibold text-lg text-green-600">{getTotalCurrent().toFixed(1)} A</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Liste des charges existantes */}
      <div className="space-y-2">
        {charges.map((charge) =>
        <Card key={charge.id} className="p-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {getChargeIcon(charge.categorie)}
                <div>
                  <div className="font-medium">{charge.nom}</div>
                  <div className="text-sm text-slate-500">
                    {charge.puissance}W • {charge.tension}V • cosφ={charge.cosPhi}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline">
                  {charge.courantNominal.toFixed(1)}A
                </Badge>
                <Button
                size="sm"
                variant="ghost"
                onClick={() => handleEdit(charge)}>
                
                  <Edit3 className="w-4 h-4" />
                </Button>
                <Button
                size="sm"
                variant="ghost"
                onClick={() => onRemoveCharge(charge.id)}
                className="text-red-500 hover:text-red-700">
                
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </Card>
        )}
      </div>

      {/* Bouton fermer - visible seulement hors mode ajout */}
      {!isAdding && onClose &&
      <Button
        onClick={onClose}
        className="w-full"
        variant="outline">
        
          ✓ Fermer l'éditeur
        </Button>
      }

      {/* Bouton ajouter */}
      {!isAdding &&
      <Button
        onClick={() => setIsAdding(true)}
        className="w-full"
        variant="outline">
        
          <Plus className="w-4 h-4 mr-2" />
          Ajouter une charge
        </Button>
      }

      {/* Formulaire d'ajout/modification */}
      {isAdding &&
      <Card>
          <CardHeader>
            <CardTitle className="text-base">
              {editingId ? 'Modifier la charge' : 'Nouvelle charge'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Bouton presets */}
              <div className="flex gap-2">
                <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setShowPresets(!showPresets)}
                className="flex-1">
                
                  📚 Presets
                </Button>
                <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setFormData({
                  nom: '',
                  puissance: 0,
                  tension: getDefaultTension(formData.type),
                  cosPhi: 1.0,
                  type: formData.type,
                  categorie: formData.categorie
                })}>
                
                  🔄 Reset
                </Button>
              </div>

              {/* Presets - Masqué par défaut pour éviter la confusion */}
              {showPresets &&
            <Card className="border-dashed">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Charges prédéfinies</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {Object.entries(chargePresets).map(([category, presets]) =>
                <div key={category}>
                        <div className="text-xs font-medium text-slate-600 mb-2 uppercase tracking-wide">
                          {category.toLowerCase()}
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          {presets.map((preset, index) =>
                    <button
                      key={index}
                      type="button"
                      onClick={() => applyPreset(preset)}
                      className="text-left p-2 bg-slate-50 border border-slate-200 rounded-md hover:bg-blue-50 hover:border-blue-200 transition-colors text-xs" aria-label="Action">
                      
                              <div className="font-medium text-slate-800">{preset.nom}</div>
                              <div className="text-slate-500">
                                {preset.puissance}W • cosφ={preset.cosPhi}
                              </div>
                            </button>
                    )}
                        </div>
                      </div>
                )}
                  </CardContent>
                </Card>
            }

              {/* Champs organisés en grille */}
              <div className="grid grid-cols-2 gap-4">
                {/* Nom de la charge - pleine largeur */}
                <div className="col-span-2">
                  <Label htmlFor="nom">Nom de la charge</Label>
                  <Input
                  id="nom"
                  value={formData.nom}
                  onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                  placeholder="Ex: Éclairage bureau, Prise informatique..."
                  required />
                
                </div>

                {/* Puissance */}
                <div>
                  <Label htmlFor="puissance">Puissance (W)</Label>
                  <Input
                  id="puissance"
                  type="number"
                  min="0"
                  step="10"
                  value={formData.puissance}
                  onChange={(e) => setFormData({ ...formData, puissance: Number(e.target.value) })}
                  required />
                
                </div>

                {/* Tension */}
                <div>
                  <Label htmlFor="tension">Tension (V)</Label>
                  <Select
                  value={formData.tension.toString()}
                  onValueChange={(value) => setFormData({ ...formData, tension: Number(value) })}>
                  
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="230">230V Mono</SelectItem>
                      <SelectItem value="400">400V Tri</SelectItem>
                      <SelectItem value="48">48V DC</SelectItem>
                      <SelectItem value="24">24V DC</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Facteur de puissance */}
                <div>
                  <Label htmlFor="cosPhi">Facteur de puissance</Label>
                  <Input
                  id="cosPhi"
                  type="number"
                  min="0.1"
                  max="1.0"
                  step="0.01"
                  value={formData.cosPhi}
                  onChange={(e) => setFormData({ ...formData, cosPhi: Number(e.target.value) })}
                  placeholder="0.95"
                  required />
                
                </div>

                {/* Type */}
                <div>
                  <Label htmlFor="type">Type</Label>
                  <Select
                  value={formData.type}
                  onValueChange={(value: 'MONOPHASE' | 'TRIPHASE' | 'DC') => setFormData({ ...formData, type: value })}>
                  
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="MONOPHASE">Monophasé</SelectItem>
                      <SelectItem value="TRIPHASE">Triphasé</SelectItem>
                      <SelectItem value="DC">Continu</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Catégorie */}
                <div>
                  <Label htmlFor="categorie">Catégorie</Label>
                  <Select
                  value={formData.categorie}
                  onValueChange={(value: 'FORCE' | 'ECLAIRAGE' | 'SPECIALISE') => setFormData({ ...formData, categorie: value })}>
                  
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="FORCE">Force motrice</SelectItem>
                      <SelectItem value="ECLAIRAGE">Éclairage</SelectItem>
                      <SelectItem value="SPECIALISE">Spécialisé</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Affichage du courant calculé */}
              <div className="p-3 bg-slate-50 rounded-lg">
                <div className="text-sm text-slate-600">Courant calculé:</div>
                <div className="text-lg font-semibold text-blue-600">
                  {calculateCurrent(formData.puissance, formData.tension, formData.cosPhi).toFixed(1)} A
                </div>
              </div>

              {/* Affichage des erreurs de validation */}
              {validationErrors.length > 0 &&
            <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
                  <div className="text-sm text-red-400 font-medium mb-2">Erreurs de validation:</div>
                  <ul className="text-xs text-red-300 space-y-1">
                    {validationErrors.map((error, index) =>
                <li key={index}>• {error}</li>
                )}
                  </ul>
                </div>
            }

              {/* Boutons */}
              <div className="flex gap-2">
                <Button
                type="submit"
                className="flex-1"
                disabled={validationErrors.length > 0}>
                
                  {editingId ? 'Modifier' : 'Ajouter'}
                </Button>
                <Button type="button" variant="outline" onClick={handleCancel}>
                  Annuler
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      }
    </div>);

};