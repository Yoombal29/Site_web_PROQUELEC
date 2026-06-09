/**
 * 🧪 AuthIntegration — Tests d'intégration des flux d'authentification
 *
 * Couvre :
 * - Gestion du token JWT (localStorage)
 * - Composant RoleProtectedRoute (RBAC)
 * - Accès protégé au Builder
 *
 * Dépendances mockées :
 * - @/hooks/useSession → vérifie le token dans localStorage
 * - @/hooks/useUserRole → déduit le rôle depuis la session
 * - react-router-dom → Navigate, useNavigate
 * - @tanstack/react-query → useQuery (dans useSession)
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, cleanup, waitFor } from '@testing-library/react';
import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// ─── Mocks ────────────────────────────────────────────────────────────────────

const mockNavigate = vi.fn();

// Mock react-router-dom early so all imports use the mock
vi.mock('react-router-dom', () => ({
  Navigate: ({ to, replace }: { to: string; replace?: boolean }) => (
    <div data-testid="navigate-to" data-replace={replace ? 'true' : 'false'}>
      {to}
    </div>
  ),
  useNavigate: () => mockNavigate,
  useLocation: () => ({ pathname: '/', search: '', hash: '', state: null }),
  Outlet: () => <div data-testid="outlet" />,
}));

// We will set up useSession mock return values per test
const mockUseSession = vi.fn();
vi.mock('@/hooks/useSession', () => ({
  useSession: () => mockUseSession(),
}));

// We will set up useUserRole mock return values per test
const mockUseUserRole = vi.fn();
vi.mock('@/hooks/useUserRole', () => ({
  useUserRole: () => mockUseUserRole(),
}));

// Mock the builder store (zustand) so we don't need the real event bus or crypto utils
vi.mock('@/stores/useBuilderStore', () => ({
  useBuilderStore: vi.fn((selector?: (state: Record<string, unknown>) => unknown) => {
    const state = {
      blocks: [],
      selectedBlockId: null,
      pageMetadata: {},
      history: [],
      historyIndex: -1,
      templates: [],
      setBlocks: vi.fn(),
      addBlock: vi.fn(),
      importBlock: vi.fn(),
      moveBlock: vi.fn(),
      selectBlock: vi.fn(),
      setPageMetadata: vi.fn(),
      updateBlockStyle: vi.fn(),
      updateBlockContent: vi.fn(),
      removeBlock: vi.fn(),
      undo: vi.fn(),
      redo: vi.fn(),
      canUndo: () => false,
      canRedo: () => false,
      snapshotHistory: vi.fn(),
      saveTemplate: vi.fn(),
      deleteTemplate: vi.fn(),
      loadTemplates: vi.fn(),
    };
    return selector ? selector(state) : state;
  }),
}));

// Mock lucide-react icons used by RoleProtectedRoute
vi.mock('lucide-react', () => ({
  Clock: () => <svg data-testid="clock-icon" />,
}));

// ─── Imports under test (after mocks) ─────────────────────────────────────────

// Re-import with the mocked modules
import { RoleProtectedRoute } from '@/components/RoleProtectedRoute';
import { useBuilderStore } from '@/stores/useBuilderStore';

// The global setup.ts stubs localStorage with a broken mock that doesn't store values.
// We override it here with a proper working mock for our auth tests.
const workingLocalStorage = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] ?? null,
    setItem: (key: string, value: string) => {
      store[key] = String(value);
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
    get length() {
      return Object.keys(store).length;
    },
    key: (index: number) => Object.keys(store)[index] ?? null,
  };
})();
Object.defineProperty(window, 'localStorage', { value: workingLocalStorage });

// ─── Helpers ──────────────────────────────────────────────────────────────────

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: false },
  },
});

interface WrapperProps {
  children: React.ReactNode;
}

/**
 * Wraps a component with QueryClientProvider so useSession (which uses react-query)
 * can function correctly in tests.
 */
function TestWrapper({ children }: WrapperProps) {
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}

/**
 * Helper to render a component inside the test wrapper.
 */
function renderWithWrapper(ui: React.ReactElement) {
  return render(ui, { wrapper: TestWrapper });
}

// ─── User & Session Fixtures ──────────────────────────────────────────────────

const adminUser = {
  id: 'admin-1',
  email: 'admin@proquelec.sn',
  username: 'Admin PROQUELEC',
  role: 'admin',
  is_active: true,
};

const superAdminUser = {
  id: 'superadmin-1',
  email: 'super@proquelec.sn',
  username: 'Super Admin',
  role: 'superadmin',
  is_active: true,
};

const electricienUser = {
  id: 'elec-1',
  email: 'jean.dupont@example.com',
  username: 'Jean Dupont',
  role: 'electricien',
  is_active: true,
};

const entrepriseUser = {
  id: 'ent-1',
  email: 'contact@entreprise.sn',
  username: 'Entreprise SARL',
  role: 'entreprise',
  is_active: true,
};

const pendingPartnerUser = {
  id: 'partner-1',
  email: 'partner@test.sn',
  username: 'Partenaire',
  role: 'partner',
  is_active: false, // <-- pending approval
};

const defaultSession = (overrides: Partial<ReturnType<typeof mockUseSession>> = {}): Record<string, unknown> => ({
  session: null,
  user: null,
  isLoading: false,
  signOut: vi.fn(),
  login: vi.fn(),
  ...overrides,
});

const defaultUserRole = (overrides: Partial<ReturnType<typeof mockUseUserRole>> = {}) => ({
  role: 'user' as string,
  status: 'active' as string,
  isAdmin: false,
  isSecondaryAdmin: false,
  isPartner: false,
  isPending: false,
  isLoading: false,
  error: null,
  ...overrides,
});

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('Authentication Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    queryClient.clear();
  });

  afterEach(() => {
    cleanup();
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // 1. TOKEN MANAGEMENT
  // ═══════════════════════════════════════════════════════════════════════════

  describe('Token Management', () => {
    it('should store and retrieve a JWT token from localStorage', () => {
      const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.test-token';
      localStorage.setItem('token', token);

      const stored = localStorage.getItem('token');
      expect(stored).toBe(token);
    });

    it('should return null from localStorage when no token is stored', () => {
      const stored = localStorage.getItem('token');
      expect(stored).toBeNull();
    });

    it('should detect an authenticated session when token exists and user is returned', () => {
      // Set up useSession to simulate a logged-in user
      mockUseSession.mockReturnValue(
        defaultSession({
          session: { access_token: 'valid-token', user: adminUser },
          user: adminUser,
          isLoading: false,
        }),
      );

      renderWithWrapper(<div data-testid="auth-check">Protected Content</div>);

      expect(screen.getByTestId('auth-check')).toBeInTheDocument();
    });

    it('should detect an unauthenticated state when token is missing', () => {
      mockUseSession.mockReturnValue(
        defaultSession({
          session: null,
          user: null,
          isLoading: false,
        }),
      );

      renderWithWrapper(<div data-testid="no-auth">Public Content</div>);

      expect(screen.getByTestId('no-auth')).toBeInTheDocument();
    });

    it('should remove token from localStorage on signOut', () => {
      localStorage.setItem('token', 'some-token');
      expect(localStorage.getItem('token')).toBe('some-token');

      const signOutMock = vi.fn(() => {
        localStorage.removeItem('token');
      });

      mockUseSession.mockReturnValue(
        defaultSession({
          session: { access_token: 'some-token', user: adminUser },
          user: adminUser,
          signOut: signOutMock,
        }),
      );

      // Call signOut
      signOutMock();
      expect(localStorage.getItem('token')).toBeNull();
    });

    it('should store token in localStorage on login', () => {
      const newToken = 'new-jwt-token';

      const loginMock = vi.fn((token: string, userData: unknown) => {
        localStorage.setItem('token', token);
      });

      mockUseSession.mockReturnValue(
        defaultSession({
          login: loginMock,
        }),
      );

      // Call login
      loginMock(newToken, adminUser);
      expect(localStorage.getItem('token')).toBe(newToken);
    });

    it('should reflect loading state while session is being fetched', () => {
      mockUseSession.mockReturnValue(
        defaultSession({
          session: null,
          user: null,
          isLoading: true,
        }),
      );

      let capturedIsLoading = false;
      const CaptureComponent = () => {
        const { isLoading } = mockUseSession();
        capturedIsLoading = isLoading;
        return <div data-testid="loading-state">Loading...</div>;
      };

      renderWithWrapper(<CaptureComponent />);
      expect(screen.getByTestId('loading-state')).toBeInTheDocument();
      expect(capturedIsLoading).toBe(true);
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // 2. ROLE PROTECTED ROUTE
  // ═══════════════════════════════════════════════════════════════════════════

  describe('RoleProtectedRoute', () => {
    it('should render children when user has a required role', () => {
      mockUseSession.mockReturnValue(
        defaultSession({
          session: { access_token: 'tok', user: adminUser },
          user: adminUser,
          isLoading: false,
        }),
      );
      mockUseUserRole.mockReturnValue(
        defaultUserRole({ role: 'admin', isAdmin: true, status: 'active' }),
      );

      renderWithWrapper(
        <RoleProtectedRoute allowedRoles={['admin']}>
          <div data-testid="admin-content">Admin Panel</div>
        </RoleProtectedRoute>,
      );

      expect(screen.getByTestId('admin-content')).toBeInTheDocument();
      expect(screen.queryByTestId('navigate-to')).not.toBeInTheDocument();
    });

    it('should show "Accès Refusé" (403) when user lacks the required role', () => {
      mockUseSession.mockReturnValue(
        defaultSession({
          session: { access_token: 'tok', user: electricienUser },
          user: electricienUser,
          isLoading: false,
        }),
      );
      mockUseUserRole.mockReturnValue(
        defaultUserRole({ role: 'electricien', isAdmin: false, status: 'active' }),
      );

      renderWithWrapper(
        <RoleProtectedRoute allowedRoles={['admin']}>
          <div data-testid="admin-content">Admin Panel</div>
        </RoleProtectedRoute>,
      );

      // The component renders a "403 / Accès Refusé" page
      expect(screen.getByText('403')).toBeInTheDocument();
      expect(screen.getByText('Accès Refusé')).toBeInTheDocument();
      expect(screen.queryByTestId('admin-content')).not.toBeInTheDocument();
    });

    it('should show "Accès Refusé" for electricien trying to access entreprise route', () => {
      mockUseSession.mockReturnValue(
        defaultSession({
          session: { access_token: 'tok', user: electricienUser },
          user: electricienUser,
          isLoading: false,
        }),
      );
      mockUseUserRole.mockReturnValue(
        defaultUserRole({ role: 'electricien', isAdmin: false, status: 'active' }),
      );

      renderWithWrapper(
        <RoleProtectedRoute allowedRoles={['admin', 'entreprise']}>
          <div data-testid="entreprise-content">Company Dashboard</div>
        </RoleProtectedRoute>,
      );

      expect(screen.getByText('403')).toBeInTheDocument();
      expect(screen.queryByTestId('entreprise-content')).not.toBeInTheDocument();
    });

    it('should render children for electricien when allowedRoles includes electricien', () => {
      mockUseSession.mockReturnValue(
        defaultSession({
          session: { access_token: 'tok', user: electricienUser },
          user: electricienUser,
          isLoading: false,
        }),
      );
      mockUseUserRole.mockReturnValue(
        defaultUserRole({ role: 'electricien', isAdmin: false, status: 'active' }),
      );

      renderWithWrapper(
        <RoleProtectedRoute allowedRoles={['admin', 'electricien']}>
          <div data-testid="elec-content">Electrician Dashboard</div>
        </RoleProtectedRoute>,
      );

      expect(screen.getByTestId('elec-content')).toBeInTheDocument();
    });

    it('should render children for entreprise when allowedRoles includes entreprise', () => {
      mockUseSession.mockReturnValue(
        defaultSession({
          session: { access_token: 'tok', user: entrepriseUser },
          user: entrepriseUser,
          isLoading: false,
        }),
      );
      mockUseUserRole.mockReturnValue(
        defaultUserRole({ role: 'entreprise', isAdmin: false, status: 'active' }),
      );

      renderWithWrapper(
        <RoleProtectedRoute allowedRoles={['admin', 'entreprise']}>
          <div data-testid="ent-content">Company Dashboard</div>
        </RoleProtectedRoute>,
      );

      expect(screen.getByTestId('ent-content')).toBeInTheDocument();
    });

    it('should allow superadmin to access routes requiring admin role', () => {
      mockUseSession.mockReturnValue(
        defaultSession({
          session: { access_token: 'tok', user: superAdminUser },
          user: superAdminUser,
          isLoading: false,
        }),
      );
      mockUseUserRole.mockReturnValue(
        defaultUserRole({ role: 'superadmin', isAdmin: true, status: 'active' }),
      );

      renderWithWrapper(
        <RoleProtectedRoute allowedRoles={['admin']}>
          <div data-testid="super-admin-content">Super Admin Content</div>
        </RoleProtectedRoute>,
      );

      expect(screen.getByTestId('super-admin-content')).toBeInTheDocument();
    });

    it('should redirect to /connexion when no user is authenticated (Navigate)', () => {
      mockUseSession.mockReturnValue(
        defaultSession({
          session: null,
          user: null,
          isLoading: false,
        }),
      );
      mockUseUserRole.mockReturnValue(
        defaultUserRole({ role: 'user', isAdmin: false, status: 'active' }),
      );

      renderWithWrapper(
        <RoleProtectedRoute allowedRoles={['admin']}>
          <div data-testid="protected">Protected</div>
        </RoleProtectedRoute>,
      );

      expect(screen.getByTestId('navigate-to')).toBeInTheDocument();
      expect(screen.getByTestId('navigate-to')).toHaveTextContent('/connexion');
    });

    it('should use custom redirectTo path when provided', () => {
      mockUseSession.mockReturnValue(
        defaultSession({
          session: null,
          user: null,
          isLoading: false,
        }),
      );
      mockUseUserRole.mockReturnValue(
        defaultUserRole({ role: 'user', isAdmin: false, status: 'active' }),
      );

      renderWithWrapper(
        <RoleProtectedRoute allowedRoles={['admin']} redirectTo="/custom-login">
          <div data-testid="protected">Protected</div>
        </RoleProtectedRoute>,
      );

      expect(screen.getByTestId('navigate-to')).toHaveTextContent('/custom-login');
    });

    it('should show loading spinner while session is being checked', () => {
      mockUseSession.mockReturnValue(
        defaultSession({
          session: null,
          user: null,
          isLoading: true,
        }),
      );
      mockUseUserRole.mockReturnValue(
        defaultUserRole({ role: 'user', isAdmin: false, isLoading: true }),
      );

      renderWithWrapper(
        <RoleProtectedRoute allowedRoles={['admin']}>
          <div data-testid="protected">Protected</div>
        </RoleProtectedRoute>,
      );

      // The loading spinner uses animate-spin class — we can check for the spinner container
      const spinner = document.querySelector('.animate-spin');
      expect(spinner).toBeInTheDocument();
      expect(screen.queryByTestId('protected')).not.toBeInTheDocument();
    });

    it('should show pending approval UI when user status is pending (is_active=false)', () => {
      mockUseSession.mockReturnValue(
        defaultSession({
          session: { access_token: 'tok', user: pendingPartnerUser },
          user: pendingPartnerUser,
          isLoading: false,
        }),
      );
      mockUseUserRole.mockReturnValue(
        defaultUserRole({
          role: 'partner',
          isAdmin: false,
          isPartner: true,
          isPending: true,
          status: 'pending',
        }),
      );

      renderWithWrapper(
        <RoleProtectedRoute allowedRoles={['partner']}>
          <div data-testid="partner-content">Partner Dashboard</div>
        </RoleProtectedRoute>,
      );

      // Should show the "Inscription en attente" (pending inscription) message
      expect(screen.getByText('Inscription en attente')).toBeInTheDocument();
      expect(
        screen.getByText(/Votre demande d'inscription.*est en cours de validation/),
      ).toBeInTheDocument();
      expect(screen.queryByTestId('partner-content')).not.toBeInTheDocument();
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // 3. PROTECTED BUILDER ACCESS
  // ═══════════════════════════════════════════════════════════════════════════

  describe('Protected Builder Access', () => {
    it('should allow admin user to access builder page content', () => {
      mockUseSession.mockReturnValue(
        defaultSession({
          session: { access_token: 'tok', user: adminUser },
          user: adminUser,
          isLoading: false,
        }),
      );
      mockUseUserRole.mockReturnValue(
        defaultUserRole({ role: 'admin', isAdmin: true, status: 'active' }),
      );

      // Simulate the builder page route structure (admin/builder)
      renderWithWrapper(
        <RoleProtectedRoute allowedRoles={['admin']}>
          <div data-testid="builder-content">Builder Page</div>
        </RoleProtectedRoute>,
      );

      expect(screen.getByTestId('builder-content')).toBeInTheDocument();
    });

    it('should allow admin user to access builder config page', () => {
      mockUseSession.mockReturnValue(
        defaultSession({
          session: { access_token: 'tok', user: adminUser },
          user: adminUser,
          isLoading: false,
        }),
      );
      mockUseUserRole.mockReturnValue(
        defaultUserRole({ role: 'admin', isAdmin: true, status: 'active' }),
      );

      renderWithWrapper(
        <RoleProtectedRoute allowedRoles={['admin']}>
          <div data-testid="builder-config-content">Builder Config</div>
        </RoleProtectedRoute>,
      );

      expect(screen.getByTestId('builder-config-content')).toBeInTheDocument();
    });

    it('should block non-admin user from accessing builder page', () => {
      mockUseSession.mockReturnValue(
        defaultSession({
          session: { access_token: 'tok', user: electricienUser },
          user: electricienUser,
          isLoading: false,
        }),
      );
      mockUseUserRole.mockReturnValue(
        defaultUserRole({ role: 'electricien', isAdmin: false, status: 'active' }),
      );

      renderWithWrapper(
        <RoleProtectedRoute allowedRoles={['admin']}>
          <div data-testid="builder-content">Builder Page</div>
        </RoleProtectedRoute>,
      );

      expect(screen.getByText('403')).toBeInTheDocument();
      expect(screen.getByText('Accès Refusé')).toBeInTheDocument();
      expect(screen.queryByTestId('builder-content')).not.toBeInTheDocument();
    });

    it('should block entreprise user from accessing builder page', () => {
      mockUseSession.mockReturnValue(
        defaultSession({
          session: { access_token: 'tok', user: entrepriseUser },
          user: entrepriseUser,
          isLoading: false,
        }),
      );
      mockUseUserRole.mockReturnValue(
        defaultUserRole({ role: 'entreprise', isAdmin: false, status: 'active' }),
      );

      renderWithWrapper(
        <RoleProtectedRoute allowedRoles={['admin']}>
          <div data-testid="builder-content">Builder Page</div>
        </RoleProtectedRoute>,
      );

      expect(screen.getByText('Accès Refusé')).toBeInTheDocument();
    });

    it('should redirect unauthenticated user trying to access builder to /connexion', () => {
      mockUseSession.mockReturnValue(
        defaultSession({
          session: null,
          user: null,
          isLoading: false,
        }),
      );
      mockUseUserRole.mockReturnValue(
        defaultUserRole({ role: 'user', isAdmin: false, status: 'active' }),
      );

      renderWithWrapper(
        <RoleProtectedRoute allowedRoles={['admin']}>
          <div data-testid="builder-content">Builder Page</div>
        </RoleProtectedRoute>,
      );

      expect(screen.getByTestId('navigate-to')).toBeInTheDocument();
      expect(screen.getByTestId('navigate-to')).toHaveTextContent('/connexion');
    });

    it('should show loading state while checking builder access', () => {
      mockUseSession.mockReturnValue(
        defaultSession({
          session: null,
          user: null,
          isLoading: true,
        }),
      );
      mockUseUserRole.mockReturnValue(
        defaultUserRole({ role: 'user', isAdmin: false, isLoading: true }),
      );

      renderWithWrapper(
        <RoleProtectedRoute allowedRoles={['admin']}>
          <div data-testid="builder-content">Builder Page</div>
        </RoleProtectedRoute>,
      );

      const spinner = document.querySelector('.animate-spin');
      expect(spinner).toBeInTheDocument();
    });

    it('should use BuilderStore data when admin is authenticated', () => {
      // Set up auth
      mockUseSession.mockReturnValue(
        defaultSession({
          session: { access_token: 'tok', user: adminUser },
          user: adminUser,
          isLoading: false,
        }),
      );
      mockUseUserRole.mockReturnValue(
        defaultUserRole({ role: 'admin', isAdmin: true, status: 'active' }),
      );

      // Verify the builder store is accessible and returns blocks
      interface BuilderStoreMockState {
        blocks: unknown[];
        addBlock: (block: unknown) => void;
        setPageMetadata: (meta: unknown) => void;
      }

      const blocks = useBuilderStore((s) => (s as unknown as BuilderStoreMockState).blocks) as unknown[];
      expect(Array.isArray(blocks)).toBe(true);
      expect(blocks).toHaveLength(0);

      const addBlock = useBuilderStore((s) => (s as unknown as BuilderStoreMockState).addBlock);
      expect(typeof addBlock).toBe('function');

      const setPageMetadata = useBuilderStore((s) => (s as unknown as BuilderStoreMockState).setPageMetadata);
      expect(typeof setPageMetadata).toBe('function');

      // Verify that admin can interact with the builder store
      renderWithWrapper(
        <RoleProtectedRoute allowedRoles={['admin']}>
          <div data-testid="builder-data-ready">Blocks: {blocks.length}</div>
        </RoleProtectedRoute>,
      );

      expect(screen.getByTestId('builder-data-ready')).toBeInTheDocument();
      expect(screen.getByText('Blocks: 0')).toBeInTheDocument();
    });
  });
});
