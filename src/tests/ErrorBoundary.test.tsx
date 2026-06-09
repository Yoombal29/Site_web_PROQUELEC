/**
 * 🧪 ErrorBoundary Tests — Tests pour les ErrorBoundary global et block-level
 *
 * Couvre :
 * - ErrorBoundary (global) – Erreur applicative complète avec options de récupération
 * - BlockErrorBoundary (block-level) – Erreur localisée d'un bloc du builder
 */

import { describe, it, expect, vi, beforeEach, afterAll } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { BlockErrorBoundary } from '@/components/builder/BlockErrorBoundary';

// =============================================================================
// HELPERS
// =============================================================================

/** Throws an error on render to trigger error boundaries in tests */
const ThrowError = ({ message = 'Test crash' }: { message?: string }): never => {
  throw new Error(message);
};

/** Stable component that renders without errors — used as the normal child */
const StableChild = ({ text = 'Normal child content' }: { text?: string }) => <div>{text}</div>;

// Save the real window.location to restore after the suite
const originalLocation: Location = window.location;

// =============================================================================
// MOCK SETUP
// =============================================================================

beforeEach(() => {
  vi.clearAllMocks();

  // Reset sessionStorage crash counter mock to a base value (0 crashes)
  vi.mocked(sessionStorage.getItem).mockReturnValue('0');

  // Mock window.location so we can spy on reload() and href assignment
  // without triggering actual navigation in the test environment
  Object.defineProperty(window, 'location', {
    value: { reload: vi.fn(), href: '' },
    writable: true,
  });
});

afterAll(() => {
  // Restore the real window.location after all tests in this file complete
  Object.defineProperty(window, 'location', {
    value: originalLocation,
    writable: true,
  });
});

// =============================================================================
// ERROR BOUNDARY (GLOBAL)
// =============================================================================

describe('ErrorBoundary (Global)', () => {
  // ── Normal rendering ──────────────────────────────────────────────────────

  it('renders children normally when no error occurs', () => {
    render(
      <ErrorBoundary>
        <StableChild text="Tableau de bord opérationnel" />
      </ErrorBoundary>,
    );

    expect(screen.getByText('Tableau de bord opérationnel')).toBeInTheDocument();
  });

  it('does not show any error UI when there is no error', () => {
    render(
      <ErrorBoundary>
        <StableChild />
      </ErrorBoundary>,
    );

    expect(screen.queryByText('Une erreur est survenue')).not.toBeInTheDocument();
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  // ── Error catching & UI ───────────────────────────────────────────────────

  it('catches rendering errors and displays the error UI without throwing', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    // The render itself must not throw – the error boundary should catch the error
    expect(() =>
      render(
        <ErrorBoundary>
          <ThrowError />
        </ErrorBoundary>,
      ),
    ).not.toThrow();

    // Verify the core error UI elements are present
    expect(screen.getByRole('heading', { name: /Une erreur est survenue/i })).toBeInTheDocument();

    expect(screen.getByText(/Nous nous excusons pour ce désagrément/i)).toBeInTheDocument();

    consoleSpy.mockRestore();
  });

  it('displays the AlertTriangle icon in the error UI', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    render(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>,
    );

    // The error UI should contain an SVG icon (AlertTriangle from lucide-react)
    const svgIcon = document.querySelector('.error-boundary svg, [class*="error"] svg');
    // Fallback: check that at least one SVG is rendered inside the error boundary
    const headingContainer = screen
      .getByRole('heading', { name: /Une erreur est survenue/i })
      .closest('.text-center');
    expect(headingContainer?.querySelector('svg')).toBeInTheDocument();

    consoleSpy.mockRestore();
  });

  it('shows the error message in the details section inside a <pre> tag', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    render(
      <ErrorBoundary>
        <ThrowError message="Erreur de connexion à la base de données" />
      </ErrorBoundary>,
    );

    expect(screen.getByText(/Erreur de connexion à la base de données/)).toBeInTheDocument();

    // The message lives inside a <pre> element
    const preElement = screen.getByText(/Erreur de connexion/).closest('pre');
    expect(preElement).toBeInTheDocument();

    consoleSpy.mockRestore();
  });

  it('displays the "Détails de l\'erreur" heading when an error is present', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    render(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>,
    );

    expect(screen.getByText(/Détails de l'erreur/i)).toBeInTheDocument();

    consoleSpy.mockRestore();
  });

  // ── "Recharger la page" button ────────────────────────────────────────────

  it('renders a "Recharger la page" button in the error UI', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    render(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>,
    );

    const reloadButton = screen.getByRole('button', {
      name: /Recharger la page/i,
    });
    expect(reloadButton).toBeInTheDocument();

    consoleSpy.mockRestore();
  });

  it('calls window.location.reload when "Recharger la page" is clicked', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    render(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>,
    );

    const reloadButton = screen.getByRole('button', {
      name: /Recharger la page/i,
    });
    fireEvent.click(reloadButton);

    expect(window.location.reload).toHaveBeenCalledTimes(1);

    consoleSpy.mockRestore();
  });

  // ── "Retour à l'accueil" button ───────────────────────────────────────────

  it('renders a "Retour à l\'accueil" button in the error UI', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    render(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>,
    );

    const homeButton = screen.getByRole('button', {
      name: /Retour à l'accueil/i,
    });
    expect(homeButton).toBeInTheDocument();

    consoleSpy.mockRestore();
  });

  it('navigates to "/" when "Retour à l\'accueil" is clicked', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    const location = window.location as unknown as {
      reload: ReturnType<typeof vi.fn>;
      href: string;
    };
    location.href = '/some/current/page';

    render(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>,
    );

    const homeButton = screen.getByRole('button', {
      name: /Retour à l'accueil/i,
    });
    fireEvent.click(homeButton);

    expect(location.href).toBe('/');

    consoleSpy.mockRestore();
  });

  // ── "Réinitialisation d'urgence" button ───────────────────────────────────

  it('shows "Réinitialisation d\'urgence" when crash count >= 2', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    vi.mocked(sessionStorage.getItem).mockReturnValue('2');

    render(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>,
    );

    expect(screen.getByRole('button', { name: /Réinitialisation d'urgence/i })).toBeInTheDocument();

    consoleSpy.mockRestore();
  });

  it('does NOT show "Réinitialisation d\'urgence" when crash count < 2', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    // Default is '0' set in beforeEach; explicitly set to reinforce intent
    vi.mocked(sessionStorage.getItem).mockReturnValue('0');

    render(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>,
    );

    expect(
      screen.queryByRole('button', { name: /Réinitialisation d'urgence/i }),
    ).not.toBeInTheDocument();

    consoleSpy.mockRestore();
  });

  it('does NOT show "Réinitialisation d\'urgence" when crash count is exactly 1', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    vi.mocked(sessionStorage.getItem).mockReturnValue('1');

    render(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>,
    );

    expect(
      screen.queryByRole('button', { name: /Réinitialisation d'urgence/i }),
    ).not.toBeInTheDocument();

    consoleSpy.mockRestore();
  });

  it('calls sessionStorage.removeItem, localStorage.clear, and navigates to / when "Réinitialisation d\'urgence" is clicked', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    vi.mocked(sessionStorage.getItem).mockReturnValue('2');

    const location = window.location as unknown as {
      reload: ReturnType<typeof vi.fn>;
      href: string;
    };

    render(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>,
    );

    const resetButton = screen.getByRole('button', {
      name: /Réinitialisation d'urgence/i,
    });
    fireEvent.click(resetButton);

    // handleReset runs:
    //   1. sessionStorage.removeItem('app_crash_count')
    //   2. localStorage.clear()
    //   3. window.location.href = '/'
    expect(vi.mocked(sessionStorage.removeItem)).toHaveBeenCalledWith('app_crash_count');
    expect(vi.mocked(localStorage.clear)).toHaveBeenCalledTimes(1);
    expect(location.href).toBe('/');

    consoleSpy.mockRestore();
  });

  // ── Crash counter ─────────────────────────────────────────────────────────

  it('increments the crash counter in sessionStorage on each error', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    // Starting count = 0
    vi.mocked(sessionStorage.getItem).mockReturnValue('0');

    render(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>,
    );

    // componentDidCatch should have read '0' and written '1'
    expect(vi.mocked(sessionStorage.getItem)).toHaveBeenCalledWith('app_crash_count');
    expect(vi.mocked(sessionStorage.setItem)).toHaveBeenCalledWith('app_crash_count', '1');

    consoleSpy.mockRestore();
  });

  it('increments from a non-zero crash count correctly', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    // Starting count = 3
    vi.mocked(sessionStorage.getItem).mockReturnValue('3');

    render(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>,
    );

    // componentDidCatch should have read '3' and written '4'
    expect(vi.mocked(sessionStorage.setItem)).toHaveBeenCalledWith('app_crash_count', '4');

    consoleSpy.mockRestore();
  });

  // ── Edge cases ────────────────────────────────────────────────────────────

  it('renders correctly after multiple children without errors', () => {
    render(
      <ErrorBoundary>
        <StableChild text="Section A" />
        <StableChild text="Section B" />
        <StableChild text="Section C" />
      </ErrorBoundary>,
    );

    expect(screen.getByText('Section A')).toBeInTheDocument();
    expect(screen.getByText('Section B')).toBeInTheDocument();
    expect(screen.getByText('Section C')).toBeInTheDocument();
  });

  it('still shows error UI if the same component is re-thrown after the first catch', () => {
    // This is a regression guard: ErrorBoundary should always show the error UI
    // regardless of how many times it re-renders with hasError=true.
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    const { rerender } = render(
      <ErrorBoundary>
        <ThrowError message="Attempt 1" />
      </ErrorBoundary>,
    );

    expect(screen.getByText(/Attempt 1/)).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /Une erreur est survenue/i })).toBeInTheDocument();

    // Re-render with a different throwing child – the error boundary should
    // stay in error state (it never resets automatically).
    rerender(
      <ErrorBoundary>
        <ThrowError message="Attempt 2" />
      </ErrorBoundary>,
    );

    // The heading should still be present; the error message may show the
    // *original* error (class component does not reset state on rerender).
    expect(screen.getByRole('heading', { name: /Une erreur est survenue/i })).toBeInTheDocument();

    consoleSpy.mockRestore();
  });
});

// =============================================================================
// BLOCK ERROR BOUNDARY
// =============================================================================

describe('BlockErrorBoundary', () => {
  // ── Normal rendering ──────────────────────────────────────────────────────

  it('renders children normally when no error occurs', () => {
    render(
      <BlockErrorBoundary blockId="block-1">
        <StableChild text="Contenu du bloc" />
      </BlockErrorBoundary>,
    );

    expect(screen.getByText('Contenu du bloc')).toBeInTheDocument();
  });

  it('does not show the fallback UI when there is no error', () => {
    render(
      <BlockErrorBoundary blockId="block-safe">
        <StableChild text="Tout va bien" />
      </BlockErrorBoundary>,
    );

    expect(screen.queryByText(/⚠️/)).not.toBeInTheDocument();
    expect(screen.queryByText(/Erreur de rendu/i)).not.toBeInTheDocument();
  });

  // ── Error catching ────────────────────────────────────────────────────────

  it('catches errors and displays the block error fallback', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    render(
      <BlockErrorBoundary blockId="block-42">
        <ThrowError />
      </BlockErrorBoundary>,
    );

    expect(screen.getByText(/⚠️ Erreur de rendu \(Bloc block-42\)/)).toBeInTheDocument();

    consoleSpy.mockRestore();
  });

  it('displays the error message in the fallback', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    render(
      <BlockErrorBoundary blockId="block-7">
        <ThrowError message="Échec du rendu du composant bloc" />
      </BlockErrorBoundary>,
    );

    expect(screen.getByText(/Échec du rendu du composant bloc/)).toBeInTheDocument();

    consoleSpy.mockRestore();
  });

  it('displays the error message in a smaller text element alongside the heading', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    render(
      <BlockErrorBoundary blockId="block-99">
        <ThrowError message="Erreur 500 interne" />
      </BlockErrorBoundary>,
    );

    // The block ID is in the heading
    expect(screen.getByText(/Bloc block-99/)).toBeInTheDocument();
    // The error message is displayed separately
    expect(screen.getByText(/Erreur 500 interne/)).toBeInTheDocument();

    consoleSpy.mockRestore();
  });

  // ── Block ID handling ─────────────────────────────────────────────────────

  it('works with different blockId values (alphanumeric)', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    render(
      <BlockErrorBoundary blockId="header-block-001">
        <ThrowError message="Header error" />
      </BlockErrorBoundary>,
    );

    expect(screen.getByText(/Bloc header-block-001/)).toBeInTheDocument();

    consoleSpy.mockRestore();
  });

  it('works with different blockId values (short id)', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    render(
      <BlockErrorBoundary blockId="a">
        <ThrowError message="Short id error" />
      </BlockErrorBoundary>,
    );

    expect(screen.getByText(/Bloc a/)).toBeInTheDocument();
    expect(screen.getByText(/Short id error/)).toBeInTheDocument();

    consoleSpy.mockRestore();
  });

  it('renders independent fallback UIs for multiple error boundary instances', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    render(
      <div>
        <BlockErrorBoundary blockId="block-a">
          <ThrowError message="Error A" />
        </BlockErrorBoundary>
        <BlockErrorBoundary blockId="block-b">
          <ThrowError message="Error B" />
        </BlockErrorBoundary>
      </div>,
    );

    // Both block IDs should be displayed
    expect(screen.getByText(/Bloc block-a/)).toBeInTheDocument();
    expect(screen.getByText(/Bloc block-b/)).toBeInTheDocument();
    // Both error messages should be visible
    expect(screen.getByText(/Error A/)).toBeInTheDocument();
    expect(screen.getByText(/Error B/)).toBeInTheDocument();

    consoleSpy.mockRestore();
  });

  it('does not let errors from one block affect a neighbouring healthy block', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    render(
      <div>
        <BlockErrorBoundary blockId="broken-block">
          <ThrowError message="Crash" />
        </BlockErrorBoundary>
        <BlockErrorBoundary blockId="healthy-block">
          <StableChild text="Je fonctionne encore" />
        </BlockErrorBoundary>
      </div>,
    );

    // Fallback for the broken block
    expect(screen.getByText(/Bloc broken-block/)).toBeInTheDocument();
    // Healthy block's children are still rendered
    expect(screen.getByText('Je fonctionne encore')).toBeInTheDocument();

    consoleSpy.mockRestore();
  });

  // ── Edge cases ────────────────────────────────────────────────────────────

  it('preserves error state after a re-render with different children', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    const { rerender } = render(
      <BlockErrorBoundary blockId="persistent-block">
        <ThrowError message="Première erreur" />
      </BlockErrorBoundary>,
    );

    // Error is caught and fallback is shown
    expect(screen.getByText(/Première erreur/)).toBeInTheDocument();

    // Re-render with a valid child – the error boundary should NOT reset,
    // it should keep showing the fallback (class component pattern).
    rerender(
      <BlockErrorBoundary blockId="persistent-block">
        <StableChild text="Ceci ne devrait pas apparaître" />
      </BlockErrorBoundary>,
    );

    // The error fallback persists
    expect(screen.getByText(/⚠️ Erreur de rendu/)).toBeInTheDocument();
    // The new valid child is NOT rendered
    expect(screen.queryByText('Ceci ne devrait pas apparaître')).not.toBeInTheDocument();

    consoleSpy.mockRestore();
  });
});
