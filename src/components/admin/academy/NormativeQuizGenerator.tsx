import React, { useState, useEffect } from 'react';
import {
  Brain,
  CheckCircle,
  XCircle,
  RefreshCw,
  BookOpen,

  Trophy,
  ArrowRight } from
'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { multiNormService } from '@/services/academy/multiNormService';
import { NormQCMQuestion } from '@/types/academy';
import { toast } from 'sonner';

export const NormativeQuizGenerator: React.FC = () => {
  const [questions, setQuestions] = useState<NormQCMQuestion[]>([]);
  const [quizQuestions, setQuizQuestions] = useState<NormQCMQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Record<string, number[]>>({});
  const [quizState, setQuizState] = useState<'setup' | 'active' | 'review'>('setup');
  const [score, setScore] = useState(0);
  const [loading, setLoading] = useState(true);

  // Configuration
  const [questionCount, setQuestionCount] = useState(10);
  const [selectedSection, setSelectedSection] = useState<string>('all');
  const [availableSections, setAvailableSections] = useState<string[]>([]);

  // Charger les données
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        await multiNormService.loadSavedNorms();
        const normId = 'NS-01-001';
        // S'assurer que la norme est chargée (avec QCM)
        const qcm = multiNormService.getNormQCM(normId);

        if (qcm && qcm.length > 0) {
          setQuestions(qcm);
          extractSections(qcm);
        } else {




          // Tentative de rechargement si vide (peut-être pas encore init)
          // Note: En prod, on devrait peut-être avoir une méthode explicite initQCM
          // Pour l'instant on suppose que multiNormService a chargé les défauts
          // On pourrait forcer un reload si besoin, mais checkons d'abord si dispo
        }} catch (error) {console.error("Erreur chargement QCM", error);toast.error("Impossible de charger la base de questions QCM");} finally {
        setLoading(false);
      }
    };

    // Hack pour attendre que le service soit prêt si premier montage
    setTimeout(loadData, 1000);
  }, []);

  const extractSections = (data: NormQCMQuestion[]) => {
    const sections = new Set<string>();
    data.forEach((q) => {
      if (q.source_section) {
        // Nettoyage basique pour grouper
        const section = q.source_section.trim();
        if (section.length > 3) sections.add(section);
      }
    });
    setAvailableSections(Array.from(sections).sort());
  };

  const startQuiz = () => {
    let filtered = questions;
    if (selectedSection !== 'all') {
      filtered = questions.filter((q) => q.source_section === selectedSection);
    }

    // Mélanger et prendre N questions
    const shuffled = [...filtered].sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, questionCount);

    if (selected.length === 0) {
      toast.error("Aucune question disponible pour cette sélection");
      return;
    }

    setQuizQuestions(selected);
    setCurrentQuestionIndex(0);
    setUserAnswers({});
    setScore(0);
    setQuizState('active');
  };

  const toggleAnswer = (questionId: string, optionIndex: number) => {
    setUserAnswers((prev) => {
      const current = prev[questionId] || [];
      const exists = current.includes(optionIndex);

      let updated;
      if (exists) {
        updated = current.filter((i) => i !== optionIndex);
      } else {
        updated = [...current, optionIndex];
      }

      return { ...prev, [questionId]: updated };
    });
  };

  const submitQuiz = () => {
    let correctCount = 0;

    quizQuestions.forEach((q) => {
      const userAns = userAnswers[q.id] || [];
      const correctAns = q.correct_indices;

      // Vérification exact match (pour simplifier, ou partiel ?)
      // Ici on fait exact match des indices
      const isCorrect =
      userAns.length === correctAns.length &&
      userAns.every((i) => correctAns.includes(i));

      if (isCorrect) correctCount++;
    });

    setScore(correctCount);
    setQuizState('review');
  };

  const renderSetup = () =>
  <Card className="w-full max-w-2xl mx-auto border-purple-200 bg-purple-50/10">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-purple-800">
                    <Brain className="w-6 h-6" />
                    Générateur de Quiz Normatif
                </CardTitle>
                <CardDescription>
                    Testez vos connaissances sur la norme NS 01-001 avec des questions générées dynamiquement.
                    Base de données : {questions.length} questions disponibles.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="space-y-2">
                    <Label>Nombre de questions</Label>
                    <Select value={String(questionCount)} onValueChange={(v) => setQuestionCount(Number(v))}>
                        <SelectTrigger>
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="5">5 questions (Rapide)</SelectItem>
                            <SelectItem value="10">10 questions (Standard)</SelectItem>
                            <SelectItem value="20">20 questions (Intensif)</SelectItem>
                            <SelectItem value="50">50 questions (Examen)</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <div className="space-y-2">
                    <Label>Filtrer par section (Optionnel)</Label>
                    <Select value={selectedSection} onValueChange={setSelectedSection}>
                        <SelectTrigger>
                            <SelectValue placeholder="Toutes les sections" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Toutes les sections</SelectItem>
                            {availableSections.slice(0, 50).map((s, i) =>
            <SelectItem key={i} value={s}>{s.substring(0, 60)}...</SelectItem>
            )}
                        </SelectContent>
                    </Select>
                </div>

                <Alert className="bg-blue-50 border-blue-200">
                    <BookOpen className="h-4 w-4 text-blue-500" />
                    <AlertTitle>Mode Entraînement</AlertTitle>
                    <AlertDescription>
                        Les questions sont tirées aléatoirement parmi les milliers de cas possibles générés par l'IA.
                    </AlertDescription>
                </Alert>
            </CardContent>
            <CardFooter>
                <Button onClick={startQuiz} className="w-full" size="lg" disabled={loading || questions.length === 0}>
                    {loading ? "Chargement de la base..." : "Commencer le Quiz"}
                </Button>
            </CardFooter>
        </Card>;


  const renderActiveQuiz = () => {
    const question = quizQuestions[currentQuestionIndex];
    const userAns = userAnswers[question.id] || [];

    return (
      <div className="max-w-3xl mx-auto space-y-6">
                <div className="flex items-center justify-between">
                    <div className="space-y-1">
                        <h2 className="text-2xl font-bold text-slate-800">Question {currentQuestionIndex + 1}/{quizQuestions.length}</h2>
                        <p className="text-muted-foreground text-sm">Sélectionnez toutes les réponses correctes</p>
                    </div>
                    <Badge variant="outline" className="text-lg px-3 py-1">
                        {Math.round(currentQuestionIndex / quizQuestions.length * 100)}%
                    </Badge>
                </div>

                <Progress value={currentQuestionIndex / quizQuestions.length * 100} className="h-2" />

                <Card className="border-t-4 border-t-purple-500">
                    <CardHeader>
                        <CardTitle className="text-lg font-medium leading-relaxed">
                            {question.question}
                        </CardTitle>
                        {question.source_section &&
            <Badge variant="secondary" className="w-fit mt-2">
                                Contexte : {question.source_section}
                            </Badge>
            }
                    </CardHeader>
                    <CardContent className="space-y-3">
                        {question.options.map((option, idx) => {
              const isSelected = userAns.includes(idx);
              return (
                <div
                  key={idx}
                  onClick={() => toggleAnswer(question.id, idx)}
                  className={`flex items-center p-4 rounded-lg border-2 cursor-pointer transition-all
                    ${isSelected ?
                  'border-purple-500 bg-purple-50 shadow-sm' :
                  'border-slate-100 hover:border-slate-200 hover:bg-slate-50'}`
                  }>
                  
                                    <div className={`w-6 h-6 rounded border mr-4 flex items-center justify-center
                    ${isSelected ? 'bg-purple-500 border-purple-500 text-white' : 'border-slate-300'}
                  `}>
                                        {isSelected && <CheckCircle className="w-4 h-4" />}
                                    </div>
                                    <span className="text-sm md:text-base">{option}</span>
                                </div>);

            })}
                    </CardContent>
                    <CardFooter className="flex justify-between pt-6">
                        <Button
              variant="outline"
              onClick={() => setCurrentQuestionIndex(Math.max(0, currentQuestionIndex - 1))}
              disabled={currentQuestionIndex === 0}>
              
                            Précédent
                        </Button>

                        {currentQuestionIndex < quizQuestions.length - 1 ?
            <Button onClick={() => setCurrentQuestionIndex(currentQuestionIndex + 1)}>
                                Suivant <ArrowRight className="w-4 h-4 ml-2" />
                            </Button> :

            <Button onClick={submitQuiz} className="bg-green-600 hover:bg-green-700">
                                Terminer et noter <Trophy className="w-4 h-4 ml-2" />
                            </Button>
            }
                    </CardFooter>
                </Card>
            </div>);

  };

  const renderReview = () => {
    const percentage = Math.round(score / quizQuestions.length * 100);

    return (
      <div className="max-w-4xl mx-auto space-y-8">
                <Card className="bg-slate-900 text-white border-none overflow-hidden relative">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/20 rounded-full blur-3xl -mr-16 -mt-16" />
                    <CardContent className="p-8 text-center relative z-10">
                        <Trophy className="w-16 h-16 mx-auto text-yellow-400 mb-4" />
                        <h2 className="text-3xl font-bold mb-2">Résultat : {score}/{quizQuestions.length}</h2>
                        <p className="text-slate-300 text-lg mb-6">
                            {percentage >= 80 ? "Excellent ! Vous maîtrisez le sujet." :
              percentage >= 50 ? "Pas mal, mais des révisions sont nécessaires." :
              "Il faut revoir vos normes !"}
                        </p>
                        <div className="flex items-center justify-center gap-4">
                            <Button onClick={startQuiz} className="bg-white text-slate-900 hover:bg-slate-100">
                                <RefreshCw className="w-4 h-4 mr-2" />
                                Refaire un Quiz
                            </Button>
                            <Button variant="outline" className="border-slate-700 text-white hover:bg-slate-800" onClick={() => setQuizState('setup')}>
                                Changer les paramètres
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                <div className="space-y-6">
                    <h3 className="text-xl font-bold text-slate-800">Détail des réponses</h3>
                    {quizQuestions.map((q, qIdx) => {
            const userAns = userAnswers[q.id] || [];
            const correctAns = q.correct_indices;
            const isCorrect = userAns.length === correctAns.length && userAns.every((i) => correctAns.includes(i));

            return (
              <Card key={q.id} className={`border-l-4 ${isCorrect ? 'border-l-green-500' : 'border-l-red-500'}`}>
                                <CardHeader>
                                    <div className="flex items-start justify-between">
                                        <CardTitle className="text-base text-slate-800">
                                            <span className="mr-2 text-slate-400">#{qIdx + 1}</span>
                                            {q.question}
                                        </CardTitle>
                                        {isCorrect ?
                    <Badge className="bg-green-100 text-green-700 hover:bg-green-100">Correct</Badge> :

                    <Badge className="bg-red-100 text-red-700 hover:bg-red-100">Incorrect</Badge>
                    }
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-2">
                                    {q.options.map((opt, oIdx) => {
                    const isSelected = userAns.includes(oIdx);
                    const isGood = correctAns.includes(oIdx);

                    let style = "p-3 rounded border text-sm flex justify-between items-center ";
                    if (isGood) {
                      style += isSelected ? "bg-green-50 border-green-200 text-green-800 font-medium" : "bg-green-50/50 border-green-200 border-dashed text-green-800/70";
                    } else if (isSelected) {
                      style += "bg-red-50 border-red-200 text-red-800";
                    } else {
                      style += "bg-slate-50 border-transparent text-slate-500";
                    }

                    return (
                      <div key={oIdx} className={style}>
                                                <span>{opt}</span>
                                                <div className="flex gap-2">
                                                    {isSelected && !isGood && <XCircle className="w-4 h-4 text-red-500" />}
                                                    {isGood && <CheckCircle className="w-4 h-4 text-green-600" />}
                                                </div>
                                            </div>);

                  })}

                                    <div className="mt-4 pt-4 border-t flex items-center gap-2 text-sm text-slate-500">
                                        <BookOpen className="w-4 h-4" />
                                        Source : <span className="font-mono bg-slate-100 px-1 rounded">{q.source_section}</span>
                                    </div>
                                </CardContent>
                            </Card>);

          })}
                </div>
            </div>);

  };

  return (
    <div className="container mx-auto py-6">
            {quizState === 'setup' && renderSetup()}
            {quizState === 'active' && renderActiveQuiz()}
            {quizState === 'review' && renderReview()}
        </div>);

};