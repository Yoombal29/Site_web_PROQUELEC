import React, { useState, useEffect } from 'react';
import { Mail, Search, Trash2, Download, Check, X, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface Subscriber {
  id: string;
  email: string;
  source: string | null;
  subscribed_at: string;
  is_active: boolean;
}

export default function NewsletterAdminPanel() {
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchSubscribers = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/newsletter-subscribers', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Erreur');
      const data = await res.json();
      setSubscribers(Array.isArray(data) ? data : data.rows || []);
    } catch {
      // Fallback: try from admin API
      try {
        const token = localStorage.getItem('token');
        const res = await fetch('/api/admin/newsletter-subscribers', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setSubscribers(Array.isArray(data) ? data : []);
        }
      } catch (err) {
        // ignore secondary fallback endpoint errors
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchSubscribers(); }, []);

  const handleDelete = async (id: string, email: string) => {
    if (!confirm(`Supprimer ${email} ?`)) return;
    try {
      const token = localStorage.getItem('token');
      await fetch(`/api/newsletter-subscribers/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      setSubscribers(prev => prev.filter(s => s.id !== id));
      toast.success(`${email} supprimé`);
    } catch {
      toast.error('Erreur de suppression');
    }
  };

  const handleExport = () => {
    const csv = 'Email;Date;Source;Actif\n' +
      filtered.map(s => `${s.email};${s.subscribed_at};${s.source || ''};${s.is_active ? 'Oui' : 'Non'}`).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `newsletter-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    toast.success(`${filtered.length} emails exportés`);
  };

  const filtered = subscribers.filter(s =>
    s.email.toLowerCase().includes(search.toLowerCase())
  );
  const activeCount = subscribers.filter(s => s.is_active).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Newsletter</h2>
          <p className="text-sm text-gray-500">{subscribers.length} inscrits ({activeCount} actifs)</p>
        </div>
        <Button onClick={handleExport} variant="outline" className="gap-2">
          <Download size={14} /> Exporter CSV
        </Button>
      </div>

      <div className="relative">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <Input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Rechercher par email..."
          className="pl-9"
        />
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12 text-gray-400">
          <Loader2 size={20} className="animate-spin mr-2" /> Chargement...
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <Mail size={40} className="mx-auto mb-3 opacity-30" />
          {search ? 'Aucun résultat' : 'Aucun inscrit'}
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-4 py-3 font-semibold text-gray-700">Email</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-700 hidden md:table-cell">Date</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-700 hidden sm:table-cell">Source</th>
                <th className="text-center px-4 py-3 font-semibold text-gray-700">Actif</th>
                <th className="text-right px-4 py-3 font-semibold text-gray-700">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map(s => (
                <tr key={s.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 font-medium text-gray-900">{s.email}</td>
                  <td className="px-4 py-3 text-gray-500 hidden md:table-cell">
                    {new Date(s.subscribed_at).toLocaleDateString('fr-FR')}
                  </td>
                  <td className="px-4 py-3 hidden sm:table-cell">
                    <Badge variant="secondary" className="text-xs">{s.source || 'Site'}</Badge>
                  </td>
                  <td className="px-4 py-3 text-center">
                    {s.is_active
                      ? <Check size={16} className="inline text-green-600" />
                      : <X size={16} className="inline text-red-400" />}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => handleDelete(s.id, s.email)} className="text-red-400 hover:text-red-600 transition-colors p-1">
                      <Trash2 size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
