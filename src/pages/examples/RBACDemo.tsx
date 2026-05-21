// 🇫🇷 Exemple d'Utilisation du Système RBAC
// Ce composant montre toutes les façons d'utiliser les permissions dans une page

import { RequirePermission, RequireAnyPermission } from '@/components/permissions/RequirePermission';
import { usePermissions, PERMISSION_LABELS } from '@/hooks/usePermissions';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Shield, Lock, CheckCircle, XCircle } from 'lucide-react';

export default function RBACDemo() {
    const { permissions, hasPermission, hasAnyPermission, isLoading } = usePermissions();

    if (isLoading) {
        return <div className="p-8 text-center">Chargement des permissions...</div>;
    }

    return (
        <div className="container mx-auto px-6 py-8">
            <div className="mb-8">
                <h1 className="text-3xl font-black text-slate-900 mb-2">
                    🇫🇷 Démo RBAC - Contrôle d'Accès Français
                </h1>
                <p className="text-slate-600">
                    Cette page démontre toutes les fonctionnalités du système RBAC en français
                </p>
            </div>

            <div className="grid gap-6">
                {/* 1. État des Permissions Actuelles */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Shield className="w-5 h-5 text-blue-600" />
                            Vos Permissions Actuelles
                        </CardTitle>
                        <CardDescription>
                            Vous disposez de {permissions.length} permission(s)
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                            {permissions.map(perm => (
                                <div key={perm} className="flex items-center gap-2 p-2 bg-emerald-50 rounded border border-emerald-200">
                                    <CheckCircle className="w-4 h-4 text-emerald-600" />
                                    <span className="text-sm font-medium">
                                        {PERMISSION_LABELS[perm] || perm}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* 2. Bouton Masqué (RequirePermission) */}
                <Card>
                    <CardHeader>
                        <CardTitle>Exemple 1 : Masquer Complètement</CardTitle>
                        <CardDescription>
                            Le bouton "Créer un Projet" n'apparaît que si vous avez la permission <code>projects.create</code>
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <RequirePermission permission="projects.create">
                            <Button className="w-full">
                                ✅ Créer un Projet (Vous avez la permission)
                            </Button>
                        </RequirePermission>

                        {!hasPermission('projects.create') && (
                            <div className="text-sm text-slate-500 p-3 bg-slate-50 rounded border">
                                💡 Vous ne voyez pas le bouton car vous n'avez pas la permission <strong>projects.create</strong>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* 3. Message d'Erreur (showMessage) */}
                <Card>
                    <CardHeader>
                        <CardTitle>Exemple 2 : Afficher un Message d'Erreur</CardTitle>
                        <CardDescription>
                            Avec <code>showMessage={'{true}'}</code>, un message d'avertissement s'affiche au lieu de masquer
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <RequirePermission permission="projects.delete" showMessage>
                            <Button variant="destructive" className="w-full">
                                Supprimer le Projet
                            </Button>
                        </RequirePermission>
                    </CardContent>
                </Card>

                {/* 4. Fallback Personnalisé */}
                <Card>
                    <CardHeader>
                        <CardTitle>Exemple 3 : Fallback Personnalisé</CardTitle>
                        <CardDescription>
                            Affiche un contenu alternatif si la permission est refusée
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <RequirePermission
                            permission="admin.permissions"
                            fallback={
                                <div className="flex items-center gap-3 p-4 bg-amber-50 border border-amber-200 rounded">
                                    <Lock className="w-8 h-8 text-amber-600" />
                                    <div>
                                        <h4 className="font-semibold text-amber-900">Accès Administrateur Requis</h4>
                                        <p className="text-sm text-amber-700">
                                            Cette section est réservée aux administrateurs. Contactez votre gestionnaire pour obtenir l'accès.
                                        </p>
                                    </div>
                                </div>
                            }
                        >
                            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded">
                                <h4 className="font-semibold text-emerald-900">Panneau Administrateur</h4>
                                <p className="text-sm text-emerald-700">Vous avez accès aux fonctionnalités d'administration.</p>
                            </div>
                        </RequirePermission>
                    </CardContent>
                </Card>

                {/* 5. Permissions Multiples (OR) */}
                <Card>
                    <CardHeader>
                        <CardTitle>Exemple 4 : Au Moins Une Permission (OR)</CardTitle>
                        <CardDescription>
                            Visible si vous avez <code>projects.edit</code> OU <code>projects.delete</code>
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <RequireAnyPermission permissions={['projects.edit', 'projects.delete']}>
                            <Button variant="outline" className="w-full">
                                Actions sur le Projet (Modifier ou Supprimer)
                            </Button>
                        </RequireAnyPermission>

                        {!hasAnyPermission(['projects.edit', 'projects.delete']) && (
                            <div className="text-sm text-slate-500 p-3 bg-slate-50 rounded border">
                                💡 Vous n'avez ni la permission <strong>projects.edit</strong> ni <strong>projects.delete</strong>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* 6. Vérification Conditionnelle (Hook) */}
                <Card>
                    <CardHeader>
                        <CardTitle>Exemple 5 : Vérification Conditionnelle (Hook)</CardTitle>
                        <CardDescription>
                            Utilisation directe du hook <code>usePermissions()</code> dans votre logique
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {['projects.view', 'projects.create', 'projects.edit', 'projects.delete', 'projects.transition'].map(perm => (
                                <div key={perm} className="flex items-center justify-between p-3 bg-slate-50 rounded border">
                                    <span className="font-medium text-sm">
                                        {PERMISSION_LABELS[perm] || perm}
                                    </span>
                                    {hasPermission(perm) ? (
                                        <Badge variant="default" className="bg-emerald-600">
                                            <CheckCircle className="w-3 h-3 mr-1" />
                                            Autorisé
                                        </Badge>
                                    ) : (
                                        <Badge variant="outline" className="text-slate-400">
                                            <XCircle className="w-3 h-3 mr-1" />
                                            Refusé
                                        </Badge>
                                    )}
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* 7. Code Source */}
                <Card>
                    <CardHeader>
                        <CardTitle>Code Source</CardTitle>
                        <CardDescription>
                            Consultez le fichier <code>src/pages/examples/RBACDemo.tsx</code> pour voir le code complet
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <pre className="bg-slate-900 text-slate-50 p-4 rounded overflow-x-auto text-xs">
                            {`import { RequirePermission } from '@/components/permissions/RequirePermission';
import { usePermissions } from '@/hooks/usePermissions';

function MonComposant() {
    const { hasPermission } = usePermissions();

    return (
        <RequirePermission permission="projects.create">
            <Button>Créer un Projet</Button>
        </RequirePermission>
    );
}`}
                        </pre>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
