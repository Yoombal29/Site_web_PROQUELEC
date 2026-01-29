
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { HeroSection } from "@/components/HeroSection";
import { SEO } from "@/components/SEO";
import { ScrollToTopButton } from "@/components/ScrollToTopButton";
import {
  FileText,
  Download,
  Search,
  Filter,
  FileCheck,
  ShieldAlert,
  Info,
  Book
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAssets, Asset } from "@/hooks/useAssets";
import { useSession } from "@/hooks/useSession";
import { toast } from "sonner";
import {
  CreditCard,
  Smartphone,
  Wallet,
  CheckCircle2,
  XCircle,
  Loader2,
  Lock,
  Wallet2
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from "@/components/ui/dialog";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";

const Documents = () => {
  const { user } = useSession();
  const [selectedCategory, setSelectedCategory] = useState("Tous les documents");
  const { data: assets, isLoading } = useAssets(selectedCategory);
  const [searchTerm, setSearchTerm] = useState("");
  const [purchaseAsset, setPurchaseAsset] = useState<Asset | null>(null);
  const [paymentStep, setPaymentStep] = useState<"method" | "simulating" | "success">("method");
  const [selectedMethod, setSelectedMethod] = useState<string | null>(null);

  const categories = [
    "Tous les documents",
    "Guides",
    "Mémentos",
    "Sécurité",
    "Réglementation"
  ];

  const handleDownload = async (asset: Asset) => {
    if (asset.monetization_active && !asset.is_premium) {
      // Logic for generic pay-per-view if not handled by premium
    }

    if (asset.monetization_active) {
      // Check if user has already purchased (simulated check for now)
      setPurchaseAsset(asset);
      setPaymentStep("method");
      return;
    }

    // Direct download for free assets
    window.open(asset.file_url, '_blank');

    // Increment download count
    await supabase.from("site_assets").update({ download_stats: (asset.download_stats || 0) + 1 }).eq("id", asset.id);
  };

  const simulatePayment = async () => {
    setPaymentStep("simulating");
    // Futuristic simulation delay
    await new Promise(resolve => setTimeout(resolve, 2500));
    setPaymentStep("success");
    toast.success("Paiement réussi ! Votre téléchargement commence.");

    // Small delay before closing and opening file
    setTimeout(() => {
      if (purchaseAsset) {
        window.open(purchaseAsset.file_url, '_blank');
        setPurchaseAsset(null);
      }
    }, 1500);
  };

  const filteredAssets = assets?.filter(asset =>
    asset.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    asset.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-white">
      <SEO
        title="Documents & Ressources - PROQUELEC"
        description="Accédez à notre bibliothèque de documents techniques, guides de sécurité et normes électriques pour les professionnels du Sénégal."
      />

      <Header />

      <main>
        <HeroSection
          badge="Ressources Techniques"
          title="Documents & Ressources"
          subtitle="Votre bibliothèque d'expertise électrique"
          description="Accédez aux outils, guides et textes de référence pour garantir la conformité et la sécurité de vos installations."
          gradient="bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900"
          showSearch={true}
          searchPlaceholder="Rechercher un document..."
        />

        {/* Content Section */}
        <section className="py-16 px-4">
          <div className="max-w-7xl mx-auto">
            {/* Filters and Controls */}
            <div className="flex flex-col lg:flex-row gap-8 mb-12">
              <div className="lg:w-1/4">
                <div className="bg-slate-50 p-6 rounded-2xl sticky top-24">
                  <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
                    <Filter className="w-5 h-5 text-blue-600" />
                    Catégories
                  </h3>
                  <div className="space-y-2">
                    {categories.map((cat, idx) => (
                      <button
                        key={idx}
                        onClick={() => setSelectedCategory(cat)}
                        className={`w-full text-left px-4 py-3 rounded-xl transition-all ${selectedCategory === cat
                          ? "bg-blue-600 text-white font-semibold shadow-md"
                          : "hover:bg-slate-200 text-slate-600"
                          }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Document Grid */}
              <div className="lg:w-3/4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {isLoading ? (
                    Array(4).fill(0).map((_, i) => (
                      <div key={i} className="h-64 bg-slate-100 rounded-2xl animate-pulse" />
                    ))
                  ) : filteredAssets?.length === 0 ? (
                    <div className="col-span-full py-12 text-center bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
                      <Search className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                      <h3 className="text-xl font-bold text-slate-900">Aucun document trouvé</h3>
                      <p className="text-slate-500">Essayez d'autres termes ou catégories.</p>
                    </div>
                  ) : filteredAssets?.map((doc, idx) => (
                    <div
                      key={doc.id}
                      className={`group bg-white border ${doc.monetization_active ? 'border-amber-200 shadow-amber-50' : 'border-slate-200'} p-6 rounded-2xl hover:shadow-xl transition-all duration-300 flex flex-col h-full relative overflow-hidden`}
                    >
                      {doc.monetization_active && (
                        <div className="absolute top-0 right-0">
                          <div className="bg-amber-500 text-white text-[10px] font-bold py-1 px-8 transform rotate-45 translate-x-3 translate-y-1 shadow-sm">
                            PREMIUM
                          </div>
                        </div>
                      )}

                      <div className="flex items-start justify-between mb-4">
                        <div className={`p-3 rounded-xl ${doc.monetization_active ? 'bg-amber-50 text-amber-600' : 'bg-blue-50 text-blue-600'}`}>
                          {doc.category === "Guides" ? <Book className="w-6 h-6" /> : <FileText className="w-6 h-6" />}
                        </div>
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">{doc.asset_type} • {doc.file_size}</span>
                      </div>

                      <h3 className="text-xl font-bold text-slate-900 mb-3 group-hover:text-blue-600 transition-colors">
                        {doc.title}
                      </h3>

                      <p className="text-slate-600 text-sm leading-relaxed mb-6 flex-1">
                        {doc.description || "Consultez les ressources techniques de référence de PROQUELEC pour vos installations."}
                      </p>

                      <div className="pt-4 border-t border-slate-100 mt-auto flex items-center justify-between">
                        <div className="flex flex-col gap-1">
                          <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-3 py-1 rounded-full w-fit">
                            {doc.category}
                          </span>
                          {doc.monetization_active && (
                            <span className="text-sm font-bold text-amber-600">
                              {doc.price_fcfy.toLocaleString()} FCFA
                            </span>
                          )}
                        </div>
                        <Button
                          onClick={() => handleDownload(doc)}
                          variant={doc.monetization_active ? "default" : "ghost"}
                          className={`${doc.monetization_active ? 'bg-amber-500 hover:bg-amber-600 text-white' : 'text-blue-600 hover:bg-blue-50'} flex items-center gap-2 font-bold`}
                        >
                          {doc.monetization_active ? <Wallet2 className="w-4 h-4" /> : <Download className="w-4 h-4" />}
                          {doc.monetization_active ? "Acheter" : "Télécharger"}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Newsletter / Info */}
        <section className="bg-slate-900 py-16 px-4 text-white overflow-hidden relative">
          <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl"></div>
          <div className="max-w-4xl mx-auto text-center relative z-10">
            <h2 className="text-3xl font-bold mb-6">Restez informé des mises à jour</h2>
            <p className="text-lg text-slate-300 mb-10 max-w-2xl mx-auto">
              Inscrivez-vous pour recevoir une notification dès qu'un nouveau document technique ou une mise à jour normative est publiée.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 max-w-lg mx-auto">
              <Input
                className="h-12 bg-white/10 border-white/20 text-white placeholder:text-slate-500 focus:ring-blue-500"
                placeholder="Votre adresse email"
              />
              <Button className="h-12 bg-blue-600 hover:bg-blue-700 px-8 font-bold">
                S'abonner
              </Button>
            </div>
          </div>
        </section>

        {/* Futuristic Payment Modal */}
        <Dialog open={!!purchaseAsset} onOpenChange={(open) => !open && setPurchaseAsset(null)}>
          <DialogContent className="sm:max-w-md bg-white border-2 border-slate-100 shadow-2xl overflow-hidden p-0 rounded-3xl">
            {paymentStep === "method" && (
              <div className="animate-in fade-in zoom-in duration-300">
                <div className="bg-slate-900 text-white p-6 relative">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/30 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                  <h2 className="text-xl font-bold mb-1 relative z-10">Accès Premium</h2>
                  <p className="text-slate-400 text-sm relative z-10">Choisissez votre mode de paiement sécurisé</p>
                </div>

                <div className="p-6 space-y-4">
                  <div className="bg-blue-50 border border-blue-100 p-4 rounded-2xl flex items-center justify-between mb-6">
                    <div>
                      <p className="text-xs text-blue-600 font-bold uppercase tracking-wider">Document</p>
                      <p className="font-bold text-slate-900 line-clamp-1">{purchaseAsset?.title}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-blue-600 font-bold uppercase tracking-wider">Prix</p>
                      <p className="font-black text-blue-700">{purchaseAsset?.price_fcfy.toLocaleString()} FCFA</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-3">
                    {[
                      { id: "om", name: "Orange Money", icon: Smartphone, color: "text-orange-500", bg: "hover:bg-orange-50" },
                      { id: "wave", name: "Wave", icon: Wallet, color: "text-blue-500", bg: "hover:bg-blue-50" },
                      { id: "paydunya", name: "Paydunya (Visa/MC)", icon: CreditCard, color: "text-green-600", bg: "hover:bg-green-50" }
                    ].map((method) => (
                      <button
                        key={method.id}
                        onClick={() => setSelectedMethod(method.id)}
                        className={`flex items-center gap-4 p-4 rounded-2xl border-2 transition-all ${selectedMethod === method.id
                            ? "border-blue-600 bg-blue-50 ring-2 ring-blue-600/20"
                            : "border-slate-100 hover:border-slate-200"
                          } ${method.bg}`}
                      >
                        <div className={`p-2 rounded-lg bg-white shadow-sm ${method.color}`}>
                          <method.icon className="w-6 h-6" />
                        </div>
                        <span className="font-bold text-slate-700">{method.name}</span>
                        {selectedMethod === method.id && <CheckCircle2 className="w-5 h-5 ml-auto text-blue-600" />}
                      </button>
                    ))}
                  </div>

                  <Button
                    disabled={!selectedMethod}
                    onClick={simulatePayment}
                    className="w-full h-14 bg-slate-900 hover:bg-black text-white rounded-2xl font-bold text-lg mt-4 shadow-lg shadow-slate-200 transition-transform active:scale-95"
                  >
                    Confirmer le paiement
                  </Button>
                </div>
              </div>
            )}

            {paymentStep === "simulating" && (
              <div className="p-12 text-center flex flex-col items-center justify-center space-y-6 animate-in fade-in duration-500">
                <div className="relative">
                  <div className="w-20 h-20 border-4 border-slate-100 rounded-full"></div>
                  <div className="w-20 h-20 border-4 border-t-blue-600 rounded-full animate-spin absolute top-0 left-0"></div>
                  <Smartphone className="w-8 h-8 text-blue-600 absolute top-6 left-6 animate-pulse" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900 mb-1 italic">Vérification sur votre mobile...</h3>
                  <p className="text-slate-500 text-sm">Veuillez valider la transaction sur l'application <span className="font-bold text-blue-600 uppercase">{selectedMethod}</span></p>
                </div>
                <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">Transaction sécurisée par chiffrement 256-bit</p>
              </div>
            )}

            {paymentStep === "success" && (
              <div className="p-12 text-center flex flex-col items-center justify-center space-y-6 animate-in zoom-in duration-500">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircle2 className="w-12 h-12 text-green-600" />
                </div>
                <div>
                  <h3 className="text-2xl font-black text-slate-900 mb-2">Paiement Confirmé !</h3>
                  <p className="text-slate-500">Merci de votre confiance. Votre guide est prêt.</p>
                </div>
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-green-500 animate-[progress_1.5s_ease-in-out]"></div>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </main>

      <Footer />
      <ScrollToTopButton />
    </div>
  );
};

export default Documents;
