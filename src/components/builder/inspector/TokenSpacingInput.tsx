import React from 'react';
import { spacing } from '@/design-system/tokens/spacing';
import { Label } from '@/components/ui/label';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';

type SpacingKey = keyof typeof spacing;

interface TokenSpacingInputProps {
  label: string;
  value: string | undefined;
  onChange: (value: string) => void;
  allowCustom?: boolean;
}

const spacingOptions: { label: string; value: string }[] = [
  { label: 'Aucun', value: 'none' },
  { label: 'XS (4px)', value: 'xs' },
  { label: 'SM (8px)', value: 'sm' },
  { label: 'MD (16px)', value: 'md' },
  { label: 'LG (24px)', value: 'lg' },
  { label: 'XL (32px)', value: 'xl' },
  { label: '2XL (48px)', value: '2xl' },
  { label: '3XL (64px)', value: '3xl' },
  { label: '4XL (96px)', value: '4xl' },
  { label: '5XL (128px)', value: '5xl' },
  { label: '6XL (192px)', value: '6xl' },
];

export const TokenSpacingInput: React.FC<TokenSpacingInputProps> = ({ label, value, onChange, allowCustom = true }) => {
  const isToken = value && (value in spacing);
  const [custom, setCustom] = React.useState(!isToken && value ? value : '');

  const handleSelectChange = (v: string) => {
    if (v === '__custom__') return;
    onChange(v);
    setCustom('');
  };

  const handleCustomChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value;
    setCustom(v);
    onChange(v);
  };

  return (
    <div className="space-y-1.5">
      <Label className="text-xs">{label}</Label>
      <div className="flex items-center gap-1">
        <Select
          value={isToken ? value as string : '__custom__'}
          onValueChange={handleSelectChange}
        >
          <SelectTrigger className="h-7 text-xs flex-1">
            <SelectValue placeholder="Choisir..." />
          </SelectTrigger>
          <SelectContent>
            {spacingOptions.map((opt) => (
              <SelectItem key={opt.value} value={opt.value} className="text-xs">
                {opt.label}
              </SelectItem>
            ))}
            {allowCustom && (
              <SelectItem value="__custom__" className="text-xs text-blue-600">
                Personnalisé...
              </SelectItem>
            )}
          </SelectContent>
        </Select>
        {!isToken && value && allowCustom && (
          <Input
            value={custom || value || ''}
            onChange={handleCustomChange}
            placeholder="24px"
            className="h-7 w-20 text-xs font-mono"
          />
        )}
      </div>
    </div>
  );
};
