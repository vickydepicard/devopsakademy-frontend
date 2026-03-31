// src/pages/Auth/ResetPassword.jsx — DevOpsAkademy
// Design compact — tout visible sans scroll — cohérent avec Login/Register

import { useState } from "react"
import { Link, useParams, useNavigate } from "react-router-dom"
import api from "../../api/api"
import { Lock, Eye, EyeOff, ArrowLeft, CheckCircle, ShieldCheck, Loader, AlertCircle } from "lucide-react"

const C = { primary: "#2d287f", light: "#5653e1", accent: "#facc15" }

function PwdStrength({ pwd }) {
  if (!pwd) return null
  const checks = {
    length:  pwd.length >= 8,
    upper:   /[A-Z]/.test(pwd),
    number:  /[0-9]/.test(pwd),
    special: /[^a-zA-Z0-9]/.test(pwd),
  }
  const score = Object.values(checks).filter(Boolean).length
  const levels = [
    { label: "Trop court",  color: "#ef4444", w: "20%" },
    { label: "Faible",      color: "#f97316", w: "45%" },
    { label: "Moyen",       color: "#eab308", w: "70%" },
    { label: "Fort",        color: "#22c55e", w: "100%" },
  ]
  const lv = levels[score - 1] || levels[0]
  return (
    <div className="mt-1 space-y-1">
      <div className="h-1 bg-gray-100 rounded-full overflow-hidden">
        <div className="h-full rounded-full transition-all duration-500"
          style={{ width: lv.w, background: lv.color }} />
      </div>
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-bold" style={{ color: lv.color }}>{lv.label}</span>
        <div className="flex gap-1">
          {[["length","8+"],["upper","Maj"],["number","123"],["special","#@"]].map(([k,l]) => (
            <span key={k} className={`text-[9px] px-1 py-0.5 rounded font-medium ${checks[k] ? "bg-emerald-100 text-emerald-700" : "bg-gray-100 text-gray-400"}`}>
              {checks[k] ? "✓" : "·"}{l}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}

export default function ResetPassword() {
  const { token }   = useParams()
  const navigate    = useNavigate()
  const [form,      setForm]      = useState({ password: "", confirm: "" })
  const [showPwd,   setShowPwd]   = useState(false)
  const [showConf,  setShowConf]  = useState(false)
  const [loading,   setLoading]   = useState(false)
  const [done,      setDone]      = useState(false)
  const [error,     setError]     = useState("")

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")
    if (!form.password || form.password.length < 8) {
      setError("Le mot de passe doit contenir au moins 8 caractères.")
      return
    }
    if (form.password !== form.confirm) {
      setError("Les mots de passe ne correspondent pas.")
      return
    }
    setLoading(true)
    try {
      await api.post("/auth/reset-password", { token, password: form.password })
      setDone(true)
      setTimeout(() => navigate("/login", {
        state: { message: "✅ Mot de passe mis à jour ! Connectez-vous." }
      }), 3000)
    } catch (err) {
      setError(err?.message || "Lien invalide ou expiré. Demandez un nouveau lien.")
    } finally {
      setLoading(false)
    }
  }

  const inp = "flex-1 px-3.5 py-3 bg-transparent focus:outline-none text-gray-900 text-sm placeholder-gray-400"

  return (
    <div
      className="h-screen flex items-center justify-center px-4 overflow-hidden"
      style={{ background: "linear-gradient(135deg,#1e1b4b 0%,#2d287f 50%,#4c1d95 100%)" }}
    >
      {/* Orbs déco */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 -left-20 w-72 h-72 rounded-full opacity-10"
          style={{ background: C.accent, filter: "blur(70px)" }} />
        <div className="absolute bottom-1/4 -right-20 w-72 h-72 rounded-full opacity-10"
          style={{ background: C.light, filter: "blur(70px)" }} />
      </div>

      <div className="relative z-10 w-full max-w-sm">

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          <div className="h-1" style={{ background: "linear-gradient(90deg,#2d287f,#5653e1,#facc15)" }} />

          <div className="px-7 py-6">

            {done ? (
              /* ── SUCCÈS ── */
              <div className="text-center space-y-4">
                <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto"
                  style={{ background: "linear-gradient(135deg,#ecfdf5,#d1fae5)", border: "2px solid #10b981" }}>
                  <CheckCircle className="w-8 h-8 text-emerald-500" />
                </div>
                <div>
                  <h2 className="text-xl font-black text-gray-900">Mot de passe mis à jour !</h2>
                  <p className="text-gray-500 text-sm mt-2 leading-relaxed">
                    Votre mot de passe a été modifié avec succès.
                  </p>
                  <p className="text-gray-400 text-xs mt-2 flex items-center justify-center gap-1">
                    <Loader className="w-3 h-3 animate-spin" />
                    Redirection automatique dans 3 secondes...
                  </p>
                </div>
                <Link to="/login"
                  className="block w-full py-3 rounded-xl font-black text-white text-sm text-center hover:opacity-90 transition"
                  style={{ background: `linear-gradient(135deg,${C.primary},${C.light})` }}>
                  → Se connecter maintenant
                </Link>
              </div>

            ) : (
              /* ── FORMULAIRE ── */
              <>
                {/* Header */}
                <div className="text-center mb-5">
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-3"
                    style={{ background: "linear-gradient(135deg,#ede9fe,#ddd6fe)" }}>
                    <Lock className="w-6 h-6" style={{ color: C.primary }} />
                  </div>
                  <h1 className="text-xl font-black text-gray-900">Nouveau mot de passe</h1>
                  <p className="text-gray-500 text-xs mt-1.5">
                    Choisissez un mot de passe sécurisé d'au moins 8 caractères.
                  </p>
                </div>

                {/* Erreur */}
                {error && (
                  <div className="mb-4 flex items-start gap-2 rounded-xl px-3 py-2.5"
                    style={{ background: "#fef2f2", border: "1px solid #fecaca" }}>
                    <AlertCircle className="w-3.5 h-3.5 text-red-500 flex-shrink-0 mt-0.5" />
                    <p className="text-red-600 text-xs">{error}</p>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-3" noValidate>

                  {/* Nouveau mot de passe */}
                  <div>
                    <div className="flex items-center rounded-xl border-2 border-gray-200 focus-within:border-indigo-400 transition bg-white">
                      <div className="pl-3.5"><Lock className="w-4 h-4 text-gray-400" /></div>
                      <input
                        type={showPwd ? "text" : "password"}
                        value={form.password}
                        onChange={e => { setForm(p => ({ ...p, password: e.target.value })); setError("") }}
                        placeholder="Nouveau mot de passe"
                        autoFocus
                        className={inp}
                        autoComplete="new-password"
                      />
                      <button type="button" onClick={() => setShowPwd(s => !s)}
                        className="pr-3.5 text-gray-400 hover:text-gray-600 transition">
                        {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    <PwdStrength pwd={form.password} />
                  </div>

                  {/* Confirmation */}
                  <div>
                    <div className="flex items-center rounded-xl border-2 focus-within:border-indigo-400 transition bg-white"
                      style={{ borderColor: form.confirm && form.confirm !== form.password ? "#fca5a5" : "#e5e7eb" }}>
                      <div className="pl-3.5">
                        {form.confirm && form.confirm === form.password
                          ? <CheckCircle className="w-4 h-4 text-emerald-500" />
                          : <ShieldCheck className="w-4 h-4 text-gray-400" />
                        }
                      </div>
                      <input
                        type={showConf ? "text" : "password"}
                        value={form.confirm}
                        onChange={e => { setForm(p => ({ ...p, confirm: e.target.value })); setError("") }}
                        placeholder="Confirmer le mot de passe"
                        className={inp}
                        autoComplete="new-password"
                      />
                      <button type="button" onClick={() => setShowConf(s => !s)}
                        className="pr-3.5 text-gray-400 hover:text-gray-600 transition">
                        {showConf ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    {form.confirm && form.password !== form.confirm && (
                      <p className="mt-0.5 text-[10px] text-red-500">Les mots de passe ne correspondent pas</p>
                    )}
                    {form.confirm && form.password === form.confirm && form.confirm && (
                      <p className="mt-0.5 text-[10px] text-emerald-600 flex items-center gap-1">
                        <CheckCircle className="w-2.5 h-2.5" /> Mots de passe identiques
                      </p>
                    )}
                  </div>

                  {/* Bouton */}
                  <button type="submit" disabled={loading}
                    className="w-full py-3 rounded-xl text-sm font-black text-white transition hover:opacity-90 disabled:opacity-60 flex items-center justify-center gap-2 mt-1"
                    style={{ background: `linear-gradient(135deg,${C.primary},${C.light})` }}>
                    {loading
                      ? <><Loader className="w-4 h-4 animate-spin" /> Mise à jour...</>
                      : "Réinitialiser le mot de passe"
                    }
                  </button>
                </form>

                <p className="text-center text-[11px] text-gray-400 mt-3 flex items-center justify-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-indigo-400" />
                  Toutes vos sessions seront déconnectées
                </p>
              </>
            )}
          </div>
        </div>

        {/* Retour connexion */}
        {!done && (
          <div className="text-center mt-4">
            <Link to="/login"
              className="inline-flex items-center gap-1.5 text-indigo-300/70 hover:text-white text-sm transition font-medium">
              <ArrowLeft className="w-3.5 h-3.5" /> Retour à la connexion
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}