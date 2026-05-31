
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { HeroSection } from "@/components/HeroSection";
import { SEO } from "@/components/SEO";
import { ScrollToTopButton } from "@/components/ScrollToTopButton";
import {
  FileText,
  Download,
  Search,


  ShieldAlert,
  Info,
  Book,
  ChevronRight,
  Sparkles,
  Zap,
  LayoutGrid,
  Settings2,
  Plus,
  Mail } from
"lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAssets, Asset } from "@/hooks/useAssets";
import { useSession } from "@/hooks/useSession";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import {
  CreditCard,
  Smartphone,
  Wallet,
  CheckCircle2,



  Wallet2 } from
"lucide-react";
import {
  Dialog,
  DialogContent } from



"@/components/ui/dialog";
import { useState, useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";

const Documents = () => {
  const navigate = useNavigate();
  const { user } = useSession();
  const isAdmin = user?.role === 'admin';
  const [selectedCategory, setSelectedCategory] = useState("Tous les documents");
  const { data: assets, isLoading } = useAssets(selectedCategory);
  const [searchTerm, setSearchTerm] = useState("");
  const [purchaseAsset, setPurchaseAsset] = useState<Asset | null>(null);
  const [paymentStep, setPaymentStep] = useState<"method" | "simulating" | "success">("method");
  const [selectedMethod, setSelectedMethod] = useState<string | null>(null);

  // Dynamic categories from assets
  const categories = useMemo(() => {
    const base = ["Tous les documents"];
    if (!assets) return base;
    const fromData = Array.from(new Set(assets.map((a) => a.category)));
    return [...base, ...fromData.filter((c) => c && c !== "Général")];
  }, [assets]);

  const handleDownload = async (asset: Asset) => {
    if (asset.monetization_active) {
      setPurchaseAsset(asset);
      setPaymentStep("method");
      return;
    }

    // Direct download for free assets
    window.open(asset.file_url, '_blank');

    // Increment download count (Fire and forget)
    fetch(`/api/assets/${asset.id}/download`, { method: 'POST' }).catch((err) => console.error('Error stats', err));
  };

  const simulatePayment = async () => {
    setPaymentStep("simulating");
    try {
      const session = await apiFetch('/api/payments/checkout', {
        method: 'POST',
        body: JSON.stringify({
          amount: purchaseAsset?.price_fcfy || 5000,
          currency: 'XOF',
          description: purchaseAsset?.title || 'Document PROQUELEC',
        }),
      });
      if (!session.simulated) {
        window.open(session.url, '_blank');
      }
      setPaymentStep("success");
      toast.success("Paiement réussi ! Votre téléchargement commence.");
      setTimeout(() => {
        if (purchaseAsset) {
          window.open(purchaseAsset.file_url, '_blank');
          setPurchaseAsset(null);
        }
      }, 1500);
    } catch (err) {
      setPaymentStep("method");
      toast.error("Erreur de paiement. Veuillez réessayer.");
    }
  };

  const filteredAssets = assets?.filter((asset) =>
  asset.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
  asset.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
  asset.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      <SEO
        title="Documents & Ressources - PROQUELEC"
        description="Accédez à notre bibliothèque de documents techniques, guides de sécurité et normes électriques pour les professionnels du Sénégal." />
      

      <Header />

      <main className="relative">
        <HeroSection
          badge="Ressources Techniques"
          title="Documents & Ressources"
          subtitle="L'expertise technique à portée de main"
          description="Retrouvez l'intégralité des guides techniques, mémos de sécurité et textes réglementaires de PROQUELEC pour vos projets."
          gradient="bg-gradient-to-br from-proqblue-dark via-blue-900 to-slate-900"
          showSearch={true}
          searchPlaceholder="Rechercher un guide, une norme..."
          onSearch={setSearchTerm} />
        

        {/* Floating Admin Button */}
        {isAdmin &&
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="fixed bottom-8 right-8 z-50">
          
            <Button
            className="rounded-full h-16 w-16 shadow-2xl bg-proqblue hover:bg-proqblue-dark border-4 border-white group"
            onClick={() => navigate('/admin')}>
            
              <Settings2 className="w-6 h-6 group-hover:rotate-90 transition-transform" />
            </Button>
          </motion.div>
        }

        {/* Content Section */}
        <section className="py-20 px-4 relative">
          <div className="absolute top-0 left-0 w-full h-64 bg-gradient-to-b from-slate-100 to-transparent pointer-events-none"></div>

          <div className="max-w-7xl mx-auto relative z-10">
            <div className="flex flex-col lg:flex-row gap-10">
              {/* Sidebar Filters */}
              <aside className="lg:w-1/4">
                <div className="bg-white/70 backdrop-blur-xl border border-white/40 p-1 rounded-3xl shadow-xl shadow-slate-200/50 sticky top-[var(--effective-header-height,110px)]">
                  <div className="p-6">
                    <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                      <LayoutGrid className="w-4 h-4" />
                      Filtrer par type
                    </h3>
                    <div className="space-y-1">
                      {categories.map((cat, idx) =>
                      <button
                        key={idx}
                        onClick={() => setSelectedCategory(cat)}
                        className={`w-full text-left px-5 py-3.5 rounded-2xl transition-all duration-300 flex items-center justify-between group ${selectedCategory === cat ?
                        "bg-proqblue text-white font-bold shadow-lg shadow-blue-200" :
                        "hover:bg-blue-50 text-slate-600 hover:text-proqblue"}`
                        } aria-label="Action">
                        
                          <span className="text-sm">{cat}</span>
                          {selectedCategory === cat &&
                        <motion.div layoutId="activeCat" className="w-1.5 h-1.5 bg-white rounded-full" />
                        }
                          {selectedCategory !== cat &&
                        <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all text-proqblue/40" />
                        }
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="p-6 border-t border-slate-100 bg-slate-50/50 rounded-b-3xl">
                    <div className="flex items-center gap-3 p-4 bg-blue-600 rounded-2xl text-white shadow-lg shadow-blue-100">
                      <div className="p-2 bg-white/20 rounded-lg">
                        <Sparkles className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-[10px] uppercase font-bold opacity-80">Mise à jour</p>
                        <p className="text-xs font-bold">Normes NS 2025</p>
                      </div>
                    </div>
                  </div>
                </div>
              </aside>

              {/* Document Results */}
              <div className="lg:w-3/4">
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-3">
                    <h2 className="text-2xl font-black text-slate-900 tracking-tight">Ressources <span className="text-proqblue">Techniques</span></h2>
                    <Badge variant="outline" className="bg-white text-slate-500 border-slate-200">
                      {filteredAssets?.length || 0} Documents
                    </Badge>
                  </div>

                  {isAdmin &&
                  <Button variant="outline" className="rounded-xl gap-2 border-proqblue text-proqblue hover:bg-proqblue/5 font-bold" onClick={() => navigate('/admin')}>
                      <Plus className="w-4 h-4" /> Ajouter une ressource
                    </Button>
                  }
                </div>

                <AnimatePresence mode="wait">
                  <motion.div
                    key={selectedCategory + searchTerm}
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    
                    {isLoading ?
                    Array(6).fill(0).map((_, i) =>
                    <div key={i} className="h-72 bg-white border border-slate-100 rounded-3xl animate-pulse flex flex-col p-6 space-y-4">
                          <div className="w-12 h-12 bg-slate-100 rounded-2xl" />
                          <div className="h-6 w-3/4 bg-slate-100 rounded-lg" />
                          <div className="h-20 w-full bg-slate-100 rounded-xl" />
                        </div>
                    ) :
                    filteredAssets?.length === 0 ?
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="col-span-full py-20 text-center bg-white rounded-3xl border-2 border-dashed border-slate-200">
                      
                        <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                          <Search className="w-10 h-10 text-slate-300" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-900">Aucun document trouvé</h3>
                        <p className="text-slate-500 max-w-xs mx-auto mt-2">Nous n'avons trouvé aucun résultat pour "{searchTerm}". Essayez une autre catégorie.</p>
                        <Button variant="ghost" className="mt-6 text-proqblue font-bold" onClick={() => {setSearchTerm("");setSelectedCategory("Tous les documents");}}>
                          Réinitialiser les filtres
                        </Button>
                      </motion.div> :
                    filteredAssets?.map((doc) =>
                    <motion.div
                      key={doc.id}
                      variants={itemVariants}
                      whileHover={{ y: -5, transition: { duration: 0.2 } }}
                      className={`group bg-white border ${doc.monetization_active ? 'border-amber-200 ring-4 ring-amber-500/5' : 'border-slate-100'} p-8 rounded-[2.5rem] shadow-sm hover:shadow-2xl hover:shadow-blue-500/10 transition-all duration-300 flex flex-col h-full relative overflow-hidden`}>
                      
                        {doc.monetization_active &&
                      <div className="absolute top-0 right-0">
                            <div className="bg-gradient-to-r from-amber-400 to-amber-600 text-white text-[10px] font-black py-1.5 px-10 transform rotate-45 translate-x-5 translate-y-2 shadow-lg">
                              PREMIUM
                            </div>
                          </div>
                      }

                        <div className="flex items-start justify-between mb-6">
                          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg transition-transform group-hover:scale-110 duration-500 ${doc.monetization_active ? 'bg-amber-50 text-amber-600 shadow-amber-200/20' : 'bg-blue-50 text-proqblue shadow-blue-200/20'}`
                        }>
                            {doc.category === "Guides" ? <Book className="w-7 h-7" /> : <FileText className="w-7 h-7" />}
                          </div>
                          <div className="text-right">
                            <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest leading-none">{doc.asset_type}</p>
                            <p className="text-xs font-bold text-slate-400 mt-1">{doc.file_size || '---'}</p>
                          </div>
                        </div>

                        <h3 className="text-xl font-black text-slate-900 mb-4 leading-tight group-hover:text-proqblue transition-colors">
                          {doc.title}
                        </h3>

                        <p className="text-slate-500 text-sm leading-relaxed mb-8 flex-1 line-clamp-3">
                          {doc.description || "Guide technique officiel PROQUELEC pour la conformité et la sécurité des installations."}
                        </p>

                        <div className="pt-6 border-t border-slate-50 mt-auto flex items-center justify-between">
                          <div className="flex flex-col">
                            <div className="flex items-center gap-1.5 mb-1">
                              <div className="w-1.5 h-1.5 rounded-full bg-proqblue"></div>
                              <span className="text-[10px] font-black text-proqblue uppercase tracking-tighter">
                                {doc.category}
                              </span>
                            </div>
                            {doc.monetization_active ?
                          <span className="text-lg font-black text-amber-600 tracking-tighter">
                                {doc.price_fcfy.toLocaleString()} <span className="text-[10px] font-bold">FCFA</span>
                              </span> :

                          <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">
                                Gratuit
                              </span>
                          }
                          </div>

                          <Button
                          onClick={() => handleDownload(doc)}
                          className={`rounded-2xl h-12 px-6 font-black text-sm gap-2 transition-all active:scale-95 ${doc.monetization_active ?
                          'bg-amber-500 hover:bg-amber-600 text-white shadow-lg shadow-amber-200' :
                          'bg-slate-100 hover:bg-proqblue text-slate-900 hover:text-white border-transparent'}`
                          }>
                          
                            {doc.monetization_active ? <Wallet2 className="w-4 h-4" /> : <Download className="w-4 h-4" />}
                            {doc.monetization_active ? "Débloquer" : "Télécharger"}
                          </Button>
                        </div>
                      </motion.div>
                    )}
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>
          </div>
        </section>

        {/* Informational Section */}
        <section className="py-24 bg-white relative overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-12">
            {[
            { icon: ShieldAlert, title: "Conformité", desc: "Tous nos documents sont visés par le comité technique et conformes aux normes sénégalaises." },
            { icon: Zap, title: "Mises à jour", desc: "Abonnez-vous pour recevoir les dernières révisions dès leur publication officielle." },
            { icon: Info, title: "Support", desc: "Besoin d'un document spécifique ? Contactez notre centre de documentation technique." }].
            map((item, i) =>
            <div key={i} className="flex flex-col items-center text-center group">
                <div className="w-16 h-16 bg-slate-50 rounded-3xl flex items-center justify-center mb-6 group-hover:bg-proqblue group-hover:text-white transition-all duration-500 group-hover:rotate-6 shadow-sm border border-slate-100">
                  <item.icon className="w-8 h-8" />
                </div>
                <h4 className="text-xl font-black text-slate-900 mb-3 uppercase tracking-tighter">{item.title}</h4>
                <p className="text-slate-500 text-sm leading-relaxed">{item.desc}</p>
              </div>
            )}
          </div>
        </section>

        {/* CTA Banner */}
        <section className="px-4 mb-20">
          <div className="max-w-7xl mx-auto rounded-[3rem] bg-slate-900 p-12 md:p-20 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-proqblue/20 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2 group-hover:bg-proqblue/30 transition-colors duration-1000"></div>
            <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-blue-600/10 rounded-full blur-[100px] translate-y-1/3 -translate-x-1/3"></div>

            <div className="relative z-10 max-w-2xl">
              <span className="inline-flex items-center gap-2 bg-blue-500/20 text-blue-400 px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest mb-8 border border-blue-500/30">
                <Mail className="w-3 h-3" /> Veille Réglementaire
              </span>
              <h2 className="text-4xl md:text-5xl font-black text-white mb-8 leading-[1.1] tracking-tighter italic">
                Ne manquez aucune <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300">évolution normative.</span>
              </h2>
              <p className="text-slate-400 text-lg mb-10 leading-relaxed">
                Inscrivez-vous à notre newsletter technique pour recevoir les alertes sur les nouveaux guides et amendements directement dans votre boîte mail.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 max-w-lg">
                <Input
                  className="h-14 bg-white/5 border-white/10 text-white rounded-2xl px-6 focus:ring-proqblue focus:bg-white/10 transition-all"
                  placeholder="votre@email.com" />
                
                <Button className="h-14 bg-proqblue hover:bg-proqblue-dark text-white rounded-2xl px-10 font-black shadow-xl shadow-blue-950 transition-all active:scale-95">
                  Rejoindre la veille
                </Button>
              </div>
            </div>

            <div className="hidden lg:block absolute right-20 top-1/2 -translate-y-1/2">
              <motion.div
                animate={{ y: [0, -20, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="w-64 h-[400px] bg-white/5 border border-white/10 rounded-3xl backdrop-blur-sm p-8 shadow-2xl relative">
                
                <div className="space-y-6">
                  <div className="h-4 w-12 bg-white/10 rounded-full" />
                  <div className="h-10 w-full bg-white/10 rounded-xl" />
                  <div className="space-y-2">
                    <div className="h-2 w-full bg-white/5 rounded-full" />
                    <div className="h-2 w-full bg-white/5 rounded-full" />
                    <div className="h-2 w-2/3 bg-white/5 rounded-full" />
                  </div>
                  <div className="pt-8 grid grid-cols-2 gap-4">
                    <div className="aspect-square bg-blue-500/20 rounded-2xl" />
                    <div className="aspect-square bg-white/5 rounded-2xl" />
                  </div>
                  <div className="h-12 w-full bg-blue-600 rounded-2xl shadow-lg shadow-blue-900" />
                </div>
                {/* Decorative floaters */}
                <div className="absolute -top-10 -right-10 w-24 h-24 bg-proqblue rounded-full blur-3xl opacity-20"></div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Futuristic Payment Modal */}
        <Dialog open={!!purchaseAsset} onOpenChange={(open) => !open && setPurchaseAsset(null)}>
          <DialogContent className="sm:max-w-md bg-white border-none shadow-2xl overflow-hidden p-0 rounded-[3rem]">
            <AnimatePresence mode="wait">
              {paymentStep === "method" &&
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                key="step-method">
                
                  <div className="bg-slate-900 text-white p-10 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-48 h-48 bg-proqblue/40 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2"></div>
                    <Badge className="bg-proqblue/20 text-proqblue border-proqblue/30 mb-4 px-3 py-1 font-black uppercase tracking-widest text-[9px]">Paiement Sécurisé</Badge>
                    <h2 className="text-3xl font-black mb-1 relative z-10 italic uppercase tracking-tighter italic">Accès <span className="text-proqblue">Premium</span></h2>
                    <p className="text-slate-400 text-sm relative z-10">Choisissez votre solution de paiement mobile</p>
                  </div>

                  <div className="p-10 space-y-6">
                    <div className="bg-slate-50 border border-slate-100 p-6 rounded-3xl flex items-center justify-between mb-8 group cursor-default">
                      <div>
                        <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-1">Ressource sélectionnée</p>
                        <p className="font-black text-slate-900 line-clamp-1">{purchaseAsset?.title}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] text-proqblue font-black uppercase tracking-widest mb-1">Montant</p>
                        <p className="text-2xl font-black text-proqblue tracking-tighter">{purchaseAsset?.price_fcfy.toLocaleString()}<span className="text-[10px] ml-1">CFA</span></p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 gap-3">
                      {[
                    { id: "om", name: "Orange Money", icon: Smartphone, color: "text-orange-500", bg: "hover:bg-orange-50/50 hover:border-orange-200" },
                    { id: "wave", name: "Wave Money", icon: Wallet, color: "text-blue-500", bg: "hover:bg-blue-50/50 hover:border-blue-200" },
                    { id: "paydunya", name: "Paydunya", icon: CreditCard, color: "text-emerald-600", bg: "hover:bg-emerald-50/50 hover:border-emerald-200" }].
                    map((method) =>
                    <button
                      key={method.id}
                      onClick={() => setSelectedMethod(method.id)}
                      className={`flex items-center gap-5 p-5 rounded-2xl border-2 transition-all duration-300 ${selectedMethod === method.id ?
                      "border-proqblue bg-blue-50 ring-4 ring-proqblue/5" :
                      "border-slate-50 hover:border-slate-200 bg-slate-50/30"} ${
                      method.bg}`} aria-label="Action">
                      
                          <div className={`w-12 h-12 rounded-xl bg-white shadow-md flex items-center justify-center ${method.color} transition-transform group-active:scale-90`}>
                            <method.icon className="w-6 h-6" />
                          </div>
                          <span className="font-black text-slate-700 uppercase tracking-tighter">{method.name}</span>
                          {selectedMethod === method.id &&
                      <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="ml-auto w-6 h-6 bg-proqblue rounded-full flex items-center justify-center">
                              <CheckCircle2 className="w-4 h-4 text-white" />
                            </motion.div>
                      }
                        </button>
                    )}
                    </div>

                    <Button
                    disabled={!selectedMethod}
                    onClick={simulatePayment}
                    className="w-full h-16 bg-slate-900 hover:bg-black text-white rounded-2xl font-black text-lg mt-6 shadow-xl shadow-slate-200 transition-all active:scale-95 group overflow-hidden relative">
                    
                      <span className="relative z-10 flex items-center gap-3">
                        Générer l'accès <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                      </span>
                      <motion.div
                      initial={{ x: '-100%' }}
                      whileHover={{ x: '100%' }}
                      transition={{ duration: 0.6 }}
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
                    
                    </Button>
                    <p className="text-[9px] text-center text-slate-400 font-bold uppercase tracking-[0.2em] pt-2">Système de transaction certifié PCI-DSS</p>
                  </div>
                </motion.div>
              }

              {paymentStep === "simulating" &&
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.1 }}
                key="step-simulating"
                className="p-16 text-center flex flex-col items-center justify-center space-y-8">
                
                  <div className="relative">
                    <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    className="w-32 h-32 border-4 border-slate-50 border-t-proqblue rounded-full" />
                  
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Smartphone className="w-10 h-10 text-proqblue animate-pulse" />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-2xl font-black text-slate-900 mb-2 uppercase tracking-tighter italic">Vérification Mobile</h3>
                    <p className="text-slate-500 leading-relaxed">Veuillez autoriser le prélèvement sur votre application <span className="font-black text-proqblue uppercase underline decoration-proqblue/30 decoration-4 underline-offset-4">{selectedMethod}</span></p>
                  </div>
                  <div className="flex gap-1.5">
                    {[0, 1, 2].map((i) =>
                  <motion.div
                    key={i}
                    animate={{ opacity: [0.3, 1, 0.3] }}
                    transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
                    className="w-2 h-2 rounded-full bg-proqblue" />

                  )}
                  </div>
                </motion.div>
              }

              {paymentStep === "success" &&
              <motion.div
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                key="step-success"
                className="p-16 text-center flex flex-col items-center justify-center space-y-8">
                
                  <div className="w-32 h-32 bg-emerald-50 rounded-[2.5rem] flex items-center justify-center shadow-2xl shadow-emerald-200/50 border border-emerald-100 relative">
                    <motion.div
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    className="text-emerald-500">
                    
                      <CheckCircle2 className="w-16 h-16" />
                    </motion.div>
                    <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: [0, 1, 0] }}
                    transition={{ duration: 1, repeat: Infinity }}
                    className="absolute inset-0 rounded-[2.5rem] ring-4 ring-emerald-400/20" />
                  
                  </div>
                  <div>
                    <h3 className="text-3xl font-black text-slate-900 mb-2 uppercase tracking-tighter italic">Succès !</h3>
                    <p className="text-slate-500">Transaction confirmée. <br />Le téléchargement a démarré automatiquement.</p>
                  </div>
                  <Button variant="outline" className="rounded-2xl h-12 px-8 font-black gap-2 border-slate-200" onClick={() => setPurchaseAsset(null)}>
                    Fermer
                  </Button>
                </motion.div>
              }
            </AnimatePresence>
          </DialogContent>
        </Dialog>
      </main>

      <Footer />
      <ScrollToTopButton aria-label="Action" />

      <style dangerouslySetInnerHTML={{
        __html: `
        @keyframes progress {
          0% { width: 0%; }
          100% { width: 100%; }
        }
        .animate-slow-spin {
          animation: spin 8s linear infinite;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      ` }} />
    </div>);

};

export default Documents;