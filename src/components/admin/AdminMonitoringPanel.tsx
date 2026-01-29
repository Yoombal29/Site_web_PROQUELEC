import React from 'react';

const AdminMonitoringPanel: React.FC = () => {
  // Placeholder pour intégration Google Analytics, monitoring externe, etc.
  return (
    <section className="bg-white p-6 rounded-lg shadow-md animate-fade-in">
      <h2 className="text-2xl font-semibold mb-4 text-proqblue">Monitoring & Intégrations externes</h2>
      <p className="text-gray-600 text-sm mb-4">Connectez vos outils de monitoring (Google Analytics, Sentry, etc.) pour un suivi avancé.</p>
      <div className="bg-gray-50 p-4 rounded">
        <p className="text-gray-400">Module à configurer…</p>
      </div>
    </section>
  );
};
export default AdminMonitoringPanel;
