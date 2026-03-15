import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import PaymentModal from "../payment/PaymentModal";

const LEVEL_LABELS = { beginner: "Débutant", intermediate: "Intermédiaire", advanced: "Avancé" };
const LEVEL_COLORS = {
  beginner: "bg-emerald-100 text-emerald-700",
  intermediate: "bg-blue-100 text-blue-700",
  advanced: "bg-purple-100 text-purple-700",
};

export default function CoursesList() {
  const { token, user } = useAuth();
  const navigate = useNavigate();

  const [courses, setCourses] = useState([]);
  const [enrollments, setEnrollments] = useState({}); // { courseId: { payment_status, is_approved, enrollment_id } }
  const [filters, setFilters] = useState({ categories: [], levels: [], languages: [], freePaid: [] });
  const [selectedFilters, setSelectedFilters] = useState({ category: "", level: "", is_free: "", language: "", search: "" });
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [paymentModal, setPaymentModal] = useState(null); // course object

  // ── Filtres ──────────────────────────────────────────
  useEffect(() => {
    fetch("/api/courses/filters")
      .then(r => r.json())
      .then(d => { if (d?.success) setFilters(d.data) })
      .catch(err => console.error("Filtres:", err));
  }, []);

  // ── Cours + inscriptions ──────────────────────────────
  useEffect(() => {
    fetchCourses();
    if (token) fetchEnrollments();
  }, [token, user, selectedFilters]);

  const fetchCourses = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      Object.entries(selectedFilters).forEach(([k, v]) => { if (v) params.append(k, v); });
      const res = await fetch(`/api/courses?page=1&limit=50&${params}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      const data = await res.json();
      setCourses(Array.isArray(data?.data) ? data.data : []);
    } catch (err) {
      console.error("Cours:", err);
      setCourses([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchEnrollments = async () => {
    try {
      // ✅ route correcte : /api/enrollments/me
      const res = await fetch("/api/enrollments/me", {
        headers: { Authorization: `Bearer ${token}` },
        credentials: "include",
      });
      const data = await res.json();
      if (data?.success && Array.isArray(data.data)) {
        // Transformer en map { courseId: enrollment }
        const map = {};
        data.data.forEach(e => { map[e.course_id] = e; });
        setEnrollments(map);
      }
    } catch (err) {
      console.error("Enrollments:", err);
    }
  };

  // ── Inscription ───────────────────────────────────────
  const handleEnroll = async (course) => {
    if (!token) { navigate("/login"); return; }

    const isFree = course.is_free === 1 || Number(course.price || 0) === 0;

    // Cours payant → ouvrir le modal paiement
    if (!isFree) {
      setPaymentModal(course);
      return;
    }

    // Cours gratuit → inscription directe
    setActionLoading(course.id);
    try {
      const res = await fetch("/api/enrollments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        credentials: "include",
        body: JSON.stringify({ course_id: course.id }), // ✅ snake_case
      });
      const data = await res.json();
      if (res.ok || res.status === 409) {
        await fetchEnrollments(); // Rafraîchir les statuts
      } else {
        console.error("Erreur inscription:", data?.message);
      }
    } catch (err) {
      console.error("Erreur inscription:", err);
    } finally {
      setActionLoading(null);
    }
  };

  const handlePaymentSuccess = async () => {
    setPaymentModal(null);
    await fetchEnrollments();
  };

  // ── Rendu du bouton selon statut ──────────────────────
  const renderEnrollButton = (course) => {
    const enrollment = enrollments[course.id];
    const isFree = course.is_free === 1 || Number(course.price || 0) === 0;

    if (actionLoading === course.id) {
      return <button disabled className="px-4 py-1.5 rounded-full text-sm bg-gray-200 text-gray-500">⏳...</button>;
    }

    // Pas inscrit
    if (!enrollment) {
      return (
        <button
          onClick={() => handleEnroll(course)}
          className={`px-4 py-1.5 rounded-full text-sm font-semibold transition ${
            isFree
              ? "bg-green-500 hover:bg-green-600 text-white"
              : "bg-indigo-700 hover:bg-indigo-800 text-white"
          }`}
        >
          {isFree ? "✓ S'inscrire" : "S'inscrire"}
        </button>
      );
    }

    const { payment_status, is_approved } = enrollment;

    // Accès actif
    if (payment_status === "free" || payment_status === "verified" || is_approved) {
      return (
        <button
          onClick={() => navigate(`/courses/${course.id}/learn`)}
          className="px-4 py-1.5 rounded-full text-sm font-semibold bg-emerald-500 hover:bg-emerald-600 text-white transition"
        >
          ▶ Accéder
        </button>
      );
    }

    // En attente
    if (payment_status === "pending") {
      return (
        <button disabled className="px-4 py-1.5 rounded-full text-sm font-semibold bg-yellow-100 text-yellow-700 border border-yellow-300 cursor-not-allowed">
          ⏳ En attente
        </button>
      );
    }

    // Rejeté
    if (payment_status === "rejected") {
      return (
        <button
          onClick={() => setPaymentModal(course)}
          className="px-4 py-1.5 rounded-full text-sm font-semibold bg-red-100 hover:bg-red-200 text-red-700 border border-red-300 transition"
        >
          ❌ Réessayer
        </button>
      );
    }

    return null;
  };

  if (loading) return <p className="text-center mt-10 text-gray-500">Chargement des cours...</p>;

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Header */}
      <div className="bg-gradient-to-br from-indigo-900 to-purple-800 text-white py-8 px-6">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-2xl font-bold">Catalogue des formations</h1>
          <p className="text-indigo-300 text-sm mt-1">{courses.length} formations disponibles</p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* Filtres */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6 flex flex-col md:flex-row gap-3">
          <input
            type="text"
            placeholder="Rechercher un cours..."
            value={selectedFilters.search}
            onChange={e => setSelectedFilters({ ...selectedFilters, search: e.target.value })}
            className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
          />
          <select
            value={selectedFilters.category}
            onChange={e => setSelectedFilters({ ...selectedFilters, category: e.target.value })}
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
          >
            <option value="">Toutes les catégories</option>
            {filters.categories.map(cat => <option key={cat.id} value={cat.slug}>{cat.name}</option>)}
          </select>
          <select
            value={selectedFilters.level}
            onChange={e => setSelectedFilters({ ...selectedFilters, level: e.target.value })}
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
          >
            <option value="">Tous niveaux</option>
            {filters.levels.map((lvl, i) => <option key={i} value={lvl}>{LEVEL_LABELS[lvl] || lvl}</option>)}
          </select>
          <select
            value={selectedFilters.is_free}
            onChange={e => setSelectedFilters({ ...selectedFilters, is_free: e.target.value })}
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
          >
            <option value="">Tous</option>
            {filters.freePaid.map(fp => <option key={fp.value} value={fp.value}>{fp.label}</option>)}
          </select>
          <select
            value={selectedFilters.language}
            onChange={e => setSelectedFilters({ ...selectedFilters, language: e.target.value })}
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
          >
            <option value="">Toutes langues</option>
            {filters.languages.map((lang, i) => <option key={i} value={lang}>{lang.toUpperCase()}</option>)}
          </select>
        </div>

        {/* Grille cours */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {courses.length === 0 ? (
            <p className="text-gray-500 text-center col-span-3 py-10">Aucun cours trouvé.</p>
          ) : courses.map(course => {
            const isFree = course.is_free === 1 || Number(course.price || 0) === 0;
            return (
              <div key={course.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-md hover:border-indigo-100 transition-all flex flex-col overflow-hidden group">

                {/* Thumbnail */}
                <div className="relative h-40 bg-gradient-to-br from-indigo-100 to-purple-100 overflow-hidden">
                  {course.thumbnail_url ? (
                    <img src={course.thumbnail_url} alt={course.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" onError={e => { e.target.style.display = "none" }} />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <span className="text-4xl font-bold text-indigo-300">{course.title.slice(0, 2).toUpperCase()}</span>
                    </div>
                  )}
                  <div className="absolute top-2 left-2 flex gap-1.5">
                    {isFree && <span className="px-2 py-0.5 bg-green-500 text-white text-xs font-bold rounded-full">Gratuit</span>}
                    {course.is_featured === 1 && <span className="px-2 py-0.5 bg-yellow-400 text-indigo-900 text-xs font-bold rounded-full">⭐</span>}
                  </div>
                  {course.level && (
                    <span className={`absolute top-2 right-2 px-2 py-0.5 text-xs font-semibold rounded-full ${LEVEL_COLORS[course.level] || "bg-gray-100 text-gray-600"}`}>
                      {LEVEL_LABELS[course.level] || course.level}
                    </span>
                  )}
                </div>

                {/* Contenu */}
                <div className="p-4 flex flex-col flex-1">
                  <h2 className="font-bold text-gray-800 text-sm leading-snug mb-1 line-clamp-2">{course.title}</h2>
                  <p className="text-xs text-gray-500 line-clamp-2 mb-3 flex-1">{course.short_description || "Aucune description."}</p>

                  <div className="flex items-center justify-between mt-auto pt-3 border-t border-gray-50">
                    <span className={`font-bold text-base ${isFree ? "text-green-600" : "text-indigo-700"}`}>
                      {isFree ? "Gratuit" : `${Number(course.price || 0).toLocaleString()} XAF`}
                    </span>
                    {course.duration_hours && <span className="text-xs text-gray-400">⏱ {course.duration_hours}h</span>}
                  </div>

                  <div className="flex gap-2 mt-3">
                    <Link to={`/courses/${course.id}`} className="flex-1 py-2 border border-gray-200 rounded-full text-xs font-semibold text-gray-600 hover:border-indigo-300 hover:text-indigo-700 text-center transition">
                      Voir détails
                    </Link>
                    {renderEnrollButton(course)}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Modal paiement */}
      {paymentModal && (
        <PaymentModal
          course={paymentModal}
          onClose={() => setPaymentModal(null)}
          onSuccess={handlePaymentSuccess}
        />
      )}
    </div>
  );
}