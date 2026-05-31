import React, { useState, useEffect, useCallback } from 'react';
import { useNode, Element } from '@craftjs/core';
import { getUniversalStyles } from './universalStyles';
import { useDisplayConditions } from './useDisplayConditions';
import { ContainerBlock } from './ProquelecBlocks';
import { SettingsLabel, SettingsInput, SettingsSelect, SettingsColor, SettingsRow } from './ProquelecBlocks';

const Input = (p: any) => <SettingsInput {...p} />;
const Select = (p: any) => <SettingsSelect {...p} />;
const Row = (p: any) => <SettingsRow {...p} />;
const Label = (p: any) => <SettingsLabel {...p} />;
const Color = (p: any) => <SettingsColor {...p} />;

export const PopupBlock = (props: any) => {
  const { children, trigger = 'click', delay = 0, width = 480, overlayColor = 'rgba(0,0,0,0.5)', bgColor = '#ffffff', closeOnOverlay = true, enableOnMobile = false } = props;
  const { connectors: { connect, drag } } = useNode();
  const u = getUniversalStyles(props);
  const visible = useDisplayConditions(props);
  const [open, setOpen] = useState(false);

  const openPopup = useCallback(() => setOpen(true), []);
  const closePopup = useCallback(() => setOpen(false), []);

  useEffect(() => {
    if (trigger === 'pageLoad') {
      const t = setTimeout(openPopup, delay);
      return () => clearTimeout(t);
    }
    if (trigger === 'scroll') {
      const handler = () => {
        if (window.scrollY > delay) { openPopup(); }
      };
      window.addEventListener('scroll', handler, { once: true });
      return () => window.removeEventListener('scroll', handler);
    }
    if (trigger === 'exitIntent') {
      const handler = (e: MouseEvent) => {
        if (e.clientY <= 0) openPopup();
      };
      document.addEventListener('mouseleave', handler);
      return () => document.removeEventListener('mouseleave', handler);
    }
  }, [trigger, delay, openPopup]);

  useEffect(() => {
    if (!open) return;
    if (!enableOnMobile && window.innerWidth < 768) { setOpen(false); return; }
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, [open, enableOnMobile]);

  if (!visible) return null;

  return (
    <>
      <div ref={(r: any) => { if (r) connect(drag(r)); }} style={{ display: 'inline-block', ...u.style }} className={'proquelec-builder-node ' + u.className}>
        {trigger === 'click' && (
          <button onClick={openPopup} style={{ background: '#2563eb', color: 'white', border: 'none', padding: '8px 20px', borderRadius: 8, cursor: 'pointer', fontSize: 14, fontWeight: 600 }}>
            {props.buttonLabel || 'Ouvrir la popup'}
          </button>
        )}
      </div>
      {open && (
        <div
          onClick={closeOnOverlay ? closePopup : undefined}
          style={{
            position: 'fixed', inset: 0, background: overlayColor, zIndex: 99999,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            animation: 'fadeIn 0.2s ease'
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: bgColor, borderRadius: 12, width: Math.min(width, window.innerWidth - 32),
              maxHeight: '90vh', overflow: 'auto', position: 'relative',
              animation: 'scaleIn 0.25s ease'
            }}
          >
            <button
              onClick={closePopup}
              style={{ position: 'absolute', top: 12, right: 12, border: 'none', background: '#f1f5f9', width: 32, height: 32, borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, color: '#64748b', zIndex: 1 }}
            >✕</button>
            {children}
          </div>
        </div>
      )}
      <style>{`@keyframes fadeIn{from{opacity:0}to{opacity:1}}@keyframes scaleIn{from{transform:scale(0.9);opacity:0}to{transform:scale(1);opacity:1}}`}</style>
    </>
  );
};

const PopupSettings = () => {
  const { actions: { setProp }, trigger, delay, width, overlayColor, bgColor, closeOnOverlay, buttonLabel } = useNode((n: any) => ({ ...n.data.props }));
  return (<div className="space-y-3">
    <Row><Label label="Déclencheur" /><Select value={trigger} onChange={(e: any) => setProp((p: any) => p.trigger = e.target.value)} options={[
      { value: 'click', label: 'Clic sur bouton' },
      { value: 'pageLoad', label: 'Au chargement' },
      { value: 'scroll', label: 'Au scroll' },
      { value: 'exitIntent', label: 'À la sortie' }
    ]} /></Row>
    {trigger !== 'click' && <Row><Label label="Délai (ms)" /><Input type="number" value={delay} onChange={(e: any) => setProp((p: any) => p.delay = parseInt(e.target.value))} /></Row>}
    {trigger === 'click' && <Row><Label label="Texte bouton" /><Input value={buttonLabel} onChange={(e: any) => setProp((p: any) => p.buttonLabel = e.target.value)} placeholder="Ouvrir la popup" /></Row>}
    <Row><Label label="Largeur (px)" /><Input type="number" value={width} onChange={(e: any) => setProp((p: any) => p.width = parseInt(e.target.value))} /></Row>
    <Row><Label label="Fond popup" /><Color value={bgColor} onChange={(e: any) => setProp((p: any) => p.bgColor = e.target.value)} /></Row>
    <Row><Label label="Overlay" /><Color value={overlayColor} onChange={(e: any) => setProp((p: any) => p.overlayColor = e.target.value)} /></Row>
  </div>);
};

PopupBlock.craft = {
  displayName: 'Popup Builder',
  props: { trigger: 'click', delay: 0, width: 480, overlayColor: 'rgba(0,0,0,0.5)', bgColor: '#ffffff', closeOnOverlay: true, enableOnMobile: false, buttonLabel: 'Ouvrir la popup' },
  related: { settings: PopupSettings },
};
