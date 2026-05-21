import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { PresentationEditor } from '@/components/office/presentation/PresentationEditor';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Download, Share2, Play } from 'lucide-react';
import { toast } from 'sonner';

export function PresentationEditorPage() {
  const { id, templateId } = useParams();
  const navigate = useNavigate();
  const [presentationTitle, setPresentationTitle] = useState('Nouvelle Présentation');
  const [isPresentMode, setIsPresentMode] = useState(false);
  const [initialSlides, setInitialSlides] = useState<unknown[] | undefined>(undefined);

  // Mock Template Data (In a real app, fetch from API)
  React.useEffect(() => {
    if (templateId === 'presentation-projet') {
      setPresentationTitle('Présentation Projet (Template)');
      setInitialSlides([
        { id: '1', content: '<h1>Projet [NOM]</h1><h3>Présentation Client</h3><p>Propulsé par PROQUELEC</p>', background: 'linear-gradient(to right, #4facfe 0%, #00f2fe 100%)' },
        { id: '2', content: '<h2>Notre Proposition</h2><ul><li>Expertise Technique</li><li>Conformité NF C 15-100</li><li>Suivi Rigoureux</li></ul>' }]
      );
      toast.success("Modèle chargé avec succès !");
    }
  }, [templateId]);

  const handleSave = async (slides: unknown[]) => {
    try {
      const isNew = (!id || id === 'new') && !templateId;
      const url = isNew ? '/api/office/documents' : `/api/office/documents/${id || 'new'}`;
      const method = isNew ? 'POST' : 'PUT';
      const token = localStorage.getItem('token');

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : ''
        },
        body: JSON.stringify({
          title: presentationTitle,
          content: slides, // Unified content field
          type: 'presentation'
        })
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || 'Erreur serveur');
      }

      const resData = await response.json();

      if (isNew && resData.id) {
        toast.success('Présentation créée avec succès!');
        navigate(`/office/presentation/${resData.id}`, { replace: true });
      } else {
        toast.success('Présentation sauvegardée avec succès!');
      }
    } catch (error) {
      console.error('Error saving presentation:', error);
      toast.error(`Erreur lors de la sauvegarde: ${(error as Error).message}`);
    }
  };

  const handleExport = () => {
    toast.info('Export PDF en cours...');
    // TODO: Implement PDF export
  };

  const togglePresentMode = () => {
    setIsPresentMode(!isPresentMode);
  };

  return (
    <div className="h-screen flex flex-col bg-gray-100">
      {/* Top Bar */}
      {!isPresentMode &&
        <div className="flex items-center justify-between p-4 bg-white border-b border-gray-200">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/documents')}>

              <ArrowLeft className="h-4 w-4 mr-2" />
              Retour à la GED
            </Button>

            <input
              type="text"
              value={presentationTitle}
              onChange={(e) => setPresentationTitle(e.target.value)}
              className="text-lg font-semibold bg-transparent border-none focus:outline-none focus:ring-2 focus:ring-orange-500 rounded px-2"
              placeholder="Titre de la présentation" />

          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={togglePresentMode}>
              <Play className="h-4 w-4 mr-2" />
              Mode Présentation
            </Button>
            <Button variant="outline" size="sm" onClick={handleExport}>
              <Download className="h-4 w-4 mr-2" />
              Exporter PDF
            </Button>
            <Button variant="outline" size="sm">
              <Share2 className="h-4 w-4 mr-2" />
              Partager
            </Button>
          </div>
        </div>
      }

      {/* Editor */}
      <div className="flex-1 overflow-hidden">
        <PresentationEditor
          presentationId={id}
          initialSlides={initialSlides}
          onSave={handleSave} />

      </div>
    </div>);

}