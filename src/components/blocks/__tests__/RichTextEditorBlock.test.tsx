import React from 'react';
import { render } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';

// Monaco is mocked globally in src/tests/setup.ts
vi.mock('@craftjs/core', () => ({
  useNode: () => ({ connectors: { connect: (r: any) => r, drag: (r: any) => r }, actions: { setProp: vi.fn() } }),
}));

import { RichTextBlock } from '../RichTextEditorBlock';

describe('RichTextEditorBlock', () => {
  it('renders without crashing', () => {
    render(<RichTextBlock />);
    expect(document.body).toBeDefined();
  });
});
