/**
 * AdminNewsletterPanel.tsx
 * Interface complète de gestion newsletter
 * Inscription, envoi, historique des campagnes
 */
import React, { useState, useEffect } from 'react';
import { apiFetch } from '@/lib/api-client';
import { toast } from 'sonner';
import {
  Mail,
  Send,
  Users,
  TrendingUp,
  History,
  Download,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  FileText,
  Smartphone,
} from 'lucide-react';

export default function AdminNewsletterPanel() {
  const [tab, setTab] = useState<'compose' | 'subscribers' | 'campaigns'>('compose');
  const [sending, setSending] = useState(false);
  const [subscribers, setSubscribers] = useState<any[]>([]);
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [preview, setPreview] = useState(false);
  const [form, setForm] = useState({ title: '', subject: '', content: '' });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [subs, camps] = await Promise.all([
        apiFetch<any[]>('/api/newsletter-subscribers').catch(() => []),
        apiFetch<any[]>('/api/admin/newsletter/campaigns').catch(() => []),
      ]);
      setSubscribers(Array.isArray(subs) ? subs : []);
      setCampaigns(Array.isArray(camps) ? camps : []);
    } catch {}
    setLoading(false);
  };

  const handleSend = async () => {
    if (!form.title || !form.content) {
      toast.error('Titre et contenu requis');
      return;
    }
    if (subscribers.length === 0) {
      toast.error('Aucun abonné actif');
      return;
    }
    if (!confirm(`Envoyer la newsletter à ${subscribers.length} abonné(s) ?`)) return;

    setSending(true);
    try {
      await apiFetch('/api/admin/newsletter/send', {
        method: 'POST',
        body: JSON.stringify({
          title: form.title,
          subject: form.subject || form.title,
          content: form.content,
        }),
      });
      toast.success(`Newsletter envoyée à ${subscribers.length} abonné(s) !`);
      setForm({ title: '', subject: '', content: '' });
      loadData();
    } catch (err: any) {
      toast.error(err.message || 'Erreur envoi');
    } finally {
      setSending(false);
    }
  };

  const handleExport = () => {
    const csv =
      'Email;Date;Actif\n' +
      subscribers
        .map((s: any) => `${s.email};${s.subscribed_at || ''};${s.is_active ? 'Oui' : 'Non'}`)
        .join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `newsletter-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    toast.success(`${subscribers.length} emails exportés`);
  };

  const activeSubscribers = subscribers.filter((s: any) => s.is_active !== false);

  const generatePreview = () => {
    const content = form.content || 'Contenu de la newsletter…';
    return `<!DOCTYPE html><html><head><style>
      body{margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;background:#f4f6f9}
      .container{max-width:600px;margin:0 auto;padding:20px}
      .header{background:linear-gradient(135deg,#1e3a5f,#2563eb);padding:30px;text-align:center;border-radius:16px 16px 0 0}
      .header h1{color:#fff;margin:0;font-size:24px}
      .body{background:#fff;padding:30px;border-radius:0 0 16px 16px}
      .body p{color:#475569;font-size:15px;line-height:1.7}
      .footer{text-align:center;padding:20px;color:#94a3b8;font-size:12px}
    </style></head><body>
      <div class="container">
        <div class="header"><h1>${form.title || 'Titre'}</h1></div>
        <div class="body">${content}</div>
        <div class="footer"><p>PROQUELEC Sénégal</p></div>
      </div>
    </body></html>`;
  };

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="flex gap-2 border-b border-border pb-2 overflow-x-auto">
        {[
          { id: 'compose' as const, label: 'Composer', icon: Mail },
          { id: 'subscribers' as const, label: 'Abonnés', icon: Users },
          { id: 'campaigns' as const, label: 'Campagnes', icon: History },
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition ${
              tab === t.id
                ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400'
            }`}
          >
            <t.icon className="w-4 h-4" /> {t.label}
          </button>
        ))}
      </div>

      {/* ─── TAB: COMPOSER ─── */}
      {tab === 'compose' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Formulaire */}
          <div className="lg:col-span-2 bg-card border border-border rounded-xl p-6 space-y-4">
            <h3 className="font-bold text-foreground flex items-center gap-2">
              <Mail className="w-5 h-5 text-blue-500" />
              Nouvelle campagne
            </h3>

            <div>
              <label className="text-xs font-medium text-slate-500 mb-1 block">Titre *</label>
              <input
                value={form.title}
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                className="w-full px-3 py-2 border border-border rounded-lg text-sm bg-background"
                placeholder="Ex: Newsletter Juin 2026"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-500 mb-1 block">Objet (email)</label>
              <input
                value={form.subject}
                onChange={(e) => setForm((f) => ({ ...f, subject: e.target.value }))}
                className="w-full px-3 py-2 border border-border rounded-lg text-sm bg-background"
                placeholder="Optionnel, sinon titre"
              />
            </div>
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-medium text-slate-500">Contenu HTML *</label>
                <button
                  onClick={() => setPreview((p) => !p)}
                  className="text-xs text-blue-500 hover:text-blue-400 flex items-center gap-1"
                >
                  {preview ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                  {preview ? 'Éditer' : 'Aperçu'}
                </button>
              </div>
              {preview ? (
                <div className="border border-border rounded-lg overflow-hidden bg-white">
                  <iframe srcDoc={generatePreview()} className="w-full h-[400px]" title="Aperçu" />
                </div>
              ) : (
                <textarea
                  value={form.content}
                  onChange={(e) => setForm((f) => ({ ...f, content: e.target.value }))}
                  rows={12}
                  className="w-full px-3 py-2 border border-border rounded-lg text-sm bg-background font-mono resize-y"
                  placeholder="<h2>Actualités</h2><p>Contenu de la newsletter...</p>"
                />
              )}
            </div>

            <button
              onClick={handleSend}
              disabled={sending || !form.title || !form.content}
              className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-bold text-sm hover:shadow-lg transition disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {sending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
              {sending ? 'Envoi en cours...' : `Envoyer à ${activeSubscribers.length} abonné(s)`}
            </button>
          </div>

          {/* Stats */}
          <div className="space-y-4">
            <div className="bg-card border border-border rounded-xl p-6 space-y-4">
              <h4 className="font-bold text-foreground text-sm">Statistiques</h4>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-blue-50 dark:bg-blue-900/10 rounded-xl p-4 text-center">
                  <Users className="w-5 h-5 text-blue-500 mx-auto mb-1" />
                  <p className="text-2xl font-bold text-foreground">{activeSubscribers.length}</p>
                  <p className="text-[10px] text-slate-500">Abonnés actifs</p>
                </div>
                <div className="bg-emerald-50 dark:bg-emerald-900/10 rounded-xl p-4 text-center">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500 mx-auto mb-1" />
                  <p className="text-2xl font-bold text-foreground">{campaigns.length}</p>
                  <p className="text-[10px] text-slate-500">Campagnes</p>
                </div>
              </div>
            </div>
            <div className="bg-card border border-border rounded-xl p-6">
              <h4 className="font-bold text-foreground text-sm mb-3">Aide</h4>
              <ul className="space-y-2 text-xs text-slate-500">
                <li className="flex items-start gap-2">
                  <FileText className="w-3 h-3 mt-0.5 text-blue-500" />
                  Utilisez du HTML pour le contenu
                </li>
                <li className="flex items-start gap-2">
                  <Smartphone className="w-3 h-3 mt-0.5 text-blue-500" />
                  Le template est responsive
                </li>
                <li className="flex items-start gap-2">
                  <Users className="w-3 h-3 mt-0.5 text-blue-500" />
                  Seuls les abonnés actifs reçoivent
                </li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* ─── TAB: ABONNÉS ─── */}
      {tab === 'subscribers' && (
        <div className="bg-card border border-border rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-foreground flex items-center gap-2">
              <Users className="w-5 h-5 text-blue-500" />
              Abonnés ({subscribers.length})
            </h3>
            <button
              onClick={handleExport}
              className="flex items-center gap-2 px-3 py-1.5 bg-emerald-600 text-white rounded-lg text-xs font-bold hover:bg-emerald-700 transition"
            >
              <Download className="w-3 h-3" /> Export CSV
            </button>
          </div>

          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="w-5 h-5 animate-spin text-slate-400" />
            </div>
          ) : subscribers.length === 0 ? (
            <div className="text-center py-8 text-slate-400">
              <Users className="w-8 h-8 mx-auto mb-2 opacity-30" />
              <p className="text-sm">Aucun abonné</p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {subscribers.map((s: any) => (
                <div key={s.id || s.email} className="flex items-center justify-between py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold">
                      {s.email?.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-medium">{s.email}</p>
                      <p className="text-[10px] text-slate-500">
                        {s.subscribed_at
                          ? new Date(s.subscribed_at).toLocaleDateString('fr-FR')
                          : ''}
                        {s.source ? ` · ${s.source}` : ''}
                      </p>
                    </div>
                  </div>
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                      s.is_active !== false
                        ? 'bg-green-100 text-green-700'
                        : 'bg-red-100 text-red-700'
                    }`}
                  >
                    {s.is_active !== false ? 'Actif' : 'Inactif'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ─── TAB: CAMPAGNES ─── */}
      {tab === 'campaigns' && (
        <div className="bg-card border border-border rounded-xl p-6">
          <h3 className="font-bold text-foreground flex items-center gap-2 mb-4">
            <History className="w-5 h-5 text-amber-500" />
            Campagnes ({campaigns.length})
          </h3>

          {campaigns.length === 0 ? (
            <div className="text-center py-8 text-slate-400">
              <History className="w-8 h-8 mx-auto mb-2 opacity-30" />
              <p className="text-sm">Aucune campagne envoyée</p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {campaigns.map((c: any) => (
                <div key={c.id} className="flex items-center justify-between py-3">
                  <div>
                    <p className="text-sm font-medium">{c.title}</p>
                    <p className="text-xs text-slate-500">
                      {c.subject ? `Sujet: ${c.subject}` : ''}
                      {c.sent_at ? ` · ${new Date(c.sent_at).toLocaleDateString('fr-FR')}` : ''}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 text-xs">
                    <span className="text-green-600 font-medium">{c.total_sent || 0} envoyés</span>
                    {c.total_failed > 0 && (
                      <span className="text-red-600">{c.total_failed} échecs</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
