import React from 'react';
import { useUserManagement } from '../../hooks/useUserManagement';

const AdminUsersPanel: React.FC = () => {
  const { users, isLoading, fetchUsers, changeUserStatus, deleteUser } = useUserManagement();

  React.useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleToggleStatus = async (id: string, currentStatus: string | boolean) => {
    const newStatus = currentStatus === 'active' || currentStatus === true ? 'inactive' : 'active';
    try {
      await changeUserStatus(id, newStatus);
    } catch (err) {
      console.error('Erreur changement de statut:', err);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur?')) {
      try {
        await deleteUser(id);
      } catch (err) {
        console.error('Erreur suppression:', err);
      }
    }
  };

  return (
    <section className="bg-card p-6 rounded-lg shadow-md border border-border animate-fade-in">
      <h2 className="text-2xl font-semibold mb-4 text-primary">Gestion avancée des utilisateurs</h2>
      {isLoading ? (
        <div>Chargement…</div>
      ) : users && users.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2">Email</th>
                <th className="text-left py-2">Rôle</th>
                <th className="text-left py-2">Statut</th>
                <th className="text-left py-2">Créé</th>
                <th className="text-left py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} className="border-b border-border hover:bg-muted/50 transition-colors">
                  <td className="py-2">{user.email}</td>
                  <td className="py-2"><span className="px-2 py-1 bg-muted rounded text-xs">{user.role}</span></td>
                  <td className="py-2">
                    <span className={`px-2 py-1 rounded text-xs ${user.status === 'active' || user.status === true ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {user.status === 'active' || user.status === true ? 'Actif' : 'Inactif'}
                    </span>
                  </td>
                  <td className="py-2 text-xs text-muted-foreground">{user.createdAt ? new Date(user.createdAt).toLocaleDateString('fr-FR') : 'N/A'}</td>
                  <td className="py-2 space-x-2">
                    <button
                      onClick={() => handleToggleStatus(user.id, user.status)}
                      className="px-2 py-1 text-xs bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors"
                    >
                      {user.status === 'active' || user.status === true ? 'Désactiver' : 'Activer'}
                    </button>
                    <button
                      onClick={() => handleDelete(user.id)}
                      className="px-2 py-1 text-xs bg-red-600 hover:bg-red-700 text-white rounded transition-colors"
                    >
                      Supprimer
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-center text-muted-foreground py-4">Aucun utilisateur trouvé</div>
      )}
    </section>
  );
};
export default AdminUsersPanel;
