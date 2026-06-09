import React, { useState } from 'react';
import { colors, generateColorCSSVars } from '@/design-system/tokens/colors';
import { resolveTokenValue } from '@/design-system/runtime-resolver';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

const scaleNames: Record<string, string> = {
  primary: 'Primaire',
  secondary: 'Secondaire',
  surface: 'Surface',
  accent: 'Accent',
  danger: 'Danger',
  warning: 'Avertissement',
  success: 'Succès',
  neutral: 'Neutre',
};

interface TokenColorPickerProps {
  label: string;
  value: string | undefined;
  onChange: (value: string) => void;
  allowHex?: boolean;
}

export const TokenColorPicker: React.FC<TokenColorPickerProps> = ({ label, value, onChange, allowHex = true }) => {
  const [mode, setMode] = useState<'token' | 'hex'>(value && value.match(/\.\d+$/) ? 'token' : 'hex');

  const resolvedColor = value ? resolveTokenValue(value) as string || value : '#000000';

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label className="text-xs">{label}</Label>
        {allowHex && (
          <button
            onClick={() => setMode(mode === 'token' ? 'hex' : 'token')}
            className="text-[10px] text-blue-600 hover:underline"
          >
            {mode === 'token' ? 'Hex' : 'Token'}
          </button>
        )}
      </div>

      {mode === 'hex' ? (
        <div className="flex items-center gap-2">
          <div
            className="w-8 h-8 rounded border shrink-0"
            style={{ backgroundColor: resolvedColor }}
          />
          <Input
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder="#000000"
            className="h-8 text-xs font-mono"
          />
        </div>
      ) : (
        <div className="space-y-1.5 max-h-48 overflow-y-auto">
          {Object.entries(scaleNames).map(([scale, scaleLabel]) => {
            const tokenColors = colors[scale as keyof typeof colors];
            if (!tokenColors) return null;
            return (
              <div key={scale}>
                <div className="text-[10px] text-slate-500 mb-0.5 font-medium">{scaleLabel}</div>
                <div className="flex gap-0.5">
                  {Object.entries(tokenColors).map(([shade, hex]) => {
                    const token = `${scale}.${shade}`;
                    const selected = value === token;
                    return (
                      <button
                        key={shade}
                        title={`${token} (${hex})`}
                        onClick={() => onChange(token)}
                        className={`w-5 h-5 rounded-sm border cursor-pointer transition-all hover:scale-110 ${
                          selected ? 'ring-2 ring-blue-500 ring-offset-1 scale-110' : 'border-slate-200'
                        }`}
                        style={{ backgroundColor: hex }}
                      />
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
