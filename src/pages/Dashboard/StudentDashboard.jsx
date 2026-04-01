// src/pages/dashboard/StudentDashboard.jsx
import { useState, useEffect } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useAuth } from "../../contexts/AuthContext"

const LEVEL_LABELS = { beginner: "Débutant", intermediate: "Intermédiaire", advanced: "Avancé" }
const LEVEL_COLORS = {
  beginner: "bg-green-100 text-green-700",
  intermediate: "bg-blue-100 text-blue-700",
  advanced: "bg-purple-100 text-purple-700",
}
const STATUS_CONFIG = {
  free:     { label: "Accès actif",             color: "bg-emerald-100 text-emerald-700", icon: "✓" },
  verified: { label: "Accès actif",             color: "bg-emerald-100 text-emerald-700", icon: "✓" },
  pending:  { label: "En attente de validation",color: "bg-yellow-100 text-yellow-700",   icon: "⏳" },
  rejected: { label: "Paiement rejeté",         color: "bg-red-100 text-red-700",         icon: "✗" },
}

export default function StudentDashboard() {
  const { user, token, getFullName } = useAuth()
  const navigate = useNavigate()
  const [enrollments, setEnrollments] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("all")

  useEffect(() => { fetchEnrollments() }, [])

  const fetchEnrollments = async () => {
    try {
      const res = await fetch("/api/enrollments/me", {
        headers: { Authorization: `Bearer ${token}` },
        credentials: "include",
      })
      const data = await res.json()
      if (data?.success) setEnrollments(data.data || [])
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  // Calcul stats
  const stats = {
    total:     enrollments.length,
    active:    enrollments.filter(e => e.payment_status === "free" || e.payment_status === "verified" || e.is_approved).length,
    pending:   enrollments.filter(e => e.payment_status === "pending").length,
    completed: enrollments.filter(e => e.completed_at).length,
    rejected:  enrollments.filter(e => e.payment_status === "rejected").length,
  }

  const tabs = [
    { key: "all",      label: `Tous les cours (${stats.total})` },
    { key: "active",   label: `Actifs (${stats.active})` },
    { key: "pending",  label: `En attente (${stats.pending})` },
    { key: "completed",label: `Terminés (${stats.completed})` },
    { key: "rejected", label: `Rejetés (${stats.rejected})` },
  ]

  const filtered = enrollments.filter(e => {
    if (activeTab === "all")       return true
    if (activeTab === "active")    return e.payment_status === "free" || e.payment_status === "verified" || e.is_approved
    if (activeTab === "pending")   return e.payment_status === "pending"
    if (activeTab === "completed") return !!e.completed_at
    if (activeTab === "rejected")  return e.payment_status === "rejected"
    return true
  })

  const lastAccessed = [...enrollments]
    .filter(e => e.last_accessed_at)
    .sort((a, b) => new Date(b.last_accessed_at) - new Date(a.last_accessed_at))[0]

  const avatar = user?.avatar_url ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(getFullName())}&background=4F46E5&color=fff&size=80`

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">

      {/* ── Hero header ──────────────────────────────────── */}
      <div className="bg-gradient-to-br from-indigo-900 via-indigo-800 to-purple-800 text-white">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
            <img src={avatar} alt="avatar" className="w-16 h-16 rounded-full border-2 border-white/30 shadow-lg object-contain" />
            <div className="flex-1">
              <p className="text-indigo-300 text-sm">Bonjour 👋</p>
              <h1 className="text-2xl font-bold mt-0.5">{getFullName()}</h1>
              <p className="text-indigo-300 text-sm capitalize mt-0.5">{user?.role}</p>
            </div>
            <Link
              to="/courses"
              className="mt-2 sm:mt-0 px-5 py-2.5 bg-yellow-400 hover:bg-yellow-300 text-indigo-900 font-bold rounded-full text-sm transition shadow"
            >
              + Explorer les cours
            </Link>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6">
            {[
              { label: "Cours inscrits",  value: stats.total,     icon: "📚", color: "text-blue-300" },
              { label: "Cours actifs",    value: stats.active,    icon: "▶️",  color: "text-green-300" },
              { label: "En attente",      value: stats.pending,   icon: "⏳", color: "text-yellow-300" },
              { label: "Terminés",        value: stats.completed, icon: "🏆", color: "text-purple-300" },
            ].map(s => (
              <div key={s.label} className="bg-white/10 backdrop-blur rounded-xl px-4 py-3">
                <div className={`text-2xl font-bold ${s.color}`}>{s.value}</div>
                <div className="text-xs text-indigo-300 mt-0.5">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">

        {/* ── Continuer là où tu t'es arrêté ────────────── */}
        {lastAccessed && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Continuer l'apprentissage</p>
            <div className="flex flex-col sm:flex-row gap-4 items-start">
              <div className="w-full sm:w-32 h-20 rounded-xl bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center overflow-hidden flex-shrink-0">
                {lastAccessed.thumbnail_url
                  ? <img src={lastAccessed.thumbnail_url} alt="" className="w-full h-full object-contain" onError={e => e.target.style.display="none"} />
                  : <span className="text-3xl">📖</span>}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-gray-800 text-base truncate">{lastAccessed.title}</h3>
                <p className="text-sm text-gray-500 mt-0.5">{lastAccessed.category_name} · {LEVEL_LABELS[lastAccessed.level]}</p>
                <div className="mt-2">
                  <div className="flex justify-between text-xs text-gray-500 mb-1">
                    <span>Progression</span>
                    <span>{Number(lastAccessed.completion_percentage || 0).toFixed(0)}%</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all"
                      style={{ width: `${lastAccessed.completion_percentage || 0}%` }}
                    />
                  </div>
                </div>
              </div>
              <button
                onClick={() => navigate(`/courses/${lastAccessed.slug}/learn`)}
                className="w-full sm:w-auto px-5 py-2.5 bg-indigo-700 hover:bg-indigo-800 text-white rounded-full font-semibold text-sm transition flex-shrink-0"
              >
                ▶ Continuer
              </button>
            </div>
          </div>
        )}

        {/* ── Tableau de bord cours ──────────────────────── */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
          {/* Tabs */}
          <div className="flex overflow-x-auto border-b border-gray-100 scrollbar-none">
            {tabs.map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex-shrink-0 px-4 py-3.5 text-sm font-medium transition-all whitespace-nowrap ${
                  activeTab === tab.key
                    ? "border-b-2 border-indigo-600 text-indigo-700 bg-indigo-50/50"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Liste cours */}
          {filtered.length === 0 ? (
            <div className="py-16 text-center">
              <div className="text-5xl mb-3">📭</div>
              <p className="text-gray-500 font-medium">Aucun cours dans cette catégorie</p>
              <Link to="/courses" className="mt-3 inline-block text-indigo-600 hover:underline text-sm">
                Explorer le catalogue →
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {filtered.map(e => {
                const cfg = STATUS_CONFIG[e.payment_status] || STATUS_CONFIG.pending
                const hasAccess = e.payment_status === "free" || e.payment_status === "verified" || e.is_approved
                return (
                  <div key={e.id} className="p-4 flex flex-col sm:flex-row gap-4 items-start hover:bg-gray-50/50 transition">
                    {/* Thumbnail */}
                    <div className="w-full sm:w-24 h-16 rounded-lg bg-gradient-to-br from-indigo-100 to-purple-100 overflow-hidden flex-shrink-0 flex items-center justify-center">
                      {e.thumbnail_url
                        ? <img src={e.thumbnail_url} alt="" className="w-full h-full object-contain" onError={ev => ev.target.style.display="none"} />
                        : <span className="text-2xl">📚</span>}
                    </div>

                    {/* Infos */}
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <h3 className="font-semibold text-gray-800 text-sm truncate">{e.title}</h3>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${LEVEL_COLORS[e.level] || "bg-gray-100 text-gray-600"}`}>
                          {LEVEL_LABELS[e.level] || e.level}
                        </span>
                      </div>

                      <div className="flex flex-wrap gap-3 text-xs text-gray-500">
                        <span>📅 Inscrit le {new Date(e.enrolled_at).toLocaleDateString("fr-FR")}</span>
                        {e.duration_hours && <span>⏱ {e.duration_hours}h</span>}
                        {e.category_name && <span>🏷 {e.category_name}</span>}
                      </div>

                      {/* Barre de progression si accès */}
                      {hasAccess && (
                        <div className="mt-2">
                          <div className="flex justify-between text-xs text-gray-400 mb-1">
                            <span>Progression</span>
                            <span>{Number(e.completion_percentage || 0).toFixed(0)}%</span>
                          </div>
                          <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all"
                              style={{ width: `${e.completion_percentage || 0}%` }}
                            />
                          </div>
                        </div>
                      )}

                      {/* Message preuve si pending */}
                      {e.payment_status === "pending" && (
                        <p className="text-xs text-yellow-600 mt-1">📎 Preuve soumise — validation sous 24h</p>
                      )}
                      {e.payment_status === "rejected" && (
                        <p className="text-xs text-red-500 mt-1">Votre paiement a été rejeté. Veuillez soumettre une nouvelle preuve.</p>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col gap-2 items-end flex-shrink-0">
                      <span className={`text-xs px-3 py-1 rounded-full font-semibold ${cfg.color}`}>
                        {cfg.icon} {cfg.label}
                      </span>
                      {hasAccess ? (
                        <button
                          onClick={() => navigate(`/courses/${e.slug}/learn`)}
                          className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full text-xs font-semibold transition"
                        >
                          ▶ Accéder
                        </button>
                      ) : (
                        <Link
                          to={`/courses/${e.slug}`}
                          className="px-4 py-1.5 border border-gray-200 text-gray-600 hover:border-gray-300 rounded-full text-xs font-semibold transition"
                        >
                          Voir le cours
                        </Link>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* ── Accès rapides ─────────────────────────────── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { to: "/courses",       icon: "🔍", label: "Explorer les cours" },
            { to: "/profile",       icon: "👤", label: "Mon profil" },
            { to: "/certificates",  icon: "🏆", label: "Mes certificats" },
            { to: "/settings",      icon: "⚙️",  label: "Paramètres" },
          ].map(item => (
            <Link
              key={item.to}
              to={item.to}
              className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm hover:shadow-md hover:border-indigo-200 transition text-center group"
            >
              <div className="text-2xl mb-2">{item.icon}</div>
              <p className="text-sm font-medium text-gray-700 group-hover:text-indigo-700 transition">{item.label}</p>
            </Link>
          ))}
        </div>

      </div>
    </div>
  )
}