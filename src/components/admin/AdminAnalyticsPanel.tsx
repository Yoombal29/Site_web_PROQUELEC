import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from "recharts";
import { useAnalytics, AnalyticsData } from "@/hooks/useAnalytics";
import { Eye, Users, FileText, TrendingUp } from "lucide-react";

const COLORS = ['#2376df', '#054393', '#1a73e8', '#ff6b6b', '#4ecdc4'];

export default function AdminAnalyticsPanel() {
  const { data: analytics, isLoading } = useAnalytics();

  if (isLoading) return <div>Chargement des analytics...</div>;
  if (!analytics) return <div>Erreur de chargement des données</div>;

  const totalViews = analytics.pageViews.reduce((sum: number, page: { views: number }) => sum + page.views, 0);
  const totalUsers = analytics.userActivity[analytics.userActivity.length - 1]?.activeUsers || 0;
  const totalContent = analytics.popularContent.length;

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold flex items-center gap-2">
        <TrendingUp className="w-6 h-6" />
        Analytics & Statistiques
      </h2>
      
      {/* Cartes de résumé */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Vues totales</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalViews.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">+12% ce mois</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Utilisateurs actifs</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalUsers}</div>
            <p className="text-xs text-muted-foreground">+8% ce mois</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Contenu publié</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalContent}</div>
            <p className="text-xs text-muted-foreground">+3 cette semaine</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taux d'engagement</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">68%</div>
            <p className="text-xs text-muted-foreground">+5% ce mois</p>
          </CardContent>
        </Card>
      </div>

      {/* Graphiques */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Vues par page</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analytics.pageViews}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="page" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="views" fill="#2376df" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Évolution des utilisateurs</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={analytics.userActivity}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="activeUsers" stroke="#2376df" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Engagement du blog</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analytics.blogEngagement} layout="horizontal">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="title" type="category" width={150} />
                <Tooltip />
                <Bar dataKey="views" fill="#2376df" />
                <Bar dataKey="comments" fill="#054393" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Contenu populaire</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={analytics.popularContent}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ title, engagement }) => `${title} (${engagement}%)`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="engagement"
                >
                  {analytics.popularContent.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
