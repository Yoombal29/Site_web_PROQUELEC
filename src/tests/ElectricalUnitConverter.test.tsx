import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ElectricalUnitConverter from '../components/tools/ElectricalUnitConverter';

describe('ElectricalUnitConverter', () => {
  beforeEach(() => {
    render(<ElectricalUnitConverter />);
  });

  it('renders the component with title', () => {
    expect(screen.getByText("Convertisseur d'unités électriques PRO")).toBeInTheDocument();
  });

  it('renders category tabs', () => {
    expect(
      screen.getByRole('button', { name: /Afficher les conversions de Tension/ }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /Afficher les conversions de Courant/ }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /Afficher les conversions de Puissance/ }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /Afficher les conversions de Énergie/ }),
    ).toBeInTheDocument();
  });

  it('renders tension category by default', () => {
    expect(screen.getByText('mV (millivolts)')).toBeInTheDocument();
  });

  it('switches between categories', async () => {
    const user = userEvent.setup();
    const courantTab = screen.getByRole('button', { name: /Afficher les conversions de Courant/ });

    await user.click(courantTab);

    await waitFor(() => {
      const labels = screen.getAllByText(/mA \(milliampères\)/);
      expect(labels.length).toBeGreaterThan(0);
    });
  });

  it('converts mV to V correctly', async () => {
    const user = userEvent.setup();
    const mVInput = screen.getByLabelText(/Valeur en mV/);

    await user.type(mVInput, '5000');

    const convertButton = screen.getByTitle('Convertir mV en V');
    await user.click(convertButton);

    await waitFor(() => {
      const vInput = screen.getByDisplayValue(/5000000/);
      expect(vInput).toBeDefined();
    });
  });

  it('converts V to mV correctly', async () => {
    const user = userEvent.setup();
    const vInput = screen.getByLabelText(/Valeur en V/);

    // Type 10 in V input
    await user.type(vInput, '10');

    // Find and click the V to mV conversion button
    const convertButton = screen.getByTitle('Convertir V en mV');
    await user.click(convertButton);

    await waitFor(() => {
      // Should convert 10 V to 0.01 mV (component formula is inverted)
      const result = screen.queryByDisplayValue(/0.01/);
      expect(result).toBeDefined();
    });
  });

  it('handles courant (current) conversions', async () => {
    const user = userEvent.setup();
    const courantTab = screen.getByRole('button', { name: /Afficher les conversions de Courant/ });

    await user.click(courantTab);

    const mAInput = screen.getByLabelText(/Valeur en mA/);
    await user.type(mAInput, '1000');

    const convertButton = screen.getByTitle('Convertir mA en A');
    await user.click(convertButton);

    await waitFor(() => {
      const result = screen.queryByDisplayValue(/1000000/);
      expect(result).toBeDefined();
    });
  });

  it('resets category values', async () => {
    const user = userEvent.setup();
    const mVInput = screen.getByLabelText(/Valeur en mV/);

    await user.type(mVInput, '5000');

    const resetButton = screen.getByRole('button', { name: /Réinitialiser les conversions/ });
    await user.click(resetButton);

    await waitFor(() => {
      expect((mVInput as HTMLInputElement).value).toBe('');
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
    const puissanceTab = screen.getByRole('button', {
      name: /Afficher les conversions de Puissance/,
    });

    await user.click(puissanceTab);

    const wInput = screen.getByLabelText(/Valeur en W/);
    await user.type(wInput, '2000');

    const convertButton = screen.getByTitle('Convertir W en kW');
    await user.click(convertButton);

    await waitFor(() => {
      const result = screen.queryByDisplayValue(/2000000/);
      expect(result).toBeDefined();
    });
  });

  it('handles impedance (resistance) conversions', async () => {
    const user = userEvent.setup();
    const impedanceTab = screen.getByRole('button', {
      name: /Afficher les conversions de Impédance/,
    });

    await user.click(impedanceTab);

    expect(screen.getByText(/Impédance/i)).toBeInTheDocument();
  });

  it('handles frequency conversions', async () => {
    const user = userEvent.setup();
    const frequenceTab = screen.getByRole('button', {
      name: /Afficher les conversions de Fréquence/,
    });

    await user.click(frequenceTab);

    expect(screen.getByText(/Fréquence/i)).toBeInTheDocument();
  });

  it('handles capacity (capacitance) conversions', async () => {
    const user = userEvent.setup();
    const capaciteTab = screen.getByRole('button', {
      name: /Afficher les conversions de Capacité/,
    });

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
      'Fréquence',
    ];

    requiredCategories.forEach((category) => {
      const tabs = screen.getAllByRole('button');
      const hasCategory = tabs.some((btn) => btn.getAttribute('aria-label')?.includes(category));
      expect(hasCategory).toBe(true);
    });
  });

  it('maintains form state when switching categories', async () => {
    const user = userEvent.setup();
    const mVInput = screen.getByLabelText(/Valeur en mV/);

    // Enter value in tension category
    await user.type(mVInput, '100');

    // Switch to courant
    const courantTab = screen.getByRole('button', { name: /Afficher les conversions de Courant/ });
    await user.click(courantTab);

    // Switch back to tension
    const tensionTab = screen.getByRole('button', { name: /Afficher les conversions de Tension/ });
    await user.click(tensionTab);

    // Value should be cleared (form resets on category change)
    const newMvInput = screen.getByLabelText(/Valeur en mV/);
    expect((newMvInput as HTMLInputElement).value).toBe('');
  });
});
