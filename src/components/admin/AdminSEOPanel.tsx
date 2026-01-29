
import { useState } from 'react';
import { Download, Search, Globe, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { sitemapGenerator } from '@/utils/sitemapGenerator';

export function AdminSEOPanel() {
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  const handleGenerateSitemap = async () => {
    setIsGenerating(true);
    try {
      await sitemapGenerator.downloadSitemap();
      toast({
        title: 'Sitemap généré',
        description: 'Le fichier sitemap.xml a été téléchargé avec succès.',
      });
    } catch (error) {
      toast({
        title: 'Erreur',
        description: 'Impossible de générer le sitemap.',
        variant: 'destructive'
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold text-proqblue">SEO & Référencement</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5 text-proqblue" />
              Sitemap
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Générez un sitemap XML automatique incluant toutes vos pages, articles et événements.
            </p>
            <Button 
              onClick={handleGenerateSitemap}
              disabled={isGenerating}
              className="w-full"
            >
              {isGenerating ? (
                <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2" />
              ) : (
                <Download className="h-4 w-4 mr-2" />
              )}
              Télécharger Sitemap
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5 text-proqblue" />
              Meta Tags
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Les meta tags sont automatiquement gérés par le système SEO pour chaque page.
            </p>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span>Title dynamique:</span>
                <span className="text-green-600">✓ Actif</span>
              </div>
              <div className="flex justify-between">
                <span>Meta description:</span>
                <span className="text-green-600">✓ Actif</span>
              </div>
              <div className="flex justify-between">
                <span>Open Graph:</span>
                <span className="text-green-600">✓ Actif</span>
              </div>
              <div className="flex justify-between">
                <span>Schema.org:</span>
                <span className="text-green-600">✓ Actif</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-proqblue" />
            Optimisations SEO Actives
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <h4 className="font-medium mb-2">Structure</h4>
              <ul className="space-y-1 text-muted-foreground">
                <li>✓ URLs sémantiques</li>
                <li>✓ Hiérarchie H1-H6</li>
                <li>✓ Navigation breadcrumb</li>
                <li>✓ Maillage interne</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2">Performance</h4>
              <ul className="space-y-1 text-muted-foreground">
                <li>✓ Images optimisées</li>
                <li>✓ Compression gzip</li>
                <li>✓ Cache navigateur</li>
                <li>✓ Chargement différé</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2">Contenu</h4>
              <ul className="space-y-1 text-muted-foreground">
                <li>✓ Contenu unique</li>
                <li>✓ Mots-clés ciblés</li>
                <li>✓ Contenu frais</li>
                <li>✓ Rich snippets</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2">Technique</h4>
              <ul className="space-y-1 text-muted-foreground">
                <li>✓ HTTPS sécurisé</li>
                <li>✓ Mobile-first</li>
                <li>✓ Vitesse de chargement</li>
                <li>✓ Accessibilité WCAG</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
