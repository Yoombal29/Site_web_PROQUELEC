
import { useState, useEffect } from 'react';
import { Eye, Type, Contrast, Volume2, Navigation } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';

export function AccessibilityFeatures() {
  const [isOpen, setIsOpen] = useState(false);
  const [settings, setSettings] = useState({
    fontSize: 100,
    contrast: 100,
    dyslexiaFont: false,
    screenReader: false,
    keyboardNav: true
  });

  useEffect(() => {
    // Charger les préférences sauvegardées
    const saved = localStorage.getItem('accessibility-settings');
    if (saved) {
      setSettings(JSON.parse(saved));
    }
  }, []);

  useEffect(() => {
    // Appliquer les paramètres
    const root = document.documentElement;
    
    // Taille de police
    root.style.fontSize = `${settings.fontSize}%`;
    
    // Contraste
    if (settings.contrast !== 100) {
      root.style.filter = `contrast(${settings.contrast}%)`;
    } else {
      root.style.filter = '';
    }
    
    // Police dyslexie
    if (settings.dyslexiaFont) {
      root.style.fontFamily = 'OpenDyslexic, Arial, sans-serif';
    } else {
      root.style.fontFamily = '';
    }
    
    // Navigation au clavier
    if (settings.keyboardNav) {
      root.classList.add('keyboard-navigation');
    } else {
      root.classList.remove('keyboard-navigation');
    }

    // Sauvegarder
    localStorage.setItem('accessibility-settings', JSON.stringify(settings));
  }, [settings]);

  const resetSettings = () => {
    setSettings({
      fontSize: 100,
      contrast: 100,
      dyslexiaFont: false,
      screenReader: false,
      keyboardNav: true
    });
  };

  const announceToScreenReader = (message: string) => {
    const announcement = document.createElement('div');
    announcement.setAttribute('aria-live', 'polite');
    announcement.setAttribute('aria-atomic', 'true');
    announcement.className = 'sr-only';
    announcement.textContent = message;
    document.body.appendChild(announcement);
    setTimeout(() => document.body.removeChild(announcement), 1000);
  };

  return (
    <>
      {/* Bouton d'accessibilité fixe */}
      <Button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-4 right-4 z-50 bg-proqblue hover:bg-proqblue-dark rounded-full p-3 shadow-lg"
        aria-label="Ouvrir les options d'accessibilité"
        title="Options d'accessibilité"
      >
        <Eye className="h-5 w-5" />
      </Button>

      {/* Panneau d'accessibilité */}
      {isOpen && (
        <Card className="fixed bottom-20 right-4 z-50 w-80 shadow-2xl">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-proqblue">
                Accessibilité
              </h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsOpen(false)}
                aria-label="Fermer les options d'accessibilité"
              >
                ×
              </Button>
            </div>

            <div className="space-y-6">
              {/* Taille de police */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Type className="h-4 w-4 text-proqblue" />
                  <label className="text-sm font-medium">
                    Taille de police: {settings.fontSize}%
                  </label>
                </div>
                <Slider
                  value={[settings.fontSize]}
                  onValueChange={([value]) => {
                    setSettings(s => ({ ...s, fontSize: value }));
                    announceToScreenReader(`Taille de police: ${value}%`);
                  }}
                  min={80}
                  max={150}
                  step={10}
                  className="w-full"
                />
              </div>

              {/* Contraste */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Contrast className="h-4 w-4 text-proqblue" />
                  <label className="text-sm font-medium">
                    Contraste: {settings.contrast}%
                  </label>
                </div>
                <Slider
                  value={[settings.contrast]}
                  onValueChange={([value]) => {
                    setSettings(s => ({ ...s, contrast: value }));
                    announceToScreenReader(`Contraste: ${value}%`);
                  }}
                  min={50}
                  max={200}
                  step={10}
                  className="w-full"
                />
              </div>

              {/* Police dyslexie */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Type className="h-4 w-4 text-proqblue" />
                  <label className="text-sm font-medium">
                    Police pour dyslexie
                  </label>
                </div>
                <Switch
                  checked={settings.dyslexiaFont}
                  onCheckedChange={(checked) => {
                    setSettings(s => ({ ...s, dyslexiaFont: checked }));
                    announceToScreenReader(
                      checked ? 'Police dyslexie activée' : 'Police dyslexie désactivée'
                    );
                  }}
                />
              </div>

              {/* Navigation clavier */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Navigation className="h-4 w-4 text-proqblue" />
                  <label className="text-sm font-medium">
                    Navigation clavier
                  </label>
                </div>
                <Switch
                  checked={settings.keyboardNav}
                  onCheckedChange={(checked) => {
                    setSettings(s => ({ ...s, keyboardNav: checked }));
                    announceToScreenReader(
                      checked ? 'Navigation clavier activée' : 'Navigation clavier désactivée'
                    );
                  }}
                />
              </div>

              {/* Lecteur d'écran */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Volume2 className="h-4 w-4 text-proqblue" />
                  <label className="text-sm font-medium">
                    Mode lecteur d'écran
                  </label>
                </div>
                <Switch
                  checked={settings.screenReader}
                  onCheckedChange={(checked) => {
                    setSettings(s => ({ ...s, screenReader: checked }));
                    announceToScreenReader(
                      checked ? 'Mode lecteur d\'écran activé' : 'Mode lecteur d\'écran désactivé'
                    );
                  }}
                />
              </div>

              {/* Bouton reset */}
              <Button
                variant="outline"
                onClick={resetSettings}
                className="w-full"
              >
                Réinitialiser
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Overlay pour fermer */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
          aria-hidden="true"
        />
      )}
    </>
  );
}
