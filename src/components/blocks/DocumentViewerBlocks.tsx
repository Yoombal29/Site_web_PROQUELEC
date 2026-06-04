/**
 * DocumentViewerBlocks.tsx
 * Blocs de visualisation de documents : PDF, Word, Excel
 * Utilisent Google Docs Viewer pour l'affichage direct
 */
import React from 'react';
import { useNode } from '@craftjs/core';
import { getUniversalStyles } from './universalStyles';
import {
  SettingsLabel, SettingsInput, SettingsRow, SettingsColor,
} from './ProquelecBlocks';
import { MediaPickerButton } from '@/components/admin/MediaLibrary';

// ── 1. PDF Viewer Block ──
export const PdfViewerBlock = (props: any) => {
  const { url = '', title = 'Document PDF', height = 600, backgroundColor = '#f8fafc' } = props;
  const { connectors: { connect, drag } } = useNode();
  const u = getUniversalStyles(props);
  const viewerUrl = url ? `https://docs.google.com/viewer?url=${encodeURIComponent(url)}&embedded=true` : '';

  return (
    <div ref={(r: any) => { if (r) connect(drag(r)); }}
      style={{ background: backgroundColor, borderRadius: 12, overflow: 'hidden', ...u.style }}
      className={'proquelec-builder-node ' + u.className}>
      {title && <h3 style={{ margin: 0, padding: '12px 16px', fontSize: 15, fontWeight: 600, borderBottom: '1px solid #e2e8f0' }}>{title}</h3>}
      {viewerUrl ? (
        <iframe src={viewerUrl} style={{ width: '100%', height, border: 'none' }} title={title} />
      ) : (
        <div style={{ height, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8', flexDirection: 'column', gap: 8 }}>
          <svg className="w-12 h-12 opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
          <p className="text-sm">Entrez l'URL d'un PDF pour l'afficher</p>
        </div>
      )}
    </div>
  );
};

const PdfViewerSettings = () => {
  const { actions: { setProp }, url, title, height, backgroundColor } = useNode((n: any) => ({ ...n.data.props }));
  return (
    <div className="space-y-3">
      <SettingsRow><SettingsLabel label="URL du PDF" /><SettingsInput value={url} onChange={(e: any) => setProp((p: any) => p.url = e.target.value)} /></SettingsRow>
      <SettingsRow><SettingsLabel label="Médiathèque" /><MediaPickerButton onSelect={(u: string) => setProp((p: any) => p.url = u)} label="Choisir un PDF" /></SettingsRow>
      <SettingsRow><SettingsLabel label="Titre" /><SettingsInput value={title} onChange={(e: any) => setProp((p: any) => p.title = e.target.value)} /></SettingsRow>
      <SettingsRow><SettingsLabel label="Hauteur (px)" /><SettingsInput type="number" value={height} onChange={(e: any) => setProp((p: any) => p.height = parseInt(e.target.value))} /></SettingsRow>
      <SettingsRow><SettingsLabel label="Fond" /><SettingsColor value={backgroundColor} onChange={(e: any) => setProp((p: any) => p.backgroundColor = e.target.value)} /></SettingsRow>
    </div>
  );
};

PdfViewerBlock.craft = { displayName: 'Visualiseur PDF', props: { url: '', title: 'Document PDF', height: 600, backgroundColor: '#f8fafc' }, related: { settings: PdfViewerSettings } };

// ── 2. Word Document Viewer Block ──
export const WordViewerBlock = (props: any) => {
  const { url = '', title = 'Document Word', height = 600, backgroundColor = '#f8fafc' } = props;
  const { connectors: { connect, drag } } = useNode();
  const u = getUniversalStyles(props);
  const viewerUrl = url ? `https://docs.google.com/viewer?url=${encodeURIComponent(url)}&embedded=true` : '';

  return (
    <div ref={(r: any) => { if (r) connect(drag(r)); }}
      style={{ background: backgroundColor, borderRadius: 12, overflow: 'hidden', ...u.style }}
      className={'proquelec-builder-node ' + u.className}>
      {title && <h3 style={{ margin: 0, padding: '12px 16px', fontSize: 15, fontWeight: 600, borderBottom: '1px solid #e2e8f0' }}>{title}</h3>}
      {viewerUrl ? (
        <iframe src={viewerUrl} style={{ width: '100%', height, border: 'none' }} title={title} />
      ) : (
        <div style={{ height, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8', flexDirection: 'column', gap: 8 }}>
          <svg className="w-12 h-12 opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
          <p className="text-sm">Entrez l'URL d'un document Word</p>
        </div>
      )}
    </div>
  );
};

const WordViewerSettings = () => {
  const { actions: { setProp }, url, title, height, backgroundColor } = useNode((n: any) => ({ ...n.data.props }));
  return (
    <div className="space-y-3">
      <SettingsRow><SettingsLabel label="URL du document" /><SettingsInput value={url} onChange={(e: any) => setProp((p: any) => p.url = e.target.value)} /></SettingsRow>
      <SettingsRow><SettingsLabel label="Médiathèque" /><MediaPickerButton onSelect={(u: string) => setProp((p: any) => p.url = u)} label="Choisir un document" /></SettingsRow>
      <SettingsRow><SettingsLabel label="Titre" /><SettingsInput value={title} onChange={(e: any) => setProp((p: any) => p.title = e.target.value)} /></SettingsRow>
      <SettingsRow><SettingsLabel label="Hauteur (px)" /><SettingsInput type="number" value={height} onChange={(e: any) => setProp((p: any) => p.height = parseInt(e.target.value))} /></SettingsRow>
      <SettingsRow><SettingsLabel label="Fond" /><SettingsColor value={backgroundColor} onChange={(e: any) => setProp((p: any) => p.backgroundColor = e.target.value)} /></SettingsRow>
    </div>
  );
};

WordViewerBlock.craft = { displayName: 'Visualiseur Word', props: { url: '', title: 'Document Word', height: 600, backgroundColor: '#f8fafc' }, related: { settings: WordViewerSettings } };

// ── 3. Excel Spreadsheet Viewer Block ──
export const ExcelViewerBlock = (props: any) => {
  const { url = '', title = 'Tableur Excel', height = 600, backgroundColor = '#f8fafc' } = props;
  const { connectors: { connect, drag } } = useNode();
  const u = getUniversalStyles(props);
  const viewerUrl = url ? `https://docs.google.com/viewer?url=${encodeURIComponent(url)}&embedded=true` : '';

  return (
    <div ref={(r: any) => { if (r) connect(drag(r)); }}
      style={{ background: backgroundColor, borderRadius: 12, overflow: 'hidden', ...u.style }}
      className={'proquelec-builder-node ' + u.className}>
      {title && <h3 style={{ margin: 0, padding: '12px 16px', fontSize: 15, fontWeight: 600, borderBottom: '1px solid #e2e8f0' }}>{title}</h3>}
      {viewerUrl ? (
        <iframe src={viewerUrl} style={{ width: '100%', height, border: 'none' }} title={title} />
      ) : (
        <div style={{ height, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8', flexDirection: 'column', gap: 8 }}>
          <svg className="w-12 h-12 opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
          <p className="text-sm">Entrez l'URL d'un fichier Excel</p>
        </div>
      )}
    </div>
  );
};

const ExcelViewerSettings = () => {
  const { actions: { setProp }, url, title, height, backgroundColor } = useNode((n: any) => ({ ...n.data.props }));
  return (
    <div className="space-y-3">
      <SettingsRow><SettingsLabel label="URL du fichier" /><SettingsInput value={url} onChange={(e: any) => setProp((p: any) => p.url = e.target.value)} /></SettingsRow>
      <SettingsRow><SettingsLabel label="Médiathèque" /><MediaPickerButton onSelect={(u: string) => setProp((p: any) => p.url = u)} label="Choisir un fichier" /></SettingsRow>
      <SettingsRow><SettingsLabel label="Titre" /><SettingsInput value={title} onChange={(e: any) => setProp((p: any) => p.title = e.target.value)} /></SettingsRow>
      <SettingsRow><SettingsLabel label="Hauteur (px)" /><SettingsInput type="number" value={height} onChange={(e: any) => setProp((p: any) => p.height = parseInt(e.target.value))} /></SettingsRow>
      <SettingsRow><SettingsLabel label="Fond" /><SettingsColor value={backgroundColor} onChange={(e: any) => setProp((p: any) => p.backgroundColor = e.target.value)} /></SettingsRow>
    </div>
  );
};

ExcelViewerBlock.craft = { displayName: 'Visualiseur Excel', props: { url: '', title: 'Tableur Excel', height: 600, backgroundColor: '#f8fafc' }, related: { settings: ExcelViewerSettings } };
