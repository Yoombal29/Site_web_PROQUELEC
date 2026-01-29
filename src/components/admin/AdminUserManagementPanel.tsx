
import React, { useState, useMemo } from "react";
import { useAllUserRoles, useGrantAdminRole, useRevokeAdminRole } from "@/hooks/useUserRoles";
import { Loader2, Users, UserCheck, UserX, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export default function AdminUserManagementPanel() {
  const { data: userRoles, isLoading } = useAllUserRoles();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const filteredUsers = useMemo(() => {
    if (!userRoles) return [];
    return userRoles.filter(u =>
      u.email?.toLowerCase().includes(search.toLowerCase())
    );
  }, [userRoles, search]);
  const totalPages = useMemo(() => Math.ceil(filteredUsers.length / pageSize), [filteredUsers]);
  const paginatedUsers = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredUsers.slice(start, start + pageSize);
  }, [filteredUsers, page]);
  const grantAdminMutation = useGrantAdminRole();
  const revokeAdminMutation = useRevokeAdminRole();

  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-8">
        <Loader2 className="animate-spin h-8 w-8 text-proqblue" />
      </div>
    );
  }

  const handleGrantAdmin = (userId: string) => {
    grantAdminMutation.mutate(userId);
  };

  const handleRevokeAdmin = (userId: string) => {
    revokeAdminMutation.mutate(userId);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <Users className="h-5 w-5 text-proqblue" />
        <h3 className="text-lg font-semibold text-proqblue-dark">Gestion des utilisateurs</h3>
      </div>
      
      <div className="bg-gray-50 p-4 rounded-lg">
        <p className="text-sm text-gray-600 mb-4">
          Gérez les droits d'administration des utilisateurs. Seuls les administrateurs peuvent accéder au dashboard.
        </p>
        <input
          type="text"
          placeholder="Rechercher par email..."
          value={search}
          onChange={e => { setSearch(e.target.value); setPage(1); }}
          className="mb-4 px-3 py-2 border rounded w-full max-w-xs text-sm"
        />
        {paginatedUsers && paginatedUsers.length > 0 ? (
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Email</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedUsers.map((userRole) => (
                  <TableRow key={userRole.user_id}>
                    <TableCell className="font-medium">{userRole.email}</TableCell>
                    <TableCell>
                      {userRole.is_admin ? (
                        <Badge variant="default" className="bg-green-100 text-green-800">
                          <Shield className="w-3 h-3 mr-1" />
                          Administrateur
                        </Badge>
                      ) : (
                        <Badge variant="secondary">Utilisateur</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      {userRole.is_admin ? (
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="outline" size="sm" disabled={revokeAdminMutation.isPending}>
                              <UserX className="h-4 w-4 mr-1" />
                              Révoquer
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Révoquer les droits administrateur</AlertDialogTitle>
                              <AlertDialogDescription>
                                Êtes-vous sûr de vouloir retirer les droits d'administrateur à {userRole.email} ?
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Annuler</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleRevokeAdmin(userRole.user_id)}>
                                Révoquer
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      ) : (
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => handleGrantAdmin(userRole.user_id)}
                          disabled={grantAdminMutation.isPending}
                        >
                          <UserCheck className="h-4 w-4 mr-1" />
                          Promouvoir
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {totalPages > 1 && (
              <div className="flex justify-center mt-4">
                <Pagination>
                  <PaginationContent>
                    {Array.from({ length: totalPages }, (_, i) => (
                      <PaginationItem key={i}>
                        <PaginationLink
                          isActive={page === i + 1}
                          href="#"
                          onClick={e => {
                            e.preventDefault();
                            setPage(i + 1);
                          }}
                        >
                          {i + 1}
                        </PaginationLink>
                      </PaginationItem>
                    ))}
                  </PaginationContent>
                </Pagination>
              </div>
            )}
          </>
        ) : (
          <p className="text-center text-gray-500 py-6">Aucun utilisateur enregistré.</p>
        )}
      </div>
    </div>
  );
}
