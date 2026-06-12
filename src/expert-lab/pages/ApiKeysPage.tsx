import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Key,
  Search,
  ShieldCheck,
  Binary,
  ExternalLink,
  CheckCircle2,
  XCircle,
  Loader2,
  Settings,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface AiConfigResponse {
  success: boolean;
  configs: Record<string, string>;
}

const KNOWN_PROVIDERS: Record<string, string> = {
  provider_openai_key: 'OpenAI',
  provider_anthropic_key: 'Anthropic',
  provider_mistral_key: 'Mistral AI',
  provider_groq_key: 'Groq',
  provider_huggingface_key: 'HuggingFace',
  provider_ollama_key: 'Ollama',
  provider_azure_key: 'Azure OpenAI',
  provider_deepseek_key: 'DeepSeek',
  provider_google_key: 'Google AI',
};

export default function ApiKeysPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [configuredProviders, setConfiguredProviders] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token') || localStorage.getItem('access_token') || '';
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const response = await fetch('/api/ai/config', { headers });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data: AiConfigResponse = await response.json();

      if (data.success && data.configs) {
        const configured = Object.keys(data.configs).filter(
          (key) => KNOWN_PROVIDERS[key] && data.configs[key]?.trim().length > 0,
        );
        setConfiguredProviders(configured);
        setError(null);
      } else {
        setError('Aucune configuration trouvée.');
      }
    } catch (err) {
      console.error('Failed to load AI config:', err);
      setError('Impossible de contacter le serveur de configuration.');
    } finally {
      setLoading(false);
    }
  };

  const allProviderKeys = Object.keys(KNOWN_PROVIDERS);
  const filteredProviderKeys = allProviderKeys.filter(
    (key) =>
      key.toLowerCase().includes(searchTerm.toLowerCase()) ||
      KNOWN_PROVIDERS[key].toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <div className="min-h-screen bg-background p-6 space-y-8 relative overflow-hidden">
      <div className="scanline" />

      {/* HEADER */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-primary/10 pb-6 relative z-10">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 glass border-primary/40 rounded-2xl flex items-center justify-center glow-emerald">
            <Key className="w-8 h-8 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-black uppercase italic tracking-tighter text-foreground">
              Accès <span className="text-primary tracking-normal">Fournisseurs</span>
            </h1>
            <div className="flex items-center gap-2 mt-1">
              <ShieldCheck className="w-3 h-3 text-primary/50" />
              <span className="text-[10px] uppercase font-black tracking-widest text-muted-foreground opacity-50">
                Gestion des Clés API
              </span>
            </div>
          </div>
        </div>
        <Button
          className="bg-primary text-black font-black uppercase tracking-widest h-12 px-8 glow-emerald border-0"
          onClick={() => navigate('/expert/ai-providers')}
        >
          <Settings className="w-4 h-4 mr-2" /> Gérer les fournisseurs
        </Button>
      </div>

      <div className="flex flex-col md:flex-row gap-4 relative z-10">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-primary/40" />
          <Input
            className="glass pl-10 h-12 border-primary/20 bg-black/20 font-mono text-xs"
            placeholder="Rechercher un fournisseur..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* LOADING STATE */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-20 relative z-10">
          <Loader2 className="w-10 h-10 text-primary animate-spin mb-4" />
          <p className="text-sm font-mono text-muted-foreground">
            Chargement des configurations...
          </p>
        </div>
      )}

      {/* ERROR STATE */}
      {error && !loading && (
        <div className="flex flex-col items-center justify-center py-20 relative z-10">
          <div className="w-16 h-16 bg-red-500/10 rounded-2xl flex items-center justify-center mb-4 border border-red-500/20">
            <XCircle className="w-8 h-8 text-red-400" />
          </div>
          <p className="text-sm font-mono text-red-400 mb-2">{error}</p>
          <p className="text-[10px] uppercase font-black tracking-widest text-muted-foreground mb-6">
            Configurez vos clés d'accès aux fournisseurs IA
          </p>
          <Button
            variant="outline"
            className="glass border-primary/20 hover:border-primary/50 h-12 px-6"
            onClick={() => navigate('/expert/ai-providers')}
          >
            <ExternalLink className="w-4 h-4 mr-2" /> Accéder aux fournisseurs
          </Button>
        </div>
      )}

      {/* PROVIDER LIST */}
      {!loading && !error && (
        <div className="space-y-4 relative z-10">
          {filteredProviderKeys.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16">
              <p className="text-sm font-mono text-muted-foreground">Aucun fournisseur trouvé.</p>
            </div>
          ) : (
            filteredProviderKeys.map((providerKey) => {
              const isConfigured = configuredProviders.includes(providerKey);
              const providerName = KNOWN_PROVIDERS[providerKey];

              return (
                <Card
                  key={providerKey}
                  className="glass border-primary/10 hover:border-primary/30 transition-all group"
                >
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary group-hover:glow-emerald transition-all border border-primary/20">
                          <Binary className="w-6 h-6" />
                        </div>
                        <div>
                          <h3 className="text-xl font-black italic uppercase tracking-tighter">
                            {providerName}
                          </h3>
                          <p className="text-[10px] font-mono opacity-40 mt-0.5">{providerKey}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        {isConfigured ? (
                          <Badge className="text-[9px] uppercase font-black tracking-widest bg-emerald-950/30 border-emerald-500/20 text-emerald-400">
                            <CheckCircle2 className="w-3 h-3 mr-1" /> Configuré
                          </Badge>
                        ) : (
                          <Badge
                            variant="outline"
                            className="text-[9px] uppercase font-black tracking-widest border-amber-500/20 text-amber-400 bg-amber-950/30"
                          >
                            <XCircle className="w-3 h-3 mr-1" /> Non configuré
                          </Badge>
                        )}
                        <Button
                          variant="outline"
                          size="sm"
                          className="glass border-primary/10 hover:border-primary/50 h-10"
                          onClick={() => navigate('/expert/ai-providers')}
                        >
                          <Settings className="w-4 h-4 mr-2" /> Configurer
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}

          <div className="pt-4 text-center">
            <p className="text-[10px] uppercase font-black tracking-widest text-muted-foreground opacity-50 mb-2">
              Les clés API sont gérées depuis la page des fournisseurs
            </p>
            <Button
              variant="ghost"
              size="sm"
              className="text-primary/60 hover:text-primary"
              onClick={() => navigate('/expert/ai-providers')}
            >
              <ExternalLink className="w-3 h-3 mr-1" /> Ouvrir la configuration
            </Button>
          </div>
        </div>
      )}

      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-[9px] uppercase font-black tracking-[0.3em] opacity-30">
        Yeai Security Layer - Provider Access Control
      </div>
    </div>
  );
}
