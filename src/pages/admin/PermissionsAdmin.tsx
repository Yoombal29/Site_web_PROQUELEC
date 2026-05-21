import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Shield, Users, Key, CheckCircle, XCircle } from 'lucide-react';
import { RequirePermission } from '@/components/permissions/RequirePermission';
import { PERMISSION_LABELS } from '@/hooks/usePermissions';

interface Permission {
    id: number;
    name: string;
    description: string;
    category: string;
}

interface RolePermissionMapping {
    role: string;
    permissions: string[];
}

const ROLE_LABELS: Record<string, string> = {
    'admin': 'Administrateur',
    'installer': 'Installateur',
    'client': 'Client',
    'authority': 'Autorité Réglementaire'
};

const ROLE_DESCRIPTIONS: Record<string, string> = {
    'admin': 'Accès complet au système, gestion des utilisateurs et paramètres',
    'installer': 'Gestion des projets et réalisation de diagnostics techniques',
    'client': 'Consultation en lecture seule des projets',
    'authority': 'Validation réglementaire et transition d\'états'
};

async function fetchAllPermissions(): Promise<Permission[]> {
    const token = localStorage.getItem('token');
    const response = await fetch('/api/admin/permissions', {
        headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!response.ok) throw new Error('Erreur de chargement');
    return response.json();
}

async function fetchRolePermissions(): Promise<RolePermissionMapping[]> {
    const token = localStorage.getItem('token');
    const response = await fetch('/api/admin/role-permissions', {
        headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!response.ok) throw new Error('Erreur de chargement');
    return response.json();
}

export default function PermissionsAdmin() {
    const { data: permissions = [], isLoading: loadingPerms } = useQuery({
        queryKey: ['all-permissions'],
        queryFn: fetchAllPermissions
    });

    const { data: roleMappings = [], isLoading: loadingRoles } = useQuery({
        queryKey: ['role-permissions'],
        queryFn: fetchRolePermissions
    });

    const categories = Array.from(new Set(permissions.map(p => p.category)));

    const getRolePermissions = (role: string): string[] => {
        const mapping = roleMappings.find(m => m.role === role);
        return mapping?.permissions || [];
    };

    const hasPermission = (role: string, permissionName: string): boolean => {
        return getRolePermissions(role).includes(permissionName);
    };

    return (
        <RequirePermission
            permission="admin.permissions"
            showMessage
        >
            <div className="container mx-auto px-6 py-8">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center gap-3 mb-2">
                        <Shield className="w-8 h-8 text-blue-600" />
                        <h1 className="text-3xl font-black text-slate-900">
                            Gestion des Permissions
                        </h1>
                    </div>
                    <p className="text-slate-600">
                        Système de contrôle d'accès basé sur les rôles (RBAC) pour Authority 2.0
                    </p>
                </div>

                <Tabs defaultValue="by-role" className="space-y-6">
                    <TabsList>
                        <TabsTrigger value="by-role">
                            <Users className="w-4 h-4 mr-2" />
                            Par Rôle
                        </TabsTrigger>
                        <TabsTrigger value="by-permission">
                            <Key className="w-4 h-4 mr-2" />
                            Par Permission
                        </TabsTrigger>
                        <TabsTrigger value="matrix">
                            <Shield className="w-4 h-4 mr-2" />
                            Matrice Complète
                        </TabsTrigger>
                    </TabsList>

                    {/* Vue par rôle */}
                    <TabsContent value="by-role" className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {Object.entries(ROLE_LABELS).map(([role, label]) => (
                                <Card key={role} className="border-2">
                                    <CardHeader>
                                        <div className="flex items-center justify-between">
                                            <CardTitle className="text-xl">{label}</CardTitle>
                                            <Badge variant="outline" className="text-xs">
                                                {getRolePermissions(role).length} permissions
                                            </Badge>
                                        </div>
                                        <CardDescription>
                                            {ROLE_DESCRIPTIONS[role]}
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-2">
                                            {getRolePermissions(role).map(perm => (
                                                <div
                                                    key={perm}
                                                    className="flex items-center gap-2 p-2 bg-slate-50 rounded text-sm"
                                                >
                                                    <CheckCircle className="w-4 h-4 text-emerald-600" />
                                                    <span className="font-medium">
                                                        {PERMISSION_LABELS[perm] || perm}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </TabsContent>

                    {/* Vue par permission */}
                    <TabsContent value="by-permission" className="space-y-6">
                        {categories.map(category => {
                            const categoryPerms = permissions.filter(p => p.category === category);
                            return (
                                <Card key={category}>
                                    <CardHeader>
                                        <CardTitle className="capitalize">{category}</CardTitle>
                                        <CardDescription>
                                            {categoryPerms.length} permission(s) dans cette catégorie
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="grid gap-3">
                                            {categoryPerms.map(perm => (
                                                <div
                                                    key={perm.id}
                                                    className="border rounded-lg p-4"
                                                >
                                                    <div className="flex items-center justify-between mb-2">
                                                        <h4 className="font-semibold">
                                                            {PERMISSION_LABELS[perm.name] || perm.name}
                                                        </h4>
                                                        <code className="text-xs bg-slate-100 px-2 py-1 rounded">
                                                            {perm.name}
                                                        </code>
                                                    </div>
                                                    <p className="text-sm text-slate-600 mb-3">
                                                        {perm.description}
                                                    </p>
                                                    <div className="flex gap-2">
                                                        {Object.keys(ROLE_LABELS).map(role => (
                                                            <Badge
                                                                key={role}
                                                                variant={hasPermission(role, perm.name) ? 'default' : 'outline'}
                                                                className="text-xs"
                                                            >
                                                                {ROLE_LABELS[role]}
                                                            </Badge>
                                                        ))}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </TabsContent>

                    {/* Matrice complète */}
                    <TabsContent value="matrix">
                        <Card>
                            <CardHeader>
                                <CardTitle>Matrice de Permissions</CardTitle>
                                <CardDescription>
                                    Vue d'ensemble de toutes les permissions par rôle
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="overflow-x-auto">
                                    <table className="w-full border-collapse">
                                        <thead>
                                            <tr className="border-b-2">
                                                <th className="text-left p-3 font-bold">Permission</th>
                                                {Object.entries(ROLE_LABELS).map(([role, label]) => (
                                                    <th key={role} className="text-center p-3 font-bold">
                                                        {label}
                                                    </th>
                                                ))}
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {permissions.map(perm => (
                                                <tr key={perm.id} className="border-b hover:bg-slate-50">
                                                    <td className="p-3">
                                                        <div>
                                                            <div className="font-medium">
                                                                {PERMISSION_LABELS[perm.name] || perm.name}
                                                            </div>
                                                            <div className="text-xs text-slate-500">
                                                                {perm.name}
                                                            </div>
                                                        </div>
                                                    </td>
                                                    {Object.keys(ROLE_LABELS).map(role => (
                                                        <td key={role} className="text-center p-3">
                                                            {hasPermission(role, perm.name) ? (
                                                                <CheckCircle className="w-5 h-5 text-emerald-600 mx-auto" />
                                                            ) : (
                                                                <XCircle className="w-5 h-5 text-slate-300 mx-auto" />
                                                            )}
                                                        </td>
                                                    ))}
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </RequirePermission>
    );
}
