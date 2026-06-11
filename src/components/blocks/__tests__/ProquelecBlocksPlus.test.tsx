import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';

vi.mock('@craftjs/core', () => ({
  useNode: (selector?: any) => {
    const node = { connectors: { connect: (r: any) => r, drag: (r: any) => r }, data: { props: {} }, events: { selected: false }, actions: { setProp: vi.fn() } };
    const result = typeof selector === 'function' ? selector(node) : node;
    return { ...node, ...result };
  },
}));

vi.mock('@/lib/dynamic-data/resolver', () => ({
  resolveDynamicContent: (value: any) => value,
}));

vi.mock('../god-builder/InlineTextEditor', () => ({
  InlineTextEditor: ({ value }: any) => <span>{value}</span>,
}));

vi.mock('./ProquelecBlocks', () => ({
  SettingsLabel: ({ label }: any) => <label>{label}</label>,
  SettingsInput: (props: any) => <input {...props} />, 
  SettingsTextarea: (props: any) => <textarea {...props} />, 
  SettingsSelect: (props: any) => <select {...props} />, 
  SettingsColor: (props: any) => <input {...props} type="color" />, 
  SettingsRow: ({ children }: any) => <div>{children}</div>,
}));

import { HeadingBlock, ListBlock } from '../ProquelecBlocksPlus';

describe('ProquelecBlocksPlus', () => {
  it('renders HeadingBlock without crashing', () => {
    render(<HeadingBlock text="Titre test" level="h3" />);
    expect(screen.getByText('Titre test')).toBeInTheDocument();
  });

  it('renders ListBlock without crashing', () => {
    render(<ListBlock items={['A', 'B']} />);
    expect(screen.getByText('A')).toBeInTheDocument();
    expect(screen.getByText('B')).toBeInTheDocument();
  });
});
