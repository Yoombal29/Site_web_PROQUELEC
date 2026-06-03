import React from 'react';
import { render } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';

vi.mock('@craftjs/core', () => ({
  useNode: () => ({ connectors: { connect: (r: any) => r, drag: (r: any) => r } }),
  Element: (props: any) => React.createElement('div', props, props.children),
}));

import { ContainerBlock } from '../ContainerBlock';

describe('ContainerBlock', () => {
  it('renders without crashing', () => {
    render(<ContainerBlock />);
    expect(document.body).toBeDefined();
  });
});
