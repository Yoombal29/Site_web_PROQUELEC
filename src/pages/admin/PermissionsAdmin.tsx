import { useState } from 'react';
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Shield, Users, Key, CheckCircle, XCircle, Hammer, Loader2 } from 'lucide-react';
import { RequirePermission } from '@/components/permissions/RequirePermission';
import { PERMISSION_LABELS } from '@/hooks/usePermissions';
import { useBuilderPermMatrix, patchBuilderPermission } from '@/hooks/useBuilderPermissions';
import { useUserRole } from '@/hooks/useUserRole';
import { useSession } from '@/hooks/useSession';
import { toast } from 'sonner';

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
    'superadmin':       'Super Admin',
    'admin':            'Administrateur',
    'secondary_admin':  'Admin Adjoint',
    'partner':          'Partenaire',
    'electricien':      'Électricien',
    'entreprise':       'Entreprise',
    'membre':           'Membre',
    'user':             'Utilisateur',
};

const ROLE_DESCRIPTIONS: Record<string, string> = {
    'superadmin':       'Accès complet à tout, incluant le God Mode',
    'admin':            'Accès complet sauf JSON brut (God Mode)',
    'secondary_admin':  'Peut accéder au builder et modifier les textes uniquement',
    'installer':        'Gestion des projets et réalisation de diagnostics techniques',
    'client':           'Consultation en lecture seule des projets',
    'authority':        'Validation réglementaire et transition d\'états',
    'partner':          'Partenaire externe — accès limité',
    'electricien':      'Technicien électricien — accès opérationnel',
    'entreprise':       'Compte entreprise — accès métier',
    'membre':           'Membre standard',
    'user':             'Utilisateur de base',
};

// Labels français pour les permissions builder
const BUILDER_PERMISSION_LABELS: Record<string, { label: string; desc: string; icon: string; danger?: boolean }> = {
    'builder.access':           { label: 'Accès au builder',     desc: 'Ouvrir le God Mode Builder',                        icon: '🏗️' },
    'builder.edit_content':     { label: 'Modifier le contenu',  desc: 'Changer textes, images et liens',                   icon: '✏️' },
    'builder.edit_styles':      { label: 'Modifier les styles',  desc: 'Couleurs, marges, typographie, effets',              icon: '🎨' },
    'builder.add_blocks':       { label: 'Ajouter des blocs',    desc: 'Glisser-déposer de nouveaux éléments',              icon: '➕' },
    'builder.delete_blocks':    { label: 'Supprimer des blocs',  desc: 'Retirer des blocs de la page',                      icon: '🗑️', danger: true },
    'builder.publish':          { label: 'Publier les pages',    desc: 'Enregistrer et mettre en ligne',                    icon: '🚀' },
    'builder.manage_templates': { label: 'Gérer les templates',  desc: 'Créer, modifier et supprimer des templates',        icon: '📁' },
    'builder.god_mode':         { label: 'God Mode (JSON/HTML)', desc: 'Accès au code brut, import/export avancé',          icon: '⚡', danger: true },
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

async function patchGlobalPermission(role: string, permission: string, granted: boolean): Promise<void> {
    const token = localStorage.getItem('token');
    const response = await fetch('/api/admin/role-permissions', {
        method: 'PATCH',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ role, permission, granted })
    });
    if (!response.ok) {
        const err = await response.json().catch(() => ({ error: 'Erreur serveur' }));
        throw new Error(err.error || 'Modification impossible');
    }
}

// ─── Composant : Matrice Builder ─────────────────────────────
function BuilderPermissionsMatrix() {
    const { user } = useSession();
    const { role } = useUserRole();
    const isSuperAdmin = role === 'superadmin';
    const isMainSuperAdmin = user?.email === 'oumarkebe@proquelec.sn';
    const queryClient = useQueryClient();

    const { data, isLoading, isError } = useBuilderPermMatrix();

    const mutation = useMutation({
        mutationFn: ({ r, p, g }: { r: string; p: string; g: boolean }) =>
            patchBuilderPermission(r, p, g),
        onSuccess: (_, { r, p, g }) => {
            toast.success(`Permission ${g ? 'accordée' : 'révoquée'} : ${p} → ${ROLE_LABELS[r] || r}`);
            queryClient.invalidateQueries({ queryKey: ['builder-permissions-matrix'] });
            queryClient.invalidateQueries({ queryKey: ['builder-permissions-user'] });
        },
        onError: (err: Error) => {
            toast.error(err.message);
        },
    });

    if (isLoading) return (
        <div className="flex items-center justify-center py-12 gap-3 text-slate-500">
            <Loader2 className="w-5 h-5 animate-spin" />
            Chargement de la matrice…
        </div>
    );

    if (isError || !data) return (
        <div className="py-8 text-center text-red-600 font-medium">
            Impossible de charger la matrice. Vérifiez vos droits superadmin.
        </div>
    );

    const visibleRoles = ['superadmin', 'admin', 'secondary_admin', 'partner', 'electricien', 'entreprise', 'membre'];
    const builderPerms = data.permissions.filter(p => p.category === 'builder');

    const hasRight = (r: string, permName: string) =>
        (data.matrix[r] || []).includes(permName);

    const toggle = (r: string, permName: string, current: boolean) => {
        if (!isMainSuperAdmin) {
            toast.error('Seul le Super Admin principal (oumarkebe@proquelec.sn) peut modifier cette matrice.');
            return;
        }
        mutation.mutate({ r, p: permName, g: !current });
    };

    return (
        <div className="space-y-6">
            {/* En-tête */}
            <div className="flex items-start justify-between">
                <div>
                    <h3 className="text-lg font-bold text-slate-900">Matrice des droits Builder</h3>
                    <p className="text-sm text-slate-500 mt-1">
                        {isMainSuperAdmin
                            ? '✅ Vous êtes le Super Admin principal (oumarkebe@proquelec.sn) — cliquez sur une cellule pour modifier un droit.'
                            : '👁️ Mode lecture seule — seul le Super Admin principal (oumarkebe@proquelec.sn) peut modifier cette matrice.'}
                    </p>
                </div>
                <Badge variant={isMainSuperAdmin ? 'default' : 'outline'} className="text-xs font-semibold">
                    {isMainSuperAdmin ? '⚡ Super Admin principal' : '👁️ Lecture seule'}
                </Badge>
            </div>

            {/* Table */}
            <div className="overflow-x-auto rounded-xl border border-slate-200 shadow-sm">
                <table className="w-full border-collapse text-sm">
                    <thead>
                        <tr className="bg-slate-900 text-white">
                            <th className="text-left p-4 font-semibold min-w-[220px]">Permission</th>
                            {visibleRoles.map(r => (
                                <th key={r} className="text-center p-4 font-semibold min-w-[110px]">
                                    <div>{ROLE_LABELS[r] || r}</div>
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {builderPerms.map((perm, idx) => {
                            const meta = BUILDER_PERMISSION_LABELS[perm.name];
                            return (
                                <tr
                                    key={perm.id}
                                    className={`border-b border-slate-100 ${idx % 2 === 0 ? 'bg-white' : 'bg-slate-50'} ${meta?.danger ? 'border-l-4 border-l-amber-400' : ''}`}
                                >
                                    <td className="p-4">
                                        <div className="flex items-start gap-2">
                                            <span className="text-lg">{meta?.icon || '🔑'}</span>
                                            <div>
                                                <div className="font-semibold text-slate-800">{meta?.label || perm.name}</div>
                                                <div className="text-xs text-slate-500">{meta?.desc || perm.description}</div>
                                                {meta?.danger && (
                                                    <span className="inline-block mt-1 text-[10px] bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded font-bold">SENSIBLE</span>
                                                )}
                                            </div>
                                        </div>
                                    </td>
                                    {visibleRoles.map(r => {
                                        const granted = hasRight(r, perm.name);
                                        const isProtected = r === 'superadmin' && !isMainSuperAdmin; // Seul le superadmin principal peut modifier ses propres droits
                                        const isPending = mutation.isPending &&
                                            mutation.variables?.r === r &&
                                            mutation.variables?.p === perm.name;

                                        return (
                                            <td key={r} className="text-center p-3">
                                                <button
                                                    onClick={() => !isProtected && toggle(r, perm.name, granted)}
                                                    disabled={isProtected || !isMainSuperAdmin || isPending}
                                                    title={
                                                        isProtected ? 'Le Super Admin conserve toujours tous les droits builder (modifiable par oumarkebe@proquelec.sn uniquement)'
                                                        : !isMainSuperAdmin ? 'Lecture seule (réservé à oumarkebe@proquelec.sn)'
                                                        : granted ? `Révoquer pour ${ROLE_LABELS[r]}`
                                                        : `Accorder à ${ROLE_LABELS[r]}`
                                                    }
                                                    className={`
                                                        w-9 h-9 rounded-full flex items-center justify-center mx-auto transition-all
                                                        ${isProtected
                                                            ? 'cursor-not-allowed opacity-80'
                                                            : isMainSuperAdmin
                                                                ? granted
                                                                    ? 'bg-emerald-100 hover:bg-red-100 cursor-pointer hover:scale-110'
                                                                    : 'bg-slate-100 hover:bg-emerald-100 cursor-pointer hover:scale-110'
                                                                : 'cursor-not-allowed'}
                                                    `}
                                                >
                                                    {isPending ? (
                                                        <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
                                                    ) : granted ? (
                                                        <CheckCircle className={`w-5 h-5 ${isProtected ? 'text-emerald-400' : 'text-emerald-600'}`} />
                                                    ) : (
                                                        <XCircle className="w-5 h-5 text-slate-300" />
                                                    )}
                                                </button>
                                            </td>
                                        );
                                    })}
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            <p className="text-xs text-slate-400 flex items-center gap-1.5">
                <span className="inline-block w-3 h-3 bg-amber-400 rounded-sm" />
                Permissions SENSIBLES — modifications irréversibles sans rechargement
            </p>
        </div>
    );
}

// ─── Composant principal ─────────────────────────────────────
export default function PermissionsAdmin() {
    const { user } = useSession();
    const isMainSuperAdmin = user?.email === 'oumarkebe@proquelec.sn';
    const queryClient = useQueryClient();

    const { data: permissions = [], isLoading: loadingPerms } = useQuery({
        queryKey: ['all-permissions'],
        queryFn: fetchAllPermissions
    });

    const { data: roleMappings = [], isLoading: loadingRoles } = useQuery({
        queryKey: ['role-permissions'],
        queryFn: fetchRolePermissions
    });

    const globalMutation = useMutation({
        mutationFn: ({ r, p, g }: { r: string; p: string; g: boolean }) =>
            patchGlobalPermission(r, p, g),
        onSuccess: (_, { r, p, g }) => {
            toast.success(`Permission globale ${g ? 'accordée' : 'révoquée'} : ${p} → ${ROLE_LABELS[r] || r}`);
            queryClient.invalidateQueries({ queryKey: ['role-permissions'] });
        },
        onError: (err: Error) => {
            toast.error(err.message);
        },
    });

    const toggleGlobal = (r: string, permName: string, current: boolean) => {
        if (!isMainSuperAdmin) {
            toast.error('Seul le Super Admin principal peut modifier cette matrice.');
            return;
        }
        globalMutation.mutate({ r, p: permName, g: !current });
    };

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
                        Système de contrôle d'accès basé sur les rôles (RBAC) — incluant les droits du God Mode Builder
                    </p>
                </div>

                <Tabs defaultValue="builder" className="space-y-6">
                    <TabsList>
                        <TabsTrigger value="builder">
                            <Hammer className="w-4 h-4 mr-2" />
                            Builder
                        </TabsTrigger>
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

                    {/* ── ONGLET BUILDER ── */}
                    <TabsContent value="builder">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Hammer className="w-5 h-5 text-indigo-600" />
                                    Droits d'accès au God Mode Builder
                                </CardTitle>
                                <CardDescription>
                                    Contrôlez précisément ce que chaque rôle peut faire dans l'éditeur de pages.
                                    Seul le Super Admin (oumarkebe@proquelec.sn) peut modifier cette matrice.
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <BuilderPermissionsMatrix />
                            </CardContent>
                        </Card>
                    </TabsContent>

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
                                <CardTitle>Matrice de Permissions Globale</CardTitle>
                                <CardDescription>
                                    Vue d'ensemble de toutes les permissions système par rôle
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
                                                    {Object.keys(ROLE_LABELS).map(role => {
                                                        const granted = hasPermission(role, perm.name);
                                                        const isProtected = role === 'superadmin' && !isMainSuperAdmin;
                                                        const isPending = globalMutation.isPending && 
                                                            globalMutation.variables?.r === role && 
                                                            globalMutation.variables?.p === perm.name;
                                                        return (
                                                            <td key={role} className="text-center p-3">
                                                                <button
                                                                    onClick={() => !isProtected && toggleGlobal(role, perm.name, granted)}
                                                                    disabled={isProtected || !isMainSuperAdmin || isPending}
                                                                    title={
                                                                        isProtected ? 'Le Super Admin conserve toujours tous les droits (modifiable par oumarkebe@proquelec.sn uniquement)'
                                                                        : !isMainSuperAdmin ? 'Lecture seule (réservé à oumarkebe@proquelec.sn)'
                                                                        : granted ? `Révoquer pour ${ROLE_LABELS[role]}`
                                                                        : `Accorder à ${ROLE_LABELS[role]}`
                                                                    }
                                                                    className={`
                                                                        w-9 h-9 rounded-full flex items-center justify-center mx-auto transition-all
                                                                        ${isPending ? 'opacity-50 cursor-wait'
                                                                        : isProtected || !isMainSuperAdmin ? 'cursor-not-allowed opacity-60'
                                                                        : 'hover:bg-slate-200 cursor-pointer'}
                                                                    `}
                                                                >
                                                                    {isPending ? (
                                                                        <Loader2 className="w-5 h-5 animate-spin text-slate-400" />
                                                                    ) : granted ? (
                                                                        <CheckCircle className="w-5 h-5 text-emerald-600" />
                                                                    ) : (
                                                                        <XCircle className="w-5 h-5 text-slate-300" />
                                                                    )}
                                                                </button>
                                                            </td>
                                                        );
                                                    })}
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
