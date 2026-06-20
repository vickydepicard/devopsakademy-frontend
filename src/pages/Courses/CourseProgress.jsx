// src/pages/Courses/CourseProgress.jsx
import { useState, useEffect } from "react";
import CourseReviews from "../../components/Reviews/CourseReviews";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { usePermissions } from "../../contexts/PermissionContext";
import api from "../../api/api";

export default function CourseProgress() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token } = useAuth();
  const { canAccessCourseContent } = usePermissions();

  const [course,   setCourse]   = useState(null);
  const [progress, setProgress] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState(null);

  useEffect(() => { fetchData(); }, [id]);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [courseRes, progressRes] = await Promise.all([
        api.get(`/courses/${id}`),
        api.get(`/courses/${id}/progress`),
      ]);
      setCourse(courseRes.data?.data || courseRes.data);
      setProgress(progressRes.data?.data || progressRes.data || []);
    } catch (err) {
      console.error("CourseProgress:", err);
      setError("Impossible de charger la progression.");
    } finally {
      setLoading(false);
    }
  };

  // Calculs globaux
  const totalLessons    = progress.reduce((s, m) => s + Number(m.total_lessons || 0), 0);
  const completedLessons = progress.reduce((s, m) => s + Number(m.completed_lessons || 0), 0);
  const globalPct       = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;
  const totalMinutes    = progress.reduce((s, m) => s + Number(m.total_minutes || 0), 0);
  const completedMinutes = progress.reduce((s, m) => s + Number(m.completed_minutes || 0), 0);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#2d287f]" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl p-8 text-center shadow-sm border border-gray-100 max-w-sm w-full">
          <div className="text-4xl mb-3">⚠️</div>
          <p className="text-gray-700 font-medium mb-4">{error}</p>
          <button onClick={() => navigate(-1)} className="px-5 py-2.5 bg-[#2d287f] text-white rounded-xl text-sm font-semibold hover:bg-indigo-800 transition">
            ← Retour
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">

      {/* ── Header ──────────────────────────────────────── */}
      <div className="bg-gradient-to-br from-[#1f1b5a] to-[#2d287f] text-white px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <button onClick={() => navigate("/student")} className="text-white/60 hover:text-white text-sm mb-4 flex items-center gap-1 transition">
            ← Mon dashboard
          </button>
          <h1 className="text-2xl font-bold">{course?.title}</h1>
          <p className="text-white/60 text-sm mt-1">Progression détaillée</p>

          {/* Barre de progression principale */}
          <div className="mt-6 bg-white/10 rounded-2xl p-5">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <p className="text-3xl font-bold">{globalPct}%</p>
                <p className="text-white/50 text-sm mt-0.5">
                  {completedLessons} / {totalLessons} leçons terminées
                </p>
              </div>
              <div className="flex gap-4 text-center">
                <div className="bg-white/10 rounded-xl px-4 py-2">
                  <p className="text-xl font-bold">{progress.length}</p>
                  <p className="text-white/60 text-xs">Modules</p>
                </div>
                <div className="bg-white/10 rounded-xl px-4 py-2">
                  <p className="text-xl font-bold">{Math.round(completedMinutes / 60 * 10) / 10}h</p>
                  <p className="text-white/60 text-xs">Complétées</p>
                </div>
                <div className="bg-white/10 rounded-xl px-4 py-2">
                  <p className="text-xl font-bold">{Math.round(totalMinutes / 60 * 10) / 10}h</p>
                  <p className="text-white/60 text-xs">Total</p>
                </div>
              </div>
            </div>
            <div className="mt-4 h-3 bg-white/20 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-green-400 to-emerald-400 rounded-full transition-all duration-700"
                style={{ width: `${globalPct}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6 space-y-4">

        {/* ── Liste des modules ────────────────────────── */}
        {progress.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
            <div className="text-5xl mb-3">📭</div>
            <p className="text-gray-600 font-medium">Aucune donnée de progression</p>
            <p className="text-gray-400 text-sm mt-1">Commencez le cours pour voir votre avancement</p>
            <button
              onClick={() => navigate(`/courses/${course?.id || id}/learn`)}
              className="mt-4 px-5 py-2.5 bg-[#2d287f] text-white rounded-xl text-sm font-semibold hover:bg-indigo-800 transition"
            >
              ▶ Commencer le cours
            </button>
          </div>
        ) : progress.map((mod, idx) => {
          const modPct = Number(mod.total_lessons) > 0
            ? Math.round((Number(mod.completed_lessons) / Number(mod.total_lessons)) * 100)
            : 0;
          const isComplete = modPct === 100;

          return (
            <div key={mod.module_id || idx} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              {/* En-tête module */}
              <div className={`px-5 py-4 flex items-center justify-between ${isComplete ? "bg-green-50" : "bg-white"}`}>
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 ${
                    isComplete ? "bg-green-500 text-white" : "bg-[#2d287f]/10 text-[#2d287f]"
                  }`}>
                    {isComplete ? "✓" : idx + 1}
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-800">{mod.module_title}</h3>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {mod.completed_lessons || 0} / {mod.total_lessons || 0} leçons
                      {mod.total_minutes > 0 && ` · ${Math.round(mod.total_minutes)}min`}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <span className={`text-lg font-bold ${isComplete ? "text-green-600" : "text-indigo-700"}`}>
                    {modPct}%
                  </span>
                </div>
              </div>

              {/* Barre de progression module */}
              <div className="px-5 pb-4">
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      isComplete ? "bg-green-500" : "bg-gradient-to-r from-[#2d287f] to-[#5653e1]"
                    }`}
                    style={{ width: `${modPct}%` }}
                  />
                </div>

                {/* Leçons si disponibles */}
                {(mod.lessons || []).length > 0 && (
                  <div className="mt-3 space-y-1.5">
                    {mod.lessons.map((lesson, li) => (
                      <div key={lesson.id || li} className="flex items-center gap-2.5 text-sm py-1">
                        <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs flex-shrink-0 border ${
                          lesson.completed
                            ? "bg-green-500 border-green-500 text-white"
                            : "border-gray-300 text-gray-400"
                        }`}>
                          {lesson.completed ? "✓" : li + 1}
                        </span>
                        <span className={lesson.completed ? "text-gray-600 line-through" : "text-gray-700"}>
                          {lesson.title}
                        </span>
                        {lesson.duration_minutes && (
                          <span className="ml-auto text-gray-400 text-xs">{lesson.duration_minutes}min</span>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {/* ── CTA ─────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <button
            onClick={() => navigate(`/courses/${course?.id || id}/learn`)}
            className="flex-1 py-3 bg-[#2d287f] hover:bg-[#3b3aab] text-white rounded-xl font-semibold text-sm transition text-center"
          >
            ▶ Continuer le cours
          </button>
          <button
            onClick={() => navigate("/student")}
            className="flex-1 py-3 border border-gray-200 text-gray-600 hover:bg-gray-50 rounded-xl font-semibold text-sm transition text-center"
          >
            ← Mon dashboard
          </button>
        </div>

        {/* ── Section Avis ─────────────────────────────── */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <CourseReviews courseId={id} isEnrolled={true} />
        </div>

      </div>
    </div>
  );
}