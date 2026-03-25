// src/pages/Auth/Register.jsx
// VERSION CORRIGÉE — 25 mars 2026
// Corrections :
//   - SuccessScreen affiche avertissement si email_sent=false (Brevo KO)
//   - handleResend utilise la base URL correcte via /api/auth/resend-verification
//   - register() ne stocke plus de token → pas de redirection auto après inscription

import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useAuth } from "../../contexts/AuthContext"
import {
  User, Mail, Lock, Eye, EyeOff, CheckCircle,
  AlertCircle, Loader, AlertTriangle
} from "lucide-react"

const C = { primary: "#2d287f", light: "#5653e1", accent: "#facc15" }

// Indicateur de force du mot de passe
function PasswordStrength({ pwd }) {
  if (!pwd) return null
  const checks = {
    length:  pwd.length >= 8,
    upper:   /[A-Z]/.test(pwd),
    number:  /[0-9]/.test(pwd),
    special: /[^a-zA-Z0-9]/.test(pwd),
  }
  const score = Object.values(checks).filter(Boolean).length
  const levels = [
    { label: "Trop court",  color: "#ef4444", width: "25%"  },
    { label: "Faible",      color: "#f97316", width: "50%"  },
    { label: "Moyen",       color: "#eab308", width: "75%"  },
    { label: "Fort",        color: "#22c55e", width: "100%" },
  ]
  const lvl = levels[score - 1] || levels[0]
  return (
    <div className="mt-1.5 space-y-1.5">
      <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
        <div className="h-full rounded-full transition-all duration-500"
          style={{ width: lvl.width, background: lvl.color }} />
      </div>
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium" style={{ color: lvl.color }}>{lvl.label}</span>
        <div className="flex gap-2">
          {[
            { key: "length",  label: "8 car." },
            { key: "upper",   label: "Maj." },
            { key: "number",  label: "Chiffre" },
            { key: "special", label: "Spécial" },
          ].map(({ key, label }) => (
            <span key={key}
              className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium transition-all
                ${checks[key] ? "bg-emerald-100 text-emerald-700" : "bg-gray-100 text-gray-400"}`}>
              {checks[key] ? "✓" : "·"} {label}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}

function Field({ label, icon: Icon, error, children }) {
  return (
    <div>
      {label && <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wider">{label}</label>}
      <div className={`relative flex items-center rounded-xl border-2 transition-all bg-white
        ${error ? "border-red-300" : "border-gray-200 focus-within:border-indigo-400 focus-within:shadow-sm"}`}>
        {Icon && (
          <div className="pl-4 flex-shrink-0">
            <Icon className="w-4 h-4 text-gray-400" />
          </div>
        )}
        {children}
      </div>
      {error && (
        <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
          <AlertCircle className="w-3 h-3" />{error}
        </p>
      )}
    </div>
  )
}

// ✅ CORRECTIF 2 — SuccessScreen affiche un avertissement si l'email n'a pas été envoyé
function SuccessScreen({ email, emailSent, onResend, resending }) {
  return (
    <div className="text-center space-y-6 py-4">
      <div className="relative mx-auto w-24 h-24">
        <div className="w-24 h-24 rounded-full flex items-center justify-center"
          style={{ background: "linear-gradient(135deg,#ecfdf5,#d1fae5)", border: "3px solid #10b981" }}>
          <Mail className="w-12 h-12 text-emerald-500" />
        </div>
        <div className="absolute -top-1 -right-1 w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center">
          <CheckCircle className="w-5 h-5 text-yellow-900" />
        </div>
      </div>

      <div>
        <h3 className="text-2xl font-black text-gray-900 mb-2">Compte créé !</h3>
        <p className="text-gray-500 text-sm leading-relaxed max-w-xs mx-auto">
          {emailSent
            ? "Un email de vérification a été envoyé à"
            : "Votre compte a été créé. Cliquez ci-dessous pour recevoir le lien d'activation à"}
        </p>
        <p className="font-black text-indigo-700 text-base mt-1">{email}</p>
      </div>

      {/* ✅ CORRECTIF 2 — Avertissement si email non envoyé (Brevo KO) */}
      {!emailSent && (
        <div className="rounded-2xl p-4 text-left"
          style={{ background: "#fffbeb", border: "1px solid #fde68a" }}>
          <div className="flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-black text-amber-800 uppercase tracking-wider mb-1">Email non reçu ?</p>
              <p className="text-xs text-amber-700">L'envoi automatique a rencontré un problème. Cliquez sur « Renvoyer » ci-dessous pour obtenir votre lien d'activation.</p>
            </div>
          </div>
        </div>
      )}

      {emailSent && (
        <div className="rounded-2xl p-4 text-left space-y-2.5"
          style={{ background: "#f0f9ff", border: "1px solid #bae6fd" }}>
          <p className="text-xs font-black text-blue-800 uppercase tracking-wider">Étapes suivantes</p>
          {[
            "Ouvrez votre boîte email",
            "Cliquez sur le lien de vérification",
            "Votre compte sera activé immédiatement",
          ].map((step, i) => (
            <div key={i} className="flex items-start gap-2.5">
              <div className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black text-white flex-shrink-0 mt-0.5"
                style={{ background: "#0ea5e9" }}>{i + 1}</div>
              <p className="text-sm text-blue-700">{step}</p>
            </div>
          ))}
        </div>
      )}

      <div className="space-y-2">
        <p className="text-xs text-gray-400">Pas reçu l'email ? Vérifiez aussi vos spams.</p>
        <button onClick={onResend} disabled={resending}
          className="w-full py-2.5 rounded-xl text-sm font-bold border-2 transition hover:bg-gray-50 disabled:opacity-50 flex items-center justify-center gap-2"
          style={{ borderColor: "#5653e1", color: "#5653e1" }}>
          {resending ? <><Loader className="w-4 h-4 animate-spin" /> Envoi en cours...</> : "Renvoyer l'email de vérification"}
        </button>
      </div>

      <Link to="/login"
        className="block w-full py-3 rounded-xl text-sm font-black text-white transition hover:opacity-90"
        style={{ background: "linear-gradient(135deg,#2d287f,#5653e1)" }}>
        → Aller à la connexion
      </Link>
    </div>
  )
}

export default function Register() {
  const { register } = useAuth()
  const navigate = useNavigate()

  const [form, setForm] = useState({
    first_name: "", last_name: "", email: "", password: "", role: "student"
  })
  const [showPwd,   setShowPwd]   = useState(false)
  const [loading,   setLoading]   = useState(false)
  const [success,   setSuccess]   = useState(false)
  const [emailSent, setEmailSent] = useState(true)   // ✅ NOUVEAU
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
    if (!form.first_name || form.first_name.length < 2) e.first_name = "Minimum 2 caractères"
    if (!form.last_name  || form.last_name.length < 2)  e.last_name  = "Minimum 2 caractères"
    if (!form.email || !form.email.includes("@"))        e.email      = "Email invalide"
    if (!form.password || form.password.length < 8)      e.password   = "Minimum 8 caractères"
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) return
    setLoading(true)
    setGlobalErr("")
    try {
      const res = await register(form)
      if (res?.success) {
        // ✅ CORRECTIF 1 + 2 : afficher l'écran succès avec état email_sent
        setEmailSent(res.email_sent !== false) // true par défaut sauf si explicitement false
        setSuccess(true)
      } else {
        const msg = res?.message || "Une erreur est survenue"
        if (msg.toLowerCase().includes("existe")) {
          setErrors(p => ({ ...p, email: "Cet email est déjà utilisé" }))
        } else {
          setGlobalErr(msg)
        }
      }
    } catch (err) {
      const msg = err?.response?.data?.message || err?.message || "Une erreur est survenue"
      setGlobalErr(msg)
    } finally {
      setLoading(false)
    }
  }

  // ✅ CORRECTIF 4 — handleResend utilise fetch avec URL relative /api/...
  // Le proxy Vite (dev) et Nginx (prod) redirigent vers l'API.
  // On ne hardcode plus de port ou d'hôte.
  const handleResend = async () => {
    setResending(true)
    setResendOk(false)
    try {
      const res = await fetch("/api/auth/resend-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: form.email }),
      })
      // L'API retourne toujours 200 pour ne pas révéler si l'email existe
      setResendOk(true)
      setEmailSent(true) // Optimiste — on suppose que ça a marché
    } catch (err) {
      console.error("Resend error:", err)
    } finally {
      setResending(false)
    }
  }

  const inputCls = "flex-1 px-4 py-3.5 bg-transparent focus:outline-none text-gray-900 text-sm placeholder-gray-400"

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6 py-12"
        style={{ background: "linear-gradient(135deg,#1e1b4b 0%,#2d287f 40%,#4c1d95 100%)" }}>
        <div className="w-full max-w-md">
          <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
            <div className="h-1.5" style={{ background: "linear-gradient(90deg,#2d287f,#5653e1,#facc15)" }} />
            <div className="p-8">
              <SuccessScreen
                email={form.email}
                emailSent={emailSent}
                onResend={handleResend}
                resending={resending}
              />
              {resendOk && (
                <p className="text-center text-xs text-emerald-600 mt-3 font-medium">
                  ✓ Email de vérification envoyé. Vérifiez vos spams.
                </p>
              )}
            </div>
          </div>
        </div>
        <style>{`@keyframes slideUp { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }`}</style>
      </div>
    )
  }

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

          <div className="p-8 space-y-5">

            {/* Header */}
            <div className="text-center">
              <h2 className="text-2xl font-black text-gray-900">Créer un compte</h2>
              <p className="text-gray-500 text-sm mt-1">Rejoignez la communauté DevOps</p>
            </div>

            {/* Erreur globale */}
            {globalErr && (
              <div className="flex items-start gap-2.5 rounded-xl px-4 py-3"
                style={{ background: "#fef2f2", border: "1px solid #fecaca" }}>
                <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                <p className="text-red-600 text-sm">{globalErr}</p>
              </div>
            )}

            {/* Formulaire */}
            <form onSubmit={handleSubmit} className="space-y-4" noValidate>

              {/* Prénom / Nom */}
              <div className="grid grid-cols-2 gap-3">
                <Field label="Prénom" icon={User} error={errors.first_name}>
                  <input type="text" value={form.first_name}
                    onChange={e => set("first_name", e.target.value)}
                    className={inputCls} placeholder="Jean" autoComplete="given-name" />
                </Field>
                <Field label="Nom" icon={User} error={errors.last_name}>
                  <input type="text" value={form.last_name}
                    onChange={e => set("last_name", e.target.value)}
                    className={inputCls} placeholder="Dupont" autoComplete="family-name" />
                </Field>
              </div>

              {/* Email */}
              <Field label="Email" icon={Mail} error={errors.email}>
                <input type="email" value={form.email}
                  onChange={e => set("email", e.target.value)}
                  className={inputCls} placeholder="vous@exemple.com" autoComplete="email" />
              </Field>

              {/* Mot de passe */}
              <Field label="Mot de passe" icon={Lock} error={errors.password}>
                <input type={showPwd ? "text" : "password"} value={form.password}
                  onChange={e => set("password", e.target.value)}
                  className={inputCls} placeholder="Minimum 8 caractères" autoComplete="new-password" />
                <button type="button" onClick={() => setShowPwd(!showPwd)}
                  className="pr-4 text-gray-400 hover:text-gray-600 flex-shrink-0">
                  {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </Field>
              <PasswordStrength pwd={form.password} />

              {/* Rôle */}
              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wider">Je suis</label>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { value: "student", label: "Apprenant" },
                    { value: "instructor", label: "Formateur" },
                  ].map(opt => (
                    <button key={opt.value} type="button"
                      onClick={() => set("role", opt.value)}
                      className={`py-3 rounded-xl text-sm font-bold border-2 transition
                        ${form.role === opt.value
                          ? "text-white"
                          : "border-gray-200 text-gray-500 hover:border-indigo-200"}`}
                      style={form.role === opt.value
                        ? { background: "linear-gradient(135deg,#2d287f,#5653e1)", borderColor: "#2d287f" }
                        : {}}>
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Submit */}
              <button type="submit" disabled={loading}
                className="w-full py-3.5 rounded-xl text-sm font-black text-white transition hover:opacity-90 disabled:opacity-60 flex items-center justify-center gap-2 mt-2"
                style={{ background: "linear-gradient(135deg,#2d287f,#5653e1)" }}>
                {loading ? <><Loader className="w-4 h-4 animate-spin" /> Création en cours...</> : "Créer mon compte"}
              </button>

            </form>

            {/* Lien login */}
            <p className="text-center text-sm text-gray-500">
              Déjà un compte ?{" "}
              <Link to="/login" className="font-black hover:underline" style={{ color: "#5653e1" }}>
                Se connecter
              </Link>
            </p>

          </div>
        </div>
      </div>

      <style>{`@keyframes slideUp { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }`}</style>
    </div>
  )
}