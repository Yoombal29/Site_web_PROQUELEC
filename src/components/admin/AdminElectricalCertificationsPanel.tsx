import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useElectricalCertifications, useCreateCertification } from '@/hooks/useElectricalCertifications';
import { Award, Plus, Clock, DollarSign } from 'lucide-react';

export const AdminElectricalCertificationsPanel: React.FC = () => {
  const { data: certifications, isLoading } = useElectricalCertifications();
  const createMutation = useCreateCertification();
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    description: '',
    validity_period: 24,
    required_training_hours: 40,
    certification_body: '',
    cost: '',
    requirements: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createMutation.mutateAsync({
        ...formData,
        cost: formData.cost ? parseFloat(formData.cost) : null,
        requirements: formData.requirements.split('\n').filter(r => r.trim()),
        is_active: true,
      });
      setShowForm(false);
      setFormData({
        name: '',
        code: '',
        description: '',
        validity_period: 24,
        required_training_hours: 40,
        certification_body: '',
        cost: '',
        requirements: '',
      });
    } catch (error) {
      console.error('Erreur lors de la création:', error);
    }
  };

  if (isLoading) {
    return <div className="flex justify-center p-8">Chargement des certifications...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-semibold text-primary flex items-center gap-2">
            <Award className="w-6 h-6" />
            Certifications Électriques
          </h2>
          <p className="text-muted-foreground">Gestion des certifications professionnelles</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)} className="bg-primary hover:opacity-90 transition">
          <Plus className="w-4 h-4 mr-2" />
          Nouvelle Certification
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>Nouvelle Certification</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Nom de la certification</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="code">Code</Label>
                  <Input
                    id="code"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="validity">Validité (mois)</Label>
                  <Input
                    id="validity"
                    type="number"
                    value={formData.validity_period}
                    onChange={(e) => setFormData({ ...formData, validity_period: parseInt(e.target.value) })}
                  />
                </div>
                <div>
                  <Label htmlFor="hours">Heures de formation</Label>
                  <Input
                    id="hours"
                    type="number"
                    value={formData.required_training_hours}
                    onChange={(e) => setFormData({ ...formData, required_training_hours: parseInt(e.target.value) })}
                  />
                </div>
                <div>
                  <Label htmlFor="cost">Coût (€)</Label>
                  <Input
                    id="cost"
                    type="number"
                    step="0.01"
                    value={formData.cost}
                    onChange={(e) => setFormData({ ...formData, cost: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="body">Organisme certificateur</Label>
                <Input
                  id="body"
                  value={formData.certification_body}
                  onChange={(e) => setFormData({ ...formData, certification_body: e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor="requirements">Prérequis (un par ligne)</Label>
                <Textarea
                  id="requirements"
                  value={formData.requirements}
                  onChange={(e) => setFormData({ ...formData, requirements: e.target.value })}
                  rows={4}
                />
              </div>

              <div className="flex gap-2">
                <Button type="submit" disabled={createMutation.isPending}>
                  {createMutation.isPending ? 'Création...' : 'Créer'}
                </Button>
                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                  Annuler
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {certifications?.map((cert) => (
          <Card key={cert.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="text-lg">{cert.name}</span>
                <Badge variant="secondary">{cert.code}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {cert.description && (
                <p className="text-sm text-muted-foreground">{cert.description}</p>
              )}

              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {cert.validity_period} mois
                </span>
                {cert.cost && (
                  <span className="flex items-center gap-1">
                    <DollarSign className="w-4 h-4" />
                    {cert.cost}€
                  </span>
                )}
              </div>

              <div className="space-y-2">
                <p className="text-sm font-medium">Heures de formation: {cert.required_training_hours}h</p>
                {cert.certification_body && (
                  <p className="text-sm">Organisme: {cert.certification_body}</p>
                )}
              </div>

              {cert.requirements && cert.requirements.length > 0 && (
                <div>
                  <p className="text-sm font-medium mb-2">Prérequis:</p>
                  <ul className="text-xs text-muted-foreground space-y-1">
                    {cert.requirements.map((req, index) => (
                      <li key={index} className="flex items-start gap-1">
                        <span>•</span>
                        <span>{req}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {certifications?.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <Award className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
            <p className="text-muted-foreground">Aucune certification disponible</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
