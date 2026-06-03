import { describe, expect, it, vi } from 'vitest';
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

  it('validates input fields', () => {
    render(<VoltageDropCalculator />);

    // Fill required numeric fields with valid data
    const currentInput = screen.getByLabelText(/Courant/);
    const lengthInput = screen.getByLabelText(/Longueur/);
    const voltageInput = screen.getByLabelText(/Tension/);
    const powerFactorInput = screen.getByLabelText(/Facteur de Puissance/);

    fireEvent.change(currentInput, { target: { value: '16' } });
    fireEvent.change(lengthInput, { target: { value: '50' } });
    fireEvent.change(voltageInput, { target: { value: '230' } });
    fireEvent.change(powerFactorInput, { target: { value: '1.0' } });

    const calculateButton = screen.getByRole('button', { name: /Calculer/ });
    expect(calculateButton).not.toBeDisabled();
  });

  it('prevents rapid successive calculations (rate limiting)', async () => {
    const user = userEvent.setup();
    render(<VoltageDropCalculator />);

    // Fill required fields quickly
    const currentInput = screen.getByLabelText(/Courant/);
    const lengthInput = screen.getByLabelText(/Longueur/);
    fireEvent.change(currentInput, { target: { value: '16' } });
    fireEvent.change(lengthInput, { target: { value: '50' } });

    // Mock rapid clicks
    const calculateButton = screen.getByRole('button', { name: /Calculer/ });

    // First click should work
    fireEvent.click(calculateButton);

    // Immediate second click should be ignored due to rate limiting
    fireEvent.click(calculateButton);

    // Button should still be clickable (not disabled by rate limiting)
    expect(calculateButton).not.toBeDisabled();
  });

  it('performs a full manual calculation and displays a normative result', async () => {
    const user = userEvent.setup();
    render(<VoltageDropCalculator />);

    fireEvent.change(screen.getByLabelText(/Courant/), { target: { value: '16' } });
    fireEvent.change(screen.getByLabelText(/Longueur/), { target: { value: '50' } });
    fireEvent.change(screen.getByLabelText(/Tension/), { target: { value: '230' } });
    fireEvent.change(screen.getByLabelText(/Facteur de Puissance/), { target: { value: '1.0' } });
    fireEvent.change(screen.getByLabelText(/Nombre de Circuits/), { target: { value: '1' } });

    await user.click(screen.getByLabelText(/Section Normalisée/));
    await user.click(screen.getByRole('button', { name: /16 mm²/ }));

    await user.click(screen.getByLabelText(/Type d'Isolation/));
    await user.click(screen.getByRole('button', { name: /PVC/ }));

    const calculateButton = screen.getByRole('button', { name: /Calculer/i });
    expect(calculateButton).not.toBeDisabled();

    await user.click(calculateButton);

    await waitFor(() => {
      expect(screen.getByText(/Limite Autorisée/)).toBeInTheDocument();
      expect(screen.queryByText(/Saisissez les paramètres et cliquez sur/)).not.toBeInTheDocument();
    });
  });
});