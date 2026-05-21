/**
 * Composant QCM interactif avec timer et scoring
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  CheckCircle2, XCircle, Clock, Award, RotateCcw,
  ChevronRight, ChevronLeft, AlertCircle, Trophy,
  BookOpen, Zap } from
'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';

import { cn } from '@/lib/utils';

interface InteractiveQCMProps {
  questions: QCMQuestion[];
  title?: string;
  timePerQuestion?: number; // en secondes
  onComplete?: (result: QCMResult) => void;
  showExplanations?: boolean;
}

export interface QCMResult {
  score: number;
  totalQuestions: number;
  percentage: number;
  timeSpent: number;
  answers: {
    questionId: string;
    selectedAnswer: number;
    correct: boolean;
    timeSpent: number;
  }[];
}

interface QuestionState {
  selectedAnswer: number | null;
  submitted: boolean;
  timeSpent: number;
}

export const InteractiveQCM: React.FC<InteractiveQCMProps> = ({
  questions,
  title = 'Évaluation des acquis',
  timePerQuestion = 60,
  onComplete,
  showExplanations = true
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [questionStates, setQuestionStates] = useState<QuestionState[]>(
    questions.map(() => ({ selectedAnswer: null, submitted: false, timeSpent: 0 }))
  );
  const [timer, setTimer] = useState(timePerQuestion);
  const [totalTime, setTotalTime] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [showResults, setShowResults] = useState(false);

  const currentQuestion = questions[currentIndex];
  const currentState = questionStates[currentIndex];

  // Timer
  useEffect(() => {
    if (isComplete || isPaused || currentState.submitted) return;

    const interval = setInterval(() => {
      setTimer((prev) => {
        if (prev <= 1) {
          // Temps écoulé - valider automatiquement
          handleSubmit();
          return timePerQuestion;
        }
        return prev - 1;
      });
      setTotalTime((prev) => prev + 1);
      setQuestionStates((prev) => {
        const updated = [...prev];
        updated[currentIndex] = {
          ...updated[currentIndex],
          timeSpent: updated[currentIndex].timeSpent + 1
        };
        return updated;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [currentIndex, isComplete, isPaused, currentState.submitted, timePerQuestion]);

  // Sélectionner une réponse
  const handleSelectAnswer = (answerIndex: number) => {
    if (currentState.submitted) return;

    setQuestionStates((prev) => {
      const updated = [...prev];
      updated[currentIndex] = { ...updated[currentIndex], selectedAnswer: answerIndex };
      return updated;
    });
  };

  // Valider la réponse
  const handleSubmit = useCallback(() => {
    if (currentState.submitted || currentState.selectedAnswer === null) return;

    setQuestionStates((prev) => {
      const updated = [...prev];
      updated[currentIndex] = { ...updated[currentIndex], submitted: true };
      return updated;
    });
  }, [currentIndex, currentState]);

  // Navigation
  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setTimer(timePerQuestion);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  // Terminer le quiz
  const handleFinish = () => {
    setIsComplete(true);
    setShowResults(true);

    const result: QCMResult = {
      score: questionStates.filter(
        (s, i) => s.submitted && s.selectedAnswer === questions[i].correctAnswer
      ).length,
      totalQuestions: questions.length,
      percentage: Math.round(
        questionStates.filter(
          (s, i) => s.submitted && s.selectedAnswer === questions[i].correctAnswer
        ).length /
        questions.length *
        100
      ),
      timeSpent: totalTime,
      answers: questionStates.map((s, i) => ({
        questionId: questions[i].id,
        selectedAnswer: s.selectedAnswer ?? -1,
        correct: s.selectedAnswer === questions[i].correctAnswer,
        timeSpent: s.timeSpent
      }))
    };

    onComplete?.(result);
  };

  // Recommencer
  const handleRestart = () => {
    setCurrentIndex(0);
    setQuestionStates(questions.map(() => ({ selectedAnswer: null, submitted: false, timeSpent: 0 })));
    setTimer(timePerQuestion);
    setTotalTime(0);
    setIsComplete(false);
    setShowResults(false);
  };

  // Formater le temps
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Calcul du score actuel
  const currentScore = questionStates.filter(
    (s, i) => s.submitted && s.selectedAnswer === questions[i].correctAnswer
  ).length;

  const answeredCount = questionStates.filter((s) => s.submitted).length;

  // Affichage des résultats
  if (showResults) {
    const percentage = Math.round(currentScore / questions.length * 100);
    const getGrade = () => {
      if (percentage >= 90) return { label: 'Excellent', color: 'text-green-500', icon: Trophy };
      if (percentage >= 70) return { label: 'Bien', color: 'text-blue-500', icon: Award };
      if (percentage >= 50) return { label: 'Passable', color: 'text-yellow-500', icon: CheckCircle2 };
      return { label: 'À améliorer', color: 'text-red-500', icon: AlertCircle };
    };
    const grade = getGrade();
    const GradeIcon = grade.icon;

    return (
      <Card className="max-w-3xl mx-auto">
        <CardHeader className="text-center">
          <GradeIcon className={cn('w-16 h-16 mx-auto mb-4', grade.color)} />
          <CardTitle className="text-2xl">{grade.label}</CardTitle>
          <CardDescription>Vous avez terminé l'évaluation</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Score principal */}
          <div className="text-center p-6 bg-muted rounded-lg">
            <div className="text-5xl font-bold text-primary mb-2">
              {currentScore}/{questions.length}
            </div>
            <div className="text-xl text-muted-foreground">{percentage}% de bonnes réponses</div>
          </div>

          {/* Statistiques */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-muted/50 rounded-lg text-center">
              <Clock className="w-6 h-6 mx-auto mb-2 text-muted-foreground" />
              <div className="font-semibold">{formatTime(totalTime)}</div>
              <div className="text-sm text-muted-foreground">Temps total</div>
            </div>
            <div className="p-4 bg-muted/50 rounded-lg text-center">
              <Zap className="w-6 h-6 mx-auto mb-2 text-muted-foreground" />
              <div className="font-semibold">{formatTime(Math.round(totalTime / questions.length))}</div>
              <div className="text-sm text-muted-foreground">Moyenne/question</div>
            </div>
          </div>

          <Separator />

          {/* Détail des réponses */}
          {showExplanations &&
          <div className="space-y-4">
              <h3 className="font-semibold flex items-center gap-2">
                <BookOpen className="w-5 h-5" />
                Corrections détaillées
              </h3>
              <ScrollArea className="h-[300px]">
                <div className="space-y-3 pr-4">
                  {questions.map((q, i) => {
                  const state = questionStates[i];
                  const isCorrect = state.selectedAnswer === q.correctAnswer;

                  return (
                    <div
                      key={q.id}
                      className={cn(
                        'p-4 rounded-lg border',
                        isCorrect ? 'bg-green-50 border-green-200 dark:bg-green-900/30 dark:border-green-800' : 'bg-red-50 border-red-200 dark:bg-red-900/30 dark:border-red-800'
                      )}>
                      
                        <div className="flex items-start gap-3">
                          {isCorrect ?
                        <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400 mt-0.5" /> :

                        <XCircle className="w-5 h-5 text-red-600 dark:text-red-400 mt-0.5" />
                        }
                          <div className="flex-1">
                            <p className="font-medium text-sm mb-2">
                              {i + 1}. {q.question}
                            </p>
                            <div className="text-sm text-muted-foreground mb-2">
                              <span className="font-medium text-foreground">
                                Réponse correcte:{' '}
                              </span>
                              {q.options[q.correctAnswer]}
                            </div>
                            {!isCorrect && state.selectedAnswer !== null &&
                          <div className="text-sm text-red-700 dark:text-red-300 mb-2">
                                Votre réponse: {q.options[state.selectedAnswer]}
                              </div>
                          }
                            <p className="text-xs text-muted-foreground italic">{q.explanation}</p>
                          </div>
                        </div>
                      </div>);

                })}
                </div>
              </ScrollArea>
            </div>
          }

          {/* Actions */}
          <div className="flex gap-3">
            <Button onClick={handleRestart} variant="outline" className="flex-1">
              <RotateCcw className="w-4 h-4 mr-2" />
              Recommencer
            </Button>
          </div>
        </CardContent>
      </Card>);

  }

  return (
    <Card className="max-w-3xl mx-auto">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>{title}</CardTitle>
            <CardDescription>
              Question {currentIndex + 1} sur {questions.length}
            </CardDescription>
          </div>
          <div className="flex items-center gap-4">
            {/* Timer */}
            <Badge
              variant={timer <= 10 ? 'destructive' : 'secondary'}
              className="text-lg px-3 py-1">
              
              <Clock className="w-4 h-4 mr-1" />
              {formatTime(timer)}
            </Badge>
            {/* Score */}
            <Badge variant="outline" className="text-lg px-3 py-1">
              <Award className="w-4 h-4 mr-1" />
              {currentScore}/{answeredCount}
            </Badge>
          </div>
        </div>
        <Progress value={currentIndex / questions.length * 100} className="mt-4" />
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Question */}
        <div className="p-4 bg-muted rounded-lg">
          <p className="text-lg font-medium">{currentQuestion.question}</p>
        </div>

        {/* Options */}
        <div className="grid gap-3">
          {currentQuestion.options.map((option, index) => {
            const isSelected = currentState.selectedAnswer === index;
            const isCorrect = index === currentQuestion.correctAnswer;
            const showResult = currentState.submitted;

            return (
              <button
                key={index}
                onClick={() => handleSelectAnswer(index)}
                disabled={currentState.submitted}
                className={cn(
                  'p-4 text-left rounded-lg border-2 transition-all',
                  !showResult && isSelected && 'border-primary bg-primary/5',
                  !showResult && !isSelected && 'border-muted hover:border-muted-foreground/50',
                  showResult && isCorrect && 'border-green-600 bg-green-50 dark:bg-green-900/30 dark:border-green-700',
                  showResult && !isCorrect && isSelected && 'border-red-600 bg-red-50 dark:bg-red-900/30 dark:border-red-700',
                  currentState.submitted && 'cursor-default'
                )} aria-label="Action">
                
                <div className="flex items-center gap-3">
                  <div
                    className={cn(
                      'w-8 h-8 rounded-full flex items-center justify-center font-semibold text-sm',
                      isSelected ? 'bg-primary text-primary-foreground' : 'bg-muted'
                    )}>
                    
                    {String.fromCharCode(65 + index)}
                  </div>
                  <span className="flex-1">{option}</span>
                  {showResult && isCorrect && <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400" />}
                  {showResult && !isCorrect && isSelected && <XCircle className="w-5 h-5 text-red-600 dark:text-red-400" />}
                </div>
              </button>);

          })}
        </div>

        {/* Explication après validation */}
        {currentState.submitted && showExplanations &&
        <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Explication</AlertTitle>
            <AlertDescription>{currentQuestion.explanation}</AlertDescription>
          </Alert>
        }

        {/* Actions */}
        <div className="flex items-center justify-between pt-4">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentIndex === 0}>
            
            <ChevronLeft className="w-4 h-4 mr-1" />
            Précédent
          </Button>

          <div className="flex gap-2">
            {!currentState.submitted ?
            <Button
              onClick={handleSubmit}
              disabled={currentState.selectedAnswer === null}>
              
                Valider
              </Button> :
            currentIndex < questions.length - 1 ?
            <Button onClick={handleNext}>
                Suivant
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button> :

            <Button onClick={handleFinish} className="bg-green-600 hover:bg-green-700">
                <Trophy className="w-4 h-4 mr-2" />
                Voir les résultats
              </Button>
            }
          </div>
        </div>
      </CardContent>
    </Card>);

};