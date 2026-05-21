import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Eye, ChevronLeft, ChevronRight, BookOpen, HelpCircle, List, X, Presentation } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';


import { cn } from '@/lib/utils';
import { PresentationMode } from './PresentationMode';

interface CoursePreviewProps {
  course: Course;
  onClose?: () => void;
}

export const CoursePreview: React.FC<CoursePreviewProps> = ({ course, onClose }) => {
  const [currentSection, setCurrentSection] = useState(0);
  const [showQCM, setShowQCM] = useState(false);
  const [qcmAnswers, setQcmAnswers] = useState<Record<string, number>>({});
  const [showResults, setShowResults] = useState(false);
  const [showPresentation, setShowPresentation] = useState(false);

  if (showPresentation) {
    return <PresentationMode course={course} onClose={() => setShowPresentation(false)} />;
  }

  const sections: {id: string;title: string;type: string;index?: number;}[] = [
  { id: 'intro', title: 'Introduction', type: 'intro' },
  ...course.content.sections.map((s, i) => ({ id: s.id, title: s.title, type: 'section', index: i })),
  { id: 'conclusion', title: 'Conclusion', type: 'conclusion' }];


  const totalSections = sections.length;
  const progress = (currentSection + 1) / totalSections * 100;

  const renderContent = () => {
    const section = sections[currentSection];

    if (section.type === 'intro') {
      return (
        <div className="prose prose-sm max-w-none dark:prose-invert">
          <h2 className="text-2xl font-bold mb-4 text-primary">Introduction</h2>
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {course.content.introduction || "Bienvenue dans cette formation."}
          </ReactMarkdown>

          {course.modules.length > 0 &&
          <div className="mt-6 p-4 bg-muted rounded-lg">
              <h3 className="font-semibold mb-3">Modules de la formation</h3>
              <ul className="space-y-2">
                {course.modules.map((module, i) =>
              <li key={module.id} className="flex items-center gap-2">
                    <Badge variant="outline">{i + 1}</Badge>
                    <span>{module.title}</span>
                    <span className="text-muted-foreground text-sm">({module.duration}h)</span>
                  </li>
              )}
              </ul>
            </div>
          }
        </div>);

    }

    if (section.type === 'conclusion') {
      return (
        <div className="prose prose-sm max-w-none dark:prose-invert">
          <h2 className="text-2xl font-bold mb-4 text-primary">Conclusion</h2>
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {course.content.conclusion || "Merci d'avoir suivi cette formation."}
          </ReactMarkdown>

          {course.content.resources.length > 0 &&
          <div className="mt-6 p-4 bg-muted rounded-lg">
              <h3 className="font-semibold mb-3">Ressources complémentaires</h3>
              <ul className="space-y-1">
                {course.content.resources.map((resource, i) =>
              <li key={i}>• {resource}</li>
              )}
              </ul>
            </div>
          }
        </div>);

    }

    const sectionData = course.content.sections[section.index!];
    return (
      <div className="prose prose-sm max-w-none dark:prose-invert">
        <h2 className="text-2xl font-bold mb-4 text-primary">{sectionData.title}</h2>

        <ReactMarkdown remarkPlugins={[remarkGfm]}>
          {sectionData.explanation}
        </ReactMarkdown>

        {sectionData.examples.length > 0 &&
        <div className="mt-6 p-4 bg-primary/5 border-l-4 border-primary rounded-r-lg">
            <h4 className="font-semibold mb-2 flex items-center gap-2">
              <BookOpen className="w-4 h-4" />
              Exemples pratiques
            </h4>
            <ul className="space-y-2">
              {sectionData.examples.map((example, i) =>
            <li key={i} className="text-sm">{example}</li>
            )}
            </ul>
          </div>
        }

        {sectionData.warnings.length > 0 &&
        <div className="mt-4 p-4 bg-destructive/10 border-l-4 border-destructive rounded-r-lg">
            <h4 className="font-semibold mb-2 text-destructive">⚠️ Points d'attention</h4>
            <ul className="space-y-1">
              {sectionData.warnings.map((warning, i) =>
            <li key={i} className="text-sm">{warning}</li>
            )}
            </ul>
          </div>
        }
      </div>);

  };

  const handleQCMAnswer = (questionId: string, answerIndex: number) => {
    setQcmAnswers((prev) => ({ ...prev, [questionId]: answerIndex }));
  };

  const calculateScore = () => {
    let correct = 0;
    course.content.qcm.forEach((q) => {
      if (qcmAnswers[q.id] === q.correctAnswer) correct++;
    });
    return { correct, total: course.content.qcm.length, percentage: Math.round(correct / course.content.qcm.length * 100) };
  };

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header */}
      <div className="border-b p-4 flex items-center justify-between bg-card">
        <div className="flex items-center gap-3">
          <Eye className="w-5 h-5 text-primary" />
          <div>
            <h2 className="font-semibold">{course.title}</h2>
            <p className="text-sm text-muted-foreground">
              Section {currentSection + 1} / {totalSections}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowPresentation(true)}
            className="gap-2">
            
            <Presentation className="w-4 h-4" />
            Présentation
          </Button>

          {course.content.qcm.length > 0 &&
          <Button
            variant={showQCM ? "default" : "outline"}
            size="sm"
            onClick={() => setShowQCM(!showQCM)}>
            
              <HelpCircle className="w-4 h-4 mr-2" />
              QCM ({course.content.qcm.length})
            </Button>
          }

          {onClose &&
          <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          }
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-1 bg-muted">
        <div
          className="h-full bg-primary transition-all duration-300"
          style={{ width: `${progress}%` }} />
        
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar navigation */}
        <div className="w-64 border-r bg-muted/30 hidden md:block">
          <ScrollArea className="h-full p-4">
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <List className="w-4 h-4" />
              Sommaire
            </h3>
            <nav className="space-y-1">
              {sections.map((section, index) =>
              <button
                key={section.id}
                onClick={() => setCurrentSection(index)}
                className={cn(
                  "w-full text-left px-3 py-2 rounded-md text-sm transition-colors",
                  currentSection === index ?
                  "bg-primary text-primary-foreground" :
                  "hover:bg-muted"
                )} aria-label="Action">
                
                  {section.title}
                </button>
              )}
            </nav>
          </ScrollArea>
        </div>

        {/* Main content */}
        <div className="flex-1 overflow-hidden">
          {showQCM ?
          <ScrollArea className="h-full p-6">
              <div className="max-w-3xl mx-auto space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold">Évaluation</h2>
                  {!showResults && Object.keys(qcmAnswers).length === course.content.qcm.length &&
                <Button onClick={() => setShowResults(true)}>
                      Voir les résultats
                    </Button>
                }
                </div>

                {showResults &&
              <Card className={cn(
                "border-2",
                calculateScore().percentage >= 70 ? "border-green-500 bg-green-50 dark:bg-green-950" : "border-orange-500 bg-orange-50 dark:bg-orange-950"
              )}>
                    <CardContent className="pt-6">
                      <div className="text-center">
                        <div className="text-4xl font-bold mb-2">
                          {calculateScore().percentage}%
                        </div>
                        <p className="text-muted-foreground">
                          {calculateScore().correct} / {calculateScore().total} réponses correctes
                        </p>
                        <Button
                      variant="outline"
                      className="mt-4"
                      onClick={() => {
                        setQcmAnswers({});
                        setShowResults(false);
                      }}>
                      
                          Recommencer
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
              }

                {course.content.qcm.map((question, qIndex) =>
              <Card key={question.id} className="overflow-hidden">
                    <CardHeader className="bg-muted/50">
                      <CardTitle className="text-base">
                        Question {qIndex + 1}: {question.question}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-4 space-y-2">
                      {question.options.map((option, oIndex) => {
                    const isSelected = qcmAnswers[question.id] === oIndex;
                    const isCorrect = question.correctAnswer === oIndex;
                    const showAnswer = showResults;

                    return (
                      <button
                        key={oIndex}
                        onClick={() => !showResults && handleQCMAnswer(question.id, oIndex)}
                        disabled={showResults}
                        className={cn(
                          "w-full text-left p-3 rounded-lg border transition-all",
                          isSelected && !showAnswer && "border-primary bg-primary/10",
                          showAnswer && isCorrect && "border-green-500 bg-green-50 dark:bg-green-950",
                          showAnswer && isSelected && !isCorrect && "border-red-500 bg-red-50 dark:bg-red-950",
                          !isSelected && !showAnswer && "hover:bg-muted"
                        )} aria-label="Action">
                        
                            <span className="font-medium mr-2">
                              {String.fromCharCode(65 + oIndex)}.
                            </span>
                            {option}
                          </button>);

                  })}

                      {showResults && qcmAnswers[question.id] !== question.correctAnswer &&
                  <div className="mt-3 p-3 bg-muted rounded-lg text-sm">
                          <strong>Explication:</strong> {question.explanation}
                        </div>
                  }
                    </CardContent>
                  </Card>
              )}
              </div>
            </ScrollArea> :

          <ScrollArea className="h-full p-6">
              <div className="max-w-3xl mx-auto">
                {renderContent()}
              </div>
            </ScrollArea>
          }
        </div>
      </div>

      {/* Footer navigation */}
      {!showQCM &&
      <div className="border-t p-4 flex items-center justify-between bg-card">
          <Button
          variant="outline"
          onClick={() => setCurrentSection((prev) => Math.max(0, prev - 1))}
          disabled={currentSection === 0}>
          
            <ChevronLeft className="w-4 h-4 mr-2" />
            Précédent
          </Button>

          <div className="flex gap-1">
            {sections.map((_, index) =>
          <button
            key={index}
            onClick={() => setCurrentSection(index)}
            className={cn(
              "w-2 h-2 rounded-full transition-colors",
              currentSection === index ? "bg-primary" : "bg-muted-foreground/30"
            )} aria-label="Action" />

          )}
          </div>

          <Button
          variant="outline"
          onClick={() => setCurrentSection((prev) => Math.min(totalSections - 1, prev + 1))}
          disabled={currentSection === totalSections - 1}>
          
            Suivant
            <ChevronRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      }
    </div>);

};