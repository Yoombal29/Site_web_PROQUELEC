import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Home, LayoutDashboard, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSession } from "@/hooks/useSession";
import { getDashboardPath } from "@/utils/navigation";

interface ProqSecondaryNavProps {
  theme?: 'electrician' | 'company' | 'member' | 'default';
  className?: string;
}

export const ProqSecondaryNav = ({ theme = 'default', className }: ProqSecondaryNavProps) => {
  const navigate = useNavigate();
  const { user } = useSession();

  const themes = {
    electrician: "text-emerald-700 hover:bg-emerald-100/50",
    company: "text-blue-700 hover:bg-blue-100/50",
    member: "text-indigo-700 hover:bg-indigo-100/50",
    default: "text-slate-700 hover:bg-slate-100"
  };

  const currentTheme = themes[theme as keyof typeof themes];

  return (
    <nav className={cn(
      "sticky top-0 z-40 w-full px-4 py-3 bg-white/70 backdrop-blur-xl border-b border-white/20 shadow-sm transition-colors duration-500",
      className
    )}>
            <div className="max-w-7xl mx-auto flex items-center justify-between">
                <div className="flex items-center gap-1 sm:gap-4">
                    <button
            onClick={() => navigate(-1)}
            className={cn(
              "flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-bold transition-all",
              currentTheme
            )} aria-label="Action">
            
                        <ArrowLeft className="w-4 h-4" />
                        <span className="hidden sm:inline">Précédent</span>
                    </button>

                    <Link
            to="/"
            className={cn(
              "flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-bold transition-all",
              currentTheme
            )}>
            
                        <Home className="w-4 h-4" />
                        <span className="hidden sm:inline">Accueil</span>
                    </Link>
                </div>

                <div className="flex items-center gap-2 sm:gap-4">
                    <button
            onClick={() => document.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', ctrlKey: true }))}
            className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-500 rounded-xl text-xs font-bold transition-all" aria-label="Action">
            
                        <Search className="w-3.5 h-3.5" />
                        <span className="hidden md:inline">Recherche (Ctrl+K)</span>
                    </button>

                    <Link
            to={user ? getDashboardPath(user.role) : "/dashboard"}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold shadow-lg shadow-current/20 transition-all text-white",
              theme === 'electrician' ? 'bg-emerald-600 hover:bg-emerald-700' :
              theme === 'company' ? 'bg-blue-600 hover:bg-blue-700' :
              theme === 'member' ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-proqblue hover:bg-proqblue-dark'
            )}>
            
                        <LayoutDashboard className="w-4 h-4" />
                        <span>DASHBOARD</span>
                    </Link>
                </div>
            </div>
        </nav>);

};