import React from 'react';
import { useEditor, EditorContent, BubbleMenu } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';
import Link from '@tiptap/extension-link';

const MenuBar = ({ editor }: any) => {
  if (!editor) return null;
  const btn = (active: boolean, onClick: () => void, label: string) => (
    <button
      onClick={onClick}
      style={{
        background: active ? '#2563eb' : 'transparent',
        color: active ? 'white' : '#cbd5e1',
        border: 'none', borderRadius: 4, padding: '2px 8px',
        cursor: 'pointer', fontSize: 12, fontWeight: 600
      }}
    >{label}</button>
  );
  return (
    <div style={{
      display: 'flex', gap: 4, padding: '4px 8px',
      background: '#1e293b', borderRadius: '8px 8px 0 0',
      flexWrap: 'wrap', borderBottom: '1px solid #334155'
    }}>
      {btn(editor.isActive('bold'), () => editor.chain().focus().toggleBold().run(), 'B')}
      {btn(editor.isActive('italic'), () => editor.chain().focus().toggleItalic().run(), 'I')}
      {btn(editor.isActive('underline'), () => editor.chain().focus().toggleUnderline().run(), 'U')}
      {btn(editor.isActive('strike'), () => editor.chain().focus().toggleStrike().run(), 'S')}
      <span style={{ width: 1, background: '#334155', margin: '0 4px' }} />
      {btn(editor.isActive('bulletList'), () => editor.chain().focus().toggleBulletList().run(), '•')}
      {btn(editor.isActive('orderedList'), () => editor.chain().focus().toggleOrderedList().run(), '1.')}
      <span style={{ width: 1, background: '#334155', margin: '0 4px' }} />
      {btn(editor.isActive({ textAlign: 'left' }), () => editor.chain().focus().setTextAlign('left').run(), '←')}
      {btn(editor.isActive({ textAlign: 'center' }), () => editor.chain().focus().setTextAlign('center').run(), '↔')}
      {btn(editor.isActive({ textAlign: 'right' }), () => editor.chain().focus().setTextAlign('right').run(), '→')}
      {btn(editor.isActive('link'), () => {
        const url = prompt('URL:');
        if (url) editor.chain().focus().setLink({ href: url }).run();
      }, '🔗')}
    </div>
  );
};

export default function RichTextEditorInner(props: any) {
  const { content, selected, onChange } = props;
  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      Link.configure({ openOnClick: false }),
    ],
    content: content || '<p>Texte enrichi…</p>',
    editable: selected,
    onUpdate: ({ editor }) => {
      if (onChange) onChange(editor.getHTML());
    },
  });

  return (
    <>
      {selected && <MenuBar editor={editor} />}
      <div style={{ padding: selected ? 12 : 0, background: selected ? '#0f172a' : 'transparent', borderRadius: selected ? '0 0 8px 8px' : 0 }}>
        <EditorContent editor={editor} />
      </div>
    </>
  );
}
