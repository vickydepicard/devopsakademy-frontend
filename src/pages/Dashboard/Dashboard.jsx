// src/pages/Dashboard/Dashboard.jsx
import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import api from "../../api/api";
import {
  BookOpen, Clock, Award, PlayCircle, BarChart2,
  CheckCircle, AlertCircle, Upload, Eye, Calendar,
  FileText, TrendingUp, ChevronRight, Zap
} from "lucide-react";

const STATUS_CONFIG = {
  free:     { label: "Accès actif",              color: "bg-emerald-100 text-emerald-700 border-emerald-200",  dot: "bg-emerald-500" },
  verified: { label: "Accès actif",              color: "bg-emerald-100 text-emerald-700 border-emerald-200",  dot: "bg-emerald-500" },
  pending:  { label: "En attente de validation", color: "bg-amber-100 text-amber-700 border-amber-200",        dot: "bg-amber-400" },
  rejected: { label: "Paiement rejeté",          color: "bg-red-100 text-red-700 border-red-200",              dot: "bg-red-500" },
  default:  { label: "En attente de paiement",   color: "bg-gray-100 text-gray-600 border-gray-200",           dot: "bg-gray-400" },
};

const LEVEL_LABELS = { beginner: "Débutant", intermediate: "Intermédiaire", advanced: "Avancé" };
const LEVEL_COLORS = {
  beginner:     "bg-emerald-100 text-emerald-700",
  intermediate: "bg-blue-100 text-blue-700",
  advanced:     "bg-purple-100 text-purple-700",
};

function ProgressRing({ pct, size = 52 }) {
  const r = (size - 8) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (pct / 100) * circ;
  return (
    <svg width={size} height={size} className="-rotate-90">
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#e5e7eb" strokeWidth="4" />
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#6366f1" strokeWidth="4"
        strokeDasharray={circ} strokeDashoffset={offset}
        strokeLinecap="round" style={{ transition: "stroke-dashoffset 0.6s ease" }} />
      <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle"
        className="rotate-90" style={{ transform: "rotate(90deg)", transformOrigin: "center", fontSize: "11px", fontWeight: 700, fill: "#4f46e5" }}
      >{pct}%</text>
    </svg>
  );
}

export default function Dashboard() {
  const { user, token } = useAuth();
  const navigate = useNavigate();

  const [courses,      setCourses]      = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [uploadingId,  setUploadingId]  = useState(null);
  const [activeFilter, setActiveFilter] = useState("all");
  const [stats,        setStats]        = useState({ total: 0, active: 0, pending: 0, completed: 0, rejected: 0 });

  useEffect(() => { if (token) fetchCourses(); }, [token]);

  const fetchCourses = async () => {
    try {
      const res = await api.get("/enrollments/me");
      const data = res.data?.data || [];
      setCourses(data);
      setStats({
        total:     data.length,
        active:    data.filter(c => c.is_approved || c.payment_status === "free" || c.payment_status === "verified").length,
        pending:   data.filter(c => c.payment_status === "pending").length,
        completed: data.filter(c => c.completed_at).length,
        rejected:  data.filter(c => c.payment_status === "rejected").length,
      });
    } catch (err) {
      console.error("Dashboard fetch:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleUploadProof = async (enrollmentId, e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!["image/jpeg","image/png","image/jpg","application/pdf"].includes(file.type)) {
      alert("❌ Format non supporté. JPG, PNG ou PDF.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) { alert("❌ Fichier trop volumineux (max 5MB)."); return; }

    const formData = new FormData();
    formData.append("payment_proof", file);
    try {
      setUploadingId(enrollmentId);
      await api.post(`/enrollments/${enrollmentId}/upload-proof`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      await fetchCourses();
      alert("✅ Preuve envoyée ! Validation sous 24h.");
    } catch (err) {
      alert(err.response?.data?.message || "❌ Erreur envoi.");
    } finally {
      setUploadingId(null);
    }
  };

  const filtered = courses.filter(c => {
    if (activeFilter === "active")    return c.is_approved || c.payment_status === "free" || c.payment_status === "verified";
    if (activeFilter === "pending")   return c.payment_status === "pending";
    if (activeFilter === "completed") return !!c.completed_at;
    if (activeFilter === "rejected")  return c.payment_status === "rejected";
    return true;
  });

  const lastAccessed = [...courses]
    .filter(c => c.last_accessed_at)
    .sort((a,b) => new Date(b.last_accessed_at) - new Date(a.last_accessed_at))[0];

  const fullName = [user?.first_name, user?.last_name].filter(Boolean).join(" ") || user?.email || "Étudiant";
  const avatar   = user?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(fullName)}&background=4F46E5&color=fff&size=80&bold=true`;

  const getStatus = (c) => STATUS_CONFIG[c.payment_status] || STATUS_CONFIG.default;
  const getProgress = (c) => {
    if (!c.total_lessons) return Number(c.completion_percentage || 0);
    return Math.round(((c.completed_lessons || 0) / c.total_lessons) * 100);
  };
  const hasAccess = (c) => c.is_approved || c.payment_status === "free" || c.payment_status === "verified";

  const FILTERS = [
    { key: "all",       label: "Tous",        count: stats.total,     color: "bg-indigo-700 text-white",  inactiveColor: "bg-gray-100 text-gray-600 hover:bg-gray-200" },
    { key: "active",    label: "Actifs",      count: stats.active,    color: "bg-emerald-600 text-white", inactiveColor: "bg-gray-100 text-gray-600 hover:bg-gray-200" },
    { key: "pending",   label: "En attente",  count: stats.pending,   color: "bg-amber-500 text-white",   inactiveColor: "bg-gray-100 text-gray-600 hover:bg-gray-200" },
    { key: "completed", label: "Terminés",    count: stats.completed, color: "bg-purple-600 text-white",  inactiveColor: "bg-gray-100 text-gray-600 hover:bg-gray-200" },
    { key: "rejected",  label: "Rejetés",     count: stats.rejected,  color: "bg-red-600 text-white",     inactiveColor: "bg-gray-100 text-gray-600 hover:bg-gray-200" },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 py-8 animate-pulse space-y-6">
          <div className="h-40 bg-gray-200 rounded-2xl" />
          <div className="grid grid-cols-4 gap-4">
            {[1,2,3,4].map(i => <div key={i} className="h-24 bg-gray-200 rounded-xl" />)}
          </div>
          <div className="grid grid-cols-3 gap-4">
            {[1,2,3].map(i => <div key={i} className="h-64 bg-gray-200 rounded-2xl" />)}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">

      {/* ════════════ HERO HEADER ════════════ */}
      <div className="relative overflow-hidden bg-gradient-to-br from-[#1e1b4b] via-[#312e81] to-[#4c1d95]">
        {/* Décoration */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-96 h-96 bg-purple-400 rounded-full -translate-y-1/2 translate-x-1/3 blur-3xl" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-400 rounded-full translate-y-1/2 -translate-x-1/4 blur-3xl" />
        </div>

        <div className="relative max-w-6xl mx-auto px-4 py-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">

            {/* Avatar */}
            <div className="relative">
              <img src={avatar} alt="avatar"
                className="w-16 h-16 rounded-2xl border-2 border-white/20 shadow-xl object-cover" />
              <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-400 rounded-full border-2 border-indigo-900" />
            </div>

            <div className="flex-1">
              <p className="text-indigo-300 text-sm font-medium">Bonjour 👋</p>
              <h1 className="text-white text-2xl font-bold mt-0.5">{fullName}</h1>
              <p className="text-indigo-300 text-xs mt-0.5 capitalize">{user?.role} · DevOps Akademy</p>
            </div>

            <Link to="/courses"
              className="mt-2 sm:mt-0 px-5 py-2.5 bg-yellow-400 hover:bg-yellow-300 text-indigo-900 font-bold rounded-xl text-sm transition shadow-lg flex items-center gap-2">
              <Zap className="w-4 h-4" />
              Explorer les cours
            </Link>
          </div>

          {/* Stats cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6">
            {[
              { label: "Cours inscrits", value: stats.total,     icon: BookOpen,   bg: "from-blue-500/20 to-blue-600/20",   text: "text-blue-300" },
              { label: "Cours actifs",   value: stats.active,    icon: PlayCircle, bg: "from-green-500/20 to-green-600/20", text: "text-green-300" },
              { label: "En attente",     value: stats.pending,   icon: Clock,      bg: "from-yellow-500/20 to-amber-600/20",text: "text-yellow-300" },
              { label: "Terminés",       value: stats.completed, icon: Award,      bg: "from-purple-500/20 to-purple-600/20",text: "text-purple-300" },
            ].map(s => {
              const Icon = s.icon;
              return (
                <div key={s.label} className={`bg-gradient-to-br ${s.bg} backdrop-blur rounded-xl px-4 py-3 border border-white/10`}>
                  <div className="flex items-center justify-between mb-1">
                    <Icon className={`w-4 h-4 ${s.text}`} />
                  </div>
                  <div className={`text-2xl font-bold text-white`}>{s.value}</div>
                  <div className={`text-xs ${s.text} mt-0.5`}>{s.label}</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">

        {/* ════════════ CONTINUER L'APPRENTISSAGE ════════════ */}
        {lastAccessed && hasAccess(lastAccessed) && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-5 pt-4 pb-0 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-indigo-500" />
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Continuer là où tu t'es arrêté</p>
            </div>
            <div className="p-5 flex flex-col sm:flex-row gap-4 items-start">
              <div className="w-full sm:w-36 h-20 rounded-xl overflow-hidden bg-gradient-to-br from-indigo-100 to-purple-100 flex-shrink-0 flex items-center justify-center">
                {lastAccessed.thumbnail_url
                  ? <img src={lastAccessed.thumbnail_url} alt="" className="w-full h-full object-cover" onError={e => e.target.style.display="none"} />
                  : <BookOpen className="w-8 h-8 text-indigo-300" />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <h3 className="font-bold text-gray-800 truncate">{lastAccessed.title}</h3>
                  {lastAccessed.level && (
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${LEVEL_COLORS[lastAccessed.level] || "bg-gray-100 text-gray-600"}`}>
                      {LEVEL_LABELS[lastAccessed.level] || lastAccessed.level}
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-500">{lastAccessed.category_name}</p>
                <div className="mt-2">
                  <div className="flex justify-between text-xs text-gray-400 mb-1">
                    <span>Progression</span>
                    <span className="font-semibold text-indigo-600">{getProgress(lastAccessed)}%</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all"
                      style={{ width: `${getProgress(lastAccessed)}%` }} />
                  </div>
                </div>
              </div>
              <button
                onClick={() => navigate(`/courses/${lastAccessed.id}/learn`)}
                className="w-full sm:w-auto px-5 py-2.5 bg-indigo-700 hover:bg-indigo-800 text-white rounded-xl font-semibold text-sm transition flex items-center gap-2 flex-shrink-0 shadow"
              >
                <PlayCircle className="w-4 h-4" />
                Continuer
              </button>
            </div>
          </div>
        )}

        {/* ════════════ FILTRES ════════════ */}
        <div className="flex flex-wrap gap-2">
          {FILTERS.map(f => (
            <button
              key={f.key}
              onClick={() => setActiveFilter(f.key)}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                activeFilter === f.key ? f.color + " shadow-sm" : f.inactiveColor
              }`}
            >
              {f.label}
              <span className={`ml-1.5 text-xs ${activeFilter === f.key ? "opacity-80" : "text-gray-400"}`}>
                ({f.count})
              </span>
            </button>
          ))}
        </div>

        {/* ════════════ GRILLE DE COURS ════════════ */}
        {filtered.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 py-16 text-center">
            <BookOpen className="w-14 h-14 text-gray-200 mx-auto mb-3" />
            <p className="font-bold text-gray-700 text-lg">Aucun cours dans cette catégorie</p>
            <p className="text-gray-400 text-sm mt-1 mb-5">Explorez notre catalogue pour commencer</p>
            <Link to="/courses"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-700 text-white rounded-xl font-semibold text-sm hover:bg-indigo-800 transition">
              Explorer les formations <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {filtered.map(course => {
              const st      = getStatus(course);
              const pct     = getProgress(course);
              const access  = hasAccess(course);

              return (
                <div key={course.id}
                  className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:border-indigo-100 transition-all flex flex-col overflow-hidden group">

                  {/* Thumbnail */}
                  <div className="relative h-44 bg-gradient-to-br from-indigo-50 to-purple-50 overflow-hidden">
                    <img
                      src={course.thumbnail_url || "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400&q=70"}
                      alt={course.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      onError={e => { e.target.onerror=null; e.target.src=""; e.target.style.display="none"; }}
                    />
                    {/* Badge statut */}
                    <div className="absolute top-3 right-3">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border flex items-center gap-1.5 ${st.color} backdrop-blur-sm`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${st.dot}`} />
                        {st.label}
                      </span>
                    </div>
                    {/* Badge niveau */}
                    {course.level && (
                      <div className="absolute top-3 left-3">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${LEVEL_COLORS[course.level] || "bg-gray-100 text-gray-600"}`}>
                          {LEVEL_LABELS[course.level] || course.level}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Contenu */}
                  <div className="p-5 flex flex-col flex-1">
                    <h3 className="font-bold text-gray-800 mb-1 line-clamp-2 leading-snug">{course.title}</h3>

                    <div className="flex flex-wrap gap-3 text-xs text-gray-400 mb-3">
                      {course.enrolled_at && (
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {new Date(course.enrolled_at).toLocaleDateString("fr-FR")}
                        </span>
                      )}
                      {course.duration_hours && (
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {course.duration_hours}h
                        </span>
                      )}
                    </div>

                    {/* Progression si accès */}
                    {access && (
                      <div className="mb-4">
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-gray-500">Progression</span>
                          <span className="font-bold text-indigo-600">{pct}%</span>
                        </div>
                        <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                          <div className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all"
                            style={{ width: `${pct}%` }} />
                        </div>
                        <p className="text-xs text-gray-400 mt-1">
                          {course.completed_lessons || 0}/{course.total_lessons || 0} leçons complétées
                        </p>
                      </div>
                    )}

                    {/* Message statut si pas d'accès */}
                    {!access && course.payment_status === "pending" && (
                      <div className="mb-4 bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-700 flex items-start gap-2">
                        <Clock className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
                        <span>Votre paiement est en cours de vérification. Accès sous 24h.</span>
                      </div>
                    )}
                    {!access && course.payment_status === "rejected" && (
                      <div className="mb-4 bg-red-50 border border-red-200 rounded-xl p-3 text-xs text-red-600 flex items-start gap-2">
                        <AlertCircle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
                        <span>Paiement rejeté. Veuillez soumettre une nouvelle preuve.</span>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="mt-auto space-y-2">
                      {access ? (
                        <>
                          <button
                            onClick={() => navigate(`/courses/${course.id}/learn`)}
                            className="w-full py-2.5 bg-gradient-to-r from-indigo-700 to-purple-700 hover:from-indigo-800 hover:to-purple-800 text-white rounded-xl font-semibold text-sm transition flex items-center justify-center gap-2 shadow-sm"
                          >
                            <PlayCircle className="w-4 h-4" />
                            Continuer l'apprentissage
                          </button>
                          <button
                            onClick={() => navigate(`/courses/${course.id}/progress`)}
                            className="w-full py-2 border border-indigo-200 text-indigo-700 rounded-xl font-medium text-sm hover:bg-indigo-50 transition flex items-center justify-center gap-2"
                          >
                            <BarChart2 className="w-4 h-4" />
                            Voir progression détaillée
                          </button>
                        </>
                      ) : course.payment_status === "rejected" ? (
                        <>
                          <label className="block cursor-pointer">
                            <div className={`w-full py-2.5 bg-gradient-to-r from-emerald-600 to-green-500 text-white rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition hover:shadow-md ${uploadingId === course.id ? "opacity-60 cursor-wait" : ""}`}>
                              <Upload className="w-4 h-4" />
                              {uploadingId === course.id ? "Envoi en cours..." : "Nouvelle preuve de paiement"}
                            </div>
                            <input type="file" accept="image/*,.pdf" className="hidden"
                              disabled={uploadingId === course.id}
                              onChange={(e) => handleUploadProof(course.id, e)} />
                          </label>
                          <button onClick={() => navigate(`/courses/${course.id}`)}
                            className="w-full py-2 border border-gray-200 text-gray-600 rounded-xl text-sm hover:bg-gray-50 transition flex items-center justify-center gap-2">
                            <Eye className="w-4 h-4" /> Voir le cours
                          </button>
                        </>
                      ) : (
                        <button onClick={() => navigate(`/courses/${course.id}`)}
                          className="w-full py-2.5 border border-gray-200 text-gray-600 rounded-xl font-medium text-sm hover:bg-gray-50 transition flex items-center justify-center gap-2">
                          <Eye className="w-4 h-4" /> Voir les détails
                        </button>
                      )}
                    </div>

                    {/* Preuve existante */}
                    {course.payment_proof_url && (
                      <a href={course.payment_proof_url} target="_blank" rel="noopener noreferrer"
                        className="mt-3 pt-3 border-t border-gray-50 flex items-center gap-2 text-xs text-blue-600 hover:text-blue-800 transition">
                        <FileText className="w-3.5 h-3.5" />
                        Voir la preuve de paiement
                      </a>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ════════════ ACCÈS RAPIDES ════════════ */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { to: "/courses",      emoji: "🔍", label: "Explorer les cours",  bg: "from-indigo-50 to-indigo-100/50",  hover: "hover:border-indigo-200" },
            { to: "/profile",      emoji: "👤", label: "Mon profil",           bg: "from-blue-50 to-blue-100/50",     hover: "hover:border-blue-200" },
            { to: "/certificates", emoji: "🏆", label: "Mes certificats",      bg: "from-yellow-50 to-yellow-100/50", hover: "hover:border-yellow-200" },
            { to: "/settings",     emoji: "⚙️",  label: "Paramètres",           bg: "from-gray-50 to-gray-100/50",    hover: "hover:border-gray-300" },
          ].map(item => (
            <Link key={item.to} to={item.to}
              className={`bg-gradient-to-br ${item.bg} rounded-xl p-4 border border-gray-100 ${item.hover} shadow-sm hover:shadow-md transition text-center group`}>
              <div className="text-2xl mb-2">{item.emoji}</div>
              <p className="text-sm font-semibold text-gray-700 group-hover:text-indigo-700 transition">{item.label}</p>
            </Link>
          ))}
        </div>

        {/* ════════════ GUIDE PROCESSUS ════════════ */}
        {courses.length === 0 && (
          <div className="bg-gradient-to-br from-indigo-50 to-purple-50 border border-indigo-100 rounded-2xl p-8">
            <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
              <span>📋</span> Comment accéder à vos cours ?
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-6">
              {[
                { n: "1", title: "Inscription",  desc: "Choisissez un cours et cliquez sur S'inscrire", icon: BookOpen, color: "text-indigo-500 bg-indigo-100" },
                { n: "2", title: "Paiement",     desc: "Choisissez votre moyen de paiement et envoyez la preuve", icon: Upload, color: "text-blue-500 bg-blue-100" },
                { n: "3", title: "Validation",   desc: "L'admin vérifie et valide votre paiement sous 24h", icon: CheckCircle, color: "text-amber-500 bg-amber-100" },
                { n: "4", title: "Accès",        desc: "Accédez au contenu complet du cours", icon: PlayCircle, color: "text-green-500 bg-green-100" },
              ].map(step => {
                const Icon = step.icon;
                return (
                  <div key={step.n} className="text-center">
                    <div className={`w-12 h-12 ${step.color} rounded-xl flex items-center justify-center mx-auto mb-3`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <h4 className="font-bold text-gray-800 mb-1">{step.title}</h4>
                    <p className="text-sm text-gray-500">{step.desc}</p>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}