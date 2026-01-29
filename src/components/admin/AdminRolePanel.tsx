
import { useSession } from "@/hooks/useSession";
import { useIsAdmin } from "@/hooks/useIsAdmin";
import { useAllUserRoles, useGrantAdminRole, useRevokeAdminRole, UserRole } from "@/hooks/useUserRoles";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table";
import { Loader2 } from "lucide-react";
import UserRoleRow from "./UserRoleRow";
import { useState } from "react";

export default function AdminRolePanel() {
  const { user } = useSession();
  const { isAdmin } = useIsAdmin();
  const { data: users, isLoading, error } = useAllUserRoles();
  const grantAdmin = useGrantAdminRole();
  const revokeAdmin = useRevokeAdminRole();
  const [refresh, setRefresh] = useState(0);

  if (!isAdmin) return null;
  if (isLoading) return <div className="text-proqblue">Chargement des utilisateurs…</div>;
  if (error) return <div className="text-red-600">Erreur chargement : {error.message}</div>;

  return (
    <div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Email/Username</TableHead>
            <TableHead>Rôle actuel</TableHead>
            <TableHead><span className="sr-only">Action</span></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users && users.length === 0 && (
            <TableRow>
              <TableCell colSpan={3} className="text-proqblue">Aucun utilisateur trouvé.</TableCell>
            </TableRow>
          )}
          {users && users.map((userRole: UserRole) =>
            <UserRoleRow
              key={userRole.user_id}
              userRole={userRole}
            />
          )}
        </TableBody>
      </Table>
      {(grantAdmin.isPending || revokeAdmin.isPending) && (
        <div className="text-proqblue mt-2 text-xs flex items-center gap-1">
          <Loader2 className="inline w-4 h-4 animate-spin mr-1" />
          Mise à jour…
        </div>
      )}
    </div>
  );
}
