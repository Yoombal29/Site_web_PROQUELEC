import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { DocumentEditor } from '@/components/office/document/DocumentEditor';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Download, Share2 } from 'lucide-react';
import { toast } from 'sonner';

export function DocumentEditorPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [documentTitle, setDocumentTitle] = useState('Nouveau Document');
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async (content: string | object, titleOverride?: string) => {
    setIsSaving(true);
    try {
      const token = localStorage.getItem('token');
      // If new document, POST, else PUT
      const isNew = !id || id === 'new';
      const url = isNew ? '/api/office/documents' : `/api/office/documents/${id}`;
      const method = isNew ? 'POST' : 'PUT';

      // Content handling: TipTap gives HTML by default in onSave prop from Editor,
      // but for storage we might want to ensure we're sending what we want.
      // The Editor component passes HTML string to onSave currently.

      // Note: For POST, we need type, title, content
      // For PUT, we need title, content

      const body: unknown = {
        title: titleOverride || documentTitle,
        content: content
      };

      if (isNew) {
        body.type = 'document';
        body.metadata = {};
      }

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : ''
        },
        body: JSON.stringify(body)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erreur API');
      }

      const data = await response.json();

      if (isNew && data.id) {
        toast.success('Document créé avec succès!');
        // Redirect to the new document URL so next saves are updates
        navigate(`/office/document/${data.id}`, { replace: true });
      } else {
        toast.success('Document sauvegardé avec succès!');
      }

    } catch (error) {
      console.error('Error saving document:', error);
      toast.error('Erreur lors de la sauvegarde');
    } finally {
      setIsSaving(false);
    }
  };

  const handleExport = () => {
    toast.info('Export PDF en cours...');
    // TODO: Implement PDF export
  };

  return (
    <div className="h-screen flex flex-col bg-gray-100">
            {/* Top Bar - Simplified since title is in editor */}
            <div className="flex items-center justify-between p-4 bg-white border-b border-gray-200">
                <div className="flex items-center gap-4">
                    <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/documents')}>
            
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Retour à la GED
                    </Button>
                    <div className="h-6 w-px bg-slate-200 mx-2" />
                    <span className="text-xs font-medium text-slate-400 uppercase tracking-widest">Édition Technique NS 01 001</span>
                </div>

                <div className="flex items-center gap-2">
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

            {/* Editor Container - Full width for Ribbon */}
            <div className="flex-1 overflow-hidden">
                <DocumentEditor
          documentId={id}
          initialTitle={documentTitle}
          onSave={(content, title) => {
            if (title) setDocumentTitle(title);
            handleSave(content, title);
          }} />
        
            </div>
        </div>);

}