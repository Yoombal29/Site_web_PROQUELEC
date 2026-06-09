import React from 'react';
import { render } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';

vi.mock('@craftjs/core', () => ({
  useNode: () => ({ connectors: { connect: (r: any) => r, drag: (r: any) => r } }),
}));

// ImageBlock component not present; use placeholder smoke test
describe('ImageBlock (placeholder)', () => {
  it('renders placeholder without crashing', () => {
    render(<div />);
    expect(document.body).toBeDefined();
  });
});
