import { useSession } from "@/hooks/useSession";
import { useUserRole } from "@/hooks/useUserRole";
import { useState } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

import { EventCalendar } from "@/components/EventCalendar";
import { ImageManager } from "@/components/ImageManager";
import DashboardHome from "@/components/admin/DashboardHome";
import { Loader2, LayoutDashboard, Calendar, Image as ImageIcon, LogOut, ChevronRight, User } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export default function PartnerDashboard() {
  const { user, signOut } = useSession();
  const { role, isLoading } = useUserRole();
  const [activeTab, setActiveTab] = useState("overview");

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <Loader2 className="animate-spin w-10 h-10 text-blue-600" />
            </div>);

  }

  const renderTabContent = () => {
    switch (activeTab) {
      case "overview":
        return <DashboardHome />;
      case "events":
        return (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white p-10 rounded-[2.5rem] shadow-2xl shadow-slate-200 border border-slate-100">
            
                        <div className="flex items-center gap-4 mb-8">
                            <div className="p-3 bg-blue-100 text-blue-600 rounded-2xl">
                                <Calendar className="w-6 h-6" />
                            </div>
                            <div>
                                <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tighter">Mes Événements</h2>
                                <p className="text-slate-500 font-medium">Gérez votre présence et vos interventions.</p>
                            </div>
                        </div>
                        <div className="bg-slate-50 p-6 rounded-2xl mb-10 border border-slate-100">
                            <p className="text-slate-600 text-sm leading-relaxed">
                                Notez que les nouveaux événements doivent être validés par l'administration avant d'être publiés sur le calendrier national.
                            </p>
                        </div>
                        <EventCalendar />
                    </motion.section>);

      case "images":
        return (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white p-10 rounded-[2.5rem] shadow-2xl shadow-slate-200 border border-slate-100">
            
                        <div className="flex items-center gap-4 mb-8">
                            <div className="p-3 bg-emerald-100 text-emerald-600 rounded-2xl">
                                <ImageIcon className="w-6 h-6" />
                            </div>
                            <div>
                                <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tighter">Médiathèque Partenaire</h2>
                                <p className="text-slate-500 font-medium">Vos ressources visuelles et documents.</p>
                            </div>
                        </div>
                        <ImageManager />
                    </motion.section>);

      default:
        return <DashboardHome />;
    }
  };

  return (
    <div className="bg-[#f8fafc] min-h-screen flex flex-col font-sans">
            <Header solid={true} />

            <main className="flex-grow flex pt-24 lg:pt-28">
                {/* Enhanced Sidebar for Partner */}
                <div className="hidden lg:block w-80 fixed left-0 top-24 bottom-0 bg-white border-r border-slate-200 p-6 z-20 overflow-y-auto">
                    <div className="space-y-8">
                        <div>
                            <div className="flex items-center gap-3 px-4 mb-8">
                                <div className="w-12 h-12 bg-slate-900 rounded-2xl flex items-center justify-center text-white font-black text-xl">
                                    {user?.email?.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                    <div className="text-xs font-black text-blue-600 uppercase tracking-widest leading-none mb-1">Partenaire Espace</div>
                                    <div className="text-sm font-bold text-slate-900 truncate max-w-[150px]">{user?.email}</div>
                                </div>
                            </div>

                            <nav className="space-y-2">
                                {[
                { id: 'overview', label: 'Tableau de bord', icon: LayoutDashboard },
                { id: 'events', label: 'Événements', icon: Calendar },
                { id: 'images', label: 'Médiathèque', icon: ImageIcon }].
                map((item) =>
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={cn(
                    "w-full flex items-center justify-between px-4 py-3.5 rounded-2xl transition-all duration-300 group",
                    activeTab === item.id ?
                    "bg-slate-900 text-white shadow-xl shadow-slate-200 translate-x-2" :
                    "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                  )} aria-label="Action">
                  
                                        <div className="flex items-center gap-3">
                                            <item.icon className={cn("w-5 h-5", activeTab === item.id ? "text-blue-400" : "text-slate-400 group-hover:text-slate-900")} />
                                            <span className="font-bold text-sm tracking-tight">{item.label}</span>
                                        </div>
                                        <ChevronRight className={cn("w-4 h-4 opacity-0 transition-all", activeTab === item.id ? "opacity-100 translate-x-1" : "group-hover:opacity-100")} />
                                    </button>
                )}
                            </nav>
                        </div>

                        <div className="pt-8 border-t border-slate-100">
                            <button
                onClick={() => signOut()}
                className="w-full flex items-center gap-3 px-4 py-3.5 text-red-500 hover:bg-red-50 rounded-2xl transition-all font-bold text-sm">
                
                                <LogOut className="w-5 h-5" />
                                Déconnexion
                            </button>
                        </div>
                    </div>
                </div>

                {/* Main Content Area */}
                <div className="flex-1 lg:ml-80 px-6 lg:px-12 py-10">
                    <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
            
                        <div>
                            <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-[10px] font-black uppercase tracking-widest mb-4">
                                <User className="w-3 h-3" /> Dashboard Partenaire
                            </div>
                            <h1 className="text-4xl md:text-5xl font-black text-slate-900 uppercase tracking-tighter leading-none">
                                {activeTab === 'overview' ? 'Bienvenue' : activeTab === 'events' ? 'Événements' : 'Médiathèque'}
                            </h1>
                            <p className="text-slate-500 font-medium mt-2">
                                Gérer vos services et votre collaboration avec PROQUELEC
                            </p>
                        </div>

                        <div className="flex items-center gap-3 p-3 bg-white rounded-2xl border border-slate-100 shadow-sm">
                            <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center text-slate-400">
                                <LayoutDashboard className="w-5 h-5" />
                            </div>
                            <div>
                                <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Statut Compte</div>
                                <div className="text-sm font-bold text-emerald-600">Partenaire Actif</div>
                            </div>
                        </div>
                    </motion.div>

                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
                        {renderTabContent()}
                    </div>
                </div>
            </main>

            <Footer />
        </div>);

}