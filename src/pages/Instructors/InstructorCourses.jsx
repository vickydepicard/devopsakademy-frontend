import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../../api/api";
import {
  Plus, Search, BookOpen, Users, Eye, Edit3,
  Trash2, ToggleLeft, ToggleRight, BarChart2,
  Star, Clock, CheckCircle, XCircle, Settings,
  ChevronRight, Filter
} from "lucide-react";

const LEVEL_LABELS = { beginner: "Débutant", intermediate: "Intermédiaire", advanced: "Avancé" };

export default function InstructorCourses() {
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [togglingId, setTogglingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    document.title = "Mes cours — DevOpsAkademy";
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const res = await api.get("/instructor/courses");
      setCourses(res.data?.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const togglePublish = async (course) => {
    setTogglingId(course.id);
    try {
      await api.patch(`/instructor/courses/${course.id}`, {
        is_published: !course.is_published,
      });
      setCourses((prev) =>
        prev.map((c) =>
          c.id === course.id ? { ...c, is_published: !c.is_published } : c
        )
      );
    } catch {
      alert("Erreur lors de la mise à jour.");
    } finally {
      setTogglingId(null);
    }
  };

  const deleteCourse = async (id) => {
    if (!window.confirm("Supprimer ce cours définitivement ? Cette action est irréversible.")) return;
    setDeletingId(id);
    try {
      await api.delete(`/instructor/courses/${id}`);
      setCourses((prev) => prev.filter((c) => c.id !== id));
    } catch {
      alert("Erreur lors de la suppression.");
    } finally {
      setDeletingId(null);
    }
  };

  const filtered = courses.filter((c) => {
    const matchSearch = c.title?.toLowerCase().includes(search.toLowerCase());
    const matchFilter =
      filter === "all" ||
      (filter === "published" && c.is_published) ||
      (filter === "draft" && !c.is_published);
    return matchSearch && matchFilter;
  });

  const stats = {
    total: courses.length,
    published: courses.filter((c) => c.is_published).length,
    draft: courses.filter((c) => !c.is_published).length,
    students: courses.reduce((a, c) => a + (c.enrolled_count || 0), 0),
  };

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-8 bg-gray-200 rounded w-1/3" />
        <div className="grid grid-cols-4 gap-4">
          {[1,2,3,4].map((i) => <div key={i} className="h-20 bg-gray-200 rounded-xl" />)}
        </div>
        {[1,2,3].map((i) => <div key={i} className="h-28 bg-gray-200 rounded-2xl" />)}
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl">

      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Mes cours</h1>
          <p className="text-gray-500 text-sm mt-0.5">Gérez et publiez vos formations</p>
        </div>
        <Link
          to="/instructor/courses/new"
          className="inline-flex items-center gap-2 bg-gradient-to-r from-primary to-primary-light text-white font-semibold py-2.5 px-5 rounded-xl hover:-translate-y-0.5 transition shadow-md text-sm"
        >
          <Plus className="w-4 h-4" /> Nouveau cours
        </Link>
      </div>

      {/* Stats rapides */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total", value: stats.total, color: "text-gray-800", bg: "bg-gray-100" },
          { label: "Publiés", value: stats.published, color: "text-emerald-700", bg: "bg-emerald-50" },
          { label: "Brouillons", value: stats.draft, color: "text-yellow-700", bg: "bg-yellow-50" },
          { label: "Étudiants", value: stats.students, color: "text-blue-700", bg: "bg-blue-50" },
        ].map(({ label, value, color, bg }) => (
          <div key={label} className={`${bg} rounded-xl px-5 py-4`}>
            <p className={`text-2xl font-bold ${color}`}>{value}</p>
            <p className="text-sm text-gray-500">{label}</p>
          </div>
        ))}
      </div>

      {/* Filtres + Recherche */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher un cours…"
            className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 bg-white"
          />
        </div>
        {["all", "published", "draft"].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2.5 rounded-xl text-sm font-medium transition border ${
              filter === f
                ? "bg-primary text-white border-primary shadow-sm"
                : "bg-white text-gray-600 border-gray-200 hover:border-primary hover:text-primary"
            }`}
          >
            {f === "all" ? "Tous" : f === "published" ? "Publiés" : "Brouillons"}
          </button>
        ))}
      </div>

      {/* Liste des cours */}
      {filtered.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-2xl p-16 text-center">
          <BookOpen className="w-14 h-14 text-gray-300 mx-auto mb-4" />
          <h3 className="font-bold text-gray-700 mb-2">
            {search ? `Aucun résultat pour "${search}"` : "Aucun cours trouvé"}
          </h3>
          <p className="text-gray-400 text-sm mb-6">Créez votre première formation dès maintenant.</p>
          <Link to="/instructor/courses/new" className="inline-flex items-center gap-2 bg-primary text-white font-semibold py-2.5 px-6 rounded-xl text-sm">
            <Plus className="w-4 h-4" /> Créer un cours
          </Link>
        </div>
      ) : (
        <div className="bg-white border border-gray-100 rounded-2xl shadow-soft overflow-hidden">
          <div className="divide-y divide-gray-50">
            {filtered.map((course) => (
              <div key={course.id} className="flex items-center gap-4 px-6 py-5 hover:bg-gray-50/60 transition group">
                {/* Thumbnail */}
                <div className="w-20 h-14 rounded-xl overflow-hidden bg-gradient-to-br from-primary-dark to-primary shrink-0">
                  {course.thumbnail_url
                    ? <img src={course.thumbnail_url} alt={course.title} className="w-full h-full object-cover" />
                    : <div className="w-full h-full flex items-center justify-center"><BookOpen className="w-6 h-6 text-white/40" /></div>
                  }
                </div>

                {/* Infos */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-semibold text-gray-900 truncate">{course.title}</p>
                    <span className={`shrink-0 text-xs px-2 py-0.5 rounded-full font-medium ${
                      course.is_published ? "bg-emerald-100 text-emerald-700" : "bg-yellow-100 text-yellow-700"
                    }`}>
                      {course.is_published ? "Publié" : "Brouillon"}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-gray-400">
                    <span className="flex items-center gap-1"><Users className="w-3 h-3" /> {course.enrolled_count || 0} étudiants</span>
                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {course.duration_hours || 0}h</span>
                    <span>{LEVEL_LABELS[course.level] || course.level || "—"}</span>
                    {course.avg_rating && (
                      <span className="flex items-center gap-1"><Star className="w-3 h-3 text-yellow-400" /> {Number(course.avg_rating).toFixed(1)}</span>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                  {/* Toggle publication */}
                  <button
                    onClick={() => togglePublish(course)}
                    disabled={togglingId === course.id}
                    title={course.is_published ? "Dépublier" : "Publier"}
                    className={`p-2 rounded-lg transition ${course.is_published ? "text-emerald-500 hover:bg-emerald-50" : "text-gray-400 hover:bg-gray-100"}`}
                  >
                    {togglingId === course.id
                      ? <span className="w-4 h-4 border-2 border-gray-300 border-t-primary rounded-full animate-spin block" />
                      : course.is_published ? <ToggleRight className="w-5 h-5" /> : <ToggleLeft className="w-5 h-5" />
                    }
                  </button>
                  <Link to={`/instructor/courses/${course.id}/edit`} className="p-2 text-gray-400 hover:text-primary hover:bg-primary/10 rounded-lg transition" title="Modifier"><Edit3 className="w-4 h-4" /></Link>
                  <Link to={`/instructor/courses/${course.id}/modules`} className="p-2 text-gray-400 hover:text-violet-500 hover:bg-violet-50 rounded-lg transition" title="Modules"><Settings className="w-4 h-4" /></Link>
                  <Link to={`/instructor/courses/${course.id}/students`} className="p-2 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition" title="Étudiants"><Users className="w-4 h-4" /></Link>
                  <Link to={`/instructor/courses/${course.id}/analytics`} className="p-2 text-gray-400 hover:text-orange-500 hover:bg-orange-50 rounded-lg transition" title="Analytics"><BarChart2 className="w-4 h-4" /></Link>
                  <button
                    onClick={() => deleteCourse(course.id)}
                    disabled={deletingId === course.id}
                    title="Supprimer"
                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition"
                  >
                    {deletingId === course.id
                      ? <span className="w-4 h-4 border-2 border-red-300 border-t-red-500 rounded-full animate-spin block" />
                      : <Trash2 className="w-4 h-4" />
                    }
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}