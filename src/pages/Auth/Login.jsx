// src/pages/Auth/Login.jsx — DevOpsAkademy
// Design compact — tout visible sans scroll — loader — erreurs précises
import { useState, useEffect } from "react"
import { Link, useNavigate, useLocation } from "react-router-dom"
import { useAuth } from "../../contexts/AuthContext"
import {
  Mail, Lock, Eye, EyeOff, AlertCircle,
  Loader, CheckCircle, RefreshCw, Shield
} from "lucide-react"

export default function Login() {
  const { user, login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const [form,        setForm]        = useState({ email: "", password: "" })
  const [showPwd,     setShowPwd]     = useState(false)
  const [err,         setErr]         = useState("")
  const [notice,      setNotice]      = useState("")
  const [loading,     setLoading]     = useState(false)
  const [unverified,  setUnverified]  = useState(false)
  const [resendEmail, setResendEmail] = useState("")
  const [resending,   setResending]   = useState(false)
  const [resendOk,    setResendOk]    = useState(false)

  // Pré-remplir depuis Register / forgot-password
  useEffect(() => {
    const st = location.state
    if (st?.email)    setForm(p => ({ ...p, email: st.email }))
    if (st?.password) setForm(p => ({ ...p, password: st.password }))
    if (st?.message)  setNotice(st.message)
    window.history.replaceState({}, "")
  }, [])

  // Déjà connecté
  useEffect(() => {
    if (!user) return
    const r = user.role
    navigate(r === "admin" || r === "superadmin" ? "/admin" : r === "instructor" ? "/instructor" : "/student", { replace: true })
  }, [user])

  const change = (k, v) => { setForm(p => ({ ...p, [k]: v })); setErr(""); setUnverified(false); setResendOk(false) }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.email)    { setErr("L'adresse email est requise"); return }
    if (!form.email.includes("@")) { setErr("Adresse email invalide"); return }
    if (!form.password) { setErr("Le mot de passe est requis"); return }

    setLoading(true); setErr(""); setUnverified(false); setResendOk(false)
    try {
      const res = await login(form)
      if (res?.success) {
        const r = res.user?.role || ""
        navigate(r === "admin" || r === "superadmin" ? "/admin" : r === "instructor" ? "/instructor" : "/student", { replace: true })
      } else if (res?.email_not_verified) {
        setUnverified(true)
        setResendEmail(res?.email || form.email)
      } else {
        // Message d'erreur précis depuis l'API
        setErr(res?.message || "Email ou mot de passe incorrect")
      }
    } catch (e) {
      setErr("Erreur de connexion au serveur. Vérifiez que l'API est démarrée.")
    } finally {
      setLoading(false)
    }
  }

  const handleResend = async () => {
    setResending(true); setResendOk(false)
    try {
      await fetch("/api/auth/resend-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: resendEmail }),
      })
      setResendOk(true)
    } catch { } finally { setResending(false) }
  }

  const inp = "flex-1 px-3.5 py-3 bg-transparent focus:outline-none text-gray-900 text-sm placeholder-gray-400"

  return (
    <div className="h-screen flex items-center justify-center px-4 overflow-hidden"
      style={{ background: "linear-gradient(135deg,#1e1b4b 0%,#2d287f 50%,#4c1d95 100%)" }}>

      <div className="w-full max-w-sm">

        {/* Logo */}
        <div className="flex items-center justify-center gap-2.5 mb-5">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
            style={{ background: "#facc15" }}>
            <span className="text-indigo-900 font-black text-xs">DA</span>
          </div>
          <span className="text-white font-black text-base tracking-tight">DevOps Akademy</span>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">

          {/* Barre top */}
          <div className="h-1" style={{ background: "linear-gradient(90deg,#2d287f,#5653e1,#facc15)" }} />

          <div className="px-6 py-5 space-y-4">

            {/* Titre */}
            <div className="text-center">
              <h1 className="text-xl font-black text-gray-900">Connexion</h1>
              <p className="text-gray-500 text-xs mt-0.5">Accédez à votre espace DevOps</p>
            </div>

            {/* Notice succès */}
            {notice && (
              <div className="flex items-start gap-2 rounded-xl px-3 py-2.5 text-xs"
                style={{ background: "#f0fdf4", border: "1px solid #bbf7d0" }}>
                <CheckCircle className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0 mt-0.5" />
                <p className="text-emerald-700 font-medium leading-relaxed">{notice}</p>
              </div>
            )}

            {/* Email non vérifié */}
            {unverified && (
              <div className="rounded-xl overflow-hidden border" style={{ borderColor: "#fde68a" }}>
                <div className="px-3 py-2.5" style={{ background: "#fffbeb" }}>
                  <p className="text-amber-800 text-xs font-black mb-1 flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5" /> Email non vérifié
                  </p>
                  <p className="text-amber-700 text-xs leading-relaxed">
                    Vérifiez votre boîte email (et spams) pour activer votre compte : <strong>{resendEmail}</strong>
                  </p>
                </div>
                <div className="px-3 py-2" style={{ background: "#fef9e7", borderTop: "1px solid #fde68a" }}>
                  {resendOk ? (
                    <p className="text-emerald-700 text-xs font-medium flex items-center gap-1">
                      <CheckCircle className="w-3 h-3" /> Email renvoyé ! Vérifiez vos spams.
                    </p>
                  ) : (
                    <button onClick={handleResend} disabled={resending}
                      className="text-xs font-bold flex items-center gap-1.5 disabled:opacity-50"
                      style={{ color: "#5653e1" }}>
                      {resending ? <><Loader className="w-3 h-3 animate-spin" /> Envoi...</>
                        : <><RefreshCw className="w-3 h-3" /> Renvoyer l'email d'activation</>}
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Erreur */}
            {err && (
              <div className="flex items-start gap-2 rounded-xl px-3 py-2.5"
                style={{ background: "#fef2f2", border: "1px solid #fecaca" }}>
                <AlertCircle className="w-3.5 h-3.5 text-red-500 flex-shrink-0 mt-0.5" />
                <p className="text-red-600 text-xs">{err}</p>
              </div>
            )}

            {/* Formulaire */}
            <form onSubmit={handleSubmit} className="space-y-3" noValidate>

              {/* Email */}
              <div className="flex items-center rounded-xl border-2 border-gray-200 focus-within:border-indigo-400 transition bg-white"
                style={err && !err.includes("mot de passe") ? { borderColor: "#fca5a5" } : {}}>
                <div className="pl-3.5"><Mail className="w-4 h-4 text-gray-400" /></div>
                <input type="email" value={form.email}
                  onChange={e => change("email", e.target.value)}
                  className={inp} placeholder="votremail@exemple.com"
                  autoComplete="email" autoFocus />
              </div>

              {/* Mot de passe */}
              <div>
                <div className="flex items-center rounded-xl border-2 border-gray-200 focus-within:border-indigo-400 transition bg-white">
                  <div className="pl-3.5"><Lock className="w-4 h-4 text-gray-400" /></div>
                  <input type={showPwd ? "text" : "password"} value={form.password}
                    onChange={e => change("password", e.target.value)}
                    className={inp} placeholder="••••••••"
                    autoComplete="current-password" />
                  <button type="button" onClick={() => setShowPwd(s => !s)}
                    className="pr-3.5 text-gray-400 hover:text-gray-600 transition">
                    {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <div className="flex justify-end mt-1">
                  <Link to="/forgot-password" className="text-xs font-semibold hover:underline"
                    style={{ color: "#5653e1" }}>
                    Mot de passe oublié ?
                  </Link>
                </div>
              </div>

              {/* Bouton */}
              <button type="submit" disabled={loading}
                className="w-full py-3 rounded-xl text-sm font-black text-white transition hover:opacity-90 disabled:opacity-60 flex items-center justify-center gap-2"
                style={{ background: "linear-gradient(135deg,#2d287f,#5653e1)" }}>
                {loading
                  ? <><Loader className="w-4 h-4 animate-spin" /> Connexion en cours...</>
                  : "Se connecter →"}
              </button>
            </form>

            {/* Lien inscription */}
            <p className="text-center text-xs text-gray-500">
              Pas encore de compte ?{" "}
              <Link to="/register" className="font-black hover:underline" style={{ color: "#5653e1" }}>
                Créer un compte gratuit
              </Link>
            </p>

          </div>
        </div>

        {/* Sécurité */}
        <p className="text-center text-indigo-300/50 text-xs mt-4 flex items-center justify-center gap-1.5">
          <Shield className="w-3 h-3" /> Connexion sécurisée SSL
        </p>

      </div>
    </div>
  )
}