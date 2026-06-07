/**
 * PremiumPaywall.tsx
 * Paywall overlay pour outils premium — invite à s'abonner ou à se connecter
 */
import React from 'react';
import { Crown, Lock, ArrowRight, LogIn, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface PremiumPaywallProps {
  toolName: string;
  toolId?: string;
  onBack: () => void;
  onTryDemo?: () => void;
}

const PremiumPaywall: React.FC<PremiumPaywallProps> = ({ toolName, toolId, onBack, onTryDemo }) => {
  const isLoggedIn = !!localStorage.getItem('token');

  // Vérifier si la démo a déjà été utilisée pour cet outil
  const demoKey = toolId ? `proquelec_demo_${toolId}` : null;
  const hasUsedDemo = demoKey ? localStorage.getItem(demoKey) === 'true' : true;

  return (
    <div className="min-h-[500px] flex items-center justify-center p-4 md:p-8">
      <Card className="w-full max-w-lg bg-gradient-to-br from-[#0d2a21] to-[#071914] border-emerald-800/40 shadow-2xl">
        <CardContent className="p-8 md:p-12 text-center space-y-6">
          {/* Icône cadenas + couronne */}
          <div className="relative w-20 h-20 mx-auto">
            <div className="absolute inset-0 bg-amber-500/20 rounded-full blur-xl" />
            <div className="relative w-20 h-20 bg-gradient-to-br from-amber-400 to-orange-600 rounded-full flex items-center justify-center shadow-lg shadow-amber-500/20">
              <Lock className="w-8 h-8 text-white" />
            </div>
            <div className="absolute -top-1 -right-1 w-8 h-8 bg-amber-400 rounded-full flex items-center justify-center shadow-lg">
              <Crown className="w-4 h-4 text-slate-900" />
            </div>
          </div>

          {/* Titre */}
          <div className="space-y-2">
            <Badge className="bg-amber-500/10 text-amber-400 border-amber-500/30 px-3 py-1 rounded-full text-xs font-black uppercase tracking-widest">
              OUTIL PREMIUM
            </Badge>
            <h2 className="text-2xl md:text-3xl font-black text-white">{toolName}</h2>
            <p className="text-slate-400 text-sm md:text-base leading-relaxed max-w-sm mx-auto">
              Cet outil est réservé aux abonnés Premium. Accédez à tous les outils professionnels et
              bénéficiez de calculs certifiants, diagnostics avancés et exports PDF.
            </p>
          </div>

          {/* Fonctionnalités Premium */}
          <div className="grid grid-cols-2 gap-3 text-left">
            {[
              'Calculateurs avancés',
              'Diagnostics IA',
              'Exports PDF & Word',
              'Support prioritaire',
            ].map((feature) => (
              <div
                key={feature}
                className="flex items-center gap-2 text-sm text-slate-300 bg-white/5 rounded-lg px-3 py-2 border border-white/5"
              >
                <Crown className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span>{feature}</span>
              </div>
            ))}
          </div>

          {/* CTA */}
          {isLoggedIn ? (
            <Button
              onClick={() => (window.location.href = '/abonnements')}
              className="w-full h-12 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-slate-950 font-black rounded-xl text-base shadow-xl shadow-amber-500/20 transition-all active:scale-95"
            >
              <Crown className="w-5 h-5 mr-2" />
              S'abonner dès 15 000 FCFA/mois
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          ) : (
            <Button
              onClick={() => {
                sessionStorage.setItem('redirectAfterLogin', '/outils');
                window.location.href = '/connexion';
              }}
              className="w-full h-12 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-slate-950 font-black rounded-xl text-base shadow-xl shadow-emerald-500/20 transition-all active:scale-95"
            >
              <LogIn className="w-5 h-5 mr-2" />
              Se connecter ou créer un compte
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          )}

          {/* Mode démo : essai gratuit unique */}
          {onTryDemo && !hasUsedDemo && (
            <div className="pt-2 border-t border-white/10">
              <p className="text-xs text-slate-500 mb-3 text-center">
                Vous pouvez essayer cet outil une fois gratuitement avant de vous abonner.
              </p>
              <Button
                onClick={() => {
                  if (demoKey) localStorage.setItem(demoKey, 'true');
                  onTryDemo();
                }}
                className="w-full h-10 bg-white/10 hover:bg-white/20 text-white border border-white/20 font-bold rounded-xl text-sm transition-all"
              >
                <Zap className="w-4 h-4 mr-2" />
                Essai gratuit unique
              </Button>
            </div>
          )}

          {/* Lien retour */}
          <button
            onClick={onBack}
            className="text-sm text-slate-500 hover:text-slate-300 transition-colors font-medium"
          >
            ← Retour au catalogue
          </button>
        </CardContent>
      </Card>
    </div>
  );
};

export default PremiumPaywall;
