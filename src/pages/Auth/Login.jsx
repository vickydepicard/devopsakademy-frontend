// src/pages/Auth/Login.jsx
// VERSION CORRIGÉE — 25 mars 2026
// Corrections :
//   - Affiche un message clair + bouton "Renvoyer l'email" si email non vérifié
//   - Utilise les flags email_not_verified et can_resend retournés par l'API

import { useState, useEffect } from "react"
import { Link, useNavigate, useLocation } from "react-router-dom"
import { useAuth } from "../../contexts/AuthContext"
import { Mail, Lock, Eye, EyeOff, AlertCircle, Loader, CheckCircle, Shield, RefreshCw } from "lucide-react"

export default function Login() {
  const { user, login, loading } = useAuth()
  const navigate  = useNavigate()
  const location  = useLocation()

  const [form,       setForm]       = useState({ email: "", password: "" })
  const [showPwd,    setShowPwd]    = useState(false)
  const [localErr,   setLocalErr]   = useState("")
  const [notice,     setNotice]     = useState("")
  const [submitting, setSubmitting] = useState(false)

  // ✅ CORRECTIF 3 — état pour afficher le bloc "email non vérifié"
  const [emailNotVerified, setEmailNotVerified] = useState(false)
  const [resendEmail,      setResendEmail]      = useState("")
  const [resending,        setResending]        = useState(false)
  const [resendOk,         setResendOk]         = useState(false)

  // Pré-remplir depuis Register ou forgot-password
  useEffect(() => {
    const st = location.state
    if (st?.email)    setForm(p => ({ ...p, email: st.email }))
    if (st?.password) setForm(p => ({ ...p, password: st.password }))
    if (st?.message)  setNotice(st.message)
    window.history.replaceState({}, "")
  }, [])

  // Redirection si déjà connecté
  useEffect(() => {
    if (!user) return
    if (user.role === "admin" || user.role === "superadmin") navigate("/admin",      { replace: true })
    else if (user.role === "instructor")                      navigate("/instructor", { replace: true })
    else                                                      navigate("/student",    { replace: true })
  }, [user, navigate])

  const set = (k, v) => {
    setForm(p => ({ ...p, [k]: v }))
    setLocalErr("")
    setEmailNotVerified(false)
    setResendOk(false)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.email || !form.password) {
      setLocalErr("Veuillez remplir tous les champs")
      return
    }
    setSubmitting(true)
    setLocalErr("")
    setEmailNotVerified(false)
    setResendOk(false)

    try {
      const res = await login(form)
      if (res?.success) {
        const role = res.user?.role || ""
        if (role === "admin" || role === "superadmin") navigate("/admin",      { replace: true })
        else if (role === "instructor")                navigate("/instructor", { replace: true })
        else                                           navigate("/student",    { replace: true })
      } else {
        // ✅ CORRECTIF 3 — vérifier email_not_verified flag
        if (res?.email_not_verified) {
          setEmailNotVerified(true)
          setResendEmail(res?.email || form.email)
          setLocalErr("") // On affiche le bloc dédié, pas le message d'erreur générique
        } else {
          setLocalErr(res?.message || "Email ou mot de passe incorrect")
        }
      }
    } catch (err) {
      setLocalErr("Email ou mot de passe incorrect")
    } finally {
      setSubmitting(false)
    }
  }

  // ✅ CORRECTIF 4 — resend avec URL relative propre
  const handleResend = async () => {
    setResending(true)
    setResendOk(false)
    try {
      await fetch("/api/auth/resend-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: resendEmail }),
      })
      setResendOk(true)
    } catch {
      // Silencieux — l'API répond toujours 200
    } finally {
      setResending(false)
    }
  }

  const isLoading = loading || submitting
  const inputCls = "flex-1 px-4 py-3.5 bg-transparent focus:outline-none text-gray-900 text-sm placeholder-gray-400"

  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-12"
      style={{ background: "linear-gradient(135deg,#1e1b4b 0%,#2d287f 40%,#4c1d95 100%)" }}>

      <div className="w-full max-w-md">

        {/* Logo */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-2">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: "#facc15" }}>
              <span className="text-indigo-900 font-black text-xs">DA</span>
            </div>
            <span className="text-white font-black text-lg">DevOps Akademy</span>
          </div>
        </div>

        {/* Card */}
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden"
          style={{ animation: "slideUp 0.4s cubic-bezier(0.34,1.56,0.64,1)" }}>

          <div className="h-1.5" style={{ background: "linear-gradient(90deg,#2d287f,#5653e1,#facc15)" }} />

          <div className="p-8 space-y-6">

            {/* Header */}
            <div className="text-center">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
                style={{ background: "linear-gradient(135deg,#2d287f,#5653e1)" }}>
                <Shield className="w-7 h-7 text-white" />
              </div>
              <h2 className="text-2xl font-black text-gray-900">Connexion</h2>
              <p className="text-gray-500 text-sm mt-1">Accédez à votre espace DevOps</p>
            </div>

            {/* Notice succès (depuis Register ou reset-password) */}
            {notice && (
              <div className="flex items-start gap-2.5 rounded-xl px-4 py-3"
                style={{ background: "#f0fdf4", border: "1px solid #bbf7d0" }}>
                <CheckCircle className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                <p className="text-emerald-700 text-sm font-medium">{notice}</p>
              </div>
            )}

            {/* ✅ CORRECTIF 3 — Bloc email non vérifié avec bouton renvoyer */}
            {emailNotVerified && (
              <div className="rounded-xl overflow-hidden"
                style={{ border: "1px solid #fde68a" }}>
                <div className="px-4 py-3" style={{ background: "#fffbeb" }}>
                  <div className="flex items-start gap-2.5">
                    <Mail className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-amber-800 text-sm font-black mb-1">Email non vérifié</p>
                      <p className="text-amber-700 text-xs leading-relaxed">
                        Votre compte n'est pas encore activé. Vérifiez votre boîte email (et vos spams) pour le lien d'activation envoyé à <strong>{resendEmail}</strong>.
                      </p>
                    </div>
                  </div>
                </div>
                <div className="px-4 py-3" style={{ background: "#fef9e7", borderTop: "1px solid #fde68a" }}>
                  {resendOk ? (
                    <p className="text-xs text-emerald-700 font-medium flex items-center gap-1.5">
                      <CheckCircle className="w-3.5 h-3.5" />
                      Email envoyé ! Vérifiez votre boîte et vos spams.
                    </p>
                  ) : (
                    <button onClick={handleResend} disabled={resending}
                      className="flex items-center gap-2 text-xs font-bold transition hover:underline disabled:opacity-50"
                      style={{ color: "#5653e1" }}>
                      {resending
                        ? <><Loader className="w-3.5 h-3.5 animate-spin" /> Envoi en cours...</>
                        : <><RefreshCw className="w-3.5 h-3.5" /> Renvoyer l'email de vérification</>
                      }
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Erreur générique */}
            {localErr && (
              <div className="flex items-start gap-2.5 rounded-xl px-4 py-3"
                style={{ background: "#fef2f2", border: "1px solid #fecaca" }}>
                <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                <p className="text-red-600 text-sm">{localErr}</p>
              </div>
            )}

            {/* Formulaire */}
            <form onSubmit={handleSubmit} className="space-y-4" noValidate>

              {/* Email */}
              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wider">
                  Adresse email
                </label>
                <div className="flex items-center rounded-xl border-2 border-gray-200 focus-within:border-indigo-400 focus-within:shadow-sm transition bg-white">
                  <div className="pl-4"><Mail className="w-4 h-4 text-gray-400" /></div>
                  <input type="email" value={form.email}
                    onChange={e => set("email", e.target.value)}
                    className={inputCls} placeholder="votremail@exemple.com"
                    autoComplete="email" />
                </div>
              </div>

              {/* Mot de passe */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-gray-600 uppercase tracking-wider">
                    Mot de passe
                  </label>
                  <Link to="/forgot-password"
                    className="text-xs font-bold hover:underline"
                    style={{ color: "#5653e1" }}>
                    Mot de passe oublié ?
                  </Link>
                </div>
                <div className="flex items-center rounded-xl border-2 border-gray-200 focus-within:border-indigo-400 focus-within:shadow-sm transition bg-white">
                  <div className="pl-4"><Lock className="w-4 h-4 text-gray-400" /></div>
                  <input type={showPwd ? "text" : "password"} value={form.password}
                    onChange={e => set("password", e.target.value)}
                    className={inputCls} placeholder="••••••••"
                    autoComplete="current-password" />
                  <button type="button" onClick={() => setShowPwd(!showPwd)}
                    className="pr-4 text-gray-400 hover:text-gray-600">
                    {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Submit */}
              <button type="submit" disabled={isLoading}
                className="w-full py-3.5 rounded-xl text-sm font-black text-white transition hover:opacity-90 disabled:opacity-60 flex items-center justify-center gap-2"
                style={{ background: "linear-gradient(135deg,#2d287f,#5653e1)" }}>
                {isLoading ? <><Loader className="w-4 h-4 animate-spin" /> Connexion...</> : "Se connecter"}
              </button>

            </form>

            {/* Lien inscription */}
            <p className="text-center text-sm text-gray-500">
              Pas encore de compte ?{" "}
              <Link to="/register" className="font-black hover:underline" style={{ color: "#5653e1" }}>
                Créer un compte gratuit
              </Link>
            </p>

          </div>
        </div>
      </div>

      <style>{`@keyframes slideUp { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }`}</style>
    </div>
  )
}