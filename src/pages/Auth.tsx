import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useSession } from "@/hooks/useSession";
import { toast } from "sonner";
import {
  Zap, Building2, Users, Handshake,
  Eye, EyeOff, ArrowRight, ArrowLeft, Loader2 } from
"lucide-react";

type StepType = "login" | "signup" | "forgot";

const USER_ROLES = [
{
  value: "electricien",
  label: "Électricien",
  description: "Accédez aux outils métier, calculateurs et certifications",
  icon: Zap,
  color: "from-amber-500 to-orange-600",
  bgLight: "bg-amber-50 border-amber-200",
  textColor: "text-amber-700"
},
{
  value: "entreprise",
  label: "Entreprise",
  description: "Gérez votre équipe, documents et conformité",
  icon: Building2,
  color: "from-blue-500 to-indigo-600",
  bgLight: "bg-blue-50 border-blue-200",
  textColor: "text-blue-700"
},
{
  value: "membre",
  label: "Membre",
  description: "Rejoignez le réseau professionnel PROQUELEC",
  icon: Users,
  color: "from-emerald-500 to-teal-600",
  bgLight: "bg-emerald-50 border-emerald-200",
  textColor: "text-emerald-700"
},
{
  value: "partner",
  label: "Partenaire",
  description: "Collaborez avec PROQUELEC sur des projets",
  icon: Handshake,
  color: "from-violet-500 to-purple-600",
  bgLight: "bg-violet-50 border-violet-200",
  textColor: "text-violet-700"
}];


/** Map role → dashboard path after login */
function getDashboardForRole(role: string): string {
  switch (role) {
    case "admin":
      return "/dashboard";
    case "secondary_admin":
      return "/admin-secondary";
    case "electricien":
      return "/dashboard/electricien";
    case "entreprise":
      return "/dashboard/entreprise";
    case "membre":
      return "/dashboard/membre";
    case "partner":
      return "/partner";
    default:
      return "/dashboard";
  }
}

export default function Auth() {
  const [step, setStep] = useState<StepType>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [company, setCompany] = useState("");
  const [selectedRole, setSelectedRole] = useState("membre");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const { login } = useSession();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim().toLowerCase(), password })
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Identifiants invalides");
      } else {
        login(data.access_token, data.user);
        const dest = getDashboardForRole(data.user.role);
        navigate(dest);
        toast.success("Connexion réussie !");
      }
    } catch {
      setError("Impossible de joindre le serveur");
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          password,
          full_name: fullName,
          phone,
          company,
          role: selectedRole
        })
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Erreur lors de l'inscription");
      } else {
        login(data.access_token, data.user);
        const dest = getDashboardForRole(data.user.role);
        navigate(dest);
        toast.success("Compte créé avec succès !");
      }
    } catch {
      setError("Impossible de joindre le serveur");
    } finally {
      setLoading(false);
    }
  };

  const handleForgot = (e: React.FormEvent) => {
    e.preventDefault();
    toast.info(
      "Un email de réinitialisation sera envoyé si ce compte existe."
    );
  };

  const currentRole = USER_ROLES.find((r) => r.value === selectedRole);

  return (
    <main className="min-h-screen flex items-center justify-center px-4 py-20 sm:py-24 bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/40">
      {/* Decorative background */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full bg-blue-200/20 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-indigo-200/20 blur-3xl" />
      </div>

      <div className="w-full max-w-md">
        {/* Logo */}
        <Link to="/" className="flex items-center justify-center gap-3 mb-8 group">
          <img
            src="/logo.png"
            alt="PROQUELEC"
            className="h-12 w-12 object-contain transition-transform group-hover:scale-110"
            onError={(e) => {
              (e.target as HTMLImageElement).src = "/favicon.ico";
            }} loading="lazy" />
          
          <div>
            <h1 className="text-xl font-black text-slate-800 tracking-tight">
              PROQUELEC
            </h1>
            <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest">
              Espace Professionnel
            </p>
          </div>
        </Link>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
          {/* Header tabs */}
          <div className="flex border-b border-slate-100">
            <button
              onClick={() => {setStep("login");setError(null);}}
              className={`flex-1 py-4 text-sm font-bold transition-all ${step === "login" ?
              "text-blue-700 border-b-2 border-blue-600 bg-blue-50/50" :
              "text-slate-400 hover:text-slate-600"}`
              }>
              
              Connexion
            </button>
            <button
              onClick={() => {setStep("signup");setError(null);}}
              className={`flex-1 py-4 text-sm font-bold transition-all ${step === "signup" ?
              "text-blue-700 border-b-2 border-blue-600 bg-blue-50/50" :
              "text-slate-400 hover:text-slate-600"}`
              }>
              
              Inscription
            </button>
          </div>

          <div className="p-6 sm:p-8">
            {/* ─── LOGIN ─── */}
            {step === "login" &&
            <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">
                    Email
                  </label>
                  <input
                  type="email"
                  required
                  disabled={loading}
                  placeholder="votre@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900
                               focus:bg-white focus:border-blue-400 focus:ring-2 focus:ring-blue-100
                               disabled:opacity-50 transition-all placeholder:text-slate-400 outline-none" />

                

                


                
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">
                    Mot de passe
                  </label>
                  <div className="relative">
                    <input
                    type={showPassword ? "text" : "password"}
                    required
                    disabled={loading}
                    autoComplete="current-password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-3 pr-12 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900
                                 focus:bg-white focus:border-blue-400 focus:ring-2 focus:ring-blue-100
                                 disabled:opacity-50 transition-all placeholder:text-slate-400 outline-none" />

                  

                  


                  
                    <button
                    type="button"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 z-10 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition"
                    aria-label={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}>
                    
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {error &&
              <div className="bg-red-50 text-red-700 text-sm p-3 rounded-xl border border-red-100 flex items-center gap-2">
                    <span>⚠️</span> {error}
                  </div>
              }

                {import.meta.env.DEV && (
                  <div className="rounded-2xl border border-yellow-200 bg-yellow-50 p-3 text-sm text-yellow-900 space-y-2">
                    <div className="font-semibold">Mode développement</div>
                    <div>Utilisez <strong>admin@proquelec.sn</strong> / <strong>passepartout</strong> pour tester la connexion.</div>
                    <button
                      type="button"
                      onClick={() => {
                        setEmail('admin@proquelec.sn');
                        setPassword('passepartout');
                      }}
                      className="inline-flex items-center gap-2 rounded-xl border border-yellow-300 bg-yellow-100 px-3 py-2 text-xs font-semibold text-yellow-900 hover:bg-yellow-200 transition">
                      Pré-remplir les identifiants de dev
                    </button>
                  </div>
                )}

                <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold rounded-xl
                             hover:from-blue-700 hover:to-indigo-700 disabled:opacity-60 transition-all
                             flex items-center justify-center gap-2 shadow-lg shadow-blue-200/40" aria-label="Action">

                

                


                
                  {loading ?
                <><Loader2 className="w-4 h-4 animate-spin" /> Connexion...</> :

                <>Se connecter <ArrowRight className="w-4 h-4" /></>
                }
                </button>

                <div className="text-center">
                  <button
                  type="button"
                  onClick={() => {setStep("forgot");setError(null);}}
                  className="text-xs text-slate-500 hover:text-blue-600 font-medium transition">
                  
                    Mot de passe oublié ?
                  </button>
                </div>
              </form>
            }

            {/* ─── SIGNUP ─── */}
            {step === "signup" &&
            <form onSubmit={handleSignup} className="space-y-4">
                {/* Role selector */}
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-2 uppercase tracking-wide">
                    Type de profil
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {USER_ROLES.map((role) => {
                    const Icon = role.icon;
                    const isSelected = selectedRole === role.value;
                    return (
                      <button
                        key={role.value}
                        type="button"
                        onClick={() => setSelectedRole(role.value)}
                        className={`relative p-3 rounded-xl border-2 text-left transition-all duration-200 ${isSelected ?
                        `${role.bgLight} border-current ${role.textColor} shadow-sm` :
                        "border-slate-100 hover:border-slate-200 bg-slate-50/50"}`
                        } aria-label="Action">
                        
                          <Icon className={`w-5 h-5 mb-1 ${isSelected ? role.textColor : "text-slate-400"}`} />
                          <div className={`text-xs font-bold ${isSelected ? role.textColor : "text-slate-600"}`}>
                            {role.label}
                          </div>
                          {isSelected &&
                        <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-current" />
                        }
                        </button>);

                  })}
                  </div>
                  {currentRole &&
                <p className="text-[11px] text-slate-500 mt-2 pl-1">
                      {currentRole.description}
                    </p>
                }
                </div>

                {/* Name */}
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">
                    Nom complet
                  </label>
                  <input
                  type="text"
                  disabled={loading}
                  placeholder="Votre nom complet"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900
                               focus:bg-white focus:border-blue-400 focus:ring-2 focus:ring-blue-100
                               disabled:opacity-50 transition-all placeholder:text-slate-400 outline-none" />

                

                


                
                </div>

                {/* Email */}
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">
                    Email *
                  </label>
                  <input
                  type="email"
                  required
                  disabled={loading}
                  placeholder="votre@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900
                               focus:bg-white focus:border-blue-400 focus:ring-2 focus:ring-blue-100
                               disabled:opacity-50 transition-all placeholder:text-slate-400 outline-none" />

                

                


                
                </div>

                {/* Password */}
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">
                    Mot de passe *
                  </label>
                  <div className="relative">
                    <input
                    type={showPassword ? "text" : "password"}
                    required
                    minLength={6}
                    disabled={loading}
                    placeholder="6 caractères minimum"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-3 pr-12 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900
                                 focus:bg-white focus:border-blue-400 focus:ring-2 focus:ring-blue-100
                                 disabled:opacity-50 transition-all placeholder:text-slate-400 outline-none" />

                  

                  


                  
                    <button
                    type="button"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 z-10 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition"
                    aria-label={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}>
                    
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Phone (optional) */}
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">
                    Téléphone <span className="text-slate-400 normal-case">(optionnel)</span>
                  </label>
                  <input
                  type="tel"
                  disabled={loading}
                  placeholder="+221 77 000 00 00"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900
                               focus:bg-white focus:border-blue-400 focus:ring-2 focus:ring-blue-100
                               disabled:opacity-50 transition-all placeholder:text-slate-400 outline-none" />

                

                


                
                </div>

                {/* Company (for entreprise role) */}
                {(selectedRole === "entreprise" || selectedRole === "partner") &&
              <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">
                      Société / Organisation
                    </label>
                    <input
                  type="text"
                  disabled={loading}
                  placeholder="Nom de votre société"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900
                                 focus:bg-white focus:border-blue-400 focus:ring-2 focus:ring-blue-100
                                 disabled:opacity-50 transition-all placeholder:text-slate-400 outline-none" />

                

                


                
                  </div>
              }

                {error &&
              <div className="bg-red-50 text-red-700 text-sm p-3 rounded-xl border border-red-100 flex items-center gap-2">
                    <span>⚠️</span> {error}
                  </div>
              }

                <button
                type="submit"
                disabled={loading}
                className={`w-full py-3.5 bg-gradient-to-r ${currentRole?.color || "from-blue-600 to-indigo-600"} text-white font-bold rounded-xl
                             hover:opacity-90 disabled:opacity-60 transition-all
                             flex items-center justify-center gap-2 shadow-lg shadow-blue-200/40`} aria-label="Action">
                
                  {loading ?
                <><Loader2 className="w-4 h-4 animate-spin" /> Création...</> :

                <>Créer mon compte {currentRole?.label} <ArrowRight className="w-4 h-4" /></>
                }
                </button>
              </form>
            }

            {/* ─── FORGOT PASSWORD ─── */}
            {step === "forgot" &&
            <form onSubmit={handleForgot} className="space-y-4">
                <div className="text-center mb-2">
                  <p className="text-sm text-slate-600">
                    Entrez votre email pour recevoir un lien de réinitialisation.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">
                    Email
                  </label>
                  <input
                  type="email"
                  required
                  disabled={loading}
                  placeholder="votre@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900
                               focus:bg-white focus:border-blue-400 focus:ring-2 focus:ring-blue-100
                               disabled:opacity-50 transition-all placeholder:text-slate-400 outline-none" />

                

                


                
                </div>

                {error &&
              <div className="bg-red-50 text-red-700 text-sm p-3 rounded-xl border border-red-100 flex items-center gap-2">
                    <span>⚠️</span> {error}
                  </div>
              }

                <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold rounded-xl
                             hover:from-blue-700 hover:to-indigo-700 disabled:opacity-60 transition-all
                             flex items-center justify-center gap-2 shadow-lg shadow-blue-200/40">

                

                


                
                  Envoyer le lien
                </button>

                <div className="text-center">
                  <button
                  type="button"
                  onClick={() => {setStep("login");setError(null);}}
                  className="text-xs text-slate-500 hover:text-blue-600 font-medium transition inline-flex items-center gap-1">
                  
                    <ArrowLeft className="w-3 h-3" /> Retour à la connexion
                  </button>
                </div>
              </form>
            }
          </div>
        </div>

        {/* Footer note */}
        <p className="text-center text-[11px] text-slate-400 mt-6">
          En vous inscrivant, vous acceptez les{" "}
          <Link to="/legal" className="text-blue-500 hover:underline">
            conditions d'utilisation
          </Link>{" "}
          de PROQUELEC.
        </p>
      </div>
    </main>);

}