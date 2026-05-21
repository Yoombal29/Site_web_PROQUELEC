
import { Zap, MessageSquare, Calculator, BookOpen, Settings, BarChart3, FileText, Bot, Activity, Binary, History, GitBranch } from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar } from
"@/components/ui/sidebar";
import { Badge } from "@/components/ui/badge";

const adminItems = [
{ title: "Tableau de Bord", url: "/expert", icon: BarChart3 },
{ title: "Flux IA & API", url: "/expert/ai-providers", icon: Bot },
{ title: "Historique d'Audit", url: "/expert/logs", icon: FileText },
{ title: "Config Système", url: "/expert/config", icon: Settings }];


const technicalItems = [
{ title: "Terminal de Chat", url: "/expert/chat", icon: MessageSquare, badge: "YEAI_CORE" },
{ title: "Calculateur BE", url: "/expert/calculators", icon: Calculator, badge: "UTE_15-105" },
{ title: "Schéma Unifilaire", url: "/expert/schemas", icon: GitBranch, badge: "MERMAID" },
{ title: "Base Normative", url: "/expert/docs", icon: BookOpen, badge: "NFC_15-100" },
{ title: "Scanner Photo", url: "/expert/scanner", icon: Camera, badge: "SCAN_NFC" },
{ title: "Historique IA", url: "/expert/history", icon: History, badge: "SESSIONS" }];


export function AppSidebar() {
  const { state } = useSidebar();
  const location = useLocation();
  const collapsed = state === "collapsed";

  const getNavCls = ({ isActive }: {isActive: boolean;}) => {
    const isChat = location.pathname === "/expert/chat";
    const isCalc = location.pathname === "/expert/calculators";
    const isDocs = location.pathname === "/expert/docs";
    const isHistory = location.pathname === "/expert/history";
    const isSchemas = location.pathname === "/expert/schemas";
    const isScanner = location.pathname === "/expert/scanner";

    if (isActive) {
      if (isChat) return "bg-blue-500/10 text-blue-400 border-r-2 border-blue-500 shadow-[inset_0_0_10px_rgba(59,130,246,0.1)]";
      if (isCalc) return "bg-emerald-500/10 text-emerald-500 border-r-2 border-emerald-500 shadow-[inset_0_0_10px_rgba(16,185,129,0.1)]";
      if (isDocs) return "bg-purple-500/10 text-purple-400 border-r-2 border-purple-500 shadow-[inset_0_0_10px_rgba(168,85,247,0.1)]";
      if (isHistory) return "bg-violet-500/10 text-violet-400 border-r-2 border-violet-500 shadow-[inset_0_0_10px_rgba(139,92,246,0.1)]";
      if (isSchemas) return "bg-teal-500/10 text-teal-400 border-r-2 border-teal-500 shadow-[inset_0_0_10px_rgba(20,184,166,0.1)]";
      if (isScanner) return "bg-orange-500/10 text-orange-400 border-r-2 border-orange-500 shadow-[inset_0_0_10px_rgba(249,115,22,0.1)]";
      return "bg-primary/10 text-primary border-r-2 border-primary glow-emerald shadow-[inset_0_0_10px_rgba(16,185,129,0.1)]";
    }
    return "hover:bg-primary/5 hover:text-primary transition-all duration-300";
  };

  const getBadgeCls = (badge: string) => {
    if (badge === "YEAI_CORE") return "bg-blue-500/20 text-blue-400 border-blue-500/30";
    if (badge === "UTE_15-105") return "bg-emerald-500/20 text-emerald-500 border-emerald-500/30";
    if (badge === "NFC_15-100") return "bg-purple-500/20 text-purple-400 border-purple-500/30";
    if (badge === "SESSIONS") return "bg-violet-500/20 text-violet-400 border-violet-500/30";
    if (badge === "MERMAID") return "bg-teal-500/20 text-teal-400 border-teal-500/30";
    if (badge === "SCAN_NFC") return "bg-orange-500/20 text-orange-400 border-orange-500/30";
    return "bg-white/5 text-zinc-500 border-white/10";
  };

  return (
    <Sidebar className={`${collapsed ? "w-14" : "w-64"} border-r border-white/5`} collapsible="icon">
      <SidebarContent style={{ backgroundColor: 'var(--admin-bg)' }} className="text-foreground transition-colors duration-500">

        {/* LOGO DE L'APPLICATION */}
        <div className="p-6 mb-4">
          <div className="flex items-center gap-4">
            <div className="relative group">
              <div className="w-12 h-12 bg-primary/20 rounded-2xl flex items-center justify-center glow-emerald border border-primary/40 group-hover:scale-110 transition-transform">
                <Zap className="w-7 h-7 text-primary animate-pulse" />
              </div>
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-[#04070d]" />
            </div>
            {!collapsed &&
            <div className="animate-in fade-in slide-in-from-left-4 duration-500">
                <h2 className="font-black text-2xl uppercase italic leading-none tracking-tighter">
                  YEAI <span className="text-primary tracking-normal">LAB</span>
                </h2>
                <div className="flex items-center gap-1 mt-1">
                  <Activity className="w-3 h-3 text-primary/60" />
                  <span className="text-[9px] uppercase font-black tracking-widest text-muted-foreground opacity-50">Industrial OS v7.5</span>
                </div>
              </div>
            }
          </div>
        </div>

        {/* SECTION: ADMINISTRATIVE (CŒUR_ADMIN) */}
        <SidebarGroup>
          <SidebarGroupLabel className="px-6 py-4 text-[9px] font-black uppercase tracking-[0.4em] text-primary/40">
            CŒUR_ADMIN
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="px-3 gap-1">
              {adminItems.map((item) =>
              <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild aria-label="Action">
                    <NavLink to={item.url} end className={(props) => getNavCls(props)}>
                      <item.icon className="w-5 h-5" />
                      {!collapsed && <span className="font-bold text-[11px] uppercase tracking-widest">{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* SECTION: TECHNIQUE (SUITE_TECHNIQUE) RENFORCÉE PAR YEAI */}
        <SidebarGroup className="mt-6">
          <SidebarGroupLabel className="px-6 py-4 text-[9px] font-black uppercase tracking-[0.4em] text-blue-500/40">
            SUITE_TECHNIQUE
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="px-3 gap-1">
              {technicalItems.map((item) =>
              <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild aria-label="Action">
                    <NavLink to={item.url} end className={(props) => getNavCls(props)}>
                      <item.icon className="w-5 h-5" />
                      {!collapsed &&
                    <div className="flex flex-1 items-center justify-between">
                          <span className="font-black text-[11px] uppercase tracking-tighter">{item.title}</span>
                          <Badge variant="outline" className={`text-[7px] px-1 py-0 h-4 ${getBadgeCls(item.badge)}`}>
                            {item.badge}
                          </Badge>
                        </div>
                    }
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* FOOTER: SYSTEM INFOS */}
        {!collapsed &&
        <div className="mt-auto p-6">
            <div className="p-4 glass rounded-2xl border-primary/20 space-y-3 relative overflow-hidden group">
              <div className="absolute -top-6 -right-6 opacity-5 group-hover:rotate-12 transition-transform">
                <Binary className="w-20 h-20" />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase font-black tracking-widest text-primary italic">Status Labo</span>
                <span className="w-2 h-2 bg-primary rounded-full animate-ping" />
              </div>
              <div className="space-y-1">
                <p className="text-[9px] uppercase font-bold text-muted-foreground">Protocole</p>
                <p className="text-[11px] font-black tracking-tighter italic">NF C 15-100 • IEC 60364</p>
              </div>
            </div>
          </div>
        }
      </SidebarContent>
    </Sidebar>);

}