

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Home,
  BarChart3,
  FileText,
  Menu,
  PenTool,
  Image,
  Calendar,
  Mail,
  Palette,
  Zap,
  Shield,
  Users,
  ClipboardList,
  Activity,
  FolderOpen,
  FileImage,
  FileVideo,
  Folder,
  Construction,
  Award,
  GraduationCap,
  Wrench,
  BookOpen,
  Sliders,
  Layout
} from "lucide-react";

interface AdminSidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const menuItems = [
  {
    id: "overview",
    label: "Vue d'ensemble",
    icon: Home,
    category: "principal",
    roles: ["admin", "secondary_admin", "partner"]
  },
  {
    id: "features",
    label: "Fonctionnalités du site",
    icon: Zap,
    category: "principal",
    roles: ["admin"]
  },
  {
    id: "analytics",
    label: "Analytics",
    icon: BarChart3,
    category: "principal",
    roles: ["admin"]
  },
  {
    id: "construction",
    label: "Construction",
    icon: Construction,
    category: "principal",
    roles: ["admin", "secondary_admin"]
  },
  {
    id: "pages",
    label: "Pages",
    icon: FileText,
    category: "contenu",
    roles: ["admin", "secondary_admin"]
  },
  {
    id: "menu",
    label: "Menus",
    icon: Menu,
    category: "contenu",
    roles: ["admin"]
  },
  {
    id: "blog",
    label: "Blog",
    icon: PenTool,
    category: "contenu",
    roles: ["admin", "secondary_admin"]
  },
  {
    id: "media",
    label: "Médiathèque (Fichiers)",
    icon: FolderOpen,
    category: "media",
    roles: ["admin", "secondary_admin", "partner"]
  },
  {
    id: "documents",
    label: "Bibliothèque (Guides/PDF)",
    icon: Folder,
    category: "media",
    roles: ["admin", "secondary_admin"]
  },
  {
    id: "gallery",
    label: "Showcase (Hotspots)",
    icon: FileVideo,
    category: "media",
    roles: ["admin", "secondary_admin"]
  },
  {
    id: "download_buttons",
    label: "Boutons de téléchargement",
    icon: ClipboardList,
    category: "media",
    roles: ["admin"]
  },
  {
    id: "events",
    label: "Événements",
    icon: Calendar,
    category: "contenu",
    roles: ["admin", "secondary_admin", "partner"]
  },
  {
    id: "newsletter",
    label: "Newsletter",
    icon: Mail,
    category: "communication",
    roles: ["admin"]
  },
  {
    id: "certifications",
    label: "Certifications",
    icon: Award,
    category: "électrique",
    roles: ["admin", "secondary_admin"]
  },
  {
    id: "training",
    label: "Formations",
    icon: GraduationCap,
    category: "électrique",
    roles: ["admin", "secondary_admin"]
  },
  {
    id: "equipment",
    label: "Équipements",
    icon: Wrench,
    category: "électrique",
    roles: ["admin", "secondary_admin"]
  },
  {
    id: "standards",
    label: "Normes",
    icon: BookOpen,
    category: "électrique",
    roles: ["admin", "secondary_admin"]
  },
  {
    id: "design",
    label: "Thème",
    icon: Palette,
    category: "apparence",
    roles: ["admin"]
  },
  {
    id: "admin-dashboard",
    label: "Dashboard Avancé",
    icon: BarChart3,
    category: "apparence",
    roles: ["admin"]
  },
  {
    id: "admin-content",
    label: "Gestionnaire Contenu",
    icon: FileText,
    category: "apparence",
    roles: ["admin"]
  },
  {
    id: "admin-design",
    label: "Designer UI",
    icon: Sliders,
    category: "apparence",
    roles: ["admin"]
  },
  {
    id: "users",
    label: "Utilisateurs",
    icon: Users,
    category: "gestion",
    roles: ["admin"]
  },
  {
    id: "performance",
    label: "Performance",
    icon: Zap,
    category: "technique",
    roles: ["admin"]
  },
  {
    id: "security",
    label: "Sécurité",
    icon: Shield,
    category: "technique",
    roles: ["admin"]
  },
  {
    id: "audit",
    label: "Audit",
    icon: ClipboardList,
    category: "technique",
    roles: ["admin"]
  },
  {
    id: "monitoring",
    label: "Monitoring",
    icon: Activity,
    category: "technique",
    roles: ["admin"]
  }
];

import { AppRole } from "@/hooks/useUserRole";

interface AdminSidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  role?: AppRole;
}

const categories = {
  "principal": "Principal",
  "contenu": "Contenu",
  "media": "Médias",
  "communication": "Communication",
  "électrique": "Secteur Électrique",
  "apparence": "Apparence",
  "gestion": "Gestion",
  "technique": "Technique"
};

export function AdminSidebar({ activeTab, onTabChange, role = 'admin' }: AdminSidebarProps) {
  const filteredItems = menuItems.filter(item =>
    item.roles.includes(role as any)
  );

  const groupedItems = filteredItems.reduce((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = [];
    }
    acc[item.category].push(item);
    return acc;
  }, {} as Record<string, typeof menuItems>);

  return (
    <div className="w-64 bg-white border-r border-gray-200 h-[calc(100vh-4rem)] flex flex-col">
      <div className="p-4 border-b border-gray-200">
        <h2 className="font-semibold text-proqblue">Administration</h2>
        <p className="text-sm text-gray-600">Gestion complète du site</p>
      </div>

      <ScrollArea className="flex-1 px-4 py-2">
        <div className="space-y-6">
          {Object.entries(categories).map(([categoryKey, categoryLabel]) => {
            const items = groupedItems[categoryKey];
            if (!items || items.length === 0) return null;

            return (
              <div key={categoryKey}>
                <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2 px-2">
                  {categoryLabel}
                </h3>
                <div className="space-y-1">
                  {items.map((item) => {
                    const Icon = item.icon;
                    return (
                      <Button
                        key={item.id}
                        variant={activeTab === item.id ? "default" : "ghost"}
                        className={cn(
                          "w-full justify-start gap-3 h-10",
                          activeTab === item.id && "bg-proqblue text-white hover:bg-proqblue/90"
                        )}
                        onClick={() => onTabChange(item.id)}
                      >
                        <Icon className="h-4 w-4" />
                        {item.label}
                      </Button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
}
