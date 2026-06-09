import React from 'react';
import { render } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';

vi.mock('@craftjs/core', () => ({
  useNode: () => ({ connectors: { connect: (r: any) => r, drag: (r: any) => r }, actions: { setProp: vi.fn() } }),
  Element: (props: any) => React.createElement('div', props, props.children),
}));

import { HeroBlock } from '../HeroBlock';

describe('HeroBlock', () => {
  it('renders without crashing', () => {
    render(<HeroBlock />);
    expect(document.body).toBeDefined();
  });
});
