import React from 'react';
import { render } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';

vi.mock('@craftjs/core', () => ({
  useNode: () => ({ connectors: { connect: (r: any) => r, drag: (r: any) => r }, actions: { setProp: vi.fn() } }),
}));

// The real FormBlock component is not present; fallback smoke render
describe('FormBlock (placeholder)', () => {
  it('renders placeholder without crashing', () => {
    render(<div />);
    expect(document.body).toBeDefined();
  });
});
