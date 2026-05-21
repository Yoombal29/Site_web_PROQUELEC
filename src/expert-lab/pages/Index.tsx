import {
  Zap,
  MessageSquare,
  Settings,
  BookOpen,
  Activity,
  ShieldCheck,
  Users,
  ArrowRight,
  Calculator,
  Camera
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";

export default function Index() {
  const navigate = useNavigate();

  const features = [
    {
      title: "Chat IA Expert",
      description: "Posez vos questions techniques, générez des schémas et analysez vos documents.",
      icon: MessageSquare,
      color: "text-yeai-yellow",
      bg: "bg-yeai-yellow/10",
      path: "/chat"
    },
    {
      title: "Normes & Documents",
      description: "Accès rapide aux fiches NF C 15-100, guides de calcul et abaques.",
      icon: BookOpen,
      color: "text-blue-500",
      bg: "bg-blue-500/10",
      path: "/docs" // Assurez-vous que cette route existe ou redirigez vers chat pour l'instant
    },
    {
      title: "Calculateurs",
      description: "Outils dédiés : Chute de tension, Section de câble, Loi d'Ohm.",
      icon: Calculator,
      color: "text-green-500",
      bg: "bg-green-500/10",
      path: "/chat" // On peut rediriger vers le chat avec une promo "Je peux calculer pour vous"
    },
    {
      title: "Configuration IA",
      description: "Gérez vos clés API (OpenAI, Anthropic) et le comportement de YEAI.",
      icon: Settings,
      color: "text-purple-500",
      bg: "bg-purple-500/10",
      path: "/providers"
    },
    {
      title: "Scanner Photo",
      description: "Audit visuel NF C 15-100 en temps réel depuis le terrain.",
      icon: Camera,
      color: "text-orange-500",
      bg: "bg-orange-500/10",
      path: "/scanner"
    }
  ];

  return (
    <div className="min-h-screen p-8 space-y-8 animate-in fade-in duration-500">

      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3 text-electric">
            <Zap className="w-8 h-8 fill-current" />
            Tableau de Bord YEAI
          </h1>
          <p className="text-muted-foreground mt-1 text-lg">
            Bienvenue sur votre assistant expert en électricité.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-4 py-2 bg-secondary rounded-full border border-border">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
            </span>
            <span className="text-sm font-medium">Système Opérationnel</span>
          </div>
          <Button onClick={() => navigate('/chat')} className="bg-gradient-electric hover:opacity-90 shadow-lg glow-electric transition-all">
            Démarrer une conversation <ArrowRight className="ml-2 w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* KPIS / STATS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-border/50 bg-card/50 backdrop-blur">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Modèles IA Actifs</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">7+</div>
            <p className="text-xs text-muted-foreground">GPT-4, Gemini, Claude 3...</p>
          </CardContent>
        </Card>
        <Card className="border-border/50 bg-card/50 backdrop-blur">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sécurité</CardTitle>
            <ShieldCheck className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">NF C 15-100</div>
            <p className="text-xs text-muted-foreground">Conformité vérifiée en temps réel</p>
          </CardContent>
        </Card>
        <Card className="border-border/50 bg-card/50 backdrop-blur">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Communauté</CardTitle>
            <Users className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Expert</div>
            <p className="text-xs text-muted-foreground">Assistant Personnel Dédié</p>
          </CardContent>
        </Card>
      </div>

      {/* MAIN FEATURES GRID */}
      <div>
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Activity className="w-5 h-5 text-yeai-yellow" />
          Accès Rapide
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <Card
              key={index}
              className="group hover:border-yeai-yellow/50 transition-all cursor-pointer hover:shadow-md border-border/60"
              onClick={() => navigate(feature.path)}
            >
              <CardHeader>
                <div className={`w-12 h-12 rounded-xl ${feature.bg} flex items-center justify-center mb-2 group-hover:scale-110 transition-transform duration-300`}>
                  <feature.icon className={`w-6 h-6 ${feature.color}`} />
                </div>
                <CardTitle className="text-lg">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* INFO SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
        <Card className="lg:col-span-2 border-yeai-yellow/20 bg-gradient-to-br from-card to-yeai-yellow/5">
          <CardHeader>
            <CardTitle>💡 Le Saviez-vous ?</CardTitle>
            <CardDescription>Astuce du jour sur la norme NF C 15-100</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-lg font-medium text-foreground/80">
              "Dans une cuisine, vous devez installer au moins 6 socles de prise de courant dont 4 au-dessus du plan de travail. C'est une obligation pour le confort et la sécurité des usages multiples."
            </p>
            <Button variant="link" className="mt-4 p-0 h-auto text-yeai-yellow hover:text-yeai-yellow/80" onClick={() => navigate('/chat')}>
              En savoir plus avec YEAI &rarr;
            </Button>
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardHeader>
            <CardTitle>Mise à jour Système</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Version</span>
              <Badge variant="outline">v2.1.0 (Super-Expert)</Badge>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Base de connaissances</span>
              <span className="text-green-500 font-medium">À jour</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Module Graphique</span>
              <span className="text-purple-500 font-medium">DALL-E 3 Ready</span>
            </div>
          </CardContent>
        </Card>
      </div>

    </div>
  );
}
