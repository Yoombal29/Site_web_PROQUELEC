import React, { useState, useEffect, lazy, Suspense } from 'react';
import { useNode } from '@craftjs/core';
import { getUniversalStyles } from './universalStyles';
import { useDisplayConditions } from './useDisplayConditions';
import { SettingsLabel, SettingsInput, SettingsColor, SettingsRow } from './ProquelecBlocks';

const Input = (p: any) => <SettingsInput {...p} />;
const Row = (p: any) => <SettingsRow {...p} />;
const Label = (p: any) => <SettingsLabel {...p} />;

const LazyRichTextInner = lazy(() => import('./RichTextEditorInner'));

export const RichTextBlock = (props: any) => {
  const { connectors: { connect, drag }, selected } = useNode((n: any) => ({ selected: n.events.selected }));
  const u = getUniversalStyles(props);
  const visible = useDisplayConditions(props);

  if (!visible) return null;

  return (
    <div
      ref={(r: any) => { if (r) connect(drag(r)); }}
      style={u.style}
      className={'proquelec-builder-node ' + u.className}
    >
      <Suspense fallback={<div className="text-xs text-slate-500 italic p-3 text-center">Chargement de l'éditeur...</div>}>
        <LazyRichTextInner {...props} selected={selected} />
      </Suspense>
    </div>
  );
};

const RichTextSettings = () => {
  const { actions: { setProp }, content } = useNode((n: any) => ({ ...n.data.props }));
  return (
    <div className="space-y-3">
      <Row><Label label="Contenu HTML" /><textarea
        rows={8} value={content || ''}
        onChange={(e: any) => setProp((p: any) => p.content = e.target.value)}
        style={{ width: '100%', background: '#151521', border: '1px solid #252538', color: '#e2e8f0', borderRadius: 6, padding: 8, fontSize: 12, fontFamily: 'monospace' }}
      /></Row>
    </div>
  );
};

RichTextBlock.craft = {
  displayName: 'Texte enrichi',
  props: { content: '<p>Texte enrichi…</p>' },
  related: { settings: RichTextSettings },
};
