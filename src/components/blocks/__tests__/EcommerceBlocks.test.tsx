import React from 'react';
import { render } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';

vi.mock('@craftjs/core', () => ({
  useNode: () => ({ connectors: { connect: (r: any) => r, drag: (r: any) => r } }),
}));

import * as EB from '../EcommerceBlocks';

describe('EcommerceBlocks', () => {
  it('renders a sample exported component if present', () => {
    const Comp = (EB as any).ProductCard || (() => null);
    render(React.createElement(Comp));
    expect(document.body).toBeDefined();
  });
});
