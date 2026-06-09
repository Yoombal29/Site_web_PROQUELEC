import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import LightingCalculator from '../components/tools/LightingCalculator';

describe('LightingCalculator', () => {
  beforeEach(() => {
    render(<LightingCalculator />);
  });

  it('renders the component with title', () => {
    expect(screen.getByText("Calculateur d'éclairage (Lux / m²)")).toBeInTheDocument();
  });

  it('renders all input fields', () => {
    expect(screen.getByPlaceholderText('Ex: 30')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Ex: 3000')).toBeInTheDocument();
  });

  it('renders buttons', () => {
    expect(
      screen.getByRole('button', { name: /Calculer l'éclairement en lux/ }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /Réinitialiser le calculateur/ }),
    ).toBeInTheDocument();
  });

  it('calculates lux correctly for standard case', async () => {
    const user = userEvent.setup();
    const areaInput = screen.getByPlaceholderText('Ex: 30');
    const lumensInput = screen.getByPlaceholderText('Ex: 3000');
    const button = screen.getByRole('button', { name: /Calculer l'éclairement en lux/ });

    await user.type(areaInput, '30');
    await user.type(lumensInput, '3000');
    await user.click(button);

    await waitFor(() => {
      // 3000 / 30 = 100 lux
      expect(screen.getByText('100')).toBeInTheDocument();
      expect(screen.getByText('lux')).toBeInTheDocument();
    });
  });

  it('shows "good" adequacy for moderate lux levels', async () => {
    const user = userEvent.setup();
    const areaInput = screen.getByPlaceholderText('Ex: 30');
    const lumensInput = screen.getByPlaceholderText('Ex: 3000');
    const button = screen.getByRole('button', { name: /Calculer l'éclairement en lux/ });

    await user.type(areaInput, '20');
    await user.type(lumensInput, '5000');
    await user.click(button);

    await waitFor(() => {
      expect(screen.getByText(/Bon/)).toBeInTheDocument();
    });
  });

  it('shows "excellent" adequacy for high lux levels', async () => {
    const user = userEvent.setup();
    const areaInput = screen.getByPlaceholderText('Ex: 30');
    const lumensInput = screen.getByPlaceholderText('Ex: 3000');
    const button = screen.getByRole('button', { name: /Calculer l'éclairement en lux/ });

    await user.type(areaInput, '10');
    await user.type(lumensInput, '6000');
    await user.click(button);

    await waitFor(() => {
      expect(screen.getByText(/Excellent/)).toBeInTheDocument();
    });
  });

  it('shows "poor" adequacy for low lux levels', async () => {
    const user = userEvent.setup();
    const areaInput = screen.getByPlaceholderText('Ex: 30');
    const lumensInput = screen.getByPlaceholderText('Ex: 3000');
    const button = screen.getByRole('button', { name: /Calculer l'éclairement en lux/ });

    await user.type(areaInput, '100');
    await user.type(lumensInput, '100');
    await user.click(button);

    await waitFor(() => {
      expect(screen.getByText(/Insuffisant/)).toBeInTheDocument();
    });
  });

  it('displays room recommendations', () => {
    expect(screen.getByText(/Niveaux d'éclairage recommandés/i)).toBeInTheDocument();
    expect(screen.getByText(/Chambre à coucher/i)).toBeInTheDocument();
    expect(screen.getByText(/Cuisine/i)).toBeInTheDocument();
  });

  it('displays formula information', () => {
    expect(screen.getByText(/Formule de calcul/i)).toBeInTheDocument();
    expect(screen.getByText(/Lux = Lumens \/ Surface/)).toBeInTheDocument();
  });

  it('resets form correctly', async () => {
    const user = userEvent.setup();
    const areaInput = screen.getByPlaceholderText('Ex: 30') as HTMLInputElement;
    const lumensInput = screen.getByPlaceholderText('Ex: 3000') as HTMLInputElement;
    const button = screen.getByRole('button', { name: /Calculer l'éclairement en lux/ });
    const resetButton = screen.getByRole('button', { name: /Réinitialiser le calculateur/ });

    await user.type(areaInput, '30');
    await user.type(lumensInput, '3000');
    await user.click(button);

    await waitFor(() => {
      expect(screen.getByText('100')).toBeInTheDocument();
      expect(screen.getByText('lux')).toBeInTheDocument();
    });

    await user.click(resetButton);

    await waitFor(() => {
      expect(areaInput.value).toBe('');
      expect(lumensInput.value).toBe('');
    });
  });

  it('alerts on invalid input', async () => {
    const user = userEvent.setup();
    const button = screen.getByRole('button', { name: /Calculer l'éclairement en lux/ });
    const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});

    await user.click(button);

    expect(alertSpy).toHaveBeenCalled();
    alertSpy.mockRestore();
  });

  it('alerts on zero area', async () => {
    const user = userEvent.setup();
    const areaInput = screen.getByPlaceholderText('Ex: 30');
    const lumensInput = screen.getByPlaceholderText('Ex: 3000');
    const button = screen.getByRole('button', { name: /Calculer l'éclairement en lux/ });
    const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});

    await user.type(areaInput, '0');
    await user.type(lumensInput, '3000');
    await user.click(button);

    expect(alertSpy).toHaveBeenCalled();
    alertSpy.mockRestore();
  });

  it('displays room types and recommendations', () => {
    const roomTypes = [
      'Chambre à coucher',
      'Salon',
      'Cuisine',
      'Salle de bains',
      'Bureau / Espace de travail',
      'Atelier',
      'Entrepôt',
      'Magasin',
    ];

    roomTypes.forEach((room) => {
      expect(screen.getByText(room)).toBeInTheDocument();
    });
  });

  it('handles decimal lux values correctly', async () => {
    const user = userEvent.setup();
    const areaInput = screen.getByPlaceholderText('Ex: 30');
    const lumensInput = screen.getByPlaceholderText('Ex: 3000');
    const button = screen.getByRole('button', { name: /Calculer l'éclairement en lux/ });

    await user.type(areaInput, '7.5');
    await user.type(lumensInput, '1234');
    await user.click(button);

    await waitFor(() => {
      // 1234 / 7.5 = 164.5
      expect(screen.getByText('164.5')).toBeInTheDocument();
      expect(screen.getByText('lux')).toBeInTheDocument();
    });
  });
});
