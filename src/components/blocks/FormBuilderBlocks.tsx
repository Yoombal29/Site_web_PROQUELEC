/**
 * FormBuilderBlocks.tsx
 * Blocs de champs de formulaire pour le God Mode builder.
 * FormBuilderBlock agit comme un canvas acceptant des champs enfants.
 */
import React, { useState, useCallback } from 'react';
import { useNode, Element } from '@craftjs/core';
import { getUniversalStyles } from './universalStyles';
import { resolveDynamicContent } from '@/lib/dynamic-data/resolver';
import { useDisplayConditions } from './useDisplayConditions';
import { ContainerBlock } from './ProquelecBlocks';
import { apiFetch } from '@/lib/api-client';
import { SettingsLabel, SettingsInput, SettingsTextarea, SettingsSelect, SettingsColor, SettingsRow } from './ProquelecBlocks';

const Input = (p: any) => <SettingsInput {...p} />;
const Textarea = (p: any) => <SettingsTextarea {...p} />;
const Select = (p: any) => <SettingsSelect {...p} />;
const Color = (p: any) => <SettingsColor {...p} />;
const Row = (p: any) => <SettingsRow {...p} />;
const Label = (p: any) => <SettingsLabel {...p} />;

// ── FormBuilderBlock ──
export const FormBuilderBlock = (props: any) => {
  const { children, submitAction = 'database', successMessage = 'Message envoyé avec succès !', submitText = 'Envoyer', recipientEmail = '', redirectUrl = '', buttonBg = '#2563eb', buttonColor = '#ffffff', formName = 'form_' + Math.random().toString(36).substr(2, 6) } = props;
  const { connectors: { connect, drag } } = useNode();
  const u = getUniversalStyles(props);
  const visible = useDisplayConditions(props);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  if (!visible) return null;

  const handleSubmit = useCallback(async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    const formData = new FormData(e.currentTarget);
    const data: Record<string, unknown> = {};
    formData.forEach((value, key) => { data[key] = value; });

    try {
      switch (submitAction) {
        case 'database':
          await apiFetch('/api/form-submissions', {
            method: 'POST',
            body: JSON.stringify({ form_name: formName, data, submitted_at: new Date().toISOString() })
          });
          break;
        case 'email':
          await apiFetch('/api/send-email', {
            method: 'POST',
            body: JSON.stringify({ to: recipientEmail, subject: 'Nouveau formulaire: ' + formName, data })
          });
          break;
        default: break;
      }
      setSubmitted(true);
    } catch (err: any) {
      setError(err.message || 'Erreur lors de l\'envoi');
    } finally {
      setSubmitting(false);
    }
  }, [submitAction, recipientEmail, formName]);

  if (submitted) {
    return (
      <div ref={(r: any) => { if (r) connect(drag(r)); }} style={{ padding: 24, textAlign: 'center', ...u.style }} className={'proquelec-builder-node ' + u.className}>
        <div style={{ fontSize: 48, marginBottom: 12 }}>✅</div>
        <p style={{ fontSize: 16, fontWeight: 600, color: '#0f172a' }}>{resolveDynamicContent(successMessage)}</p>
        {redirectUrl && <p style={{ fontSize: 13, color: '#64748b', marginTop: 8 }}>Redirection en cours...</p>}
      </div>
    );
  }

  return (
    <form
      ref={(r: any) => { if (r) connect(drag(r)); }}
      onSubmit={handleSubmit}
      style={{ ...u.style }}
      className={'proquelec-builder-node space-y-4 ' + u.className}
      noValidate
    >
      {children}
      {error && <p style={{ fontSize: 13, color: '#dc2626', margin: 0 }}>{error}</p>}
      <button
        type="submit"
        disabled={submitting}
        style={{
          background: buttonBg, color: buttonColor, border: 'none',
          padding: '10px 24px', borderRadius: 8, cursor: submitting ? 'not-allowed' : 'pointer',
          fontWeight: 600, fontSize: 14, width: '100%', opacity: submitting ? 0.7 : 1
        }}
      >
        {submitting ? 'Envoi en cours...' : submitText}
      </button>
    </form>
  );
};

const FormBuilderSettings = () => {
  const { actions: { setProp }, submitAction, successMessage, submitText, recipientEmail, redirectUrl, buttonBg, buttonColor } = useNode(n => ({ ...n.data.props }));
  return (
    <div className="space-y-3">
      <Row><Label label="Texte bouton" /><Input value={submitText} onChange={(e: any) => setProp((p: any) => p.submitText = e.target.value)} /></Row>
      <Row><Label label="Action" /><Select value={submitAction} onChange={(e: any) => setProp((p: any) => p.submitAction = e.target.value)} options={[{ value: 'database', label: 'Base de données' }, { value: 'email', label: 'Email' }]} /></Row>
      {submitAction === 'email' && <Row><Label label="Email destinataire" /><Input value={recipientEmail} onChange={(e: any) => setProp((p: any) => p.recipientEmail = e.target.value)} /></Row>}
      <Row><Label label="Message succès" /><Input value={successMessage} onChange={(e: any) => setProp((p: any) => p.successMessage = e.target.value)} /></Row>
      <Row><Label label="URL redirection" /><Input value={redirectUrl} onChange={(e: any) => setProp((p: any) => p.redirectUrl = e.target.value)} placeholder="Optionnel" /></Row>
      <Row><Label label="Couleur bouton" /><Color value={buttonBg} onChange={(e: any) => setProp((p: any) => p.buttonBg = e.target.value)} /></Row>
    </div>
  );
};

FormBuilderBlock.craft = {
  displayName: 'Formulaire Builder',
  props: {
    submitAction: 'database', successMessage: 'Message envoyé avec succès !',
    submitText: 'Envoyer', recipientEmail: '', redirectUrl: '',
    buttonBg: '#2563eb', buttonColor: '#ffffff',
    formName: 'form_' + Math.random().toString(36).substr(2, 6)
  },
  related: { settings: FormBuilderSettings }
};

// ── TextFieldBlock ──
export const TextFieldBlock = (props: any) => {
  const { label = 'Texte', placeholder = 'Votre texte', required = false, name = 'field_' + Math.random().toString(36).substr(2, 4) } = props;
  const { connectors: { connect, drag } } = useNode();
  return (
    <div ref={(r: any) => { if (r) connect(drag(r)); }} style={{ marginBottom: 0 }} className="proquelec-builder-node">
      <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#0f172a', marginBottom: 4 }}>
        {label}{required && <span style={{ color: '#dc2626', marginLeft: 2 }}>*</span>}
      </label>
      <input
        type="text" name={name} placeholder={placeholder} required={required}
        style={{ width: '100%', padding: '8px 12px', border: '1px solid #e2e8f0', borderRadius: 6, fontSize: 13, outline: 'none', background: 'white' }}
        readOnly
      />
    </div>
  );
};
const TextFieldSettings = () => {
  const { actions: { setProp }, label, placeholder, required, name } = useNode(n => ({ ...n.data.props }));
  return (<div className="space-y-3">
    <Row><Label label="Nom (identifiant)" /><Input value={name} onChange={(e: any) => setProp((p: any) => p.name = e.target.value)} /></Row>
    <Row><Label label="Étiquette" /><Input value={label} onChange={(e: any) => setProp((p: any) => p.label = e.target.value)} /></Row>
    <Row><Label label="Placeholder" /><Input value={placeholder} onChange={(e: any) => setProp((p: any) => p.placeholder = e.target.value)} /></Row>
    <Row><Label label="Requis" /><input type="checkbox" checked={required} onChange={(e: any) => setProp((p: any) => p.required = e.target.checked)} /></Row>
  </div>);
};
TextFieldBlock.craft = { displayName: 'Champ Texte', props: { label: 'Texte', placeholder: 'Votre texte', required: false, name: 'text_' + Date.now() }, related: { settings: TextFieldSettings } };

// ── EmailFieldBlock ──
export const EmailFieldBlock = (props: any) => {
  const { label = 'Email', placeholder = 'votre@email.com', required = true, name = 'email' } = props;
  const { connectors: { connect, drag } } = useNode();
  return (
    <div ref={(r: any) => { if (r) connect(drag(r)); }} className="proquelec-builder-node">
      <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#0f172a', marginBottom: 4 }}>
        {label}{required && <span style={{ color: '#dc2626', marginLeft: 2 }}>*</span>}
      </label>
      <input type="email" name={name} placeholder={placeholder} required={required} readOnly
        style={{ width: '100%', padding: '8px 12px', border: '1px solid #e2e8f0', borderRadius: 6, fontSize: 13, outline: 'none', background: 'white' }} />
    </div>);
};
EmailFieldBlock.craft = { displayName: 'Champ Email', props: { label: 'Email', placeholder: 'votre@email.com', required: true, name: 'email' }, related: { settings: TextFieldSettings } };

// ── TextareaFieldBlock ──
export const TextareaFieldBlock = (props: any) => {
  const { label = 'Message', placeholder = 'Votre message…', required = false, name = 'message', rows = 4 } = props;
  const { connectors: { connect, drag } } = useNode();
  return (
    <div ref={(r: any) => { if (r) connect(drag(r)); }} className="proquelec-builder-node">
      <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#0f172a', marginBottom: 4 }}>
        {label}{required && <span style={{ color: '#dc2626', marginLeft: 2 }}>*</span>}
      </label>
      <textarea name={name} placeholder={placeholder} required={required} rows={rows} readOnly
        style={{ width: '100%', padding: '8px 12px', border: '1px solid #e2e8f0', borderRadius: 6, fontSize: 13, outline: 'none', background: 'white', resize: 'vertical', fontFamily: 'inherit' }} />
    </div>);
};
const TextareaFieldSettings = () => {
  const { actions: { setProp }, label, placeholder, required, name, rows } = useNode(n => ({ ...n.data.props }));
  return (<div className="space-y-3">
    <Row><Label label="Nom" /><Input value={name} onChange={(e: any) => setProp((p: any) => p.name = e.target.value)} /></Row>
    <Row><Label label="Étiquette" /><Input value={label} onChange={(e: any) => setProp((p: any) => p.label = e.target.value)} /></Row>
    <Row><Label label="Placeholder" /><Input value={placeholder} onChange={(e: any) => setProp((p: any) => p.placeholder = e.target.value)} /></Row>
    <Row><Label label="Lignes" /><Input type="number" value={rows} onChange={(e: any) => setProp((p: any) => p.rows = parseInt(e.target.value))} /></Row>
    <Row><Label label="Requis" /><input type="checkbox" checked={required} onChange={(e: any) => setProp((p: any) => p.required = e.target.checked)} /></Row>
  </div>);
};
TextareaFieldBlock.craft = { displayName: 'Zone de texte', props: { label: 'Message', placeholder: 'Votre message…', required: false, name: 'message', rows: 4 }, related: { settings: TextareaFieldSettings } };

// ── SelectFieldBlock ──
export const SelectFieldBlock = (props: any) => {
  const { label = 'Choisir', options = ['Option 1', 'Option 2', 'Option 3'], required = false, name = 'select' } = props;
  const { connectors: { connect, drag } } = useNode();
  return (
    <div ref={(r: any) => { if (r) connect(drag(r)); }} className="proquelec-builder-node">
      <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#0f172a', marginBottom: 4 }}>
        {label}{required && <span style={{ color: '#dc2626', marginLeft: 2 }}>*</span>}
      </label>
      <select name={name} required={required}
        style={{ width: '100%', padding: '8px 12px', border: '1px solid #e2e8f0', borderRadius: 6, fontSize: 13, outline: 'none', background: 'white' }}>
        {options.map((opt: string, i: number) => <option key={i} value={opt}>{opt}</option>)}
      </select>
    </div>);
};
const SelectFieldSettings = () => {
  const { actions: { setProp }, label, options, required, name } = useNode(n => ({ ...n.data.props }));
  return (<div className="space-y-3">
    <Row><Label label="Nom" /><Input value={name} onChange={(e: any) => setProp((p: any) => p.name = e.target.value)} /></Row>
    <Row><Label label="Étiquette" /><Input value={label} onChange={(e: any) => setProp((p: any) => p.label = e.target.value)} /></Row>
    <Row><Label label="Options (1 par ligne)" /><Textarea rows={4} value={options.join('\n')} onChange={(e: any) => setProp((p: any) => p.options = e.target.value.split('\n').filter((s: string) => s.trim()))} /></Row>
    <Row><Label label="Requis" /><input type="checkbox" checked={required} onChange={(e: any) => setProp((p: any) => p.required = e.target.checked)} /></Row>
  </div>);
};
SelectFieldBlock.craft = { displayName: 'Liste déroulante', props: { label: 'Choisir', options: ['Option 1', 'Option 2', 'Option 3'], required: false, name: 'select' }, related: { settings: SelectFieldSettings } };

// ── CheckboxFieldBlock ──
export const CheckboxFieldBlock = (props: any) => {
  const { label = 'J\'accepte les conditions', required = false, name = 'accept' } = props;
  const { connectors: { connect, drag } } = useNode();
  return (
    <div ref={(r: any) => { if (r) connect(drag(r)); }} className="proquelec-builder-node flex items-center gap-2">
      <input type="checkbox" name={name} required={required} readOnly style={{ width: 16, height: 16, cursor: 'pointer' }} />
      <label style={{ fontSize: 13, color: '#0f172a', cursor: 'pointer' }}>
        {label}{required && <span style={{ color: '#dc2626', marginLeft: 2 }}>*</span>}
      </label>
    </div>);
};
CheckboxFieldBlock.craft = { displayName: 'Case à cocher', props: { label: 'J\'accepte les conditions', required: false, name: 'accept' }, related: { settings: TextFieldSettings } };

// ── RadioFieldBlock ──
export const RadioFieldBlock = (props: any) => {
  const { label = 'Choix', options = ['Choix 1', 'Choix 2'], required = false, name = 'radio' } = props;
  const { connectors: { connect, drag } } = useNode();
  return (
    <div ref={(r: any) => { if (r) connect(drag(r)); }} className="proquelec-builder-node">
      <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#0f172a', marginBottom: 6 }}>
        {label}{required && <span style={{ color: '#dc2626', marginLeft: 2 }}>*</span>}
      </label>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {options.map((opt: string, i: number) => (
          <label key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#334155', cursor: 'pointer' }}>
            <input type="radio" name={name} value={opt} required={required && i === 0} readOnly style={{ width: 16, height: 16, cursor: 'pointer' }} />
            {opt}
          </label>
        ))}
      </div>
    </div>);
};
RadioFieldBlock.craft = { displayName: 'Bouton radio', props: { label: 'Choix', options: ['Choix 1', 'Choix 2'], required: false, name: 'radio' }, related: { settings: SelectFieldSettings } };

// ── FileUploadFieldBlock ──
export const FileUploadFieldBlock = (props: any) => {
  const { label = 'Fichier', accept = '.pdf,.doc,.docx,.jpg,.png', required = false, name = 'file' } = props;
  const { connectors: { connect, drag } } = useNode();
  return (
    <div ref={(r: any) => { if (r) connect(drag(r)); }} className="proquelec-builder-node">
      <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#0f172a', marginBottom: 4 }}>
        {label}{required && <span style={{ color: '#dc2626', marginLeft: 2 }}>*</span>}
      </label>
      <input type="file" name={name} accept={accept} required={required}
        style={{ width: '100%', padding: '8px', border: '1px solid #e2e8f0', borderRadius: 6, fontSize: 13, background: 'white' }} />
    </div>);
};
FileUploadFieldBlock.craft = { displayName: 'Fichier', props: { label: 'Fichier', accept: '.pdf,.doc,.docx,.jpg,.png', required: false, name: 'file' }, related: { settings: TextFieldSettings } };

// ── HiddenFieldBlock ──
export const HiddenFieldBlock = (props: any) => {
  const { value = '', name = 'hidden' } = props;
  const { connectors: { connect, drag } } = useNode();
  return <input ref={(r: any) => { if (r) connect(drag(r)); }} type="hidden" name={name} value={value} className="proquelec-builder-node" />;
};
const HiddenFieldSettings = () => {
  const { actions: { setProp }, name, value } = useNode(n => ({ ...n.data.props }));
  return (<div className="space-y-3">
    <Row><Label label="Nom" /><Input value={name} onChange={(e: any) => setProp((p: any) => p.name = e.target.value)} /></Row>
    <Row><Label label="Valeur" /><Input value={value} onChange={(e: any) => setProp((p: any) => p.value = e.target.value)} /></Row>
  </div>);
};
HiddenFieldBlock.craft = { displayName: 'Champ caché', props: { value: '', name: 'hidden' }, related: { settings: HiddenFieldSettings } };

// ── DateFieldBlock ──
export const DateFieldBlock = (props: any) => {
  const { label = 'Date', required = false, name = 'date' } = props;
  const { connectors: { connect, drag } } = useNode();
  return (
    <div ref={(r: any) => { if (r) connect(drag(r)); }} className="proquelec-builder-node">
      <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#0f172a', marginBottom: 4 }}>
        {label}{required && <span style={{ color: '#dc2626', marginLeft: 2 }}>*</span>}
      </label>
      <input type="date" name={name} required={required} readOnly
        style={{ width: '100%', padding: '8px 12px', border: '1px solid #e2e8f0', borderRadius: 6, fontSize: 13, outline: 'none', background: 'white' }} />
    </div>);
};
DateFieldBlock.craft = { displayName: 'Date', props: { label: 'Date', required: false, name: 'date' }, related: { settings: TextFieldSettings } };

// ── TelFieldBlock ──
export const TelFieldBlock = (props: any) => {
  const { label = 'Téléphone', placeholder = '06 12 34 56 78', required = false, name = 'tel' } = props;
  const { connectors: { connect, drag } } = useNode();
  return (
    <div ref={(r: any) => { if (r) connect(drag(r)); }} className="proquelec-builder-node">
      <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#0f172a', marginBottom: 4 }}>
        {label}{required && <span style={{ color: '#dc2626', marginLeft: 2 }}>*</span>}
      </label>
      <input type="tel" name={name} placeholder={placeholder} required={required} readOnly
        style={{ width: '100%', padding: '8px 12px', border: '1px solid #e2e8f0', borderRadius: 6, fontSize: 13, outline: 'none', background: 'white' }} />
    </div>);
};
TelFieldBlock.craft = { displayName: 'Téléphone', props: { label: 'Téléphone', placeholder: '06 12 34 56 78', required: false, name: 'tel' }, related: { settings: TextFieldSettings } };

// ── ColorFieldBlock ──
export const ColorFieldBlock = (props: any) => {
  const { label = 'Couleur', required = false, name = 'color' } = props;
  const { connectors: { connect, drag } } = useNode();
  return (
    <div ref={(r: any) => { if (r) connect(drag(r)); }} className="proquelec-builder-node">
      <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#0f172a', marginBottom: 4 }}>
        {label}{required && <span style={{ color: '#dc2626', marginLeft: 2 }}>*</span>}
      </label>
      <input type="color" name={name} required={required}
        style={{ width: '100%', height: 40, padding: 2, border: '1px solid #e2e8f0', borderRadius: 6, cursor: 'pointer', background: 'white' }} />
    </div>);
};
ColorFieldBlock.craft = { displayName: 'Couleur', props: { label: 'Couleur', required: false, name: 'color' }, related: { settings: TextFieldSettings } };
