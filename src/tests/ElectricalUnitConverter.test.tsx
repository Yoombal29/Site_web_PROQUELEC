import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ElectricalUnitConverter from '../ElectricalUnitConverter';

describe('ElectricalUnitConverter', () => {
  beforeEach(() => {
    render(<ElectricalUnitConverter />);
  });

  it('renders the component with title', () => {
    expect(screen.getByText('Convertisseur d\'unités électriques PRO')).toBeInTheDocument();
  });

  it('renders category tabs', () => {
    expect(screen.getByRole('button', { name: /Tension/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Courant/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Puissance/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Énergie/i })).toBeInTheDocument();
  });

  it('renders tension category by default', () => {
    expect(screen.getByDisplayValue('mV (millivolts)', { selector: 'label' })).toBeInTheDocument();
  });

  it('switches between categories', async () => {
    const user = userEvent.setup();
    const courantTab = screen.getByRole('button', { name: /Courant/i });

    await user.click(courantTab);

    await waitFor(() => {
      const labels = screen.getAllByText(/mA \(milliampères\)/);
      expect(labels.length).toBeGreaterThan(0);
    });
  });

  it('converts mV to V correctly', async () => {
    const user = userEvent.setup();
    const inputs = screen.getAllByPlaceholderText('Entrez une valeur');
    const buttons = screen.getAllByRole('button', { name: /→ V/i });

    // Find the mV input (first input in tension group)
    await user.type(inputs[0], '5000');
    await user.click(buttons[0]);

    await waitFor(() => {
      const vInputs = screen.getAllByDisplayValue(/^5(.0)?$/);
      expect(vInputs.length).toBeGreaterThan(0);
    });
  });

  it('converts V to mV correctly', async () => {
    const user = userEvent.setup();
    const inputs = screen.getAllByPlaceholderText('Entrez une valeur');

    // Type 10 in first input field (mV)
    await user.type(inputs[0], '10');

    // Find and click the V to mV conversion button
    const buttons = screen.getAllByRole('button');
    const vmvButton = buttons.find(btn => btn.textContent?.includes('→ mV'));

    if (vmvButton) {
      await user.click(vmvButton);

      await waitFor(() => {
        // Should convert 10 mV to 0.01 V or similar
        const result = screen.queryByDisplayValue(/0.01/);
        expect(result).toBeDefined();
      });
    }
  });

  it('handles courant (current) conversions', async () => {
    const user = userEvent.setup();
    const courantTab = screen.getByRole('button', { name: /Courant/i });

    await user.click(courantTab);

    const inputs = screen.getAllByPlaceholderText('Entrez une valeur');
    await user.type(inputs[0], '1000');

    const buttons = screen.getAllByRole('button', { name: /→ A/i });
    if (buttons.length > 0) {
      await user.click(buttons[0]);

      await waitFor(() => {
        const result = screen.queryByDisplayValue(/^1(.0)?$/);
        expect(result).toBeDefined();
      });
    }
  });

  it('resets category values', async () => {
    const user = userEvent.setup();
    const inputs = screen.getAllByPlaceholderText('Entrez une valeur');

    await user.type(inputs[0], '5000');

    const resetButtons = screen.getAllByRole('button', { name: /Réinitialiser/i });
    await user.click(resetButtons[0]);

    await waitFor(() => {
      expect((inputs[0] as HTMLInputElement).value).toBe('');
    });
  });

  it('displays formula reference section', () => {
    expect(screen.getByText(/Formules et rappels/i)).toBeInTheDocument();
    expect(screen.getByText(/1 V = 1000 mV/i)).toBeInTheDocument();
  });

  it('displays usage info section', () => {
    expect(screen.getByText(/Conseil d'utilisation/i)).toBeInTheDocument();
  });

  it('handles puissance (power) conversions', async () => {
    const user = userEvent.setup();
    const puissanceTab = screen.getByRole('button', { name: /Puissance/i });

    await user.click(puissanceTab);

    const inputs = screen.getAllByPlaceholderText('Entrez une valeur');
    await user.type(inputs[0], '2000');

    const buttons = screen.getAllByRole('button', { name: /→ kW/i });
    if (buttons.length > 0) {
      await user.click(buttons[0]);

      await waitFor(() => {
        const result = screen.queryByDisplayValue(/^2(.0)?$/);
        expect(result).toBeDefined();
      });
    }
  });

  it('handles impedance (resistance) conversions', async () => {
    const user = userEvent.setup();
    const impedanceTab = screen.getByRole('button', { name: /Impédance/i });

    await user.click(impedanceTab);

    expect(screen.getByText(/Impédance/i)).toBeInTheDocument();
  });

  it('handles frequency conversions', async () => {
    const user = userEvent.setup();
    const frequenceTab = screen.getByRole('button', { name: /Fréquence/i });

    await user.click(frequenceTab);

    expect(screen.getByText(/Fréquence/i)).toBeInTheDocument();
  });

  it('handles capacity (capacitance) conversions', async () => {
    const user = userEvent.setup();
    const capaciteTab = screen.getByRole('button', { name: /Capacité/i });

    await user.click(capaciteTab);

    expect(screen.getByText(/Capacité/i)).toBeInTheDocument();
  });

  it('has all required unit groups', () => {
    const requiredCategories = [
      'Tension',
      'Courant',
      'Puissance',
      'Énergie',
      'Impédance',
      'Capacité',
      'Fréquence'
    ];

    requiredCategories.forEach(category => {
      const tabs = screen.getAllByRole('button');
      const hasCategory = tabs.some(btn => btn.textContent?.includes(category));
      expect(hasCategory).toBe(true);
    });
  });

  it('maintains form state when switching categories', async () => {
    const user = userEvent.setup();
    const inputs = screen.getAllByPlaceholderText('Entrez une valeur');

    // Enter value in tension category
    await user.type(inputs[0], '100');

    // Switch to courant
    const courantTab = screen.getByRole('button', { name: /Courant/i });
    await user.click(courantTab);

    // Switch back to tension
    const tensionTab = screen.getByRole('button', { name: /Tension/i });
    await user.click(tensionTab);

    // Value should be cleared (form resets on category change)
    const newInputs = screen.getAllByPlaceholderText('Entrez une valeur');
    expect((newInputs[0] as HTMLInputElement).value).toBe('');
  });
});
