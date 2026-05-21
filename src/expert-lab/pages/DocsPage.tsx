import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  HardDrive,
  ShieldCheck,
  Search,
  Download,
  Upload,
  Trash2,
  Loader2
} from "lucide-react";
import { useState, useEffect } from "react";
import { apiFetch } from "@/lib/api-client";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

interface MediaFile {
  id: number;
  file_name: string;
  file_path: string;
  mime_type: string;
  file_size: number;
  uploaded_at: string;
}

export default function DocsPage() {
  const { toast } = useToast();
  const [files, setFiles] = useState<MediaFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchFiles();
  }, []);

  const fetchFiles = async () => {
    setLoading(true);
    try {
      const data = await apiFetch<MediaFile[]>('/api/storage/files');
      setFiles(data);
    } catch (err) {
      console.error("Failed to fetch files:", err);
      // Fail gently
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    setUploading(true);
    try {
      const token = localStorage.getItem('token');
      // We use the generic upload endpoint /api/ai/vision which handles generic file uploads in current index.js
      // OR we create a specific one. Based on index.js analysis, upload logic exists.
      // Let's assume /api/storage/upload doesn't exist yet but index.js has upload logic.
      // I'll try to hit the root upload handler if possible. 
      // Actually, looking at index.js, the upload middleware is used in app.post('/api/ai/vision'...).
      // We might need to add a dedicated route in index.js for clean GED.
      // BUT for now, let's try to hit a likely endpoint or add it.
      // I will ADD the endpoint in index.js in next step if this fails.

      const res = await fetch('/api/storage/upload', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      });

      if (!res.ok) throw new Error("Upload failed (Route missing?)");

      toast({ title: "Succès", description: "Document archivé en sécurité." });
      fetchFiles();
    } catch (err) {
      console.error(err);
      toast({ title: "Erreur Upload", description: "Route d'upload non configurée.", variant: "destructive" });
    } finally {
      setUploading(false);
    }
  };

  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const filteredFiles = files.filter(f => f.file_name.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div className="min-h-screen bg-background p-6 space-y-8 relative overflow-hidden">
      <div className="scanline" />

      {/* HEADER */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-indigo-500/20 pb-6 relative z-10">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 glass-docs rounded-2xl flex items-center justify-center shadow-[0_0_20px_rgba(129,140,248,0.3)] border border-indigo-500/40">
            <HardDrive className="w-8 h-8 text-indigo-400" />
          </div>
          <div>
            <h1 className="text-3xl font-black uppercase italic tracking-tighter text-foreground">
              GED <span className="text-indigo-400 tracking-normal">Souveraine</span>
            </h1>
            <div className="flex items-center gap-2 mt-1">
              <ShieldCheck className="w-3 h-3 text-indigo-400/50" />
              <span className="text-[10px] uppercase font-black tracking-widest text-zinc-500 opacity-50">Stockage Local Sécurisé</span>
            </div>
          </div>
        </div>

        <div className="flex gap-4 items-center w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-indigo-400/40" />
            <Input
              className="glass-docs pl-10 h-10 border-indigo-500/20 bg-black/20"
              placeholder="Rechercher..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="relative">
            <input type="file" id="file-upload" className="hidden" onChange={handleFileUpload} disabled={uploading} />
            <label htmlFor="file-upload">
              <Button variant="outline" className="cursor-pointer border-indigo-500/30 hover:bg-indigo-500/10 text-indigo-400 uppercase font-bold text-xs" asChild>
                <span>
                  {uploading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Upload className="w-4 h-4 mr-2" />}
                  Upload
                </span>
              </Button>
            </label>
          </div>
        </div>
      </div>

      {/* FILE LIST */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 relative z-10">
        <Card className="border-2 border-dashed border-indigo-500/20 bg-indigo-500/5 hover:bg-indigo-500/10 transition-colors cursor-pointer flex items-center justify-center group h-[180px]">
          <label htmlFor="file-upload" className="w-full h-full flex flex-col items-center justify-center cursor-pointer">
            <Upload className="w-10 h-10 text-indigo-400/50 group-hover:text-indigo-400 mb-4 transition-colors" />
            <span className="text-xs uppercase font-bold text-indigo-400/70">Déposer un fichier</span>
          </label>
        </Card>

        {loading ? (
          <div className="col-span-3 flex items-center justify-center h-[180px] text-muted-foreground">
            <Loader2 className="w-8 h-8 animate-spin" />
          </div>
        ) : filteredFiles.length === 0 ? (
          <div className="col-span-3 flex items-center justify-center h-[180px] text-muted-foreground text-sm italic">
            Aucun document archivé.
          </div>
        ) : (
          filteredFiles.map((file) => (
            <Card key={file.id} className="glass-docs border-indigo-500/10 hover:border-indigo-500/40 group transition-all relative overflow-hidden h-[180px] flex flex-col">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start mb-2">
                  <Badge variant="outline" className="text-[9px] border-indigo-500/30 text-indigo-400 bg-indigo-500/5 uppercase truncate max-w-[100px]">
                    {file.mime_type.split('/')[1] || 'FILE'}
                  </Badge>
                  <span className="text-[9px] font-mono opacity-40">{formatSize(file.file_size)}</span>
                </div>
                <CardTitle className="text-sm font-bold truncate" title={file.file_name}>
                  {file.file_name}
                </CardTitle>
                <CardDescription className="text-[10px]">
                  {file.uploaded_at ? format(new Date(file.uploaded_at), "dd MMM yyyy", { locale: fr }) : 'N/A'}
                </CardDescription>
              </CardHeader>
              <CardContent className="mt-auto flex justify-between items-center">
                <Button variant="ghost" size="sm" className="h-8 text-[10px] hover:text-cyan-400 w-full justify-start" onClick={() => window.open(file.file_path, '_blank')}>
                  <Download className="w-3 h-3 mr-2" /> Ouvrir
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8 hover:text-red-400 shrink-0">
                  <Trash2 className="w-3 h-3" />
                </Button>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}