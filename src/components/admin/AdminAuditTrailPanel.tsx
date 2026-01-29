
import React from 'react';
import { useActivityLogs } from '../../hooks/useActivityLogs';

const AdminAuditTrailPanel: React.FC = () => {
  const { logs, isLoading } = useActivityLogs();
  return (
    <section className="bg-white p-6 rounded-lg shadow-md animate-fade-in">
      <h2 className="text-2xl font-semibold mb-4 text-proqblue">Audit Trail (Historique d'activité)</h2>
      {isLoading ? (
        <div>Chargement…</div>
      ) : (
        <ul className="divide-y divide-gray-200">
          {logs?.map((log) => (
            <li key={log.id} className="py-2 text-xs text-gray-700">
              <span className="font-mono text-gray-400">{new Date(log.timestamp).toLocaleString()}</span> — {log.action || 'Action inconnue'}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
};
export default AdminAuditTrailPanel;
