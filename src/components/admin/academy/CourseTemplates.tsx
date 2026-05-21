import React, { useState } from 'react';
import { Layout, Copy, Briefcase, Shield, Wrench, Code, Users, Lightbulb, ChevronRight, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface CourseTemplate {
  id: string;
  name: string;
  description: string;
  category: 'security' | 'technical' | 'management' | 'soft-skills' | 'it';
  icon: React.ReactNode;
  structure: {
    modules: string[];
    sections: string[];
    estimatedDuration: number;
    targetAudience: string;
    objectives: string[];
  };
  prompt: string;
}

const TEMPLATES: CourseTemplate[] = [
{
  id: 'electrical-safety',
  name: 'Sécurité électrique NF C 18-510',
  description: 'Formation complète sur les normes de sécurité électrique et habilitations',
  category: 'security',
  icon: <Shield className="w-5 h-5" />,
  structure: {
    modules: ['Fondamentaux', 'Normes et réglementations', 'Équipements de protection', 'Procédures d\'intervention', 'Évaluation'],
    sections: ['Introduction à la sécurité électrique', 'Les risques électriques', 'La norme NF C 18-510', 'Les EPI', 'Consignation et déconsignation', 'Intervention et dépannage', 'Cas pratiques'],
    estimatedDuration: 14,
    targetAudience: 'Électriciens, techniciens de maintenance',
    objectives: ['Identifier les risques électriques', 'Appliquer la norme NF C 18-510', 'Utiliser correctement les EPI', 'Réaliser une consignation']
  },
  prompt: `Génère une formation complète sur la sécurité électrique selon la norme NF C 18-510 avec:
- Une introduction aux risques électriques
- Les dispositions de la norme NF C 18-510
- Les équipements de protection individuelle
- Les procédures de consignation et déconsignation
- Des cas pratiques et mises en situation
- Un QCM d'évaluation de 10 questions`
},
{
  id: 'project-management',
  name: 'Gestion de projet agile',
  description: 'Méthodologies agiles, Scrum et Kanban pour la gestion de projet',
  category: 'management',
  icon: <Briefcase className="w-5 h-5" />,
  structure: {
    modules: ['Introduction à l\'agilité', 'Scrum', 'Kanban', 'Outils et pratiques', 'Mise en œuvre'],
    sections: ['L\'agilité: principes et valeurs', 'Le framework Scrum', 'Les rôles Scrum', 'Les cérémonies', 'Le Kanban', 'Outils de gestion', 'Cas d\'étude'],
    estimatedDuration: 8,
    targetAudience: 'Chefs de projet, product owners, équipes de développement',
    objectives: ['Comprendre les principes agiles', 'Maîtriser Scrum', 'Utiliser Kanban', 'Piloter un projet agile']
  },
  prompt: `Génère une formation sur les méthodologies agiles avec:
- Les fondamentaux de l'agilité et le manifeste agile
- Le framework Scrum (rôles, artéfacts, cérémonies)
- La méthode Kanban et ses principes
- Les outils de gestion de projet agile
- Des exemples concrets et cas d'étude
- Un QCM de validation`
},
{
  id: 'maintenance-industrielle',
  name: 'Maintenance industrielle',
  description: 'Techniques de maintenance préventive et corrective en environnement industriel',
  category: 'technical',
  icon: <Wrench className="w-5 h-5" />,
  structure: {
    modules: ['Types de maintenance', 'Diagnostic des pannes', 'Maintenance préventive', 'Outils et méthodes', 'GMAO'],
    sections: ['Introduction à la maintenance', 'Maintenance corrective vs préventive', 'Analyse des défaillances', 'Planification', 'Outils de diagnostic', 'GMAO et digitalisation'],
    estimatedDuration: 16,
    targetAudience: 'Techniciens de maintenance, responsables maintenance',
    objectives: ['Distinguer les types de maintenance', 'Diagnostiquer les pannes', 'Planifier la maintenance préventive', 'Utiliser une GMAO']
  },
  prompt: `Génère une formation sur la maintenance industrielle avec:
- Les différents types de maintenance (corrective, préventive, prédictive)
- Les techniques de diagnostic des pannes
- La planification de la maintenance préventive
- Les outils et méthodes de maintenance
- Introduction aux GMAO
- Exemples pratiques industriels`
},
{
  id: 'web-development',
  name: 'Développement web moderne',
  description: 'Formation aux technologies web actuelles: React, TypeScript, APIs',
  category: 'it',
  icon: <Code className="w-5 h-5" />,
  structure: {
    modules: ['HTML/CSS avancé', 'JavaScript moderne', 'React', 'TypeScript', 'APIs REST'],
    sections: ['HTML5 sémantique', 'CSS Grid et Flexbox', 'ES6+', 'React Hooks', 'TypeScript basics', 'Consommation d\'APIs'],
    estimatedDuration: 35,
    targetAudience: 'Développeurs, reconversion IT',
    objectives: ['Créer des interfaces modernes', 'Maîtriser React', 'Utiliser TypeScript', 'Intégrer des APIs']
  },
  prompt: `Génère une formation sur le développement web moderne avec:
- HTML5 et CSS3 avancés (Grid, Flexbox)
- JavaScript ES6+ et programmation fonctionnelle
- React: composants, hooks, state management
- TypeScript: typage, interfaces, génériques
- APIs REST et fetch
- Projet pratique fil rouge`
},
{
  id: 'leadership',
  name: 'Leadership et management d\'équipe',
  description: 'Développer ses compétences de leader et manager efficacement',
  category: 'soft-skills',
  icon: <Users className="w-5 h-5" />,
  structure: {
    modules: ['Les styles de leadership', 'Communication managériale', 'Motivation d\'équipe', 'Gestion des conflits', 'Développement des talents'],
    sections: ['Qu\'est-ce que le leadership?', 'Styles de management', 'Communication efficace', 'Feedback constructif', 'Motivation', 'Conflits', 'Coaching'],
    estimatedDuration: 12,
    targetAudience: 'Managers, chefs d\'équipe, futurs managers',
    objectives: ['Identifier son style de leadership', 'Communiquer efficacement', 'Motiver son équipe', 'Gérer les conflits']
  },
  prompt: `Génère une formation sur le leadership et management avec:
- Les différents styles de leadership
- La communication managériale
- Techniques de motivation d'équipe
- Gestion des conflits
- Coaching et développement des collaborateurs
- Mises en situation et cas pratiques`
},
{
  id: 'innovation',
  name: 'Innovation et créativité',
  description: 'Méthodes et outils pour stimuler l\'innovation en entreprise',
  category: 'soft-skills',
  icon: <Lightbulb className="w-5 h-5" />,
  structure: {
    modules: ['Culture de l\'innovation', 'Design Thinking', 'Techniques de créativité', 'Prototypage rapide', 'Pitch et présentation'],
    sections: ['L\'innovation en entreprise', 'Design Thinking', 'Brainstorming avancé', 'Mind mapping', 'Prototypage', 'Storytelling'],
    estimatedDuration: 8,
    targetAudience: 'Toute personne souhaitant développer sa créativité',
    objectives: ['Appliquer le Design Thinking', 'Utiliser des techniques de créativité', 'Prototyper rapidement', 'Pitcher une idée']
  },
  prompt: `Génère une formation sur l'innovation et la créativité avec:
- La culture de l'innovation en entreprise
- Le processus Design Thinking
- Techniques de brainstorming et idéation
- Mind mapping et visual thinking
- Prototypage rapide
- Storytelling et pitch d'idées`
}];


const getCategoryColor = (category: CourseTemplate['category']) => {
  switch (category) {
    case 'security':return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
    case 'technical':return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
    case 'management':return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
    case 'soft-skills':return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
    case 'it':return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
  }
};

const getCategoryLabel = (category: CourseTemplate['category']) => {
  switch (category) {
    case 'security':return 'Sécurité';
    case 'technical':return 'Technique';
    case 'management':return 'Management';
    case 'soft-skills':return 'Soft Skills';
    case 'it':return 'IT';
  }
};

interface CourseTemplatesProps {
  onSelectTemplate: (template: CourseTemplate) => void;
}

export const CourseTemplates: React.FC<CourseTemplatesProps> = ({ onSelectTemplate }) => {
  const [selectedTemplate, setSelectedTemplate] = useState<CourseTemplate | null>(null);
  const [filter, setFilter] = useState<CourseTemplate['category'] | 'all'>('all');

  const filteredTemplates = filter === 'all' ?
  TEMPLATES :
  TEMPLATES.filter((t) => t.category === filter);

  const handleUseTemplate = () => {
    if (selectedTemplate) {
      onSelectTemplate(selectedTemplate);
      toast.success(`Template "${selectedTemplate.name}" sélectionné`);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Layout className="w-6 h-6 text-primary" />
          <h2 className="text-xl font-bold">Templates de formation</h2>
        </div>
        
        <div className="flex gap-2">
          <Button
            variant={filter === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('all')}>
            
            Tous
          </Button>
          {(['security', 'technical', 'management', 'soft-skills', 'it'] as const).map((cat) =>
          <Button
            key={cat}
            variant={filter === cat ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter(cat)}>
            
              {getCategoryLabel(cat)}
            </Button>
          )}
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Template list */}
        <div className="lg:col-span-2 grid gap-4 sm:grid-cols-2">
          {filteredTemplates.map((template) =>
          <Card
            key={template.id}
            className={cn(
              "cursor-pointer transition-all hover:shadow-md",
              selectedTemplate?.id === template.id && "ring-2 ring-primary"
            )}
            onClick={() => setSelectedTemplate(template)}>
            
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      {template.icon}
                    </div>
                    <div>
                      <CardTitle className="text-base">{template.name}</CardTitle>
                      <Badge className={cn("mt-1", getCategoryColor(template.category))}>
                        {getCategoryLabel(template.category)}
                      </Badge>
                    </div>
                  </div>
                  {selectedTemplate?.id === template.id &&
                <Check className="w-5 h-5 text-primary" />
                }
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {template.description}
                </p>
                <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
                  <span>{template.structure.estimatedDuration}h</span>
                  <span>{template.structure.modules.length} modules</span>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Template details */}
        <div className="lg:col-span-1">
          {selectedTemplate ?
          <Card className="sticky top-4">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {selectedTemplate.icon}
                  {selectedTemplate.name}
                </CardTitle>
                <CardDescription>{selectedTemplate.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold text-sm mb-2">Public cible</h4>
                  <p className="text-sm text-muted-foreground">
                    {selectedTemplate.structure.targetAudience}
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold text-sm mb-2">Durée estimée</h4>
                  <Badge variant="outline">
                    {selectedTemplate.structure.estimatedDuration} heures
                  </Badge>
                </div>

                <div>
                  <h4 className="font-semibold text-sm mb-2">Modules ({selectedTemplate.structure.modules.length})</h4>
                  <ul className="space-y-1">
                    {selectedTemplate.structure.modules.map((module, i) =>
                  <li key={i} className="text-sm flex items-center gap-2">
                        <ChevronRight className="w-3 h-3 text-primary" />
                        {module}
                      </li>
                  )}
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold text-sm mb-2">Objectifs pédagogiques</h4>
                  <ul className="space-y-1">
                    {selectedTemplate.structure.objectives.map((obj, i) =>
                  <li key={i} className="text-sm flex items-start gap-2">
                        <Check className="w-3 h-3 text-green-600 mt-1" />
                        {obj}
                      </li>
                  )}
                  </ul>
                </div>

                <Button onClick={handleUseTemplate} className="w-full">
                  <Copy className="w-4 h-4 mr-2" />
                  Utiliser ce template
                </Button>
              </CardContent>
            </Card> :

          <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Layout className="w-12 h-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground text-center">
                  Sélectionnez un template pour voir les détails
                </p>
              </CardContent>
            </Card>
          }
        </div>
      </div>
    </div>);

};

export type { CourseTemplate };