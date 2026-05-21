import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { History, Download, RotateCcw, Loader2, FileText } from 'lucide-react';
import { toast } from 'sonner';

interface Version {
    id: string;
    version: string;
    is_latest: boolean;
    version_comment: string;
    version_created_at: string;
    version_created_by_name: string;
    file_size: number;
}

interface VersionHistoryProps {
    documentId: string;
    documentName: string;
    onClose: () => void;
}

export function VersionHistory({ documentId, documentName, onClose }: VersionHistoryProps) {
    const [versions, setVersions] = useState<Version[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isRestoring, setIsRestoring] = useState<string | null>(null);

    useEffect(() => {
        loadVersions();
    }, [documentId]);

    const loadVersions = async () => {
        setIsLoading(true);
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`/api/media-files/${documentId}/versions`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.ok) {
                const data = await response.json();
                setVersions(data);
            } else {
                toast.error('Erreur de chargement des versions');
            }
        } catch (error) {
            console.error('Error loading versions:', error);
            toast.error('Erreur réseau');
        } finally {
            setIsLoading(false);
        }
    };

    const handleDownloadVersion = async (versionId: string, version: string) => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`/api/media-files/${versionId}/download`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.ok) {
                const blob = await response.blob();
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `${documentName}_v${version}`;
                document.body.appendChild(a);
                a.click();
                window.URL.revokeObjectURL(url);
                document.body.removeChild(a);
                toast.success(`Version ${version} téléchargée`);
            } else {
                toast.error('Erreur de téléchargement');
            }
        } catch (error) {
            console.error('Error downloading version:', error);
            toast.error('Erreur réseau');
        }
    };

    const handleRestoreVersion = async (versionId: string, version: string) => {
        if (!confirm(`Restaurer la version ${version} ? Cela créera une nouvelle version.`)) {
            return;
        }

        setIsRestoring(versionId);
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`/api/media-files/${documentId}/restore-version/${versionId}`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.ok) {
                toast.success(`Version ${version} restaurée`);
                loadVersions();
            } else {
                toast.error('Erreur de restauration');
            }
        } catch (error) {
            console.error('Error restoring version:', error);
            toast.error('Erreur réseau');
        } finally {
            setIsRestoring(null);
        }
    };

    const formatFileSize = (bytes: number) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    return (
        <Dialog open={true} onOpenChange={onClose}>
            <DialogContent className="max-w-3xl max-h-[80vh]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <History className="h-5 w-5 text-proqblue" />
                        Historique des versions - {documentName}
                    </DialogTitle>
                </DialogHeader>

                {isLoading ? (
                    <div className="flex items-center justify-center py-12">
                        <Loader2 className="h-8 w-8 animate-spin text-proqblue" />
                    </div>
                ) : versions.length === 0 ? (
                    <div className="text-center py-12 text-gray-500">
                        <FileText className="h-16 w-16 mx-auto mb-4 opacity-50" />
                        <p>Aucune version trouvée</p>
                    </div>
                ) : (
                    <ScrollArea className="h-96">
                        <div className="space-y-4 pr-4">
                            {versions.map((ver, index) => (
                                <div
                                    key={ver.id}
                                    className={`border rounded-lg p-4 ${ver.is_latest ? 'bg-blue-50 border-blue-300' : 'bg-white'}`}
                                >
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-2">
                                                <h3 className="font-semibold text-lg">Version {ver.version}</h3>
                                                {ver.is_latest && (
                                                    <Badge className="bg-green-600 text-white">Actuelle</Badge>
                                                )}
                                                {index === 0 && !ver.is_latest && (
                                                    <Badge variant="outline">Dernière</Badge>
                                                )}
                                            </div>

                                            <div className="space-y-1 text-sm text-gray-600">
                                                <p>
                                                    <span className="font-medium">Créée par:</span> {ver.version_created_by_name || 'Inconnu'}
                                                </p>
                                                <p>
                                                    <span className="font-medium">Date:</span>{' '}
                                                    {new Date(ver.version_created_at).toLocaleString('fr-FR')}
                                                </p>
                                                <p>
                                                    <span className="font-medium">Taille:</span> {formatFileSize(ver.file_size)}
                                                </p>
                                                {ver.version_comment && (
                                                    <p className="mt-2 p-2 bg-gray-100 rounded text-gray-700 italic">
                                                        "{ver.version_comment}"
                                                    </p>
                                                )}
                                            </div>
                                        </div>

                                        <div className="flex flex-col gap-2 ml-4">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => handleDownloadVersion(ver.id, ver.version)}
                                            >
                                                <Download className="h-4 w-4 mr-2" />
                                                Télécharger
                                            </Button>

                                            {!ver.is_latest && (
                                                <Button
                                                    variant="secondary"
                                                    size="sm"
                                                    onClick={() => handleRestoreVersion(ver.id, ver.version)}
                                                    disabled={isRestoring === ver.id}
                                                >
                                                    {isRestoring === ver.id ? (
                                                        <>
                                                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                                            Restauration...
                                                        </>
                                                    ) : (
                                                        <>
                                                            <RotateCcw className="h-4 w-4 mr-2" />
                                                            Restaurer
                                                        </>
                                                    )}
                                                </Button>
                                            )}
                                        </div>
                                    </div>

                                    {/* Timeline connector */}
                                    {index < versions.length - 1 && (
                                        <div className="ml-4 mt-4 mb-0 h-4 border-l-2 border-gray-300"></div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </ScrollArea>
                )}
            </DialogContent>
        </Dialog>
    );
}
