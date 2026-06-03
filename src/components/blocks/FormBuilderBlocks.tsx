/**
 * FormBuilderBlocks.tsx
 * Blocs de champs de formulaire pour le God Mode builder.
 * FormBuilderBlock agit comme un canvas acceptant des champs enfants.
 */
import React, { useState, useCallback, useMemo, useId } from 'react';
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

const toKebabCase = (key: string) => key.replace(/([A-Z])/g, '-$1').toLowerCase();
const styleObjectToCss = (style: React.CSSProperties) => Object.entries(style || {})
  .filter(([_, value]) => value !== undefined && value !== null)
  .map(([key, value]) => `${toKebabCase(key)}:${String(value)};`)
  .join(' ');

// ── FormBuilderBlock ──
export const FormBuilderBlock = (props: any) => {
  const { children, submitAction = 'database', successMessage = 'Message envoyé avec succès !', submitText = 'Envoyer', recipientEmail = '', redirectUrl = '', buttonBg = '#2563eb', buttonColor = '#ffffff', formName = 'form_' + Math.random().toString(36).substr(2, 6) } = props;
  const { connectors: { connect, drag } } = useNode();
  const u = getUniversalStyles(props);
  const visible = useDisplayConditions(props);
  const formStyleId = useId();
  const formRootClass = `builder-form-root-${formStyleId}`;
  const submitButtonClass = `builder-form-submit-${formStyleId}`;
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const formStyleCss = useMemo(() => styleObjectToCss(u.style), [u.style]);
  const submitButtonCss = useMemo(() => {
    const opacity = submitting ? 0.7 : 1;
    return `.${submitButtonClass}{background:${buttonBg};color:${buttonColor};opacity:${opacity};}`;
  }, [buttonBg, buttonColor, submitting, submitButtonClass]);
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
      <div ref={(r: any) => { if (r) connect(drag(r)); }} className={`proquelec-builder-node ${u.className} p-6 text-center`}>
        <div className="text-5xl mb-3">✅</div>
        <p className="text-base font-semibold text-slate-900">{resolveDynamicContent(successMessage)}</p>
        {redirectUrl && <p className="text-xs text-slate-500 mt-2">Redirection en cours...</p>}
      </div>
    );
  }

  return (
    <form
      ref={(r: any) => { if (r) connect(drag(r)); }}
      onSubmit={handleSubmit}
      className={`proquelec-builder-node space-y-4 ${u.className} ${formRootClass}`}
      noValidate
    >
      <style>{`.${formRootClass}{${formStyleCss}} ${submitButtonCss}`}</style>
      {children}
      {error && <p className="text-xs text-red-600 m-0">{error}</p>}
      <button
        type="submit"
        disabled={submitting}
        className={`w-full rounded-lg px-6 py-2 font-semibold text-sm transition-opacity disabled:opacity-70 disabled:cursor-not-allowed ${submitButtonClass}`}
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
      <Row><Label label="Texte bouton" /><Input aria-label="Texte bouton" placeholder="Texte bouton" value={submitText} onChange={(e: any) => setProp((p: any) => p.submitText = e.target.value)} /></Row>
      <Row><Label label="Action" /><Select aria-label="Action" value={submitAction} onChange={(e: any) => setProp((p: any) => p.submitAction = e.target.value)} options={[{ value: 'database', label: 'Base de données' }, { value: 'email', label: 'Email' }]} /></Row>
      {submitAction === 'email' && <Row><Label label="Email destinataire" /><Input aria-label="Email destinataire" placeholder="Email destinataire" value={recipientEmail} onChange={(e: any) => setProp((p: any) => p.recipientEmail = e.target.value)} /></Row>}
      <Row><Label label="Message succès" /><Input aria-label="Message succès" placeholder="Message succès" value={successMessage} onChange={(e: any) => setProp((p: any) => p.successMessage = e.target.value)} /></Row>
      <Row><Label label="URL redirection" /><Input aria-label="URL redirection" placeholder="URL redirection" value={redirectUrl} onChange={(e: any) => setProp((p: any) => p.redirectUrl = e.target.value)} /></Row>
      <Row><Label label="Couleur bouton" /><Color aria-label="Couleur bouton" value={buttonBg} onChange={(e: any) => setProp((p: any) => p.buttonBg = e.target.value)} /></Row>
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
  const id = `${name}-${useId()}`;
  return (
    <div ref={(r: any) => { if (r) connect(drag(r)); }} className="proquelec-builder-node mb-0">
      <label htmlFor={id} className="block text-xs font-semibold text-slate-900 mb-1">
        {label}{required && <span className="text-red-600 ml-0.5">*</span>}
      </label>
      <input
        id={id}
        type="text"
        name={name}
        placeholder={placeholder}
        required={required}
        className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm bg-white outline-none focus:border-indigo-500"
        readOnly
      />
    </div>
  );
};
const TextFieldSettings = () => {
  const { actions: { setProp }, label, placeholder, required, name } = useNode(n => ({ ...n.data.props }));
  return (<div className="space-y-3">
    <Row><Label label="Nom (identifiant)" /><Input aria-label="Nom (identifiant)" placeholder="Nom (identifiant)" value={name} onChange={(e: any) => setProp((p: any) => p.name = e.target.value)} /></Row>
    <Row><Label label="Étiquette" /><Input aria-label="Étiquette" placeholder="Étiquette" value={label} onChange={(e: any) => setProp((p: any) => p.label = e.target.value)} /></Row>
    <Row><Label label="Placeholder" /><Input aria-label="Placeholder" placeholder="Placeholder" value={placeholder} onChange={(e: any) => setProp((p: any) => p.placeholder = e.target.value)} /></Row>
    <Row><Label label="Requis" /><input aria-label="Requis" type="checkbox" checked={required} onChange={(e: any) => setProp((p: any) => p.required = e.target.checked)} /></Row>
  </div>);
};
TextFieldBlock.craft = { displayName: 'Champ Texte', props: { label: 'Texte', placeholder: 'Votre texte', required: false, name: 'text_' + Date.now() }, related: { settings: TextFieldSettings } };

// ── EmailFieldBlock ──
export const EmailFieldBlock = (props: any) => {
  const { label = 'Email', placeholder = 'votre@email.com', required = true, name = 'email' } = props;
  const { connectors: { connect, drag } } = useNode();
  const id = `${name}-${useId()}`;
  return (
    <div ref={(r: any) => { if (r) connect(drag(r)); }} className="proquelec-builder-node mb-0">
      <label htmlFor={id} className="block text-xs font-semibold text-slate-900 mb-1">
        {label}{required && <span className="text-red-600 ml-0.5">*</span>}
      </label>
      <input
        id={id}
        type="email"
        name={name}
        placeholder={placeholder}
        required={required}
        readOnly
        className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm bg-white outline-none focus:border-indigo-500"
      />
    </div>);
};
EmailFieldBlock.craft = { displayName: 'Champ Email', props: { label: 'Email', placeholder: 'votre@email.com', required: true, name: 'email' }, related: { settings: TextFieldSettings } };

// ── TextareaFieldBlock ──
export const TextareaFieldBlock = (props: any) => {
  const { label = 'Message', placeholder = 'Votre message…', required = false, name = 'message', rows = 4 } = props;
  const { connectors: { connect, drag } } = useNode();
  const id = `${name}-${useId()}`;
  return (
    <div ref={(r: any) => { if (r) connect(drag(r)); }} className="proquelec-builder-node mb-0">
      <label htmlFor={id} className="block text-xs font-semibold text-slate-900 mb-1">
        {label}{required && <span className="text-red-600 ml-0.5">*</span>}
      </label>
      <textarea
        id={id}
        name={name}
        placeholder={placeholder}
        required={required}
        rows={rows}
        readOnly
        className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm bg-white outline-none focus:border-indigo-500 resize-vertical font-inherit"
      />
    </div>);
};
const TextareaFieldSettings = () => {
  const { actions: { setProp }, label, placeholder, required, name, rows } = useNode(n => ({ ...n.data.props }));
  return (<div className="space-y-3">
    <Row><Label label="Nom" /><Input aria-label="Nom" placeholder="Nom" value={name} onChange={(e: any) => setProp((p: any) => p.name = e.target.value)} /></Row>
    <Row><Label label="Étiquette" /><Input aria-label="Étiquette" placeholder="Étiquette" value={label} onChange={(e: any) => setProp((p: any) => p.label = e.target.value)} /></Row>
    <Row><Label label="Placeholder" /><Input aria-label="Placeholder" placeholder="Placeholder" value={placeholder} onChange={(e: any) => setProp((p: any) => p.placeholder = e.target.value)} /></Row>
    <Row><Label label="Lignes" /><Input aria-label="Lignes" placeholder="Lignes" type="number" value={rows} onChange={(e: any) => setProp((p: any) => p.rows = parseInt(e.target.value))} /></Row>
    <Row><Label label="Requis" /><input aria-label="Requis" type="checkbox" checked={required} onChange={(e: any) => setProp((p: any) => p.required = e.target.checked)} /></Row>
  </div>);
};
TextareaFieldBlock.craft = { displayName: 'Zone de texte', props: { label: 'Message', placeholder: 'Votre message…', required: false, name: 'message', rows: 4 }, related: { settings: TextareaFieldSettings } };

// ── SelectFieldBlock ──
export const SelectFieldBlock = (props: any) => {
  const { label = 'Choisir', options = ['Option 1', 'Option 2', 'Option 3'], required = false, name = 'select' } = props;
  const { connectors: { connect, drag } } = useNode();
  const id = `${name}-${useId()}`;
  return (
    <div ref={(r: any) => { if (r) connect(drag(r)); }} className="proquelec-builder-node mb-0">
      <label htmlFor={id} className="block text-xs font-semibold text-slate-900 mb-1">
        {label}{required && <span className="text-red-600 ml-0.5">*</span>}
      </label>
      <select
        id={id}
        name={name}
        required={required}
        className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm bg-white outline-none focus:border-indigo-500"
      >
        {options.map((opt: string, i: number) => <option key={i} value={opt}>{opt}</option>)}
      </select>
    </div>);
};
const SelectFieldSettings = () => {
  const { actions: { setProp }, label, options, required, name } = useNode(n => ({ ...n.data.props }));
  return (<div className="space-y-3">
    <Row><Label label="Nom" /><Input aria-label="Nom" placeholder="Nom" value={name} onChange={(e: any) => setProp((p: any) => p.name = e.target.value)} /></Row>
    <Row><Label label="Étiquette" /><Input aria-label="Étiquette" placeholder="Étiquette" value={label} onChange={(e: any) => setProp((p: any) => p.label = e.target.value)} /></Row>
    <Row><Label label="Options (1 par ligne)" /><Textarea aria-label="Options (1 par ligne)" placeholder="Options (1 par ligne)" rows={4} value={options.join('\n')} onChange={(e: any) => setProp((p: any) => p.options = e.target.value.split('\n').filter((s: string) => s.trim()))} /></Row>
    <Row><Label label="Requis" /><input aria-label="Requis" type="checkbox" checked={required} onChange={(e: any) => setProp((p: any) => p.required = e.target.checked)} /></Row>
  </div>);
};
SelectFieldBlock.craft = { displayName: 'Liste déroulante', props: { label: 'Choisir', options: ['Option 1', 'Option 2', 'Option 3'], required: false, name: 'select' }, related: { settings: SelectFieldSettings } };

// ── CheckboxFieldBlock ──
export const CheckboxFieldBlock = (props: any) => {
  const { label = 'J\'accepte les conditions', required = false, name = 'accept' } = props;
  const { connectors: { connect, drag } } = useNode();
  const id = `${name}-${useId()}`;
  return (
    <div ref={(r: any) => { if (r) connect(drag(r)); }} className="proquelec-builder-node flex items-center gap-2">
      <input
        id={id}
        type="checkbox"
        name={name}
        required={required}
        readOnly
        className="w-4 h-4 cursor-pointer rounded border border-slate-300 text-indigo-600"
      />
      <label htmlFor={id} className="text-sm text-slate-900 cursor-pointer">
        {label}{required && <span className="text-red-600 ml-0.5">*</span>}
      </label>
    </div>);
};
CheckboxFieldBlock.craft = { displayName: 'Case à cocher', props: { label: 'J\'accepte les conditions', required: false, name: 'accept' }, related: { settings: TextFieldSettings } };

// ── RadioFieldBlock ──
export const RadioFieldBlock = (props: any) => {
  const { label = 'Choix', options = ['Choix 1', 'Choix 2'], required = false, name = 'radio' } = props;
  const { connectors: { connect, drag } } = useNode();
  const baseId = useId();
  return (
    <div ref={(r: any) => { if (r) connect(drag(r)); }} className="proquelec-builder-node">
      <p className="block text-xs font-semibold text-slate-900 mb-2">
        {label}{required && <span className="text-red-600 ml-0.5">*</span>}
      </p>
      <div className="flex flex-col gap-2">
        {options.map((opt: string, i: number) => {
          const optionId = `${name}-${baseId}-${i}`;
          return (
            <label key={i} htmlFor={optionId} className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
              <input
                id={optionId}
                type="radio"
                name={name}
                value={opt}
                required={required && i === 0}
                readOnly
                className="w-4 h-4 cursor-pointer rounded border border-slate-300 text-indigo-600"
              />
              {opt}
            </label>
          );
        })}
      </div>
    </div>);
};
RadioFieldBlock.craft = { displayName: 'Bouton radio', props: { label: 'Choix', options: ['Choix 1', 'Choix 2'], required: false, name: 'radio' }, related: { settings: SelectFieldSettings } };

// ── FileUploadFieldBlock ──
export const FileUploadFieldBlock = (props: any) => {
  const { label = 'Fichier', accept = '.pdf,.doc,.docx,.jpg,.png', required = false, name = 'file' } = props;
  const { connectors: { connect, drag } } = useNode();
  const id = `${name}-${useId()}`;
  return (
    <div ref={(r: any) => { if (r) connect(drag(r)); }} className="proquelec-builder-node mb-0">
      <label htmlFor={id} className="block text-xs font-semibold text-slate-900 mb-1">
        {label}{required && <span className="text-red-600 ml-0.5">*</span>}
      </label>
      <input
        id={id}
        type="file"
        name={name}
        accept={accept}
        required={required}
        className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm bg-white"
      />
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
    <Row><Label label="Nom" /><Input aria-label="Nom" placeholder="Nom" value={name} onChange={(e: any) => setProp((p: any) => p.name = e.target.value)} /></Row>
    <Row><Label label="Valeur" /><Input aria-label="Valeur" placeholder="Valeur" value={value} onChange={(e: any) => setProp((p: any) => p.value = e.target.value)} /></Row>
  </div>);
};
HiddenFieldBlock.craft = { displayName: 'Champ caché', props: { value: '', name: 'hidden' }, related: { settings: HiddenFieldSettings } };

// ── DateFieldBlock ──
export const DateFieldBlock = (props: any) => {
  const { label = 'Date', required = false, name = 'date' } = props;
  const { connectors: { connect, drag } } = useNode();
  const id = `${name}-${useId()}`;
  return (
    <div ref={(r: any) => { if (r) connect(drag(r)); }} className="proquelec-builder-node mb-0">
      <label htmlFor={id} className="block text-xs font-semibold text-slate-900 mb-1">
        {label}{required && <span className="text-red-600 ml-0.5">*</span>}
      </label>
      <input
        id={id}
        type="date"
        name={name}
        required={required}
        readOnly
        className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm bg-white outline-none focus:border-indigo-500"
      />
    </div>);
};
DateFieldBlock.craft = { displayName: 'Date', props: { label: 'Date', required: false, name: 'date' }, related: { settings: TextFieldSettings } };

// ── TelFieldBlock ──
export const TelFieldBlock = (props: any) => {
  const { label = 'Téléphone', placeholder = '06 12 34 56 78', required = false, name = 'tel' } = props;
  const { connectors: { connect, drag } } = useNode();
  const id = `${name}-${useId()}`;
  return (
    <div ref={(r: any) => { if (r) connect(drag(r)); }} className="proquelec-builder-node mb-0">
      <label htmlFor={id} className="block text-xs font-semibold text-slate-900 mb-1">
        {label}{required && <span className="text-red-600 ml-0.5">*</span>}
      </label>
      <input
        id={id}
        type="tel"
        name={name}
        placeholder={placeholder}
        required={required}
        readOnly
        className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm bg-white outline-none focus:border-indigo-500"
      />
    </div>);
};
TelFieldBlock.craft = { displayName: 'Téléphone', props: { label: 'Téléphone', placeholder: '06 12 34 56 78', required: false, name: 'tel' }, related: { settings: TextFieldSettings } };

// ── ColorFieldBlock ──
export const ColorFieldBlock = (props: any) => {
  const { label = 'Couleur', required = false, name = 'color' } = props;
  const { connectors: { connect, drag } } = useNode();
  const id = `${name}-${useId()}`;
  return (
    <div ref={(r: any) => { if (r) connect(drag(r)); }} className="proquelec-builder-node mb-0">
      <label htmlFor={id} className="block text-xs font-semibold text-slate-900 mb-1">
        {label}{required && <span className="text-red-600 ml-0.5">*</span>}
      </label>
      <input
        id={id}
        type="color"
        name={name}
        required={required}
        className="w-full h-10 rounded-lg border border-slate-300 p-1 bg-white cursor-pointer"
      />
    </div>);
};
ColorFieldBlock.craft = { displayName: 'Couleur', props: { label: 'Couleur', required: false, name: 'color' }, related: { settings: TextFieldSettings } };
