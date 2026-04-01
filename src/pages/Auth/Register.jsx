// src/pages/Auth/Register.jsx — DevOpsAkademy v4.0
// ✅ Design existant conservé à l'identique
// ✅ Étudiant : flux inchangé
// ✅ Instructeur : après création compte → formulaire candidature 3 étapes
// ✅ Admin reçoit email récapitulatif complet

import { useState, useEffect } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useAuth } from "../../contexts/AuthContext"
import {
  GraduationCap, BookOpen, CheckCircle, AlertCircle,
  Mail, Lock, Eye, EyeOff, User, ShieldCheck, ArrowRight,
  Clock, RefreshCw, AlertTriangle, Loader, Star,
  Trophy, Award, Users, Terminal, BarChart2, Zap,
  ChevronRight, ChevronLeft, Send, Linkedin, Globe, Video
} from "lucide-react"

const C = { primary: "#2d287f", light: "#5653e1", accent: "#facc15", dark: "#1f1b5a" }

const EXPERTISE_OPTIONS = [
  "Docker & Conteneurisation", "Kubernetes", "CI/CD (GitHub Actions, GitLab CI, Jenkins)",
  "Terraform & IaC", "AWS", "Azure", "Google Cloud Platform",
  "Monitoring (Prometheus, Grafana)", "Linux & Administration système",
  "Sécurité DevSecOps", "Python / Scripting Shell", "Réseaux & Protocoles",
  "GitOps & ArgoCD", "Microservices & Cloud Native",
]

const ROLE_CONTENT = {
  student: {
    title: "Lancez votre carrière DevOps",
    subtitle: "Rejoignez +2 000 ingénieurs formés par des praticiens.",
    icon: GraduationCap,
    features: [
      { icon: Terminal,  text: "Labs interactifs Kubernetes & Docker" },
      { icon: Award,     text: "Certificats numériques vérifiables" },
      { icon: BarChart2, text: "Suivi de progression personnalisé" },
      { icon: Users,     text: "Communauté et forum actif" },
      { icon: Trophy,    text: "Classement gamifié & points XP" },
      { icon: Zap,       text: "Accès immédiat aux cours gratuits" },
    ],
    testimonial: {
      text: "J'ai décroché ma première mission Cloud en 3 mois grâce à DevOpsAkademy.",
      author: "Jean D.", role: "DevOps Engineer · Dakar", initials: "JD",
      color: "from-violet-500 to-indigo-600",
    }
  },
  instructor: {
    title: "Partagez votre expertise",
    subtitle: "Vos revenus augmentent à chaque inscription sur vos cours.",
    icon: BookOpen,
    features: [
      { icon: Users,     text: "Revenus basés sur vos apprenants" },
      { icon: BarChart2, text: "Commission configurable par cours" },
      { icon: Award,     text: "Certification instructeur officielle" },
      { icon: Terminal,  text: "Outils de création complets" },
      { icon: Trophy,    text: "Support dédié de notre équipe" },
      { icon: Zap,       text: "Validation sous 3–5 jours ouvrés" },
    ],
    testimonial: {
      text: "Mes revenus augmentent à chaque nouvelle inscription. La plateforme gère tout.",
      author: "Amina T.", role: "SRE Senior · Instructrice certifiée", initials: "AT",
      color: "from-amber-500 to-orange-600",
    }
  }
}

// ── Barre de force mot de passe ───────────────────────────────
function PwdStrength({ pwd }) {
  if (!pwd) return null
  const checks = { length: pwd.length >= 8, upper: /[A-Z]/.test(pwd), number: /[0-9]/.test(pwd), special: /[^a-zA-Z0-9]/.test(pwd) }
  const score = Object.values(checks).filter(Boolean).length
  const levels = [
    { label: "Trop court", color: "#ef4444", w: "20%" },
    { label: "Faible",     color: "#f97316", w: "45%" },
    { label: "Moyen",      color: "#eab308", w: "70%" },
    { label: "Fort",       color: "#22c55e", w: "100%" },
  ]
  const lv = levels[score - 1] || levels[0]
  return (
    <div className="mt-1 space-y-1">
      <div className="h-1 bg-gray-100 rounded-full overflow-hidden">
        <div className="h-full rounded-full transition-all duration-500" style={{ width: lv.w, background: lv.color }} />
      </div>
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-bold" style={{ color: lv.color }}>{lv.label}</span>
        <div className="flex gap-1">
          {[["length", "8+"], ["upper", "Maj"], ["number", "123"], ["special", "#@"]].map(([k, l]) => (
            <span key={k} className={`text-[9px] px-1 py-0.5 rounded font-medium ${checks[k] ? "bg-emerald-100 text-emerald-700" : "bg-gray-100 text-gray-400"}`}>
              {checks[k] ? "✓" : "·"}{l}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}

// ── Colonne gauche (design existant) ─────────────────────────
function LeftPanel({ role }) {
  const content = ROLE_CONTENT[role]
  const Icon = content.icon
  return (
    <div className="hidden lg:flex flex-col justify-between p-10 text-white relative overflow-hidden h-full"
      style={{ background: `linear-gradient(135deg,${C.dark} 0%,${C.primary} 60%,${C.light} 100%)` }}>
      <div className="absolute inset-0 pointer-events-none" style={{
        backgroundImage: `linear-gradient(rgba(255,255,255,0.04) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.04) 1px,transparent 1px)`,
        backgroundSize: "40px 40px"
      }} />
      <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full opacity-20" style={{ background: C.accent, filter: "blur(60px)" }} />
      <div className="absolute -bottom-20 -left-10 w-48 h-48 rounded-full opacity-10" style={{ background: C.light, filter: "blur(50px)" }} />

      <div className="relative z-10">
        <div className="flex items-center gap-2.5 mb-10">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center shadow-lg" style={{ background: C.accent }}>
            <span className="text-indigo-900 font-black text-sm">DA</span>
          </div>
          <span className="font-black text-lg tracking-tight">DevOps Akademy</span>
        </div>
        <div className="mb-8">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4"
            style={{ background: "rgba(255,255,255,0.15)", backdropFilter: "blur(10px)", border: "1px solid rgba(255,255,255,0.2)" }}>
            <Icon className="w-7 h-7 text-white" />
          </div>
          <h2 className="text-3xl font-black leading-tight mb-3">{content.title}</h2>
          <p className="text-white/65 text-sm leading-relaxed">{content.subtitle}</p>
        </div>
        <div className="space-y-3">
          {content.features.map(({ icon: FIcon, text }, i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: "rgba(255,255,255,0.12)" }}>
                <FIcon className="w-3.5 h-3.5 text-white/80" />
              </div>
              <span className="text-white/80 text-sm">{text}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="relative z-10 rounded-2xl p-5"
        style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.15)", backdropFilter: "blur(8px)" }}>
        <div className="flex gap-0.5 mb-3">{[...Array(5)].map((_, i) => <Star key={i} className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />)}</div>
        <p className="text-white/80 text-sm italic leading-relaxed mb-4">"{content.testimonial.text}"</p>
        <div className="flex items-center gap-3">
          <div className={`w-9 h-9 rounded-full bg-gradient-to-br ${content.testimonial.color} flex items-center justify-center text-white text-xs font-black flex-shrink-0`}>
            {content.testimonial.initials}
          </div>
          <div>
            <p className="text-white text-sm font-bold">{content.testimonial.author}</p>
            <p className="text-white/50 text-xs">{content.testimonial.role}</p>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Écran succès étudiant (design existant) ──────────────────
function SuccessScreen({ email, emailSent, role, onResend, resending, resendOk }) {
  const navigate = useNavigate()
  const [left, setLeft] = useState(10)
  useEffect(() => {
    const t = setInterval(() => setLeft(p => {
      if (p <= 1) { clearInterval(t); navigate("/login", { state: { message: "✅ Compte créé ! Vérifiez votre email puis connectez-vous.", email } }); return 0 }
      return p - 1
    }), 1000)
    return () => clearInterval(t)
  }, [navigate, email])

  return (
    <div className="flex-1 flex items-center justify-center p-8">
      <div className="w-full max-w-sm text-center space-y-5">
        <div className="relative mx-auto w-20 h-20">
          <div className="w-20 h-20 rounded-full flex items-center justify-center"
            style={{ background: "linear-gradient(135deg,#ecfdf5,#d1fae5)", border: "3px solid #10b981" }}>
            <Mail className="w-10 h-10 text-emerald-500" />
          </div>
          <div className="absolute -top-1 -right-1 w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center shadow">
            <CheckCircle className="w-3.5 h-3.5 text-white" />
          </div>
        </div>
        <div>
          <h2 className="text-2xl font-black text-gray-900">Compte créé ! 🎉</h2>
          <p className="text-gray-500 text-sm mt-2 leading-relaxed">
            {emailSent
              ? <>Email d'activation envoyé à <strong className="text-indigo-700 break-all">{email}</strong></>
              : <>Compte créé pour <strong className="text-indigo-700">{email}</strong></>}
          </p>
        </div>
        {emailSent ? (
          <div className="rounded-xl p-4 text-left space-y-2.5" style={{ background: "#f0f9ff", border: "1px solid #bae6fd" }}>
            <p className="text-xs font-bold text-blue-700">📬 Pour activer votre compte :</p>
            {["Ouvrez votre boîte email (et vos spams)", "Cliquez sur « Activer mon compte »", "Votre compte est activé instantanément"].map((s, i) => (
              <div key={i} className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full flex items-center justify-center text-white text-[9px] font-black flex-shrink-0" style={{ background: "#0ea5e9" }}>{i + 1}</div>
                <p className="text-blue-700 text-xs">{s}</p>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-xl p-3 text-left flex items-start gap-2" style={{ background: "#fffbeb", border: "1px solid #fde68a" }}>
            <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
            <p className="text-amber-700 text-xs leading-relaxed">L'envoi automatique a échoué. Cliquez sur <strong>Renvoyer</strong>.</p>
          </div>
        )}
        {resendOk
          ? <p className="text-emerald-600 text-xs font-medium flex items-center justify-center gap-1"><CheckCircle className="w-3.5 h-3.5" /> Email renvoyé ! Vérifiez vos spams.</p>
          : <button onClick={onResend} disabled={resending}
              className="w-full py-2.5 rounded-xl text-sm font-bold border-2 transition hover:bg-gray-50 disabled:opacity-50 flex items-center justify-center gap-2"
              style={{ borderColor: C.light, color: C.light }}>
              {resending ? <><Loader className="w-3.5 h-3.5 animate-spin" />Envoi...</> : <><RefreshCw className="w-3.5 h-3.5" />Renvoyer l'email</>}
            </button>
        }
        <Link to="/login" state={{ message: "✅ Vérifiez votre email pour activer votre compte.", email }}
          className="flex items-center justify-center gap-2 w-full py-3 rounded-xl text-sm font-black text-white hover:opacity-90 transition"
          style={{ background: `linear-gradient(135deg,${C.primary},${C.light})` }}>
          <ArrowRight className="w-4 h-4" /> Se connecter maintenant
        </Link>
        <div className="flex items-center justify-center gap-1 text-gray-400 text-xs">
          <Clock className="w-3 h-3" />
          Redirection dans <span className="font-black text-indigo-600 tabular-nums mx-1">{left}s</span>
        </div>
      </div>
    </div>
  )
}

// ── Succès candidature instructeur ───────────────────────────
function InstructorSuccessScreen({ email, firstName }) {
  const navigate = useNavigate()
  const [left, setLeft] = useState(12)
  useEffect(() => {
    const t = setInterval(() => setLeft(p => {
      if (p <= 1) { clearInterval(t); navigate("/login", { state: { message: "✅ Candidature envoyée ! Activez votre compte via l'email reçu.", email } }); return 0 }
      return p - 1
    }), 1000)
    return () => clearInterval(t)
  }, [navigate, email])

  return (
    <div className="flex-1 flex items-center justify-center p-8">
      <div className="w-full max-w-sm text-center space-y-5">
        <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto"
          style={{ background: "linear-gradient(135deg,#d1fae5,#a7f3d0)", border: "3px solid #10b981" }}>
          <Send className="w-10 h-10 text-emerald-500" />
        </div>
        <div>
          <h2 className="text-2xl font-black text-gray-900">Candidature envoyée ! 🎉</h2>
          <p className="text-gray-500 text-sm mt-2 leading-relaxed">
            Bonjour <strong>{firstName}</strong>, votre dossier a été transmis à notre équipe.
          </p>
        </div>
        <div className="rounded-xl p-4 text-left space-y-2.5" style={{ background: "#f0f9ff", border: "1px solid #bae6fd" }}>
          <p className="text-xs font-bold text-blue-700">📋 Prochaines étapes :</p>
          {[
            "Email de confirmation envoyé à " + email,
            "Activez votre compte via l'email d'activation",
            "Examen du dossier sous 3 à 5 jours ouvrés",
            "Décision par email avec motif détaillé",
          ].map((s, i) => (
            <div key={i} className="flex items-start gap-2">
              <div className="w-4 h-4 rounded-full flex items-center justify-center text-white text-[9px] font-black flex-shrink-0 mt-0.5" style={{ background: "#0ea5e9" }}>{i + 1}</div>
              <p className="text-blue-700 text-xs">{s}</p>
            </div>
          ))}
        </div>
        <div className="rounded-xl p-3 flex items-start gap-2" style={{ background: "#fffbeb", border: "1px solid #fde68a" }}>
          <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
          <p className="text-amber-700 text-xs leading-relaxed">
            Vérifiez vos <strong>spams</strong>. Pensez à activer votre compte via l'email reçu avant de vous connecter.
          </p>
        </div>
        <Link to="/login" state={{ message: "✅ Candidature envoyée ! Activez votre compte via l'email reçu.", email }}
          className="flex items-center justify-center gap-2 w-full py-3 rounded-xl text-sm font-black text-white hover:opacity-90 transition"
          style={{ background: `linear-gradient(135deg,${C.primary},${C.light})` }}>
          <ArrowRight className="w-4 h-4" /> Aller à la connexion
        </Link>
        <div className="flex items-center justify-center gap-1 text-gray-400 text-xs">
          <Clock className="w-3 h-3" />
          Redirection dans <span className="font-black text-indigo-600 tabular-nums mx-1">{left}s</span>
        </div>
      </div>
    </div>
  )
}

// ── Formulaire candidature instructeur 3 étapes ──────────────
function InstructorApplicationForm({ baseData, tempToken, onSuccess }) {
  const [step, setStep] = useState(1)
  const [sending, setSending] = useState(false)
  const [errors, setErrors] = useState({})
  const [globalErr, setGlobalErr] = useState("")

  const [app, setApp] = useState({
    motivation: "", experience: "", years_experience: "",
    expertise_areas: [], linkedin_url: "", portfolio_url: "",
    certifications: "", video_url: "",
    sample_course_topic: "", proposed_course_description: "",
    weekly_hours: "", charter_accepted: false,
  })

  const setF = (k, v) => { setApp(p => ({ ...p, [k]: v })); setErrors(p => ({ ...p, [k]: "" })); setGlobalErr("") }

  const toggleExpertise = (item) => setApp(p => ({
    ...p,
    expertise_areas: p.expertise_areas.includes(item)
      ? p.expertise_areas.filter(x => x !== item)
      : [...p.expertise_areas, item]
  }))

  const validateStep = (s) => {
    const e = {}
    if (s === 1) {
      if (!app.motivation.trim() || app.motivation.trim().length < 50) e.motivation = "Minimum 50 caractères requis"
      if (!app.experience.trim() || app.experience.trim().length < 30) e.experience = "Minimum 30 caractères requis"
      if (!app.years_experience) e.years_experience = "Requis"
    }
    if (s === 2) {
      if (app.expertise_areas.length === 0) e.expertise_areas = "Sélectionnez au moins un domaine"
      if (!app.sample_course_topic.trim() || app.sample_course_topic.trim().length < 3) e.sample_course_topic = "Minimum 3 caractères"
      if (!app.weekly_hours) e.weekly_hours = "Requis"
    }
    if (s === 3) {
      if (!app.charter_accepted) e.charter_accepted = "Vous devez accepter la charte"
    }
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleNext = () => { if (validateStep(step)) setStep(s => s + 1) }

  const handleSubmit = async () => {
    if (!validateStep(3)) return
    setSending(true); setGlobalErr("")
    try {
      // Utiliser le token temporaire reçu à la création du compte
      // ou le token de session si déjà connecté
      const authToken = tempToken || localStorage.getItem("token")
      if (!authToken) {
        setGlobalErr("Session expirée. Veuillez vous reconnecter.")
        return
      }
      const res = await fetch("/api/instructor-applications", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${authToken}`,
        },
        credentials: "include",
        body: JSON.stringify({
          motivation:                  app.motivation.trim(),
          experience:                  app.experience.trim(),
          years_experience:            parseInt(app.years_experience),
          expertise_areas:             app.expertise_areas,
          linkedin_url:                app.linkedin_url.trim() || null,
          portfolio_url:               app.portfolio_url.trim() || null,
          certifications:              app.certifications.trim() || null,
          video_url:                   app.video_url.trim() || null,
          sample_course_topic:         app.sample_course_topic.trim(),
          proposed_course_description: app.proposed_course_description.trim() || null,
          weekly_hours:                parseInt(app.weekly_hours) || null,
          charter_accepted:            true,
        }),
      })
      const data = await res.json()
      if (data.success) {
        onSuccess()
      } else {
        // Afficher les erreurs spécifiques si le backend les retourne
        if (data.errors && Object.keys(data.errors).length > 0) {
          const mapped = {}
          if (data.errors.motivation)            mapped.motivation = data.errors.motivation
          if (data.errors.experience)            mapped.experience = data.errors.experience
          if (data.errors.years_experience)      mapped.years_experience = data.errors.years_experience
          if (data.errors.proposed_course_title) mapped.sample_course_topic = "Titre trop court (minimum 3 caractères)"
          if (data.errors.linkedin_url)          mapped.linkedin_url = data.errors.linkedin_url
          if (Object.keys(mapped).length > 0) {
            setErrors(mapped)
            // Retourner à l'étape qui contient l'erreur
            if (mapped.motivation || mapped.experience || mapped.years_experience) setStep(1)
            else if (mapped.sample_course_topic || mapped.linkedin_url) setStep(2)
            setGlobalErr("Corrigez les champs signalés ci-dessous.")
          } else {
            setGlobalErr(data.message || "Une erreur est survenue.")
          }
        } else {
          setGlobalErr(data.message || "Une erreur est survenue. Réessayez.")
        }
      }
    } catch {
      setGlobalErr("Erreur de connexion au serveur. Vérifiez votre connexion.")
    } finally {
      setSending(false)
    }
  }

  const inpCls = (k) => `w-full px-4 py-2.5 rounded-xl border-2 focus:outline-none transition text-sm text-gray-900 placeholder-gray-400 ${errors[k] ? "border-red-300 focus:border-red-400 bg-red-50" : "border-gray-200 focus:border-indigo-400 bg-white"}`
  const taCls = (k) => `w-full px-4 py-2.5 rounded-xl border-2 focus:outline-none transition text-sm text-gray-900 placeholder-gray-400 resize-none ${errors[k] ? "border-red-300 bg-red-50" : "border-gray-200 focus:border-indigo-400 bg-white"}`
  const errMsg = (k) => errors[k] && <p className="mt-0.5 text-[10px] text-red-500 flex items-center gap-1"><AlertCircle className="w-2.5 h-2.5" />{errors[k]}</p>

  const stepLabels = ["Parcours", "Expertise", "Confirmation"]

  return (
    <div className="flex-1 flex flex-col px-8 py-6 lg:px-12 overflow-y-auto">
      <div className="max-w-md w-full mx-auto">

        {/* Header */}
        <div className="mb-5">
          <div className="flex items-center gap-2 mb-1">
            <BookOpen className="w-5 h-5" style={{ color: C.primary }} />
            <h1 className="text-xl font-black text-gray-900">Dossier instructeur</h1>
          </div>
          <p className="text-gray-500 text-xs">
            Bonjour <strong>{baseData.first_name}</strong> — complétez votre candidature ({step}/3)
          </p>
        </div>

        {/* Stepper */}
        <div className="flex items-center mb-6">
          {stepLabels.map((label, i) => (
            <div key={i} className="flex items-center flex-1 last:flex-none">
              <div className="flex items-center gap-1.5">
                <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-black transition-all flex-shrink-0"
                  style={{
                    background: i + 1 < step ? "#10b981" : i + 1 === step ? `linear-gradient(135deg,${C.primary},${C.light})` : "#f3f4f6",
                    color: i + 1 <= step ? "#fff" : "#9ca3af",
                    boxShadow: i + 1 === step ? "0 0 0 3px rgba(86,83,225,0.2)" : "none"
                  }}>
                  {i + 1 < step ? "✓" : i + 1}
                </div>
                <span className="text-[10px] font-bold hidden sm:block"
                  style={{ color: i + 1 === step ? C.primary : i + 1 < step ? "#10b981" : "#9ca3af" }}>
                  {label}
                </span>
              </div>
              {i < stepLabels.length - 1 && (
                <div className="flex-1 h-0.5 mx-2" style={{ background: i + 1 < step ? "#10b981" : "#e5e7eb" }} />
              )}
            </div>
          ))}
        </div>

        {globalErr && (
          <div className="mb-4 flex items-center gap-2 rounded-xl px-3 py-2.5" style={{ background: "#fef2f2", border: "1px solid #fecaca" }}>
            <AlertCircle className="w-3.5 h-3.5 text-red-500 flex-shrink-0" />
            <p className="text-red-600 text-xs">{globalErr}</p>
          </div>
        )}

        {/* ══ ÉTAPE 1 : Parcours ══ */}
        {step === 1 && (
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Motivation <span className="text-red-500">*</span>
                <span className="text-gray-400 font-normal ml-1">({app.motivation.length} car. / 50 min)</span>
              </label>
              <textarea rows={3} value={app.motivation} onChange={e => setF("motivation", e.target.value)}
                placeholder="Pourquoi voulez-vous enseigner sur DevOpsAkademy ? Quelle valeur unique apportez-vous aux apprenants ?"
                className={taCls("motivation")} />
              {errMsg("motivation")}
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Parcours professionnel <span className="text-red-500">*</span>
                <span className="text-gray-400 font-normal ml-1">({app.experience.length} car. / 30 min)</span>
              </label>
              <textarea rows={3} value={app.experience} onChange={e => setF("experience", e.target.value)}
                placeholder="Entreprises, postes occupés, projets DevOps en production, certifications..."
                className={taCls("experience")} />
              {errMsg("experience")}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Années d'expérience <span className="text-red-500">*</span></label>
                <select value={app.years_experience} onChange={e => setF("years_experience", e.target.value)} className={inpCls("years_experience")}>
                  <option value="">Sélectionner...</option>
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(n => <option key={n} value={n}>{n} an{n > 1 ? "s" : ""}</option>)}
                  <option value="10">10 ans ou +</option>
                </select>
                {errMsg("years_experience")}
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">LinkedIn</label>
                <div className="flex items-center rounded-xl border-2 border-gray-200 focus-within:border-indigo-400 transition bg-white">
                  <div className="pl-3"><Linkedin className="w-3.5 h-3.5 text-gray-400" /></div>
                  <input type="url" value={app.linkedin_url} onChange={e => setF("linkedin_url", e.target.value)}
                    placeholder="linkedin.com/in/..." className="flex-1 px-2.5 py-2.5 bg-transparent focus:outline-none text-sm placeholder-gray-400" />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">GitHub / Portfolio</label>
              <div className="flex items-center rounded-xl border-2 border-gray-200 focus-within:border-indigo-400 transition bg-white">
                <div className="pl-3"><Globe className="w-3.5 h-3.5 text-gray-400" /></div>
                <input type="url" value={app.portfolio_url} onChange={e => setF("portfolio_url", e.target.value)}
                  placeholder="github.com/votre-profil ou votre site" className="flex-1 px-2.5 py-2.5 bg-transparent focus:outline-none text-sm placeholder-gray-400" />
              </div>
            </div>
          </div>
        )}

        {/* ══ ÉTAPE 2 : Expertise & Cours ══ */}
        {step === 2 && (
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Domaines d'expertise <span className="text-red-500">*</span>
                {app.expertise_areas.length > 0 && (
                  <span className="ml-2 font-bold" style={{ color: C.light }}>{app.expertise_areas.length} sélectionné{app.expertise_areas.length > 1 ? "s" : ""}</span>
                )}
              </label>
              <div className="flex flex-wrap gap-1.5 p-3 rounded-xl border-2 max-h-36 overflow-y-auto"
                style={{ borderColor: errors.expertise_areas ? "#fca5a5" : "#e5e7eb" }}>
                {EXPERTISE_OPTIONS.map(opt => (
                  <button key={opt} type="button" onClick={() => toggleExpertise(opt)}
                    className="px-2.5 py-1 rounded-full text-[10px] font-semibold border transition-all"
                    style={app.expertise_areas.includes(opt)
                      ? { background: `linear-gradient(135deg,${C.primary},${C.light})`, borderColor: C.primary, color: "#fff" }
                      : { background: "#fff", borderColor: "#e5e7eb", color: "#6b7280" }}>
                    {opt}
                  </button>
                ))}
              </div>
              {errMsg("expertise_areas")}
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Certifications obtenues</label>
              <input type="text" value={app.certifications} onChange={e => setF("certifications", e.target.value)}
                placeholder="Ex : AWS SAA, CKA, Terraform Associate, Azure AZ-400..." className={inpCls("certifications")} />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Titre du cours proposé <span className="text-red-500">*</span></label>
              <input type="text" value={app.sample_course_topic} onChange={e => setF("sample_course_topic", e.target.value)}
                placeholder="Ex : Kubernetes de zéro à la production" className={inpCls("sample_course_topic")} />
              {errMsg("sample_course_topic")}
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Description du cours</label>
              <textarea rows={2} value={app.proposed_course_description} onChange={e => setF("proposed_course_description", e.target.value)}
                placeholder="Public cible, objectifs pédagogiques, contenu prévu, niveau requis..."
                className={taCls("proposed_course_description")} />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Vidéo de présentation</label>
                <div className="flex items-center rounded-xl border-2 border-gray-200 focus-within:border-indigo-400 transition bg-white">
                  <div className="pl-3"><Video className="w-3.5 h-3.5 text-gray-400" /></div>
                  <input type="url" value={app.video_url} onChange={e => setF("video_url", e.target.value)}
                    placeholder="Loom / YouTube..." className="flex-1 px-2 py-2.5 bg-transparent focus:outline-none text-sm placeholder-gray-400" />
                </div>
                <p className="text-[9px] text-gray-400 mt-0.5">3–5 min · fortement recommandée</p>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Heures/semaine dispo <span className="text-red-500">*</span></label>
                <select value={app.weekly_hours} onChange={e => setF("weekly_hours", e.target.value)} className={inpCls("weekly_hours")}>
                  <option value="">Sélectionner...</option>
                  {[2, 3, 5, 8, 10, 15, 20].map(n => <option key={n} value={n}>{n}h / semaine</option>)}
                </select>
                {errMsg("weekly_hours")}
              </div>
            </div>
          </div>
        )}

        {/* ══ ÉTAPE 3 : Récapitulatif + Charte ══ */}
        {step === 3 && (
          <div className="space-y-4">
            {/* Récap */}
            <div className="rounded-xl p-4 space-y-2" style={{ background: "#f8f7ff", border: "1px solid #e0e7ff" }}>
              <p className="text-xs font-black text-indigo-700 mb-2">📋 Votre dossier en résumé</p>
              {[
                ["Candidat", `${baseData.first_name} ${baseData.last_name}`],
                ["Email", baseData.email],
                ["Expérience", `${app.years_experience} an${parseInt(app.years_experience) > 1 ? "s" : ""}`],
                ["Domaines", app.expertise_areas.slice(0, 3).join(", ") + (app.expertise_areas.length > 3 ? ` +${app.expertise_areas.length - 3} autres` : "")],
                ["Cours proposé", app.sample_course_topic || "—"],
                ["Disponibilité", app.weekly_hours ? `${app.weekly_hours}h / semaine` : "—"],
              ].map(([label, value]) => (
                <div key={label} className="flex items-start gap-2">
                  <span className="text-[10px] font-bold text-gray-500 w-22 flex-shrink-0">{label} :</span>
                  <span className="text-[10px] text-gray-700">{value}</span>
                </div>
              ))}
            </div>

            {/* Info processus */}
            <div className="rounded-xl p-3 flex items-start gap-2" style={{ background: "#f0f9ff", border: "1px solid #bae6fd" }}>
              <Mail className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
              <p className="text-blue-700 text-xs leading-relaxed">
                Notre administrateur recevra votre dossier complet par email et vous contactera sous <strong>3 à 5 jours ouvrés</strong>.
              </p>
            </div>

            {/* Charte */}
            <div className="rounded-xl p-4" style={{ background: "#fafafa", border: "1px solid #e5e7eb" }}>
              <p className="text-[11px] font-black text-gray-700 mb-2">📜 Charte instructeur DevOpsAkademy</p>
              <div className="text-[10px] text-gray-500 space-y-1.5 max-h-24 overflow-y-auto leading-relaxed pr-1">
                <p>• Vos revenus proviennent des inscriptions de vos apprenants — DevOpsAkademy ne vous paie pas directement.</p>
                <p>• Un pourcentage configurable par l'administrateur est déduit de chaque vente de votre cours.</p>
                <p>• Si un instructeur secondaire est ajouté à votre cours, un % lui sera attribué (configurable par vous ou l'admin).</p>
                <p>• Vous êtes responsable de la qualité, de l'exactitude et de la mise à jour du contenu de vos cours.</p>
                <p>• DevOpsAkademy se réserve le droit de retirer tout cours ne respectant pas les standards de qualité.</p>
                <p>• Vous accordez à DevOpsAkademy une licence d'exploitation de votre contenu sur la plateforme.</p>
              </div>
            </div>

            {/* Checkbox charte */}
            <label className="flex items-start gap-3 cursor-pointer">
              <div
                onClick={() => setF("charter_accepted", !app.charter_accepted)}
                className="w-5 h-5 rounded-md flex items-center justify-center flex-shrink-0 mt-0.5 border-2 transition-all cursor-pointer"
                style={{ background: app.charter_accepted ? C.light : "#fff", borderColor: errors.charter_accepted ? "#fca5a5" : app.charter_accepted ? C.light : "#d1d5db" }}>
                {app.charter_accepted && <CheckCircle className="w-3.5 h-3.5 text-white" />}
              </div>
              <span className="text-xs text-gray-600 leading-relaxed">
                J'ai lu et j'accepte la <strong>charte instructeur</strong> et le modèle de rémunération par commission sur les ventes de mes cours. <span className="text-red-500">*</span>
              </span>
            </label>
            {errMsg("charter_accepted")}
          </div>
        )}

        {/* Navigation */}
        <div className="flex gap-2 mt-5">
          {step > 1 && (
            <button onClick={() => setStep(s => s - 1)}
              className="flex items-center gap-1.5 px-4 py-3 rounded-xl border-2 font-bold text-sm transition hover:bg-gray-50"
              style={{ borderColor: "#e5e7eb", color: "#6b7280" }}>
              <ChevronLeft className="w-4 h-4" /> Retour
            </button>
          )}
          <button
            onClick={step < 3 ? handleNext : handleSubmit}
            disabled={sending}
            className="flex-1 py-3 rounded-xl text-sm font-black text-white transition hover:opacity-90 disabled:opacity-60 flex items-center justify-center gap-2"
            style={{ background: `linear-gradient(135deg,${C.primary},${C.light})` }}>
            {sending
              ? <><Loader className="w-4 h-4 animate-spin" />Envoi en cours...</>
              : step < 3
                ? <>Étape suivante <ChevronRight className="w-4 h-4" /></>
                : <><Send className="w-4 h-4" />Envoyer ma candidature</>}
          </button>
        </div>

        <p className="text-center text-xs text-gray-500 mt-4">
          Déjà un compte ?{" "}
          <Link to="/login" className="font-black hover:underline" style={{ color: C.light }}>Se connecter</Link>
        </p>
      </div>
    </div>
  )
}

// ══════════════════════════════════════════════════════════════
// COMPOSANT PRINCIPAL
// ══════════════════════════════════════════════════════════════
export default function Register() {
  const { user, register } = useAuth()
  const navigate = useNavigate()

  const [role,      setRole]      = useState("student")
  const [form,      setForm]      = useState({ first_name: "", last_name: "", email: "", password: "", confirm: "" })
  const [showPwd,   setShowPwd]   = useState(false)
  const [showConf,  setShowConf]  = useState(false)
  const [loading,   setLoading]   = useState(false)
  const [errors,    setErrors]    = useState({})
  const [globalErr, setGlobalErr] = useState("")
  const [emailSent, setEmailSent] = useState(true)
  const [resending, setResending] = useState(false)
  const [resendOk,  setResendOk]  = useState(false)
  const [tempToken, setTempToken] = useState(null) // token temporaire instructeur

  // phase : "form" | "success_student" | "instructor_form" | "success_instructor"
  const [phase, setPhase] = useState("form")

  useEffect(() => {
    if (!user) return
    const r = user.role
    navigate(r === "admin" || r === "superadmin" ? "/admin" : r === "instructor" ? "/instructor" : "/student", { replace: true })
  }, [user, navigate])

  const set = (k, v) => { setForm(p => ({ ...p, [k]: v })); setErrors(p => ({ ...p, [k]: "" })); setGlobalErr("") }
  const changeRole = (r) => { setRole(r); setErrors({}); setGlobalErr("") }

  const validate = () => {
    const e = {}
    if (!form.first_name.trim() || form.first_name.trim().length < 2) e.first_name = "Minimum 2 caractères"
    if (!form.last_name.trim() || form.last_name.trim().length < 2)   e.last_name  = "Minimum 2 caractères"
    if (!form.email || !form.email.includes("@"))                      e.email      = "Email invalide"
    if (!form.password || form.password.length < 8)                    e.password   = "Minimum 8 caractères"
    if (!form.confirm)                                                  e.confirm    = "Confirmez votre mot de passe"
    else if (form.password !== form.confirm)                           e.confirm    = "Les mots de passe ne correspondent pas"
    setErrors(e); return Object.keys(e).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault(); if (!validate()) return
    setLoading(true); setGlobalErr("")
    try {
      const { confirm, ...payload } = form
      const res = await register({ ...payload, role })
      if (res?.success) {
        setEmailSent(res.email_sent !== false)
        // Sauvegarder le token temporaire pour la candidature instructeur
        if (res.instructor_temp_token) setTempToken(res.instructor_temp_token)
        // Instructeur → formulaire candidature / Étudiant → succès
        setPhase(role === "instructor" ? "instructor_form" : "success_student")
      } else {
        const msg = res?.message || "Une erreur est survenue"
        if (msg.toLowerCase().includes("exist") || msg.toLowerCase().includes("déjà"))
          setErrors(p => ({ ...p, email: "Cet email est déjà utilisé. Connectez-vous ?" }))
        else if (msg.toLowerCase().includes("email")) setErrors(p => ({ ...p, email: msg }))
        else setGlobalErr(msg)
      }
    } catch (err) { setGlobalErr(err?.message || "Erreur de connexion au serveur") }
    finally { setLoading(false) }
  }

  const handleResend = async () => {
    setResending(true); setResendOk(false)
    try {
      await fetch("/api/auth/resend-verification", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email: form.email }) })
      setResendOk(true)
    } catch { } finally { setResending(false) }
  }

  const inp = "flex-1 px-3.5 py-3 bg-transparent focus:outline-none text-gray-900 text-sm placeholder-gray-400"
  const fw = (k) => `flex items-center rounded-xl border-2 transition bg-white ${errors[k] ? "border-red-300" : "border-gray-200 focus-within:border-indigo-400"}`

  return (
    <div className="min-h-screen flex" style={{ background: `linear-gradient(135deg,#1e1b4b,#2d287f,#4c1d95)` }}>
      <div className="m-auto w-full max-w-5xl min-h-screen lg:min-h-0 lg:my-8 lg:rounded-3xl lg:shadow-2xl overflow-hidden flex flex-col lg:flex-row bg-white">

        {/* COLONNE GAUCHE */}
        <div className="lg:w-[42%] lg:flex-shrink-0">
          <LeftPanel role={role} />
        </div>

        {/* COLONNE DROITE */}
        <div className="flex-1 flex flex-col">

          {/* Succès étudiant */}
          {phase === "success_student" && (
            <SuccessScreen email={form.email} emailSent={emailSent} role={role}
              onResend={handleResend} resending={resending} resendOk={resendOk} />
          )}

          {/* Formulaire candidature instructeur */}
          {phase === "instructor_form" && (
            <InstructorApplicationForm
              baseData={{ first_name: form.first_name, last_name: form.last_name, email: form.email }}
              tempToken={tempToken}
              onSuccess={() => setPhase("success_instructor")}
            />
          )}

          {/* Succès candidature instructeur */}
          {phase === "success_instructor" && (
            <InstructorSuccessScreen email={form.email} firstName={form.first_name} />
          )}

          {/* Formulaire principal */}
          {phase === "form" && (
            <div className="flex-1 flex flex-col justify-center px-8 py-10 lg:px-12">

              {/* Logo mobile */}
              <div className="flex items-center gap-2.5 mb-8 lg:hidden justify-center">
                <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: C.accent }}>
                  <span className="text-indigo-900 font-black text-xs">DA</span>
                </div>
                <span className="font-black" style={{ color: C.primary }}>DevOps Akademy</span>
              </div>

              <div className="max-w-md w-full mx-auto">
                <div className="mb-6">
                  <h1 className="text-2xl font-black text-gray-900">Créer un compte</h1>
                  <p className="text-gray-500 text-sm mt-1">Rejoignez la communauté DevOps francophone</p>
                </div>

                {/* ONGLETS */}
                <div className="grid grid-cols-2 gap-2 mb-6 p-1 rounded-2xl bg-gray-100">
                  {[
                    { value: "student",    icon: GraduationCap, label: "Apprenant",  sub: "Je veux apprendre" },
                    { value: "instructor", icon: BookOpen,       label: "Formateur",  sub: "Je veux enseigner" },
                  ].map(({ value, icon: Icon, label, sub }) => (
                    <button key={value} type="button" onClick={() => changeRole(value)}
                      className="flex flex-col items-center gap-1 py-3 px-2 rounded-xl transition-all text-center"
                      style={role === value
                        ? { background: `linear-gradient(135deg,${C.primary},${C.light})`, color: "#fff", boxShadow: "0 4px 12px rgba(45,40,127,0.3)" }
                        : { background: "transparent", color: "#6b7280" }}>
                      <Icon className="w-5 h-5" />
                      <span className="font-black text-sm">{label}</span>
                      <span className={`text-[10px] ${role === value ? "text-white/75" : "text-gray-400"}`}>{sub}</span>
                    </button>
                  ))}
                </div>

                {/* Info instructeur */}
                {role === "instructor" && (
                  <div className="mb-5 flex items-start gap-2.5 rounded-xl px-4 py-3" style={{ background: "#fffbeb", border: "1px solid #fde68a" }}>
                    <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-amber-800 font-bold text-xs">Processus en 2 temps</p>
                      <p className="text-amber-700 text-xs mt-0.5 leading-relaxed">
                        Créez votre compte → complétez votre dossier de candidature → notre équipe examine sous 3–5 jours.
                      </p>
                    </div>
                  </div>
                )}

                {globalErr && (
                  <div className="mb-4 flex items-start gap-2 rounded-xl px-3 py-2.5" style={{ background: "#fef2f2", border: "1px solid #fecaca" }}>
                    <AlertCircle className="w-3.5 h-3.5 text-red-500 flex-shrink-0 mt-0.5" />
                    <p className="text-red-600 text-xs">{globalErr}</p>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-3" noValidate>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <div className={fw("first_name")}>
                        <div className="pl-3"><User className="w-3.5 h-3.5 text-gray-400" /></div>
                        <input value={form.first_name} onChange={e => set("first_name", e.target.value)} className={inp} placeholder="Prénom" autoComplete="given-name" autoFocus />
                      </div>
                      {errors.first_name && <p className="mt-0.5 text-[10px] text-red-500 flex items-center gap-1"><AlertCircle className="w-2.5 h-2.5" />{errors.first_name}</p>}
                    </div>
                    <div>
                      <div className={fw("last_name")}>
                        <input value={form.last_name} onChange={e => set("last_name", e.target.value)} className={inp} placeholder="Nom" autoComplete="family-name" />
                      </div>
                      {errors.last_name && <p className="mt-0.5 text-[10px] text-red-500 flex items-center gap-1"><AlertCircle className="w-2.5 h-2.5" />{errors.last_name}</p>}
                    </div>
                  </div>

                  <div>
                    <div className={fw("email")}>
                      <div className="pl-3"><Mail className="w-3.5 h-3.5 text-gray-400" /></div>
                      <input type="email" value={form.email} onChange={e => set("email", e.target.value)} className={inp} placeholder="vous@exemple.com" autoComplete="email" />
                    </div>
                    {errors.email && <p className="mt-0.5 text-[10px] text-red-500 flex items-center gap-1"><AlertCircle className="w-2.5 h-2.5" />{errors.email}</p>}
                  </div>

                  <div>
                    <div className={fw("password")}>
                      <div className="pl-3"><Lock className="w-3.5 h-3.5 text-gray-400" /></div>
                      <input type={showPwd ? "text" : "password"} value={form.password} onChange={e => set("password", e.target.value)} className={inp} placeholder="Minimum 8 caractères" autoComplete="new-password" />
                      <button type="button" onClick={() => setShowPwd(s => !s)} className="pr-3 text-gray-400 hover:text-gray-600 transition">
                        {showPwd ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                    {errors.password ? <p className="mt-0.5 text-[10px] text-red-500 flex items-center gap-1"><AlertCircle className="w-2.5 h-2.5" />{errors.password}</p> : <PwdStrength pwd={form.password} />}
                  </div>

                  <div>
                    <div className={fw("confirm")}>
                      <div className="pl-3">
                        {form.confirm && form.confirm === form.password ? <CheckCircle className="w-3.5 h-3.5 text-emerald-500" /> : <ShieldCheck className="w-3.5 h-3.5 text-gray-400" />}
                      </div>
                      <input type={showConf ? "text" : "password"} value={form.confirm} onChange={e => set("confirm", e.target.value)} className={inp} placeholder="Confirmer le mot de passe" autoComplete="new-password" />
                      <button type="button" onClick={() => setShowConf(s => !s)} className="pr-3 text-gray-400 hover:text-gray-600 transition">
                        {showConf ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                    {errors.confirm && <p className="mt-0.5 text-[10px] text-red-500 flex items-center gap-1"><AlertCircle className="w-2.5 h-2.5" />{errors.confirm}</p>}
                    {form.confirm && form.confirm === form.password && !errors.confirm && (
                      <p className="mt-0.5 text-[10px] text-emerald-600 flex items-center gap-1"><CheckCircle className="w-2.5 h-2.5" />Mots de passe identiques</p>
                    )}
                  </div>

                  <button type="submit" disabled={loading}
                    className="w-full py-3.5 rounded-xl text-sm font-black text-white transition hover:opacity-90 disabled:opacity-60 flex items-center justify-center gap-2 mt-1"
                    style={{ background: `linear-gradient(135deg,${C.primary},${C.light})` }}>
                    {loading
                      ? <><div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />Création...</>
                      : role === "instructor"
                        ? <>Créer mon compte <ChevronRight className="w-4 h-4" /></>
                        : <>Créer mon compte <ArrowRight className="w-4 h-4" /></>}
                  </button>

                  <p className="text-center text-[11px] text-gray-400 flex items-center justify-center gap-1">
                    <ShieldCheck className="w-3 h-3 text-indigo-400" />
                    {role === "instructor" ? "Compte créé → dossier candidature à l'étape suivante" : "Un email d'activation sera envoyé à votre adresse"}
                  </p>
                </form>

                <p className="text-center text-sm text-gray-500 mt-5">
                  Déjà un compte ?{" "}
                  <Link to="/login" className="font-black hover:underline" style={{ color: C.light }}>Se connecter</Link>
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}