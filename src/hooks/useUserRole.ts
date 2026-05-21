
import { useSession } from "./useSession";

export type AppRole = 'admin' | 'secondary_admin' | 'partner' | 'electricien' | 'entreprise' | 'membre' | 'user';

export function useUserRole() {
    const { user, isLoading } = useSession();
    const role = (user?.role as AppRole) || 'user';

    return {
        role,
        status: user?.is_active ? 'active' : 'pending',
        isAdmin: role === 'admin',
        isSecondaryAdmin: role === 'secondary_admin',
        isPartner: role === 'partner',
        isPending: !user?.is_active,
        isLoading,
        error: null
    };
}
