import { useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Zap, AlertTriangle, Home } from "lucide-react";

const NotFound = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    console.error(
      "404 Error: Terminal attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background relative overflow-hidden font-sans">
      <div className="scanline" />

      <div className="relative z-10 text-center space-y-8 animate-in zoom-in duration-500">
        <div className="w-24 h-24 bg-red-500/10 rounded-3xl flex items-center justify-center glow-emerald border border-red-500/30 mx-auto">
          <AlertTriangle className="w-12 h-12 text-red-500" />
        </div>

        <div>
          <h1 className="text-6xl font-black uppercase italic tracking-tighter text-foreground">
            404 <span className="text-red-500 tracking-normal">SIGNAL LOST</span>
          </h1>
          <p className="text-muted-foreground mt-4 max-w-md mx-auto font-mono text-sm uppercase tracking-widest opacity-60">
            La coordonnée système <span className="text-primary">{location.pathname}</span> est introuvable dans le noyau YEAI.
          </p>
        </div>

        <div className="bg-primary/5 p-6 rounded-2xl border border-primary/10 max-w-sm mx-auto">
          <div className="flex items-center gap-3 text-left">
            <Zap className="w-5 h-5 text-primary" />
            <p className="text-[10px] uppercase font-black tracking-widest leading-loose">
              Erreur d'adressage réseau détectée. Retournez à la base de contrôle principale.
            </p>
          </div>
        </div>

        <Button
          onClick={() => navigate("/")}
          className="h-14 px-10 bg-primary text-black font-black uppercase tracking-widest rounded-full glow-emerald hover:scale-105 transition-all"
        >
          <Home className="w-5 h-5 mr-3" /> REVENIR AU DASHBOARD
        </Button>
      </div>

      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-[9px] uppercase font-black tracking-[0.3em] opacity-30">
        Yeai Security Protocol - Error Code: 0x404_VOID
      </div>
    </div>
  );
};

export default NotFound;
