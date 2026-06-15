import React from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { usePremiumAccess } from '@/hooks/usePremiumAccess';
import { useSession } from '@/hooks/useSession';
import { Crown, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface PlanProtectedRouteProps {
  children: React.ReactNode;
  requiredPlans?: string[];
  redirectTo?: string;
}

export const PlanProtectedRoute: React.FC<PlanProtectedRouteProps> = ({
  children,
  requiredPlans = ['Premium', 'Expert'],
  redirectTo = '/abonnements',
}) => {
  const { user, isLoading: isLoadingSession } = useSession();
  const { hasPremium, subscription, isLoading: isLoadingPremium } = usePremiumAccess();
  const navigate = useNavigate();

  if (isLoadingSession || isLoadingPremium) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <div className="animate-spin w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/connexion" replace />;
  }

  if (['admin', 'superadmin', 'secondary_admin'].includes(user.role)) {
    return <>{children}</>;
  }

  const userPlan = subscription?.planName || 'Gratuit';
  const hasRequiredPlan = requiredPlans.some((p) => userPlan === p) || hasPremium;

  if (!hasRequiredPlan) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 px-4">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 bg-gradient-to-br from-amber-400 to-orange-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-amber-500/20">
            <Crown className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-black text-white mb-3">Accès Premium requis</h1>
          <p className="text-slate-400 mb-8 leading-relaxed">
            Cette fonctionnalité est réservée aux abonnés Premium ou Expert.
            Souscrivez à une formule pour y accéder.
          </p>
          <Button
            onClick={() => navigate(redirectTo)}
            className="bg-gradient-to-r from-amber-500 to-orange-600 text-white hover:from-amber-600 hover:to-orange-700 shadow-lg shadow-amber-500/20 px-8 py-6 text-lg gap-3"
          >
            <Sparkles className="w-5 h-5" />
            Voir les abonnements
          </Button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
