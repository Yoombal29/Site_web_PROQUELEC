
import React from 'react';

interface BlogPostEditorProps {
  value: string;
  onChange: (value: string) => void;
}

export const BlogPostEditor: React.FC<BlogPostEditorProps> = ({ value, onChange }) => {
  return (
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full h-64 p-4 border border-gray-300 rounded-lg bg-white text-gray-900 resize-vertical"
      placeholder="Écrivez votre article ici..."
    />
  );
};
