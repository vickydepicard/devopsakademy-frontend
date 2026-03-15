// src/pages/courses/CoursesPage.jsx
import { useState, useEffect, useMemo } from "react"
import { Link } from "react-router-dom"
import { useAuth } from "../../contexts/AuthContext"
import EnrollButton from "../../components/enrollment/EnrollButton"

const LEVEL_LABELS = { beginner: "Débutant", intermediate: "Intermédiaire", advanced: "Avancé" }
const LEVEL_COLORS = {
  beginner:     "bg-emerald-100 text-emerald-700",
  intermediate: "bg-blue-100 text-blue-700",
  advanced:     "bg-purple-100 text-purple-700",
}

function StarRating({ rating }) {
  const r = Math.round(Number(rating || 0))
  return (
    <span className="text-yellow-400 text-xs">
      {"★".repeat(r)}{"☆".repeat(5 - r)}
      <span className="text-gray-400 ml-1">({Number(rating || 0).toFixed(1)})</span>
    </span>
  )
}

function CourseCard({ course, onEnrolled }) {
  const price = Number(course.price || 0)
  const originalPrice = Number(course.original_price || 0)
  const isFree = course.is_free === 1 || price === 0

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-md hover:border-indigo-100 transition-all group flex flex-col overflow-hidden">

      {/* Thumbnail */}
      <div className="relative h-44 bg-gradient-to-br from-indigo-100 to-purple-100 overflow-hidden">
        {course.thumbnail_url ? (
          <img
            src={course.thumbnail_url}
            alt={course.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            onError={e => { e.target.style.display = "none" }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-5xl opacity-40">📚</span>
          </div>
        )}

        {/* Badges overlay */}
        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
          {isFree && (
            <span className="px-2 py-0.5 bg-green-500 text-white text-xs font-bold rounded-full shadow">
              Gratuit
            </span>
          )}
          {course.is_featured === 1 && (
            <span className="px-2 py-0.5 bg-yellow-400 text-indigo-900 text-xs font-bold rounded-full shadow">
              ⭐ Featured
            </span>
          )}
        </div>

        {course.level && (
          <div className="absolute top-3 right-3">
            <span className={`px-2 py-0.5 text-xs font-semibold rounded-full shadow ${LEVEL_COLORS[course.level]}`}>
              {LEVEL_LABELS[course.level]}
            </span>
          </div>
        )}
      </div>

      {/* Contenu */}
      <div className="p-4 flex flex-col flex-1">
        {course.category_name && (
          <p className="text-xs text-indigo-500 font-semibold uppercase tracking-wide mb-1">{course.category_name}</p>
        )}

        <h3 className="font-bold text-gray-800 text-sm leading-snug mb-1 line-clamp-2 group-hover:text-indigo-700 transition">
          {course.title}
        </h3>

        {course.short_description && (
          <p className="text-xs text-gray-500 line-clamp-2 mb-2 leading-relaxed">{course.short_description}</p>
        )}

        {/* Meta */}
        <div className="flex flex-wrap gap-2 text-xs text-gray-500 mb-2">
          {course.duration_hours && <span>⏱ {course.duration_hours}h</span>}
          {course.student_count > 0 && <span>👥 {course.student_count.toLocaleString()}</span>}
          {course.language && <span>🌐 {course.language.toUpperCase()}</span>}
        </div>

        {course.rating > 0 && <StarRating rating={course.rating} />}

        {/* Prix */}
        <div className="mt-auto pt-3 border-t border-gray-50">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-baseline gap-2">
              {isFree ? (
                <span className="text-lg font-bold text-green-600">Gratuit</span>
              ) : (
                <>
                  <span className="text-lg font-bold text-indigo-700">{price.toLocaleString()} XAF</span>
                  {originalPrice > price && (
                    <span className="text-xs text-gray-400 line-through">{originalPrice.toLocaleString()} XAF</span>
                  )}
                </>
              )}
            </div>
          </div>

          <div className="flex gap-2 mt-3">
            <Link
              to={`/courses/${course.id}`}
              className="flex-1 py-2 border border-gray-200 rounded-full text-xs font-semibold text-gray-600 hover:border-indigo-300 hover:text-indigo-700 text-center transition"
            >
              Voir détails
            </Link>
            <EnrollButton
              course={course}
              size="sm"
              className="flex-1"
              onEnrolled={onEnrolled}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

export default function CoursesPage() {
  const { token } = useAuth()
  const [courses, setCourses] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [filters, setFilters] = useState({
    category: "",
    level: "",
    price: "",    // "free" | "paid" | ""
    language: "",
  })
  const [sortBy, setSortBy] = useState("popular")

  useEffect(() => {
    fetchAll()
  }, [])

  const fetchAll = async () => {
    try {
      const [coursesRes, catsRes] = await Promise.all([
        fetch("/api/courses?limit=100"),
        fetch("/api/courses/categories"),
      ])
      const [coursesData, catsData] = await Promise.all([
        coursesRes.json(),
        catsRes.json(),
      ])
      if (coursesData?.success) setCourses(coursesData.data || [])
      if (catsData?.success) setCategories(catsData.data || [])
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const setFilter = (key, val) => setFilters(p => ({ ...p, [key]: p[key] === val ? "" : val }))

  const filtered = useMemo(() => {
    let result = [...courses]

    // Recherche
    if (search.trim()) {
      const q = search.toLowerCase()
      result = result.filter(c =>
        c.title?.toLowerCase().includes(q) ||
        c.short_description?.toLowerCase().includes(q) ||
        c.category_name?.toLowerCase().includes(q)
      )
    }

    // Filtres
    if (filters.category) result = result.filter(c => String(c.category_id) === String(filters.category))
    if (filters.level)    result = result.filter(c => c.level === filters.level)
    if (filters.language) result = result.filter(c => c.language?.toLowerCase() === filters.language)
    if (filters.price === "free") result = result.filter(c => c.is_free === 1 || Number(c.price) === 0)
    if (filters.price === "paid") result = result.filter(c => c.is_free !== 1 && Number(c.price) > 0)

    // Tri
    if (sortBy === "popular")  result.sort((a, b) => (b.student_count || 0) - (a.student_count || 0))
    if (sortBy === "rating")   result.sort((a, b) => (b.rating || 0) - (a.rating || 0))
    if (sortBy === "newest")   result.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    if (sortBy === "price_asc")  result.sort((a, b) => Number(a.price) - Number(b.price))
    if (sortBy === "price_desc") result.sort((a, b) => Number(b.price) - Number(a.price))

    return result
  }, [courses, search, filters, sortBy])

  const activeFiltersCount = Object.values(filters).filter(Boolean).length

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">

      {/* ── Hero ──────────────────────────────────────────── */}
      <div className="bg-gradient-to-br from-indigo-900 via-indigo-800 to-purple-800 text-white py-10">
        <div className="max-w-6xl mx-auto px-4">
          <h1 className="text-3xl font-bold mb-1">Catalogue des formations</h1>
          <p className="text-indigo-300 text-sm">{courses.length} formations DevOps, Cloud & CI/CD</p>

          {/* Barre de recherche */}
          <div className="mt-5 relative max-w-xl">
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Rechercher une formation..."
              className="w-full bg-white/10 backdrop-blur border border-white/20 text-white placeholder-indigo-300 rounded-full px-5 py-3 pr-12 text-sm focus:outline-none focus:ring-2 focus:ring-white/30"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-indigo-300">🔍</span>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="flex flex-col lg:flex-row gap-6">

          {/* ── Sidebar filtres ─────────────────────────── */}
          <aside className="w-full lg:w-56 flex-shrink-0 space-y-5">

            {/* Prix */}
            <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
              <h3 className="font-semibold text-gray-700 text-sm mb-3">Prix</h3>
              <div className="space-y-2">
                {[
                  { key: "free", label: "🆓 Gratuit" },
                  { key: "paid", label: "💳 Payant" },
                ].map(opt => (
                  <label key={opt.key} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={filters.price === opt.key}
                      onChange={() => setFilter("price", opt.key)}
                      className="w-4 h-4 rounded accent-indigo-600"
                    />
                    <span className="text-sm text-gray-600">{opt.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Niveau */}
            <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
              <h3 className="font-semibold text-gray-700 text-sm mb-3">Niveau</h3>
              <div className="space-y-2">
                {["beginner", "intermediate", "advanced"].map(lvl => (
                  <label key={lvl} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={filters.level === lvl}
                      onChange={() => setFilter("level", lvl)}
                      className="w-4 h-4 rounded accent-indigo-600"
                    />
                    <span className="text-sm text-gray-600">{LEVEL_LABELS[lvl]}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Catégories */}
            <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
              <h3 className="font-semibold text-gray-700 text-sm mb-3">Catégorie</h3>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {categories.map(cat => (
                  <label key={cat.id} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={filters.category === String(cat.id)}
                      onChange={() => setFilter("category", String(cat.id))}
                      className="w-4 h-4 rounded accent-indigo-600"
                    />
                    <span className="text-sm text-gray-600 truncate">{cat.name}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Langue */}
            <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
              <h3 className="font-semibold text-gray-700 text-sm mb-3">Langue</h3>
              <div className="space-y-2">
                {[{ key: "fr", label: "🇫🇷 Français" }, { key: "en", label: "🇬🇧 Anglais" }].map(l => (
                  <label key={l.key} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={filters.language === l.key}
                      onChange={() => setFilter("language", l.key)}
                      className="w-4 h-4 rounded accent-indigo-600"
                    />
                    <span className="text-sm text-gray-600">{l.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Reset */}
            {activeFiltersCount > 0 && (
              <button
                onClick={() => setFilters({ category: "", level: "", price: "", language: "" })}
                className="w-full py-2 text-sm text-red-500 hover:text-red-700 border border-red-200 hover:border-red-300 rounded-xl transition"
              >
                ✕ Effacer les filtres ({activeFiltersCount})
              </button>
            )}
          </aside>

          {/* ── Grille cours ──────────────────────────────── */}
          <main className="flex-1">
            {/* Barre tri + compteur */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4">
              <p className="text-sm text-gray-500">
                <span className="font-bold text-gray-800">{filtered.length}</span> formation{filtered.length !== 1 ? "s" : ""} trouvée{filtered.length !== 1 ? "s" : ""}
              </p>
              <select
                value={sortBy}
                onChange={e => setSortBy(e.target.value)}
                className="text-sm border border-gray-200 rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-white"
              >
                <option value="popular">Plus populaires</option>
                <option value="rating">Mieux notés</option>
                <option value="newest">Plus récents</option>
                <option value="price_asc">Prix croissant</option>
                <option value="price_desc">Prix décroissant</option>
              </select>
            </div>

            {filtered.length === 0 ? (
              <div className="bg-white rounded-2xl border border-gray-100 py-20 text-center">
                <div className="text-5xl mb-4">🔍</div>
                <p className="font-semibold text-gray-700">Aucune formation trouvée</p>
                <p className="text-gray-400 text-sm mt-1">Essayez de modifier vos filtres</p>
                <button
                  onClick={() => { setSearch(""); setFilters({ category: "", level: "", price: "", language: "" }) }}
                  className="mt-4 px-5 py-2 bg-indigo-600 text-white rounded-full text-sm hover:bg-indigo-700 transition"
                >
                  Réinitialiser
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                {filtered.map(course => (
                  <CourseCard key={course.id} course={course} onEnrolled={() => {}} />
                ))}
              </div>
            )}
          </main>

        </div>
      </div>
    </div>
  )
}