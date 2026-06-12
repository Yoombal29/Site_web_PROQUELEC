import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Home,
  BarChart3,
  FileText,
  Menu,
  PenTool,
  Calendar,
  Mail,
  Palette,
  Zap,
  Tag,
  Shield,
  Users,
  Database,
  Activity,
  FolderOpen,
  LayoutTemplate,
  HardHat,
  Construction,
  Award,
  BookOpen,
  Wrench,
  Terminal,
  Sliders,
  Layout,
  HelpCircle,
  Newspaper,
  Share2,
  Brain,
  ShoppingCart,
  Type,
} from 'lucide-react';

import { usePermissions } from '@/hooks/usePermissions';

interface AdminSidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  role?: string;
}

export interface MenuItem {
  id: string;
  label: string;
  icon: React.ComponentType<any>;
  category: string;
  roles: string[];
  permission?: string;
  href?: string;
}

export const menuItems: MenuItem[] = [
  // --- 1. PILOTAGE & STRATÉGIE ---
  {
    id: 'overview',
    label: "Vue d'ensemble",
    icon: Home,
    category: 'pilotage',
    roles: ['superadmin', 'admin', 'secondary_admin'],
  },
  {
    id: 'projects',
    label: 'Projets & Chantiers',
    icon: HardHat,
    category: 'pilotage',
    roles: ['superadmin', 'admin', 'secondary_admin'],
    permission: 'projects.view',
  },
  {
    id: 'analytics',
    label: 'Analytics & Trafic',
    icon: BarChart3,
    category: 'pilotage',
    roles: ['superadmin', 'admin'],
    permission: 'audit.view',
  },
  {
    id: 'construction',
    label: 'Mode Construction',
    icon: Construction,
    category: 'pilotage',
    roles: ['superadmin', 'admin'],
    permission: 'admin.settings',
  },

  // --- 2. CORTEX IA (SOUVERAIN) — Hub unique ---
  {
    id: 'expert_hub',
    label: '🧠 Hub IA Central',
    icon: Brain,
    category: 'ia',
    roles: ['superadmin', 'admin'],
    href: '/expert',
  },

  // --- 3. MÉTIER & ÉLECTRICITÉ (CORE BUSINESS) ---
  {
    id: 'certifications',
    label: 'Certifications',
    icon: Award,
    category: 'metier',
    roles: ['superadmin', 'admin', 'secondary_admin'],
    permission: 'inspections.view',
  },
  {
    id: 'training',
    label: 'Formations Pro',
    icon: BookOpen,
    category: 'metier',
    roles: ['superadmin', 'admin', 'secondary_admin'],
    permission: 'inspections.view',
  },
  {
    id: 'standards',
    label: 'Normes & Réglementation',
    icon: Shield,
    category: 'metier',
    roles: ['superadmin', 'admin', 'secondary_admin'],
    permission: 'projects.view',
  },
  {
    id: 'equipment',
    label: 'Catalogue Équipements',
    icon: Zap,
    category: 'metier',
    roles: ['superadmin', 'admin', 'secondary_admin'],
    permission: 'projects.view',
  },

  // --- 4. GESTION DE CONTENU (CMS) ---
  {
    id: 'dynamic_content',
    label: 'Sections & Contenus',
    icon: FileText,
    category: 'cms',
    roles: ['superadmin', 'admin'],
    permission: 'admin.settings',
  },
  {
    id: 'god_builder',
    label: 'Studio de Création',
    icon: Layout,
    category: 'cms',
    roles: ['superadmin', 'admin'],
    permission: 'builder.access',
    href: '/admin/builder',
  },
  {
    id: 'blog',
    label: 'Blog & Actualités',
    icon: PenTool,
    category: 'cms',
    roles: ['superadmin', 'admin', 'secondary_admin'],
    permission: 'admin.settings',
  },
  {
    id: 'media',
    label: 'Médiathèque & Fichiers',
    icon: FolderOpen,
    category: 'cms',
    roles: ['superadmin', 'admin', 'secondary_admin'],
    permission: 'documents.upload',
  },
  {
    id: 'menu',
    label: 'Menus & Navigation',
    icon: Menu,
    category: 'cms',
    roles: ['superadmin', 'admin'],
    permission: 'admin.settings',
  },
  {
    id: 'form_submissions',
    label: 'Soumissions Formulaires',
    icon: Mail,
    category: 'cms',
    roles: ['superadmin', 'admin', 'secondary_admin'],
    permission: 'documents.upload',
  },
  {
    id: 'templates',
    label: 'Marketplace Templates',
    icon: LayoutTemplate,
    category: 'cms',
    roles: ['superadmin', 'admin', 'secondary_admin'],
    permission: 'builder.access',
  },
  {
    id: 'cms-capabilities',
    label: 'Centre Capacités CMS',
    icon: Shield,
    category: 'cms',
    roles: ['superadmin', 'admin'],
    permission: 'admin.settings',
  },
  {
    id: 'ecommerce',
    label: 'Boutique E-commerce',
    icon: ShoppingCart,
    category: 'cms',
    roles: ['superadmin', 'admin', 'secondary_admin'],
    permission: 'admin.settings',
  },
  {
    id: 'events',
    label: 'Agenda & Événements',
    icon: Calendar,
    category: 'cms',
    roles: ['superadmin', 'admin', 'secondary_admin'],
    permission: 'projects.view',
  },

  // --- 5. COMMUNAUTÉ & VISIBILITÉ ---
  {
    id: 'users',
    label: 'Utilisateurs & Accès',
    icon: Users,
    category: 'communaute',
    roles: ['superadmin', 'admin'],
    permission: 'admin.users',
  },
  {
    id: 'tech-tools',
    label: 'Outils techniques',
    icon: Wrench,
    category: 'communaute',
    roles: ['superadmin', 'admin', 'secondary_admin'],
    permission: 'admin.settings',
  },
  {
    id: 'partners',
    label: 'Réseau Partenaires',
    icon: Share2,
    category: 'communaute',
    roles: ['superadmin', 'admin', 'secondary_admin'],
    permission: 'projects.view',
  },
  {
    id: 'newsletter',
    label: 'Newsletter & Campagnes',
    icon: Mail,
    category: 'communaute',
    roles: ['superadmin', 'admin', 'secondary_admin'],
    permission: 'admin.settings',
  },
  {
    id: 'espace_presse',
    label: 'Espace Presse',
    icon: Newspaper,
    category: 'communaute',
    roles: ['superadmin', 'admin', 'secondary_admin'],
    permission: 'projects.view',
  },

  // --- 6. SYSTÈME & CONFIGURATION ---
  {
    id: 'site_settings',
    label: 'Configuration Globale',
    icon: Sliders,
    category: 'systeme',
    roles: ['superadmin', 'admin'],
    permission: 'admin.settings',
  },
  {
    id: 'infrastructure',
    label: 'Infrastructure Docker',
    icon: Terminal,
    category: 'systeme',
    roles: ['superadmin', 'admin'],
    permission: 'admin.settings',
  },
  {
    id: 'design',
    label: 'Apparence & Thème',
    icon: Palette,
    category: 'systeme',
    roles: ['superadmin', 'admin', 'secondary_admin'],
    permission: 'admin.settings',
  },
  {
    id: 'fonts',
    label: 'Polices personnalisées',
    icon: Type,
    category: 'systeme',
    roles: ['superadmin', 'admin', 'secondary_admin'],
    permission: 'admin.settings',
  },
  {
    id: 'branding',
    label: 'Marque & White-Label',
    icon: Tag,
    category: 'systeme',
    roles: ['superadmin', 'admin', 'secondary_admin'],
    permission: 'admin.settings',
  },
  {
    id: 'database',
    label: 'Base de Données',
    icon: Database,
    category: 'systeme',
    roles: ['superadmin', 'admin'],
    permission: 'admin.settings',
  },
  {
    id: 'security',
    label: 'Sécurité & Logs',
    icon: Shield,
    category: 'systeme',
    roles: ['superadmin', 'admin'],
    permission: 'admin.permissions',
  },
  {
    id: 'performance',
    label: 'Performance Système',
    icon: Activity,
    category: 'systeme',
    roles: ['superadmin', 'admin'],
    permission: 'admin.settings',
  },
  {
    id: 'help',
    label: 'Aide & Support',
    icon: HelpCircle,
    category: 'systeme',
    roles: ['superadmin', 'admin', 'secondary_admin'],
  },
];

export const categories: Record<string, string> = {
  pilotage: '🚀 Pilotage & Stratégie',
  ia: '🧠 Cortex IA (Souverain)',
  metier: '⚡ Métier & Électricité',
  cms: '📝 Gestion de Contenu',
  communaute: '👥 Communauté & Réseaux',
  systeme: '🔧 Système & Infrastructure',
};

export function AdminSidebar({ activeTab, onTabChange, role = 'admin' }: AdminSidebarProps) {
  const { hasPermission, isLoading } = usePermissions();

  const filteredItems = menuItems.filter((item) => {
    // Super admin sees everything
    if (role === 'superadmin') {
      return true;
    }

    // 1. Validation du rôle
    const isRoleAllowed = item.roles.includes(role as string);
    if (!isRoleAllowed) return false;

    // 2. Validation dynamique par permissions RBAC
    if (item.permission) {
      return hasPermission(item.permission);
    }

    return true;
  });

  const groupedItems = filteredItems.reduce(
    (acc, item) => {
      if (!acc[item.category]) {
        acc[item.category] = [];
      }
      acc[item.category].push(item);
      return acc;
    },
    {} as Record<string, typeof menuItems>,
  );

  return (
    <div className="w-64 bg-card border-r border-border h-[calc(100vh-4rem)] flex flex-col">
      <div className="p-4 border-b border-border">
        <h2 className="font-semibold text-proqblue">Administration</h2>
        <p className="text-sm text-muted-foreground">Gestion complète du site</p>
      </div>

      <ScrollArea className="flex-1 px-4 py-2">
        <div className="space-y-6">
          {Object.entries(categories).map(([categoryKey, categoryLabel]) => {
            const items = groupedItems[categoryKey];
            if (!items || items.length === 0) return null;

            return (
              <div key={categoryKey}>
                <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2 px-2">
                  {categoryLabel}
                </h3>
                <div className="space-y-1">
                  {items.map((item) => {
                    const Icon = item.icon;
                    return (
                      <Button
                        key={item.id}
                        variant={activeTab === item.id ? 'default' : 'ghost'}
                        className={cn(
                          'w-full justify-start gap-3 h-10',
                          activeTab === item.id && 'bg-proqblue text-white hover:bg-proqblue/90',
                        )}
                        onClick={() => {
                          if ('href' in item && item.href) {
                            window.open(item.href as string, '_blank');
                          } else {
                            onTabChange(item.id);
                          }
                        }}
                      >
                        <Icon className="h-4 w-4" />
                        {item.label}
                        {'href' in item && (
                          <span className="ml-auto text-[10px] opacity-50">↗</span>
                        )}
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
