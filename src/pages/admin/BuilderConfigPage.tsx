import React from 'react';
import BuilderConfigAdmin from '@/components/admin/BuilderConfigAdmin';

const BuilderConfigPage = () => {
  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Configuration du Builder</h2>
      <BuilderConfigAdmin />
    </div>
  );
};

export default BuilderConfigPage;
