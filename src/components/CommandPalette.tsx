
import React, { useEffect, useState } from "react";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut } from
"@/components/ui/command";
import {
  Calculator,



  Smile,
  User,
  Home,
  FileText,

  Search,
  Zap,
  LayoutDashboard,

  LogOut,
  Moon,
  Sun,
  Laptop,
  Sparkles } from
"lucide-react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "next-themes";
import { useSession } from "@/hooks/useSession";
import { getDashboardPath } from "@/utils/navigation";

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const { setTheme } = useTheme();
  const { user, signOut } = useSession();

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  const runCommand = (command: () => void) => {
    setOpen(false);
    command();
  };

  return (
    <>
            <CommandDialog open={open} onOpenChange={setOpen}>
                <CommandInput placeholder="Tapez une commande ou recherchez..." />
                <CommandList>
                    <CommandEmpty>Aucun résultat trouvé.</CommandEmpty>

                    <CommandGroup heading="Navigation Rapide">
                        <CommandItem onSelect={() => runCommand(() => navigate("/"))}>
                            <Home className="mr-2 h-4 w-4" />
                            <span>Accueil</span>
                        </CommandItem>
                        <CommandItem onSelect={() => runCommand(() => navigate(user ? getDashboardPath(user.role) : "/dashboard"))}>
                            <LayoutDashboard className="mr-2 h-4 w-4" />
                            <span>Tableau de Bord</span>
                        </CommandItem>
                        <CommandItem onSelect={() => runCommand(() => navigate("/about"))}>
                            <Smile className="mr-2 h-4 w-4" />
                            <span>À Propos</span>
                        </CommandItem>
                        <CommandItem onSelect={() => runCommand(() => navigate("/blog"))}>
                            <Zap className="mr-2 h-4 w-4" />
                            <span>Actualités / Blog</span>
                        </CommandItem>
                    </CommandGroup>

                    <CommandSeparator />

                    <CommandGroup heading="Expert & Outils">
                        <CommandItem onSelect={() => runCommand(() => navigate("/expert-lab"))}>
                            <Sparkles className="mr-2 h-4 w-4 text-proqblue" />
                            <span>Expert Lab (Nouveau)</span>
                            <CommandShortcut>⌘E</CommandShortcut>
                        </CommandItem>
                        <CommandItem onSelect={() => runCommand(() => navigate("/expert/chat"))}>
                            <Search className="mr-2 h-4 w-4" />
                            <span>Assistant IA</span>
                        </CommandItem>
                        <CommandItem onSelect={() => runCommand(() => navigate("/ged"))}>
                            <FileText className="mr-2 h-4 w-4" />
                            <span>Bibliothèque GED</span>
                        </CommandItem>
                        <CommandItem onSelect={() => runCommand(() => navigate("/expert/calculators"))}>
                            <Calculator className="mr-2 h-4 w-4" />
                            <span>Calculateurs Electriques</span>
                        </CommandItem>
                    </CommandGroup>

                    <CommandSeparator />

                    <CommandGroup heading="Paramètres & Thème">
                        <CommandItem onSelect={() => runCommand(() => setTheme("light"))}>
                            <Sun className="mr-2 h-4 w-4" />
                            <span>Passer en Mode Clair</span>
                        </CommandItem>
                        <CommandItem onSelect={() => runCommand(() => setTheme("dark"))}>
                            <Moon className="mr-2 h-4 w-4" />
                            <span>Passer en Mode Sombre</span>
                        </CommandItem>
                        <CommandItem onSelect={() => runCommand(() => setTheme("system"))}>
                            <Laptop className="mr-2 h-4 w-4" />
                            <span>Utiliser le Thème Système</span>
                        </CommandItem>
                    </CommandGroup>

                    <CommandSeparator />

                    <CommandGroup heading="Mon Compte">
                        <CommandItem onSelect={() => runCommand(() => navigate(user ? getDashboardPath(user.role) : "/dashboard"))}>
                            <User className="mr-2 h-4 w-4" />
                            <span>Profil</span>
                            <CommandShortcut>⌘P</CommandShortcut>
                        </CommandItem>
                        <CommandItem onSelect={() => runCommand(() => {signOut();navigate("/connexion");})}>
                            <LogOut className="mr-2 h-4 w-4 text-red-500" />
                            <span className="text-red-500">Déconnexion</span>
                        </CommandItem>
                    </CommandGroup>
                </CommandList>
            </CommandDialog>
        </>);

}