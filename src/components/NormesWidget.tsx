import React, { useEffect, useState } from 'react';

export default function NormesWidget({ pageType = 'normes_ressources' }: {pageType?: string;}) {
  const [widgets, setWidgets] = useState<unknown[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    async function load() {
      try {
        const res = await fetch('http://localhost:8000/engine/v1/cms/widgets', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ page_type: pageType, current_content: {} })
        });
        const data = await res.json();
        setWidgets(data.widgets || []);
      } catch (e) {
        console.error('Widget load error', e);
      } finally {setLoading(false);}
    }
    load();
  }, [pageType]);

  if (loading) return <div>Chargement widget...</div>;
  return (
    <div className="normes-widget">
      {widgets.map((w, i) =>
      <div key={i} className="p-4 mb-3 border rounded bg-white text-gray-800">
          <h4 className="font-bold">{w.title}</h4>
          <p className="text-sm">{w.summary}</p>
          {w.recommended_trainings &&
        <p className="text-xs text-blue-600">Formations recommandées: {w.recommended_trainings.join(', ')}</p>
        }
        </div>
      )}
    </div>);

}