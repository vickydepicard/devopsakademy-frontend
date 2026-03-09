import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../api/api";
import {
  BarChart2, TrendingUp, Users, Star, BookOpen,
  Award, Clock, ArrowUp, ArrowDown, ChevronRight,
  Eye, DollarSign, CheckCircle, Loader
} from "lucide-react";

const StatCard = ({ label, value, sub, icon: Icon, color, bg, trend, trendLabel }) => (
  <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-soft">
    <div className="flex items-start justify-between mb-4">
      <div className={`w-11 h-11 ${bg} rounded-xl flex items-center justify-center`}>
        <Icon className={`w-5 h-5 ${color}`} />
      </div>
      {trend !== undefined && (
        <span className={`flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full ${trend >= 0 ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-500"}`}>
          {trend >= 0 ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}
          {Math.abs(trend)}%
        </span>
      )}
    </div>
    <p className="text-2xl font-bold text-gray-900">{value}</p>
    <p className="text-sm text-gray-500 mt-0.5">{label}</p>
    {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
  </div>
);

const MiniBar = ({ label, value, max, color = "bg-primary" }) => (
  <div className="flex items-center gap-3">
    <p className="text-sm text-gray-700 w-40 shrink-0 truncate">{label}</p>
    <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
      <div className={`h-full ${color} rounded-full transition-all duration-700`} style={{ width: max > 0 ? `${(value / max) * 100}%` : "0%" }} />
    </div>
    <p className="text-sm font-semibold text-gray-700 w-10 text-right shrink-0">{value}</p>
  </div>
);

export default function InstructorAnalytics() {
  const [stats, setStats] = useState(null);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState("all");

  useEffect(() => {
    document.title = "Analytics — DevOpsAkademy";
    fetchData();
  }, [period]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [statsRes, coursesRes] = await Promise.allSettled([
        api.get(`/instructor/stats?period=${period}`),
        api.get("/instructor/courses"),
      ]);
      if (statsRes.status === "fulfilled") setStats(statsRes.value.data?.data);
      if (coursesRes.status === "fulfilled") setCourses(coursesRes.value.data?.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Calcul des métriques depuis les cours si l'endpoint stats est limité
  const computed = {
    total_courses: courses.length,
    published: courses.filter((c) => c.is_published).length,
    total_students: courses.reduce((a, c) => a + (c.enrolled_count || 0), 0),
    avg_rating: courses.length
      ? (courses.reduce((a, c) => a + parseFloat(c.avg_rating || 0), 0) / courses.filter((c) => c.avg_rating).length || 0).toFixed(1)
      : "—",
    total_completions: courses.reduce((a, c) => a + (c.completion_count || 0), 0),
    ...stats,
  };

  // Top 5 cours par inscrits
  const topCourses = [...courses].sort((a, b) => (b.enrolled_count || 0) - (a.enrolled_count || 0)).slice(0, 5);
  const maxStudents = topCourses[0]?.enrolled_count || 1;

  // Top 5 cours par note
  const topRated = [...courses]
    .filter((c) => c.avg_rating)
    .sort((a, b) => parseFloat(b.avg_rating) - parseFloat(a.avg_rating))
    .slice(0, 5);

  const PERIODS = [
    { key: "week", label: "7 jours" },
    { key: "month", label: "30 jours" },
    { key: "all", label: "Tout" },
  ];

  if (loading) {
    return (
      <div className="animate-pulse space-y-6 max-w-6xl">
        <div className="h-8 bg-gray-200 rounded w-1/3" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[1,2,3,4].map(i => <div key={i} className="h-28 bg-gray-200 rounded-2xl" />)}
        </div>
        <div className="grid lg:grid-cols-2 gap-6">
          <div className="h-64 bg-gray-200 rounded-2xl" />
          <div className="h-64 bg-gray-200 rounded-2xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-6xl">

      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
          <p className="text-gray-500 text-sm mt-0.5">Vue d'ensemble de vos performances d'enseignement</p>
        </div>
        {/* Filtre période */}
        <div className="flex bg-gray-100 rounded-xl p-1 gap-1">
          {PERIODS.map(({ key, label }) => (
            <button key={key} onClick={() => setPeriod(key)}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${period === key ? "bg-white text-primary shadow-sm" : "text-gray-500 hover:text-gray-700"}`}>
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Cours créés" value={computed.total_courses} sub={`${computed.published} publiés`}
          icon={BookOpen} color="text-primary" bg="bg-primary/10" trend={computed.course_growth} />
        <StatCard label="Étudiants inscrits" value={computed.total_students}
          icon={Users} color="text-blue-600" bg="bg-blue-50" trend={computed.student_growth} />
        <StatCard label="Note moyenne" value={computed.avg_rating ? `${computed.avg_rating}/5` : "—"}
          icon={Star} color="text-yellow-500" bg="bg-yellow-50" />
        <StatCard label="Cours terminés" value={computed.total_completions || 0}
          icon={Award} color="text-violet-600" bg="bg-violet-50" trend={computed.completion_growth} />
      </div>

      {/* Graphiques / Tops */}
      <div className="grid lg:grid-cols-2 gap-6">

        {/* Top cours par étudiants */}
        <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-soft">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-blue-500" />
              <h3 className="font-bold text-gray-900">Top cours — Inscrits</h3>
            </div>
            <Link to="/instructor/courses" className="text-xs text-primary hover:underline flex items-center gap-0.5">
              Tout voir <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          {topCourses.length === 0 ? (
            <p className="text-gray-400 text-sm text-center py-8">Aucune donnée disponible</p>
          ) : (
            <div className="space-y-3">
              {topCourses.map((c) => (
                <MiniBar key={c.id} label={c.title} value={c.enrolled_count || 0} max={maxStudents} color="bg-blue-400" />
              ))}
            </div>
          )}
        </div>

        {/* Top cours par note */}
        <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-soft">
          <div className="flex items-center gap-2 mb-5">
            <Star className="w-5 h-5 text-yellow-500" />
            <h3 className="font-bold text-gray-900">Top cours — Note moyenne</h3>
          </div>
          {topRated.length === 0 ? (
            <p className="text-gray-400 text-sm text-center py-8">Aucune évaluation pour l'instant</p>
          ) : (
            <div className="space-y-3">
              {topRated.map((c) => (
                <div key={c.id} className="flex items-center gap-3">
                  <p className="text-sm text-gray-700 flex-1 truncate">{c.title}</p>
                  <div className="flex items-center gap-1 shrink-0">
                    {[1,2,3,4,5].map((s) => (
                      <Star key={s} className={`w-3.5 h-3.5 ${s <= Math.round(parseFloat(c.avg_rating)) ? "text-yellow-400 fill-yellow-400" : "text-gray-200 fill-gray-200"}`} />
                    ))}
                    <span className="text-xs font-semibold text-gray-700 ml-1">{parseFloat(c.avg_rating).toFixed(1)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Tableau détaillé des cours */}
      <div className="bg-white border border-gray-100 rounded-2xl shadow-soft overflow-hidden">
        <div className="flex items-center gap-2 px-6 py-4 border-b border-gray-100">
          <BarChart2 className="w-5 h-5 text-primary" />
          <h3 className="font-bold text-gray-900">Performance par cours</h3>
        </div>
        {courses.length === 0 ? (
          <p className="text-center py-12 text-gray-400 text-sm">Aucun cours créé</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  {["Cours", "Statut", "Étudiants", "Complétions", "Note", ""].map((h) => (
                    <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {courses.map((course) => {
                  const completionRate = course.enrolled_count
                    ? Math.round(((course.completion_count || 0) / course.enrolled_count) * 100)
                    : 0;
                  return (
                    <tr key={course.id} className="hover:bg-gray-50/50 transition">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-7 rounded-lg overflow-hidden bg-gradient-to-br from-primary-dark to-primary shrink-0">
                            {course.thumbnail_url
                              ? <img src={course.thumbnail_url} alt="" className="w-full h-full object-cover" />
                              : <div className="w-full h-full flex items-center justify-center"><BookOpen className="w-3.5 h-3.5 text-white/40" /></div>
                            }
                          </div>
                          <p className="font-medium text-gray-800 text-sm truncate max-w-[160px]">{course.title}</p>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${course.is_published ? "bg-emerald-100 text-emerald-700" : "bg-gray-100 text-gray-500"}`}>
                          {course.is_published ? "Publié" : "Brouillon"}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-sm font-semibold text-gray-700">{course.enrolled_count || 0}</td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          <div className="w-16 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                            <div className="h-full bg-emerald-400 rounded-full" style={{ width: `${completionRate}%` }} />
                          </div>
                          <span className="text-xs text-gray-500">{completionRate}%</span>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        {course.avg_rating ? (
                          <span className="flex items-center gap-1 text-sm font-semibold text-yellow-600">
                            <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
                            {parseFloat(course.avg_rating).toFixed(1)}
                          </span>
                        ) : <span className="text-gray-300 text-sm">—</span>}
                      </td>
                      <td className="px-5 py-4">
                        <Link to={`/instructor/courses/${course.id}/students`}
                          className="text-xs text-primary hover:underline flex items-center gap-1">
                          Détails <ChevronRight className="w-3 h-3" />
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Conseils */}
      <div className="bg-gradient-to-br from-primary-dark to-primary rounded-2xl p-6 text-white">
        <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-accent" /> Conseils pour améliorer vos performances
        </h3>
        <div className="grid sm:grid-cols-3 gap-4">
          {[
            { icon: "📹", tip: "Ajoutez des vidéos courtes (< 10 min) pour maintenir l'engagement" },
            { icon: "❓", tip: "Intégrez des quiz à chaque module pour renforcer la mémorisation" },
            { icon: "💬", tip: "Répondez aux questions du forum pour booster votre note instructeur" },
          ].map(({ icon, tip }) => (
            <div key={tip} className="bg-white/10 rounded-xl p-4 text-sm text-white/80">
              <span className="text-2xl block mb-2">{icon}</span>
              {tip}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}