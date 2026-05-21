import React, { useEffect } from 'react';
import { Terminal, Zap, ShieldCheck } from 'lucide-react';
import { Button } from '../ui/button';
import { useNavigate } from 'react-router-dom';
import { useAnalytics } from '../../hooks/useAnalytics';
import { useNotifications } from '../../hooks/useNotifications';
import { useActivityLogs } from '../../hooks/useActivityLogs';
import { useUserManagement } from '../../hooks/useUserManagement';
import { Skeleton } from '../ui/skeleton';

const DashboardHome: React.FC = () => {
  // Récupération des données via hooks connectés à l'API Backend (PostgreSQL)
  const { data: analytics, isLoading: analyticsLoading } = useAnalytics();
  const notifications = useNotifications();
  const { logs, isLoading: logsLoading, fetchLogs } = useActivityLogs();
  const { users, isLoading: usersLoading, fetchUsers } = useUserManagement();
  const navigate = useNavigate();

  useEffect(() => {
    fetchUsers();
    fetchLogs();
  }, [fetchUsers, fetchLogs]);

  // Calculate stats from analytics data
  const stats = {
    users: users?.length || 0,
    activeSessions: analytics?.popularContent?.length || 0,
    events: analytics?.popularContent?.filter(c => c.type === 'event')?.length || 0,
  };

  // Accessibilité : landmarks, ARIA
  return (
    <main aria-label="Tableau de bord d'accueil" className="p-6 space-y-8">
      {/* Widgets statistiques */}
      <section aria-label="Statistiques clés" className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-card border border-border rounded-lg shadow p-4 flex flex-col items-center" role="status">
            {analyticsLoading ? (
              <>
                <Skeleton className="h-8 w-16 mb-2" />
                <Skeleton className="h-4 w-24" />
              </>
            ) : (
              <>
                <span className="text-2xl font-bold text-foreground">
                  {i === 1 ? stats.users : i === 2 ? stats.activeSessions : stats.events}
                </span>
                <span className="text-muted-foreground">
                  {i === 1 ? "Utilisateurs" : i === 2 ? "Sessions actives" : "Événements"}
                </span>
              </>
            )}
          </div>
        ))}
      </section>

      {/* Notifications */}
      <section aria-label="Notifications récentes" className="bg-card border border-border rounded-lg shadow p-4">
        <h2 className="text-lg font-semibold mb-2 text-foreground">Notifications</h2>
        <ul className="text-foreground">
          {notifications.notifications?.slice(0, 5).map((notif) => (
            <li key={notif.id} className="mb-1 text-sm border-b border-border/50 pb-1 last:border-0">{notif.message}</li>
          ))}
        </ul>
      </section>

      {/* Fil d'actualité / logs */}
      <section aria-label="Fil d'actualité et logs récents" className="bg-card border border-border rounded-lg shadow p-4">
        <h2 className="text-lg font-semibold mb-2 text-foreground">Logs récents</h2>
        <div className="space-y-2">
          {logsLoading ? (
            Array(5).fill(0).map((_, i) => (
              <Skeleton key={i} className="h-6 w-full opacity-50" />
            ))
          ) : (
            <ul className="text-foreground">
              {logs?.slice(0, 8).map((log) => (
                <li key={log.id} className="mb-1 text-xs text-muted-foreground font-mono bg-muted/30 p-1 rounded">
                  {log.action || 'Action inconnue'}
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      {/* Gestion utilisateurs */}
      <section aria-label="Gestion rapide des utilisateurs" className="bg-card border border-border rounded-lg shadow p-4">
        <h2 className="text-lg font-semibold mb-2 text-foreground">Utilisateurs récents</h2>
        <div className="space-y-2">
          {usersLoading ? (
            Array(3).fill(0).map((_, i) => (
              <div key={i} className="flex items-center gap-2">
                <Skeleton className="h-8 w-8 rounded-full" />
                <Skeleton className="h-4 w-40" />
              </div>
            ))
          ) : (
            <ul className="text-foreground">
              {users?.slice(0, 5).map((user) => (
                <li key={user.id} className="mb-1 text-sm flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-green-500" />
                  {user.email}
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      {/* Historique d’activité */}
      <section aria-label="Historique d’activité" className="bg-card border border-border rounded-lg shadow p-4">
        <h2 className="text-lg font-semibold mb-2 text-foreground">Historique d’activité</h2>
        {/* Placeholder pour audit trail */}
        <p className="text-muted-foreground text-sm italic">À venir: audit trail détaillé.</p>
      </section>

      {/* BE Builder Quick Access */}
      <section aria-label="BE Builder Access" className="bg-emerald-500/5 border border-emerald-500/20 rounded-lg shadow-sm p-6 relative overflow-hidden group">
        <div className="absolute right-0 top-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
          <Zap className="w-32 h-32 text-emerald-500" />
        </div>
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center md:text-left">
            <h2 className="text-xl font-bold text-emerald-600 flex items-center gap-2 justify-center md:justify-start">
              <Zap className="w-6 h-6" /> Constructeur de Pages (BE Builder)
            </h2>
            <p className="text-sm text-muted-foreground max-w-xl">
              Gérez les pages du site, modifiez les contenus existants ou créez de nouvelles sections avec l'éditeur visuel avancé.
            </p>
          </div>
          <Button
            onClick={() => navigate('/admin?tab=pages')}
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-8 h-12 rounded-xl shadow-md transition-all active:scale-95"
          >
            Ouvrir le BE Builder
          </Button>
        </div>
      </section>

      {/* Expert Lab Integration */}
      <section aria-label="Expert Lab Integration" className="bg-primary/5 border border-primary/20 rounded-lg shadow-sm p-6 relative overflow-hidden group">
        <div className="absolute right-0 top-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
          <Terminal className="w-32 h-32 text-primary" />
        </div>
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center md:text-left">
            <h2 className="text-xl font-bold text-primary flex items-center gap-2 justify-center md:justify-start">
              <ShieldCheck className="w-6 h-6" /> Expert Lab Souverain
            </h2>
            <p className="text-sm text-muted-foreground max-w-xl">
              Accédez à la console d'IA unifiée, aux suites de calcul technique et au concepteur de schémas unifilaires certifiés NF C 15-100.
            </p>
          </div>
          <Button
            onClick={() => navigate('/expert')}
            className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold px-8 h-12 rounded-xl shadow-md transition-all active:scale-95"
          >
            Lancer l'Espace Expert
          </Button>
        </div>
      </section>

      {/* NEW: AI EXPERT BRAIN STATUS */}
      <section aria-label="AI Expert Status" className="bg-proqblue/5 border border-proqblue/20 rounded-lg shadow-sm p-6 relative overflow-hidden">
        <div className="absolute -right-10 -top-10 h-40 w-40 bg-proqblue/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="flex flex-col md:flex-row items-center gap-6">
          <div className="h-16 w-16 bg-proqblue text-white rounded-2xl flex items-center justify-center shadow-lg transform rotate-3 hover:rotate-0 transition-transform duration-300">
            <Zap className="h-10 w-10 fill-white" />
          </div>
          <div className="flex-1 space-y-1">
            <div className="flex items-center gap-2">
              <span className="flex h-3 w-3 rounded-full bg-green-500 animate-pulse"></span>
              <h2 className="text-xl font-bold text-proqblue">Cerveau Expert AI PROQUELEC : ACTIF</h2>
            </div>
            <p className="text-sm font-medium text-foreground">Modèle : Phi-3.5-mini-LoRA Fine-tuned (NS 01-001 + NF C 18-510)</p>
            <div className="flex flex-wrap gap-2 mt-2">
              <span className="bg-green-100 text-green-700 text-[10px] font-bold px-2 py-0.5 rounded-full border border-green-200 uppercase tracking-tighter">Souveraineté Totale</span>
              <span className="bg-blue-100 text-blue-700 text-[10px] font-bold px-2 py-0.5 rounded-full border border-blue-200 uppercase tracking-tighter">Accélération Intel Arc XPU</span>
              <span className="bg-purple-100 text-purple-700 text-[10px] font-bold px-2 py-0.5 rounded-full border border-purple-200 uppercase tracking-tighter">Expertise Sécurité Électrique</span>
            </div>
          </div>
          <div className="flex flex-col items-end gap-1">
             <div className="text-[10px] uppercase font-bold text-muted-foreground px-2">Performance : Latence Optimisée</div>
             <div className="h-1.5 w-32 bg-gray-200 rounded-full overflow-hidden">
                <div className="h-full bg-green-500 w-[95%]"></div>
             </div>
          </div>
        </div>
      </section>

      {/* Intégrations externes */}
      <section aria-label="Intégrations externes" className="bg-card border border-border rounded-lg shadow p-4">
        <h2 className="text-lg font-semibold mb-2 text-foreground">Intégrations</h2>
        <p className="text-muted-foreground text-sm">Google Analytics, monitoring, etc. (à intégrer)</p>
      </section>
    </main>
  );
};

export default DashboardHome;
