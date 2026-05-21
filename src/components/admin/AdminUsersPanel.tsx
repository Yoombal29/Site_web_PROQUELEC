import React from 'react';
import { useUserManagement } from '../../hooks/useUserManagement';

const AdminUsersPanel: React.FC = () => {
  const { users, isLoading, fetchUsers } = useUserManagement();

  React.useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);
  return (
    <section className="bg-card p-6 rounded-lg shadow-md border border-border animate-fade-in">
      <h2 className="text-2xl font-semibold mb-4 text-primary">Gestion avancée des utilisateurs</h2>
      {isLoading ? (
        <div>Chargement…</div>
      ) : (
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b">
              <th className="text-left py-2">Email</th>
              <th className="text-left py-2">Rôle</th>
              <th className="text-left py-2">Statut</th>
            </tr>
          </thead>
          <tbody>
            {users?.map((user) => (
              <tr key={user.id} className="border-b border-border hover:bg-muted/50 transition-colors">
                <td className="py-2">{user.email}</td>
                <td className="py-2">{user.role}</td>
                <td className="py-2">{user.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </section>
  );
};
export default AdminUsersPanel;
