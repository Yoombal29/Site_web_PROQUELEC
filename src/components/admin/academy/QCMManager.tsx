
import React, { useState } from 'react';
import { HelpCircle, Plus, Edit, Trash2, CheckCircle, X, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { QCMQuestion } from '@/types';

interface QCMSet {
  id: string;
  title: string;
  description: string;
  questions: QCMQuestion[];
  createdAt: Date;
  category: 'security' | 'technical' | 'general';
}

export const QCMManager: React.FC = () => {
  const [qcmSets, setQcmSets] = useState<QCMSet[]>([
  {
    id: '1',
    title: 'Sécurité électrique - Évaluation',
    description: 'Questions d\'évaluation sur les bases de la sécurité électrique',
    category: 'security',
    createdAt: new Date(),
    questions: [
    {
      id: '1',
      question: 'Quelle est la première règle de sécurité avant toute intervention électrique ?',
      options: [
      'Vérifier les outils',
      'Couper l\'alimentation',
      'Porter les EPI',
      'Lire la procédure'],

      correctAnswer: 1,
      explanation: 'Il est impératif de couper l\'alimentation électrique avant toute intervention pour éviter les risques d\'électrocution.'
    },
    {
      id: '2',
      question: 'Que signifie l\'acronyme EPI dans le contexte de la sécurité ?',
      options: [
      'Équipement de Protection Individuelle',
      'Évaluation des Procédures Industrielles',
      'Expertise en Prévention des Incidents',
      'Électricité et Prévention Industrielle'],

      correctAnswer: 0,
      explanation: 'EPI signifie Équipement de Protection Individuelle, ce sont les équipements destinés à protéger le travailleur.'
    }]

  }]
  );

  const [selectedQCM, setSelectedQCM] = useState<QCMSet | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isQuestionDialogOpen, setIsQuestionDialogOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<QCMQuestion | null>(null);

  const [newQCM, setNewQCM] = useState({
    title: '',
    description: '',
    category: 'general' as QCMSet['category']
  });

  const [newQuestion, setNewQuestion] = useState({
    question: '',
    options: ['', '', '', ''],
    correctAnswer: 0,
    explanation: ''
  });

  const { toast } = useToast();

  const resetQuestionForm = () => {
    setNewQuestion({
      question: '',
      options: ['', '', '', ''],
      correctAnswer: 0,
      explanation: ''
    });
    setEditingQuestion(null);
  };

  const handleCreateQCM = () => {
    if (!newQCM.title.trim()) {
      toast({
        title: "Titre requis",
        description: "Veuillez saisir un titre pour le QCM",
        variant: "destructive"
      });
      return;
    }

    const qcmSet: QCMSet = {
      id: Date.now().toString(),
      title: newQCM.title,
      description: newQCM.description,
      category: newQCM.category,
      questions: [],
      createdAt: new Date()
    };

    setQcmSets((prev) => [qcmSet, ...prev]);
    setIsCreateDialogOpen(false);
    setNewQCM({ title: '', description: '', category: 'general' });

    toast({
      title: "QCM créé",
      description: `Le QCM "${newQCM.title}" a été créé avec succès`
    });
  };

  const handleAddQuestion = () => {
    if (!selectedQCM) return;

    if (!newQuestion.question.trim() || newQuestion.options.some((opt) => !opt.trim())) {
      toast({
        title: "Champs requis",
        description: "Veuillez remplir la question et toutes les options",
        variant: "destructive"
      });
      return;
    }

    const question: QCMQuestion = {
      id: Date.now().toString(),
      question: newQuestion.question,
      options: newQuestion.options,
      correctAnswer: newQuestion.correctAnswer,
      explanation: newQuestion.explanation
    };

    if (editingQuestion) {
      // Modification d'une question existante
      setQcmSets((prev) => prev.map((qcm) => {
        if (qcm.id === selectedQCM.id) {
          return {
            ...qcm,
            questions: qcm.questions.map((q) =>
            q.id === editingQuestion.id ? { ...question, id: editingQuestion.id } : q
            )
          };
        }
        return qcm;
      }));
    } else {
      // Ajout d'une nouvelle question
      setQcmSets((prev) => prev.map((qcm) => {
        if (qcm.id === selectedQCM.id) {
          return {
            ...qcm,
            questions: [...qcm.questions, question]
          };
        }
        return qcm;
      }));
    }

    setIsQuestionDialogOpen(false);
    resetQuestionForm();

    toast({
      title: editingQuestion ? "Question modifiée" : "Question ajoutée",
      description: "La question a été ajoutée au QCM avec succès"
    });
  };

  const handleEditQuestion = (question: QCMQuestion) => {
    setEditingQuestion(question);
    setNewQuestion({
      question: question.question,
      options: [...question.options],
      correctAnswer: question.correctAnswer,
      explanation: question.explanation
    });
    setIsQuestionDialogOpen(true);
  };

  const handleDeleteQuestion = (qcmId: string, questionId: string) => {
    setQcmSets((prev) => prev.map((qcm) => {
      if (qcm.id === qcmId) {
        return {
          ...qcm,
          questions: qcm.questions.filter((q) => q.id !== questionId)
        };
      }
      return qcm;
    }));

    toast({
      title: "Question supprimée",
      description: "La question a été retirée du QCM"
    });
  };


  const handleExportQCM = (qcmId: string) => {
    const qcm = qcmSets.find((q) => q.id === qcmId);
    if (!qcm) return;

    const content = `# ${qcm.title}

${qcm.description}

${qcm.questions.map((q, index) => `
## Question ${index + 1}
${q.question}

${q.options.map((opt, i) => `${String.fromCharCode(97 + i)}) ${opt}`).join('\n')}

**Réponse correcte:** ${String.fromCharCode(97 + q.correctAnswer)}) ${q.options[q.correctAnswer]}
**Explication:** ${q.explanation}
`).join('\n')}`;

    const element = document.createElement('a');
    const file = new Blob([content], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `${qcm.title}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);

    toast({
      title: "QCM exporté",
      description: "Le QCM a été téléchargé avec succès"
    });
  };

  const getCategoryColor = (category: QCMSet['category']) => {
    switch (category) {
      case 'security':return 'bg-red-100 text-red-800';
      case 'technical':return 'bg-blue-100 text-blue-800';
      case 'general':return 'bg-gray-100 text-gray-800';
      default:return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryLabel = (category: QCMSet['category']) => {
    switch (category) {
      case 'security':return 'Sécurité';
      case 'technical':return 'Technique';
      case 'general':return 'Général';
      default:return 'Autre';
    }
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <HelpCircle className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-bold">Gestion des QCM</h1>
        </div>

        <div className="flex gap-2">
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Nouveau QCM
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Créer un nouveau QCM</DialogTitle>
                <DialogDescription>
                  Définissez les informations de base de votre questionnaire
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="qcm-title">Titre du QCM</Label>
                  <Input
                    id="qcm-title"
                    value={newQCM.title}
                    onChange={(e) => setNewQCM((prev) => ({ ...prev, title: e.target.value }))}
                    placeholder="Ex: Évaluation sécurité électrique" />
                  
                </div>
                
                <div>
                  <Label htmlFor="qcm-description">Description</Label>
                  <Textarea
                    id="qcm-description"
                    value={newQCM.description}
                    onChange={(e) => setNewQCM((prev) => ({ ...prev, description: e.target.value }))}
                    placeholder="Description du contenu et des objectifs"
                    rows={3} />
                  
                </div>

                <div>
                  <Label htmlFor="qcm-category">Catégorie</Label>
                  <Select
                    value={newQCM.category}
                    onValueChange={(value: QCMSet['category']) => setNewQCM((prev) => ({ ...prev, category: value }))}>
                    
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="general">Général</SelectItem>
                      <SelectItem value="security">Sécurité</SelectItem>
                      <SelectItem value="technical">Technique</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex gap-2 pt-4">
                  <Button onClick={handleCreateQCM} className="flex-1">
                    Créer le QCM
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setIsCreateDialogOpen(false)}>
                    
                    Annuler
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Liste des QCM */}
        <div className="lg:col-span-1 space-y-4">
          <h2 className="text-lg font-semibold">QCM disponibles</h2>
          
          {qcmSets.map((qcm) =>
          <Card
            key={qcm.id}
            className={`cursor-pointer transition-colors ${
            selectedQCM?.id === qcm.id ? 'border-primary bg-primary/5' : 'hover:bg-muted/50'}`
            }
            onClick={() => setSelectedQCM(qcm)}>
            
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-sm">{qcm.title}</CardTitle>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge className={getCategoryColor(qcm.category)}>
                        {getCategoryLabel(qcm.category)}
                      </Badge>
                      <Badge variant="outline">
                        {qcm.questions.length} questions
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardHeader>
              {qcm.description &&
            <CardContent className="pt-0">
                  <p className="text-xs text-muted-foreground line-clamp-2">
                    {qcm.description}
                  </p>
                </CardContent>
            }
            </Card>
          )}

          {qcmSets.length === 0 &&
          <Card>
              <CardContent className="flex flex-col items-center justify-center py-8">
                <HelpCircle className="h-8 w-8 text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground text-center">
                  Aucun QCM créé
                </p>
              </CardContent>
            </Card>
          }
        </div>

        {/* Détails du QCM sélectionné */}
        <div className="lg:col-span-2">
          {selectedQCM ?
          <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle>{selectedQCM.title}</CardTitle>
                    <CardDescription className="mt-2">
                      {selectedQCM.description}
                    </CardDescription>
                    <div className="flex items-center gap-2 mt-3">
                      <Badge className={getCategoryColor(selectedQCM.category)}>
                        {getCategoryLabel(selectedQCM.category)}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        Créé le {selectedQCM.createdAt.toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleExportQCM(selectedQCM.id)}>
                    
                      <Download className="h-4 w-4" />
                    </Button>
                    
                    <Dialog open={isQuestionDialogOpen} onOpenChange={setIsQuestionDialogOpen}>
                      <DialogTrigger asChild>
                        <Button size="sm" onClick={resetQuestionForm}>
                          <Plus className="h-4 w-4 mr-1" />
                          Question
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl">
                        <DialogHeader>
                          <DialogTitle>
                            {editingQuestion ? 'Modifier la question' : 'Ajouter une question'}
                          </DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div>
                            <Label htmlFor="question">Question</Label>
                            <Textarea
                            id="question"
                            value={newQuestion.question}
                            onChange={(e) => setNewQuestion((prev) => ({ ...prev, question: e.target.value }))}
                            placeholder="Saisissez votre question..."
                            rows={3} />
                          
                          </div>

                          <div className="space-y-3">
                            <Label>Options de réponse</Label>
                            {newQuestion.options.map((option, index) =>
                          <div key={index} className="flex items-center gap-3">
                                <span className="text-sm font-medium w-6">
                                  {String.fromCharCode(97 + index)})
                                </span>
                                <Input
                              value={option}
                              onChange={(e) => {
                                const newOptions = [...newQuestion.options];
                                newOptions[index] = e.target.value;
                                setNewQuestion((prev) => ({ ...prev, options: newOptions }));
                              }}
                              placeholder={`Option ${index + 1}`}
                              className="flex-1" />
                            
                                <input
                              type="radio"
                              name="correct-answer"
                              checked={newQuestion.correctAnswer === index}
                              onChange={() => setNewQuestion((prev) => ({ ...prev, correctAnswer: index }))}
                              className="w-4 h-4" />
                            
                              </div>
                          )}
                            <p className="text-xs text-muted-foreground">
                              Cochez la case radio pour indiquer la bonne réponse
                            </p>
                          </div>

                          <div>
                            <Label htmlFor="explanation">Explication</Label>
                            <Textarea
                            id="explanation"
                            value={newQuestion.explanation}
                            onChange={(e) => setNewQuestion((prev) => ({ ...prev, explanation: e.target.value }))}
                            placeholder="Expliquez pourquoi cette réponse est correcte..."
                            rows={3} />
                          
                          </div>

                          <div className="flex gap-2 pt-4">
                            <Button onClick={handleAddQuestion} className="flex-1">
                              {editingQuestion ? 'Modifier' : 'Ajouter'} la question
                            </Button>
                            <Button
                            variant="outline"
                            onClick={() => {
                              setIsQuestionDialogOpen(false);
                              resetQuestionForm();
                            }}>
                            
                              Annuler
                            </Button>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
              </CardHeader>

              <CardContent>
                {selectedQCM.questions.length === 0 ?
              <div className="text-center py-8">
                    <HelpCircle className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">
                      Aucune question dans ce QCM
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Cliquez sur "Question" pour ajouter des questions
                    </p>
                  </div> :

              <div className="space-y-6">
                    {selectedQCM.questions.map((question, index) =>
                <Card key={question.id} className="border-l-4 border-l-primary">
                        <CardHeader className="pb-3">
                          <div className="flex items-start justify-between">
                            <CardTitle className="text-base">
                              Question {index + 1}: {question.question}
                            </CardTitle>
                            <div className="flex gap-1">
                              <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditQuestion(question)}>
                          
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteQuestion(selectedQCM.id, question.id)}>
                          
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                            {question.options.map((option, optIndex) =>
                      <div
                        key={optIndex}
                        className={`flex items-center gap-2 p-2 rounded-lg ${
                        optIndex === question.correctAnswer ?
                        'bg-green-50 border border-green-200' :
                        'bg-muted'}`
                        }>
                        
                                {optIndex === question.correctAnswer ?
                        <CheckCircle className="h-4 w-4 text-green-600" /> :

                        <X className="h-4 w-4 text-muted-foreground" />
                        }
                                <span className="text-sm">
                                  {String.fromCharCode(97 + optIndex)}) {option}
                                </span>
                              </div>
                      )}
                          </div>
                          
                          {question.explanation &&
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                              <p className="text-sm">
                                <span className="font-medium">Explication:</span> {question.explanation}
                              </p>
                            </div>
                    }
                        </CardContent>
                      </Card>
                )}
                  </div>
              }
              </CardContent>
            </Card> :

          <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <HelpCircle className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">Sélectionnez un QCM</h3>
                <p className="text-muted-foreground text-center">
                  Choisissez un QCM dans la liste pour voir et modifier ses questions
                </p>
              </CardContent>
            </Card>
          }
        </div>
      </div>
    </div>);

};