import { useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { Home, ArrowLeft, Search, ZapOff, LifeBuoy } from "lucide-react"; // ZapOff fits the electrical theme perfectly
import { Button } from "@/components/ui/button";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { SEO } from "@/components/SEO";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <SEO
        title="Page Introuvable - PROQUELEC"
        description="La page que vous recherchez semble introuvable. Retournez à l'accueil pour continuer votre navigation sur le site officiel de PROQUELEC."
      />

      <Header solid={true} />

      <main className="flex-grow flex items-center justify-center relative overflow-hidden py-32 px-4">
        {/* Abstract Background Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-100 rounded-full blur-[150px] opacity-40"></div>
          <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-slate-200 rounded-full blur-[100px] opacity-40"></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] border border-slate-100 rounded-full opacity-30"></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] border border-slate-100 rounded-full opacity-30"></div>
        </div>

        <div className="relative z-10 text-center max-w-2xl mx-auto space-y-12">

          {/* Animated Icon */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="w-32 h-32 bg-white rounded-[2.5rem] shadow-2xl flex items-center justify-center mx-auto relative group"
          >
            <div className="absolute inset-0 bg-blue-50 rounded-[2.5rem] transform rotate-6 group-hover:rotate-0 transition-transform duration-500 -z-10"></div>
            <ZapOff className="w-16 h-16 text-slate-300 group-hover:text-blue-600 transition-colors duration-300" strokeWidth={1.5} />
          </motion.div>

          {/* Typography */}
          <div className="space-y-6">
            <motion.h1
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-8xl md:text-9xl font-black text-slate-900 tracking-tighter"
            >
              404
            </motion.h1>
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="space-y-4"
            >
              <h2 className="text-2xl md:text-3xl font-bold text-slate-700">
                Le courant ne passe pas ici.
              </h2>
              <p className="text-slate-500 text-lg max-w-md mx-auto leading-relaxed">
                La page que vous recherchez semble avoir été déconnectée ou n'a jamais existé.
              </p>
            </motion.div>
          </div>

          {/* Actions */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
          >
            <Button asChild size="lg" className="rounded-full px-8 py-6 font-bold text-base bg-blue-600 hover:bg-blue-700 shadow-lg hover:shadow-blue-500/20 transition-all hover:-translate-y-1">
              <Link to="/">
                <Home className="mr-2 h-5 w-5" />
                Retour à l'accueil
              </Link>
            </Button>

            <Button variant="outline" size="lg" className="rounded-full px-8 py-6 font-bold text-base border-2 hover:bg-slate-50 transition-all" onClick={() => window.history.back()}>
              <ArrowLeft className="mr-2 h-5 w-5" />
              Page précédente
            </Button>
          </motion.div>

          {/* Quick Links Suggestions */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="pt-12 border-t border-slate-100"
          >
            <p className="text-sm font-semibold text-slate-400 uppercase tracking-widest mb-6">Suggestions utiles</p>
            <div className="flex flex-wrap justify-center gap-4">
              {[
                { label: "À Propos", href: "/about", icon: LifeBuoy },
                { label: "Contact", href: "/contact", icon: Search },
                { label: "Utilité Publique", href: "/utilite-publique", icon: Home }
              ].map((link, i) => (
                <Link
                  key={i}
                  to={link.href}
                  className="flex items-center gap-2 px-5 py-2 bg-white border border-slate-100 rounded-full text-slate-600 hover:text-blue-600 hover:border-blue-100 hover:shadow-md transition-all text-sm font-medium"
                >
                  <link.icon className="w-4 h-4" />
                  {link.label}
                </Link>
              ))}
            </div>
          </motion.div>

        </div>
      </main>

      <Footer />
    </div>
  );
};

export default NotFound;
