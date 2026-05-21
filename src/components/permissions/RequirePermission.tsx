import { ReactNode } from 'react';
import { usePermissions, PERMISSION_LABELS } from '@/hooks/usePermissions';
import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface RequirePermissionProps {
    permission: string;
    children: ReactNode;
    fallback?: ReactNode;
    showMessage?: boolean; // Afficher un message d'erreur au lieu de masquer
}

/**
 * Composant pour afficher conditionnellement du contenu selon les permissions.
 * 
 * Exemples d'utilisation :
 * 
 * // Masquer complètement le bouton si pas de permission
 * <RequirePermission permission="projects.create">
 *   <Button>Créer un projet</Button>
 * </RequirePermission>
 * 
 * // Afficher un message d'erreur si pas de permission
 * <RequirePermission permission="projects.delete" showMessage>
 *   <Button variant="destructive">Supprimer</Button>
 * </RequirePermission>
 * 
 * // Afficher un fallback personnalisé
 * <RequirePermission 
 *   permission="admin.settings"
 *   fallback={<p>Accès réservé aux administrateurs</p>}
 * >
 *   <SettingsPanel />
 * </RequirePermission>
 */
export function RequirePermission({
    permission,
    children,
    fallback = null,
    showMessage = false
}: RequirePermissionProps) {
    const { hasPermission, isLoading } = usePermissions();

    // Pendant le chargement, ne rien afficher
    if (isLoading) {
        return null;
    }

    // Si l'utilisateur a la permission, afficher le contenu
    if (hasPermission(permission)) {
        return <>{children}</>;
    }

    // Si pas de permission et showMessage=true, afficher un message d'avertissement
    if (showMessage) {
        const permissionLabel = PERMISSION_LABELS[permission] || permission;
        return (
            <Alert variant="destructive" className="my-4">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Accès refusé</AlertTitle>
                <AlertDescription>
                    Vous n'avez pas la permission requise : <strong>{permissionLabel}</strong>
                </AlertDescription>
            </Alert>
        );
    }

    // Sinon, afficher le fallback ou masquer complètement
    return <>{fallback}</>;
}

interface RequireAnyPermissionProps {
    permissions: string[];
    children: ReactNode;
    fallback?: ReactNode;
}

/**
 * Affiche le contenu si l'utilisateur a AU MOINS UNE des permissions listées.
 * 
 * Exemple :
 * <RequireAnyPermission permissions={['projects.edit', 'projects.delete']}>
 *   <ProjectActionsMenu />
 * </RequireAnyPermission>
 */
export function RequireAnyPermission({
    permissions,
    children,
    fallback = null
}: RequireAnyPermissionProps) {
    const { hasAnyPermission, isLoading } = usePermissions();

    if (isLoading) return null;

    return hasAnyPermission(permissions) ? <>{children}</> : <>{fallback}</>;
}

interface RequireAllPermissionsProps {
    permissions: string[];
    children: ReactNode;
    fallback?: ReactNode;
}

/**
 * Affiche le contenu seulement si l'utilisateur a TOUTES les permissions listées.
 * 
 * Exemple :
 * <RequireAllPermissions permissions={['projects.edit', 'inspections.create']}>
 *   <AdvancedProjectEditor />
 * </RequireAllPermissions>
 */
export function RequireAllPermissions({
    permissions,
    children,
    fallback = null
}: RequireAllPermissionsProps) {
    const { hasAllPermissions, isLoading } = usePermissions();

    if (isLoading) return null;

    return hasAllPermissions(permissions) ? <>{children}</> : <>{fallback}</>;
}
