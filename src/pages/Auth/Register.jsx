// src/pages/Auth/Register.jsx — DevOpsAkademy v4.0
// Design existant conservé à l'identique
// Étudiant : flux inchangé
// Instructeur : après création compte → formulaire candidature 3 étapes
// Admin reçoit email récapitulatif complet

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
import { useTranslation } from "react-i18next"

const C = { primary: "#2d287f", light: "#5653e1", accent: "#facc15", dark: "#1f1b5a" }

const EXPERTISE_OPTIONS = [
  "Docker & Conteneurisation", "Kubernetes", "CI/CD (GitHub Actions, GitLab CI, Jenkins)",
  "Terraform & IaC", "AWS", "Azure", "Google Cloud Platform",
  "Monitoring (Prometheus, Grafana)", "Linux & Administration système",
  "Sécurité DevSecOps", "Python / Scripting Shell", "Réseaux & Protocoles",
  "GitOps & ArgoCD", "Microservices & Cloud Native",
]

const ROLE_ICONS = {
  student: { icon: GraduationCap, features: [Terminal, Award, BarChart2, Users, Trophy, Zap] },
  instructor: { icon: BookOpen, features: [Users, BarChart2, Award, Terminal, Trophy, Zap] },
}

// ── Barre de force mot de passe ───────────────────────────────
function PwdStrength({ pwd }) {
  const { t } = useTranslation("register")
  if (!pwd) return null
  const checks = { length: pwd.length >= 8, upper: /[A-Z]/.test(pwd), number: /[0-9]/.test(pwd), special: /[^a-zA-Z0-9]/.test(pwd) }
  const score = Object.values(checks).filter(Boolean).length
  const levels = [
    { label: t("strength.veryWeak"), color: "#ef4444", w: "20%" },
    { label: t("strength.weak"),     color: "#f97316", w: "45%" },
    { label: t("strength.medium"),      color: "#eab308", w: "70%" },
    { label: t("strength.strong"),       color: "#22c55e", w: "100%" },
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
          {[["length", "8+"], ["upper", "A-Z"], ["number", "0-9"], ["special", "#@"]].map(([k, l]) => (
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
  const { t } = useTranslation("register")
  const content = ROLE_ICONS[role]
  const Icon = content.icon
  const features = t(`panel.${role}.features`, { returnObjects: true })
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
          <h2 className="text-3xl font-black leading-tight mb-3">{t(`panel.${role}.title`)}</h2>
          <p className="text-white/65 text-sm leading-relaxed">{t(`panel.${role}.subtitle`)}</p>
        </div>
        <div className="space-y-3">
          {content.features.map((FIcon, i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: "rgba(255,255,255,0.12)" }}>
                <FIcon className="w-3.5 h-3.5 text-white/80" />
              </div>
              <span className="text-white/80 text-sm">{features[i]}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="relative z-10 rounded-2xl p-5 flex items-start gap-3"
        style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.15)", backdropFilter: "blur(8px)" }}>
        <ShieldCheck className="w-5 h-5 text-white/80 flex-shrink-0 mt-0.5" />
        <p className="text-white/80 text-sm leading-relaxed">{t(`panel.${role}.note`)}</p>
      </div>
    </div>
  )
}

// ── Écran succès étudiant (design existant) ──────────────────
function SuccessScreen({ email, emailSent, role, onResend, resending, resendOk }) {
  const { t } = useTranslation("register")
  const navigate = useNavigate()
  const [left, setLeft] = useState(10)
  useEffect(() => {
    const timer = setInterval(() => setLeft(p => {
      if (p <= 1) { clearInterval(timer); navigate("/login", { state: { notice: "accountCreated", email } }); return 0 }
      return p - 1
    }), 1000)
    return () => clearInterval(timer)
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
          <h2 className="text-2xl font-black text-gray-900">{t("success.title")}</h2>
          <p className="text-gray-500 text-sm mt-2 leading-relaxed">
            {emailSent
              ? <>{t("success.sentTo")} <strong className="text-indigo-700 break-all">{email}</strong></>
              : <>{t("success.createdFor")} <strong className="text-indigo-700">{email}</strong></>}
          </p>
        </div>
        {emailSent ? (
          <div className="rounded-xl p-4 text-left space-y-2.5" style={{ background: "#f0f9ff", border: "1px solid #bae6fd" }}>
            <p className="text-xs font-bold text-blue-700">{t("success.toActivate")}</p>
            {t("success.steps", { returnObjects: true }).map((s, i) => (
              <div key={i} className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full flex items-center justify-center text-white text-[9px] font-black flex-shrink-0" style={{ background: "#0ea5e9" }}>{i + 1}</div>
                <p className="text-blue-700 text-xs">{s}</p>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-xl p-3 text-left flex items-start gap-2" style={{ background: "#fffbeb", border: "1px solid #fde68a" }}>
            <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
            <p className="text-amber-700 text-xs leading-relaxed">{t("success.sendFailed1")} <strong>{t("success.sendFailedBold")}</strong>.</p>
          </div>
        )}
        {resendOk
          ? <p className="text-emerald-600 text-xs font-medium flex items-center justify-center gap-1"><CheckCircle className="w-3.5 h-3.5" /> {t("success.resent")}</p>
          : <button onClick={onResend} disabled={resending}
              className="w-full py-2.5 rounded-xl text-sm font-bold border-2 transition hover:bg-gray-50 disabled:opacity-50 flex items-center justify-center gap-2"
              style={{ borderColor: C.light, color: C.light }}>
              {resending ? <><Loader className="w-3.5 h-3.5 animate-spin" />{t("success.sending")}</> : <><RefreshCw className="w-3.5 h-3.5" />{t("success.resend")}</>}
            </button>
        }
        <Link to="/login" state={{ notice: "verifyEmail", email }}
          className="flex items-center justify-center gap-2 w-full py-3 rounded-xl text-sm font-black text-white hover:opacity-90 transition"
          style={{ background: `linear-gradient(135deg,${C.primary},${C.light})` }}>
          <ArrowRight className="w-4 h-4" /> {t("success.loginNow")}
        </Link>
        <div className="flex items-center justify-center gap-1 text-gray-400 text-xs">
          <Clock className="w-3 h-3" />
          {t("success.redirectIn")} <span className="font-black text-indigo-600 tabular-nums mx-1">{left}s</span>
        </div>
      </div>
    </div>
  )
}

// ── Succès candidature instructeur ───────────────────────────
function InstructorSuccessScreen({ email, firstName }) {
  const { t } = useTranslation("register")
  const navigate = useNavigate()
  const [left, setLeft] = useState(12)
  useEffect(() => {
    const timer = setInterval(() => setLeft(p => {
      if (p <= 1) { clearInterval(timer); navigate("/login", { state: { notice: "applicationSent", email } }); return 0 }
      return p - 1
    }), 1000)
    return () => clearInterval(timer)
  }, [navigate, email])

  return (
    <div className="flex-1 flex items-center justify-center p-8">
      <div className="w-full max-w-sm text-center space-y-5">
        <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto"
          style={{ background: "linear-gradient(135deg,#d1fae5,#a7f3d0)", border: "3px solid #10b981" }}>
          <Send className="w-10 h-10 text-emerald-500" />
        </div>
        <div>
          <h2 className="text-2xl font-black text-gray-900">{t("instructorSuccess.title")}</h2>
          <p className="text-gray-500 text-sm mt-2 leading-relaxed">
            {t("instructorSuccess.hello")} <strong>{firstName}</strong>{t("instructorSuccess.transmitted")}
          </p>
        </div>
        <div className="rounded-xl p-4 text-left space-y-2.5" style={{ background: "#f0f9ff", border: "1px solid #bae6fd" }}>
          <p className="text-xs font-bold text-blue-700">{t("instructorSuccess.next")}</p>
          {[
            t("instructorSuccess.confirmSentTo", { email }),
            ...t("instructorSuccess.steps", { returnObjects: true }),
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
            {t("instructorSuccess.spamNote1")} <strong>{t("instructorSuccess.spamBold")}</strong>{t("instructorSuccess.spamNote2")}
          </p>
        </div>
        <Link to="/login" state={{ notice: "applicationSent", email }}
          className="flex items-center justify-center gap-2 w-full py-3 rounded-xl text-sm font-black text-white hover:opacity-90 transition"
          style={{ background: `linear-gradient(135deg,${C.primary},${C.light})` }}>
          <ArrowRight className="w-4 h-4" /> {t("instructorSuccess.goLogin")}
        </Link>
        <div className="flex items-center justify-center gap-1 text-gray-400 text-xs">
          <Clock className="w-3 h-3" />
          {t("instructorSuccess.redirectIn")} <span className="font-black text-indigo-600 tabular-nums mx-1">{left}s</span>
        </div>
      </div>
    </div>
  )
}

// ── Formulaire candidature instructeur 3 étapes ──────────────
function InstructorApplicationForm({ baseData, tempToken, onSuccess }) {
  const { t, i18n } = useTranslation("register")
  const lang = (i18n.resolvedLanguage || "fr").slice(0, 2)
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
      if (!app.motivation.trim() || app.motivation.trim().length < 50) e.motivation = t("app.errors.min50")
      if (!app.experience.trim() || app.experience.trim().length < 30) e.experience = t("app.errors.min30")
      if (!app.years_experience) e.years_experience = t("app.errors.required")
    }
    if (s === 2) {
      if (app.expertise_areas.length === 0) e.expertise_areas = t("app.errors.pickDomain")
      if (!app.sample_course_topic.trim() || app.sample_course_topic.trim().length < 3) e.sample_course_topic = t("app.errors.min3")
      if (!app.weekly_hours) e.weekly_hours = t("app.errors.required")
    }
    if (s === 3) {
      if (!app.charter_accepted) e.charter_accepted = t("app.errors.charter")
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
        setGlobalErr(t("app.sessionExpired"))
        return
      }
      const res = await fetch("/api/instructor-applications", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept-Language": lang,
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
          if (data.errors.proposed_course_title) mapped.sample_course_topic = t("app.titleTooShort")
          if (data.errors.linkedin_url)          mapped.linkedin_url = data.errors.linkedin_url
          if (Object.keys(mapped).length > 0) {
            setErrors(mapped)
            // Retourner à l'étape qui contient l'erreur
            if (mapped.motivation || mapped.experience || mapped.years_experience) setStep(1)
            else if (mapped.sample_course_topic || mapped.linkedin_url) setStep(2)
            setGlobalErr(t("app.fixFields"))
          } else {
            setGlobalErr(data.message || t("app.generic"))
          }
        } else {
          setGlobalErr(data.message || t("app.generic"))
        }
      }
    } catch {
      setGlobalErr(t("app.network"))
    } finally {
      setSending(false)
    }
  }

  const inpCls = (k) => `w-full px-4 py-2.5 rounded-xl border-2 focus:outline-none transition text-sm text-gray-900 placeholder-gray-400 ${errors[k] ? "border-red-300 focus:border-red-400 bg-red-50" : "border-gray-200 focus:border-indigo-400 bg-white"}`
  const taCls = (k) => `w-full px-4 py-2.5 rounded-xl border-2 focus:outline-none transition text-sm text-gray-900 placeholder-gray-400 resize-none ${errors[k] ? "border-red-300 bg-red-50" : "border-gray-200 focus:border-indigo-400 bg-white"}`
  const errMsg = (k) => errors[k] && <p className="mt-0.5 text-[10px] text-red-500 flex items-center gap-1"><AlertCircle className="w-2.5 h-2.5" />{errors[k]}</p>

  const stepLabels = t("app.stepLabels", { returnObjects: true })
  const expertiseLabels = t("expertise", { returnObjects: true })

  return (
    <div className="flex-1 flex flex-col px-8 py-6 lg:px-12 overflow-y-auto">
      <div className="max-w-md w-full mx-auto">

        {/* Header */}
        <div className="mb-5">
          <div className="flex items-center gap-2 mb-1">
            <BookOpen className="w-5 h-5" style={{ color: C.primary }} />
            <h1 className="text-xl font-black text-gray-900">{t("app.title")}</h1>
          </div>
          <p className="text-gray-500 text-xs">
            {t("app.hello")} <strong>{baseData.first_name}</strong>, {t("app.complete")} ({step}/3)
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
                {t("app.motivation")} <span className="text-red-500">*</span>
                <span className="text-gray-400 font-normal ml-1">{t("app.motivationCount", { count: app.motivation.length })}</span>
              </label>
              <textarea rows={3} value={app.motivation} onChange={e => setF("motivation", e.target.value)}
                placeholder={t("app.motivationPlaceholder")}
                className={taCls("motivation")} />
              {errMsg("motivation")}
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                {t("app.experience")} <span className="text-red-500">*</span>
                <span className="text-gray-400 font-normal ml-1">{t("app.experienceCount", { count: app.experience.length })}</span>
              </label>
              <textarea rows={3} value={app.experience} onChange={e => setF("experience", e.target.value)}
                placeholder={t("app.experiencePlaceholder")}
                className={taCls("experience")} />
              {errMsg("experience")}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">{t("app.years")} <span className="text-red-500">*</span></label>
                <select value={app.years_experience} onChange={e => setF("years_experience", e.target.value)} className={inpCls("years_experience")}>
                  <option value="">{t("app.select")}</option>
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(n => <option key={n} value={n}>{t("app.year", { count: n })}</option>)}
                  <option value="10">{t("app.tenPlus")}</option>
                </select>
                {errMsg("years_experience")}
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">{t("app.linkedin")}</label>
                <div className="flex items-center rounded-xl border-2 border-gray-200 focus-within:border-indigo-400 transition bg-white">
                  <div className="pl-3"><Linkedin className="w-3.5 h-3.5 text-gray-400" /></div>
                  <input type="url" value={app.linkedin_url} onChange={e => setF("linkedin_url", e.target.value)}
                    placeholder={t("app.linkedinPlaceholder")} className="flex-1 px-2.5 py-2.5 bg-transparent focus:outline-none text-sm placeholder-gray-400" />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">{t("app.portfolio")}</label>
              <div className="flex items-center rounded-xl border-2 border-gray-200 focus-within:border-indigo-400 transition bg-white">
                <div className="pl-3"><Globe className="w-3.5 h-3.5 text-gray-400" /></div>
                <input type="url" value={app.portfolio_url} onChange={e => setF("portfolio_url", e.target.value)}
                  placeholder={t("app.portfolioPlaceholder")} className="flex-1 px-2.5 py-2.5 bg-transparent focus:outline-none text-sm placeholder-gray-400" />
              </div>
            </div>
          </div>
        )}

        {/* ══ ÉTAPE 2 : Expertise & Cours ══ */}
        {step === 2 && (
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                {t("app.expertise")} <span className="text-red-500">*</span>
                {app.expertise_areas.length > 0 && (
                  <span className="ml-2 font-bold" style={{ color: C.light }}>{t("app.selected", { count: app.expertise_areas.length })}</span>
                )}
              </label>
              <div className="flex flex-wrap gap-1.5 p-3 rounded-xl border-2 max-h-36 overflow-y-auto"
                style={{ borderColor: errors.expertise_areas ? "#fca5a5" : "#e5e7eb" }}>
                {EXPERTISE_OPTIONS.map((opt, idx) => (
                  <button key={opt} type="button" onClick={() => toggleExpertise(opt)}
                    className="px-2.5 py-1 rounded-full text-[10px] font-semibold border transition-all"
                    style={app.expertise_areas.includes(opt)
                      ? { background: `linear-gradient(135deg,${C.primary},${C.light})`, borderColor: C.primary, color: "#fff" }
                      : { background: "#fff", borderColor: "#e5e7eb", color: "#6b7280" }}>
                    {expertiseLabels[idx] || opt}
                  </button>
                ))}
              </div>
              {errMsg("expertise_areas")}
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">{t("app.certifications")}</label>
              <input type="text" value={app.certifications} onChange={e => setF("certifications", e.target.value)}
                placeholder={t("app.certificationsPlaceholder")} className={inpCls("certifications")} />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">{t("app.courseTitle")} <span className="text-red-500">*</span></label>
              <input type="text" value={app.sample_course_topic} onChange={e => setF("sample_course_topic", e.target.value)}
                placeholder={t("app.courseTitlePlaceholder")} className={inpCls("sample_course_topic")} />
              {errMsg("sample_course_topic")}
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">{t("app.courseDescription")}</label>
              <textarea rows={2} value={app.proposed_course_description} onChange={e => setF("proposed_course_description", e.target.value)}
                placeholder={t("app.courseDescriptionPlaceholder")}
                className={taCls("proposed_course_description")} />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">{t("app.video")}</label>
                <div className="flex items-center rounded-xl border-2 border-gray-200 focus-within:border-indigo-400 transition bg-white">
                  <div className="pl-3"><Video className="w-3.5 h-3.5 text-gray-400" /></div>
                  <input type="url" value={app.video_url} onChange={e => setF("video_url", e.target.value)}
                    placeholder={t("app.videoPlaceholder")} className="flex-1 px-2 py-2.5 bg-transparent focus:outline-none text-sm placeholder-gray-400" />
                </div>
                <p className="text-[9px] text-gray-400 mt-0.5">{t("app.videoHint")}</p>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">{t("app.weeklyHours")} <span className="text-red-500">*</span></label>
                <select value={app.weekly_hours} onChange={e => setF("weekly_hours", e.target.value)} className={inpCls("weekly_hours")}>
                  <option value="">{t("app.select")}</option>
                  {[2, 3, 5, 8, 10, 15, 20].map(n => <option key={n} value={n}>{t("app.hoursPerWeek", { count: n })}</option>)}
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
              <p className="text-xs font-black text-indigo-700 mb-2">{t("app.summary")}</p>
              {[
                [t("app.candidate"), `${baseData.first_name} ${baseData.last_name}`],
                [t("app.email"), baseData.email],
                [t("app.experienceLabel"), t("app.year", { count: parseInt(app.years_experience) || 0 })],
                [t("app.domains"), app.expertise_areas.slice(0, 3).map(v => expertiseLabels[EXPERTISE_OPTIONS.indexOf(v)] || v).join(", ") + (app.expertise_areas.length > 3 ? ` ${t("app.moreDomains", { count: app.expertise_areas.length - 3 })}` : "")],
                [t("app.proposedCourse"), app.sample_course_topic || "—"],
                [t("app.availability"), app.weekly_hours ? t("app.hoursPerWeek", { count: app.weekly_hours }) : "—"],
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
                {t("app.processInfo1")} <strong>{t("app.processInfoBold")}</strong>.
              </p>
            </div>

            {/* Charte */}
            <div className="rounded-xl p-4" style={{ background: "#fafafa", border: "1px solid #e5e7eb" }}>
              <p className="text-[11px] font-black text-gray-700 mb-2">{t("app.charterTitle")}</p>
              <div className="text-[10px] text-gray-500 space-y-1.5 max-h-24 overflow-y-auto leading-relaxed pr-1">
                {t("app.charter", { returnObjects: true }).map((line, i) => <p key={i}>• {line}</p>)}
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
                {t("app.charterAccept1")} <strong>{t("app.charterAcceptBold")}</strong> {t("app.charterAccept2")} <span className="text-red-500">*</span>
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
              <ChevronLeft className="w-4 h-4" /> {t("app.back")}
            </button>
          )}
          <button
            onClick={step < 3 ? handleNext : handleSubmit}
            disabled={sending}
            className="flex-1 py-3 rounded-xl text-sm font-black text-white transition hover:opacity-90 disabled:opacity-60 flex items-center justify-center gap-2"
            style={{ background: `linear-gradient(135deg,${C.primary},${C.light})` }}>
            {sending
              ? <><Loader className="w-4 h-4 animate-spin" />{t("app.sending")}</>
              : step < 3
                ? <>{t("app.next")} <ChevronRight className="w-4 h-4" /></>
                : <><Send className="w-4 h-4" />{t("app.submit")}</>}
          </button>
        </div>

        <p className="text-center text-xs text-gray-500 mt-4">
          {t("app.haveAccount")}{" "}
          <Link to="/login" className="font-black hover:underline" style={{ color: C.light }}>{t("app.login")}</Link>
        </p>
      </div>
    </div>
  )
}

// ══════════════════════════════════════════════════════════════
// COMPOSANT PRINCIPAL
// ══════════════════════════════════════════════════════════════
export default function Register() {
  const { t, i18n } = useTranslation("register")
  const lang = (i18n.resolvedLanguage || "fr").slice(0, 2)
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

  useEffect(() => { document.title = t("meta") }, [t, i18n.language])

  const set = (k, v) => { setForm(p => ({ ...p, [k]: v })); setErrors(p => ({ ...p, [k]: "" })); setGlobalErr("") }
  const changeRole = (r) => { setRole(r); setErrors({}); setGlobalErr("") }

  const validate = () => {
    const e = {}
    if (!form.first_name.trim() || form.first_name.trim().length < 2) e.first_name = t("form.errors.min2")
    if (!form.last_name.trim() || form.last_name.trim().length < 2)   e.last_name  = t("form.errors.min2")
    if (!form.email || !form.email.includes("@"))                      e.email      = t("form.errors.email")
    if (!form.password || form.password.length < 8)                    e.password   = t("form.errors.min8")
    if (!form.confirm)                                                  e.confirm    = t("form.errors.confirm")
    else if (form.password !== form.confirm)                           e.confirm    = t("form.errors.mismatch")
    setErrors(e); return Object.keys(e).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault(); if (!validate()) return
    setLoading(true); setGlobalErr("")
    try {
      const { confirm, ...payload } = form
      const res = await register({ ...payload, role, language: lang })
      if (res?.success) {
        setEmailSent(res.email_sent !== false)
        // Sauvegarder le token temporaire pour la candidature instructeur
        if (res.instructor_temp_token) setTempToken(res.instructor_temp_token)
        // Instructeur → formulaire candidature / Étudiant → succès
        setPhase(role === "instructor" ? "instructor_form" : "success_student")
      } else {
        const msg = res?.message || t("form.errors.generic")
        if (msg.toLowerCase().includes("exist") || msg.toLowerCase().includes("déjà") || msg.toLowerCase().includes("already"))
          setErrors(p => ({ ...p, email: t("form.errors.exists") }))
        else if (msg.toLowerCase().includes("email")) setErrors(p => ({ ...p, email: msg }))
        else setGlobalErr(msg)
      }
    } catch (err) { setGlobalErr(err?.message || t("form.errors.network")) }
    finally { setLoading(false) }
  }

  const handleResend = async () => {
    setResending(true); setResendOk(false)
    try {
      await fetch("/api/auth/resend-verification", { method: "POST", headers: { "Content-Type": "application/json", "Accept-Language": lang }, body: JSON.stringify({ email: form.email, language: lang }) })
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
                  <h1 className="text-2xl font-black text-gray-900">{t("form.title")}</h1>
                  <p className="text-gray-500 text-sm mt-1">{t("form.subtitle")}</p>
                </div>

                {/* ONGLETS */}
                <div className="grid grid-cols-2 gap-2 mb-6 p-1 rounded-2xl bg-gray-100">
                  {[
                    { value: "student",    icon: GraduationCap, label: t("form.student"),  sub: t("form.studentSub") },
                    { value: "instructor", icon: BookOpen,       label: t("form.instructor"),  sub: t("form.instructorSub") },
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
                      <p className="text-amber-800 font-bold text-xs">{t("form.twoSteps")}</p>
                      <p className="text-amber-700 text-xs mt-0.5 leading-relaxed">
                        {t("form.twoStepsText")}
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
                        <input value={form.first_name} onChange={e => set("first_name", e.target.value)} className={inp} placeholder={t("form.firstName")} autoComplete="given-name" autoFocus />
                      </div>
                      {errors.first_name && <p className="mt-0.5 text-[10px] text-red-500 flex items-center gap-1"><AlertCircle className="w-2.5 h-2.5" />{errors.first_name}</p>}
                    </div>
                    <div>
                      <div className={fw("last_name")}>
                        <input value={form.last_name} onChange={e => set("last_name", e.target.value)} className={inp} placeholder={t("form.lastName")} autoComplete="family-name" />
                      </div>
                      {errors.last_name && <p className="mt-0.5 text-[10px] text-red-500 flex items-center gap-1"><AlertCircle className="w-2.5 h-2.5" />{errors.last_name}</p>}
                    </div>
                  </div>

                  <div>
                    <div className={fw("email")}>
                      <div className="pl-3"><Mail className="w-3.5 h-3.5 text-gray-400" /></div>
                      <input type="email" value={form.email} onChange={e => set("email", e.target.value)} className={inp} placeholder={t("form.emailPlaceholder")} autoComplete="email" />
                    </div>
                    {errors.email && <p className="mt-0.5 text-[10px] text-red-500 flex items-center gap-1"><AlertCircle className="w-2.5 h-2.5" />{errors.email}</p>}
                  </div>

                  <div>
                    <div className={fw("password")}>
                      <div className="pl-3"><Lock className="w-3.5 h-3.5 text-gray-400" /></div>
                      <input type={showPwd ? "text" : "password"} value={form.password} onChange={e => set("password", e.target.value)} className={inp} placeholder={t("form.passwordPlaceholder")} autoComplete="new-password" />
                      <button type="button" onClick={() => setShowPwd(s => !s)} aria-label={showPwd ? t("form.hidePassword") : t("form.showPassword")} className="pr-3 text-gray-400 hover:text-gray-600 transition">
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
                      <input type={showConf ? "text" : "password"} value={form.confirm} onChange={e => set("confirm", e.target.value)} className={inp} placeholder={t("form.confirmPlaceholder")} autoComplete="new-password" />
                      <button type="button" onClick={() => setShowConf(s => !s)} className="pr-3 text-gray-400 hover:text-gray-600 transition">
                        {showConf ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                    {errors.confirm && <p className="mt-0.5 text-[10px] text-red-500 flex items-center gap-1"><AlertCircle className="w-2.5 h-2.5" />{errors.confirm}</p>}
                    {form.confirm && form.confirm === form.password && !errors.confirm && (
                      <p className="mt-0.5 text-[10px] text-emerald-600 flex items-center gap-1"><CheckCircle className="w-2.5 h-2.5" />{t("form.match")}</p>
                    )}
                  </div>

                  <button type="submit" disabled={loading}
                    className="w-full py-3.5 rounded-xl text-sm font-black text-white transition hover:opacity-90 disabled:opacity-60 flex items-center justify-center gap-2 mt-1"
                    style={{ background: `linear-gradient(135deg,${C.primary},${C.light})` }}>
                    {loading
                      ? <><div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />{t("form.creating")}</>
                      : role === "instructor"
                        ? <>{t("form.create")} <ChevronRight className="w-4 h-4" /></>
                        : <>{t("form.create")} <ArrowRight className="w-4 h-4" /></>}
                  </button>

                  <p className="text-center text-[11px] text-gray-400 flex items-center justify-center gap-1">
                    <ShieldCheck className="w-3 h-3 text-indigo-400" />
                    {role === "instructor" ? t("form.hintInstructor") : t("form.hintStudent")}
                  </p>
                </form>

                <p className="text-center text-sm text-gray-500 mt-5">
                  {t("form.haveAccount")}{" "}
                  <Link to="/login" className="font-black hover:underline" style={{ color: C.light }}>{t("form.login")}</Link>
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}