import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';

// Mock craftjs useNode to provide connectors used by the blocks
vi.mock('@craftjs/core', () => ({
  useNode: () => ({ connectors: { connect: (r: any) => r, drag: (r: any) => r } }),
}));

import {
  TextFieldBlock,
  EmailFieldBlock,
  TextareaFieldBlock,
  CheckboxFieldBlock,
  SelectFieldBlock
} from '../FormBuilderBlocks';

describe('FormBuilderBlocks (basic rendering)', () => {
  it('renders basic fields with labels and inputs', () => {
    render(
      <div>
        <TextFieldBlock label="MonTexte" name="t1" />
        <EmailFieldBlock label="MonEmail" name="e1" />
        <TextareaFieldBlock label="MonMessage" name="m1" />
        <CheckboxFieldBlock label="J\'accepte" name="c1" />
        <SelectFieldBlock label="Choisir" name="s1" options={["A","B"]} />
      </div>
    );

    // Labels -> inputs (use regex to tolerate extra chars like required asterisk)
    expect(screen.getByLabelText(/MonTexte/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/MonEmail/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/MonMessage/i)).toBeInTheDocument();
    expect(screen.getByRole('checkbox')).toBeInTheDocument();
    expect(screen.getByLabelText(/Choisir/i)).toBeInTheDocument();
  });
});
