
import { useState, useRef } from "react";
import { Bold, Italic, Underline, List, ListOrdered, Link, Image, Sparkles, Wand2, SearchCode, Languages } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { aiMaster } from "@/lib/ai-master";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuPortal,
  DropdownMenuSubContent } from
"@/components/ui/dropdown-menu";

interface WysiwygEditorProps {
  content: string;
  onChange: (content: string) => void;
  placeholder?: string;
}

export function WysiwygEditor({ content, onChange, placeholder = "Commencez à écrire..." }: WysiwygEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleAIAction = async (task: 'text' | 'translation' | 'seo', prompt?: string, device?: 'mobile' | 'tablet' | 'desktop') => {
    setIsGenerating(true);
    try {
      const response = await aiMaster.process({
        task,
        content: content,
        prompt: prompt || "Compléter ce texte de manière professionnelle",
        device: device as unknown
      });

      if (response.success && response.data) {
        if (task === 'text') {
          // Appending or replacing is a choice, let's append for now or use the state
          const newContent = typeof response.data === 'string' ? response.data : JSON.stringify(response.data);
          onChange(content + "<br/><br/>" + newContent);
        } else if (task === 'translation') {
          onChange(response.data);
        } else if (task === 'seo') {
          alert("SEO Analysis: " + JSON.stringify(response.data.suggestions));
        }
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const execCommand = (command: string, value?: string) => {
    document.execCommand(command, false, value);
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  };

  const handleInput = () => {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  };

  const insertImage = () => {
    const url = prompt("URL de l'image:");
    if (url) {
      execCommand("insertImage", url);
    }
  };

  const insertLink = () => {
    const url = prompt("URL du lien:");
    if (url) {
      execCommand("createLink", url);
    }
  };

  return (
    <div className="border rounded-lg overflow-hidden">
      <div className="flex items-center gap-1 p-2 bg-muted/50 border-b">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => execCommand("bold")}>
          
          <Bold className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => execCommand("italic")}>
          
          <Italic className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => execCommand("underline")}>
          
          <Underline className="h-4 w-4" />
        </Button>

        <Separator orientation="vertical" className="mx-1 h-6" />

        <Button
          variant="ghost"
          size="sm"
          onClick={() => execCommand("insertUnorderedList")}>
          
          <List className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => execCommand("insertOrderedList")}>
          
          <ListOrdered className="h-4 w-4" />
        </Button>

        <Separator orientation="vertical" className="mx-1 h-6" />

        <Button
          variant="ghost"
          size="sm"
          onClick={insertLink}>
          
          <Link className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={insertImage}>
          
          <Image className="h-4 w-4" />
        </Button>

        <Separator orientation="vertical" className="mx-1 h-6" />

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className={`gap-2 ${isGenerating ? 'animate-pulse text-orange-500' : 'text-purple-500 hover:text-purple-600'}`}
              disabled={isGenerating}>
              
              <Sparkles className="h-4 w-4" />
              <span className="text-[10px] font-bold uppercase">AI Maître</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56 bg-slate-950 border-slate-800 text-slate-200">
            <DropdownMenuLabel className="text-[10px] uppercase text-slate-500">Assistant Rytr / WriteSonic</DropdownMenuLabel>
            <DropdownMenuItem onClick={() => handleAIAction('text', 'Compléter le paragraphe suivant')}>
              <Wand2 className="mr-2 h-4 w-4" />
              <span>Compléter le texte</span>
            </DropdownMenuItem>

            <DropdownMenuSub>
              <DropdownMenuSubTrigger>
                <Sparkles className="mr-2 h-4 w-4" />
                <span>Optimiser par Appareil</span>
              </DropdownMenuSubTrigger>
              <DropdownMenuPortal>
                <DropdownMenuSubContent className="bg-slate-950 border-slate-800 text-slate-200">
                  <DropdownMenuItem onClick={() => handleAIAction('text', 'Réécrire pour Mobile', 'mobile')}>
                    <span>Format Mobile (Concise)</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleAIAction('text', 'Réécrire pour Tablette', 'tablet')}>
                    <span>Format Tablette</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleAIAction('text', 'Réécrire pour Desktop', 'desktop')}>
                    <span>Format Desktop (Détaillé)</span>
                  </DropdownMenuItem>
                </DropdownMenuSubContent>
              </DropdownMenuPortal>
            </DropdownMenuSub>

            <DropdownMenuSeparator className="bg-slate-800" />
            <DropdownMenuLabel className="text-[10px] uppercase text-slate-500">Expertise DeepL & Semrush</DropdownMenuLabel>

            <DropdownMenuItem onClick={() => handleAIAction('translation')}>
              <Languages className="mr-2 h-4 w-4" />
              <span>Traduire (FR/EN)</span>
            </DropdownMenuItem>

            <DropdownMenuItem onClick={() => handleAIAction('seo')}>
              <SearchCode className="mr-2 h-4 w-4" />
              <span>Vérifier le SEO</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div
        ref={editorRef}
        contentEditable
        className="min-h-[200px] p-4 focus:outline-none whitespace-pre-wrap break-words" />
      

      {!content && !isEditing &&
      <div className="absolute top-16 left-4 text-muted-foreground pointer-events-none">
          {placeholder}
        </div>
      }
    </div>);

}