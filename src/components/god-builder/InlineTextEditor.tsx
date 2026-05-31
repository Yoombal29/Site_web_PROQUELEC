import React, { useState, useEffect, useRef, memo } from 'react';

interface InlineTextEditorProps {
  value: string;
  onChange: (newValue: string) => void;
  className?: string;
  style?: React.CSSProperties;
  tagName?: 'div' | 'span' | 'h1' | 'h2' | 'h3' | 'h4' | 'p';
  disabled?: boolean;
  onBlur?: () => void;
}

export const InlineTextEditor = memo(({
  value,
  onChange,
  className = '',
  style = {},
  tagName = 'div',
  disabled = false,
  onBlur,
}: InlineTextEditorProps) => {
  const [localValue, setLocalValue] = useState(value);
  const isCommittingRef = useRef(false);
  const elementRef = useRef<HTMLElement>(null);

  // Sync state if value prop changes externally (e.g. from inspector settings)
  useEffect(() => {
    if (elementRef.current && elementRef.current.innerText !== value) {
      setLocalValue(value);
      elementRef.current.innerText = value;
    }
  }, [value]);

  const commitValue = (newValue: string) => {
    if (isCommittingRef.current) return;
    isCommittingRef.current = true;
    try {
      if (newValue !== value) {
        onChange(newValue);
      }
    } finally {
      setTimeout(() => {
        isCommittingRef.current = false;
      }, 50);
    }
  };

  const handleBlur = (e: React.FocusEvent<HTMLElement>) => {
    if (disabled) return;
    commitValue(e.currentTarget.innerText);
    if (onBlur) onBlur();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLElement>) => {
    if (disabled) return;
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      e.currentTarget.blur();
    }
  };

  return React.createElement(tagName, {
    ref: elementRef,
    contentEditable: !disabled,
    suppressContentEditableWarning: true,
    onBlur: handleBlur,
    onKeyDown: handleKeyDown,
    className: `outline-none ${!disabled ? 'focus:ring-1 focus:ring-indigo-500/50 focus:bg-indigo-500/5' : ''} rounded px-1 transition-all ${className}`,
    style: { minWidth: '20px', ...style },
  }, value);
});

InlineTextEditor.displayName = 'InlineTextEditor';

