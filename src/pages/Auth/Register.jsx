// src/pages/Auth/Register.jsx
// Inscription DevOpsAkademy — Design premium + vérification email
import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useAuth } from "../../contexts/AuthContext"
import {
  User, Mail, Lock, Eye, EyeOff, CheckCircle,
  AlertCircle, Loader, GraduationCap, BookOpen, Shield
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

// Champ de formulaire stylisé
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

// Page succès — vérification email
function SuccessScreen({ email, onResend, resending }) {
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
        <h3 className="text-2xl font-black text-gray-900 mb-2">Vérifiez votre email !</h3>
        <p className="text-gray-500 text-sm leading-relaxed max-w-xs mx-auto">
          Un email de vérification a été envoyé à
        </p>
        <p className="font-black text-indigo-700 text-base mt-1">{email}</p>
      </div>

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

      <div className="space-y-2">
        <p className="text-xs text-gray-400">Pas reçu l'email ?</p>
        <button onClick={onResend} disabled={resending}
          className="w-full py-2.5 rounded-xl text-sm font-bold border-2 transition hover:bg-gray-50 disabled:opacity-50 flex items-center justify-center gap-2"
          style={{ borderColor: "#5653e1", color: "#5653e1" }}>
          {resending ? <><Loader className="w-4 h-4 animate-spin" /> Renvoi...</> : "Renvoyer l'email de vérification"}
        </button>
        <p className="text-xs text-gray-400">Vérifiez aussi vos spams</p>
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
  const [showPwd,    setShowPwd]    = useState(false)
  const [loading,    setLoading]    = useState(false)
  const [success,    setSuccess]    = useState(false)
  const [resending,  setResending]  = useState(false)
  const [errors,     setErrors]     = useState({})
  const [globalErr,  setGlobalErr]  = useState("")

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
    setLoading(true); setGlobalErr("")
    try {
      const res = await register(form)
      if (res?.success) {
        setSuccess(true)
      } else {
        setGlobalErr(res?.message || "Une erreur est survenue")
      }
    } catch (err) {
      const msg = err?.response?.data?.message || "Une erreur est survenue"
      if (msg.toLowerCase().includes("existe")) {
        setErrors(p => ({ ...p, email: "Cet email est déjà utilisé" }))
      } else {
        setGlobalErr(msg)
      }
    } finally {
      setLoading(false)
    }
  }

  const handleResend = async () => {
    setResending(true)
    try {
      await fetch("/api/auth/resend-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: form.email }),
      })
    } catch (_) {}
    finally { setResending(false) }
  }

  const inputCls = "flex-1 px-4 py-3 bg-transparent focus:outline-none text-gray-900 text-sm placeholder-gray-400 rounded-xl"

  return (
    <div className="min-h-screen flex"
      style={{ background: "linear-gradient(135deg,#1e1b4b 0%,#2d287f 40%,#4c1d95 100%)" }}>

      {/* Panel gauche — Bénéfices (desktop) */}
      <div className="hidden lg:flex flex-col justify-center px-12 py-16 max-w-md">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: "#facc15" }}>
              <span className="text-indigo-900 font-black text-sm">DA</span>
            </div>
            <span className="text-white font-black text-xl">DevOps Akademy</span>
          </div>
          <h1 className="text-white font-black text-3xl leading-tight mb-4">
            Rejoins +2 000<br />apprenants DevOps
          </h1>
          <p className="text-indigo-200 text-sm leading-relaxed">
            Formations certifiantes, projets réels et communauté active.
          </p>
        </div>

        <div className="space-y-4">
          {[
            { icon: GraduationCap, title: "Certifications reconnues", desc: "Docker, Kubernetes, AWS, Azure..." },
            { icon: BookOpen,      title: "Cours pratiques",          desc: "Labs, projets et cas réels" },
            { icon: Shield,        title: "Garantie 30 jours",        desc: "Satisfait ou remboursé" },
          ].map(({ icon: Icon, title, desc }) => (
            <div key={title} className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: "rgba(255,255,255,0.1)" }}>
                <Icon className="w-5 h-5 text-yellow-400" />
              </div>
              <div>
                <p className="text-white font-bold text-sm">{title}</p>
                <p className="text-indigo-300 text-xs mt-0.5">{desc}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-10 p-4 rounded-2xl" style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.1)" }}>
          <div className="flex items-center gap-3">
            <div className="flex -space-x-2">
              {["V","A","M","R"].map(l => (
                <div key={l} className="w-8 h-8 rounded-full border-2 border-indigo-800 flex items-center justify-center text-xs font-black text-white"
                  style={{ background: `hsl(${l.charCodeAt(0)*40},60%,50%)` }}>{l}</div>
              ))}
            </div>
            <div>
              <p className="text-white text-xs font-bold">+2 000 apprenants actifs</p>
              <p className="text-indigo-300 text-xs">rejoignent chaque mois</p>
            </div>
          </div>
        </div>
      </div>

      {/* Panel droit — Formulaire */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">

          {/* Card */}
          <div className="bg-white rounded-3xl shadow-2xl overflow-hidden"
            style={{ animation: "slideUp 0.4s cubic-bezier(0.34,1.56,0.64,1)" }}>

            {/* Barre top colorée */}
            <div className="h-1.5" style={{ background: "linear-gradient(90deg,#2d287f,#5653e1,#facc15)" }} />

            <div className="p-8">
              {success ? (
                <SuccessScreen email={form.email} onResend={handleResend} resending={resending} />
              ) : (
                <>
                  {/* Header */}
                  <div className="text-center mb-7">
                    <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
                      style={{ background: "linear-gradient(135deg,#2d287f,#5653e1)" }}>
                      <User className="w-7 h-7 text-white" />
                    </div>
                    <h2 className="text-2xl font-black text-gray-900">Créer un compte</h2>
                    <p className="text-gray-500 text-sm mt-1">
                      Inscris-toi gratuitement en 30 secondes
                    </p>
                  </div>

                  {/* Erreur globale */}
                  {globalErr && (
                    <div className="mb-5 flex items-center gap-2 rounded-xl px-4 py-3"
                      style={{ background: "#fef2f2", border: "1px solid #fecaca" }}>
                      <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
                      <p className="text-red-600 text-sm">{globalErr}</p>
                    </div>
                  )}

                  {/* Formulaire */}
                  <form onSubmit={handleSubmit} className="space-y-4" noValidate>

                    {/* Prénom + Nom */}
                    <div className="grid grid-cols-2 gap-3">
                      <Field icon={User} error={errors.first_name}>
                        <input className={inputCls} placeholder="Prénom" value={form.first_name}
                          onChange={e => set("first_name", e.target.value)} />
                      </Field>
                      <Field error={errors.last_name}>
                        <input className={inputCls} placeholder="Nom" value={form.last_name}
                          onChange={e => set("last_name", e.target.value)} />
                      </Field>
                    </div>

                    {/* Email */}
                    <Field icon={Mail} error={errors.email}>
                      <input type="email" className={inputCls} placeholder="Adresse email"
                        value={form.email} onChange={e => set("email", e.target.value)} />
                    </Field>

                    {/* Mot de passe */}
                    <div>
                      <Field icon={Lock} error={errors.password}>
                        <input type={showPwd ? "text" : "password"} className={inputCls}
                          placeholder="Mot de passe (8 caractères min.)"
                          value={form.password} onChange={e => set("password", e.target.value)} />
                        <button type="button" onClick={() => setShowPwd(s => !s)}
                          className="pr-4 text-gray-400 hover:text-gray-600 transition flex-shrink-0">
                          {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </Field>
                      <PasswordStrength pwd={form.password} />
                    </div>

                    {/* Rôle */}
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { val: "student",    icon: GraduationCap, label: "Étudiant" },
                        { val: "instructor", icon: BookOpen,       label: "Instructeur" },
                      ].map(({ val, icon: Icon, label }) => (
                        <button key={val} type="button"
                          onClick={() => set("role", val)}
                          className="flex items-center gap-2.5 p-3 rounded-xl border-2 transition-all text-left"
                          style={{
                            borderColor: form.role === val ? C.light : "#e5e7eb",
                            background:  form.role === val ? "#f0efff" : "#fff",
                          }}>
                          <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                            style={{ background: form.role === val ? C.light : "#f3f4f6" }}>
                            <Icon className={`w-4 h-4 ${form.role === val ? "text-white" : "text-gray-400"}`} />
                          </div>
                          <span className={`text-sm font-bold ${form.role === val ? "text-indigo-700" : "text-gray-600"}`}>
                            {label}
                          </span>
                          {form.role === val && (
                            <CheckCircle className="w-4 h-4 text-indigo-500 ml-auto" />
                          )}
                        </button>
                      ))}
                    </div>

                    {/* Bouton submit */}
                    <button type="submit" disabled={loading}
                      className="w-full py-3.5 rounded-xl font-black text-sm transition hover:opacity-90 disabled:opacity-60 flex items-center justify-center gap-2.5 mt-2 shadow-lg"
                      style={{ background: "linear-gradient(135deg,#2d287f,#5653e1)", color: "#fff" }}>
                      {loading ? (
                        <>
                          <Loader className="w-5 h-5 animate-spin" />
                          <span>Création du compte...</span>
                        </>
                      ) : (
                        <>
                          <User className="w-5 h-5" />
                          <span>Créer mon compte gratuitement</span>
                        </>
                      )}
                    </button>

                    {/* Note vérification email */}
                    <p className="text-center text-xs text-gray-400 leading-relaxed">
                      🔒 Un email de vérification sera envoyé pour activer ton compte
                    </p>
                  </form>

                  {/* Lien login */}
                  <div className="mt-6 text-center">
                    <p className="text-sm text-gray-500">
                      Déjà un compte ?{" "}
                      <Link to="/login" className="font-black hover:opacity-80 transition"
                        style={{ color: C.light }}>
                        Se connecter →
                      </Link>
                    </p>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Mentions légales */}
          <p className="text-center text-indigo-200/60 text-xs mt-5">
            En créant un compte, tu acceptes nos{" "}
            <a href="/conditions" className="underline hover:text-indigo-200">CGU</a> et notre{" "}
            <a href="/confidentialite" className="underline hover:text-indigo-200">politique de confidentialité</a>
          </p>
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