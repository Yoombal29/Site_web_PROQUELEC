import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';

import * as ContentBlocks from '../ContentBlocks';

describe('ContentBlocks', () => {
  it('renders HeadingBlock and ButtonBlock without crashing', () => {
    render(
      <>
        <ContentBlocks.HeadingBlock text="Test titre" level="h3" />
        <ContentBlocks.ButtonBlock label="Action" url="#" />
      </>
    );

    expect(screen.getByText('Test titre')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Action' })).toBeInTheDocument();
  });
});
