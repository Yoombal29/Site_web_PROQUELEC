import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Shield, Users, User, Trash2, Plus, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface Permission {
  id: string;
  permission_type: 'user' | 'group';
  permission_target: string;
  target_name: string;
  access_level: 'read' | 'write' | 'delete' | 'admin';
  granted_at: string;
}

interface PermissionEditorProps {
  documentId: string;
  documentName: string;
  onClose: () => void;
}

export function PermissionEditor({ documentId, documentName, onClose }: PermissionEditorProps) {
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [users, setUsers] = useState<unknown[]>([]);
  const [groups, setGroups] = useState<unknown[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);

  // Add permission form state
  const [newPermission, setNewPermission] = useState({
    targetType: 'user' as 'user' | 'group',
    targetId: '',
    accessLevel: 'read' as 'read' | 'write' | 'delete' | 'admin'
  });

  useEffect(() => {
    loadData();
  }, [documentId]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');

      // Load permissions
      const permRes = await fetch(`/api/permissions/document/${documentId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const permData = await permRes.json();
      if (Array.isArray(permData)) {
        setPermissions(permData);
      } else {
        setPermissions([]);
        console.error("Permissions data is not an array:", permData);
      }

      // Load users
      const usersRes = await fetch('/api/users', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const usersData = await usersRes.json();
      if (Array.isArray(usersData)) {
        setUsers(usersData);
      } else {
        setUsers([]);
        console.error("Users data is not an array:", usersData);
      }

      // Load groups
      const groupsRes = await fetch('/api/permissions/groups', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const groupsData = await groupsRes.json();
      if (Array.isArray(groupsData)) {
        setGroups(groupsData);
      } else {
        setGroups([]);
        console.error("Groups data is not an array:", groupsData);
      }

    } catch (error) {
      console.error('Error loading permissions:', error);
      toast.error('Erreur de chargement des permissions');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGrantPermission = async () => {
    if (!newPermission.targetId) {
      toast.error('Veuillez sélectionner un utilisateur ou groupe');
      return;
    }

    setIsAdding(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/permissions/grant', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          documentId,
          targetType: newPermission.targetType,
          targetId: newPermission.targetId,
          accessLevel: newPermission.accessLevel
        })
      });

      if (response.ok) {
        toast.success('Permission accordée');
        loadData();
        setNewPermission({ targetType: 'user', targetId: '', accessLevel: 'read' });
      } else {
        toast.error('Erreur lors de l\'ajout de la permission');
      }
    } catch (error) {
      console.error('Error granting permission:', error);
      toast.error('Erreur réseau');
    } finally {
      setIsAdding(false);
    }
  };

  const handleRevokePermission = async (permissionId: string) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/permissions/revoke/${permissionId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        toast.success('Permission révoquée');
        loadData();
      } else {
        toast.error('Erreur lors de la révocation');
      }
    } catch (error) {
      console.error('Error revoking permission:', error);
      toast.error('Erreur réseau');
    }
  };

  const getAccessLevelColor = (level: string) => {
    switch (level) {
      case 'admin':return 'bg-purple-600 text-white';
      case 'delete':return 'bg-red-600 text-white';
      case 'write':return 'bg-blue-600 text-white';
      case 'read':return 'bg-gray-600 text-white';
      default:return 'bg-gray-400 text-white';
    }
  };

  const getAccessLevelLabel = (level: string) => {
    switch (level) {
      case 'admin':return 'Administrateur';
      case 'delete':return 'Supprimer';
      case 'write':return 'Modifier';
      case 'read':return 'Lecture';
      default:return level;
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
            <DialogContent className="max-w-2xl max-h-[80vh]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Shield className="h-5 w-5 text-proqblue" />
                        Permissions - {documentName}
                    </DialogTitle>
                </DialogHeader>

                {isLoading ?
        <div className="flex items-center justify-center py-12">
                        <Loader2 className="h-8 w-8 animate-spin text-proqblue" />
                    </div> :

        <div className="space-y-6">
                        {/* Add Permission Section */}
                        <div className="border rounded-lg p-4 bg-slate-50">
                            <h3 className="font-semibold mb-3 flex items-center gap-2">
                                <Plus className="h-4 w-4" />
                                Ajouter une permission
                            </h3>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                <Select
                value={newPermission.targetType}
                onValueChange={(value: 'user' | 'group') =>
                setNewPermission({ ...newPermission, targetType: value, targetId: '' })
                }>
                
                                    <SelectTrigger className="bg-white text-gray-900 border-gray-300">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent className="bg-white text-gray-900 border-gray-300">
                                        <SelectItem value="user" className="text-gray-900 focus:bg-gray-100 cursor-pointer">
                                            <div className="flex items-center gap-2">
                                                <User className="h-4 w-4" />
                                                Utilisateur
                                            </div>
                                        </SelectItem>
                                        <SelectItem value="group" className="text-gray-900 focus:bg-gray-100 cursor-pointer">
                                            <div className="flex items-center gap-2">
                                                <Users className="h-4 w-4" />
                                                Groupe
                                            </div>
                                        </SelectItem>
                                    </SelectContent>
                                </Select>

                                <Select
                value={newPermission.targetId}
                onValueChange={(value) => setNewPermission({ ...newPermission, targetId: value })}>
                
                                    <SelectTrigger className="bg-white text-gray-900 border-gray-300">
                                        <SelectValue placeholder={`Sélectionner ${newPermission.targetType === 'user' ? 'utilisateur' : 'groupe'}`} />
                                    </SelectTrigger>
                                    <SelectContent className="bg-white text-gray-900 border-gray-300">
                                        {newPermission.targetType === 'user' ?
                  users.map((u) =>
                  <SelectItem key={u.id} value={u.id} className="text-gray-900 focus:bg-gray-100 cursor-pointer">{u.username}</SelectItem>
                  ) :
                  groups.map((g) =>
                  <SelectItem key={g.id} value={g.id} className="text-gray-900 focus:bg-gray-100 cursor-pointer">{g.name}</SelectItem>
                  )
                  }
                                    </SelectContent>
                                </Select>

                                <Select
                value={newPermission.accessLevel}
                onValueChange={(value: unknown) => setNewPermission({ ...newPermission, accessLevel: value })}>
                
                                    <SelectTrigger className="bg-white text-gray-900 border-gray-300">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent className="bg-white text-gray-900 border-gray-300">
                                        <SelectItem value="read" className="text-gray-900 focus:bg-gray-100 cursor-pointer">Lecture</SelectItem>
                                        <SelectItem value="write" className="text-gray-900 focus:bg-gray-100 cursor-pointer">Modifier</SelectItem>
                                        <SelectItem value="delete" className="text-gray-900 focus:bg-gray-100 cursor-pointer">Supprimer</SelectItem>
                                        <SelectItem value="admin" className="text-gray-900 focus:bg-gray-100 cursor-pointer">Administrateur</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <Button
              onClick={handleGrantPermission}
              disabled={isAdding || !newPermission.targetId}
              className="w-full mt-3">
              
                                {isAdding ?
              <>
                                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                        Ajout...
                                    </> :

              <>
                                        <Plus className="h-4 w-4 mr-2" />
                                        Accorder la permission
                                    </>
              }
                            </Button>
                        </div>

                        {/* Existing Permissions List */}
                        <div>
                            <h3 className="font-semibold mb-3">Permissions actuelles ({permissions.length})</h3>

                            {permissions.length === 0 ?
            <div className="text-center py-8 text-gray-500 border rounded-lg">
                                    <Shield className="h-12 w-12 mx-auto mb-2 opacity-50" />
                                    <p>Aucune permission définie</p>
                                    <p className="text-sm">Le document est accessible uniquement par son propriétaire</p>
                                </div> :

            <ScrollArea className="h-64 border rounded-lg">
                                    <div className="p-2 space-y-2">
                                        {permissions.map((perm) =>
                <div
                  key={perm.id}
                  className="flex items-center justify-between p-3 bg-white border rounded-lg hover:shadow-sm transition">
                  
                                                <div className="flex items-center gap-3 flex-1">
                                                    {perm.permission_type === 'user' ?
                    <User className="h-5 w-5 text-blue-600" /> :

                    <Users className="h-5 w-5 text-green-600" />
                    }

                                                    <div className="flex-1">
                                                        <p className="font-medium">{perm.target_name}</p>
                                                        <p className="text-xs text-gray-500">
                                                            {perm.permission_type === 'user' ? 'Utilisateur' : 'Groupe'} •
                                                            Accordé le {new Date(perm.granted_at).toLocaleDateString('fr-FR')}
                                                        </p>
                                                    </div>

                                                    <Badge className={getAccessLevelColor(perm.access_level)}>
                                                        {getAccessLevelLabel(perm.access_level)}
                                                    </Badge>
                                                </div>

                                                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRevokePermission(perm.id)}
                    className="ml-2 text-red-600 hover:text-red-700 hover:bg-red-50">
                    
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                )}
                                    </div>
                                </ScrollArea>
            }
                        </div>
                    </div>
        }
            </DialogContent>
        </Dialog>);

}