import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Sparkles, Send, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface AIEditorProps {
  currentContent: unknown;
  onContentUpdate: (newContent: unknown) => void;
  pageKey: string;
}

/**
 * ÉDITEUR IA - Modifie le contenu via langage naturel
 * 
 * Utilise le backend Haystack/PHI-3 pour :
 * - Réécrire des textes
 * - Générer des variantes
 * - Créer de nouvelles sections
 * - Optimiser le contenu
 */
export default function AIContentEditor({ currentContent, onContentUpdate, pageKey }: AIEditorProps) {
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleAIGeneration = async () => {
    if (!prompt.trim()) {
      toast({
        title: '⚠️ Prompt vide',
        description: 'Veuillez décrire ce que vous souhaitez modifier',
        variant: 'destructive'
      });
      return;
    }

    setLoading(true);

    try {
      // Appel à votre backend Haystack
      const response = await fetch('/api/ai/content-generation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt,
          currentContent,
          pageKey,
          action: 'modify' // ou 'generate', 'optimize', 'translate', etc.
        })
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la génération IA');
      }

      const data = await response.json();

      // Mettre à jour le contenu avec la réponse de l'IA
      onContentUpdate(data.modifiedContent);

      toast({
        title: '✨ Contenu modifié par l\'IA',
        description: data.summary || 'Les modifications ont été appliquées avec succès'
      });

      setPrompt(''); // Réinitialiser le prompt

    } catch (error) {
      console.error('Erreur IA:', error);
      toast({
        title: '❌ Erreur',
        description: 'Impossible de générer le contenu. Vérifiez que le serveur Haystack est démarré.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const examplePrompts = [
  'Rends le titre plus percutant',
  'Ajoute une section sur les garanties',
  'Réécris le texte en style plus formel',
  'Traduis tout en anglais',
  'Génère 3 témoignages clients',
  'Crée des statistiques impactantes',
  'Ajoute des appels à l\'action'];


  return (
    <Card className="border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-pink-50">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-purple-900">
                    <Sparkles className="w-5 h-5" />
                    Éditeur IA (PHI-3)
                </CardTitle>
                <CardDescription>
                    Modifiez votre contenu en langage naturel. L'IA comprend vos instructions et met à jour la page automatiquement.
                </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
                {/* Zone de prompt */}
                <div>
                    <Textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Ex: Ajoute une section sur les tarifs avec 3 formules (Basic, Pro, Enterprise) et leurs avantages respectifs"
            className="min-h-[120px] bg-white"
            disabled={loading} />
          
                </div>

                {/* Bouton de génération */}
                <Button
          onClick={handleAIGeneration}
          disabled={loading || !prompt.trim()}
          className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
          size="lg">
          
                    {loading ?
          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Génération en cours...
                        </> :

          <>
                            <Send className="w-4 h-4 mr-2" />
                            Générer avec l'IA
                        </>
          }
                </Button>

                {/* Prompts d'exemple */}
                <div className="pt-4 border-t">
                    <p className="text-sm font-semibold text-slate-700 mb-3">💡 Exemples de prompts :</p>
                    <div className="flex flex-wrap gap-2">
                        {examplePrompts.map((example, idx) =>
            <button
              key={idx}
              onClick={() => setPrompt(example)}
              className="text-xs px-3 py-1.5 bg-white border border-purple-200 rounded-full hover:bg-purple-50 hover:border-purple-300 transition-colors"
              disabled={loading} aria-label="Action">
              
                                {example}
                            </button>
            )}
                    </div>
                </div>

                {/* Informations supplémentaires */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm">
                    <p className="font-semibold text-blue-900 mb-2">🤖 Ce que l'IA peut faire :</p>
                    <ul className="space-y-1 text-blue-800">
                        <li>✓ Réécrire, reformuler, traduire du texte</li>
                        <li>✓ Générer des sections complètes (features, FAQ, témoignages...)</li>
                        <li>✓ Créer des variantes de design</li>
                        <li>✓ Optimiser pour le SEO</li>
                        <li>✓ Adapter le ton (formel, casual, technique...)</li>
                    </ul>
                </div>
            </CardContent>
        </Card>);

}