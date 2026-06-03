import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';

vi.mock('@craftjs/core', () => ({
  useNode: (selector?: any) => {
    const node = { connectors: { connect: (r: any) => r, drag: (r: any) => r }, data: { props: {} }, events: { selected: false }, actions: { setProp: vi.fn() } };
    return typeof selector === 'function' ? selector(node) : node;
  },
}));

vi.mock('../../stores/dynamic-data.store', () => ({
  useDynamicDataStore: (selector: any) => selector({ sources: [], fetchSource: vi.fn(), cache: {} }),
}));

vi.mock('../../stores/useBuilderStore', () => ({
  useBuilderStore: (selector: any) => selector({ pageData: { title: 'Page' } }),
}));

vi.mock('../../lib/dynamic-data/resolver', () => ({
  resolveDynamicContent: (expression: string) => expression,
}));

import { DynamicContextProvider, DynamicTextBlock } from '../DynamicDataBlocks';

describe('DynamicDataBlocks', () => {
  it('renders DynamicContextProvider without crashing', () => {
    render(
      <DynamicContextProvider>
        <div>Contenu enfant</div>
      </DynamicContextProvider>
    );

    expect(screen.getByText('Contenu enfant')).toBeInTheDocument();
  });

  it('renders DynamicTextBlock without crashing', () => {
    render(<DynamicTextBlock expression="{{ global.siteName }}" />);
    expect(screen.getByText('PROQUELEC Sénégal')).toBeInTheDocument();
  });
});
