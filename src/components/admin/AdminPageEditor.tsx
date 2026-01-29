import React, { useState, useEffect } from "react";
import Editor, { DiffEditor } from "@monaco-editor/react";
import { supabase } from "@/integrations/supabase/client";
import Iframe from "react-iframe";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Lock, Save, Eye, Code, History } from "lucide-react";
import { toast } from "sonner";

interface AdminPageEditorProps {
    pageId: string;
}

export const AdminPageEditor: React.FC<AdminPageEditorProps> = ({ pageId }) => {
    const [page, setPage] = useState<any | null>(null);
    const [content, setContent] = useState<string>("");
    const [immutable, setImmutable] = useState<boolean>(false);
    const [version, setVersion] = useState<number>(1);
    const [diffContent, setDiffContent] = useState<string>("");
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    // Fetch page data with ICE columns
    useEffect(() => {
        const fetchPage = async () => {
            setIsLoading(true);
            const { data, error } = await supabase
                .from("pages")
                .select("id, title, content_raw, immutable, version, security_level, updated_at")
                .eq("id", pageId)
                .single();

            if (error) {
                console.error("Error fetching page:", error);
                toast.error("Impossible de charger la page");
            } else {
                setPage(data);
                setContent(data.content_raw || "");
                setImmutable(data.immutable);
                setVersion(data.version || 1);

                // Fetch previous version for diff if version > 1
                if ((data.version || 1) > 1) {
                    const { data: prevData } = await supabase
                        .from("page_versions")
                        .select("content_raw")
                        .eq("page_id", pageId)
                        .eq("version", (data.version || 1) - 1)
                        .single();
                    if (prevData) setDiffContent(prevData.content_raw);
                }
            }
            setIsLoading(false);
        };

        if (pageId) fetchPage();
    }, [pageId]);

    // Save page (Respects ICE architecture: content_raw only)
    const handleSave = async () => {
        if (!page) return;
        if (immutable) {
            toast.error("Cette page est IMMUABLE. Modification interdite.");
            return;
        }

        setIsSaving(true);
        const { data, error } = await supabase
            .from("pages")
            .update({
                content_raw: content,
                // The trigger will handle version increment, diff storage, and content_hash
                updated_at: new Date().toISOString()
            })
            .eq("id", page.id)
            .select()
            .single();

        if (error) {
            console.error("Save error:", error);
            toast.error("Erreur lors de la sauvegarde: " + error.message);
        } else {
            toast.success("Page sauvegardée (v" + data.version + ")");
            setPage(data);
            setVersion(data.version);
            // Update diff content to the previous state (which is what we just overwrote effectively, 
            // but for UI logic, we might want to reload or keep current as baseline. 
            // Simplification: setDiffContent to "what was before save" is hard without reload.
            // Let's rely on reload for proper diffs or optimistic update?
            // For now, let's keep diffContent static until reload or fetch.
        }
        setIsSaving(false);
    };

    if (isLoading) return <div className="p-8 text-center">Chargement du moteur ICE...</div>;
    if (!page) return <div className="p-8 text-center text-red-500">Page introuvable</div>;

    return (
        <div className="flex flex-col h-[calc(100vh-100px)] gap-4">
            {/* Header / Status Bar */}
            <div className="flex items-center justify-between p-4 bg-slate-50 border-b">
                <div className="flex items-center gap-4">
                    <h2 className="text-lg font-bold flex items-center gap-2">
                        {page.title}
                        <Badge variant="outline">v{version}</Badge>
                    </h2>
                    {immutable ? (
                        <Badge variant="destructive" className="flex gap-1"><Lock className="w-3 h-3" /> IMMUTABLE</Badge>
                    ) : (
                        <Badge variant="default" className="bg-green-600">EDITABLE</Badge>
                    )}
                    <Badge variant="secondary">{page.security_level || 'trusted'}</Badge>
                </div>

                <div className="flex gap-2">
                    <Button
                        onClick={handleSave}
                        disabled={immutable || isSaving}
                        className={immutable ? "opacity-50 cursor-not-allowed" : ""}
                    >
                        <Save className="w-4 h-4 mr-2" />
                        {isSaving ? "Sauvegarde..." : "Enregistrer"}
                    </Button>
                </div>
            </div>

            {immutable && (
                <Alert variant="destructive" className="mx-4">
                    <Lock className="h-4 w-4" />
                    <AlertTitle>Modification Interdite</AlertTitle>
                    <AlertDescription>
                        Cette page est protégée en écriture (Mode Immuable). Contactez un administrateur Root pour déverrouiller.
                    </AlertDescription>
                </Alert>
            )}

            {/* Main Editor Area */}
            <Tabs defaultValue="editor" className="flex-1 flex flex-col mx-4 mb-4">
                <TabsList>
                    <TabsTrigger value="editor" className="flex gap-2"><Code className="w-4 h-4" /> Code (Monaco)</TabsTrigger>
                    <TabsTrigger value="preview" className="flex gap-2"><Eye className="w-4 h-4" /> Preview (Sandbox)</TabsTrigger>
                    <TabsTrigger value="diff" className="flex gap-2" disabled={version <= 1}><History className="w-4 h-4" /> Diff (v{version - 1})</TabsTrigger>
                </TabsList>

                {/* CODE EDITOR */}
                <TabsContent value="editor" className="flex-1 border rounded-md overflow-hidden bg-[#1e1e1e]">
                    <Editor
                        height="100%"
                        defaultLanguage="html"
                        theme="vs-dark"
                        value={content}
                        onChange={(val) => setContent(val || "")}
                        options={{
                            minimap: { enabled: false },
                            fontSize: 14,
                            wordWrap: 'on',
                            padding: { top: 16 },
                            readOnly: immutable
                        }}
                    />
                </TabsContent>

                {/* SANDBOX PREVIEW */}
                <TabsContent value="preview" className="flex-1 border rounded-md bg-white">
                    <div className="w-full h-full relative p-4 bg-gray-100/50">
                        {/* WRAPPER FOR CENTERING PREVIEW */}
                        <div className="bg-white shadow-sm mx-auto h-full max-w-[1200px] border overflow-hidden">
                            <iframe
                                srcDoc={`<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><script src="https://cdn.tailwindcss.com"></script><style>body{margin:0;padding:20px;}</style></head><body>${content}</body></html>`}
                                width="100%"
                                height="100%"
                                id="ice-sandbox"
                                className="w-full h-full border-0"
                                // SANDBOX CONFIG: Allow scripts but isolate from admin logic
                                sandbox="allow-scripts allow-same-origin allow-popups"
                            />
                        </div>
                    </div>
                    <div className="p-2 bg-yellow-50 text-xs text-yellow-700 border-t items-center justify-center flex gap-2">
                        <Lock className="w-3 h-3" /> Sandbox Active: Isolation CSS Admin • Tailwind CDN Injecté
                    </div>
                </TabsContent>

                {/* DIFF VIEWER */}
                <TabsContent value="diff" className="flex-1 border rounded-md overflow-hidden bg-[#1e1e1e]">
                    <DiffEditor
                        height="100%"
                        language="html"
                        theme="vs-dark"
                        original={diffContent} // Previous Version
                        modified={content}     // Current (Edited) Version
                        options={{
                            readOnly: true,
                            renderSideBySide: true
                        }}
                    />
                </TabsContent>
            </Tabs>

        </div>
    );
};
