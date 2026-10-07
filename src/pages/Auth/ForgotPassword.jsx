// src/pages/Auth/ForgotPassword.jsx — DevOpsAkademy
// Design compact — tout visible sans scroll — cohérent avec Login/Register

import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import api from "../../api/api"
import { Mail, ArrowLeft, CheckCircle, Loader, ShieldCheck } from "lucide-react"
import { useTranslation } from "react-i18next"

const C = { primary: "#2d287f", light: "#5653e1", accent: "#facc15" }

export default function ForgotPassword() {
  const { t, i18n } = useTranslation("auth")
  const [email,   setEmail]   = useState("")
  const [loading, setLoading] = useState(false)
  const [sent,    setSent]    = useState(false)
  const [error,   setError]   = useState("")

  useEffect(() => { document.title = t("forgot.title") + " — DevOpsAkademy" }, [t, i18n.language])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!email || !email.includes("@")) { setError(t("forgot.invalidEmail")); return }
    setLoading(true); setError("")
    try {
      await api.post("/auth/forgot-password", { email })
      setSent(true)
    } catch {
      setError(t("forgot.error"))
    } finally {
      setLoading(false)
    }
  }

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

            {sent ? (
              /* ── SUCCÈS ── */
              <div className="text-center space-y-4">
                <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto"
                  style={{ background: "linear-gradient(135deg,#ecfdf5,#d1fae5)", border: "2px solid #10b981" }}>
                  <CheckCircle className="w-8 h-8 text-emerald-500" />
                </div>
                <div>
                  <h2 className="text-xl font-black text-gray-900">{t("forgot.sentTitle")}</h2>
                  <p className="text-gray-500 text-sm mt-2 leading-relaxed">
                    {t("forgot.sentPre")} <strong className="text-indigo-700">{email}</strong>
                    {t("forgot.sentPost")}
                  </p>
                  <p className="text-gray-400 text-xs mt-2 flex items-center justify-center gap-1">
                    {t("forgot.checkSpam")}
                  </p>
                </div>
                <Link to="/login"
                  className="block w-full py-3 rounded-xl font-black text-white text-sm text-center hover:opacity-90 transition"
                  style={{ background: `linear-gradient(135deg,${C.primary},${C.light})` }}>
                  {t("forgot.backToLogin")}
                </Link>
              </div>

            ) : (
              /* ── FORMULAIRE ── */
              <>
                {/* Header */}
                <div className="text-center mb-5">
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-3"
                    style={{ background: "linear-gradient(135deg,#ede9fe,#ddd6fe)" }}>
                    <Mail className="w-6 h-6" style={{ color: C.primary }} />
                  </div>
                  <h1 className="text-xl font-black text-gray-900">{t("forgot.title")}</h1>
                  <p className="text-gray-500 text-xs mt-1.5 leading-relaxed">
                    {t("forgot.intro")}
                  </p>
                </div>

                {/* Erreur */}
                {error && (
                  <div className="mb-4 flex items-center gap-2 rounded-xl px-3 py-2.5"
                    style={{ background: "#fef2f2", border: "1px solid #fecaca" }}>
                    
                    <p className="text-red-600 text-xs">{error}</p>
                  </div>
                )}

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-4" noValidate>
                  <div className="flex items-center rounded-xl border-2 border-gray-200 focus-within:border-indigo-400 transition bg-white">
                    <div className="pl-3.5"><Mail className="w-4 h-4 text-gray-400" /></div>
                    <input
                      type="email"
                      value={email}
                      onChange={e => { setEmail(e.target.value); setError("") }}
                      placeholder={t("forgot.emailPlaceholder")}
                      autoFocus
                      className="flex-1 px-3.5 py-3 bg-transparent focus:outline-none text-gray-900 text-sm placeholder-gray-400"
                      autoComplete="email"
                    />
                  </div>

                  <button type="submit" disabled={loading}
                    className="w-full py-3 rounded-xl text-sm font-black text-white transition hover:opacity-90 disabled:opacity-60 flex items-center justify-center gap-2"
                    style={{ background: `linear-gradient(135deg,${C.primary},${C.light})` }}>
                    {loading
                      ? <><Loader className="w-4 h-4 animate-spin" /> {t("forgot.sending")}</>
                      : t("forgot.submit")
                    }
                  </button>
                </form>

                <p className="text-center text-xs text-gray-500 mt-4 flex items-center justify-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-indigo-400" />
                  {t("forgot.secure")}
                </p>
              </>
            )}
          </div>
        </div>

        {/* Retour connexion */}
        {!sent && (
          <div className="text-center mt-4">
            <Link to="/login"
              className="inline-flex items-center gap-1.5 text-indigo-300/70 hover:text-white text-sm transition font-medium">
              <ArrowLeft className="w-3.5 h-3.5" /> {t("forgot.backToLogin")}
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}