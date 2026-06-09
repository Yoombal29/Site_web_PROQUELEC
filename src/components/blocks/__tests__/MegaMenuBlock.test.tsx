import React from 'react';
import { render } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';

vi.mock('@craftjs/core', () => ({
  useNode: () => ({ connectors: { connect: (r: any) => r, drag: (r: any) => r } }),
}));

import { MegaMenuContainerBlock } from '../MegaMenuBlock';

describe('MegaMenuBlock', () => {
  it('renders without crashing', () => {
    render(<MegaMenuContainerBlock />);
    expect(document.body).toBeDefined();
  });
});
