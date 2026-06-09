import React from 'react';
import { render } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';

vi.mock('@craftjs/core', () => ({
  useNode: () => ({ connectors: { connect: (r: any) => r, drag: (r: any) => r } }),
}));

import RichTextEditorInner from '../RichTextEditorInner';

describe('RichTextEditorInner', () => {
  it('renders without crashing', () => {
    render(<RichTextEditorInner />);
    expect(document.body).toBeDefined();
  });
});
