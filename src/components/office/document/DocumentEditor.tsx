import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import { StarterKit } from '@tiptap/starter-kit';
import { Image } from '@tiptap/extension-image';
import { Table } from '@tiptap/extension-table';
import { TableRow } from '@tiptap/extension-table-row';
import { TableCell } from '@tiptap/extension-table-cell';
import { TableHeader } from '@tiptap/extension-table-header';
import { Collaboration } from '@tiptap/extension-collaboration';
import { CollaborationCursor } from '@tiptap/extension-collaboration-cursor';
import { Color } from '@tiptap/extension-color';
import { TextStyle } from '@tiptap/extension-text-style';
import { FontFamily } from '@tiptap/extension-font-family';
import { TextAlign } from '@tiptap/extension-text-align';
import { Highlight } from '@tiptap/extension-highlight';
import { CharacterCount } from '@tiptap/extension-character-count';

import { Subscript } from '@tiptap/extension-subscript';
import { Superscript } from '@tiptap/extension-superscript';
import { TaskList } from '@tiptap/extension-task-list';
import { TaskItem } from '@tiptap/extension-task-item';
import * as Y from 'yjs';
import { WebsocketProvider } from 'y-websocket';
import { Button } from '@/components/ui/button';
import {
  FileText, Save, Loader2, HelpCircle,
  Sparkles, Cpu, X, Undo, Redo
} from
  'lucide-react';
import { DocumentToolbar } from './DocumentToolbar';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { useAutosave } from '@/hooks/useAutosave';
import { getLocalDocument } from '@/lib/offline-store';
import { useSession } from '@/hooks/useSession';

interface DocumentEditorProps {
  documentId?: string;
  initialContent?: string;
  initialTitle?: string;
  onSave?: (content: unknown, title?: string) => void;
}

const getRandomColor = () => {
  const colors = ['#958DF1', '#F98181', '#FBBC88', '#FAF594', '#70CFF8', '#94FADB', '#B9F18D'];
  return colors[Math.floor(Math.random() * colors.length)];
};

export function DocumentEditor({ documentId, initialContent = '', initialTitle = 'Nouveau Document', onSave }: DocumentEditorProps) {
  const { user } = useSession();
  const [isLoading, setIsLoading] = useState(!!documentId && documentId !== 'new');
  const [editorContent, setEditorContent] = useState<unknown>(null);
  const [title, setTitle] = useState(initialTitle);
  const [connectedUsers, setConnectedUsers] = useState<number>(0);
  const [isSidekickOpen, setIsSidekickOpen] = useState(false);
  const [activeSidekickTab, setActiveSidekickTab] = useState<'guide' | 'ai' | 'docs' | 'lab'>('guide');
  const [isAIGenerating, setIsAIGenerating] = useState(false);
  const [headerText] = useState('Expertise PROQUELEC • NS 01 001');
  const [footerText] = useState('Direction Générale de l\'Électricité • Sénégal');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('accueil');
  const [isAutoSaveEnabled, setIsAutoSaveEnabled] = useState(true);

  const ydoc = useMemo(() => new Y.Doc(), []);

  const provider = useMemo(() => {
    if (!documentId || documentId === 'new') return null;
    const wsUrl = `ws://${window.location.hostname}:1234`;
    const p = new WebsocketProvider(wsUrl, `document_${documentId}`, ydoc);

    p.awareness.setLocalStateField('user', {
      name: user?.email?.split('@')[0] || 'Anonyme',
      color: getRandomColor()
    });

    p.awareness.on('change', () => {
      setConnectedUsers(p.awareness.getStates().size);
    });

    return p;
  }, [documentId, ydoc, user]);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        history: !provider
      } as unknown),
      Image,
      Table.configure({ resizable: true }),
      TableRow,
      TableHeader,
      TableCell,
      ...(provider ? [
        Collaboration.configure({ document: ydoc }),
        CollaborationCursor.configure({
          provider: provider,
          user: {
            name: user?.email?.split('@')[0] || 'Anonyme',
            color: getRandomColor()
          }
        })] :
        []),
      Color,
      TextStyle,
      FontFamily,
      Highlight.configure({ multicolor: true }),
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      CharacterCount.configure({ limit: 50000 }),
      Subscript,
      Superscript,
      TaskList,
      TaskItem.configure({ nested: true })],

    editorProps: {
      attributes: {
        class: 'prose prose-sm sm:prose lg:prose-lg xl:prose-2xl m-5 focus:outline-none min-h-[500px] max-w-none'
      }
    },
    onUpdate: ({ editor }) => {
      setEditorContent(editor.getJSON());
    }
  }, [ydoc, provider]);

  useEffect(() => {
    return () => {
      provider?.destroy();
      ydoc.destroy();
    };
  }, [provider, ydoc]);

  const pushToServer = useCallback(async (content: unknown, title?: string) => {
    if (!documentId || documentId === 'new') return;
    const response = await fetch(`/api/office/documents/${documentId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify({
        content,
        title // Pass title as well for autosave
      })
    });

    if (!response.ok) throw new Error('Failed to save to server');

    return { updatedAt: Date.now() };
  }, [documentId, title]);

  const saveStatus = useAutosave({
    documentId: documentId || '',
    content: editorContent,
    pushToServer
  });

  useEffect(() => {
    if (!editor || !documentId || documentId === 'new') return;

    const loadContent = async () => {
      setIsLoading(true);
      try {
        const local = await getLocalDocument(documentId);
        const token = localStorage.getItem('token');
        const res = await fetch(`/api/office/documents/${documentId}`, {
          headers: { 'Authorization': token ? `Bearer ${token}` : '' }
        });

        if (res.ok) {
          const server = await res.json();
          let content = server.content;
          if (server.title) setTitle(server.title);
          if (typeof content === 'string') {
            try { content = JSON.parse(content); } catch (e) { }
          }
          if (ydoc.getXmlFragment('default').length === 0 && content) {
            editor.commands.setContent(content);
          }
        } else if (local) {
          editor.commands.setContent(local.content);
        }
      } finally {
        setIsLoading(false);
      }
    };
    loadContent();
  }, [documentId, editor, ydoc]);

  const generateTechnicalConclusion = async () => {
    if (!editor) return;
    setIsAIGenerating(true);
    try {
      // 1. Get Context
      const docText = editor.getText();
      if (!docText || docText.length < 50) {
        toast.error("Le document est trop court pour une analyse IA.");
        return;
      }

      toast.info("L'Inspecteur Normatif analyse votre document...");

      // 2. Call AI Master
      const { aiMaster } = await import('@/lib/ai-master');
      const response = await aiMaster.process({
        task: 'expert',
        prompt: "Analyse le texte technique ci-dessus. Génère une conclusion de conformité stricte à la norme NS 01-001. Formate la réponse en HTML avec : un titre <h3>, un court paragraphe de synthèse, et une liste <ul> de points conformes/non-conformes. Sois précis et technique.",
        context: { docsContext: docText }
      });

      if (response.success && typeof response.data === 'string') {
        // 3. Insert Result
        // Clean markdown code blocks if any (AI loves markdown)
        let htmlContent = response.data;

        // Remove potential markdown wrappers
        htmlContent = htmlContent.replace(/```html/g, '').replace(/```/g, '');

        // If raw text, basic format
        if (!htmlContent.includes('<')) {
          htmlContent = `<p>${htmlContent.replace(/\n/g, '<br>')}</p>`;
        }

        const conclusionBlock = `
            <div style="background-color: #f8fafc; border-left: 4px solid #2563eb; padding: 1rem; margin: 1rem 0; border-radius: 0.5rem;">
                ${htmlContent}
                <p style="font-size: 0.75rem; color: #64748b; margin-top: 0.5rem;">— Certifié par IA PROQUELEC (NS 01-001)</p>
            </div>
          `;

        editor.chain().focus().insertContent(conclusionBlock).run();
        toast.success("Conclusion technique générée avec succès");
      } else if (response.success && typeof response.data === 'object' && (response.data as any).answer) {
        // Handle object response (from ExpertRag)
        const answer = (response.data as any).answer;
        const conclusionBlock = `
            <div style="background-color: #f8fafc; border-left: 4px solid #2563eb; padding: 1rem; margin: 1rem 0; border-radius: 0.5rem;">
                <h3 style="color: #2563eb; font-size: 1.1em; font-weight: bold; margin-bottom: 0.5em;">Analyse Normative</h3>
                <div class="ai-content">${answer.replace(/\n/g, '<br>')}</div>
                <p style="font-size: 0.75rem; color: #64748b; margin-top: 0.5rem;">— Certifié par IA PROQUELEC (NS 01-001)</p>
            </div>
          `;
        editor.chain().focus().insertContent(conclusionBlock).run();
        toast.success("Conclusion technique générée");
      } else {
        throw new Error("Réponse IA invalide");
      }

    } catch (error) {
      console.error("AI Error:", error);
      toast.error("Erreur lors de l'analyse IA. Vérifiez votre connexion.");
    } finally {
      setIsAIGenerating(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full bg-gray-50 text-proqblue">
        <Loader2 className="h-10 w-10 animate-spin mr-3" />
        Chargement de la session...
      </div>);

  }

  if (!editor) return null;

  return (
    <div className="flex flex-col h-full bg-[#f3f2f1] overflow-hidden relative font-sans">
      {/* MS Word Style Title Bar (Blue) */}
      <div className="title-bar shadow-md z-50">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 bg-white/10 hover:bg-white/20 p-1 px-2 rounded cursor-pointer transition-all">
            <FileText className="w-4 h-4" />
            <span className="text-[10px] font-bold uppercase tracking-widest">Office Lab</span>
          </div>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" className="h-7 w-7 text-white hover:bg-white/20" onClick={() => onSave?.(editor.getHTML(), title)}>
              <Save className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-7 w-7 text-white hover:bg-white/20" onClick={() => editor.chain().focus().undo().run()} disabled={!editor.can().undo()}>
              <Undo className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-7 w-7 text-white hover:bg-white/20" onClick={() => editor.chain().focus().redo().run()} disabled={!editor.can().redo()}>
              <Redo className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="title-bar-center">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="bg-transparent border-none text-center focus:outline-none focus:ring-1 focus:ring-white/30 rounded px-4 min-w-[300px] hover:bg-white/5 transition-all text-sm font-medium"
            placeholder="Titre du document..." />

          <span className="opacity-60 font-light text-[10px]">- Enregistré dans le Cloud Souverain</span>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 mr-4">
            <span className="text-[10px] opacity-70">Enregistrement automatique</span>
            <div
              className={`w-8 h-4 rounded-full p-0.5 cursor-pointer transition-colors ${isAutoSaveEnabled ? 'bg-emerald-500' : 'bg-white/20'}`}
              onClick={() => setIsAutoSaveEnabled(!isAutoSaveEnabled)}>

              <div className={`w-3 h-3 bg-white rounded-full transition-transform ${isAutoSaveEnabled ? 'translate-x-4' : 'translate-x-0'}`} />
            </div>
          </div>

          <div className="flex items-center gap-2 border-l border-white/20 pl-4">
            <div className="flex flex-col items-end">
              <span className="text-[10px] font-bold leading-tight">{user?.email?.split('@')[0]}</span>
              <span className="text-[8px] opacity-60 leading-tight">Expert PROQUELEC</span>
            </div>
            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center overflow-hidden border border-white/40">
              <img src={`https://ui-avatars.com/api/?name=${user?.email}&background=random`} alt="User" className="w-full h-full object-cover" loading="lazy" />
            </div>
          </div>
        </div>
      </div>

      <DocumentToolbar
        editor={editor}
        onSearchToggle={() => setIsSearchOpen(!isSearchOpen)}
        activeTab={activeTab}
        setActiveTab={setActiveTab} />


      {/* Main Application Container */}
      <div className="flex-1 overflow-hidden flex relative">
        <div className="page-container custom-scrollbar">
          {/* Floating Normative Header */}
          <div className="w-[210mm] flex justify-between items-center mb-4 px-2 translate-y-2 opacity-50">
            <div className="flex flex-col">
              <span className="text-[10px] font-black text-proqblue tracking-tighter italic">NS 01 001</span>
              <span className="text-[8px] font-bold text-slate-500 uppercase tracking-widest">{headerText}</span>
            </div>
            <div className="text-right flex flex-col items-end">
              <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Document Certifié</span>
              <span className="text-[10px] font-medium text-slate-300">#PQ-{documentId?.slice(0, 8)}</span>
            </div>
          </div>

          <div className="a4-page">
            <EditorContent editor={editor} />
          </div>

          <div className="w-[210mm] text-[9px] text-slate-400 flex justify-between uppercase mt-[-10px] mb-20 px-2 font-medium opacity-40">
            <span>© {new Date().getFullYear()} PROQUELEC - SÉNÉGAL</span>
            <span>{footerText}</span>
          </div>
        </div>

        {/* Sidekick */}
        <AnimatePresence>
          {isSidekickOpen &&
            <motion.div
              initial={{ x: 300 }}
              animate={{ x: 0 }}
              exit={{ x: 300 }}
              className="w-80 bg-white border-l z-30 flex flex-col">

              <div className="p-4 border-b flex justify-between items-center bg-slate-50">
                <span className="text-xs font-bold text-proqblue uppercase tracking-tighter flex items-center gap-2"><Cpu className="w-4 h-4" /> Expert Sidekick</span>
                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setIsSidekickOpen(false)}><X className="w-4 h-4" /></Button>
              </div>
              <div className="flex border-b text-[10px] font-bold">
                {['guide', 'ai', 'docs', 'lab'].map((tab) =>
                  <button
                    key={tab}
                    onClick={() => setActiveSidekickTab(tab as unknown)}
                    className={`flex-1 py-3 uppercase border-b-2 ${activeSidekickTab === tab ? 'border-proqblue text-proqblue' : 'border-transparent text-slate-400'}`} aria-label="Action">

                    {tab}
                  </button>
                )}
              </div>
              <div className="flex-1 p-5 overflow-y-auto">
                {activeSidekickTab === 'ai' &&
                  <div className="space-y-4">
                    <div className="p-4 bg-proqblue/5 rounded-xl border border-proqblue/10 text-center">
                      <Sparkles className="w-8 h-8 text-proqblue mx-auto mb-2 animate-pulse" />
                      <p className="text-xs font-bold">IA Normative Prête</p>
                    </div>
                    <Button className="w-full bg-slate-900 text-[10px] font-bold py-6" onClick={generateTechnicalConclusion} disabled={isAIGenerating}>
                      {isAIGenerating ? <Loader2 className="animate-spin w-4 h-4 mr-2" /> : <Sparkles className="w-4 h-4 mr-2" />}
                      Générer Rapport Conformité
                    </Button>
                  </div>
                }
                {activeSidekickTab === 'guide' &&
                  <div className="space-y-4 text-xs text-slate-600">
                    <p className="font-bold text-slate-900 border-b pb-2">Outils Expert</p>
                    <div className="flex gap-3">
                      <Badge variant="outline">Tab</Badge>
                      <p>Utilisez les tableaux pour vos nomenclatures.</p>
                    </div>
                    <div className="flex gap-3">
                      <Badge variant="outline">Ctrl+F</Badge>
                      <p>Recherche rapide dans le texte technique.</p>
                    </div>
                  </div>
                }
              </div>
              <div className="p-4 bg-slate-50 border-t">
                <Badge className="w-full justify-center text-[8px] bg-slate-200 text-slate-500 border-none">Moteur Documentaire v2.5</Badge>
              </div>
            </motion.div>
          }
        </AnimatePresence>

        {!isSidekickOpen &&
          <Button
            onClick={() => setIsSidekickOpen(true)}
            className="absolute bottom-10 right-10 h-14 w-14 rounded-full bg-proqblue shadow-xl group">

            <HelpCircle className="w-6 h-6 text-white group-hover:rotate-12 transition-transform" />
          </Button>
        }
      </div>

      {/* Status Bar */}
      <div className="p-2 border-t bg-white text-[9px] text-slate-400 flex justify-between px-4">
        <div className="flex gap-4">
          <span>{editor.storage.characterCount.characters()} caractères</span>
          <span>{editor.storage.characterCount.words()} mots</span>
        </div>
        <div className="font-bold text-proqblue">NS 01 001 COMPLIANT</div>
      </div>
    </div>);

}