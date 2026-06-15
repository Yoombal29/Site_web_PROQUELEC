/**
 * AppDetailPage.tsx
 * Page de détail d'un outil (utilisée pour /apps/:appId)
 * Affiche les infos de l'outil, son statut, et permet de s'inscrire pour les "coming soon"
 */
import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { SEO } from '@/components/SEO';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import {
  ArrowLeft,
  Clock,
  Mail,
  Bell,
  CheckCircle2,
  Cpu,
  ExternalLink,
} from 'lucide-react';
import { freeApps, premiumApps } from '@/data/applications-catalog';
import { useGlobalHeader } from '@/components/MainLayout';

const allApps = [...freeApps, ...premiumApps];
const appMap = new Map(allApps.map((a) => [a.id, a]));

export default function AppDetailPage() {
  useGlobalHeader().setHide(true);
  const { appId } = useParams<{ appId: string }>();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');

  const app = appId ? appMap.get(appId) : undefined;

  if (!app) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <div className="max-w-2xl mx-auto px-4 py-20 text-center">
          <Cpu className="w-16 h-16 text-slate-200 mx-auto mb-6" />
          <h1 className="text-3xl font-bold text-slate-900 mb-3">Outil introuvable</h1>
          <p className="text-slate-500 mb-8">
            L'outil que vous recherchez n'existe pas ou a été retiré.
          </p>
          <Button onClick={() => navigate('/outils')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Retour aux outils
          </Button>
        </div>
        <Footer />
      </div>
    );
  }

  const isComing = app.status === 'coming';
  const isActive = app.status === 'active';
  const isPremium = app.category === 'premium';
  const notifyKey = `proquelec_notify_${app.id}`;
  const alreadyNotified = localStorage.getItem(notifyKey) === 'true';

  const handleNotify = () => {
    if (!email) {
      toast.error('Veuillez entrer votre email');
      return;
    }
    localStorage.setItem(notifyKey, 'true');
    // Simuler l'enregistrement
    toast.success(`Vous serez notifié quand "${app.title}" sera disponible !`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <SEO
        title={`${app.title} - PROQUELEC`}
        description={app.description}
      />
      <Header />

      <main className="max-w-4xl mx-auto px-4 py-12">
        {/* Retour */}
        <button
          onClick={() => navigate('/outils')}
          className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-800 font-medium mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Retour au catalogue
        </button>

        {/* Hero */}
        <div className="flex flex-col md:flex-row gap-8 mb-12">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-4">
              <Badge
                className={
                  isPremium
                    ? 'bg-amber-500/10 text-amber-600 border-amber-200'
                    : 'bg-emerald-500/10 text-emerald-600 border-emerald-200'
                }
              >
                {isPremium ? 'PREMIUM' : 'GRATUIT'}
              </Badge>
              <Badge
                className={
                  isActive
                    ? 'bg-green-500/10 text-green-600 border-green-200'
                    : 'bg-amber-500/10 text-amber-600 border-amber-200'
                }
              >
                {isActive ? 'ACTIF' : 'BIENTÔT'}
              </Badge>
              {app.norme && (
                <Badge variant="outline" className="text-xs text-slate-500">
                  {app.norme}
                </Badge>
              )}
            </div>

            <h1 className="text-4xl md:text-5xl font-black text-slate-900 mb-4">
              {app.title}
            </h1>
            <p className="text-lg text-slate-600 leading-relaxed mb-6">
              {app.description}
            </p>

            <div className="flex items-center gap-2 text-sm text-slate-500 mb-8">
              <span className="font-medium">{app.group}</span>
              <span className="text-slate-300">•</span>
              <span>{app.category === 'premium' ? 'Abonnement Premium requis' : 'Accès libre'}</span>
            </div>

            {isComing && (
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 mb-8">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Clock className="w-5 h-5 text-amber-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-amber-900 mb-1">Bientôt disponible</h3>
                    <p className="text-sm text-amber-700 mb-4">
                      Cet outil est en cours de développement. Laissez-nous votre email pour être
                      notifié dès son lancement.
                    </p>
                    {alreadyNotified ? (
                      <div className="flex items-center gap-2 text-sm font-medium text-green-600">
                        <CheckCircle2 className="w-4 h-4" />
                        Vous serez notifié dès le lancement
                      </div>
                    ) : (
                      <div className="flex gap-2">
                        <Input
                          type="email"
                          placeholder="Votre email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="max-w-xs"
                        />
                        <Button onClick={handleNotify}>
                          <Bell className="w-4 h-4 mr-2" />
                          M'avertir
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {isActive && (
              <Button
                size="lg"
                onClick={() => navigate('/outils')}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold shadow-lg"
              >
                Accéder à l'outil
                <ExternalLink className="w-4 h-4 ml-2" />
              </Button>
            )}
          </div>

          {/* Sidebar */}
          <div className="w-full md:w-72 space-y-4">
            <Card>
              <CardContent className="p-4">
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
                  Informations
                </h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Statut</span>
                    <span className="font-medium text-slate-800">
                      {isActive ? 'Disponible' : 'En développement'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Catégorie</span>
                    <span className="font-medium text-slate-800">{app.group}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Accès</span>
                    <span className="font-medium text-slate-800">
                      {isPremium ? 'Premium' : 'Gratuit'}
                    </span>
                  </div>
                  {app.norme && (
                    <div className="flex justify-between">
                      <span className="text-slate-500">Norme</span>
                      <span className="font-medium text-slate-800">{app.norme}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
