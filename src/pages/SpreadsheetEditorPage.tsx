import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { SpreadsheetEditor } from '@/components/office/spreadsheet/SpreadsheetEditor';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Download, Share2 } from 'lucide-react';
import { toast } from 'sonner';
import * as XLSX from 'xlsx';

export function SpreadsheetEditorPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [spreadsheetTitle, setSpreadsheetTitle] = useState('Nouveau Tableur');

  const handleSave = async (data: unknown[]) => {
    try {
      const isNew = !id || id === 'new';
      const url = isNew ? '/api/office/documents' : `/api/office/documents/${id}`;
      const method = isNew ? 'POST' : 'PUT';
      const token = localStorage.getItem('token');

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : ''
        },
        body: JSON.stringify({
          title: spreadsheetTitle,
          content: data, // Unified content field
          type: 'spreadsheet'
        })
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || 'Erreur serveur');
      }

      const resData = await response.json();

      if (isNew && resData.id) {
        toast.success('Tableur créé avec succès!');
        navigate(`/office/spreadsheet/${resData.id}`, { replace: true });
      } else {
        toast.success('Tableur mis à jour!');
      }
    } catch (error) {
      console.error('Error saving spreadsheet:', error);
      toast.error(`Erreur lors de la sauvegarde: ${(error as Error).message}`);
    }
  };

  const handleExport = () => {
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet([[spreadsheetTitle]]);
    XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
    XLSX.writeFile(wb, `${spreadsheetTitle}.xlsx`);
    toast.success('Excel exporté avec succès');
  };

  return (
    <div className="h-screen flex flex-col bg-gray-100">
      {/* Top Bar */}
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
            value={spreadsheetTitle}
            onChange={(e) => setSpreadsheetTitle(e.target.value)}
            className="text-lg font-semibold bg-transparent border-none focus:outline-none focus:ring-2 focus:ring-green-500 rounded px-2"
            placeholder="Titre du tableur" />

        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleExport}>
            <Download className="h-4 w-4 mr-2" />
            Exporter Excel
          </Button>
          <Button variant="outline" size="sm">
            <Share2 className="h-4 w-4 mr-2" />
            Partager
          </Button>
        </div>
      </div>

      {/* Editor */}
      <div className="flex-1 overflow-hidden">
        <SpreadsheetEditor
          spreadsheetId={id}
          onSave={handleSave} />

      </div>
    </div>);

}