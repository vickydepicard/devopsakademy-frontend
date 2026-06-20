import { useEffect, useState, useCallback } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import PaymentModal from "../payment/PaymentModal";
import {
  Search, SlidersHorizontal, BookOpen, Clock, Star, Users,
  Play, Eye, X, ChevronDown, Loader, AlertCircle
} from "lucide-react";

const LEVEL_LABELS = { beginner: "Débutant", intermediate: "Intermédiaire", advanced: "Avancé" };
const LEVEL_COLORS = {
  beginner:     "bg-emerald-100 text-emerald-700",
  intermediate: "bg-blue-100 text-blue-700",
  advanced:     "bg-purple-100 text-purple-700",
};

// ─── Debounce hook ──────────────────────────────────────────
function useDebounce(value, delay = 400) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

// ─── Skeleton card ──────────────────────────────────────────
function SkeletonCard() {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden animate-pulse">
      <div className="h-44 bg-gray-200" />
      <div className="p-5 space-y-3">
        <div className="flex gap-2">
          <div className="h-5 bg-gray-200 rounded-full w-20" />
          <div className="h-5 bg-gray-200 rounded-full w-14" />
        </div>
        <div className="h-5 bg-gray-200 rounded w-4/5" />
        <div className="h-4 bg-gray-100 rounded w-3/5" />
        <div className="h-4 bg-gray-100 rounded w-full" />
        <div className="flex gap-3 pt-2">
          <div className="h-9 bg-gray-200 rounded-xl flex-1" />
          <div className="h-9 bg-gray-200 rounded-xl flex-1" />
        </div>
      </div>
    </div>
  );
}

export default function CoursesList() {
  const { token, user } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // ── État ──────────────────────────────────────────────────
  const [courses,      setCourses]      = useState([]);
  const [enrollments,  setEnrollments]  = useState({});
  const [filters,      setFilters]      = useState({ categories: [], levels: [], languages: [], freePaid: [] });
  const [loading,      setLoading]      = useState(true);
  const [error,        setError]        = useState(null);
  const [actionLoading, setActionLoading] = useState(null);
  const [paymentModal, setPaymentModal] = useState(null);
  const [showFilters,  setShowFilters]  = useState(false);
  const [total,        setTotal]        = useState(0);

  const [search,   setSearch]   = useState(searchParams.get("search")   || "");
  const [category, setCategory] = useState(searchParams.get("category") || "");
  const [level,    setLevel]    = useState(searchParams.get("level")    || "");
  const [isFree,   setIsFree]   = useState(searchParams.get("is_free")  || "");

  const debouncedSearch = useDebounce(search);

  // ── Filtres disponibles ───────────────────────────────────
  useEffect(() => {
    fetch("/api/courses/filters")
      .then(r => r.json())
      .then(d => { if (d?.success) setFilters(d.data); })
      .catch(() => {});
  }, []);

  // ── Inscriptions de l'utilisateur ────────────────────────
  const fetchEnrollments = useCallback(async () => {
    if (!token) return;
    try {
      const res = await fetch("/api/enrollments/me", {
        headers: { Authorization: `Bearer ${token}` },
        credentials: "include",
      });
      const data = await res.json();
      if (data?.success && Array.isArray(data.data)) {
        const map = {};
        data.data.forEach(e => { map[e.course_id] = e; });
        setEnrollments(map);
      }
    } catch (_) {}
  }, [token]);

  useEffect(() => { fetchEnrollments(); }, [fetchEnrollments]);

  // ── Chargement cours (avec debounce sur la recherche) ─────
  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const params = new URLSearchParams({ page: 1, limit: 50 });
        if (debouncedSearch) params.set("search",   debouncedSearch);
        if (category)        params.set("category", category);
        if (level)           params.set("level",    level);
        if (isFree)          params.set("is_free",  isFree);

        // Sync URL
        const urlParams = {};
        if (debouncedSearch) urlParams.search   = debouncedSearch;
        if (category)        urlParams.category = category;
        if (level)           urlParams.level    = level;
        if (isFree)          urlParams.is_free  = isFree;
        setSearchParams(urlParams, { replace: true });

        const res = await fetch(`/api/courses?${params}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        const data = await res.json();
        const list = Array.isArray(data?.data) ? data.data : [];
        setCourses(list);
        setTotal(data?.total || list.length);
      } catch (_) {
        setError("Impossible de charger les formations.");
        setCourses([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [debouncedSearch, category, level, isFree, token]);

  // ── Inscription cours gratuit ──────────────────────────────
  const handleEnroll = async (course) => {
    if (!token) { navigate("/login", { state: { from: `/courses/${course.id}` } }); return; }
    const isFreeC = course.is_free === 1 || Number(course.price || 0) === 0;
    if (!isFreeC) { setPaymentModal(course); return; }
    setActionLoading(course.id);
    try {
      await fetch("/api/enrollments", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ course_id: course.id }),
      });
      await fetchEnrollments();
    } catch (_) {}
    finally { setActionLoading(null); }
  };

  // ── Bouton d'action ───────────────────────────────────────
  const renderAction = (course) => {
    const enr = enrollments[course.id];
    const isFreeC = course.is_free === 1 || Number(course.price || 0) === 0;
    const isLoading = actionLoading === course.id;

    if (isLoading) return (
      <button disabled className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-gray-100 text-gray-400 rounded-xl text-sm">
        <Loader className="w-4 h-4 animate-spin" /> En cours…
      </button>
    );

    if (!enr) return (
      <button onClick={() => handleEnroll(course)}
        className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 font-bold rounded-xl text-sm text-white transition hover:-translate-y-0.5 hover:shadow-md ${isFreeC ? "bg-emerald-600 hover:bg-emerald-700" : "bg-[#2d287f] hover:bg-[#3b3aab]"}`}>
        <BookOpen className="w-4 h-4" />
        {isFreeC ? "S'inscrire" : "S'inscrire"}
      </button>
    );

    const { payment_status, is_approved } = enr;
    if (payment_status === "free" || payment_status === "verified" || is_approved) return (
      <button onClick={() => navigate(`/courses/${course.id}/learn`)}
        className="flex-1 flex items-center justify-center gap-1.5 py-2.5 font-bold rounded-xl text-sm text-white bg-emerald-600 hover:bg-emerald-700 transition hover:-translate-y-0.5">
        <Play className="w-4 h-4" /> Continuer
      </button>
    );

    if (payment_status === "pending") return (
      <button disabled className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-sm font-semibold bg-amber-50 text-amber-700 border border-amber-200 cursor-not-allowed">
        <Clock className="w-4 h-4" /> En attente
      </button>
    );

    if (payment_status === "rejected") return (
      <button onClick={() => setPaymentModal(course)}
        className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-sm font-semibold bg-red-50 text-red-700 border border-red-200 hover:bg-red-100 transition">
        <AlertCircle className="w-4 h-4" /> Réessayer
      </button>
    );
    return null;
  };

  const activeFiltersCount = [category, level, isFree].filter(Boolean).length;
  const clearFilters = () => { setCategory(""); setLevel(""); setIsFree(""); };

  return (
    <div className="min-h-screen bg-gray-50">

      {/* ── Header ── */}
      <div className="bg-gradient-to-br from-[#1f1b5a] to-[#2d287f] text-white py-14 px-6">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl lg:text-4xl font-black mb-2">Catalogue des formations</h1>
          <p className="text-white/60 mb-8">
            {loading ? "Chargement…" : `${total} formation${total > 1 ? "s" : ""} disponible${total > 1 ? "s" : ""}`}
          </p>

          {/* Barre de recherche */}
          <div className="relative max-w-2xl">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
            <input
              type="text"
              placeholder="Rechercher une formation DevOps, Cloud, Kubernetes…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-12 pr-4 py-3.5 bg-white/10 border border-white/20 rounded-2xl text-white placeholder-white/40 focus:outline-none focus:border-white/50 text-sm"
            />
            {search && (
              <button onClick={() => setSearch("")} className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition">
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8">

        {/* ── Barre de filtres ── */}
        <div className="flex flex-wrap items-center gap-3 mb-6">
          <button
            onClick={() => setShowFilters(p => !p)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold border transition ${showFilters || activeFiltersCount > 0 ? "bg-[#2d287f] text-white border-[#2d287f]" : "bg-white text-gray-700 border-gray-200 hover:border-[#2d287f]"}`}>
            <SlidersHorizontal className="w-4 h-4" />
            Filtres
            {activeFiltersCount > 0 && (
              <span className="bg-white text-[#2d287f] text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
                {activeFiltersCount}
              </span>
            )}
          </button>

          {/* Filtres rapides niveau */}
          {filters.levels.map(lvl => (
            <button key={lvl}
              onClick={() => setLevel(level === lvl ? "" : lvl)}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold border transition ${level === lvl ? LEVEL_COLORS[lvl] + " border-current" : "bg-white text-gray-600 border-gray-200 hover:border-gray-300"}`}>
              {LEVEL_LABELS[lvl] || lvl}
            </button>
          ))}

          <button
            onClick={() => setIsFree(isFree === "1" ? "" : "1")}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold border transition ${isFree === "1" ? "bg-emerald-100 text-emerald-700 border-emerald-200" : "bg-white text-gray-600 border-gray-200 hover:border-gray-300"}`}>
            Gratuit uniquement
          </button>

          {activeFiltersCount > 0 && (
            <button onClick={clearFilters} className="flex items-center gap-1.5 px-3.5 py-2 text-xs text-red-600 hover:bg-red-50 rounded-xl border border-red-200 transition font-semibold">
              <X className="w-3.5 h-3.5" /> Réinitialiser
            </button>
          )}
        </div>

        {/* ── Panel filtres avancés ── */}
        {showFilters && (
          <div className="bg-white border border-gray-100 rounded-2xl p-5 mb-6 grid sm:grid-cols-2 md:grid-cols-3 gap-4 shadow-sm">
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 block">Catégorie</label>
              <select value={category} onChange={e => setCategory(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#2d287f]/30">
                <option value="">Toutes les catégories</option>
                {filters.categories.map(cat => <option key={cat.id} value={cat.slug}>{cat.name}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 block">Niveau</label>
              <select value={level} onChange={e => setLevel(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#2d287f]/30">
                <option value="">Tous niveaux</option>
                {filters.levels.map((lvl, i) => <option key={i} value={lvl}>{LEVEL_LABELS[lvl] || lvl}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 block">Accès</label>
              <select value={isFree} onChange={e => setIsFree(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#2d287f]/30">
                <option value="">Tous</option>
                {filters.freePaid.map(fp => <option key={fp.value} value={fp.value}>{fp.label}</option>)}
              </select>
            </div>
          </div>
        )}

        {/* ── Erreur ── */}
        {error && (
          <div className="flex items-center gap-3 bg-red-50 border border-red-200 text-red-700 rounded-xl p-4 mb-6 text-sm">
            <AlertCircle className="w-5 h-5 shrink-0" /> {error}
          </div>
        )}

        {/* ── Grille ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {loading
            ? [1,2,3,4,5,6].map(i => <SkeletonCard key={i} />)
            : courses.length === 0
              ? (
                <div className="col-span-3 text-center py-20 text-gray-400">
                  <BookOpen className="w-14 h-14 mx-auto mb-4 opacity-25" />
                  <p className="font-semibold text-gray-600 text-lg">Aucune formation trouvée</p>
                  <p className="text-sm mt-1">Essayez d'ajuster vos filtres ou votre recherche</p>
                  {activeFiltersCount > 0 && (
                    <button onClick={clearFilters} className="mt-4 px-5 py-2.5 bg-[#2d287f] text-white font-semibold rounded-xl text-sm hover:bg-[#3b3aab] transition">
                      Réinitialiser les filtres
                    </button>
                  )}
                </div>
              )
              : courses.map(course => {
                  const isFreeC = course.is_free === 1 || Number(course.price || 0) === 0;
                  const lv = LEVEL_LABELS[course.level] ? course.level : null;
                  return (
                    <div key={course.id} className="group bg-white rounded-2xl border border-gray-100 hover:border-[#2d287f]/20 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col overflow-hidden">

                      {/* Thumbnail */}
                      <div className="relative h-44 bg-gradient-to-br from-[#2d287f] to-[#5653e1] overflow-hidden shrink-0">
                        {course.thumbnail_url ? (
                          <img src={course.thumbnail_url} alt={course.title}
                            className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500"
                            onError={e => { e.target.style.display = "none"; }} />
                        ) : (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <span className="text-white/70 text-6xl font-black">{course.title?.[0]?.toUpperCase()}</span>
                          </div>
                        )}
                        {isFreeC && (
                          <span className="absolute top-3 left-3 bg-emerald-500 text-white text-xs font-bold px-2.5 py-1 rounded-full">GRATUIT</span>
                        )}
                        {!isFreeC && (
                          <span className="absolute bottom-3 right-3 bg-[#1f1b5a]/85 backdrop-blur-sm text-white text-sm font-bold px-3 py-1.5 rounded-xl">
                            {parseFloat(course.price || 0).toLocaleString("fr-FR")} FCFA
                          </span>
                        )}
                        {course.is_featured === 1 && (
                          <span className="absolute top-3 right-3 bg-[#facc15] text-[#1f1b5a] text-xs font-bold px-2.5 py-1 rounded-full">⭐ Mis en avant</span>
                        )}
                      </div>

                      {/* Contenu */}
                      <div className="p-5 flex-1 flex flex-col">
                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                          {lv && (
                            <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${LEVEL_COLORS[course.level] || "bg-gray-100 text-gray-600"}`}>
                              {LEVEL_LABELS[course.level]}
                            </span>
                          )}
                          {course.duration_hours && (
                            <span className="text-xs text-gray-400 flex items-center gap-1">
                              <Clock className="w-3 h-3" /> {course.duration_hours}h
                            </span>
                          )}
                        </div>

                        <h3 className="font-bold text-[#1f1b5a] text-base leading-snug mb-1 group-hover:text-[#2d287f] transition-colors line-clamp-2">
                          {course.title}
                        </h3>
                        <p className="text-xs text-gray-400 mb-2">
                          Par {course.first_name} {course.last_name}
                        </p>
                        <p className="text-sm text-gray-500 line-clamp-2 mb-4 flex-1 leading-relaxed">
                          {course.short_description || "Formation complète avec labs pratiques et certification."}
                        </p>

                        <div className="flex items-center justify-between text-xs text-gray-400 mb-4 pb-4 border-b border-gray-50">
                          <span className="flex items-center gap-1">
                            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                            <strong className="text-gray-600">{parseFloat(course.rating || 0).toFixed(1)}</strong>
                            <span>({course.review_count || 0})</span>
                          </span>
                          <span className="flex items-center gap-1">
                            <Users className="w-3.5 h-3.5" /> {course.student_count || 0} étudiant{(course.student_count || 0) > 1 ? "s" : ""}
                          </span>
                        </div>

                        <div className="flex gap-2 mt-auto">
                          <Link to={`/courses/${course.id}`}
                            className="flex-1 flex items-center justify-center gap-1.5 py-2.5 border-2 border-[#2d287f]/25 text-[#2d287f] font-semibold rounded-xl text-sm hover:border-[#2d287f] hover:bg-[#2d287f]/5 transition">
                            <Eye className="w-4 h-4" /> Détails
                          </Link>
                          {renderAction(course)}
                        </div>
                      </div>
                    </div>
                  );
                })
          }
        </div>
      </div>

      {/* Modal paiement */}
      {paymentModal && (
        <PaymentModal
          course={paymentModal}
          onClose={() => setPaymentModal(null)}
          onSuccess={async () => { setPaymentModal(null); await fetchEnrollments(); }}
        />
      )}
    </div>
  );
}