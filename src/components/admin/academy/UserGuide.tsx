
import React from 'react';
import {
  LifeBuoy, BookOpen, HelpCircle,
  Database, GraduationCap, Moon, Globe, Keyboard, Download, FileText, Presentation,
  Wifi, WifiOff, Timer, BarChart3, Layout, History, Shield, Zap } from
'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

export const UserGuide: React.FC = () => {
  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex items-center gap-2 mb-6">
        <LifeBuoy className="h-6 w-6 text-primary" />
        <h1 className="text-2xl font-bold">Guide d'utilisation complet</h1>
        <Badge variant="secondary">v4.0</Badge>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-6">
          <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
          <TabsTrigger value="getting-started">Premiers pas</TabsTrigger>
          <TabsTrigger value="features">Fonctionnalités</TabsTrigger>
          <TabsTrigger value="norms">Normes & Cours</TabsTrigger>
          <TabsTrigger value="exports">Exports</TabsTrigger>
          <TabsTrigger value="shortcuts">Raccourcis</TabsTrigger>
        </TabsList>

        {/* VUE D'ENSEMBLE */}
        <TabsContent value="overview" className="space-y-6">
          <Card className="border-primary/30">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-primary" />
                Professeur KEBE v4.0 - Mode Robuste
              </CardTitle>
              <CardDescription>
                Générateur de cours professionnel en mode 100% autonome
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-primary/10 border border-primary/30 rounded-lg">
                <p className="font-medium">🚀 Architecture robuste</p>
                <p className="text-sm text-muted-foreground mt-1">
                  L'application fonctionne en mode 100% déterministe, sans dépendance externe.
                </p>
              </div>
              
              <div className="grid md:grid-cols-3 gap-4">
                <div className="space-y-3">
                  <h4 className="font-medium flex items-center gap-2">
                    <Shield className="h-4 w-4 text-primary" />
                    Mode Robuste
                  </h4>
                  <ul className="text-sm space-y-1 text-muted-foreground">
                    <li>• Génération sans IA</li>
                    <li>• Logique déterministe</li>
                    <li>• Mode hors-ligne</li>
                    <li>• Sauvegarde automatique</li>
                  </ul>
                </div>
                
                <div className="space-y-3">
                  <h4 className="font-medium flex items-center gap-2">
                    <Database className="h-4 w-4 text-primary" />
                    Base Normative
                  </h4>
                  <ul className="text-sm space-y-1 text-muted-foreground">
                    <li>• Norme NS 01-001 intégrée</li>
                    <li>• Indexation par articles</li>
                    <li>• Recherche par mots-clés</li>
                    <li>• Multi-normes extensible</li>
                  </ul>
                </div>
                
                <div className="space-y-3">
                  <h4 className="font-medium flex items-center gap-2">
                    <Download className="h-4 w-4 text-primary" />
                    Exports Avancés
                  </h4>
                  <ul className="text-sm space-y-1 text-muted-foreground">
                    <li>• Word, PowerPoint, PDF</li>
                    <li>• SCORM 1.2 pour LMS</li>
                    <li>• Livrets spécialisés</li>
                    <li>• Fiche audit terrain</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="pt-6 text-center">
                <Wifi className="h-8 w-8 mx-auto mb-2 text-green-500" />
                <h4 className="font-medium">Mode Hors-ligne</h4>
                <p className="text-xs text-muted-foreground mt-1">
                  Service Worker pour fonctionnement sans internet
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6 text-center">
                <Moon className="h-8 w-8 mx-auto mb-2 text-primary" />
                <h4 className="font-medium">Mode Sombre</h4>
                <p className="text-xs text-muted-foreground mt-1">
                  Thème adaptatif système/manuel
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6 text-center">
                <Globe className="h-8 w-8 mx-auto mb-2 text-primary" />
                <h4 className="font-medium">Multi-langue</h4>
                <p className="text-xs text-muted-foreground mt-1">
                  Français, Anglais, Arabe (RTL)
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6 text-center">
                <Keyboard className="h-8 w-8 mx-auto mb-2 text-primary" />
                <h4 className="font-medium">Raccourcis clavier</h4>
                <p className="text-xs text-muted-foreground mt-1">
                  Navigation rapide sans souris
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* PREMIERS PAS */}
        <TabsContent value="getting-started" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Démarrage rapide</CardTitle>
              <CardDescription>
                L'application fonctionne immédiatement en mode robuste
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="bg-primary text-primary-foreground rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold shrink-0">
                    1
                  </div>
                  <div>
                    <h4 className="font-medium">Tester la démo présentation</h4>
                    <p className="text-sm text-muted-foreground mt-1">
                      Cliquez sur "Démo Présentation" en page d'accueil pour découvrir 
                      le mode présentation avec tous les outils interactifs.
                    </p>
                    <Badge className="mt-2">Aucune configuration requise</Badge>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="bg-primary text-primary-foreground rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold shrink-0">
                    2
                  </div>
                  <div>
                    <h4 className="font-medium">Explorer la norme NS 01-001</h4>
                    <p className="text-sm text-muted-foreground mt-1">
                      Onglet "Explorer" pour naviguer dans la norme de sécurité électrique
                      indexée par articles et mots-clés.
                    </p>
                    <Badge variant="secondary" className="mt-2">Base pédagogique intégrée</Badge>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="bg-primary text-primary-foreground rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold shrink-0">
                    3
                  </div>
                  <div>
                    <h4 className="font-medium">Générer un cours normatif</h4>
                    <p className="text-sm text-muted-foreground mt-1">
                      Onglet "Cours Normatif" → Sélectionnez un thème (ex: chocs électriques) 
                      → Le cours complet est généré automatiquement.
                    </p>
                    <Badge variant="outline" className="mt-2">100% déterministe</Badge>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="bg-primary text-primary-foreground rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold shrink-0">
                    4
                  </div>
                  <div>
                    <h4 className="font-medium">Exporter en multi-formats</h4>
                    <p className="text-sm text-muted-foreground mt-1">
                      Word, PowerPoint (6 thèmes), SCORM, Livret Formateur, Livret Apprenant, 
                      Fiche Audit Terrain.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

        </TabsContent>

        {/* FONCTIONNALITÉS */}
        <TabsContent value="features" className="space-y-6">
          <Accordion type="multiple" className="space-y-4">
            <AccordionItem value="presentation" className="border rounded-lg px-4">
              <AccordionTrigger>
                <div className="flex items-center gap-2">
                  <Presentation className="h-5 w-5 text-primary" />
                  Mode Présentation
                </div>
              </AccordionTrigger>
              <AccordionContent className="space-y-4 pt-4">
                <p className="text-sm text-muted-foreground">
                  Mode diaporama professionnel avec outils d'annotation en temps réel.
                </p>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <h5 className="font-medium text-sm mb-2">Outils interactifs</h5>
                    <ul className="text-sm space-y-1 text-muted-foreground">
                      <li>• Pointeur laser virtuel avec traînée</li>
                      <li>• Stylo et surligneur (8 couleurs)</li>
                      <li>• Gomme pour corrections</li>
                      <li>• Notes du présentateur</li>
                    </ul>
                  </div>
                  <div>
                    <h5 className="font-medium text-sm mb-2">Navigation</h5>
                    <ul className="text-sm space-y-1 text-muted-foreground">
                      <li>• Barre latérale de miniatures</li>
                      <li>• Grille de navigation (touche G)</li>
                      <li>• Mode lecture automatique</li>
                      <li>• 6 transitions animées</li>
                    </ul>
                  </div>
                </div>
                <div className="bg-muted p-3 rounded-lg">
                  <p className="text-sm font-medium">🎨 6 thèmes visuels :</p>
                  <p className="text-sm text-muted-foreground">
                    Corporate, Creative, Minimal, Dark, Nature, Tech
                  </p>
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="qcm" className="border rounded-lg px-4">
              <AccordionTrigger>
                <div className="flex items-center gap-2">
                  <HelpCircle className="h-5 w-5 text-primary" />
                  Évaluation Interactive
                </div>
              </AccordionTrigger>
              <AccordionContent className="space-y-4 pt-4">
                <p className="text-sm text-muted-foreground">
                  QCM avec scoring, timer et corrections détaillées basées sur les normes.
                </p>
                <ul className="text-sm space-y-2">
                  <li className="flex items-start gap-2">
                    <Timer className="h-4 w-4 text-primary mt-0.5" />
                    <span><strong>Timer par question</strong> - Chronomètre configurable</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <BarChart3 className="h-4 w-4 text-primary mt-0.5" />
                    <span><strong>Scoring automatique</strong> - Calcul du pourcentage de réussite</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <BookOpen className="h-4 w-4 text-primary mt-0.5" />
                    <span><strong>Justifications normatives</strong> - Citation des articles et pages</span>
                  </li>
                </ul>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="offline" className="border rounded-lg px-4">
              <AccordionTrigger>
                <div className="flex items-center gap-2">
                  <WifiOff className="h-5 w-5 text-primary" />
                  Mode Hors-ligne
                </div>
              </AccordionTrigger>
              <AccordionContent className="space-y-4 pt-4">
                <p className="text-sm text-muted-foreground">
                  Fonctionnement complet sans connexion internet grâce au Service Worker.
                </p>
                <ul className="text-sm space-y-2">
                  <li>• Cache automatique des ressources</li>
                  <li>• Indicateur de connectivité</li>
                  <li>• Synchronisation locale</li>
                  <li>• Sauvegarde automatique (debounce 2s)</li>
                </ul>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="i18n" className="border rounded-lg px-4">
              <AccordionTrigger>
                <div className="flex items-center gap-2">
                  <Globe className="h-5 w-5 text-primary" />
                  Internationalisation
                </div>
              </AccordionTrigger>
              <AccordionContent className="space-y-4 pt-4">
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="p-3 bg-muted rounded-lg text-center">
                    <p className="font-medium">🇫🇷 Français</p>
                    <p className="text-xs text-muted-foreground">Langue par défaut</p>
                  </div>
                  <div className="p-3 bg-muted rounded-lg text-center">
                    <p className="font-medium">🇬🇧 English</p>
                    <p className="text-xs text-muted-foreground">Full translation</p>
                  </div>
                  <div className="p-3 bg-muted rounded-lg text-center">
                    <p className="font-medium">🇸🇦 العربية</p>
                    <p className="text-xs text-muted-foreground">Support RTL</p>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="templates" className="border rounded-lg px-4">
              <AccordionTrigger>
                <div className="flex items-center gap-2">
                  <Layout className="h-5 w-5 text-primary" />
                  Templates de Formation
                </div>
              </AccordionTrigger>
              <AccordionContent className="space-y-4 pt-4">
                <p className="text-sm text-muted-foreground">
                  6 modèles de formation pré-configurés prêts à l'emploi.
                </p>
                <div className="grid md:grid-cols-2 gap-2 text-sm">
                  <div className="p-2 bg-muted rounded">🔒 Sécurité au travail</div>
                  <div className="p-2 bg-muted rounded">💼 Management d'équipe</div>
                  <div className="p-2 bg-muted rounded">💻 Formation IT</div>
                  <div className="p-2 bg-muted rounded">📞 Relation client</div>
                  <div className="p-2 bg-muted rounded">⚙️ Process industriel</div>
                  <div className="p-2 bg-muted rounded">📋 Conformité réglementaire</div>
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="history" className="border rounded-lg px-4">
              <AccordionTrigger>
                <div className="flex items-center gap-2">
                  <History className="h-5 w-5 text-primary" />
                  Historique & Analytics
                </div>
              </AccordionTrigger>
              <AccordionContent className="space-y-4 pt-4">
                <ul className="text-sm space-y-2">
                  <li>• Historique complet des cours générés</li>
                  <li>• Restauration de versions précédentes</li>
                  <li>• Statistiques détaillées (onglet Stats)</li>
                  <li>• Suivi des exports et utilisations</li>
                </ul>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </TabsContent>

        {/* NORMES & COURS */}
        <TabsContent value="norms" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                Norme NS 01-001 (Sécurité Électrique)
              </CardTitle>
              <CardDescription>
                Base pédagogique atomisée intégrée pour génération automatique
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium mb-2">Navigation dans l'explorateur</h4>
                  <ul className="text-sm space-y-1 text-muted-foreground">
                    <li>• Parcours hiérarchique (Titre → Chapitre → Article)</li>
                    <li>• Recherche par mots-clés (terre, DDR, PE, TT...)</li>
                    <li>• Sélection de règles pour cours personnalisé</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium mb-2">8 thèmes prédéfinis</h4>
                  <ul className="text-sm space-y-1 text-muted-foreground">
                    <li>• Protection contre les chocs électriques</li>
                    <li>• Mise à la terre et conducteurs</li>
                    <li>• Schémas TT, TN, IT</li>
                    <li>• Protection des circuits et canalisations</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <GraduationCap className="h-5 w-5" />
                Structure pédagogique obligatoire
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <Badge>1</Badge>
                  <div>
                    <h4 className="font-medium">Introduction</h4>
                    <p className="text-sm text-muted-foreground">Problème réel, enjeux sécurité, lien avec accidents</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <Badge>2</Badge>
                  <div>
                    <h4 className="font-medium">Fondements normatifs</h4>
                    <p className="text-sm text-muted-foreground">Articles concernés, résumé des obligations</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <Badge>3</Badge>
                  <div>
                    <h4 className="font-medium">Règles clés</h4>
                    <p className="text-sm text-muted-foreground">Explications 3 niveaux : débutant, technicien, ingénieur</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <Badge>4</Badge>
                  <div>
                    <h4 className="font-medium">Cas pratique</h4>
                    <p className="text-sm text-muted-foreground">Ex: "Vérification DDR en schéma TT"</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <Badge>5</Badge>
                  <div>
                    <h4 className="font-medium">Synthèse + Checklist audit</h4>
                    <p className="text-sm text-muted-foreground">Points à vérifier sur le terrain</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>QCM Normatif Automatique</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-muted p-4 rounded-lg">
                <p className="font-medium mb-2">Pour chaque cours généré :</p>
                <ul className="text-sm space-y-1">
                  <li>✓ 10 questions générées automatiquement</li>
                  <li>✓ 4 choix par question (A, B, C, D)</li>
                  <li>✓ 1 bonne réponse identifiée</li>
                  <li>✓ Justification avec citation normative (Article + Page)</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* EXPORTS */}
        <TabsContent value="exports" className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Formats standards
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between p-2 bg-muted rounded">
                  <span className="font-medium">Word (.docx)</span>
                  <Badge variant="outline">Styles formels</Badge>
                </div>
                <div className="flex items-center justify-between p-2 bg-muted rounded">
                  <span className="font-medium">PowerPoint (.pptx)</span>
                  <Badge variant="outline">6 thèmes</Badge>
                </div>
                <div className="flex items-center justify-between p-2 bg-muted rounded">
                  <span className="font-medium">PDF</span>
                  <Badge variant="outline">Impression</Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Download className="h-5 w-5" />
                  Exports pédagogiques
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between p-2 bg-muted rounded">
                  <span className="font-medium">SCORM 1.2</span>
                  <Badge>LMS Compatible</Badge>
                </div>
                <div className="flex items-center justify-between p-2 bg-muted rounded">
                  <span className="font-medium">Livret Formateur</span>
                  <Badge variant="secondary">Avec corrigés</Badge>
                </div>
                <div className="flex items-center justify-between p-2 bg-muted rounded">
                  <span className="font-medium">Livret Apprenant</span>
                  <Badge variant="secondary">Avec notes</Badge>
                </div>
                <div className="flex items-center justify-between p-2 bg-muted rounded">
                  <span className="font-medium">Fiche Audit Terrain</span>
                  <Badge variant="secondary">Checklist</Badge>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Thèmes PowerPoint professionnels</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                <div className="p-3 border rounded-lg text-center">
                  <div className="w-full h-8 bg-gradient-to-r from-blue-600 to-blue-800 rounded mb-2"></div>
                  <p className="text-sm font-medium">Corporate</p>
                </div>
                <div className="p-3 border rounded-lg text-center">
                  <div className="w-full h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded mb-2"></div>
                  <p className="text-sm font-medium">Creative</p>
                </div>
                <div className="p-3 border rounded-lg text-center">
                  <div className="w-full h-8 bg-gradient-to-r from-gray-100 to-gray-300 rounded mb-2"></div>
                  <p className="text-sm font-medium">Minimal</p>
                </div>
                <div className="p-3 border rounded-lg text-center">
                  <div className="w-full h-8 bg-gradient-to-r from-gray-800 to-gray-900 rounded mb-2"></div>
                  <p className="text-sm font-medium">Dark</p>
                </div>
                <div className="p-3 border rounded-lg text-center">
                  <div className="w-full h-8 bg-gradient-to-r from-green-500 to-emerald-600 rounded mb-2"></div>
                  <p className="text-sm font-medium">Nature</p>
                </div>
                <div className="p-3 border rounded-lg text-center">
                  <div className="w-full h-8 bg-gradient-to-r from-cyan-500 to-blue-500 rounded mb-2"></div>
                  <p className="text-sm font-medium">Tech</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* RACCOURCIS */}
        <TabsContent value="shortcuts" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Keyboard className="h-5 w-5" />
                Raccourcis clavier globaux
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <h4 className="font-medium">Navigation</h4>
                  <div className="space-y-1">
                    <div className="flex justify-between p-2 bg-muted rounded text-sm">
                      <span>Ctrl + S</span>
                      <span className="text-muted-foreground">Sauvegarde</span>
                    </div>
                    <div className="flex justify-between p-2 bg-muted rounded text-sm">
                      <span>Ctrl + N</span>
                      <span className="text-muted-foreground">Nouveau cours</span>
                    </div>
                    <div className="flex justify-between p-2 bg-muted rounded text-sm">
                      <span>Ctrl + E</span>
                      <span className="text-muted-foreground">Exporter</span>
                    </div>
                    <div className="flex justify-between p-2 bg-muted rounded text-sm">
                      <span>Ctrl + /</span>
                      <span className="text-muted-foreground">Aide</span>
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <h4 className="font-medium">Mode Présentation</h4>
                  <div className="space-y-1">
                    <div className="flex justify-between p-2 bg-muted rounded text-sm">
                      <span>F</span>
                      <span className="text-muted-foreground">Plein écran</span>
                    </div>
                    <div className="flex justify-between p-2 bg-muted rounded text-sm">
                      <span>L</span>
                      <span className="text-muted-foreground">Pointeur laser</span>
                    </div>
                    <div className="flex justify-between p-2 bg-muted rounded text-sm">
                      <span>D</span>
                      <span className="text-muted-foreground">Mode dessin</span>
                    </div>
                    <div className="flex justify-between p-2 bg-muted rounded text-sm">
                      <span>G</span>
                      <span className="text-muted-foreground">Grille navigation</span>
                    </div>
                    <div className="flex justify-between p-2 bg-muted rounded text-sm">
                      <span>N</span>
                      <span className="text-muted-foreground">Notes présentateur</span>
                    </div>
                    <div className="flex justify-between p-2 bg-muted rounded text-sm">
                      <span>←/→</span>
                      <span className="text-muted-foreground">Navigation slides</span>
                    </div>
                    <div className="flex justify-between p-2 bg-muted rounded text-sm">
                      <span>Echap</span>
                      <span className="text-muted-foreground">Quitter</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>💡 Conseils d'utilisation</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium mb-2">Performance</h4>
                  <ul className="text-sm space-y-1 text-muted-foreground">
                    <li>• Utilisez le mode robuste pour la rapidité</li>
                    <li>• Sauvegarde automatique toutes les 2 secondes</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Bonnes pratiques</h4>
                  <ul className="text-sm space-y-1 text-muted-foreground">
                    <li>• Testez la démo avant de créer vos cours</li>
                    <li>• Explorez les 8 thèmes normatifs disponibles</li>
                    <li>• Utilisez les exports spécialisés selon le public</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>);

};