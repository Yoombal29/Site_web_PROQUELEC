
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useUserRole } from '@/hooks/useUserRole';
import { useSession } from '@/hooks/useSession';
import { Clock } from 'lucide-react';

interface RoleProtectedRouteProps {
  children: ReactNode;
  allowedRoles: AppRole[];
  redirectTo?: string;
}

/**
 * Protège une route en vérifiant si l'utilisateur possède l'un des rôles autorisés.
 */
export const RoleProtectedRoute: React.FC<RoleProtectedRouteProps> = ({
  children,
  allowedRoles,
  redirectTo = "/connexion"
}) => {
  const { user, isLoading: isLoadingSession } = useSession();
  const { role, status, isLoading: isLoadingRole } = useUserRole();

  if (isLoadingSession || isLoadingRole) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <div className="animate-spin w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full"></div>
            </div>);

  }

  if (!user) {
    return <Navigate to={redirectTo} replace />;
  }

  if (status === 'pending') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
                <div className="text-center max-w-md bg-white p-10 rounded-3xl shadow-xl border border-blue-100 italic">
                    <div className="w-20 h-20 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Clock className="w-10 h-10" />
                    </div>
                    <h2 className="text-2xl font-black text-slate-900 mb-4">Inscription en attente</h2>
                    <p className="text-slate-600 mb-8 leading-relaxed">
                        Votre demande d'inscription en tant que partenaire est en cours de validation par nos administrateurs.
                        Vous recevrez un accès complet dès que votre compte sera approuvé.
                    </p>
                    <a href="/" className="inline-block bg-slate-900 text-white px-8 py-3 rounded-xl font-bold hover:bg-slate-800 transition-all">
                        Retour à l'accueil
                    </a>
                </div>
            </div>);

  }

  if (!allowedRoles.includes(role)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
                <div className="text-center max-w-md">
                    <h1 className="text-6xl font-black text-slate-200 mb-4">403</h1>
                    <h2 className="text-2xl font-bold text-slate-900 mb-4">Accès Refusé</h2>
                    <p className="text-slate-600 mb-8">
                        Vous n'avez pas les permissions nécessaires pour accéder à cette interface.
                    </p>
                    <a href="/" className="inline-block bg-blue-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-blue-700 transition-all">
                        Retour à l'accueil
                    </a>
                </div>
            </div>);

  }

  return <>{children}</>;
};