import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Activity, Download, Loader2, User } from 'lucide-react';
import { toast } from 'sonner';

interface AuditLog {
  id: string;
  action: string;
  username: string;
  created_at: string;
  metadata: unknown;
  ip_address: string;
}

interface AuditViewerProps {
  documentId?: string;
  documentName?: string;
  onClose: () => void;
}

export function AuditViewer({ documentId, documentName, onClose }: AuditViewerProps) {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterAction, setFilterAction] = useState<string>('all');
  const [searchUser, setSearchUser] = useState('');

  useEffect(() => {
    loadAuditLogs();
  }, [documentId]);

  const loadAuditLogs = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      const url = documentId ?
      `/api/audit/document/${documentId}` :
      `/api/audit/recent`;

      const response = await fetch(url, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setLogs(data);
      } else {
        toast.error('Erreur de chargement des logs');
      }
    } catch (error) {
      console.error('Error loading audit logs:', error);
      toast.error('Erreur réseau');
    } finally {
      setIsLoading(false);
    }
  };

  const handleExportCSV = () => {
    const headers = ['Date', 'Utilisateur', 'Action', 'Détails', 'IP'];
    const rows = filteredLogs.map((log) => [
    new Date(log.created_at).toLocaleString('fr-FR'),
    log.username || 'Système',
    getActionLabel(log.action),
    JSON.stringify(log.metadata),
    log.ip_address || 'N/A']
    );

    const csvContent = [
    headers.join(','),
    ...rows.map((row) => row.map((cell) => `"${cell}"`).join(','))].
    join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `audit_${documentName || 'global'}_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    toast.success('Export CSV réussi');
  };

  const getActionLabel = (action: string) => {
    const labels: Record<string, string> = {
      'upload': '📤 Upload',
      'download': '📥 Téléchargement',
      'delete': '🗑️ Suppression',
      'update': '✏️ Modification',
      'view': '👁️ Consultation',
      'share': '🔗 Partage',
      'grant_permission': '🔓 Permission accordée',
      'revoke_permission': '🔒 Permission révoquée',
      'approve': '✅ Approbation',
      'reject': '❌ Rejet'
    };
    return labels[action] || action;
  };

  const getActionColor = (action: string) => {
    if (action.includes('delete') || action.includes('reject')) return 'bg-red-100 text-red-800 border-red-300';
    if (action.includes('grant') || action.includes('approve')) return 'bg-green-100 text-green-800 border-green-300';
    if (action.includes('update') || action.includes('revoke')) return 'bg-yellow-100 text-yellow-800 border-yellow-300';
    return 'bg-blue-100 text-blue-800 border-blue-300';
  };

  const filteredLogs = logs.filter((log) => {
    const matchesAction = filterAction === 'all' || log.action === filterAction;
    const matchesUser = searchUser === '' || log.username?.toLowerCase().includes(searchUser.toLowerCase());
    return matchesAction && matchesUser;
  });

  const uniqueActions = Array.from(new Set(logs.map((l) => l.action)));

  return (
    <Dialog open={true} onOpenChange={onClose}>
            <DialogContent className="max-w-4xl max-h-[85vh]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Activity className="h-5 w-5 text-proqblue" />
                        Journal d'audit {documentName && `- ${documentName}`}
                    </DialogTitle>
                </DialogHeader>

                {/* Filters */}
                <div className="flex gap-3 items-center">
                    <div className="flex-1">
                        <Input
              placeholder="Rechercher par utilisateur..."
              value={searchUser}
              onChange={(e) => setSearchUser(e.target.value)}
              className="w-full"
              title="Rechercher par utilisateur" />
            
                    </div>

                    <Select value={filterAction} onValueChange={setFilterAction}>
                        <SelectTrigger className="w-48">
                            <SelectValue placeholder="Filtrer par action" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Toutes les actions</SelectItem>
                            {uniqueActions.map((action) =>
              <SelectItem key={action} value={action}>
                                    {getActionLabel(action)}
                                </SelectItem>
              )}
                        </SelectContent>
                    </Select>

                    <Button variant="outline" size="sm" onClick={handleExportCSV}>
                        <Download className="h-4 w-4 mr-2" />
                        Export CSV
                    </Button>
                </div>

                {isLoading ?
        <div className="flex items-center justify-center py-12">
                        <Loader2 className="h-8 w-8 animate-spin text-proqblue" />
                    </div> :
        filteredLogs.length === 0 ?
        <div className="text-center py-12 text-gray-500">
                        <Activity className="h-16 w-16 mx-auto mb-4 opacity-50" />
                        <p>Aucune activité enregistrée</p>
                    </div> :

        <ScrollArea className="h-96">
                        <div className="space-y-3 pr-4">
                            {filteredLogs.map((log) =>
            <div key={log.id} className="border rounded-lg p-4 bg-white hover:shadow-sm transition">
                                    <div className="flex items-start justify-between mb-2">
                                        <div className="flex items-center gap-2">
                                            <Badge className={`${getActionColor(log.action)} border`}>
                                                {getActionLabel(log.action)}
                                            </Badge>
                                            <span className="text-sm text-gray-600">
                                                {new Date(log.created_at).toLocaleString('fr-FR')}
                                            </span>
                                        </div>

                                        {log.ip_address &&
                <span className="text-xs text-gray-400 font-mono">{log.ip_address}</span>
                }
                                    </div>

                                    <div className="flex items-center gap-2 text-sm">
                                        <User className="h-4 w-4 text-gray-400" />
                                        <span className="font-medium">{log.username || 'Système'}</span>
                                    </div>

                                    {log.metadata && Object.keys(log.metadata).length > 0 &&
              <div className="mt-2 p-2 bg-gray-50 rounded text-xs">
                                            <details>
                                                <summary className="cursor-pointer text-gray-600 hover:text-gray-900">
                                                    Détails de l'action
                                                </summary>
                                                <pre className="mt-2 text-gray-700 overflow-x-auto">
                                                    {JSON.stringify(log.metadata, null, 2)}
                                                </pre>
                                            </details>
                                        </div>
              }
                                </div>
            )}
                        </div>
                    </ScrollArea>
        }

                <div className="text-sm text-gray-500 border-t pt-3">
                    Affichage de {filteredLogs.length} événement(s) sur {logs.length} total
                </div>
            </DialogContent>
        </Dialog>);

}