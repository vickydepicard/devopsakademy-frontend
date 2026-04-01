import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../../api/api";
import { useAuth } from "../../contexts/AuthContext";
import {
  BookOpen, PlayCircle, Clock, CheckCircle, AlertCircle,
  Upload, Eye, BarChart2, Award, Calendar, Lock,
  Search, Filter, ChevronDown, ArrowRight, Star
} from "lucide-react";

const STATUS_CONFIG = {
  approved: { label: "Actif", color: "bg-emerald-100 text-emerald-700 border-emerald-200", dot: "bg-emerald-500" },
  pending:  { label: "En attente", color: "bg-yellow-100 text-yellow-700 border-yellow-200", dot: "bg-yellow-400" },
  rejected: { label: "Rejeté", color: "bg-red-100 text-red-700 border-red-200", dot: "bg-red-500" },
  no_proof: { label: "À payer", color: "bg-gray-100 text-gray-600 border-gray-200", dot: "bg-gray-400" },
};

const getStatus = (course) => {
  if (course.is_approved) return "approved";
  if (course.payment_status === "pending") return "pending";
  if (course.payment_status === "rejected") return "rejected";
  return "no_proof";
};

const FILTERS = [
  { key: "all", label: "Tous" },
  { key: "approved", label: "Actifs" },
  { key: "pending", label: "En attente" },
  { key: "rejected", label: "Rejetés" },
];

export default function MyCourses() {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [uploadingId, setUploadingId] = useState(null);
  const [sortBy, setSortBy] = useState("date");

  useEffect(() => {
    document.title = "Mes cours — DevOpsAkademy";
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const res = await api.get("/enrollments/me");
      setCourses(res.data?.data || []);
    } catch (err) {
      console.error("Erreur chargement cours:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (courseId, e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { alert("Fichier trop volumineux (max 5MB)"); return; }
    const fd = new FormData();
    fd.append("payment_proof", file);
    try {
      setUploadingId(courseId);
      await api.post(`/enrollments/${courseId}/upload-proof`, fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      await fetchCourses();
      alert("✅ Preuve envoyée ! Validation sous 24h.");
    } catch (err) {
      alert("❌ Erreur lors de l'envoi.");
    } finally {
      setUploadingId(null);
    }
  };

  const filtered = courses
    .filter((c) => {
      const matchSearch = c.title?.toLowerCase().includes(search.toLowerCase());
      const matchFilter = filter === "all" || getStatus(c) === filter;
      return matchSearch && matchFilter;
    })
    .sort((a, b) => {
      if (sortBy === "date") return new Date(b.enrolled_at) - new Date(a.enrolled_at);
      if (sortBy === "progress") return (b.completion_percentage || 0) - (a.completion_percentage || 0);
      return a.title?.localeCompare(b.title);
    });

  const stats = {
    total: courses.length,
    active: courses.filter((c) => c.is_approved).length,
    done: courses.filter((c) => (c.completion_percentage || 0) >= 100).length,
    pending: courses.filter((c) => !c.is_approved && c.payment_status === "pending").length,
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-7xl mx-auto animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/3" />
          <div className="grid grid-cols-4 gap-4">
            {[1,2,3,4].map(i => <div key={i} className="h-24 bg-gray-200 rounded-xl" />)}
          </div>
          <div className="grid grid-cols-3 gap-6">
            {[1,2,3,4,5,6].map(i => <div key={i} className="h-72 bg-gray-200 rounded-2xl" />)}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

        {/* Header */}
        <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Mes cours</h1>
            <p className="text-gray-500 mt-1">Suivez votre progression et accédez à vos formations</p>
          </div>
          <Link
            to="/courses"
            className="inline-flex items-center gap-2 bg-primary text-white font-semibold py-2.5 px-5 rounded-full hover:-translate-y-0.5 transition shadow-md text-sm"
          >
            <BookOpen className="w-4 h-4" /> Explorer les cours
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Total inscrits", value: stats.total, icon: BookOpen, color: "text-primary", bg: "bg-primary/10" },
            { label: "Cours actifs", value: stats.active, icon: PlayCircle, color: "text-emerald-600", bg: "bg-emerald-50" },
            { label: "Terminés", value: stats.done, icon: Award, color: "text-violet-600", bg: "bg-violet-50" },
            { label: "En attente", value: stats.pending, icon: Clock, color: "text-yellow-600", bg: "bg-yellow-50" },
          ].map(({ label, value, icon: Icon, color, bg }) => (
            <div key={label} className="bg-white border border-gray-200 rounded-2xl p-5 shadow-soft">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 mb-1">{label}</p>
                  <p className="text-3xl font-bold text-gray-900">{value}</p>
                </div>
                <div className={`w-12 h-12 ${bg} rounded-xl flex items-center justify-center`}>
                  <Icon className={`w-6 h-6 ${color}`} />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Filtres + Recherche */}
        <div className="flex flex-wrap items-center gap-3 mb-6">
          {/* Barre de recherche */}
          <div className="relative flex-1 min-w-[220px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Rechercher un cours…"
              className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary bg-white"
            />
          </div>

          {/* Filtres statut */}
          <div className="flex gap-2 flex-wrap">
            {FILTERS.map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setFilter(key)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition ${
                  filter === key
                    ? "bg-primary text-white shadow-md"
                    : "bg-white border border-gray-200 text-gray-600 hover:border-primary hover:text-primary"
                }`}
              >
                {label}
                {key !== "all" && (
                  <span className="ml-1.5 text-xs opacity-70">
                    ({courses.filter((c) => getStatus(c) === key).length})
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Tri */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-3 py-2.5 border border-gray-200 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 bg-white text-gray-600"
          >
            <option value="date">Trier : Date</option>
            <option value="progress">Trier : Progression</option>
            <option value="name">Trier : Nom</option>
          </select>
        </div>

        {/* Liste des cours */}
        {filtered.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded-2xl p-16 text-center">
            <BookOpen className="w-14 h-14 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-800 mb-2">Aucun cours trouvé</h3>
            <p className="text-gray-500 mb-6 text-sm">
              {search ? `Aucun résultat pour "${search}"` : "Commencez par vous inscrire à une formation."}
            </p>
            <Link to="/courses" className="inline-flex items-center gap-2 bg-primary text-white font-semibold py-2.5 px-6 rounded-full hover:-translate-y-0.5 transition">
              Découvrir les formations <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((course) => {
              const status = getStatus(course);
              const cfg = STATUS_CONFIG[status];
              const progress = course.completion_percentage || 0;

              return (
                <div key={course.id} className="bg-white border border-gray-200 rounded-2xl overflow-hidden hover:shadow-medium transition-all duration-300 hover:-translate-y-1 flex flex-col">

                  {/* Thumbnail */}
                  <div className="relative h-44 overflow-hidden bg-gradient-to-br from-primary-dark to-primary-light">
                    {course.thumbnail_url ? (
                      <>
                        <img
                          src={course.thumbnail_url}
                          alt={course.title}
                          className="w-full h-full object-contain"
                          onError={e => { e.target.style.display="none"; const fb=e.target.nextSibling; if(fb) fb.style.display="flex"; }}
                        />
                        <div style={{display:"none"}} className="absolute inset-0 items-center justify-center bg-gradient-to-br from-indigo-500 to-purple-600">
                          <span className="text-white font-bold text-2xl drop-shadow">
                            {(course.title||"?").split(" ").slice(0,2).map(w=>w[0]).join("").toUpperCase()}
                          </span>
                        </div>
                      </>
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <BookOpen className="w-12 h-12 text-white/40" />
                      </div>
                    )}
                    {/* Overlay gradient */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />

                    {/* Badge statut */}
                    <div className="absolute top-3 right-3">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border shadow-sm ${cfg.color}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                        {cfg.label}
                      </span>
                    </div>

                    {/* Progress overlay si actif */}
                    {status === "approved" && (
                      <div className="absolute bottom-0 left-0 right-0 px-3 pb-3 pt-6"
                        style={{ background:"linear-gradient(to top, rgba(0,0,0,0.7), transparent)" }}>
                        <div className="flex items-center justify-between text-white text-xs mb-1.5">
                          <span className="font-medium">Progression</span>
                          <span className="font-bold text-sm px-1.5 py-0.5 rounded"
                            style={{ background: progress>=100?"#5653e1":progress>=50?"#059669":"rgba(255,255,255,0.2)" }}>
                            {Math.round(progress)}%
                          </span>
                        </div>
                        <div className="h-2 rounded-full overflow-hidden" style={{ background:"rgba(255,255,255,0.25)" }}>
                          <div
                            className="h-full rounded-full transition-all duration-500"
                            style={{
                              width: `${Math.max(progress, progress>0?3:0)}%`,
                              background: progress>=100
                                ? "linear-gradient(90deg,#5653e1,#8b5cf6)"
                                : progress>=80
                                ? "linear-gradient(90deg,#059669,#10b981)"
                                : "linear-gradient(90deg,#facc15,#fbbf24)",
                            }}
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Contenu */}
                  <div className="p-5 flex flex-col flex-1">
                    <h3 className="font-bold text-gray-900 mb-2 text-base leading-snug" style={{ display:"-webkit-box", WebkitLineClamp:2, WebkitBoxOrient:"vertical", overflow:"hidden" }}>
                      {course.title}
                    </h3>

                    <div className="flex items-center gap-3 text-xs text-gray-400 mb-4">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(course.enrolled_at).toLocaleDateString("fr-FR")}
                      </span>
                      {course.duration_hours && (
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {course.duration_hours}h
                        </span>
                      )}
                    </div>

                    {/* Stats leçons */}
                    {status === "approved" && (
                      <div className="flex items-center gap-1 text-xs text-gray-500 mb-4">
                        <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
                        <span>{course.completed_lessons || 0} / {course.total_lessons || 0} leçons complétées</span>
                      </div>
                    )}

                    <div className="mt-auto space-y-2">
                      {/* Actions selon statut */}
                      {status === "approved" ? (
                        <>
                          <button
                            onClick={() => navigate(`/courses/${course.course_id || course.id}/learn`)}
                            className="w-full flex items-center justify-center gap-2 py-3 font-bold rounded-xl transition text-sm shadow-md hover:shadow-lg hover:-translate-y-0.5"
                            style={{ background:"linear-gradient(135deg,#2d287f,#5653e1)", color:"#fff" }}
                          >
                            <PlayCircle className="w-4 h-4" />
                            {progress >= 100 ? "🎓 Revoir le cours" : progress > 0 ? "▶ Continuer" : "🚀 Commencer"}
                          </button>
                          {progress >= 100 && (
                            <Link
                              to="/my-certificates"
                              className="w-full flex items-center justify-center gap-2 py-2 border border-accent text-accent rounded-xl hover:bg-accent/5 transition text-sm font-medium"
                            >
                              <Award className="w-4 h-4" /> Voir mon certificat
                            </Link>
                          )}
                        </>
                      ) : status === "pending" ? (
                        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-3 text-center">
                          <Clock className="w-5 h-5 text-yellow-500 mx-auto mb-1" />
                          <p className="text-xs text-yellow-700 font-medium">Validation en cours</p>
                          <p className="text-xs text-yellow-600 mt-0.5">Réponse sous 24h</p>
                        </div>
                      ) : status === "rejected" ? (
                        <>
                          <div className="bg-red-50 border border-red-200 rounded-xl p-2.5 text-center mb-2">
                            <p className="text-xs text-red-600 font-medium">Paiement rejeté — veuillez renvoyer une preuve</p>
                          </div>
                          <label className="w-full flex items-center justify-center gap-2 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl cursor-pointer transition text-sm">
                            <Upload className="w-4 h-4" />
                            {uploadingId === course.id ? "Envoi…" : "Renvoyer la preuve"}
                            <input type="file" accept="image/*,.pdf" className="hidden"
                              onChange={(e) => handleUpload(course.id, e)}
                              disabled={uploadingId === course.id} />
                          </label>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => navigate(`/courses/${course.course_id || course.id}`)}
                            className="w-full flex items-center justify-center gap-2 py-2.5 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition text-sm"
                          >
                            <Eye className="w-4 h-4" /> Voir le cours
                          </button>
                          <label className="w-full flex items-center justify-center gap-2 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-semibold rounded-xl cursor-pointer hover:shadow-md transition text-sm">
                            <Upload className="w-4 h-4" />
                            {uploadingId === course.id ? "Envoi…" : "Envoyer preuve de paiement"}
                            <input type="file" accept="image/*,.pdf" className="hidden"
                              onChange={(e) => handleUpload(course.id, e)}
                              disabled={uploadingId === course.id} />
                          </label>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}