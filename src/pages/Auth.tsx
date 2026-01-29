import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useSession } from "@/hooks/useSession";
import { toast } from "sonner";

type StepType = "login" | "signup" | "partner_signup" | "forgot" | "reset";

export default function Auth() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [step, setStep] = useState<StepType>("login");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [mailSent, setMailSent] = useState(false);
  const [resetNewPwd, setResetNewPwd] = useState("");
  const [resetConfirm, setResetConfirm] = useState("");
  const [resetSuccess, setResetSuccess] = useState(false);

  const navigate = useNavigate();
  const { user, isLoading } = useSession();

  useEffect(() => {
    if (!isLoading && user) {
      if (window.location.hash?.includes("type=recovery")) {
        setStep("reset");
        return;
      }
      navigate("/dashboard");
    }
  }, [user, isLoading, navigate]);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    if (step === "login") {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) setError(error.message);
      else navigate("/dashboard");
    } else if (step === "signup" || step === "partner_signup") {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { emailRedirectTo: `${window.location.origin}/connexion` }
      });

      if (error) setError(error.message);
      else if (data.user) {
        if (step === "partner_signup") {
          // Assigner rôle partner en attente
          await supabase.from("user_roles").insert([{
            user_id: data.user.id,
            role: "partner",
            status: "pending"
          }]);
        } else {
          // Flow standard (admin auto pour le premier)
          const { data: adminCheck } = await supabase.from("user_roles").select("id").eq("role", "admin").limit(1);
          if (!adminCheck || adminCheck.length === 0) {
            await supabase.from("user_roles").insert([{ user_id: data.user.id, role: "admin", status: "active" }]);
          }
        }
        setStep("login");
        toast.success("Compte créé ! Veuillez vérifier votre email.");
      }
    }
    setLoading(false);
  };

  // Handler de reset password (envoi email)
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setMailSent(false);
    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/connexion`, // assure la redirection sur cette page
    });
    if (error) setError(error.message);
    else setMailSent(true);
    setLoading(false);
  };

  // Handler de définition du NOUVEAU mot de passe après redirection
  const handleSetNewPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    if (resetNewPwd.length < 6) {
      setError("Le mot de passe doit contenir au moins 6 caractères.");
      setLoading(false);
      return;
    }
    if (resetNewPwd !== resetConfirm) {
      setError("Les mots de passe ne correspondent pas.");
      setLoading(false);
      return;
    }
    // Use Supabase updateUser() for password reset IN recovery mode
    const { error } = await supabase.auth.updateUser({ password: resetNewPwd });
    if (error) setError(error.message);
    else {
      setResetSuccess(true);
      // Efface le hash pour éviter la redemande si la page est rafraîchie
      window.history.replaceState({}, document.title, window.location.pathname);
      setTimeout(() => {
        setStep("login");
      }, 1500);
    }
    setLoading(false);
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-proqgray to-proqblue/5 font-roboto animate-fade-in pt-28">
      <div className="max-w-sm w-full mx-4 bg-white p-8 rounded-xl shadow-2xl flex flex-col gap-6 border border-gray-100">
        {/* Branding */}
        <div className="text-center mb-4">
          <img
            src="/logo-proquelec.svg"
            alt="PROQUELEC"
            className="h-16 w-16 mx-auto mb-3"
          />
          <h2 className="text-2xl font-bold text-proqblue">PROQUELEC</h2>
          <p className="text-sm text-gray-600">Espace Professionnel</p>
        </div>

        <hr className="border-gray-200" />

        <h1 className="text-2xl font-bold text-proqblue text-center">
          {step === "signup"
            ? "Créer un compte"
            : step === "forgot"
              ? "Réinitialiser le mot de passe"
              : step === "reset"
                ? "Définir un nouveau mot de passe"
                : "Connexion"}
        </h1>

        {step === "reset" ? (
          <form className="flex flex-col gap-4" onSubmit={handleSetNewPassword}>
            <input
              type="password"
              required
              disabled={loading || resetSuccess}
              placeholder="Nouveau mot de passe"
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg
                         focus:border-proqblue focus:ring-2 focus:ring-proqblue/10
                         disabled:bg-gray-100 transition placeholder-gray-500"
              value={resetNewPwd}
              onChange={e => setResetNewPwd(e.target.value)}
              autoComplete="new-password"
            />
            <input
              type="password"
              required
              disabled={loading || resetSuccess}
              placeholder="Confirmer le mot de passe"
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg
                         focus:border-proqblue focus:ring-2 focus:ring-proqblue/10
                         disabled:bg-gray-100 transition placeholder-gray-500"
              value={resetConfirm}
              onChange={e => setResetConfirm(e.target.value)}
              autoComplete="new-password"
            />
            {error && <div className="bg-red-50 text-red-700 text-sm p-3 rounded-lg border border-red-200">⚠️ {error}</div>}
            {resetSuccess && (
              <div className="bg-green-50 text-green-700 text-sm p-3 rounded-lg border border-green-200">
                ✓ Mot de passe réinitialisé ! Redirection en cours...
              </div>
            )}
            <Button
              type="submit"
              className="mt-2 w-full py-3"
              disabled={loading || resetSuccess}
              loading={loading}
            >
              {loading
                ? "Veuillez patienter..."
                : "Définir le nouveau mot de passe"}
            </Button>
          </form>
        ) : step !== "forgot" ? (
          <form className="flex flex-col gap-4" onSubmit={handleAuth}>
            <input
              type="email"
              disabled={loading}
              required
              placeholder="Email professionnel"
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg
                         focus:border-proqblue focus:ring-2 focus:ring-proqblue/10
                         disabled:bg-gray-100 transition placeholder-gray-500"
              value={email}
              onChange={e => setEmail(e.target.value)}
            />
            <input
              type="password"
              disabled={loading}
              required
              placeholder="Mot de passe"
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg
                         focus:border-proqblue focus:ring-2 focus:ring-proqblue/10
                         disabled:bg-gray-100 transition placeholder-gray-500"
              value={password}
              onChange={e => setPassword(e.target.value)}
              autoComplete="current-password"
            />
            {error && <div className="bg-red-50 text-red-700 text-sm p-3 rounded-lg border border-red-200">⚠️ {error}</div>}
            <Button
              type="submit"
              className="mt-2 w-full py-3"
              disabled={loading}
              loading={loading}
            >
              {loading
                ? "Veuillez patienter..."
                : step === "signup"
                  ? "Créer le compte"
                  : "Se connecter"}
            </Button>
          </form>
        ) : (
          <form className="flex flex-col gap-4" onSubmit={handleResetPassword}>
            <input
              type="email"
              disabled={loading}
              required
              placeholder="Email professionnel"
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg
                         focus:border-proqblue focus:ring-2 focus:ring-proqblue/10
                         disabled:bg-gray-100 transition placeholder-gray-500"
              value={email}
              onChange={e => setEmail(e.target.value)}
            />
            {error && <div className="bg-red-50 text-red-700 text-sm p-3 rounded-lg border border-red-200">⚠️ {error}</div>}
            {mailSent && (
              <div className="bg-green-50 text-green-700 text-sm p-3 rounded-lg border border-green-200">
                ✓ Un e-mail de réinitialisation a été envoyé si ce compte existe.
              </div>
            )}
            <Button
              type="submit"
              className="mt-2 w-full py-3"
              disabled={loading}
              loading={loading}
            >
              {loading ? "Envoi en cours..." : "Réinitialiser le mot de passe"}
            </Button>
          </form>
        )}

        {(step === "login" || step === "signup" || step === "forgot") && (
          <div className="flex flex-col gap-4 border-t border-gray-200 pt-4">
            <div className="flex items-center gap-2 text-sm">
              {step === "login" ? (
                <>
                  <span className="text-gray-700">Pas encore de compte ?</span>
                  <div className="flex flex-col gap-2">
                    <button
                      onClick={() => setStep("signup")}
                      className="font-semibold text-proqblue hover:text-proqblue-dark transition text-left"
                    >
                      Créer un compte Standard
                    </button>
                    <button
                      onClick={() => setStep("partner_signup")}
                      className="font-semibold text-indigo-600 hover:text-indigo-700 transition text-left"
                    >
                      Devenir Partenaire PROQUELEC
                    </button>
                  </div>
                </>
              ) : (step === "signup" || step === "partner_signup") ? (
                <>
                  <span className="text-gray-700">Déjà un compte ?</span>
                  <button
                    onClick={() => setStep("login")}
                    className="font-semibold text-proqblue hover:text-proqblue-dark transition"
                  >
                    Connexion
                  </button>
                </>
              ) : (
                <>
                  <span className="text-gray-700">Retour à la</span>
                  <button
                    onClick={() => setStep("login")}
                    className="font-semibold text-proqblue hover:text-proqblue-dark transition"
                  >
                    connexion
                  </button>
                </>
              )}
            </div>

            {(step === "login" || step === "signup") && (
              <button
                className="text-proqblue hover:text-proqblue-dark text-sm font-medium transition"
                type="button"
                onClick={() => setStep("forgot")}
              >
                🔐 Mot de passe oublié ?
              </button>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
