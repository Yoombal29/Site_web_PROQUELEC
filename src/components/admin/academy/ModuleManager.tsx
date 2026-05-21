
import React, { useState } from 'react';
import { Plus, Edit, Trash2, BookOpen, Clock, Target } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Module } from '@/types';

export const ModuleManager: React.FC = () => {
  const [modules, setModules] = useState<Module[]>([
  {
    id: '1',
    title: 'Sécurité électrique - Bases NF C 18-510',
    prerequisites: ['Connaissances générales en électricité'],
    knowledge: [
    'Réglementation NF C 18-510',
    'Risques électriques',
    'Équipements de protection'],

    skills: [
    'Identifier les risques électriques',
    'Utiliser les EPI appropriés',
    'Appliquer les procédures de sécurité'],

    duration: 4,
    createdAt: new Date(),
    updatedAt: new Date()
  }]
  );

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingModule, setEditingModule] = useState<Module | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    prerequisites: '',
    knowledge: '',
    skills: '',
    duration: ''
  });

  const resetForm = () => {
    setFormData({
      title: '',
      prerequisites: '',
      knowledge: '',
      skills: '',
      duration: ''
    });
    setEditingModule(null);
  };

  const handleCreateModule = () => {
    if (!formData.title.trim()) return;

    const newModule: Module = {
      id: Date.now().toString(),
      title: formData.title,
      prerequisites: formData.prerequisites.split('\n').filter((p) => p.trim()),
      knowledge: formData.knowledge.split('\n').filter((k) => k.trim()),
      skills: formData.skills.split('\n').filter((s) => s.trim()),
      duration: parseInt(formData.duration) || 1,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    setModules((prev) => [...prev, newModule]);
    setIsCreateDialogOpen(false);
    resetForm();
  };

  const handleEditModule = (module: Module) => {
    setEditingModule(module);
    setFormData({
      title: module.title,
      prerequisites: module.prerequisites.join('\n'),
      knowledge: module.knowledge.join('\n'),
      skills: module.skills.join('\n'),
      duration: module.duration.toString()
    });
  };

  const handleUpdateModule = () => {
    if (!editingModule || !formData.title.trim()) return;

    const updatedModule: Module = {
      ...editingModule,
      title: formData.title,
      prerequisites: formData.prerequisites.split('\n').filter((p) => p.trim()),
      knowledge: formData.knowledge.split('\n').filter((k) => k.trim()),
      skills: formData.skills.split('\n').filter((s) => s.trim()),
      duration: parseInt(formData.duration) || 1,
      updatedAt: new Date()
    };

    setModules((prev) => prev.map((m) => m.id === editingModule.id ? updatedModule : m));
    resetForm();
  };

  const handleDeleteModule = (id: string) => {
    setModules((prev) => prev.filter((m) => m.id !== id));
  };

  const ModuleForm = () =>
  <div className="space-y-4">
      <div>
        <Label htmlFor="title">Titre du module</Label>
        <Input
        id="title"
        value={formData.title}
        onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
        placeholder="Ex: Sécurité électrique - Bases" />
      
      </div>

      <div>
        <Label htmlFor="duration">Durée (heures)</Label>
        <Input
        id="duration"
        type="number"
        value={formData.duration}
        onChange={(e) => setFormData((prev) => ({ ...prev, duration: e.target.value }))}
        placeholder="4" />
      
      </div>

      <div>
        <Label htmlFor="prerequisites">Prérequis (un par ligne)</Label>
        <Textarea
        id="prerequisites"
        value={formData.prerequisites}
        onChange={(e) => setFormData((prev) => ({ ...prev, prerequisites: e.target.value }))}
        placeholder="Connaissances générales en électricité&#10;Formation de base en sécurité"
        rows={3} />
      
      </div>

      <div>
        <Label htmlFor="knowledge">Savoirs (un par ligne)</Label>
        <Textarea
        id="knowledge"
        value={formData.knowledge}
        onChange={(e) => setFormData((prev) => ({ ...prev, knowledge: e.target.value }))}
        placeholder="Réglementation NF C 18-510&#10;Risques électriques&#10;Équipements de protection"
        rows={4} />
      
      </div>

      <div>
        <Label htmlFor="skills">Savoir-faire (un par ligne)</Label>
        <Textarea
        id="skills"
        value={formData.skills}
        onChange={(e) => setFormData((prev) => ({ ...prev, skills: e.target.value }))}
        placeholder="Identifier les risques électriques&#10;Utiliser les EPI appropriés&#10;Appliquer les procédures de sécurité"
        rows={4} />
      
      </div>

      <div className="flex gap-2 pt-4">
        <Button
        onClick={editingModule ? handleUpdateModule : handleCreateModule}
        className="flex-1">
        
          {editingModule ? 'Mettre à jour' : 'Créer le module'}
        </Button>
        <Button
        variant="outline"
        onClick={() => {
          resetForm();
          setIsCreateDialogOpen(false);
        }}>
        
          Annuler
        </Button>
      </div>
    </div>;


  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <BookOpen className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-bold">Gestion des Modules</h1>
        </div>
        
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => resetForm()}>
              <Plus className="h-4 w-4 mr-2" />
              Nouveau Module
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Créer un nouveau module</DialogTitle>
              <DialogDescription>
                Définissez les objectifs pédagogiques et la structure de votre module
              </DialogDescription>
            </DialogHeader>
            <ModuleForm />
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-6">
        {modules.map((module) =>
        <Card key={module.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-lg">{module.title}</CardTitle>
                  <div className="flex items-center gap-4 mt-2">
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      <span className="text-sm text-muted-foreground">{module.duration}h</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Target className="h-4 w-4" />
                      <span className="text-sm text-muted-foreground">
                        {module.knowledge.length} savoirs, {module.skills.length} savoir-faire
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEditModule(module)}>
                      
                        <Edit className="h-4 w-4" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                      <DialogHeader>
                        <DialogTitle>Modifier le module</DialogTitle>
                        <DialogDescription>
                          Modifiez les informations de votre module pédagogique
                        </DialogDescription>
                      </DialogHeader>
                      <ModuleForm />
                    </DialogContent>
                  </Dialog>
                  
                  <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDeleteModule(module.id)}>
                  
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              {module.prerequisites.length > 0 &&
            <div>
                  <h4 className="font-medium mb-2">Prérequis</h4>
                  <div className="flex flex-wrap gap-1">
                    {module.prerequisites.map((prereq, index) =>
                <Badge key={index} variant="secondary" className="text-xs">
                        {prereq}
                      </Badge>
                )}
                  </div>
                </div>
            }
              
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium mb-2">Savoirs</h4>
                  <ul className="text-sm space-y-1">
                    {module.knowledge.map((item, index) =>
                  <li key={index} className="flex items-start gap-2">
                        <span className="text-primary">•</span>
                        {item}
                      </li>
                  )}
                  </ul>
                </div>
                
                <div>
                  <h4 className="font-medium mb-2">Savoir-faire</h4>
                  <ul className="text-sm space-y-1">
                    {module.skills.map((item, index) =>
                  <li key={index} className="flex items-start gap-2">
                        <span className="text-primary">•</span>
                        {item}
                      </li>
                  )}
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
        
        {modules.length === 0 &&
        <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <BookOpen className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">Aucun module créé</h3>
              <p className="text-muted-foreground text-center mb-4">
                Commencez par créer votre premier module pédagogique
              </p>
              <Button onClick={() => setIsCreateDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Créer un module
              </Button>
            </CardContent>
          </Card>
        }
      </div>
    </div>);

};