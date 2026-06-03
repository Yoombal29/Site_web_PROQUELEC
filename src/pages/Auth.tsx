import { type FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useSession } from "@/hooks/useSession";
import { toast } from "sonner";
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  Briefcase,
  Building2,
  CheckCircle2,
  Eye,
  EyeOff,
  Handshake,
  Loader2,
  LockKeyhole,
  Mail,
  Phone,
  ShieldCheck,
  User,
  Users,
  Zap,
} from "lucide-react";

type StepType = "login" | "signup" | "forgot";

const USER_ROLES = [
  {
    value: "electricien",
    label: "Électricien",
    description: "Outils métier, calculateurs et certifications.",
    icon: Zap,
    color: "from-amber-500 to-orange-600",
    bgLight: "bg-amber-50 border-amber-200",
    textColor: "text-amber-700",
  },
  {
    value: "entreprise",
    label: "Entreprise",
    description: "Gestion d'équipe, documents et conformité.",
    icon: Building2,
    color: "from-blue-600 to-sky-600",
    bgLight: "bg-blue-50 border-blue-200",
    textColor: "text-blue-700",
  },
  {
    value: "membre",
    label: "Membre",
    description: "Accès au réseau professionnel PROQUELEC.",
    icon: Users,
    color: "from-emerald-500 to-teal-600",
    bgLight: "bg-emerald-50 border-emerald-200",
    textColor: "text-emerald-700",
  },
  {
    value: "partner",
    label: "Partenaire",
    description: "Collaboration sur projets et programmes.",
    icon: Handshake,
    color: "from-slate-800 to-blue-700",
    bgLight: "bg-slate-50 border-slate-300",
    textColor: "text-slate-800",
  },
];

const fieldClass =
  "h-12 w-full rounded-lg border border-slate-200 bg-white px-11 text-sm font-medium text-slate-900 shadow-sm shadow-slate-200/40 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 disabled:cursor-not-allowed disabled:opacity-60";

const labelClass =
  "mb-2 block text-[11px] font-bold uppercase text-slate-500";

const tabClass =
  "h-10 flex-1 rounded-md text-sm font-bold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2";

/** Map role -> dashboard path after login */
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

  const resetView = (nextStep: StepType) => {
    setStep(nextStep);
    setError(null);
  };

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim().toLowerCase(), password }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Identifiants invalides");
      } else {
        login(data.access_token, data.user);
        navigate(getDashboardForRole(data.user.role));
        toast.success("Connexion réussie !");
      }
    } catch {
      setError("Impossible de joindre le serveur");
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e: FormEvent) => {
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
          role: selectedRole,
        }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Erreur lors de l'inscription");
      } else {
        login(data.access_token, data.user);
        navigate(getDashboardForRole(data.user.role));
        toast.success("Compte créé avec succès !");
      }
    } catch {
      setError("Impossible de joindre le serveur");
    } finally {
      setLoading(false);
    }
  };

  const handleForgot = (e: FormEvent) => {
    e.preventDefault();
    toast.info("Un email de réinitialisation sera envoyé si ce compte existe.");
  };

  const currentRole = USER_ROLES.find((role) => role.value === selectedRole);

  return (
    <main className="min-h-[100svh] bg-[#f7f9fc] font-sans text-slate-950 [background-image:linear-gradient(135deg,rgba(35,118,223,0.08)_0%,transparent_34%),linear-gradient(180deg,rgba(255,255,255,0.92)_0%,rgba(247,249,252,0.98)_42%,rgba(235,241,247,0.88)_100%)]">
      <div className="mx-auto grid min-h-[100svh] w-full max-w-7xl items-stretch lg:grid-cols-[1.02fr_0.98fr]">
        <section className="relative hidden overflow-hidden border-r border-white/70 bg-slate-950 px-10 py-10 text-white lg:flex lg:flex-col lg:justify-between">
          <div className="absolute inset-0 opacity-90 [background-image:linear-gradient(135deg,rgba(35,118,223,0.28)_0%,rgba(15,23,42,0.08)_36%,rgba(251,191,36,0.16)_100%)]" />
          <div className="absolute inset-0 opacity-[0.08] [background-image:linear-gradient(rgba(255,255,255,0.8)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.8)_1px,transparent_1px)] [background-size:48px_48px]" />

          <div className="relative z-10">
            <Link to="/" className="inline-flex items-center gap-3">
              <span className="grid h-12 w-12 place-items-center rounded-lg bg-white shadow-xl shadow-blue-950/30">
                <img
                  src="/logo.png"
                  alt="PROQUELEC"
                  className="h-9 w-9 object-contain"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = "/favicon.ico";
                  }}
                />
              </span>
              <span>
                <span className="block text-lg font-black">PROQUELEC</span>
                <span className="block text-[10px] font-bold uppercase text-blue-100/80">
                  Espace professionnel
                </span>
              </span>
            </Link>
          </div>

          <div className="relative z-10 max-w-xl">
            <div className="mb-8 inline-flex items-center gap-2 rounded-lg border border-white/15 bg-white/10 px-3 py-2 text-xs font-bold uppercase text-blue-50">
              <ShieldCheck className="h-4 w-4 text-amber-300" />
              Accès sécurisé
            </div>
            <h1 className="max-w-lg text-5xl font-black leading-[1.02]">
              Un portail clair pour piloter votre conformité électrique.
            </h1>
            <p className="mt-5 max-w-md text-base leading-7 text-slate-200">
              Connectez-vous à votre espace PROQUELEC pour suivre vos dossiers,
              formations, documents et services professionnels.
            </p>

            <div className="mt-10 grid max-w-md gap-4">
              {[
                "Authentification professionnelle",
                "Tableaux de bord par profil",
                "Données protégées et centralisées",
              ].map((item) => (
                <div key={item} className="flex items-center gap-3 text-sm font-semibold text-slate-100">
                  <span className="grid h-8 w-8 place-items-center rounded-lg border border-white/10 bg-white/10">
                    <CheckCircle2 className="h-4 w-4 text-amber-300" />
                  </span>
                  {item}
                </div>
              ))}
            </div>
          </div>

          <div className="relative z-10 flex items-center justify-between border-t border-white/10 pt-6 text-xs font-semibold text-slate-300">
            <span>PROQUELEC Sénégal</span>
            <span>Qualité électrique</span>
          </div>
        </section>

        <section className="flex min-h-[100svh] items-center justify-center px-4 py-20 sm:px-6 lg:px-12">
          <div className="w-full max-w-[456px]">
            <div className="mb-8 flex items-center justify-between lg:hidden">
              <Link to="/" className="inline-flex items-center gap-3">
                <span className="grid h-11 w-11 place-items-center rounded-lg bg-white shadow-sm ring-1 ring-slate-200">
                  <img
                    src="/logo.png"
                    alt="PROQUELEC"
                    className="h-8 w-8 object-contain"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = "/favicon.ico";
                    }}
                  />
                </span>
                <span>
                  <span className="block text-base font-black text-slate-950">PROQUELEC</span>
                  <span className="block text-[10px] font-bold uppercase text-slate-500">
                    Espace professionnel
                  </span>
                </span>
              </Link>
            </div>

            <Link
              to="/"
              className="mb-6 hidden w-fit items-center gap-2 text-sm font-bold text-slate-500 transition hover:text-blue-700 lg:inline-flex"
            >
              <ArrowLeft className="h-4 w-4" />
              Retour au site
            </Link>

            <div className="rounded-lg border border-white bg-white/95 p-2 shadow-[0_30px_90px_rgba(15,23,42,0.12)] ring-1 ring-slate-200/70 backdrop-blur">
              <div className="rounded-md border border-slate-100 bg-slate-50 p-1">
                <div className="flex gap-1">
                  <button
                    type="button"
                    onClick={() => resetView("login")}
                    className={`${tabClass} ${
                      step === "login"
                        ? "bg-white text-slate-950 shadow-sm ring-1 ring-slate-200"
                        : "text-slate-500 hover:bg-white/70 hover:text-slate-800"
                    }`}
                  >
                    Connexion
                  </button>
                  <button
                    type="button"
                    onClick={() => resetView("signup")}
                    className={`${tabClass} ${
                      step === "signup"
                        ? "bg-white text-slate-950 shadow-sm ring-1 ring-slate-200"
                        : "text-slate-500 hover:bg-white/70 hover:text-slate-800"
                    }`}
                  >
                    Inscription
                  </button>
                </div>
              </div>

              <div className="px-4 pb-5 pt-7 sm:px-6">
                <div className="mb-7">
                  <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-lg bg-blue-50 text-blue-700 ring-1 ring-blue-100">
                    {step === "signup" ? (
                      <BadgeCheck className="h-5 w-5" />
                    ) : step === "forgot" ? (
                      <Mail className="h-5 w-5" />
                    ) : (
                      <ShieldCheck className="h-5 w-5" />
                    )}
                  </div>
                  <h2 className="text-2xl font-black text-slate-950">
                    {step === "signup"
                      ? "Créer un accès"
                      : step === "forgot"
                        ? "Réinitialisation"
                        : "Accéder à votre espace"}
                  </h2>
                  <p className="mt-2 text-sm leading-6 text-slate-500">
                    {step === "signup"
                      ? "Sélectionnez le profil adapté à votre activité."
                      : step === "forgot"
                        ? "Indiquez votre email pour lancer la procédure."
                        : "Connectez-vous avec vos identifiants professionnels."}
                  </p>
                </div>

                {step === "login" && (
                  <form onSubmit={handleLogin} className="space-y-5">
                    <div>
                      <label className={labelClass}>Email</label>
                      <div className="relative">
                        <Mail className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                        <input
                          type="email"
                          required
                          disabled={loading}
                          autoComplete="email"
                          placeholder="votre@email.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className={fieldClass}
                        />
                      </div>
                    </div>

                    <div>
                      <div className="mb-2 flex items-center justify-between">
                        <label className="block text-[11px] font-bold uppercase text-slate-500">
                          Mot de passe
                        </label>
                        <button
                          type="button"
                          onClick={() => resetView("forgot")}
                          className="text-xs font-bold text-slate-500 transition hover:text-blue-700"
                        >
                          Oublié ?
                        </button>
                      </div>
                      <div className="relative">
                        <LockKeyhole className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                        <input
                          type={showPassword ? "text" : "password"}
                          required
                          disabled={loading}
                          autoComplete="current-password"
                          placeholder="Mot de passe"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className={`${fieldClass} pr-12`}
                        />
                        <button
                          type="button"
                          onMouseDown={(e) => e.preventDefault()}
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 z-10 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-md text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                          aria-label={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>

                    {error && (
                      <div className="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                        <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                        <span>{error}</span>
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={loading}
                      className="flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-slate-950 px-5 text-sm font-black text-white shadow-lg shadow-slate-900/20 transition hover:-translate-y-0.5 hover:bg-blue-700 disabled:translate-y-0 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Connexion...
                        </>
                      ) : (
                        <>
                          Se connecter
                          <ArrowRight className="h-4 w-4" />
                        </>
                      )}
                    </button>
                  </form>
                )}

                {step === "signup" && (
                  <form onSubmit={handleSignup} className="space-y-5">
                    <div>
                      <label className={labelClass}>Type de profil</label>
                      <div className="grid grid-cols-2 gap-2">
                        {USER_ROLES.map((role) => {
                          const Icon = role.icon;
                          const isSelected = selectedRole === role.value;

                          return (
                            <button
                              key={role.value}
                              type="button"
                              onClick={() => setSelectedRole(role.value)}
                              className={`relative min-h-24 rounded-lg border p-3 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 ${
                                isSelected
                                  ? `${role.bgLight} ${role.textColor} shadow-sm`
                                  : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50"
                              }`}
                              aria-pressed={isSelected}
                            >
                              <Icon className={`mb-3 h-5 w-5 ${isSelected ? role.textColor : "text-slate-400"}`} />
                              <span className="block text-sm font-black leading-none">{role.label}</span>
                              {isSelected && (
                                <span className="absolute right-3 top-3 grid h-5 w-5 place-items-center rounded-full bg-white/80">
                                  <CheckCircle2 className="h-4 w-4" />
                                </span>
                              )}
                            </button>
                          );
                        })}
                      </div>
                      {currentRole && <p className="mt-2 text-xs font-medium text-slate-500">{currentRole.description}</p>}
                    </div>

                    <div>
                      <label className={labelClass}>Nom complet</label>
                      <div className="relative">
                        <User className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                        <input
                          type="text"
                          disabled={loading}
                          autoComplete="name"
                          placeholder="Votre nom complet"
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          className={fieldClass}
                        />
                      </div>
                    </div>

                    <div>
                      <label className={labelClass}>Email *</label>
                      <div className="relative">
                        <Mail className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                        <input
                          type="email"
                          required
                          disabled={loading}
                          autoComplete="email"
                          placeholder="votre@email.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className={fieldClass}
                        />
                      </div>
                    </div>

                    <div>
                      <label className={labelClass}>Mot de passe *</label>
                      <div className="relative">
                        <LockKeyhole className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                        <input
                          type={showPassword ? "text" : "password"}
                          required
                          minLength={6}
                          disabled={loading}
                          autoComplete="new-password"
                          placeholder="6 caractères minimum"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className={`${fieldClass} pr-12`}
                        />
                        <button
                          type="button"
                          onMouseDown={(e) => e.preventDefault()}
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 z-10 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-md text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                          aria-label={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className={labelClass}>Téléphone</label>
                      <div className="relative">
                        <Phone className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                        <input
                          type="tel"
                          disabled={loading}
                          autoComplete="tel"
                          placeholder="+221 77 000 00 00"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          className={fieldClass}
                        />
                      </div>
                    </div>

                    {(selectedRole === "entreprise" || selectedRole === "partner") && (
                      <div>
                        <label className={labelClass}>Société / Organisation</label>
                        <div className="relative">
                          <Briefcase className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                          <input
                            type="text"
                            disabled={loading}
                            autoComplete="organization"
                            placeholder="Nom de votre société"
                            value={company}
                            onChange={(e) => setCompany(e.target.value)}
                            className={fieldClass}
                          />
                        </div>
                      </div>
                    )}

                    {error && (
                      <div className="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                        <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                        <span>{error}</span>
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={loading}
                      className={`flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r ${
                        currentRole?.color || "from-slate-950 to-blue-700"
                      } px-5 text-sm font-black text-white shadow-lg shadow-blue-900/15 transition hover:-translate-y-0.5 disabled:translate-y-0 disabled:cursor-not-allowed disabled:opacity-60`}
                    >
                      {loading ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Création...
                        </>
                      ) : (
                        <>
                          Créer mon compte
                          <ArrowRight className="h-4 w-4" />
                        </>
                      )}
                    </button>
                  </form>
                )}

                {step === "forgot" && (
                  <form onSubmit={handleForgot} className="space-y-5">
                    <div>
                      <label className={labelClass}>Email</label>
                      <div className="relative">
                        <Mail className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                        <input
                          type="email"
                          required
                          disabled={loading}
                          autoComplete="email"
                          placeholder="votre@email.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className={fieldClass}
                        />
                      </div>
                    </div>

                    {error && (
                      <div className="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                        <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                        <span>{error}</span>
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={loading}
                      className="flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-slate-950 px-5 text-sm font-black text-white shadow-lg shadow-slate-900/20 transition hover:-translate-y-0.5 hover:bg-blue-700 disabled:translate-y-0 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      Envoyer le lien
                    </button>

                    <button
                      type="button"
                      onClick={() => resetView("login")}
                      className="mx-auto flex items-center gap-2 text-sm font-bold text-slate-500 transition hover:text-blue-700"
                    >
                      <ArrowLeft className="h-4 w-4" />
                      Retour à la connexion
                    </button>
                  </form>
                )}
              </div>
            </div>

            <p className="mt-5 text-center text-xs font-medium leading-5 text-slate-500">
              En vous inscrivant, vous acceptez les{" "}
              <Link to="/legal" className="font-bold text-blue-700 hover:underline">
                conditions d'utilisation
              </Link>{" "}
              de PROQUELEC.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
