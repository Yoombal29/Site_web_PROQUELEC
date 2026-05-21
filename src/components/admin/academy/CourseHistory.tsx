import React, { useState, useEffect } from 'react';
import { History, Download, Trash2, Eye, Calendar, FileText, RotateCcw, Search, Play, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { toast } from 'sonner';
import { Course } from '@/types/academy';
import { CoursePreview } from './CoursePreview';
import { PresentationMode } from './PresentationMode';
import { exportToWord, exportToPowerPoint } from '@/utils/academyExportUtils';
import { demoCourse } from '@/data/demoCourse';

const STORAGE_KEY = 'professeur-kebe-course-history';

interface HistoryEntry {
  id: string;
  course: Course;
  savedAt: Date;
  version: number;
}

interface CourseHistoryProps {
  onRestore?: (course: Course) => void;
}

export const CourseHistory: React.FC<CourseHistoryProps> = ({ onRestore }) => {
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [previewCourse, setPreviewCourse] = useState<Course | null>(null);
  const [showDemoPresentation, setShowDemoPresentation] = useState(false);

  // Load history from localStorage
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setHistory(parsed.map((h: unknown) => ({
          ...h,
          savedAt: new Date(h.savedAt),
          course: {
            ...h.course,
            generatedAt: new Date(h.course.generatedAt),
            lastModified: new Date(h.course.lastModified)
          }
        })));
      } catch (error) {
        console.error('Error loading history:', error);
      }
    }
  }, []);

  // Save history to localStorage
  const saveHistory = (newHistory: HistoryEntry[]) => {
    setHistory(newHistory);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newHistory));
  };

  const handleDelete = (id: string) => {
    const newHistory = history.filter((h) => h.id !== id);
    saveHistory(newHistory);
    toast.success('Cours supprimé de l\'historique');
  };

  const handleClearAll = () => {
    saveHistory([]);
    toast.success('Historique vidé');
  };

  const handleRestore = (entry: HistoryEntry) => {
    if (onRestore) {
      onRestore(entry.course);
      toast.success('Cours restauré');
    }
  };

  const handleExport = async (course: Course, format: 'docx' | 'pptx') => {
    try {
      if (format === 'docx') {
        await exportToWord(course);
      } else {
        await exportToPowerPoint(course);
      }
      toast.success(`Export ${format.toUpperCase()} réussi`);
    } catch (error) {
      toast.error('Erreur lors de l\'export');
    }
  };

  const filteredHistory = history.filter((h) =>
  h.course.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('fr-FR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <History className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-bold">Historique des formations</h1>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="secondary">{history.length} cours</Badge>

          {history.length > 0 &&
          <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <Trash2 className="w-4 h-4 mr-2" />
                  Vider l'historique
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Vider l'historique ?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Cette action est irréversible. Tous les cours sauvegardés seront supprimés.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Annuler</AlertDialogCancel>
                  <AlertDialogAction onClick={handleClearAll}>
                    Confirmer
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          }
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Rechercher dans l'historique..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10" />
        
      </div>

      {/* Demo Presentation Mode */}
      {showDemoPresentation &&
      <PresentationMode
        course={demoCourse}
        onClose={() => setShowDemoPresentation(false)} />

      }

      {/* History list */}
      {filteredHistory.length === 0 ?
      <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="relative mb-6">
              <History className="w-16 h-16 text-muted-foreground" />
              <Sparkles className="w-6 h-6 text-primary absolute -top-1 -right-1" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Aucun cours dans l'historique</h3>
            <p className="text-muted-foreground text-center mb-6 max-w-md">
              Les cours générés seront automatiquement sauvegardés ici.
              En attendant, découvrez le mode présentation avec notre démo interactive !
            </p>
            <Button
            onClick={() => setShowDemoPresentation(true)}
            size="lg"
            className="gap-2">
            
              <Play className="w-5 h-5" />
              Lancer la démo présentation
            </Button>
            <p className="text-xs text-muted-foreground mt-4">
              Testez les raccourcis : F=Plein écran, L=Laser, D=Dessin, G=Grille, N=Notes
            </p>
          </CardContent>
        </Card> :

      <div className="grid gap-4">
          {filteredHistory.map((entry) =>
        <Card key={entry.id} className="overflow-hidden hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg">{entry.course.title}</CardTitle>
                    <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {formatDate(entry.savedAt)}
                      </span>
                      <span className="flex items-center gap-1">
                        <FileText className="w-4 h-4" />
                        {entry.course.content.sections.length} sections
                      </span>
                      <Badge variant="outline">v{entry.version}</Badge>
                    </div>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="pt-0">
                <div className="grid grid-cols-4 gap-4 mb-4 text-sm">
                  <div className="text-center p-2 bg-muted rounded-lg">
                    <div className="font-semibold">{entry.course.modules.length}</div>
                    <div className="text-muted-foreground text-xs">Modules</div>
                  </div>
                  <div className="text-center p-2 bg-muted rounded-lg">
                    <div className="font-semibold">{entry.course.content.sections.length}</div>
                    <div className="text-muted-foreground text-xs">Sections</div>
                  </div>
                  <div className="text-center p-2 bg-muted rounded-lg">
                    <div className="font-semibold">{entry.course.content.qcm.length}</div>
                    <div className="text-muted-foreground text-xs">Questions</div>
                  </div>
                  <div className="text-center p-2 bg-muted rounded-lg">
                    <div className="font-semibold">{entry.course.documents.length}</div>
                    <div className="text-muted-foreground text-xs">Documents</div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm" onClick={() => setPreviewCourse(entry.course)}>
                        <Eye className="w-4 h-4 mr-2" />
                        Prévisualiser
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-5xl h-[80vh]">
                      <DialogHeader>
                        <DialogTitle>Prévisualisation du cours</DialogTitle>
                        <DialogDescription>
                          Visualisez le contenu complet du cours
                        </DialogDescription>
                      </DialogHeader>
                      {previewCourse &&
                  <div className="flex-1 overflow-hidden -mx-6 -mb-6">
                          <CoursePreview course={previewCourse} />
                        </div>
                  }
                    </DialogContent>
                  </Dialog>

                  {onRestore &&
              <Button variant="outline" size="sm" onClick={() => handleRestore(entry)}>
                      <RotateCcw className="w-4 h-4 mr-2" />
                      Restaurer
                    </Button>
              }

                  <Button variant="outline" size="sm" onClick={() => handleExport(entry.course, 'docx')}>
                    <Download className="w-4 h-4 mr-2" />
                    Word
                  </Button>

                  <Button variant="outline" size="sm" onClick={() => handleExport(entry.course, 'pptx')}>
                    <Download className="w-4 h-4 mr-2" />
                    PowerPoint
                  </Button>

                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Supprimer ce cours ?</AlertDialogTitle>
                        <AlertDialogDescription>
                          Cette action est irréversible.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Annuler</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleDelete(entry.id)}>
                          Supprimer
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </CardContent>
            </Card>
        )}
        </div>
      }
    </div>);

};

// Helper function to save a course to history
export const saveCourseToHistory = (course: Course) => {
  const saved = localStorage.getItem(STORAGE_KEY);
  let history: HistoryEntry[] = [];

  if (saved) {
    try {
      history = JSON.parse(saved);
    } catch (error) {
      console.error('Error parsing history:', error);
    }
  }

  // Find existing versions of this course
  const existingVersions = history.filter((h) => h.course.title === course.title);
  const newVersion = existingVersions.length > 0 ?
  Math.max(...existingVersions.map((h) => h.version)) + 1 :
  1;

  const entry: HistoryEntry = {
    id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    course,
    savedAt: new Date(),
    version: newVersion
  };

  // Keep only last 50 entries
  const newHistory = [entry, ...history].slice(0, 50);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(newHistory));

  return entry;
};