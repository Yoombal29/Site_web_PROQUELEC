import { useQuery } from '@tanstack/react-query';
import { useUserRole } from './useUserRole';

// ─── Types ──────────────────────────────────────────────────
export interface BuilderCapabilities {
  canAccess: boolean;
  canEditContent: boolean;
  canEditStyles: boolean;
  canAddBlocks: boolean;
  canDeleteBlocks: boolean;
  canPublish: boolean;
  canManageTemplates: boolean;
  isGodMode: boolean;
  isLoading: boolean;
  permissions: string[];
}

// ─── Fallback statique par rôle (utilisé si l'API est indisponible) ───
const ROLE_FALLBACK: Record<string, string[]> = {
  superadmin: [
    'builder.access', 'builder.edit_content', 'builder.edit_styles',
    'builder.add_blocks', 'builder.delete_blocks', 'builder.publish',
    'builder.manage_templates', 'builder.god_mode',
  ],
  admin: [
    'builder.access', 'builder.edit_content', 'builder.edit_styles',
    'builder.add_blocks', 'builder.delete_blocks', 'builder.publish',
    'builder.manage_templates',
  ],
  secondary_admin: ['builder.access', 'builder.edit_content'],
};

// ─── Fetcher ─────────────────────────────────────────────────
async function fetchBuilderPermissions(): Promise<string[]> {
  const token = localStorage.getItem('token');
  if (!token) return [];

  const res = await fetch('/api/admin/builder-permissions/user', {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) throw new Error('Impossible de charger les permissions builder');

  const data = await res.json();
  return data.permissions || [];
}

// ─── Hook principal ──────────────────────────────────────────
export function useBuilderPermissions(): BuilderCapabilities {
  const { role, isLoading: roleLoading } = useUserRole();

  const {
    data: apiPermissions,
    isLoading: permsLoading,
    isError,
  } = useQuery({
    queryKey: ['builder-permissions-user'],
    queryFn: fetchBuilderPermissions,
    staleTime: 2 * 60 * 1000, // 2 minutes de cache
    retry: 1,
  });

  // Si l'API échoue, on utilise le fallback par rôle
  const permissions: string[] = isError
    ? (ROLE_FALLBACK[role] ?? [])
    : (apiPermissions ?? []);

  const has = (p: string) => permissions.includes(p);

  return {
    canAccess:           has('builder.access'),
    canEditContent:      has('builder.edit_content'),
    canEditStyles:       has('builder.edit_styles'),
    canAddBlocks:        has('builder.add_blocks'),
    canDeleteBlocks:     has('builder.delete_blocks'),
    canPublish:          has('builder.publish'),
    canManageTemplates:  has('builder.manage_templates'),
    isGodMode:           has('builder.god_mode'),
    isLoading:           roleLoading || permsLoading,
    permissions,
  };
}

// ─── Hook admin : récupère la matrice complète ───────────────
export interface BuilderPermMatrix {
  permissions: { id: number; name: string; description: string; category: string }[];
  matrix: Record<string, string[]>;  // { role → ['builder.access', ...] }
  roles: string[];
  superadmin_email: string;
}

async function fetchBuilderPermMatrix(): Promise<BuilderPermMatrix> {
  const token = localStorage.getItem('token');
  const res = await fetch('/api/admin/builder-permissions', {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error('Accès refusé ou erreur serveur');
  return res.json();
}

export function useBuilderPermMatrix() {
  return useQuery({
    queryKey: ['builder-permissions-matrix'],
    queryFn: fetchBuilderPermMatrix,
    staleTime: 30 * 1000,
  });
}

// ─── Mutation : modifier un droit dans la matrice ────────────
export async function patchBuilderPermission(
  role: string,
  permission: string,
  granted: boolean,
): Promise<void> {
  const token = localStorage.getItem('token');
  const res = await fetch('/api/admin/builder-permissions', {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ role, permission, granted }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Erreur serveur' }));
    throw new Error(err.error || 'Modification impossible');
  }
}
