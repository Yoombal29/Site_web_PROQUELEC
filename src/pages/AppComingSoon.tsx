import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { SEO } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Bell, Calendar, Rocket, Sparkles, CheckCircle2 } from "lucide-react";
import { allApps } from "@/data/applications-catalog";

/**
 * Page placeholder pour les applications en développement
 */
export default function AppComingSoon() {
  const { appId } = useParams<{appId: string;}>();
  const navigate = useNavigate();

  const app = allApps.find((a) => a.id === appId);

  if (!app) {
    return (
      <div className="min-h-screen bg-[#071914] text-slate-100 flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-4xl font-black mb-4">Application introuvable</h1>
                    <Button onClick={() => navigate('/outils')}>Retour aux outils</Button>
                </div>
            </div>);

  }

  const features = getAppFeatures(app);

  return (
    <div className="min-h-screen bg-[#071914] text-slate-100">
            <SEO
        title={`${app.title} - Bientôt Disponible | PROQUELEC`}
        description={app.description} />
      
            <Header />

            <main className="pt-32 pb-24">
                <div className="container mx-auto px-6">
                    {/* Bouton retour */}
                    <button
            onClick={() => navigate('/outils')}
            className="flex items-center gap-2 text-emerald-500 font-bold mb-12 hover:text-white transition-colors">
            
                        <ArrowLeft className="w-4 h-4" />
                        Retour au catalogue
                    </button>

                    <div className="grid lg:grid-cols-2 gap-16 items-center">
                        {/* Colonne gauche - Info */}
                        <div className="space-y-8">
                            <div>
                                <Badge className="mb-4 bg-amber-500/10 text-amber-400 border-amber-500/20 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest">
                                    🚀 En Développement
                                </Badge>

                                <div className="flex items-center gap-4 mb-6">
                                    <div className={`w-16 h-16 rounded-2xl flex items-center justify-center border ${app.category === 'premium' ? 'bg-amber-500/10 border-amber-500/20' : 'bg-emerald-500/10 border-emerald-500/20'}`}>
                                        <app.icon className={`w-8 h-8 ${app.category === 'premium' ? 'text-amber-400' : 'text-emerald-400'}`} />
                                    </div>
                                    <div>
                                        <span className="text-xs uppercase font-bold text-slate-500">{app.group}</span>
                                        {app.norme &&
                    <span className="text-xs uppercase font-bold text-emerald-500 ml-3">• {app.norme}</span>
                    }
                                    </div>
                                </div>

                                <h1 className="text-4xl md:text-5xl font-black mb-6 leading-tight">
                                    {app.title}
                                </h1>
                                <p className="text-xl text-slate-400 leading-relaxed">
                                    {app.description}
                                </p>
                            </div>

                            {/* Fonctionnalités prévues */}
                            <div className="space-y-4">
                                <h3 className="text-lg font-black text-white">Fonctionnalités prévues</h3>
                                <ul className="space-y-3">
                                    {features.map((feature, idx) =>
                  <li key={idx} className="flex items-start gap-3">
                                            <CheckCircle2 className="w-5 h-5 text-emerald-500 mt-0.5 shrink-0" />
                                            <span className="text-slate-300">{feature}</span>
                                        </li>
                  )}
                                </ul>
                            </div>

                            {/* CTA Notification */}
                            <Card className="bg-emerald-500/5 border-emerald-500/20 rounded-2xl">
                                <CardContent className="p-6">
                                    <div className="flex items-start gap-4">
                                        <div className="p-3 bg-emerald-500/20 rounded-xl">
                                            <Bell className="w-6 h-6 text-emerald-400" />
                                        </div>
                                        <div className="flex-1">
                                            <h4 className="font-bold text-white mb-2">Être notifié au lancement</h4>
                                            <p className="text-sm text-slate-400 mb-4">
                                                Recevez un email dès que cette application sera disponible.
                                            </p>
                                            <div className="flex gap-3">
                                                <input
                          type="email"
                          placeholder="votre@email.com"
                          className="flex-1 px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder:text-slate-500 focus:border-emerald-500 focus:outline-none" />
                        
                                                <Button className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold">
                                                    M'avertir
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Colonne droite - Illustration */}
                        <div className="relative">
                            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/20 to-amber-500/10 blur-3xl rounded-full" />
                            <Card className="relative bg-[#0d2a21]/60 border-emerald-800/40 rounded-[3rem] overflow-hidden">
                                <CardContent className="p-12 flex flex-col items-center justify-center min-h-[500px]">
                                    <div className="w-32 h-32 bg-gradient-to-br from-emerald-500/20 to-amber-500/20 rounded-3xl flex items-center justify-center mb-8 border border-emerald-500/20">
                                        <app.icon className="w-16 h-16 text-emerald-400" />
                                    </div>

                                    <div className="text-center space-y-4">
                                        <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30 px-6 py-2 rounded-full text-sm font-black">
                                            <Rocket className="w-4 h-4 mr-2 inline" />
                                            Lancement Prévu Q2 2026
                                        </Badge>

                                        <p className="text-slate-400 max-w-sm mx-auto">
                                            Cette application fait partie de la roadmap PROQUELEC et sera bientôt disponible.
                                        </p>

                                        <div className="flex items-center justify-center gap-6 pt-6 text-sm">
                                            <div className="flex items-center gap-2 text-slate-500">
                                                <Calendar className="w-4 h-4" />
                                                <span>Phase de développement</span>
                                            </div>
                                            <div className="flex items-center gap-2 text-emerald-500">
                                                <Sparkles className="w-4 h-4" />
                                                <span>{app.category === 'premium' ? 'Accès Premium' : 'Gratuit'}</span>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>
            </main>

            <Footer />
        </div>);

}

/**
 * Génère des fonctionnalités prévues basées sur le type d'application
 */
function getAppFeatures(app: ProquelecApp): string[] {
  const baseFeatures: Record<string, string[]> = {
    'diagnostic-maison': [
    'Questionnaire interactif de 10 questions',
    'Score de sécurité électrique de votre domicile',
    'Recommandations personnalisées',
    'Liste de vérifications à effectuer',
    'Génération d\'un rapport PDF'],

    'assistant-securite': [
    'Conseils préventifs personnalisés',
    'Alertes sur les dangers courants',
    'Guide des bonnes pratiques',
    'Fiches de sécurité téléchargeables'],

    'simulateur-facture': [
    'Estimation de consommation par appareil',
    'Comparaison avec la moyenne nationale',
    'Conseils d\'économie d\'énergie',
    'Simulation de scénarios d\'optimisation'],

    'guide-renovation': [
    'Étapes de rénovation électrique',
    'Checklist des travaux obligatoires',
    'Estimation budgétaire indicative',
    'Mise en relation avec des professionnels certifiés'],

    'dimensionnement-cables': [
    'Calcul automatique des sections',
    'Choix des protections adaptées',
    'Conformité NF C 15-100',
    'Export des notes de calcul'],

    'calcul-court-circuit': [
    'Calcul Icc triphasé et monophasé',
    'Pouvoir de coupure requis',
    'Sélectivité des protections',
    'Conformité IEC 60909'],

    'audit-conformite': [
    'Checklist de conformité complète',
    'Détection automatique des anomalies',
    'Prioritisation des corrections',
    'Génération de rapport d\'audit'],

    'qcm-certifiants': [
    'Milliers de questions techniques',
    'Examens de certification officiels',
    'Suivi de progression',
    'Attestations de réussite']

  };

  return baseFeatures[app.id] || [
  'Interface intuitive et moderne',
  'Conformité aux normes en vigueur',
  'Données sécurisées localement',
  'Support technique dédié',
  'Mises à jour régulières'];

}