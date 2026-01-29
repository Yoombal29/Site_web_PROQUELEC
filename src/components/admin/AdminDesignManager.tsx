import React, { useState, useMemo } from 'react';
import {
  Palette, Copy, RotateCcw, Eye, Download, Upload,
  Plus, Trash2, Settings, Lock, Unlock, Check
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

interface ColorScheme {
  id: string;
  name: string;
  primary: string;
  secondary: string;
  accent: string;
  success: string;
  warning: string;
  danger: string;
  info: string;
  dark: string;
  light: string;
  neutral: string;
}

interface DesignConfig {
  colorScheme: ColorScheme;
  primaryFont: string;
  secondaryFont: string;
  fontSize: {
    xs: number;
    sm: number;
    base: number;
    lg: number;
    xl: number;
    '2xl': number;
    '3xl': number;
  };
  spacing: {
    xs: number;
    sm: number;
    md: number;
    lg: number;
    xl: number;
    '2xl': number;
  };
  borderRadius: {
    none: number;
    sm: number;
    md: number;
    lg: number;
    full: number;
  };
}

const AdminDesignManager: React.FC = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<'colors' | 'typography' | 'spacing' | 'presets'>('colors');
  const [colorScheme, setColorScheme] = useState<ColorScheme>({
    id: 'default',
    name: 'PROQUELEC Standard',
    primary: '#2376df',
    secondary: '#054393',
    accent: '#16a34a',
    success: '#16a34a',
    warning: '#ea580c',
    danger: '#dc2626',
    info: '#0ea5e9',
    dark: '#111827',
    light: '#f9fafb',
    neutral: '#6b7280'
  });

  const [fonts, setFonts] = useState({
    primary: 'Roboto',
    secondary: 'Open Sans'
  });

  const [fontSizes, setFontSizes] = useState({
    xs: 12,
    sm: 14,
    base: 16,
    lg: 18,
    xl: 20,
    '2xl': 24,
    '3xl': 30
  });

  const [spacing, setSpacing] = useState({
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    '2xl': 48
  });

  const [borderRadius, setBorderRadius] = useState({
    none: 0,
    sm: 4,
    md: 8,
    lg: 12,
    full: 999
  });

  const predefinedSchemes: ColorScheme[] = [
    {
      id: 'modern-blue',
      name: 'Modern Blue',
      primary: '#0066cc',
      secondary: '#004999',
      accent: '#00d9ff',
      success: '#10b981',
      warning: '#f59e0b',
      danger: '#ef4444',
      info: '#3b82f6',
      dark: '#1f2937',
      light: '#f3f4f6',
      neutral: '#9ca3af'
    },
    {
      id: 'sunset',
      name: 'Sunset',
      primary: '#ff6b35',
      secondary: '#f7931e',
      accent: '#ffd60a',
      success: '#52b788',
      warning: '#ff9a3d',
      danger: '#e63946',
      info: '#4a90e2',
      dark: '#2d3436',
      light: '#fafafa',
      neutral: '#bdbdbd'
    },
    {
      id: 'ocean',
      name: 'Ocean',
      primary: '#006994',
      secondary: '#004d6d',
      accent: '#0891b2',
      success: '#059669',
      warning: '#d97706',
      danger: '#dc2626',
      info: '#0284c7',
      dark: '#0f172a',
      light: '#f1f5f9',
      neutral: '#64748b'
    },
    {
      id: 'forest',
      name: 'Forest',
      primary: '#1d4d2d',
      secondary: '#0f3d1a',
      accent: '#65a30d',
      success: '#15803d',
      warning: '#ca8a04',
      danger: '#991b1b',
      info: '#0369a1',
      dark: '#1e293b',
      light: '#f8fafc',
      neutral: '#78716c'
    },
    {
      id: 'vibrant',
      name: 'Vibrant',
      primary: '#6d28d9',
      secondary: '#7c3aed',
      accent: '#ec4899',
      success: '#10b981',
      warning: '#f59e0b',
      danger: '#ef4444',
      info: '#06b6d4',
      dark: '#1f2937',
      light: '#f8fafc',
      neutral: '#d1d5db'
    }
  ];

  const colorPalette = [
    { key: 'primary', label: 'Primaire', tooltip: 'Couleur principale du site' },
    { key: 'secondary', label: 'Secondaire', tooltip: 'Couleur secondaire' },
    { key: 'accent', label: 'Accent', tooltip: 'Couleur d\'accent' },
    { key: 'success', label: 'Succès', tooltip: 'Couleur de succès' },
    { key: 'warning', label: 'Avertissement', tooltip: 'Couleur d\'avertissement' },
    { key: 'danger', label: 'Danger', tooltip: 'Couleur de danger' },
    { key: 'info', label: 'Info', tooltip: 'Couleur informationnelle' },
    { key: 'dark', label: 'Sombre', tooltip: 'Couleur sombre de base' },
    { key: 'light', label: 'Clair', tooltip: 'Couleur claire de base' },
    { key: 'neutral', label: 'Neutre', tooltip: 'Couleur neutre' }
  ];

  const handleColorChange = (colorKey: keyof Omit<ColorScheme, 'id' | 'name'>, value: string) => {
    setColorScheme(prev => ({
      ...prev,
      [colorKey]: value
    }));
  };

  const handleApplyScheme = (scheme: ColorScheme) => {
    setColorScheme(scheme);
    toast({
      title: 'Succès',
      description: `Palette "${scheme.name}" appliquée`,
      variant: 'default'
    });
  };

  const handleExportCSS = () => {
    const cssVariables = `
/* Generated CSS Variables for ${colorScheme.name} */
:root {
  --color-primary: ${colorScheme.primary};
  --color-secondary: ${colorScheme.secondary};
  --color-accent: ${colorScheme.accent};
  --color-success: ${colorScheme.success};
  --color-warning: ${colorScheme.warning};
  --color-danger: ${colorScheme.danger};
  --color-info: ${colorScheme.info};
  --color-dark: ${colorScheme.dark};
  --color-light: ${colorScheme.light};
  --color-neutral: ${colorScheme.neutral};

  /* Typography */
  --font-primary: '${fonts.primary}', sans-serif;
  --font-secondary: '${fonts.secondary}', sans-serif;
  
  /* Font Sizes */
  --text-xs: ${fontSizes.xs}px;
  --text-sm: ${fontSizes.sm}px;
  --text-base: ${fontSizes.base}px;
  --text-lg: ${fontSizes.lg}px;
  --text-xl: ${fontSizes.xl}px;
  --text-2xl: ${fontSizes['2xl']}px;
  --text-3xl: ${fontSizes['3xl']}px;

  /* Spacing */
  --space-xs: ${spacing.xs}px;
  --space-sm: ${spacing.sm}px;
  --space-md: ${spacing.md}px;
  --space-lg: ${spacing.lg}px;
  --space-xl: ${spacing.xl}px;
  --space-2xl: ${spacing['2xl']}px;

  /* Border Radius */
  --radius-none: ${borderRadius.none}px;
  --radius-sm: ${borderRadius.sm}px;
  --radius-md: ${borderRadius.md}px;
  --radius-lg: ${borderRadius.lg}px;
  --radius-full: ${borderRadius.full}px;
}
    `.trim();

    // Copier dans le presse-papiers
    navigator.clipboard.writeText(cssVariables);
    toast({
      title: 'Succès',
      description: 'Variables CSS copiées',
      variant: 'default'
    });
  };

  const handleDownloadConfig = () => {
    const config = {
      colorScheme,
      fonts,
      fontSizes,
      spacing,
      borderRadius,
      exportedAt: new Date().toISOString()
    };

    const dataStr = JSON.stringify(config, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `design-config-${new Date().getTime()}.json`;
    link.click();
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Onglets */}
      <div className="bg-white rounded-xl shadow border-b flex overflow-x-auto">
        {[
          { id: 'colors', label: '🎨 Couleurs' },
          { id: 'typography', label: '✍️ Typographie' },
          { id: 'spacing', label: '📏 Espacement' },
          { id: 'presets', label: '⭐ Présets' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-6 py-3 font-medium text-sm whitespace-nowrap transition border-b-2 ${
              activeTab === tab.id
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Onglet Couleurs */}
      {activeTab === 'colors' && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Palette de Couleurs</h2>
                <p className="text-gray-600 text-sm mt-1">Personnalisez la palette de couleurs du site</p>
              </div>
              <div className="flex gap-2">
                <Button onClick={handleExportCSS} variant="outline" className="gap-2">
                  <Copy className="w-4 h-4" />
                  Exporter CSS
                </Button>
                <Button onClick={handleDownloadConfig} className="bg-blue-600 hover:bg-blue-700 gap-2">
                  <Download className="w-4 h-4" />
                  Télécharger
                </Button>
              </div>
            </div>

            {/* Aperçu actuel */}
            <div className="mb-8 p-6 bg-gradient-to-br rounded-lg" style={{
              backgroundImage: `linear-gradient(135deg, ${colorScheme.primary} 0%, ${colorScheme.secondary} 100%)`
            }}>
              <h3 className="text-white text-lg font-semibold mb-4">{colorScheme.name}</h3>
              <div className="grid grid-cols-5 gap-3">
                {colorPalette.slice(0, 5).map(color => (
                  <div key={color.key} className="text-center">
                    <div
                      className="w-full h-16 rounded-lg mb-2 shadow transition hover:scale-105 cursor-pointer"
                      style={{ backgroundColor: (colorScheme as any)[color.key] }}
                      title={color.tooltip}
                    />
                    <p className="text-white text-xs font-medium">{color.label}</p>
                    <p className="text-white text-xs opacity-75">{(colorScheme as any)[color.key]}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Sélecteurs de couleur */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
              {colorPalette.map(color => (
                <div key={color.key}>
                  <label className="block text-sm font-medium text-gray-900 mb-2">{color.label}</label>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      value={(colorScheme as any)[color.key]}
                      onChange={(e) => handleColorChange(color.key as any, e.target.value)}
                      className="w-12 h-10 border border-gray-300 rounded-lg cursor-pointer"
                    />
                    <input
                      type="text"
                      value={(colorScheme as any)[color.key]}
                      onChange={(e) => handleColorChange(color.key as any, e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Onglet Typographie */}
      {activeTab === 'typography' && (
        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Typographie</h2>

          <div className="space-y-8">
            {/* Polices */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Polices</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">Police Primaire</label>
                  <select
                    value={fonts.primary}
                    onChange={(e) => setFonts(prev => ({ ...prev, primary: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                  >
                    <option>Roboto</option>
                    <option>Open Sans</option>
                    <option>Poppins</option>
                    <option>Inter</option>
                    <option>Playfair Display</option>
                    <option>Lato</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">Police Secondaire</label>
                  <select
                    value={fonts.secondary}
                    onChange={(e) => setFonts(prev => ({ ...prev, secondary: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                  >
                    <option>Open Sans</option>
                    <option>Roboto</option>
                    <option>Poppins</option>
                    <option>Inter</option>
                    <option>Source Sans Pro</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Tailles de police */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Tailles de Police</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {Object.entries(fontSizes).map(([key, value]) => (
                  <div key={key}>
                    <label className="block text-sm font-medium text-gray-900 mb-2">{key.toUpperCase()}</label>
                    <div className="flex gap-2">
                      <input
                        type="number"
                        value={value}
                        onChange={(e) => setFontSizes(prev => ({ ...prev, [key]: parseInt(e.target.value) }))}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                      />
                      <span className="px-2 py-2 bg-gray-100 rounded-lg text-sm font-medium text-gray-600">px</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Aperçu typographie */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Aperçu</h3>
              <div className="space-y-4 p-6 bg-gray-50 rounded-lg border">
                <div style={{ fontFamily: fonts.primary }}>
                  <p style={{ fontSize: fontSizes['3xl'] }} className="font-bold mb-2">Très grand titre (3xl)</p>
                  <p style={{ fontSize: fontSizes['2xl'] }} className="font-bold mb-2">Grand titre (2xl)</p>
                  <p style={{ fontSize: fontSizes.xl }} className="font-semibold mb-2">Titre (xl)</p>
                  <p style={{ fontSize: fontSizes.lg }} className="font-medium mb-2">Sous-titre (lg)</p>
                  <p style={{ fontSize: fontSizes.base }} className="mb-2">Texte normal (base)</p>
                  <p style={{ fontSize: fontSizes.sm }} className="text-gray-600">Petit texte (sm)</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Onglet Espacement */}
      {activeTab === 'spacing' && (
        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Espacement et Rayon</h2>

          <div className="space-y-8">
            {/* Espacement */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Espacement</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                {Object.entries(spacing).map(([key, value]) => (
                  <div key={key}>
                    <label className="block text-sm font-medium text-gray-900 mb-2">{key.toUpperCase()}</label>
                    <div className="flex gap-2">
                      <input
                        type="number"
                        value={value}
                        onChange={(e) => setSpacing(prev => ({ ...prev, [key]: parseInt(e.target.value) }))}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                      />
                      <span className="px-2 py-2 bg-gray-100 rounded-lg text-sm font-medium text-gray-600">px</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Rayon de bordure */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Rayon de Bordure</h3>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                {Object.entries(borderRadius).map(([key, value]) => (
                  <div key={key}>
                    <label className="block text-sm font-medium text-gray-900 mb-2">{key.toUpperCase()}</label>
                    <div className="flex gap-2">
                      <input
                        type="number"
                        value={value}
                        onChange={(e) => setBorderRadius(prev => ({ ...prev, [key]: parseInt(e.target.value) }))}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                      />
                      <span className="px-2 py-2 bg-gray-100 rounded-lg text-sm font-medium text-gray-600">px</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Aperçu rayon */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Aperçu Rayon de Bordure</h3>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-6 p-6 bg-gray-50 rounded-lg border">
                {Object.entries(borderRadius).map(([key, value]) => (
                  <div key={key} className="text-center">
                    <div
                      className="w-full h-20 mb-2 bg-gradient-to-r from-blue-600 to-purple-600"
                      style={{ borderRadius: `${value}px` }}
                    />
                    <p className="text-sm font-medium text-gray-900">{key}</p>
                    <p className="text-xs text-gray-500">{value}px</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Onglet Présets */}
      {activeTab === 'presets' && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Palettes de Couleurs Prédéfinies</h2>
            <p className="text-gray-600 mb-6">Choisissez parmi nos palettes de couleurs professionnelles ou créez la vôtre</p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {predefinedSchemes.map(scheme => (
                <div key={scheme.id} className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition">
                  <div
                    className="h-32 flex items-end justify-between p-4"
                    style={{
                      backgroundImage: `linear-gradient(135deg, ${scheme.primary} 0%, ${scheme.secondary} 100%)`
                    }}
                  >
                    <div className="text-white">
                      <p className="font-bold">{scheme.name}</p>
                    </div>
                    {colorScheme.id === scheme.id && (
                      <div className="bg-white rounded-full p-2">
                        <Check className="w-5 h-5 text-green-600" />
                      </div>
                    )}
                  </div>

                  <div className="p-4 space-y-4">
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { color: scheme.primary, label: 'Primary' },
                        { color: scheme.secondary, label: 'Secondary' },
                        { color: scheme.accent, label: 'Accent' },
                        { color: scheme.success, label: 'Success' },
                        { color: scheme.warning, label: 'Warning' },
                        { color: scheme.danger, label: 'Danger' }
                      ].map((item, idx) => (
                        <div key={idx} className="text-center">
                          <div
                            className="w-full h-8 rounded mb-1"
                            style={{ backgroundColor: item.color }}
                          />
                          <p className="text-xs text-gray-500">{item.label}</p>
                        </div>
                      ))}
                    </div>

                    <Button
                      onClick={() => handleApplyScheme(scheme)}
                      className={`w-full ${
                        colorScheme.id === scheme.id
                          ? 'bg-green-600 hover:bg-green-700'
                          : 'bg-blue-600 hover:bg-blue-700'
                      } gap-2`}
                    >
                      {colorScheme.id === scheme.id ? (
                        <>
                          <Check className="w-4 h-4" />
                          Appliquée
                        </>
                      ) : (
                        <>
                          <Palette className="w-4 h-4" />
                          Appliquer
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Actions globales */}
      <div className="bg-white rounded-xl shadow p-6 flex gap-4">
        <Button onClick={handleExportCSS} variant="outline" className="gap-2">
          <Copy className="w-4 h-4" />
          Exporter CSS
        </Button>
        <Button onClick={handleDownloadConfig} className="bg-blue-600 hover:bg-blue-700 gap-2">
          <Download className="w-4 h-4" />
          Télécharger la config
        </Button>
        <Button variant="outline" className="gap-2 ml-auto">
          <RotateCcw className="w-4 h-4" />
          Réinitialiser par défaut
        </Button>
      </div>
    </div>
  );
};

export default AdminDesignManager;
