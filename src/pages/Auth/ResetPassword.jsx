import { useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import api from "../../api/api";
import { Lock, Eye, EyeOff, ArrowLeft, CheckCircle } from "lucide-react";

export default function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState({ password: "", confirm: "" });
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (form.password.length < 8) {
      setError("Le mot de passe doit contenir au moins 8 caractères.");
      return;
    }
    if (form.password !== form.confirm) {
      setError("Les deux mots de passe ne correspondent pas.");
      return;
    }
    setLoading(true);
    try {
      await api.post("/auth/reset-password", { token, password: form.password });
      setDone(true);
      setTimeout(() => navigate("/login"), 3000);
    } catch (err) {
      setError("Lien invalide ou expiré. Demandez un nouveau lien.");
    } finally {
      setLoading(false);
    }
  };

  const strength = (pwd) => {
    if (pwd.length === 0) return null;
    if (pwd.length < 6) return { level: 1, label: "Faible", color: "bg-red-400" };
    if (pwd.length < 10 || !/[A-Z]/.test(pwd) || !/[0-9]/.test(pwd)) return { level: 2, label: "Moyen", color: "bg-yellow-400" };
    return { level: 3, label: "Fort", color: "bg-emerald-500" };
  };
  const pwdStrength = strength(form.password);

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-indigo-900 via-purple-800 to-purple-700 px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 space-y-6">

        <Link to="/login" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-primary transition">
          <ArrowLeft className="w-4 h-4" /> Retour à la connexion
        </Link>

        {done ? (
          <div className="text-center py-4">
            <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-emerald-500" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Mot de passe mis à jour !</h2>
            <p className="text-gray-500 text-sm">Redirection vers la connexion dans quelques secondes…</p>
            <Link to="/login" className="mt-6 inline-block w-full text-center py-2 bg-accent hover:bg-yellow-300 text-indigo-900 font-semibold rounded-md shadow transition text-sm">
              Se connecter maintenant
            </Link>
          </div>
        ) : (
          <>
            <div className="text-center">
              <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Lock className="w-7 h-7 text-primary" />
              </div>
              <h2 className="text-2xl font-bold text-indigo-900">Nouveau mot de passe</h2>
              <p className="mt-2 text-gray-500 text-sm">Choisissez un mot de passe sécurisé d'au moins 8 caractères.</p>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-300 text-red-700 px-3 py-2 rounded-md text-sm">{error}</div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Nouveau mot de passe */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nouveau mot de passe</label>
                <div className="relative">
                  <input
                    type={showPwd ? "text" : "password"}
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    placeholder="Minimum 8 caractères"
                    required
                    className="w-full px-3 py-2 pr-10 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 transition text-sm"
                  />
                  <button type="button" onClick={() => setShowPwd(!showPwd)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {/* Indicateur de force */}
                {pwdStrength && (
                  <div className="mt-2">
                    <div className="flex gap-1 mb-1">
                      {[1,2,3].map((l) => (
                        <div key={l} className={`h-1.5 flex-1 rounded-full transition-all ${l <= pwdStrength.level ? pwdStrength.color : "bg-gray-200"}`} />
                      ))}
                    </div>
                    <p className="text-xs text-gray-500">Force : <span className="font-medium">{pwdStrength.label}</span></p>
                  </div>
                )}
              </div>

              {/* Confirmation */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Confirmer le mot de passe</label>
                <input
                  type="password"
                  value={form.confirm}
                  onChange={(e) => setForm({ ...form, confirm: e.target.value })}
                  placeholder="Répétez le mot de passe"
                  required
                  className="w-full px-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 transition text-sm"
                />
                {form.confirm && form.password !== form.confirm && (
                  <p className="text-xs text-red-500 mt-1">Les mots de passe ne correspondent pas.</p>
                )}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2 bg-yellow-400 hover:bg-yellow-300 text-indigo-900 font-semibold rounded-md shadow transition transform hover:-translate-y-0.5 disabled:opacity-50 text-sm"
              >
                {loading ? "Mise à jour..." : "Réinitialiser le mot de passe"}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}