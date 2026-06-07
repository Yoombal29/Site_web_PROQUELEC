import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import EarthResistanceChecker from '../components/tools/EarthResistanceChecker';

describe('EarthResistanceChecker', () => {
  beforeEach(() => {
    render(<EarthResistanceChecker />);
  });

  it('renders the component with title', () => {
    expect(screen.getByText('Vérificateur de conformité des prises de terre')).toBeInTheDocument();
  });

  it('renders all input fields', () => {
    expect(screen.getByLabelText(/Résistance de terre/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Sensibilité du différentiel/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Zone d'installation/i)).toBeInTheDocument();
  });

  it('renders buttons', () => {
    expect(screen.getByRole('button', { name: /Vérifier la conformité/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Réinitialiser/i })).toBeInTheDocument();
  });

  it('calculates compliant result for low resistance in dry zone', async () => {
    const user = userEvent.setup();
    const input = screen.getByPlaceholderText('Ex: 20');
    const button = screen.getByRole('button', { name: /Vérifier la conformité/i });

    await user.type(input, '10');
    await user.click(button);

    await waitFor(() => {
      expect(screen.getByText(/✅ Conforme/i)).toBeInTheDocument();
    });
  });

  it('calculates non-compliant result for high resistance', async () => {
    const user = userEvent.setup();
    const input = screen.getByPlaceholderText('Ex: 20');
    const diffSelect = screen.getByLabelText(/Sensibilité du différentiel/i);
    const zoneSelect = screen.getByLabelText(/Zone d'installation/i);
    const button = screen.getByRole('button', { name: /Vérifier la conformité/i });

    // Set wet zone (UL = 25V) and 500mA diff
    await user.selectOptions(zoneSelect, '25');
    await user.selectOptions(diffSelect, '500');

    // Uc = 100 Ω × 0.5 A = 50 V > 25 V → Non conforme
    await user.type(input, '100');
    await user.click(button);

    await waitFor(() => {
      expect(screen.getByText(/❌ Non conforme/i)).toBeInTheDocument();
    });
  });

  it('handles different differential sensitivities', async () => {
    const user = userEvent.setup();
    const resistanceInput = screen.getByPlaceholderText('Ex: 20');
    const diffSelect = screen.getByLabelText(/Sensibilité du différentiel/i);
    const button = screen.getByRole('button', { name: /Vérifier la conformité/i });

    await user.type(resistanceInput, '50');
    await user.selectOptions(diffSelect, '100');
    await user.click(button);

    await waitFor(() => {
      // 50 Ω × 0.1 A = 5 V ≤ 50 V → conforme
      expect(screen.getByText(/✅ Conforme/i)).toBeInTheDocument();
    });
  });

  it('shows error for invalid input', async () => {
    const user = userEvent.setup();
    const button = screen.getByRole('button', { name: /Vérifier la conformité/i });

    await user.click(button);

    await waitFor(() => {
      expect(screen.getByText(/Veuillez entrer une résistance/i)).toBeInTheDocument();
    });
  });

  it('resets form when reset button is clicked', async () => {
    const user = userEvent.setup();
    const input = screen.getByPlaceholderText('Ex: 20') as HTMLInputElement;
    const button = screen.getByRole('button', { name: /Vérifier la conformité/i });
    const resetButton = screen.getByRole('button', { name: /Réinitialiser/i });

    await user.type(input, '20');
    await user.click(button);

    await waitFor(() => {
      expect(screen.getByText(/✅ Conforme|❌ Non conforme/)).toBeInTheDocument();
    });

    await user.click(resetButton);

    await waitFor(() => {
      expect(input.value).toBe('');
    });
  });

  it('displays formula information', () => {
    expect(screen.getByText(/Formule de calcul/i)).toBeInTheDocument();
  });

  it('displays safety information', () => {
    expect(screen.getByText(/Informations importantes/i)).toBeInTheDocument();
    expect(screen.getByText(/obligatoire/i)).toBeInTheDocument();
  });

  it('handles different installation zones', async () => {
    const user = userEvent.setup();
    const resistanceInput = screen.getByPlaceholderText('Ex: 20');
    const diffSelect = screen.getByLabelText(/Sensibilité du différentiel/i);
    const zoneSelect = screen.getByLabelText(/Zone d'installation/i);
    const button = screen.getByRole('button', { name: /Vérifier la conformité/i });

    // Test dry zone (50V) with 500mA diff
    await user.selectOptions(zoneSelect, '50');
    await user.selectOptions(diffSelect, '500');
    // Uc = 200 Ω × 0.5 A = 100 V > 50 V → Non conforme
    await user.type(resistanceInput, '200');
    await user.click(button);

    await waitFor(() => {
      expect(screen.getByText(/❌ Non conforme/i)).toBeInTheDocument();
    });
  });
});
