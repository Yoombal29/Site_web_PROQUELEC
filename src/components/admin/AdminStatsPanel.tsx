
import React from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3, FileText, Users, Calendar, Eye } from "lucide-react";
import { Loader2 } from "lucide-react";

type SiteStats = {
  totalPosts: number;
  publishedPosts: number;
  totalUsers: number;
  totalEvents: number;
  totalDocuments: number;
};

export default function AdminStatsPanel() {
  const { data: stats, isLoading, error } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: async (): Promise<SiteStats> => {
      const [postsResult, publishedPostsResult, usersResult, eventsResult, documentsResult] = await Promise.all([
        supabase.from('blog_posts').select('id', { count: 'exact', head: true }),
        supabase.from('blog_posts').select('id', { count: 'exact', head: true }).not('published_at', 'is', null),
        supabase.from('profiles').select('id', { count: 'exact', head: true }),
        supabase.from('events').select('id', { count: 'exact', head: true }),
        supabase.from('documents').select('id', { count: 'exact', head: true })
      ]);

      return {
        totalPosts: postsResult.count || 0,
        publishedPosts: publishedPostsResult.count || 0,
        totalUsers: usersResult.count || 0,
        totalEvents: eventsResult.count || 0,
        totalDocuments: documentsResult.count || 0,
      };
    }
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-8">
        <Loader2 className="animate-spin h-8 w-8 text-proqblue" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-600 p-4 bg-red-100 rounded-md">
        Erreur lors du chargement des statistiques: {error.message}
      </div>
    );
  }

  const statCards = [
    {
      title: "Articles de blog",
      value: stats?.totalPosts || 0,
      description: `${stats?.publishedPosts || 0} publiés`,
      icon: FileText,
      color: "text-blue-600"
    },
    {
      title: "Utilisateurs",
      value: stats?.totalUsers || 0,
      description: "Comptes enregistrés",
      icon: Users,
      color: "text-green-600"
    },
    {
      title: "Événements",
      value: stats?.totalEvents || 0,
      description: "Événements créés",
      icon: Calendar,
      color: "text-purple-600"
    },
    {
      title: "Documents",
      value: stats?.totalDocuments || 0,
      description: "Fichiers téléversés",
      icon: Eye,
      color: "text-orange-600"
    }
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <BarChart3 className="h-5 w-5 text-proqblue" />
        <h3 className="text-lg font-semibold text-proqblue-dark">Statistiques du site</h3>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">{stat.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
