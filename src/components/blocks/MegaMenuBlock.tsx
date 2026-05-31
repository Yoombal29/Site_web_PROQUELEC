import React, { useState } from 'react';
import { useNode, Element } from '@craftjs/core';
import { getUniversalStyles } from './ProquelecBlocks';

// ── MenuItemBlock ──
export const MenuItemBlock = (props: any) => {
  const { text = 'Lien', href = '#', icon = '', children } = props;
  const { connectors: { connect, drag } } = useNode();
  const u = getUniversalStyles(props);
  const [hover, setHover] = useState(false);
  return (<div ref={(r: any) => { if (r) connect(drag(r)); }}
    onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
    style={{ position: 'relative', ...u.style }} className={'proquelec-builder-node ' + u.className}>
    <a href={href} style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '6px 12px', color: hover ? '#2563eb' : '#0f172a', fontSize: 13, fontWeight: 500, textDecoration: 'none', borderRadius: 6, transition: 'all 0.2s' }}
      className="hover:bg-slate-100">{icon && <span>{icon}</span>}{text}</a>
    {children && <div style={{ position: 'absolute', top: '100%', left: 0, minWidth: 200, background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 8, boxShadow: '0 4px 20px rgba(0,0,0,0.1)', padding: 8, display: hover ? 'block' : 'none', zIndex: 50 }}>
      <div className="text-[10px] text-slate-400 italic px-2 py-1">Déposez des blocs ici</div>
      {children}
    </div>}
  </div>);
};
MenuItemBlock.craft = { displayName: 'Lien Menu', props: { text: 'Lien', href: '#', icon: '' }, related: { settings: () => null } };

// ── NavMenuBlock ──
export const NavMenuBlock = (props: any) => {
  const { children, align = 'left', direction = 'horizontal', bgColor = '#ffffff', sticky = false, stickyTop = 0 } = props;
  const { connectors: { connect, drag } } = useNode();
  const u = getUniversalStyles(props);
  return (<nav ref={(r: any) => { if (r) connect(drag(r)); }}
    style={{ display: 'flex', flexDirection: direction === 'horizontal' ? 'row' : 'column', alignItems: align === 'center' ? 'center' : align === 'right' ? 'flex-end' : 'flex-start', background: bgColor, padding: '4px 16px', borderRadius: 8, gap: 2, position: sticky ? 'sticky' : 'relative', top: sticky ? stickyTop : 'auto', zIndex: sticky ? 100 : 'auto', boxShadow: sticky ? '0 2px 8px rgba(0,0,0,0.06)' : 'none', ...u.style }}
    className={'proquelec-builder-node ' + u.className}>
    {children || <div className="text-xs text-slate-400 italic px-4 py-2">Déposez des liens MenuItemBlock</div>}
  </nav>);
};
NavMenuBlock.craft = { displayName: 'Menu Navigation', props: { align: 'left', direction: 'horizontal', bgColor: '#ffffff', sticky: false, stickyTop: 0 }, related: { settings: () => null } };

// ── MegaMenuContainerBlock ──
export const MegaMenuContainerBlock = (props: any) => {
  const { children, columns = 3, bgColor = '#ffffff', width = '100%', showOnHover = true, parentSelector = '' } = props;
  const { connectors: { connect, drag } } = useNode();
  const u = getUniversalStyles(props);
  const [visible, setVisible] = useState(false);
  return (<div ref={(r: any) => { if (r) connect(drag(r)); }}
    onMouseEnter={() => showOnHover && setVisible(true)} onMouseLeave={() => setVisible(false)}
    style={{ position: 'relative', ...u.style }} className={'proquelec-builder-node ' + u.className}>
    <div className="text-xs text-slate-500 px-3 py-1.5 cursor-pointer flex items-center gap-1" onClick={() => setVisible(!visible)}>
      Mega Menu ▾
    </div>
    {visible && <div style={{ position: 'absolute', top: '100%', left: 0, width, background: bgColor, border: '1px solid #e2e8f0', borderRadius: 12, boxShadow: '0 8px 30px rgba(0,0,0,0.12)', padding: 24, zIndex: 100, display: 'grid', gridTemplateColumns: 'repeat(' + columns + ', 1fr)', gap: 16 }}>
      {children || <div className="text-xs text-slate-400 italic col-span-full text-center py-8">Déposez des colonnes ou blocs ici</div>}
    </div>}
  </div>);
};
MegaMenuContainerBlock.craft = { displayName: 'Mega Menu', props: { columns: 3, bgColor: '#ffffff', width: '100%', showOnHover: true, parentSelector: '' }, related: { settings: () => null } };
