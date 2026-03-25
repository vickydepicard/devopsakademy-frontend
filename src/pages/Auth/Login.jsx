// src/pages/Auth/Login.jsx
// Connexion DevOpsAkademy — Design premium + pré-remplissage + loader
import { useState, useEffect } from "react"
import { Link, useNavigate, useLocation } from "react-router-dom"
import { useAuth } from "../../contexts/AuthContext"
import { Mail, Lock, Eye, EyeOff, AlertCircle, Loader, CheckCircle, Shield } from "lucide-react"

const C = { primary: "#2d287f", light: "#5653e1", accent: "#facc15" }

export default function Login() {
  const { user, login, loading } = useAuth()
  const navigate  = useNavigate()
  const location  = useLocation()

  const [form,     setForm]     = useState({ email: "", password: "" })
  const [showPwd,  setShowPwd]  = useState(false)
  const [localErr, setLocalErr] = useState("")
  const [notice,   setNotice]   = useState("")
  const [submitting, setSubmitting] = useState(false)

  // Pré-remplir depuis Register (state) ou forgot-password
  useEffect(() => {
    const st = location.state
    if (st?.email)    setForm(p => ({ ...p, email: st.email }))
    if (st?.password) setForm(p => ({ ...p, password: st.password }))
    if (st?.message)  setNotice(st.message)
    // Nettoyer le state pour ne pas réafficher au rechargement
    window.history.replaceState({}, "")
  }, [])

  // Redirection si déjà connecté
  useEffect(() => {
    if (!user) return
    if (user.role === "admin" || user.role === "superadmin") navigate("/admin",      { replace: true })
    else if (user.role === "instructor")                      navigate("/instructor", { replace: true })
    else                                                      navigate("/student",    { replace: true })
  }, [user, navigate])

  const set = (k, v) => { setForm(p => ({ ...p, [k]: v })); setLocalErr("") }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.email || !form.password) {
      setLocalErr("Veuillez remplir tous les champs")
      return
    }
    setSubmitting(true); setLocalErr("")
    try {
      const res = await login(form)
      if (res?.success) {
        const role = res.user?.role || ""
        if (role === "admin" || role === "superadmin") navigate("/admin",      { replace: true })
        else if (role === "instructor")                navigate("/instructor", { replace: true })
        else                                           navigate("/student",    { replace: true })
      } else {
        setLocalErr(res?.message || "Email ou mot de passe incorrect")
      }
    } catch (err) {
      const msg = err?.response?.data?.message || "Email ou mot de passe incorrect"
      // Message spécifique si email non vérifié
      if (msg.toLowerCase().includes("vérif") || msg.toLowerCase().includes("verif")) {
        setLocalErr("⚠️ Email non vérifié. Consultez votre boîte email pour activer votre compte.")
      } else {
        setLocalErr(msg)
      }
    } finally {
      setSubmitting(false)
    }
  }

  const isLoading = loading || submitting
  const inputCls = "flex-1 px-4 py-3.5 bg-transparent focus:outline-none text-gray-900 text-sm placeholder-gray-400"

  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-12"
      style={{ background: "linear-gradient(135deg,#1e1b4b 0%,#2d287f 40%,#4c1d95 100%)" }}>

      <div className="w-full max-w-md">

        {/* Logo mobile */}
        <div className="text-center mb-8 lg:hidden">
          <div className="flex items-center justify-center gap-3 mb-2">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ background: "#facc15" }}>
              <span className="text-indigo-900 font-black text-xs">DA</span>
            </div>
            <span className="text-white font-black text-lg">DevOps Akademy</span>
          </div>
        </div>

        {/* Card */}
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden"
          style={{ animation: "slideUp 0.4s cubic-bezier(0.34,1.56,0.64,1)" }}>

          {/* Barre top */}
          <div className="h-1.5" style={{ background: "linear-gradient(90deg,#2d287f,#5653e1,#facc15)" }} />

          <div className="p-8 space-y-6">

            {/* Header */}
            <div className="text-center">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
                style={{ background: "linear-gradient(135deg,#2d287f,#5653e1)" }}>
                <Shield className="w-7 h-7 text-white" />
              </div>
              <h2 className="text-2xl font-black text-gray-900">Connexion</h2>
              <p className="text-gray-500 text-sm mt-1">
                Accédez à votre espace DevOps
              </p>
            </div>

            {/* Notice succès (depuis Register) */}
            {notice && (
              <div className="flex items-start gap-2.5 rounded-xl px-4 py-3"
                style={{ background: "#f0fdf4", border: "1px solid #bbf7d0" }}>
                <CheckCircle className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                <p className="text-emerald-700 text-sm font-medium">{notice}</p>
              </div>
            )}

            {/* Erreur */}
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
                    className="text-xs font-semibold transition hover:opacity-70"
                    style={{ color: C.light }}>
                    Oublié ?
                  </Link>
                </div>
                <div className="flex items-center rounded-xl border-2 border-gray-200 focus-within:border-indigo-400 focus-within:shadow-sm transition bg-white">
                  <div className="pl-4"><Lock className="w-4 h-4 text-gray-400" /></div>
                  <input type={showPwd ? "text" : "password"} value={form.password}
                    onChange={e => set("password", e.target.value)}
                    className={inputCls} placeholder="Votre mot de passe"
                    autoComplete="current-password" />
                  <button type="button" onClick={() => setShowPwd(s => !s)}
                    className="pr-4 text-gray-400 hover:text-gray-600 transition flex-shrink-0">
                    {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Bouton connexion */}
              <button type="submit" disabled={isLoading}
                className="w-full py-3.5 rounded-xl font-black text-sm transition hover:opacity-90 disabled:opacity-60 flex items-center justify-center gap-2.5 shadow-lg mt-2"
                style={{ background: "linear-gradient(135deg,#2d287f,#5653e1)", color: "#fff" }}>
                {isLoading ? (
                  <>
                    <Loader className="w-5 h-5 animate-spin" />
                    <span>Connexion en cours...</span>
                  </>
                ) : (
                  <span>Se connecter →</span>
                )}
              </button>
            </form>

            {/* Séparateur */}
            <div className="flex items-center gap-3">
              <div className="flex-1 h-px bg-gray-200" />
              <span className="text-xs text-gray-400 font-medium">OU</span>
              <div className="flex-1 h-px bg-gray-200" />
            </div>

            {/* Lien inscription */}
            <div className="text-center">
              <p className="text-sm text-gray-600">
                Pas encore de compte ?{" "}
                <Link to="/register"
                  className="font-black transition hover:opacity-80"
                  style={{ color: C.light }}>
                  Créer un compte gratuit →
                </Link>
              </p>
            </div>

          </div>
        </div>

        {/* Info sécurité */}
        <div className="flex items-center justify-center gap-2 mt-5">
          <Shield className="w-4 h-4 text-indigo-300" />
          <p className="text-indigo-200/60 text-xs">Connexion sécurisée SSL · DevOpsAkademy 2026</p>
        </div>

      </div>

      <style>{`
        @keyframes slideUp {
          from { opacity:0; transform:translateY(24px) scale(0.97); }
          to   { opacity:1; transform:translateY(0) scale(1); }
        }
      `}</style>
    </div>
  )
}