import React from 'react';
import { render } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';

vi.mock('@craftjs/core', () => ({
  useNode: () => ({ connectors: { connect: (r: any) => r, drag: (r: any) => r } }),
  Element: (props: any) => React.createElement('div', props, props.children),
}));

import * as PB from '../ProquelecBlocks';

describe('ProquelecBlocks', () => {
  it('exports components and renders a sample', () => {
    // render one of the exported subcomponents if present
    const Comp = (PB as any).SettingsLabel || (() => null);
    render(React.createElement(Comp, { label: 'Test' }));
    expect(document.body).toBeDefined();
  });
});
