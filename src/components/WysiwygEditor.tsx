
import { useState, useRef } from "react";
import { Bold, Italic, Underline, List, ListOrdered, Link, Image, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

interface WysiwygEditorProps {
  content: string;
  onChange: (content: string) => void;
  placeholder?: string;
}

export function WysiwygEditor({ content, onChange, placeholder = "Commencez à écrire..." }: WysiwygEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const [isEditing, setIsEditing] = useState(false);

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
          onClick={() => execCommand("bold")}
        >
          <Bold className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => execCommand("italic")}
        >
          <Italic className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => execCommand("underline")}
        >
          <Underline className="h-4 w-4" />
        </Button>
        
        <Separator orientation="vertical" className="mx-1 h-6" />
        
        <Button
          variant="ghost"
          size="sm"
          onClick={() => execCommand("insertUnorderedList")}
        >
          <List className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => execCommand("insertOrderedList")}
        >
          <ListOrdered className="h-4 w-4" />
        </Button>
        
        <Separator orientation="vertical" className="mx-1 h-6" />
        
        <Button
          variant="ghost"
          size="sm"
          onClick={insertLink}
        >
          <Link className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={insertImage}
        >
          <Image className="h-4 w-4" />
        </Button>
      </div>
      
      <div
        ref={editorRef}
        contentEditable
        className="min-h-[200px] p-4 focus:outline-none"
        onInput={handleInput}
        onFocus={() => setIsEditing(true)}
        onBlur={() => setIsEditing(false)}
        dangerouslySetInnerHTML={{ __html: content }}
        style={{ 
          whiteSpace: 'pre-wrap',
          wordWrap: 'break-word'
        }}
      />
      
      {!content && !isEditing && (
        <div className="absolute top-16 left-4 text-muted-foreground pointer-events-none">
          {placeholder}
        </div>
      )}
    </div>
  );
}
