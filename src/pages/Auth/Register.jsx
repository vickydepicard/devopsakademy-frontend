// src/pages/Auth/Register.jsx — DevOpsAkademy
// Inscription avec loader visible, erreurs précises, vérification email
import { useState } from "react"
import { Link } from "react-router-dom"
import { useAuth } from "../../contexts/AuthContext"
import {
  User, Mail, Lock, Eye, EyeOff, CheckCircle,
  AlertCircle, Loader, AlertTriangle, GraduationCap, BookOpen
} from "lucide-react"

const C = { primary: "#2d287f", light: "#5653e1", accent: "#facc15" }

function PwdStrength({ pwd }) {
  if (!pwd) return null
  const ok = {
    length:  pwd.length >= 8,
    upper:   /[A-Z]/.test(pwd),
    number:  /[0-9]/.test(pwd),
    special: /[^a-zA-Z0-9]/.test(pwd),
  }
  const n = Object.values(ok).filter(Boolean).length
  const bar = [
    { label: "Trop court", color: "#ef4444", w: "20%" },
    { label: "Faible",     color: "#f97316", w: "45%" },
    { label: "Moyen",      color: "#eab308", w: "70%" },
    { label: "Fort",       color: "#22c55e", w: "100%" },
  ][n - 1] || { label: "Trop court", color: "#ef4444", w: "20%" }

  return (
    <div className="mt-1.5 space-y-1">
      <div className="h-1 bg-gray-100 rounded-full overflow-hidden">
        <div className="h-full rounded-full transition-all duration-500"
          style={{ width: bar.w, background: bar.color }} />
      </div>
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-bold" style={{ color: bar.color }}>{bar.label}</span>
        <div className="flex gap-1.5">
          {[["length","8+"],["upper","Maj"],["number","Chif"],["special","Spé"]].map(([k,l]) => (
            <span key={k} className={`text-[9px] px-1.5 py-0.5 rounded-full font-medium
              ${ok[k] ? "bg-emerald-100 text-emerald-700" : "bg-gray-100 text-gray-400"}`}>
              {ok[k] ? "✓" : "·"}{l}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}

// Écran succès après inscription
function SuccessScreen({ email, emailSent, onResend, resending, resendOk }) {
  return (
    <div className="text-center space-y-5 py-2">
      <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto"
        style={{ background: "linear-gradient(135deg,#ecfdf5,#d1fae5)", border: "3px solid #10b981" }}>
        <Mail className="w-10 h-10 text-emerald-500" />
      </div>

      <div>
        <h3 className="text-xl font-black text-gray-900">Compte créé !</h3>
        <p className="text-gray-500 text-sm mt-1 leading-relaxed">
          {emailSent
            ? <>Email de vérification envoyé à <strong className="text-indigo-700">{email}</strong></>
            : <>Compte créé. Cliquez ci-dessous pour recevoir votre lien d'activation.</>
          }
        </p>
      </div>

      {!emailSent && (
        <div className="rounded-xl p-3 text-left flex items-start gap-2"
          style={{ background: "#fffbeb", border: "1px solid #fde68a" }}>
          <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
          <p className="text-amber-700 text-xs">L'envoi automatique a échoué. Cliquez sur « Renvoyer » pour obtenir votre lien.</p>
        </div>
      )}

      {emailSent && (
        <div className="rounded-xl p-3 text-left space-y-1.5"
          style={{ background: "#f0f9ff", border: "1px solid #bae6fd" }}>
          {["Ouvrez votre boîte email", "Cliquez sur « Activer mon compte »", "Compte activé instantanément"].map((s, i) => (
            <div key={i} className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-black text-white flex-shrink-0"
                style={{ background: "#0ea5e9" }}>{i + 1}</div>
              <p className="text-blue-700 text-xs">{s}</p>
            </div>
          ))}
        </div>
      )}

      <div className="space-y-2">
        {resendOk ? (
          <p className="text-emerald-600 text-xs font-medium flex items-center justify-center gap-1">
            <CheckCircle className="w-3.5 h-3.5" /> Email envoyé ! Vérifiez vos spams.
          </p>
        ) : (
          <button onClick={onResend} disabled={resending}
            className="w-full py-2.5 rounded-xl text-sm font-bold border-2 transition hover:bg-gray-50 disabled:opacity-50 flex items-center justify-center gap-2"
            style={{ borderColor: C.light, color: C.light }}>
            {resending ? <><Loader className="w-3.5 h-3.5 animate-spin" /> Envoi...</> : "Renvoyer l'email de vérification"}
          </button>
        )}
        <p className="text-gray-400 text-xs">Vérifiez aussi vos spams</p>
      </div>

      <Link to="/login"
        className="block w-full py-3 rounded-xl text-sm font-black text-white transition hover:opacity-90"
        style={{ background: `linear-gradient(135deg,${C.primary},${C.light})` }}>
        → Se connecter maintenant
      </Link>
    </div>
  )
}

// Overlay de chargement complet
function LoadingOverlay() {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center"
      style={{ background: "rgba(30,27,75,0.95)", backdropFilter: "blur(4px)" }}>
      <div className="text-center space-y-5">
        <div className="relative mx-auto w-16 h-16">
          <div className="w-16 h-16 rounded-full border-4 border-indigo-300/30 animate-spin"
            style={{ borderTopColor: "#facc15" }} />
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-yellow-400 font-black text-xs">DA</span>
          </div>
        </div>
        <div>
          <p className="text-white font-black text-lg">Création du compte...</p>
          <p className="text-indigo-300 text-sm mt-1">Veuillez patienter quelques secondes</p>
        </div>
        <div className="flex gap-1.5 justify-center">
          {[0,1,2].map(i => (
            <div key={i} className="w-2 h-2 rounded-full bg-yellow-400 animate-bounce"
              style={{ animationDelay: `${i * 0.15}s` }} />
          ))}
        </div>
      </div>
    </div>
  )
}

export default function Register() {
  const { register } = useAuth()

  const [form, setForm] = useState({
    first_name: "", last_name: "", email: "", password: "", role: "student"
  })
  const [showPwd,   setShowPwd]   = useState(false)
  const [loading,   setLoading]   = useState(false)
  const [success,   setSuccess]   = useState(false)
  const [emailSent, setEmailSent] = useState(true)
  const [resending, setResending] = useState(false)
  const [resendOk,  setResendOk]  = useState(false)
  const [errors,    setErrors]    = useState({})
  const [globalErr, setGlobalErr] = useState("")

  const set = (k, v) => {
    setForm(p => ({ ...p, [k]: v }))
    setErrors(p => ({ ...p, [k]: "" }))
    setGlobalErr("")
  }

  const validate = () => {
    const e = {}
    if (!form.first_name.trim() || form.first_name.trim().length < 2) e.first_name = "Minimum 2 caractères"
    if (!form.last_name.trim()  || form.last_name.trim().length < 2)  e.last_name  = "Minimum 2 caractères"
    if (!form.email || !form.email.includes("@"))                      e.email      = "Adresse email invalide"
    if (!form.password || form.password.length < 8)                    e.password   = "Minimum 8 caractères"
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) return
    setLoading(true); setGlobalErr("")
    try {
      const res = await register(form)
      if (res?.success) {
        setEmailSent(res.email_sent !== false)
        setSuccess(true)
      } else {
        const msg = res?.message || "Une erreur est survenue"
        // Erreurs de champ spécifiques
        if (res?.errors) {
          setErrors(res.errors)
        } else if (msg.toLowerCase().includes("email") && msg.toLowerCase().includes("existe")) {
          setErrors(p => ({ ...p, email: "Cet email est déjà utilisé. Connectez-vous ou utilisez un autre email." }))
        } else if (msg.toLowerCase().includes("email")) {
          setErrors(p => ({ ...p, email: msg }))
        } else if (msg.toLowerCase().includes("mot de passe") || msg.toLowerCase().includes("password")) {
          setErrors(p => ({ ...p, password: msg }))
        } else {
          setGlobalErr(msg)
        }
      }
    } catch (err) {
      const data = err?.response?.data
      if (data?.errors) {
        setErrors(data.errors)
      } else {
        setGlobalErr(data?.message || err?.message || "Erreur de connexion au serveur")
      }
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
        body: JSON.stringify({ email: form.email }),
      })
      setResendOk(true)
    } catch { } finally { setResending(false) }
  }

  const inp = "flex-1 px-4 py-3 bg-transparent focus:outline-none text-gray-900 text-sm placeholder-gray-400"
  const fieldCls = (k) => `flex items-center rounded-xl border-2 transition bg-white ${errors[k] ? "border-red-300" : "border-gray-200 focus-within:border-indigo-400"}`

  // Overlay plein écran pendant le chargement
  if (loading) return <LoadingOverlay />

  // Succès
  if (success) return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8"
      style={{ background: "linear-gradient(135deg,#1e1b4b 0%,#2d287f 50%,#4c1d95 100%)" }}>
      <div className="w-full max-w-sm">
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          <div className="h-1" style={{ background: "linear-gradient(90deg,#2d287f,#5653e1,#facc15)" }} />
          <div className="p-6">
            <SuccessScreen email={form.email} emailSent={emailSent}
              onResend={handleResend} resending={resending} resendOk={resendOk} />
          </div>
        </div>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8"
      style={{ background: "linear-gradient(135deg,#1e1b4b 0%,#2d287f 50%,#4c1d95 100%)" }}>
      <div className="w-full max-w-sm">

        {/* Logo */}
        <div className="flex items-center justify-center gap-2.5 mb-5">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ background: "#facc15" }}>
            <span className="text-indigo-900 font-black text-xs">DA</span>
          </div>
          <span className="text-white font-black text-base">DevOps Akademy</span>
        </div>

        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          <div className="h-1" style={{ background: "linear-gradient(90deg,#2d287f,#5653e1,#facc15)" }} />

          <div className="px-6 py-5 space-y-4">

            <div className="text-center">
              <h1 className="text-xl font-black text-gray-900">Créer un compte</h1>
              <p className="text-gray-500 text-xs mt-0.5">Rejoignez la communauté DevOps</p>
            </div>

            {/* Erreur globale */}
            {globalErr && (
              <div className="flex items-start gap-2 rounded-xl px-3 py-2.5"
                style={{ background: "#fef2f2", border: "1px solid #fecaca" }}>
                <AlertCircle className="w-3.5 h-3.5 text-red-500 flex-shrink-0 mt-0.5" />
                <p className="text-red-600 text-xs">{globalErr}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3" noValidate>

              {/* Prénom / Nom */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <div className={fieldCls("first_name")}>
                    <div className="pl-3.5"><User className="w-3.5 h-3.5 text-gray-400" /></div>
                    <input value={form.first_name} onChange={e => set("first_name", e.target.value)}
                      className={inp} placeholder="Prénom" autoComplete="given-name" />
                  </div>
                  {errors.first_name && <p className="mt-0.5 text-[10px] text-red-500 flex items-center gap-1"><AlertCircle className="w-2.5 h-2.5" />{errors.first_name}</p>}
                </div>
                <div>
                  <div className={fieldCls("last_name")}>
                    <input value={form.last_name} onChange={e => set("last_name", e.target.value)}
                      className={inp} placeholder="Nom" autoComplete="family-name" />
                  </div>
                  {errors.last_name && <p className="mt-0.5 text-[10px] text-red-500 flex items-center gap-1"><AlertCircle className="w-2.5 h-2.5" />{errors.last_name}</p>}
                </div>
              </div>

              {/* Email */}
              <div>
                <div className={fieldCls("email")}>
                  <div className="pl-3.5"><Mail className="w-3.5 h-3.5 text-gray-400" /></div>
                  <input type="email" value={form.email} onChange={e => set("email", e.target.value)}
                    className={inp} placeholder="vous@exemple.com" autoComplete="email" />
                </div>
                {errors.email && <p className="mt-0.5 text-[10px] text-red-500 flex items-center gap-1"><AlertCircle className="w-2.5 h-2.5" />{errors.email}</p>}
              </div>

              {/* Mot de passe */}
              <div>
                <div className={fieldCls("password")}>
                  <div className="pl-3.5"><Lock className="w-3.5 h-3.5 text-gray-400" /></div>
                  <input type={showPwd ? "text" : "password"} value={form.password}
                    onChange={e => set("password", e.target.value)}
                    className={inp} placeholder="Minimum 8 caractères" autoComplete="new-password" />
                  <button type="button" onClick={() => setShowPwd(s => !s)}
                    className="pr-3.5 text-gray-400 hover:text-gray-600">
                    {showPwd ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
                {errors.password
                  ? <p className="mt-0.5 text-[10px] text-red-500 flex items-center gap-1"><AlertCircle className="w-2.5 h-2.5" />{errors.password}</p>
                  : <PwdStrength pwd={form.password} />
                }
              </div>

              {/* Rôle */}
              <div className="grid grid-cols-2 gap-2">
                {[
                  { value: "student",    icon: GraduationCap, label: "Apprenant" },
                  { value: "instructor", icon: BookOpen,       label: "Formateur" },
                ].map(({ value, icon: Icon, label }) => (
                  <button key={value} type="button" onClick={() => set("role", value)}
                    className="flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold border-2 transition"
                    style={form.role === value
                      ? { background: `linear-gradient(135deg,${C.primary},${C.light})`, borderColor: C.primary, color: "#fff" }
                      : { borderColor: "#e5e7eb", color: "#6b7280" }}>
                    <Icon className="w-4 h-4" />
                    {label}
                    {form.role === value && <CheckCircle className="w-3.5 h-3.5" />}
                  </button>
                ))}
              </div>

              {/* Formateur → note validation */}
              {form.role === "instructor" && (
                <div className="flex items-start gap-2 rounded-xl px-3 py-2.5 text-xs"
                  style={{ background: "#fffbeb", border: "1px solid #fde68a" }}>
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-500 flex-shrink-0 mt-0.5" />
                  <p className="text-amber-700 leading-relaxed">
                    Le compte formateur nécessite une <strong>validation par l'équipe</strong>. Vous recevrez un email après vérification de votre dossier.
                  </p>
                </div>
              )}

              {/* Bouton */}
              <button type="submit"
                className="w-full py-3 rounded-xl text-sm font-black text-white transition hover:opacity-90 flex items-center justify-center gap-2"
                style={{ background: `linear-gradient(135deg,${C.primary},${C.light})` }}>
                Créer mon compte →
              </button>

              <p className="text-center text-xs text-gray-400">
                🔒 Un email d'activation sera envoyé
              </p>
            </form>

            <p className="text-center text-xs text-gray-500">
              Déjà un compte ?{" "}
              <Link to="/login" className="font-black hover:underline" style={{ color: C.light }}>
                Se connecter
              </Link>
            </p>

          </div>
        </div>
      </div>
    </div>
  )
}