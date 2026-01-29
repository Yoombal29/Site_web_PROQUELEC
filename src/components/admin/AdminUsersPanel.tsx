import React from 'react';
import { useUserManagement } from '../../hooks/useUserManagement';

const AdminUsersPanel: React.FC = () => {
  const { users, isLoading } = useUserManagement();
  return (
    <section className="bg-white p-6 rounded-lg shadow-md animate-fade-in">
      <h2 className="text-2xl font-semibold mb-4 text-proqblue">Gestion avancée des utilisateurs</h2>
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
              <tr key={user.id} className="border-b hover:bg-gray-50">
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
