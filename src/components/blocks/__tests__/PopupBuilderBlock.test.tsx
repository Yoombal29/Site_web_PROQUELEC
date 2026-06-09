import React from 'react';
import { render } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';

vi.mock('@craftjs/core', () => ({
  useNode: () => ({ connectors: { connect: (r: any) => r, drag: (r: any) => r } }),
}));

import { PopupBlock } from '../PopupBuilderBlock';

describe('PopupBuilderBlock', () => {
  it('renders without crashing', () => {
    render(<PopupBlock />);
    expect(document.body).toBeDefined();
  });
});
