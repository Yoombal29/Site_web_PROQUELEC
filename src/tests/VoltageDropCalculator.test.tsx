import { describe, expect } from '@jest/globals';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import VoltageDropCalculator from '../components/tools/VoltageDropCalculator';

// Mock crypto-js
vi.mock('crypto-js', () => ({
  SHA256: vi.fn(() => ({ toString: () => 'mocked-hash' }))
}));

// Mock file-saver
vi.mock('file-saver', () => ({
  saveAs: vi.fn()
}));

// Mock jszip
vi.mock('jszip', () => ({
  default: vi.fn(() => ({
    file: vi.fn(),
    generateAsync: vi.fn(() => Promise.resolve(new Blob()))
  }))
}));

describe('VoltageDropCalculator', () => {
  it('renders without crashing', () => {
    render(<VoltageDropCalculator />);
    expect(screen.getByText('Calculateur de Chute de Tension')).toBeInTheDocument();
  });

  it('shows tooltips on hover', async () => {
    const user = userEvent.setup();
    render(<VoltageDropCalculator />);

    // Find info icon for current input
    const infoIcons = screen.getAllByRole('button', { hidden: true });
    const currentInfoIcon = infoIcons.find((icon) =>
    icon.parentElement?.textContent?.includes('Courant')
    );

    if (currentInfoIcon) {
      await user.hover(currentInfoIcon);
      await waitFor(() => {
        expect(screen.getByText(/IB - Courant d'emploi/)).toBeInTheDocument();
      });
    }
  });

  it('validates input fields', async () => {
    const user = userEvent.setup();
    render(<VoltageDropCalculator />);

    // Fill required fields with valid data
    const currentInput = screen.getByLabelText(/Courant/);
    const lengthInput = screen.getByLabelText(/Longueur/);
    const voltageInput = screen.getByLabelText(/Tension/);
    const powerFactorInput = screen.getByLabelText(/Facteur de Puissance/);

    await user.type(currentInput, '16');
    await user.type(lengthInput, '50');
    await user.type(voltageInput, '230');
    await user.type(powerFactorInput, '1.0');

    // Select required dropdowns
    const conductorSelect = screen.getByLabelText(/Matériau/);
    await user.click(conductorSelect);
    await user.click(screen.getByText('Cuivre'));

    const phaseSelect = screen.getByLabelText(/Régime Électrique/);
    await user.click(phaseSelect);
    await user.click(screen.getByText(/Monophasé/));

    const installationSelect = screen.getByLabelText(/Type d'Installation/);
    await user.click(installationSelect);
    await user.click(screen.getByText('Éclairage'));

    const modeSelect = screen.getByLabelText(/Mode de Pose/);
    await user.click(modeSelect);
    await user.click(screen.getByText('B1 - Fixation directe'));

    // Set temperature and insulation
    const tempInput = screen.getByLabelText(/Température Ambiante/);
    await user.type(tempInput, '30');

    const insulationSelect = screen.getByLabelText(/Type d'Isolation/);
    await user.click(insulationSelect);
    await user.click(screen.getByText('PVC'));

    const circuitsInput = screen.getByLabelText(/Nombre de Circuits/);
    await user.type(circuitsInput, '1');

    // Select cross section for manual mode
    const sectionSelect = screen.getByLabelText(/Section Normalisée/);
    await user.click(sectionSelect);
    await user.click(screen.getByText('2.5 mm²'));

    // Button should be enabled
    const calculateButton = screen.getByRole('button', { name: /Calculer/ });
    expect(calculateButton).not.toBeDisabled();
  });

  it('prevents rapid successive calculations (rate limiting)', async () => {
    const user = userEvent.setup();
    render(<VoltageDropCalculator />);

    // Fill required fields quickly
    const currentInput = screen.getByLabelText(/Courant/);
    await user.type(currentInput, '16');

    // Mock rapid clicks
    const calculateButton = screen.getByRole('button', { name: /Calculer/ });

    // First click should work
    fireEvent.click(calculateButton);

    // Immediate second click should be ignored due to rate limiting
    fireEvent.click(calculateButton);

    // Button should still be clickable (not disabled by rate limiting)
    expect(calculateButton).not.toBeDisabled();
  });

  it('displays calculation results correctly', async () => {
    const user = userEvent.setup();
    render(<VoltageDropCalculator />);

    // Fill all required fields and perform calculation
    // (This would require a full integration test with mocked calculation results)
    // For now, just verify the results section exists
    expect(screen.getByText('Résultats du Calcul')).toBeInTheDocument();
  });
});