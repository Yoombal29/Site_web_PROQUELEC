import React, { useState } from 'react';
import { useGedWorkflow } from '@/hooks/useGedWorkflow';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { CheckCircle2, Clock, Archive, Eye, Edit2, Loader2, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

const STATE_COLORS: Record<string, string> = {
  draft: 'bg-gray-100 text-gray-800 border-gray-300',
  review: 'bg-amber-100 text-amber-800 border-amber-300',
  published: 'bg-green-100 text-green-800 border-green-300',
  archived: 'bg-slate-100 text-slate-800 border-slate-300'
};

const STATE_ICONS: Record<string, React.ReactNode> = {
  draft: <Edit2 className="w-4 h-4" />,
  review: <Clock className="w-4 h-4" />,
  published: <CheckCircle2 className="w-4 h-4" />,
  archived: <Archive className="w-4 h-4" />
};

const STATE_LABELS: Record<string, string> = {
  draft: 'Brouillon',
  review: 'En révision',
  published: 'Publié',
  archived: 'Archivé'
};

interface GedWorkflowWidgetProps {
  entityId: string;
  entityType: 'document' | 'media_file';
  showHistory?: boolean;
  showFullPage?: boolean;
}

export function GedWorkflowWidget({
  entityId,
  entityType,
  showHistory = true,
  showFullPage = false
}: GedWorkflowWidgetProps) {
  const workflow = useGedWorkflow(entityId, entityType);
  const [isTransitionDialogOpen, setIsTransitionDialogOpen] = useState(false);
  const [selectedTransition, setSelectedTransition] = useState<string | null>(null);
  const [transitionComment, setTransitionComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleTransition = async () => {
    if (!selectedTransition) return;
    
    setIsSubmitting(true);
    const success = await workflow.transitionState(selectedTransition, transitionComment);
    if (success) {
      setIsTransitionDialogOpen(false);
      setSelectedTransition(null);
      setTransitionComment('');
    }
    setIsSubmitting(false);
  };

  const containerClass = showFullPage ? 'space-y-6' : 'space-y-3';

  if (workflow.isLoading) {
    return (
      <div className={cn('flex items-center justify-center p-4', showFullPage ? 'h-40' : 'h-20')}>
        <Loader2 className="w-5 h-5 animate-spin text-blue-600 mr-2" />
        <span className="text-gray-600">Chargement du workflow...</span>
      </div>
    );
  }

  if (workflow.error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
        <div className="flex-1">
          <p className="font-semibold text-red-800">Erreur du workflow</p>
          <p className="text-sm text-red-700">{workflow.error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={containerClass}>
      {/* Current State Card */}
      <Card className={showFullPage ? '' : 'shadow-sm'}>
        <CardHeader className={showFullPage ? '' : 'pb-3'}>
          <CardTitle className={showFullPage ? 'text-lg' : 'text-base'}>État du Document</CardTitle>
        </CardHeader>
        <CardContent className={showFullPage ? '' : 'pt-0'}>
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <div className={cn(
                'flex items-center gap-2 px-3 py-2 rounded-lg border font-semibold text-sm',
                STATE_COLORS[workflow.currentState]
              )}>
                {STATE_ICONS[workflow.currentState]}
                {STATE_LABELS[workflow.currentState]}
              </div>
              <span className="text-xs text-gray-500">État actuel</span>
            </div>

            {/* Transition Buttons */}
            {workflow.availableTransitions.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {workflow.availableTransitions.map(transition => (
                  <Dialog key={transition} open={isTransitionDialogOpen && selectedTransition === transition} onOpenChange={(open) => {
                    if (!open) {
                      setSelectedTransition(null);
                      setIsTransitionDialogOpen(false);
                    }
                  }}>
                    <DialogTrigger asChild>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setSelectedTransition(transition);
                          setIsTransitionDialogOpen(true);
                        }}
                        disabled={workflow.isLoading}
                      >
                        Passer à: {STATE_LABELS[transition]}
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Confirmer la transition</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <p className="text-sm text-gray-600 mb-2">
                            Passer de <strong>{STATE_LABELS[workflow.currentState]}</strong> à <strong>{STATE_LABELS[transition]}</strong>
                          </p>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="transition-comment">Commentaire (optionnel)</Label>
                          <Textarea
                            id="transition-comment"
                            placeholder="Décrivez la raison de cette transition..."
                            value={transitionComment}
                            onChange={(e) => setTransitionComment(e.target.value)}
                            rows={3}
                            className="text-sm"
                          />
                        </div>
                        <div className="flex gap-2 justify-end">
                          <Button
                            variant="outline"
                            onClick={() => setIsTransitionDialogOpen(false)}
                            disabled={isSubmitting}
                          >
                            Annuler
                          </Button>
                          <Button
                            onClick={handleTransition}
                            disabled={isSubmitting}
                            className="bg-blue-600 hover:bg-blue-700"
                          >
                            {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                            Confirmer
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* History Section */}
      {showHistory && workflow.history.length > 0 && (
        <Card className={showFullPage ? '' : 'shadow-sm'}>
          <CardHeader className={showFullPage ? '' : 'pb-3'}>
            <CardTitle className={showFullPage ? 'text-lg' : 'text-base'}>Historique des transitions</CardTitle>
          </CardHeader>
          <CardContent className={showFullPage ? '' : 'pt-0'}>
            <ScrollArea className={showFullPage ? 'h-80' : 'h-48'}>
              <div className="space-y-3 pr-4">
                {workflow.history.map((transition) => (
                  <div key={`${transition.id}-${transition.created_at}`} className="border-l-2 border-gray-300 pl-3 py-2 text-sm">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="outline" className={cn('text-xs', STATE_COLORS[transition.from_state])}>
                        {STATE_LABELS[transition.from_state]}
                      </Badge>
                      <span className="text-gray-400">→</span>
                      <Badge variant="outline" className={cn('text-xs', STATE_COLORS[transition.to_state])}>
                        {STATE_LABELS[transition.to_state]}
                      </Badge>
                    </div>
                    {transition.comment && (
                      <p className="text-gray-600 italic my-1">"{transition.comment}"</p>
                    )}
                    <p className="text-xs text-gray-500">
                      {new Date(transition.created_at).toLocaleString('fr-FR')}
                    </p>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// Full-page GED workflow viewer
export function GedWorkflowPage({ entityId, entityType }: { entityId: string; entityType: 'document' | 'media_file' }) {
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Gestion du Workflow GED</h1>
        <GedWorkflowWidget
          entityId={entityId}
          entityType={entityType}
          showHistory={true}
          showFullPage={true}
        />
      </div>
    </div>
  );
}
