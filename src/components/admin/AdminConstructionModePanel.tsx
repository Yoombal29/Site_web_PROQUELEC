
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useConstructionMode } from '@/hooks/useConstructionMode';
import { Construction, Globe } from 'lucide-react';

export const AdminConstructionModePanel: React.FC = () => {
  const { isConstructionMode, grantAccess, revokeAccess } = useConstructionMode();

  const handleToggle = (enabled: boolean) => {
    if (enabled) {
      revokeAccess();
    } else {
      grantAccess();
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Construction className="w-5 h-5" />
          Mode Construction
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="construction-mode" className="text-base font-medium">
              Page de construction
            </Label>
            <p className="text-sm text-muted-foreground">
              Activer pour afficher la page "Site en construction" aux visiteurs
            </p>
          </div>
          <Switch
            id="construction-mode"
            checked={isConstructionMode}
            onCheckedChange={handleToggle}
          />
        </div>
        
        <div className="p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            {isConstructionMode ? (
              <>
                <Construction className="w-4 h-4 text-orange-500" />
                <span className="font-medium text-orange-700">Mode construction activé</span>
              </>
            ) : (
              <>
                <Globe className="w-4 h-4 text-green-500" />
                <span className="font-medium text-green-700">Site accessible</span>
              </>
            )}
          </div>
          <p className="text-sm text-gray-600">
            {isConstructionMode 
              ? "Les visiteurs verront la page de construction avec le mot de passe d'accès."
              : "Le site est accessible normalement par tous les visiteurs."
            }
          </p>
        </div>
        
        <div className="text-xs text-gray-500 bg-blue-50 p-3 rounded">
          <strong>Note :</strong> Le mot de passe d'accès est <code className="bg-white px-1 rounded">1995Proquelec</code>
        </div>
      </CardContent>
    </Card>
  );
};
