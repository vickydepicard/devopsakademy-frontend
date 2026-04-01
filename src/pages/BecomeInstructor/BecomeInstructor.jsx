// src/pages/BecomeInstructor/BecomeInstructor.jsx — DevOpsAkademy
// VERSION COMPLÈTE CORRIGÉE v2.0
// ✅ Flux instructeur complet avec validation email admin
// ✅ Champ "experience" ajouté (manquait dans l'ancien form)
// ✅ Statut de candidature visible si déjà soumise
// ✅ Design professionnel et user-friendly
// ✅ Gestion des états : pending / under_review / accepted / rejected

import { useState, useEffect, useRef } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useAuth } from "../../contexts/AuthContext"
import api from "../../api/api"
import {
  BookOpen, Users, Award, DollarSign, ArrowRight, ArrowDown,
  CheckCircle, Star, Send, Zap, Globe, Clock, Mail,
  AlertCircle, Loader, ChevronRight, Shield, X,
  BarChart2, Terminal, Target, Lock, RefreshCw
} from "lucide-react"

// ─────────────────────────────────────────────────────────────
const C = {
  primary:   "#2d287f",
  light:     "#5653e1",
  accent:    "#facc15",
  dark:      "#1f1b5a",
  success:   "#059669",
  warning:   "#d97706",
  danger:    "#dc2626",
}

const BENEFITS = [
  { icon: Users, title: "Touchez des milliers d'apprenants", desc: "Votre expertise atteint des ingénieurs à travers toute l'Afrique francophone et bien au-delà.", color: "from-violet-500 to-purple-600" },
  { icon: DollarSign, title: "Revenus passifs durables", desc: "Publiez un cours une fois, soyez rémunéré à chaque inscription sur le long terme.", color: "from-emerald-500 to-teal-600" },
  { icon: Award, title: "Crédibilité renforcée", desc: "Être instructeur sur DevOpsAkademy est un signal fort de votre expertise dans la communauté.", color: "from-amber-400 to-orange-500" },
  { icon: Globe, title: "Réseau professionnel actif", desc: "Rejoignez une communauté d'experts DevOps et échangez avec d'autres instructeurs.", color: "from-sky-400 to-blue-600" },
]

const STEPS = [
  { n: "01", icon: Send,         title: "Candidature",  desc: "Remplissez le formulaire avec votre parcours, vos domaines d'expertise et votre projet de cours.", color: C.light },
  { n: "02", icon: Clock,        title: "Revue admin",  desc: "Notre équipe étudie votre dossier sous 3 à 5 jours ouvrés. Vous recevrez un email de confirmation.", color: C.warning },
  { n: "03", icon: Mail,         title: "Décision",     desc: "Accepté → accès immédiat à votre espace instructeur. Refusé → motif détaillé + possibilité de re-candidater.", color: C.success },
  { n: "04", icon: BookOpen,     title: "Création",     desc: "Créez vos modules, leçons et quiz. Notre guide de création vous accompagne étape par étape.", color: C.accent },
]

const EXPERTISE_OPTIONS = [
  "Docker & Conteneurisation",
  "Kubernetes",
  "CI/CD (GitHub Actions, GitLab CI, Jenkins)",
  "Infrastructure as Code (Terraform, Ansible)",
  "AWS",
  "Azure",
  "Google Cloud Platform",
  "Monitoring (Prometheus, Grafana, ELK)",
  "Linux & Administration système",
  "Sécurité DevSecOps",
  "Python / Scripting Shell",
  "Réseaux & Protocoles",
  "Microservices & Architecture Cloud-Native",
  "GitOps & ArgoCD",
]

// ── Badge de statut ───────────────────────────────────────────
function StatusBadge({ status }) {
  const map = {
    pending:      { label: "En attente d'examen", color: C.warning,  bg: "#fef3c7", icon: Clock },
    under_review: { label: "En cours d'examen",   color: "#0284c7",  bg: "#e0f2fe", icon: BarChart2 },
    accepted:     { label: "Candidature acceptée", color: C.success,  bg: "#d1fae5", icon: CheckCircle },
    rejected:     { label: "Non retenue",          color: C.danger,   bg: "#fee2e2", icon: X },
  }
  const s = map[status] || map.pending
  const Icon = s.icon
  return (
    <div
      className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold"
      style={{ background: s.bg, color: s.color }}
    >
      <Icon className="w-4 h-4" />
      {s.label}
    </div>
  )
}

// ── Bannière statut candidature existante ─────────────────────
function ExistingApplicationBanner({ app, onNewApplication }) {
  const isRejected = app.status === "rejected"
  return (
    <div
      className="rounded-2xl overflow-hidden border mb-8"
      style={{ borderColor: app.status === "accepted" ? "#a7f3d0" : app.status === "rejected" ? "#fecaca" : "#bae6fd" }}
    >
      <div
        className="px-6 py-4 flex items-center justify-between flex-wrap gap-3"
        style={{
          background: app.status === "accepted" ? "#ecfdf5"
            : app.status === "rejected" ? "#fef2f2"
            : app.status === "under_review" ? "#e0f2fe"
            : "#fffbeb"
        }}
      >
        <div>
          <p className="text-sm font-bold text-gray-900 mb-1">Votre candidature du {new Date(app.submitted_at).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}</p>
          <StatusBadge status={app.status} />
        </div>
        {app.status === "accepted" && (
          <Link
            to="/instructor"
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-white text-sm font-bold transition hover:opacity-90"
            style={{ background: `linear-gradient(135deg,${C.primary},${C.light})` }}
          >
            Accéder à mon espace <ArrowRight className="w-4 h-4" />
          </Link>
        )}
      </div>

      {/* Note de rejet */}
      {isRejected && app.review_note && (
        <div className="px-6 py-4 border-t" style={{ borderColor: "#fecaca", background: "#fff5f5" }}>
          <p className="text-sm font-bold text-red-700 mb-1">Motif communiqué :</p>
          <p className="text-sm text-red-600">{app.review_note}</p>
          <p className="text-xs text-gray-400 mt-2">
            Vous pouvez soumettre une nouvelle candidature avec un profil enrichi.
          </p>
          <button
            onClick={onNewApplication}
            className="mt-3 text-sm font-bold flex items-center gap-1.5 hover:underline"
            style={{ color: C.light }}
          >
            <RefreshCw className="w-3.5 h-3.5" /> Soumettre une nouvelle candidature
          </button>
        </div>
      )}

      {/* En attente */}
      {(app.status === "pending" || app.status === "under_review") && (
        <div className="px-6 py-3 border-t" style={{ borderColor: "#bae6fd", background: "#f8faff" }}>
          <p className="text-xs text-blue-600 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5" />
            Vous recevrez une réponse par email sous 3 à 5 jours ouvrés. Vérifiez vos spams.
          </p>
        </div>
      )}
    </div>
  )
}

// ── Formulaire de candidature ─────────────────────────────────
function ApplicationForm({ user, onSuccess }) {
  const [form, setForm] = useState({
    motivation:                   "",
    experience:                   "",
    expertise_areas:              [],
    years_experience:             "",
    linkedin_url:                 "",
    portfolio_url:                "",
    proposed_course_title:        "",
    proposed_course_description:  "",
  })
  const [errors,   setErrors]   = useState({})
  const [loading,  setLoading]  = useState(false)
  const [globalErr, setGlobalErr] = useState("")

  const set = (k, v) => {
    setForm(p => ({ ...p, [k]: v }))
    setErrors(p => ({ ...p, [k]: "" }))
    setGlobalErr("")
  }

  const toggleExpertise = (item) => {
    setForm(p => ({
      ...p,
      expertise_areas: p.expertise_areas.includes(item)
        ? p.expertise_areas.filter(x => x !== item)
        : [...p.expertise_areas, item],
    }))
    setErrors(p => ({ ...p, expertise_areas: "" }))
  }

  const validate = () => {
    const e = {}
    if (!form.motivation.trim() || form.motivation.trim().length < 50)
      e.motivation = "Minimum 50 caractères — expliquez votre motivation en détail"
    if (!form.experience.trim() || form.experience.trim().length < 30)
      e.experience = "Minimum 30 caractères — décrivez votre parcours professionnel"
    if (form.expertise_areas.length === 0)
      e.expertise_areas = "Sélectionnez au moins un domaine d'expertise"
    if (!form.years_experience)
      e.years_experience = "Indiquez vos années d'expérience"
    if (!form.proposed_course_title.trim() || form.proposed_course_title.trim().length < 5)
      e.proposed_course_title = "Donnez un titre à votre cours (min 5 caractères)"
    if (form.linkedin_url && !form.linkedin_url.includes("linkedin.com"))
      e.linkedin_url = "L'URL doit contenir linkedin.com"
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!user) return
    if (!validate()) return

    setLoading(true)
    setGlobalErr("")
    try {
      await api.post("/instructor-applications", {
        ...form,
        years_experience: parseInt(form.years_experience),
      })
      onSuccess()
    } catch (err) {
      const msg = err?.message || err?.response?.data?.message
      if (msg?.includes("déjà") || msg?.includes("existing")) {
        setGlobalErr("Vous avez déjà une candidature en cours. Rechargez la page.")
      } else {
        setGlobalErr(msg || "Une erreur est survenue. Veuillez réessayer.")
      }
    } finally {
      setLoading(false)
    }
  }

  const labelCls = "block text-sm font-bold text-gray-700 mb-1.5"
  const inputCls = (k) =>
    `w-full px-4 py-3 rounded-xl border-2 focus:outline-none transition text-sm ${
      errors[k]
        ? "border-red-300 focus:border-red-400"
        : "border-gray-200 focus:border-indigo-400"
    }`

  return (
    <form onSubmit={handleSubmit} className="space-y-6">

      {/* Erreur globale */}
      {globalErr && (
        <div className="flex items-start gap-2 rounded-xl px-4 py-3" style={{ background: "#fef2f2", border: "1px solid #fecaca" }}>
          <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
          <p className="text-red-600 text-sm">{globalErr}</p>
        </div>
      )}

      {/* Alerte non connecté */}
      {!user && (
        <div className="flex items-start gap-3 rounded-xl px-4 py-4" style={{ background: "#fffbeb", border: "1px solid #fde68a" }}>
          <Lock className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-amber-800 font-bold text-sm">Connexion requise</p>
            <p className="text-amber-700 text-sm mt-0.5">
              Vous devez être{" "}
              <Link to="/login" className="font-black underline">connecté</Link>
              {" "}pour soumettre votre candidature.
            </p>
          </div>
        </div>
      )}

      {/* ── Section 1 : Motivation ── */}
      <div>
        <div className="flex items-center gap-2 mb-4 pb-2 border-b border-gray-100">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center text-white text-xs font-black" style={{ background: C.light }}>1</div>
          <h3 className="font-bold text-gray-900">Votre motivation</h3>
        </div>

        <div className="space-y-4">
          <div>
            <label className={labelCls}>
              Pourquoi voulez-vous enseigner ? <span className="text-red-500">*</span>
              <span className="text-gray-400 font-normal ml-1 text-xs">({form.motivation.length}/50 min)</span>
            </label>
            <textarea
              value={form.motivation}
              onChange={e => set("motivation", e.target.value)}
              rows={4}
              placeholder="Décrivez ce qui vous motive à partager vos connaissances. Quelle valeur unique apportez-vous ? Quel impact voulez-vous avoir sur les apprenants ?"
              className={inputCls("motivation") + " resize-none"}
            />
            {errors.motivation && <p className="mt-1 text-xs text-red-500 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.motivation}</p>}
          </div>

          <div>
            <label className={labelCls}>
              Votre parcours et expérience professionnelle <span className="text-red-500">*</span>
              <span className="text-gray-400 font-normal ml-1 text-xs">({form.experience.length}/30 min)</span>
            </label>
            <textarea
              value={form.experience}
              onChange={e => set("experience", e.target.value)}
              rows={3}
              placeholder="Décrivez votre parcours : entreprises, projets, technologies utilisées en production, certifications obtenues..."
              className={inputCls("experience") + " resize-none"}
            />
            {errors.experience && <p className="mt-1 text-xs text-red-500 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.experience}</p>}
          </div>
        </div>
      </div>

      {/* ── Section 2 : Expertise ── */}
      <div>
        <div className="flex items-center gap-2 mb-4 pb-2 border-b border-gray-100">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center text-white text-xs font-black" style={{ background: C.light }}>2</div>
          <h3 className="font-bold text-gray-900">Vos domaines d'expertise</h3>
        </div>

        <div className="space-y-4">
          <div>
            <label className={labelCls}>
              Domaines maîtrisés <span className="text-red-500">*</span>
              {form.expertise_areas.length > 0 && (
                <span className="ml-2 text-indigo-600 text-xs font-bold">
                  {form.expertise_areas.length} sélectionné{form.expertise_areas.length > 1 ? "s" : ""}
                </span>
              )}
            </label>
            <div className="flex flex-wrap gap-2">
              {EXPERTISE_OPTIONS.map(opt => (
                <button
                  key={opt} type="button"
                  onClick={() => toggleExpertise(opt)}
                  className="px-3 py-1.5 rounded-full text-xs font-semibold border-2 transition-all"
                  style={
                    form.expertise_areas.includes(opt)
                      ? { background: `linear-gradient(135deg,${C.primary},${C.light})`, borderColor: C.primary, color: "#fff" }
                      : { background: "#fff", borderColor: "#e5e7eb", color: "#6b7280" }
                  }
                >
                  {form.expertise_areas.includes(opt) && "✓ "}
                  {opt}
                </button>
              ))}
            </div>
            {errors.expertise_areas && (
              <p className="mt-1.5 text-xs text-red-500 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />{errors.expertise_areas}
              </p>
            )}
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Années d'expérience <span className="text-red-500">*</span></label>
              <select
                value={form.years_experience}
                onChange={e => set("years_experience", e.target.value)}
                className={inputCls("years_experience")}
              >
                <option value="">Sélectionner...</option>
                {[1,2,3,4,5,6,7,8,9,10].map(n => (
                  <option key={n} value={n}>
                    {n < 10 ? `${n} an${n > 1 ? "s" : ""}` : "10 ans ou plus"}
                  </option>
                ))}
              </select>
              {errors.years_experience && <p className="mt-1 text-xs text-red-500 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.years_experience}</p>}
            </div>

            <div>
              <label className={labelCls}>Profil LinkedIn</label>
              <input
                type="url"
                value={form.linkedin_url}
                onChange={e => set("linkedin_url", e.target.value)}
                placeholder="https://linkedin.com/in/votre-profil"
                className={inputCls("linkedin_url")}
              />
              {errors.linkedin_url && <p className="mt-1 text-xs text-red-500 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.linkedin_url}</p>}
            </div>
          </div>

          <div>
            <label className={labelCls}>Portfolio / GitHub / Site personnel</label>
            <input
              type="url"
              value={form.portfolio_url}
              onChange={e => set("portfolio_url", e.target.value)}
              placeholder="https://github.com/votre-profil ou votre site"
              className={inputCls("portfolio_url")}
            />
          </div>
        </div>
      </div>

      {/* ── Section 3 : Cours proposé ── */}
      <div>
        <div className="flex items-center gap-2 mb-4 pb-2 border-b border-gray-100">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center text-white text-xs font-black" style={{ background: C.light }}>3</div>
          <h3 className="font-bold text-gray-900">Votre projet de cours</h3>
        </div>

        <div className="space-y-4">
          <div>
            <label className={labelCls}>
              Titre du cours que vous souhaitez créer <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={form.proposed_course_title}
              onChange={e => set("proposed_course_title", e.target.value)}
              placeholder="Ex: Kubernetes de zéro à la production"
              className={inputCls("proposed_course_title")}
            />
            {errors.proposed_course_title && <p className="mt-1 text-xs text-red-500 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.proposed_course_title}</p>}
          </div>

          <div>
            <label className={labelCls}>Description du cours et objectifs pédagogiques</label>
            <textarea
              value={form.proposed_course_description}
              onChange={e => set("proposed_course_description", e.target.value)}
              rows={3}
              placeholder="Quels concepts allez-vous aborder ? Quel niveau ? Quels seront les livrables pratiques (labs, projets, exercices) ?"
              className={inputCls("proposed_course_description") + " resize-none"}
            />
          </div>
        </div>
      </div>

      {/* ── Info processus ── */}
      <div
        className="rounded-2xl p-4 space-y-2"
        style={{ background: "#f0f9ff", border: "1px solid #bae6fd" }}
      >
        <p className="text-sm font-bold text-blue-700 flex items-center gap-1.5">
          <Mail className="w-4 h-4" /> Ce qui se passe après l'envoi :
        </p>
        {[
          "Vous recevez un email de confirmation immédiatement",
          "Notre équipe examine votre dossier sous 3 à 5 jours ouvrés",
          "Vous recevez un email de décision avec motif détaillé",
          "Si accepté : votre compte passe en mode Instructeur instantanément",
        ].map((item, i) => (
          <div key={i} className="flex items-center gap-2">
            <div
              className="w-4 h-4 rounded-full flex items-center justify-center text-white text-[9px] font-black flex-shrink-0"
              style={{ background: "#0284c7" }}
            >
              {i + 1}
            </div>
            <p className="text-xs text-blue-700">{item}</p>
          </div>
        ))}
      </div>

      {/* ── Bouton submit ── */}
      <button
        type="submit"
        disabled={loading || !user}
        className="w-full py-4 rounded-xl text-white font-black text-base transition hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg"
        style={{ background: user ? `linear-gradient(135deg,${C.primary},${C.light})` : "#9ca3af" }}
      >
        {loading
          ? <><Loader className="w-5 h-5 animate-spin" /> Envoi en cours...</>
          : !user
          ? <><Lock className="w-5 h-5" /> Connectez-vous pour candidater</>
          : <><Send className="w-5 h-5" /> Envoyer ma candidature</>
        }
      </button>

      {!user && (
        <div className="text-center space-y-2">
          <Link
            to="/login"
            state={{ from: "/become-instructor" }}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-white text-sm font-bold transition hover:opacity-90"
            style={{ background: `linear-gradient(135deg,${C.primary},${C.light})` }}
          >
            Se connecter <ArrowRight className="w-4 h-4" />
          </Link>
          <p className="text-xs text-gray-400">
            Pas de compte ?{" "}
            <Link to="/register" className="font-bold hover:underline" style={{ color: C.light }}>
              Créer un compte gratuit
            </Link>
          </p>
        </div>
      )}
    </form>
  )
}

// ── Écran succès ──────────────────────────────────────────────
function SuccessState({ userEmail }) {
  return (
    <div className="text-center space-y-6 py-4">
      <div
        className="w-24 h-24 rounded-full flex items-center justify-center mx-auto"
        style={{ background: "linear-gradient(135deg,#d1fae5,#a7f3d0)", border: "3px solid #10b981" }}
      >
        <CheckCircle className="w-12 h-12 text-emerald-500" />
      </div>

      <div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold mb-3" style={{ background: "#d1fae5", color: "#065f46" }}>
          <CheckCircle className="w-3.5 h-3.5" /> Candidature envoyée
        </div>
        <h3 className="text-2xl font-black text-gray-900">Merci pour votre candidature !</h3>
        <p className="text-gray-500 text-sm mt-2 leading-relaxed max-w-sm mx-auto">
          Votre dossier a bien été reçu. Notre équipe va l'examiner sous{" "}
          <strong>3 à 5 jours ouvrés</strong> et vous répondra par email à{" "}
          <strong className="text-indigo-700">{userEmail}</strong>.
        </p>
      </div>

      <div className="rounded-2xl p-4 text-left space-y-2" style={{ background: "#f0f9ff", border: "1px solid #bae6fd" }}>
        <p className="text-sm font-bold text-blue-700">📬 En attendant :</p>
        {[
          "Vérifiez vos spams — un email de confirmation vous a été envoyé",
          "Continuez à apprendre sur la plateforme pour enrichir votre profil",
          "Préparez votre plan de cours (modules, leçons, quiz, exercices)",
        ].map((item, i) => (
          <div key={i} className="flex items-start gap-2">
            <ChevronRight className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-blue-700">{item}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Link
          to="/courses"
          className="flex items-center justify-center gap-2 py-3 rounded-xl border-2 font-bold text-sm transition hover:bg-gray-50"
          style={{ borderColor: "#e5e7eb", color: "#6b7280" }}
        >
          <BookOpen className="w-4 h-4" /> Explorer les cours
        </Link>
        <Link
          to="/student"
          className="flex items-center justify-center gap-2 py-3 rounded-xl text-white font-bold text-sm transition hover:opacity-90"
          style={{ background: `linear-gradient(135deg,${C.primary},${C.light})` }}
        >
          Mon tableau de bord <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  )
}

// ══════════════════════════════════════════════════════════════
// COMPOSANT PRINCIPAL
// ══════════════════════════════════════════════════════════════
export default function BecomeInstructor() {
  const { user, isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const formRef = useRef(null)

  const [existingApp,     setExistingApp]     = useState(null)
  const [loadingApp,      setLoadingApp]       = useState(true)
  const [success,         setSuccess]          = useState(false)
  const [showNewForm,     setShowNewForm]       = useState(false)

  useEffect(() => {
    document.title = "Devenir instructeur — DevOpsAkademy"
  }, [])

  // Charger la candidature existante si connecté
  useEffect(() => {
    if (!isAuthenticated) { setLoadingApp(false); return }
    api.get("/instructor-applications/my")
      .then(r => setExistingApp(r.data?.data || null))
      .catch(() => setExistingApp(null))
      .finally(() => setLoadingApp(false))
  }, [isAuthenticated])

  const scrollToForm = () => {
    formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })
  }

  // Déterminer si on doit afficher le formulaire
  const showForm = !existingApp || showNewForm || existingApp?.status === "rejected"

  return (
    <div className="bg-white min-h-screen">

      {/* ══════ HERO ══════ */}
      <section className="relative overflow-hidden text-white py-20 lg:py-28"
        style={{ background: "linear-gradient(135deg,#1f1b5a 0%,#2d287f 50%,#3b3aab 100%)" }}>
        {/* Grid déco */}
        <div
          className="absolute inset-0 pointer-events-none opacity-100"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px),
                              linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)`,
            backgroundSize: "48px 48px",
          }}
        />
        <div className="absolute -top-20 -right-20 w-96 h-96 rounded-full opacity-10"
          style={{ background: C.accent, filter: "blur(60px)" }} />

        <div className="relative max-w-5xl mx-auto px-6 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold mb-8"
            style={{ background: "rgba(250,204,21,0.15)", border: "1px solid rgba(250,204,21,0.35)", color: C.accent }}>
            <Star className="w-4 h-4 fill-current" />
            Rejoignez nos instructeurs experts
          </div>

          <h1 className="text-4xl lg:text-6xl font-black mb-6 leading-tight">
            Partagez votre expertise.
            <br />
            <span style={{ color: C.accent }}>Impactez des carrières.</span>
          </h1>

          <p className="text-xl text-white/75 max-w-2xl mx-auto mb-10 leading-relaxed">
            Vous êtes un praticien DevOps expérimenté ? Devenez instructeur sur DevOpsAkademy
            et transmettez vos compétences à la prochaine génération d'ingénieurs.
          </p>

          <div className="flex flex-wrap gap-4 justify-center">
            {isAuthenticated && existingApp && existingApp.status !== "rejected" ? (
              <button
                onClick={scrollToForm}
                className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl font-black text-lg transition hover:-translate-y-1 shadow-lg"
                style={{ background: C.accent, color: C.dark }}
              >
                Voir ma candidature <ArrowDown className="w-5 h-5" />
              </button>
            ) : (
              <button
                onClick={scrollToForm}
                className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl font-black text-lg transition hover:-translate-y-1 shadow-lg"
                style={{ background: C.accent, color: C.dark }}
              >
                Candidater maintenant <ArrowRight className="w-5 h-5" />
              </button>
            )}
            <Link
              to="/courses"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl font-semibold text-lg border-2 border-white/25 hover:border-white transition"
            >
              Explorer la plateforme
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-6 mt-16 max-w-xl mx-auto">
            {[["20+", "Apprenants actifs"],["30+", "Cours disponibles"],["95%", "Satisfaction"]].map(([v,l]) => (
              <div key={l} className="text-center">
                <p className="text-3xl font-black" style={{ color: C.accent }}>{v}</p>
                <p className="text-white/60 text-xs mt-1">{l}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════ BÉNÉFICES ══════ */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-14">
            <span className="text-sm font-bold uppercase tracking-wider" style={{ color: C.light }}>Pourquoi enseigner chez nous</span>
            <h2 className="text-3xl font-black text-gray-900 mt-2">Tout pour réussir en tant que formateur</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {BENEFITS.map(({ icon: Icon, title, desc, color }) => (
              <div key={title}
                className="bg-white rounded-2xl border border-gray-100 p-6 hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300">
                <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${color} flex items-center justify-center mb-4 shadow-md`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-bold text-gray-900 mb-2 leading-snug">{title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════ PROCESSUS ══════ */}
      <section className="py-20 bg-white">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-14">
            <span className="text-sm font-bold uppercase tracking-wider" style={{ color: C.light }}>Le processus</span>
            <h2 className="text-3xl font-black text-gray-900 mt-2">De candidat à instructeur en 4 étapes</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {STEPS.map(({ n, icon: Icon, title, desc, color }, i) => (
              <div key={n} className="relative">
                {i < STEPS.length - 1 && (
                  <div className="hidden lg:block absolute top-6 left-full w-full h-0.5 bg-gray-100 z-0" style={{ width: "100%" }} />
                )}
                <div className="relative z-10 text-center p-5 rounded-2xl bg-gray-50 border border-gray-100 hover:shadow-md transition">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-3 shadow-md"
                    style={{ background: `linear-gradient(135deg,${color}33,${color}66)` }}
                  >
                    <Icon className="w-6 h-6" style={{ color }} />
                  </div>
                  <span className="text-xs font-black text-gray-300 block mb-1">{n}</span>
                  <h4 className="font-black text-gray-900 text-sm mb-2">{title}</h4>
                  <p className="text-gray-500 text-xs leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════ FORMULAIRE ══════ */}
      <section ref={formRef} className="py-20 bg-gray-50">
        <div className="max-w-2xl mx-auto px-6">
          <div className="text-center mb-10">
            <span className="text-sm font-bold uppercase tracking-wider" style={{ color: C.light }}>Candidature</span>
            <h2 className="text-3xl font-black text-gray-900 mt-2">Rejoignez l'équipe des formateurs</h2>
            {!isAuthenticated && (
              <p className="text-gray-500 text-sm mt-2">
                Connectez-vous pour soumettre votre candidature
              </p>
            )}
          </div>

          {/* Candidature existante */}
          {isAuthenticated && !loadingApp && existingApp && !showNewForm && (
            <ExistingApplicationBanner
              app={existingApp}
              onNewApplication={() => setShowNewForm(true)}
            />
          )}

          {/* Loading */}
          {isAuthenticated && loadingApp && (
            <div className="flex justify-center py-8">
              <Loader className="w-6 h-6 animate-spin" style={{ color: C.light }} />
            </div>
          )}

          {/* Succès */}
          {success && (
            <div className="bg-white rounded-2xl border border-emerald-200 shadow-lg p-8">
              <SuccessState userEmail={user?.email} />
            </div>
          )}

          {/* Formulaire */}
          {!success && !loadingApp && showForm && (
            <div className="bg-white rounded-2xl border border-gray-200 shadow-lg overflow-hidden">
              <div className="h-1" style={{ background: `linear-gradient(90deg,${C.primary},${C.light},${C.accent})` }} />
              <div className="p-8">
                {existingApp?.status === "rejected" && showNewForm && (
                  <div className="mb-6 flex items-start gap-3 rounded-xl px-4 py-3" style={{ background: "#fffbeb", border: "1px solid #fde68a" }}>
                    <AlertCircle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                    <p className="text-amber-700 text-sm">
                      Vous soumettez une <strong>nouvelle candidature</strong>. Prenez le temps de renforcer votre dossier en répondant aux points soulevés lors du refus.
                    </p>
                  </div>
                )}
                <ApplicationForm user={user} onSuccess={() => setSuccess(true)} />
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  )
}