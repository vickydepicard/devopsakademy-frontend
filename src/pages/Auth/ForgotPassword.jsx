import { useState } from "react";
import { Link } from "react-router-dom";
import api from "../../api/api";
import { Mail, ArrowLeft, CheckCircle } from "lucide-react";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    setError("");
    try {
      await api.post("/auth/forgot-password", { email });
      setSent(true);
    } catch (err) {
      setError("Une erreur est survenue. Vérifiez votre adresse email.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-indigo-900 via-purple-800 to-purple-700 px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 space-y-6">

        {/* Back */}
        <Link to="/login" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-primary transition">
          <ArrowLeft className="w-4 h-4" /> Retour à la connexion
        </Link>

        {sent ? (
          /* ── État succès ── */
          <div className="text-center py-4">
            <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-emerald-500" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Email envoyé !</h2>
            <p className="text-gray-500 text-sm leading-relaxed">
              Si un compte existe avec l'adresse <strong>{email}</strong>, vous recevrez
              un lien de réinitialisation dans quelques minutes.
            </p>
            <p className="text-gray-400 text-xs mt-4">
              Vérifiez aussi vos spams.
            </p>
            <Link
              to="/login"
              className="mt-6 inline-block w-full text-center py-2 bg-accent hover:bg-yellow-300 text-indigo-900 font-semibold rounded-md shadow transition text-sm"
            >
              Retour à la connexion
            </Link>
          </div>
        ) : (
          /* ── Formulaire ── */
          <>
            <div className="text-center">
              <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Mail className="w-7 h-7 text-primary" />
              </div>
              <h2 className="text-2xl font-bold text-indigo-900">Mot de passe oublié ?</h2>
              <p className="mt-2 text-gray-500 text-sm">
                Entrez votre adresse email. Nous vous enverrons un lien pour réinitialiser votre mot de passe.
              </p>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-300 text-red-700 px-3 py-2 rounded-md text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Adresse email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="votremail@exemple.com"
                  required
                  className="w-full px-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 transition text-sm"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2 bg-yellow-400 hover:bg-yellow-300 text-indigo-900 font-semibold rounded-md shadow transition transform hover:-translate-y-0.5 disabled:opacity-50 text-sm"
              >
                {loading ? "Envoi en cours..." : "Envoyer le lien de réinitialisation"}
              </button>
            </form>

            <p className="text-center text-gray-500 text-sm">
              Vous vous souvenez de votre mot de passe ?{" "}
              <Link to="/login" className="text-yellow-500 hover:text-yellow-400 font-semibold">
                Se connecter
              </Link>
            </p>
          </>
        )}
      </div>
    </div>
  );
}