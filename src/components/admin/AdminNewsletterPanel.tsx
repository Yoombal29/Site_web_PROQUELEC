
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Mail, Send, Users, TrendingUp } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function AdminNewsletterPanel() {
  const { toast } = useToast();
  const [emailData, setEmailData] = useState({
    subject: "",
    content: "",
    recipients: "all"
  });

  // Données simulées pour la newsletter
  const stats = {
    totalSubscribers: 1247,
    openRate: 68.5,
    clickRate: 12.3,
    recentCampaigns: [
      { id: 1, subject: "Nouvelle formation disponible", sent: "2024-06-10", openRate: 72 },
      { id: 2, subject: "Mise à jour des normes", sent: "2024-06-05", openRate: 65 },
      { id: 3, subject: "Événement à venir", sent: "2024-05-28", openRate: 58 }
    ]
  };

  const handleSendNewsletter = () => {
    if (!emailData.subject || !emailData.content) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir tous les champs",
        variant: "destructive"
      });
      return;
    }

    // Simulation d'envoi
    toast({
      title: "Newsletter envoyée !",
      description: `Email envoyé à ${stats.totalSubscribers} abonnés`
    });

    setEmailData({ subject: "", content: "", recipients: "all" });
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold flex items-center gap-2">
        <Mail className="w-6 h-6" />
        Gestion Newsletter
      </h2>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Abonnés totaux</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalSubscribers.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">+15 cette semaine</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taux d'ouverture</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.openRate}%</div>
            <p className="text-xs text-muted-foreground">+2.1% ce mois</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taux de clic</CardTitle>
            <Mail className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.clickRate}%</div>
            <p className="text-xs text-muted-foreground">+0.8% ce mois</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Composer une newsletter */}
        <Card>
          <CardHeader>
            <CardTitle>Composer une newsletter</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="subject">Sujet</Label>
              <Input
                id="subject"
                value={emailData.subject}
                onChange={(e) => setEmailData(prev => ({ ...prev, subject: e.target.value }))}
                placeholder="Sujet de l'email..."
              />
            </div>
            
            <div>
              <Label htmlFor="content">Contenu</Label>
              <Textarea
                id="content"
                value={emailData.content}
                onChange={(e) => setEmailData(prev => ({ ...prev, content: e.target.value }))}
                placeholder="Contenu de l'email..."
                rows={8}
              />
            </div>

            <Button onClick={handleSendNewsletter} className="w-full">
              <Send className="w-4 h-4 mr-2" />
              Envoyer la newsletter
            </Button>
          </CardContent>
        </Card>

        {/* Campagnes récentes */}
        <Card>
          <CardHeader>
            <CardTitle>Campagnes récentes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats.recentCampaigns.map((campaign) => (
                <div key={campaign.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">{campaign.subject}</p>
                    <p className="text-sm text-muted-foreground">Envoyé le {campaign.sent}</p>
                  </div>
                  <Badge variant="secondary">
                    {campaign.openRate}% ouvert
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
