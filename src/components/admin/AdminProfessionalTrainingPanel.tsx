
import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useProfessionalTraining, useTrainingRegistrations } from '@/hooks/useProfessionalTraining';
import { GraduationCap, Users, MapPin, Clock, Euro } from 'lucide-react';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
} from "@/components/ui/pagination";

export const AdminProfessionalTrainingPanel: React.FC = () => {
  const { data: trainings, isLoading: trainingsLoading } = useProfessionalTraining();
  const { data: registrations, isLoading: registrationsLoading } = useTrainingRegistrations();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 5;
  const filteredTrainings = useMemo(() => {
    if (!trainings) return [];
    return trainings.filter(t =>
      t.title.toLowerCase().includes(search.toLowerCase()) ||
      (t.location && t.location.toLowerCase().includes(search.toLowerCase())) ||
      (t.instructor_name && t.instructor_name.toLowerCase().includes(search.toLowerCase()))
    );
  }, [trainings, search]);
  const totalPages = useMemo(() => Math.ceil(filteredTrainings.length / pageSize), [filteredTrainings]);
  const paginatedTrainings = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredTrainings.slice(start, start + pageSize);
  }, [filteredTrainings, page]);

  const getLevelColor = (level: string | null) => {
    switch (level) {
      case 'débutant': return 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-400';
      case 'intermédiaire': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-400';
      case 'avancé': return 'bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-400';
      case 'expert': return 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-400';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getRegistrationCount = (trainingId: string) => {
    return registrations?.filter(r => r.training_id === trainingId && r.status !== 'cancelled').length || 0;
  };

  if (trainingsLoading) {
    return <div className="flex justify-center p-8">Chargement des formations...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-semibold text-primary flex items-center gap-2">
            <GraduationCap className="w-6 h-6" />
            Formations Professionnelles
          </h2>
          <p className="text-muted-foreground">Gestion des formations et inscriptions</p>
        </div>
      </div>

      {/* Statistiques rapides */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-primary">{trainings?.length || 0}</div>
            <div className="text-sm text-muted-foreground">Formations actives</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{registrations?.length || 0}</div>
            <div className="text-sm text-muted-foreground">Inscriptions totales</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
              {registrations?.filter(r => r.status === 'pending').length || 0}
            </div>
            <div className="text-sm text-muted-foreground">En attente</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {registrations?.filter(r => r.status === 'confirmed').length || 0}
            </div>
            <div className="text-sm text-muted-foreground">Confirmées</div>
          </CardContent>
        </Card>
      </div>

      {/* Recherche et liste paginée des formations */}
      <input
        type="text"
        placeholder="Rechercher par titre, lieu ou formateur..."
        value={search}
        onChange={e => { setSearch(e.target.value); setPage(1); }}
        className="mb-4 px-3 py-2 border border-border bg-background text-foreground rounded w-full max-w-xs text-sm"
      />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {paginatedTrainings.map((training) => (
          <Card key={training.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex justify-between items-start">
                <CardTitle className="text-lg">{training.title}</CardTitle>
                {training.level && (
                  <Badge className={getLevelColor(training.level)}>
                    {training.level}
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {training.description && (
                <p className="text-sm text-muted-foreground">{training.description}</p>
              )}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-gray-400" />
                  <span>{training.duration_hours}h</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-gray-400" />
                  <span>{getRegistrationCount(training.id)}/{training.max_participants}</span>
                </div>
                {training.location && (
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-gray-400" />
                    <span>{training.location}</span>
                  </div>
                )}
                {training.price && (
                  <div className="flex items-center gap-2">
                    <Euro className="w-4 h-4 text-muted-foreground/50" />
                    <span>{training.price}€</span>
                  </div>
                )}
              </div>
              {training.instructor_name && (
                <div className="text-sm">
                  <span className="font-medium">Formateur:</span> {training.instructor_name}
                </div>
              )}
              {training.prerequisites && training.prerequisites.length > 0 && (
                <div>
                  <p className="text-sm font-medium mb-2">Prérequis:</p>
                  <ul className="text-xs text-muted-foreground space-y-1">
                    {training.prerequisites.map((prereq, index) => (
                      <li key={index} className="flex items-start gap-1">
                        <span>•</span>
                        <span>{prereq}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {training.learning_objectives && training.learning_objectives.length > 0 && (
                <div>
                  <p className="text-sm font-medium mb-2">Objectifs:</p>
                  <ul className="text-xs text-muted-foreground space-y-1">
                    {training.learning_objectives.slice(0, 3).map((objective, index) => (
                      <li key={index} className="flex items-start gap-1">
                        <span>•</span>
                        <span>{objective}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              <div className="flex gap-2 pt-2">
                <Button size="sm" variant="outline">
                  Voir détails
                </Button>
                <Button size="sm" className="bg-primary hover:opacity-90 transition">
                  Gérer inscriptions
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      {totalPages > 1 && (
        <div className="flex justify-center mt-4">
          <Pagination>
            <PaginationContent>
              {Array.from({ length: totalPages }, (_, i) => (
                <PaginationItem key={i}>
                  <PaginationLink
                    isActive={page === i + 1}
                    href="#"
                    onClick={e => {
                      e.preventDefault();
                      setPage(i + 1);
                    }}
                  >
                    {i + 1}
                  </PaginationLink>
                </PaginationItem>
              ))}
            </PaginationContent>
          </Pagination>
        </div>
      )}

      {trainings?.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <GraduationCap className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
            <p className="text-muted-foreground">Aucune formation disponible</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
