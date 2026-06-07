/**
 * 🧪 Tests d'intégration — Newsletter Signup
 *
 * Tests d'intégration pour le flux d'inscription à la newsletter :
 * - Rendu du composant NewsletterSignup (toutes variantes)
 * - Soumission du formulaire avec validation d'email
 * - Appel API et gestion des états (succès, erreur, chargement)
 */

import { describe, it, expect, vi, beforeEach, type Mock } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { NewsletterSignup } from '@/components/NewsletterSignup';

// =====================================================================
// Mocks
// =====================================================================

const toastMock = vi.fn();

const { useToast } = vi.hoisted(() => {
  return { useToast: () => ({ toast: toastMock }) };
});

const { useSession } = vi.hoisted(() => ({
  useSession: () => ({
    user: null,
    isAuthenticated: false,
  }),
}));

// Mock fetch globally for API calls
global.fetch = vi.fn();

// Mock toast notifications
vi.mock('@/hooks/use-toast', () => ({ useToast }));

// Mock useSession for auth (used by other components)
vi.mock('@/hooks/useSession', () => ({ useSession }));

// Helper to access the toast mock function
function getToastMock() {
  return toastMock;
}

// =====================================================================
// Tests
// =====================================================================

describe('Newsletter Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (global.fetch as Mock).mockReset();

    // Default mock: success response
    (global.fetch as Mock).mockResolvedValue({
      ok: true,
      status: 200,
      json: () => Promise.resolve({ success: true }),
      headers: new Headers({ 'content-type': 'application/json' }),
      text: () => Promise.resolve(''),
    });
  });

  // =============================================================
  // 1. Rendu du composant (variante card par défaut)
  // =============================================================
  it('renders the newsletter signup form with default card variant', () => {
    render(<NewsletterSignup />);

    expect(screen.getByText('Restez informé')).toBeInTheDocument();
    expect(screen.getByText('Newsletter PROQUELEC')).toBeInTheDocument();
    expect(
      screen.getByText(
        /Recevez nos dernières actualités, conseils techniques, informations sur les formations/,
      ),
    ).toBeInTheDocument();
    expect(screen.getByLabelText('Adresse email pour la newsletter')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /s'inscrire/i })).toBeInTheDocument();
  });

  // =============================================================
  // 2. Champ email
  // =============================================================
  it('displays an email input with correct attributes', () => {
    render(<NewsletterSignup />);

    const input = screen.getByLabelText('Adresse email pour la newsletter');

    expect(input).toBeInTheDocument();
    expect(input).toHaveAttribute('type', 'email');
    expect(input).toHaveAttribute('placeholder', 'Votre adresse email');
    expect(input).toHaveAttribute('required');
  });

  // =============================================================
  // 3. Bouton de soumission
  // =============================================================
  it('renders a submit button with correct text and type', () => {
    render(<NewsletterSignup />);

    const buttons = screen.getAllByRole('button');
    const submitButton = buttons.find((btn) => btn.getAttribute('type') === 'submit');

    expect(submitButton).toBeInTheDocument();
    expect(submitButton).toHaveAttribute('type', 'submit');
    expect(submitButton).toContainHTML("S'inscrire");
  });

  // =============================================================
  // 4. Soumission vers le bon endpoint API
  // =============================================================
  it('submits to the correct API endpoint with proper body', async () => {
    const user = userEvent.setup();
    render(<NewsletterSignup />);

    const input = screen.getByLabelText('Adresse email pour la newsletter');
    await user.type(input, 'test@example.com');

    const submitButton = screen.getByRole('button', { name: /s'inscrire/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledTimes(1);
    });

    const callUrl = (global.fetch as Mock).mock.calls[0][0] as string;
    expect(callUrl).toContain('/api/newsletter-subscribers');

    const callOptions = (global.fetch as Mock).mock.calls[0][1] as RequestInit;
    expect(callOptions.method).toBe('POST');

    const body = JSON.parse(callOptions.body);
    expect(body.email).toBe('test@example.com');
    expect(body.source).toBe('website');
  });

  // =============================================================
  // 5. État de succès après soumission réussie
  // =============================================================
  it('displays a success message after successful signup', async () => {
    const user = userEvent.setup();
    render(<NewsletterSignup />);

    const input = screen.getByLabelText('Adresse email pour la newsletter');
    await user.type(input, 'test@example.com');

    const submitButton = screen.getByRole('button', { name: /s'inscrire/i });
    await user.click(submitButton);

    await waitFor(
      () => {
        expect(screen.getByText('Merci pour votre inscription !')).toBeInTheDocument();
      },
      { timeout: 3000 },
    );
  });

  // =============================================================
  // 6. État d'erreur sur échec API (rejet réseau)
  // =============================================================
  it('shows an error toast when the API call fails (network error)', async () => {
    (global.fetch as Mock).mockRejectedValue(new Error('Network error'));

    const user = userEvent.setup();
    render(<NewsletterSignup />);

    const input = screen.getByLabelText('Adresse email pour la newsletter');
    await user.type(input, 'test@example.com');

    const submitButton = screen.getByRole('button', { name: /s'inscrire/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(getToastMock()).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Erreur',
          variant: 'destructive',
        }),
      );
    });

    // Le formulaire doit rester affiché (pas l'état succès)
    expect(screen.queryByText('Merci pour votre inscription !')).not.toBeInTheDocument();
    expect(screen.getByLabelText('Adresse email pour la newsletter')).toBeInTheDocument();
  });

  // =============================================================
  // 7. État d'erreur sur réponse API non-ok (statut 500)
  // =============================================================
  it('shows an error toast when API returns an error status', async () => {
    (global.fetch as Mock).mockResolvedValue({
      ok: false,
      status: 500,
      json: () => Promise.resolve({ message: 'Erreur serveur' }),
      headers: new Headers({ 'content-type': 'application/json' }),
      text: () => Promise.resolve(''),
    });

    const user = userEvent.setup();
    render(<NewsletterSignup />);

    const input = screen.getByLabelText('Adresse email pour la newsletter');
    await user.type(input, 'test@example.com');

    const submitButton = screen.getByRole('button', { name: /s'inscrire/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(getToastMock()).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Erreur',
          description: 'Erreur serveur',
          variant: 'destructive',
        }),
      );
    });

    expect(screen.queryByText('Merci pour votre inscription !')).not.toBeInTheDocument();
  });

  // =============================================================
  // 8. Validation email invalide (sans @)
  // =============================================================
  it('shows validation error for email without @ symbol and does not call API', async () => {
    const user = userEvent.setup();
    const { container } = render(<NewsletterSignup />);

    const input = screen.getByLabelText('Adresse email pour la newsletter');
    await user.type(input, 'invalid-email');

    // Submit the form directly via fireEvent to ensure event propagation
    const form = container.querySelector('form')!;
    fireEvent.submit(form);

    // Ne doit PAS appeler l'API
    expect(global.fetch).not.toHaveBeenCalled();

    // Doit afficher un toast de validation
    expect(getToastMock()).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'Email invalide',
        variant: 'destructive',
      }),
    );
  });

  // =============================================================
  // 9. Validation email vide
  // =============================================================
  it('shows validation error for empty email and does not call API', async () => {
    const { container } = render(<NewsletterSignup />);

    // Submit the form directly via fireEvent to ensure event propagation
    const form = container.querySelector('form')!;
    fireEvent.submit(form);

    expect(global.fetch).not.toHaveBeenCalled();

    expect(getToastMock()).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'Email invalide',
        variant: 'destructive',
      }),
    );
  });

  // =============================================================
  // 10. État de chargement (spinner et bouton désactivé)
  // =============================================================
  it('shows a loading spinner and disables the button during submission', async () => {
    let resolvePromise!: (value: unknown) => void;
    const fetchPromise = new Promise((resolve) => {
      resolvePromise = resolve;
    });
    (global.fetch as Mock).mockReturnValue(fetchPromise);

    const user = userEvent.setup();
    render(<NewsletterSignup />);

    const input = screen.getByLabelText('Adresse email pour la newsletter');
    await user.type(input, 'test@example.com');

    const submitButton = screen.getByRole('button', { name: /s'inscrire/i });

    await user.click(submitButton);

    expect(submitButton).toBeDisabled();

    const spinner = submitButton.querySelector('.animate-spin');
    expect(spinner).toBeInTheDocument();

    resolvePromise({
      ok: true,
      status: 200,
      json: () => Promise.resolve({ success: true }),
      headers: new Headers({ 'content-type': 'application/json' }),
      text: () => Promise.resolve(''),
    });

    await waitFor(() => {
      expect(screen.getByText('Merci pour votre inscription !')).toBeInTheDocument();
    });
  });

  // =============================================================
  // 11. Variante Banner
  // =============================================================
  it('renders the banner variant with trust badges and newsletter section', () => {
    render(<NewsletterSignup variant="banner" />);

    expect(screen.getByText('Restez informé')).toBeInTheDocument();
    expect(screen.getByText('0% Spam')).toBeInTheDocument();
    expect(screen.getByText('Gratuit')).toBeInTheDocument();
    expect(screen.getByText('1 Clic')).toBeInTheDocument();
    expect(screen.getByText('Newsletter')).toBeInTheDocument();
    expect(screen.getByLabelText('Adresse email pour la newsletter')).toBeInTheDocument();
  });

  // =============================================================
  // 12. Variante Footer
  // =============================================================
  it('renders the footer variant with specific layout', () => {
    render(<NewsletterSignup variant="footer" />);

    expect(screen.getByText('Newsletter PROQUELEC')).toBeInTheDocument();
    expect(
      screen.getByText(
        /Recevez nos actualités et conseils techniques. Désinscription à tout moment./,
      ),
    ).toBeInTheDocument();
    expect(screen.getByLabelText('Adresse email pour la newsletter')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /s'inscrire/i })).toBeInTheDocument();
  });

  // =============================================================
  // 13. Variante Inline
  // =============================================================
  it('renders the inline variant without extra wrappers', () => {
    const { container } = render(<NewsletterSignup variant="inline" />);

    expect(screen.getByLabelText('Adresse email pour la newsletter')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /s'inscrire/i })).toBeInTheDocument();

    expect(screen.queryByText('Newsletter PROQUELEC')).not.toBeInTheDocument();
    expect(screen.queryByText('0% Spam')).not.toBeInTheDocument();
    expect(container.querySelector('.space-y-4')).toBeInTheDocument();
  });

  // =============================================================
  // 14. Success toast affiché après inscription réussie
  // =============================================================
  it('shows a success toast after successful signup', async () => {
    const user = userEvent.setup();
    render(<NewsletterSignup />);

    const input = screen.getByLabelText('Adresse email pour la newsletter');
    await user.type(input, 'test@example.com');

    const submitButton = screen.getByRole('button', { name: /s'inscrire/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(getToastMock()).toHaveBeenCalledWith(
        expect.objectContaining({
          title: expect.stringContaining('Inscription réussie'),
          variant: 'default',
        }),
      );
    });
  });

  // =============================================================
  // 15. L'email est effacé après soumission réussie
  // =============================================================
  it('clears the email input after successful submission', async () => {
    const user = userEvent.setup();
    render(<NewsletterSignup />);

    const input = screen.getByLabelText('Adresse email pour la newsletter') as HTMLInputElement;
    await user.type(input, 'test@example.com');

    const submitButton = screen.getByRole('button', { name: /s'inscrire/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Merci pour votre inscription !')).toBeInTheDocument();
    });

    expect(screen.queryByLabelText('Adresse email pour la newsletter')).not.toBeInTheDocument();
  });
});
