import React from 'react';
import { useAnalytics } from '../../hooks/useAnalytics';
import { useNotifications } from '../../hooks/useNotifications';
import { useActivityLogs } from '../../hooks/useActivityLogs';
import { useUserManagement } from '../../hooks/useUserManagement';

const DashboardHome: React.FC = () => {
  // Récupération des données via hooks connectés à Supabase
  const { data: analytics, isLoading: analyticsLoading } = useAnalytics();
  const notifications = useNotifications();
  const { logs, isLoading: logsLoading } = useActivityLogs();
  const { users, isLoading: usersLoading } = useUserManagement();

  // Calculate stats from analytics data
  const stats = {
    users: users?.length || 0,
    activeSessions: 12, // Mock data
    events: analytics?.popularContent?.filter(c => c.type === 'event')?.length || 0,
  };

  // Accessibilité : landmarks, ARIA
  return (
    <main aria-label="Tableau de bord d'accueil" className="p-6 space-y-8">
      {/* Widgets statistiques */}
      <section aria-label="Statistiques clés" className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow p-4 flex flex-col items-center" role="status" aria-busy={analyticsLoading}>
          <span className="text-2xl font-bold">{stats.users}</span>
          <span className="text-gray-500">Utilisateurs</span>
        </div>
        <div className="bg-white rounded-lg shadow p-4 flex flex-col items-center" role="status" aria-busy={analyticsLoading}>
          <span className="text-2xl font-bold">{stats.activeSessions}</span>
          <span className="text-gray-500">Sessions actives</span>
        </div>
        <div className="bg-white rounded-lg shadow p-4 flex flex-col items-center" role="status" aria-busy={analyticsLoading}>
          <span className="text-2xl font-bold">{stats.events}</span>
          <span className="text-gray-500">Événements</span>
        </div>
      </section>

      {/* Notifications */}
      <section aria-label="Notifications récentes" className="bg-white rounded-lg shadow p-4">
        <h2 className="text-lg font-semibold mb-2">Notifications</h2>
        <ul>
          {notifications.notifications?.slice(0, 5).map((notif) => (
            <li key={notif.id} className="mb-1 text-sm">{notif.message}</li>
          ))}
        </ul>
      </section>

      {/* Fil d'actualité / logs */}
      <section aria-label="Fil d'actualité et logs récents" className="bg-white rounded-lg shadow p-4">
        <h2 className="text-lg font-semibold mb-2">Logs récents</h2>
        <ul>
          {logsLoading ? <li>Chargement…</li> : logs?.slice(0, 8).map((log) => (
            <li key={log.id} className="mb-1 text-xs text-gray-600">{log.action || 'Action inconnue'}</li>
          ))}
        </ul>
      </section>

      {/* Gestion utilisateurs */}
      <section aria-label="Gestion rapide des utilisateurs" className="bg-white rounded-lg shadow p-4">
        <h2 className="text-lg font-semibold mb-2">Utilisateurs récents</h2>
        <ul>
          {usersLoading ? <li>Chargement…</li> : users?.slice(0, 5).map((user) => (
            <li key={user.id} className="mb-1 text-sm">{user.email}</li>
          ))}
        </ul>
      </section>

      {/* Historique d’activité */}
      <section aria-label="Historique d’activité" className="bg-white rounded-lg shadow p-4">
        <h2 className="text-lg font-semibold mb-2">Historique d’activité</h2>
        {/* Placeholder pour audit trail */}
        <p className="text-gray-500 text-sm">À venir: audit trail détaillé.</p>
      </section>

      {/* Intégrations externes */}
      <section aria-label="Intégrations externes" className="bg-white rounded-lg shadow p-4">
        <h2 className="text-lg font-semibold mb-2">Intégrations</h2>
        <p className="text-gray-500 text-sm">Google Analytics, monitoring, etc. (à intégrer)</p>
      </section>
    </main>
  );
};

export default DashboardHome;
