
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Eye, EyeOff, Lock } from 'lucide-react';
import { useSession } from '@/hooks/useSession';


interface ConstructionPageProps {
  onPasswordCorrect?: () => void;
}

const ConstructionPage: React.FC<ConstructionPageProps> = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-proqblue-dark via-proqblue to-blue-400 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background blur effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-proqblue-dark/20 via-proqblue/10 to-transparent backdrop-blur-sm"></div>
      
      {/* Animated background circles */}
      <div className="absolute top-20 left-20 w-72 h-72 bg-white/5 rounded-full blur-xl animate-pulse"></div>
      <div className="absolute bottom-20 right-20 w-96 h-96 bg-blue-300/10 rounded-full blur-2xl animate-pulse delay-1000"></div>
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-proqblue/5 rounded-full blur-xl animate-pulse delay-500"></div>

      {/* Main content */}
      <div className="relative z-10 max-w-md w-full space-y-8 text-center">
        {/* Logo/Brand */}
        <div className="space-y-4">
          <div className="mx-auto w-20 h-20 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center border border-white/20">
            <Lock className="w-10 h-10 text-white" />
          </div>
          
          <div className="space-y-2">
            <h1 className="text-4xl font-bold text-white font-roboto">
              PROQUELEC.SN
            </h1>
            <p className="text-blue-100 text-lg font-medium">
              Promotion de la Qualité des Installations Électriques
            </p>
          </div>
        </div>

        {/* Construction message */}
        <div className="space-y-4">
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
            <h2 className="text-2xl font-semibold text-white mb-3">
              🚧 Site en Construction
            </h2>
            <p className="text-blue-100 text-base leading-relaxed">
              Notre nouveau site web est actuellement en développement. 
              Nous travaillons dur pour vous offrir une expérience exceptionnelle.
            </p>
            <p className="text-blue-200 text-sm mt-3 font-medium">
              Revenez bientôt pour découvrir toutes nos nouveautés !
            </p>
          </div>

          {/* Password form supprimé : accès libre */}
        </div>

        {/* Footer info */}
        <div className="text-center space-y-2">
          <p className="text-blue-200 text-sm">
            Depuis 1995 • Sécurité • Qualité • Formation
          </p>
          <p className="text-blue-300 text-xs">
            © 2024 PROQUELEC - Tous droits réservés
          </p>
        </div>
      </div>
    </div>
  );
}

export default ConstructionPage;
