/**
 * Exemple: Utiliser useBidirectionalSync directement
 * 
 * Cet exemple montre comment construire un éditeur PERSONNALISÉ
 * en utilisant le hook useBidirectionalSync
 * 
 * À adapter selon vos besoins
 */

import React, { useState } from 'react';
import {
  useBidirectionalSync,
  useAutoSyncToServer } from


'@/hooks/useBidirectionalSync';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Editor from '@monaco-editor/react';

// ============================================================================
// EXEMPLE 1: Éditeur minimaliste (HTML only)
// ============================================================================

export const SimpleHtmlEditor = ({ pageId, initialHtml


}: {pageId: string;initialHtml: string;}) => {
  const {
    html,
    handlers: { handleHtmlChange },
    getAllData
  } = useBidirectionalSync(initialHtml);

  const { isSaving, save } = useAutoSyncToServer(pageId, getAllData());

  return (
    <div className="space-y-4">
      <Editor
        defaultLanguage="html"
        value={html}
        onChange={(val) => handleHtmlChange(val || '')}
        height="400px" />
      
      <Button
        onClick={() => save()}
        disabled={isSaving}>
        
        {isSaving ? 'Sauvegarde...' : 'Sauvegarder'}
      </Button>
    </div>);

};

// ============================================================================
// EXEMPLE 2: Éditeur custom avec 3 modes
// ============================================================================

export const CustomThreeTabEditor = ({ pageId, initialPage }: unknown) => {
  const {
    html,
    contentBlocks,
    jsonString,
    handlers: { handleHtmlChange, handleJsonChange, handleBlocksChange },
    getAllData
  } = useBidirectionalSync(initialPage.content);

  const { isSaving, lastSaved } = useAutoSyncToServer(pageId, getAllData());
  const { toast } = useToast();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Éditeur: {initialPage.title}
          <span className="text-sm font-normal text-gray-500">
            {isSaving ? '💾 Sauvegarde...' : `✓ Sauvegardé`}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="html" className="w-full">
          <TabsList>
            <TabsTrigger value="html">HTML</TabsTrigger>
            <TabsTrigger value="blocks">Structure</TabsTrigger>
            <TabsTrigger value="json">JSON</TabsTrigger>
          </TabsList>

          {/* Onglet HTML */}
          <TabsContent value="html" className="space-y-4">
            <div className="text-sm text-gray-500">
              Éditez le code HTML. Les autres onglets se mettront à jour automatiquement.
            </div>
            <Editor
              language="html"
              value={html}
              onChange={(val) => handleHtmlChange(val || '')}
              height="500px"
              options={{
                wordWrap: 'on',
                formatOnPaste: true,
                formatOnType: true
              }} />
            
          </TabsContent>

          {/* Onglet Structure (ContentBlocks) */}
          <TabsContent value="blocks" className="space-y-4">
            <div className="text-sm text-gray-500">
              Structure de blocs JSON. Modification utile pour architecture données.
            </div>
            <Editor
              language="json"
              value={JSON.stringify(contentBlocks, null, 2)}
              onChange={(val) => handleBlocksChange(JSON.parse(val || '[]'))}
              height="500px"
              options={{
                wordWrap: 'on',
                formatOnPaste: true
              }} />
            
          </TabsContent>

          {/* Onglet JSON */}
          <TabsContent value="json" className="space-y-4">
            <div className="text-sm text-gray-500">
              JSON brut. Attention: syntaxe stricte requise.
            </div>
            <Editor
              language="json"
              value={jsonString}
              onChange={(val) => handleJsonChange(val || '{}')}
              height="500px"
              options={{
                wordWrap: 'on',
                validateIndentation: true
              }} />
            
          </TabsContent>
        </Tabs>

        <div className="mt-4 text-xs text-gray-400">
          Dernier update: {lastSaved?.toLocaleTimeString()}
        </div>
      </CardContent>
    </Card>);

};

// ============================================================================
// EXEMPLE 3: Mode d'affichage côte à côte (Split View)
// ============================================================================

export const SplitViewEditor = ({ pageId, initialPage }: unknown) => {
  const {
    html,
    contentBlocks,
    handlers: { handleHtmlChange },
    getAllData
  } = useBidirectionalSync(initialPage.content);

  const { isSaving } = useAutoSyncToServer(pageId, getAllData());

  return (
    <div className="grid grid-cols-2 gap-4 h-[600px]">
      {/* Gauche: Édition */}
      <div className="border rounded-lg flex flex-col">
        <div className="bg-gray-100 px-4 py-2 border-b">
          <h3 className="font-semibold">Éditeur HTML</h3>
        </div>
        <Editor
          language="html"
          value={html}
          onChange={(val) => handleHtmlChange(val || '')}
          height="100%"
          options={{ wordWrap: 'on' }} />
        
      </div>

      {/* Droite: Aperçu */}
      <div className="border rounded-lg flex flex-col">
        <div className="bg-gray-100 px-4 py-2 border-b flex items-center justify-between">
          <h3 className="font-semibold">Aperçu en temps réel</h3>
          {isSaving && <span className="text-sm text-blue-600">💾 Sync...</span>}
        </div>
        <iframe
          srcDoc={html}
          className="flex-1 bg-white"
          style={{
            border: 'none',
            overflow: 'auto'
          }} />
        
      </div>
    </div>);

};

// ============================================================================
// EXEMPLE 4: Édition inline avec validation
// ============================================================================

export const InlineEditor = ({ pageId, initialPage }: unknown) => {
  const {
    html,
    contentBlocks,
    handlers: { handleHtmlChange },
    getAllData,
    validation
  } = useBidirectionalSync(initialPage.content);

  const { isSaving, error } = useAutoSyncToServer(pageId, getAllData());
  const { toast } = useToast();

  const handlePasteHtml = async () => {
    try {
      const text = await navigator.clipboard.readText();
      handleHtmlChange(text);
      toast({
        title: '✓ HTML collé',
        description: 'Contenu mis à jour et synchronisé'
      });
    } catch {
      toast({
        title: '✗ Erreur',
        description: 'Impossible de coller depuis le presse-papiers',
        variant: 'destructive'
      });
    }
  };

  const handleCopyHtml = async () => {
    try {
      await navigator.clipboard.writeText(html);
      toast({
        title: '✓ Copié',
        description: 'HTML copié dans le presse-papiers'
      });
    } catch {
      toast({
        title: '✗ Erreur',
        description: 'Impossible de copier',
        variant: 'destructive'
      });
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Button onClick={handleCopyHtml} variant="outline">📋 Copier HTML</Button>
        <Button onClick={handlePasteHtml} variant="outline">📌 Coller HTML</Button>
        <div className="ml-auto text-sm p-2">
          {isSaving ?
          <span className="text-blue-600">💾 Synchronisation...</span> :
          error ?
          <span className="text-red-600">⚠️ Erreur: {error}</span> :

          <span className="text-green-600">✓ À jour</span>
          }
        </div>
      </div>

      <Editor
        language="html"
        value={html}
        onChange={(val) => handleHtmlChange(val || '')}
        height="400px" />
      

      <div className="bg-blue-50 p-3 rounded text-sm space-y-2">
        <h4 className="font-semibold">Statistiques:</h4>
        <ul>
          <li>Caractères: {html.length}</li>
          <li>Blocs: {contentBlocks.length}</li>
          {validation.isValid ?
          <li className="text-green-600">✓ HTML valide</li> :

          <li className="text-red-600">✗ HTML invalide</li>
          }
        </ul>
      </div>
    </div>);

};

// ============================================================================
// EXEMPLE 5: Workflow complet avec étapes
// ============================================================================

export const StepByStepEditor = ({ pageId, initialPage }: unknown) => {
  const [step, setStep] = useState<'title' | 'content' | 'publish'>('title');

  const {
    html,
    formData,
    handlers: { handleHtmlChange, handleFormChange },
    getAllData
  } = useBidirectionalSync(initialPage);

  const { isSaving, error } = useAutoSyncToServer(pageId, getAllData());
  const { toast } = useToast();

  const handleNextStep = () => {
    if (step === 'title' && !formData.title) {
      toast({
        title: '❌ Titre requis',
        variant: 'destructive'
      });
      return;
    }
    if (step === 'content' && !html) {
      toast({
        title: '❌ Contenu requis',
        variant: 'destructive'
      });
      return;
    }

    if (step === 'title') setStep('content');else
    if (step === 'content') setStep('publish');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Édition étape par étape</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        
        {/* Étape 1: Titre */}
        {step === 'title' &&
        <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Titre de la page *
              </label>
              <input
              type="text"
              value={formData.title || ''}
              onChange={(e) => handleFormChange({ ...formData, title: e.target.value })}
              className="w-full border rounded px-3 py-2"
              placeholder="Entrez le titre" />
            
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">
                Description (optionnel)
              </label>
              <textarea
              value={formData.meta_description || ''}
              onChange={(e) => handleFormChange({ ...formData, meta_description: e.target.value })}
              className="w-full border rounded px-3 py-2 h-20"
              placeholder="Description courte" />
            
            </div>
          </div>
        }

        {/* Étape 2: Contenu */}
        {step === 'content' &&
        <div className="space-y-4">
            <p className="text-sm text-gray-600">
              Éditez le contenu HTML ci-dessous
            </p>
            <Editor
            language="html"
            value={html}
            onChange={(val) => handleHtmlChange(val || '')}
            height="400px" />
          
          </div>
        }

        {/* Étape 3: Vérification */}
        {step === 'publish' &&
        <div className="space-y-4">
            <div className="bg-blue-50 p-4 rounded space-y-3">
              <h4 className="font-semibold">Avant publication:</h4>
              <ul className="text-sm space-y-2">
                <li>✓ Titre: {formData.title}</li>
                <li>✓ Contenu: {html.length} caractères</li>
                <li>✓ Description: {formData.meta_description || '(non définie)'}</li>
              </ul>
            </div>
            
            <div className="bg-amber-50 p-4 rounded text-sm">
              <p>La page sera sauvegardée automatiquement et publiée sur le site.</p>
            </div>

            {error &&
          <div className="bg-red-50 p-4 rounded text-sm text-red-700">
                Erreur: {error}
              </div>
          }
          </div>
        }

        {/* Navigation */}
        <div className="flex gap-2 justify-between">
          <Button
            onClick={() => {
              if (step === 'content') setStep('title');else
              if (step === 'publish') setStep('content');
            }}
            disabled={step === 'title'}
            variant="outline">
            
            ← Retour
          </Button>

          <div className="text-xs text-gray-500 flex items-center">
            Étape {step === 'title' ? '1' : step === 'content' ? '2' : '3'} / 3
            {isSaving && ' • 💾 Sync...'}
          </div>

          <Button
            onClick={handleNextStep}
            disabled={isSaving}>
            
            {step === 'publish' ? 'Publier →' : 'Suivant →'}
          </Button>
        </div>
      </CardContent>
    </Card>);

};

// ============================================================================
// EXPORT DES EXEMPLES
// ============================================================================

export const ExampleUseCases = {
  simple: {
    component: SimpleHtmlEditor,
    description: 'Éditeur HTML minimaliste',
    useCase: 'Développeurs HTML familiers'
  },
  threeTabs: {
    component: CustomThreeTabEditor,
    description: 'Éditeur 3 onglets (HTML, Blocs, JSON)',
    useCase: 'Architectes données'
  },
  splitView: {
    component: SplitViewEditor,
    description: 'Vue côte à côte: Édition ↔ Aperçu',
    useCase: 'Designers et éditeurs'
  },
  inline: {
    component: InlineEditor,
    description: 'Éditeur inline avec raccourcis',
    useCase: 'Utilisateurs avancés'
  },
  stepByStep: {
    component: StepByStepEditor,
    description: 'Workflow guidé par étapes',
    useCase: 'Utilisateurs novices'
  }
};