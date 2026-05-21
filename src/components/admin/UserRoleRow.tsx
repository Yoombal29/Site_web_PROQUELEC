
import React from 'react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useGrantAdminRole, useRevokeAdminRole } from '@/hooks/useUserRoles';
import { useToast } from "@/hooks/use-toast";

interface UserRoleRowProps {
  userRole: UserRole;
}

const UserRoleRow: React.FC<UserRoleRowProps> = ({ userRole }) => {
  const grantAdminRole = useGrantAdminRole();
  const revokeAdminRole = useRevokeAdminRole();
  const { toast } = useToast();

  const handleToggleAdmin = async () => {
    try {
      if (userRole.is_admin) {
        await revokeAdminRole.mutateAsync(userRole.user_id);
        toast({ title: "Rôle admin retiré avec succès" });
      } else {
        await grantAdminRole.mutateAsync(userRole.user_id);
        toast({ title: "Rôle admin accordé avec succès" });
      }
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de modifier le rôle",
        variant: "destructive"
      });
    }
  };

  return (
    <tr className="border-b">
      <td className="px-4 py-2">{userRole.email}</td>
      <td className="px-4 py-2">
        <Badge variant={userRole.is_admin ? "default" : "secondary"}>
          {userRole.is_admin ? "Admin" : "Utilisateur"}
        </Badge>
      </td>
      <td className="px-4 py-2">
        <Button
          size="sm"
          variant={userRole.is_admin ? "destructive" : "default"}
          onClick={handleToggleAdmin}
          disabled={grantAdminRole.isPending || revokeAdminRole.isPending}>
          
          {userRole.is_admin ? "Retirer admin" : "Donner admin"}
        </Button>
      </td>
    </tr>);

};

export default UserRoleRow;