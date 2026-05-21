import { useQuery } from '@tanstack/react-query';

export interface Permission {
    id: number;
    name: string;
    description: string;
    category: string;
}

export interface RolePermissions {
    role: string;
    permissions: Permission[];
}

// Traduction des noms de permissions en français
export const PERMISSION_LABELS: Record<string, string> = {
    // Projets
    'projects.view': 'Voir les projets',
    'projects.create': 'Créer des projets',
    'projects.edit': 'Modifier les projets',
    'projects.delete': 'Supprimer les projets',
    'projects.transition': 'Changer le statut réglementaire',

    // Diagnostics & Audits
    'inspections.view': 'Voir les diagnostics',
    'inspections.create': 'Créer des diagnostics',
    'inspections.edit': 'Modifier les diagnostics',
    'inspections.validate': 'Valider les diagnostics',
    'inspections.delete': 'Supprimer les diagnostics',

    // Audit
    'audit.view': 'Consulter le journal d\'audit',
    'audit.export': 'Exporter les journaux d\'audit',

    // Documents
    'documents.upload': 'Téléverser des documents',
    'documents.delete': 'Supprimer des documents',

    // Administration
    'admin.users': 'Gérer les utilisateurs',
    'admin.settings': 'Gérer les paramètres',
    'admin.permissions': 'Gérer les permissions'
};

// Récupérer les permissions de l'utilisateur connecté
async function fetchUserPermissions(): Promise<string[]> {
    const token = localStorage.getItem('token');
    if (!token) return [];

    const response = await fetch('/api/user/permissions', {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });

    if (!response.ok) {
        throw new Error('Impossible de récupérer les permissions');
    }

    const data = await response.json();
    return data.permissions || [];
}

// Hook principal pour vérifier les permissions
export function usePermissions() {
    const { data: permissions = [], isLoading } = useQuery({
        queryKey: ['user-permissions'],
        queryFn: fetchUserPermissions,
        staleTime: 5 * 60 * 1000, // Cache 5 minutes
    });

    const hasPermission = (permissionName: string): boolean => {
        return permissions.includes(permissionName);
    };

    const hasAnyPermission = (permissionNames: string[]): boolean => {
        return permissionNames.some(p => permissions.includes(p));
    };

    const hasAllPermissions = (permissionNames: string[]): boolean => {
        return permissionNames.every(p => permissions.includes(p));
    };

    return {
        permissions,
        isLoading,
        hasPermission,
        hasAnyPermission,
        hasAllPermissions
    };
}
