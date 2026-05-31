import React, { useState, useEffect } from 'react';
import { Loader2, Trash2, Download, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { apiFetch } from '@/lib/api-client';

interface Submission {
  id: string;
  form_id: string | null;
  form_name: string | null;
  data: Record<string, unknown> | null;
  submitted_at: string | null;
  ip_address: string | null;
  user_agent: string | null;
}

export function AdminFormSubmissionsPanel() {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedForm, setSelectedForm] = useState<string>('all');

  const fetchSubmissions = async () => {
    setLoading(true);
    try {
      const data = await apiFetch<Submission[]>('/api/form-submissions');
      setSubmissions(data || []);
    } catch {
      setSubmissions([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchSubmissions(); }, []);

  const handleDelete = async (id: string) => {
    if (!window.confirm('Supprimer cette soumission ?')) return;
    try {
      await apiFetch(`/api/form-submissions/${id}`, { method: 'DELETE' });
      setSubmissions(prev => prev.filter(s => s.id !== id));
      toast.success('Soumission supprimée');
    } catch {
      toast.error('Erreur lors de la suppression');
    }
  };

  const handleExportCSV = () => {
    const filtered = getFiltered();
    if (filtered.length === 0) { toast.error('Aucune soumission à exporter'); return; }
    const allKeys = new Set<string>();
    filtered.forEach(s => { if (s.data) Object.keys(s.data).forEach(k => allKeys.add(k)); });
    const keys = Array.from(allKeys);
    const headers = ['Date', 'Formulaire', ...keys];
    const rows = filtered.map(s => [
      s.submitted_at ? new Date(s.submitted_at).toLocaleString('fr-FR') : '',
      s.form_name || '',
      ...keys.map(k => String(s.data?.[k] ?? ''))]
    );
    const csv = [headers.join(';'), ...rows.map(r => r.map(v => '"' + v.replace(/"/g, '""') + '"').join(';'))].join('\n');
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'soumissions-' + new Date().toISOString().slice(0, 10) + '.csv';
    link.click();
    toast.success('Export CSV téléchargé');
  };

  const formNames = Array.from(new Set(submissions.map(s => s.form_name).filter(Boolean))) as string[];

  const getFiltered = () => submissions.filter(s => {
    if (selectedForm !== 'all' && s.form_name !== selectedForm) return false;
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    if ((s.form_name || '').toLowerCase().includes(q)) return true;
    if (s.data) {
      for (const val of Object.values(s.data)) {
        if (String(val || '').toLowerCase().includes(q)) return true;
      }
    }
    return false;
  });

  const filtered = getFiltered();

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-2xl font-bold text-slate-800">Soumissions Formulaires</CardTitle>
            <CardDescription>Consultez et gérez les données envoyées via les formulaires du site</CardDescription>
          </div>
          <Button variant="outline" size="sm" onClick={handleExportCSV} className="gap-2">
            <Download size={14} /> Export CSV
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-3 mb-4">
          <div className="relative flex-1">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <Input
              value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Rechercher dans les soumissions..." className="pl-9"
            />
          </div>
          <select
            value={selectedForm} onChange={e => setSelectedForm(e.target.value)}
            className="h-10 rounded-md border border-slate-200 bg-white px-3 text-sm"
          >
            <option value="all">Tous les formulaires</option>
            {formNames.map(name => <option key={name} value={name}>{name}</option>)}
          </select>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="animate-spin w-8 h-8 text-blue-600" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-slate-400">
            <p className="text-lg font-medium">Aucune soumission</p>
            <p className="text-sm mt-1">Les données des formulaires remplis apparaîtront ici.</p>
          </div>
        ) : (
          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Formulaire</TableHead>
                  <TableHead>Données</TableHead>
                  <TableHead className="w-20 text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map(sub => (
                  <TableRow key={sub.id}>
                    <TableCell className="whitespace-nowrap text-xs text-slate-500">
                      {sub.submitted_at ? new Date(sub.submitted_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '-'}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-xs">{sub.form_name || '—'}</Badge>
                    </TableCell>
                    <TableCell className="max-w-xs">
                      <div className="flex flex-wrap gap-1">
                        {sub.data && Object.entries(sub.data).slice(0, 4).map(([k, v]) => (
                          <span key={k} className="text-xs bg-slate-100 px-1.5 py-0.5 rounded text-slate-600">
                            <span className="font-medium">{k}:</span> {String(v).slice(0, 40)}
                          </span>
                        ))}
                        {sub.data && Object.keys(sub.data).length > 4 && (
                          <span className="text-xs text-slate-400">+{Object.keys(sub.data).length - 4}</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" onClick={() => handleDelete(sub.id)} className="text-rose-500 hover:text-rose-700 hover:bg-rose-50">
                        <Trash2 size={14} />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}

        <p className="text-xs text-slate-400 mt-3">
          {filtered.length} soumission{filtered.length > 1 ? 's' : ''}
          {selectedForm !== 'all' && ` pour ${selectedForm}`}
        </p>
      </CardContent>
    </Card>
  );
}
