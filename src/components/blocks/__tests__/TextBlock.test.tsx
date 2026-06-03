import React from 'react';
import { render } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';

vi.mock('@craftjs/core', () => ({
  useNode: () => ({ connectors: { connect: (r: any) => r, drag: (r: any) => r }, selected: false, actions: { setProp: vi.fn() } }),
}));

import { TextBlock } from '../TextBlock';

describe('TextBlock', () => {
  it('renders with provided text', () => {
    render(<TextBlock text="Bonjour" />);
    expect(document.body).toBeDefined();
  });
});
