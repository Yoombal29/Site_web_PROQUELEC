import React, { useEffect, useState } from 'react';
import { useNode } from '@craftjs/core';

interface TextBlockProps {
  text: string;
  fontSize?: number;
  textAlign?: 'left' | 'center' | 'right' | 'justify';
  color?: string;
}

export const TextBlock = ({ text, fontSize = 16, textAlign = 'left', color = '#0f172a' }: TextBlockProps) => {
  const { connectors: { connect, drag }, selected, actions: { setProp } } = useNode((node) => ({
    selected: node.events.selected,
  }));

  const [editable, setEditable] = useState(false);

  useEffect(() => {
    if (selected) return;
    setEditable(false);
  }, [selected]);

  return (
    <div
      ref={(ref) => { if (ref) connect(drag(ref)); }}
      onClick={() => selected && setEditable(true)}
      style={{ fontSize: `${fontSize}px`, textAlign, color }}
      className={`w-full outline-none ${editable ? 'ring-2 ring-blue-500' : ''}`}
    >
      <div
        contentEditable={editable}
        suppressContentEditableWarning={true}
        onBlur={(e) => {
          setEditable(false);
          setProp((props: any) => props.text = e.currentTarget.innerText);
        }}
      >
        {text}
      </div>
    </div>
  );
};

const TextSettings = () => {
  const { actions: { setProp }, fontSize, textAlign, color } = useNode((node) => ({
    fontSize: node.data.props.fontSize,
    textAlign: node.data.props.textAlign,
    color: node.data.props.color,
  }));

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1">Taille (px)</label>
        <input
          type="range"
          min={10}
          max={72}
          value={fontSize || 16}
          onChange={(e) => setProp((props: any) => props.fontSize = parseInt(e.target.value, 10))}
          className="w-full"
        />
        <div className="text-right text-xs">{fontSize}px</div>
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Alignement</label>
        <div className="flex gap-2">
          {['left', 'center', 'right', 'justify'].map((align) => (
            <button
              key={align}
              onClick={() => setProp((props: any) => props.textAlign = align)}
              className={`px-2 py-1 border rounded text-xs capitalize ${textAlign === align ? 'bg-blue-100 border-blue-400' : 'bg-white'}`}
            >
              {align}
            </button>
          ))}
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Couleur</label>
        <input
          type="color"
          value={color || '#0f172a'}
          onChange={(e) => setProp((props: any) => props.color = e.target.value)}
          className="w-full"
        />
      </div>
    </div>
  );
};

TextBlock.craft = {
  displayName: 'Texte',
  props: {
    text: 'Tapez votre texte ici...',
    fontSize: 16,
    textAlign: 'left',
    color: '#0f172a',
  },
  related: {
    settings: TextSettings,
  },
};
