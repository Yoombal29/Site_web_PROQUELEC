import React, { useState } from 'react';
import { useNode, Element } from '@craftjs/core';
import { getUniversalStyles } from './ProquelecBlocks';

// ── OffCanvasPanelBlock ──
export const OffCanvasPanelBlock = (props: any) => {
  const { children, position = 'right', width = 320, bgColor = '#ffffff', overlayColor = 'rgba(0,0,0,0.4)', closeOnOverlay = true, visible: controlledVisible } = props;
  const { connectors: { connect, drag } } = useNode();
  const u = getUniversalStyles(props);
  const [internalVisible, setInternalVisible] = useState(false);
  const isVisible = controlledVisible !== undefined ? controlledVisible : internalVisible;
  const toggle = () => setInternalVisible(!internalVisible);

  const slideStyles: any = {
    right: { top: 0, right: 0, transform: isVisible ? 'translateX(0)' : 'translateX(100%)' },
    left: { top: 0, left: 0, transform: isVisible ? 'translateX(0)' : 'translateX(-100%)' },
    top: { top: 0, left: 0, right: 0, transform: isVisible ? 'translateY(0)' : 'translateY(-100%)' },
    bottom: { bottom: 0, left: 0, right: 0, transform: isVisible ? 'translateY(0)' : 'translateY(100%)' },
  };

  const sizeStyles: any = {
    right: { width, height: '100%' },
    left: { width, height: '100%' },
    top: { height: width, width: '100%' },
    bottom: { height: width, width: '100%' },
  };

  return (<div ref={(r: any) => { if (r) connect(drag(r)); }} style={{ position: 'relative', ...u.style }} className={'proquelec-builder-node ' + u.className}>
    <button onClick={toggle} style={{ padding: '8px 16px', background: '#2563eb', color: 'white', border: 'none', borderRadius: 6, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
      ☰ Ouvrir
    </button>
    {isVisible && <div onClick={closeOnOverlay ? toggle : undefined} style={{ position: 'fixed', inset: 0, background: overlayColor, zIndex: 9999 }} />}
    <div style={{ position: 'fixed', ...sizeStyles[position] || sizeStyles.right, ...slideStyles[position] || slideStyles.right, background: bgColor, boxShadow: '0 0 30px rgba(0,0,0,0.15)', zIndex: 10000, transition: 'transform 0.3s ease', overflowY: 'auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', borderBottom: '1px solid #e2e8f0' }}>
        <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">Panneau</span>
        <button onClick={toggle} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 16, color: '#94a3b8' }}>✕</button>
      </div>
      <div style={{ padding: 20 }}>
        {children || <div className="text-xs text-slate-400 italic text-center py-8">Déposez des blocs dans ce panneau</div>}
      </div>
    </div>
  </div>);
};
OffCanvasPanelBlock.craft = { displayName: 'Panneau Off-Canvas', props: { position: 'right', width: 320, bgColor: '#ffffff', overlayColor: 'rgba(0,0,0,0.4)', closeOnOverlay: true, visible: false }, related: { settings: () => null } };

// ── OffCanvasToggleBlock ──
export const OffCanvasToggleBlock = (props: any) => {
  const { text = '☰ Menu', bgColor = '#2563eb', textColor = '#ffffff', fullWidth = false, targetId = '' } = props;
  const { connectors: { connect, drag } } = useNode();
  const u = getUniversalStyles(props);
  const findAndToggle = () => {
    if (typeof document === 'undefined') return;
    const panels = document.querySelectorAll('[class*="proquelec-builder-node"]');
    panels.forEach((el) => {
      const btn = el.querySelector('button');
      if (btn && btn.textContent?.includes('☰ Ouvrir')) btn.click();
    });
  };
  return (<button ref={(r: any) => { if (r) connect(drag(r)); }} onClick={findAndToggle}
    style={{ background: bgColor, color: textColor, border: 'none', padding: '8px 16px', borderRadius: 6, fontSize: 13, fontWeight: 600, cursor: 'pointer', width: fullWidth ? '100%' : 'auto', transition: 'all 0.2s', ...u.style }}
    className={'proquelec-builder-node hover:opacity-90 active:scale-95 ' + u.className}>
    {text}
  </button>);
};
OffCanvasToggleBlock.craft = { displayName: 'Bouton Off-Canvas', props: { text: '☰ Menu', bgColor: '#2563eb', textColor: '#ffffff', fullWidth: false, targetId: '' }, related: { settings: () => null } };
