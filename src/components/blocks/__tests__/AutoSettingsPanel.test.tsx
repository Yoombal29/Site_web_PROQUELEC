import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';

vi.mock('@craftjs/core', () => ({
  useNode: (selector?: any) => {
    const node = { data: { props: { title: 'Test', bgColor: '#ffffff', enabled: true } }, actions: { setProp: vi.fn() } };
    const result = typeof selector === 'function' ? selector(node) : node;
    return { ...node, ...result };
  },
}));

vi.mock('./ProquelecBlocks', () => ({
  SettingsLabel: ({ label }: any) => <label>{label}</label>,
  SettingsInput: (props: any) => <input {...props} />, 
  SettingsColor: (props: any) => <input {...props} type="color" />,
  SettingsRow: ({ children }: any) => <div>{children}</div>,
}));

import { AutoSettingsPanel } from '../AutoSettingsPanel';

describe('AutoSettingsPanel', () => {
  it('renders settings rows for available props', () => {
    render(<AutoSettingsPanel />);
    expect(screen.getByText('Title')).toBeInTheDocument();
    expect(screen.getByText('Bg Color')).toBeInTheDocument();
    expect(screen.getByText('Enabled')).toBeInTheDocument();
  });
});
