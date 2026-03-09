// src/pages/Courses/CourseLearn.jsx
import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { usePermissions } from "../../contexts/PermissionContext";
import api from "../../api/api";

export default function CourseLearn() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, token } = useAuth();
  const { canAccessCourseContent, isAdmin, isInstructor } = usePermissions();

  const [course, setCourse]           = useState(null);
  const [modules, setModules]         = useState([]);
  const [activeLesson, setActiveLesson] = useState(null);
  const [completedLessons, setCompleted] = useState(new Set());
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [loading, setLoading]         = useState(true);
  const [accessDenied, setAccessDenied] = useState(false);
  const [completing, setCompleting]   = useState(false);

  useEffect(() => { fetchCourse(); }, [id]);

  const fetchCourse = async () => {
    setLoading(true);
    try {
      // Vérifier accès
      if (!canAccessCourseContent(id) && !isAdmin() && !isInstructor()) {
        setAccessDenied(true);
        setLoading(false);
        return;
      }

      const [courseRes, modulesRes] = await Promise.all([
        api.get(`/courses/${id}`),
        api.get(`/courses/${id}/modules`)  // ✅ nouvelle route,
      ]);

      const courseData = courseRes.data?.data || courseRes.data;
      const raw = modulesRes.data?.data || modulesRes.data;
      const modulesData = Array.isArray(raw) ? raw : (raw?.modules || raw?.content || []);
      setCourse(courseData);
      setModules(modulesData);

      // Initialiser les leçons complétées depuis is_completed dans les modules
      const doneFromModules = new Set(
        modulesData.flatMap(m =>
          (m.lessons || [])
            .filter(l => l.is_completed === 1 || l.is_completed === true)
            .map(l => l.id)
        )
      );
      setCompleted(doneFromModules);

      // Enrichir via /progress si disponible
      try {
        const progressRes = await api.get(`/courses/${id}/progress`);
        const progressData = progressRes.data?.data || [];
        const doneIds = new Set(
          progressData.flatMap(m =>
            (m.lessons || [])
              .filter(l => l.completed || l.is_completed)
              .map(l => l.id)
          )
        );
        if (doneIds.size > 0) setCompleted(doneIds);
      } catch (_) {}

      // Sélectionner la première leçon
      const firstLesson = modulesData[0]?.lessons?.[0];
      if (firstLesson) setActiveLesson(firstLesson);

    } catch (err) {
      console.error("CourseLearn fetch:", err);
      if (err.response?.status === 403) setAccessDenied(true);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectLesson = (lesson) => {
    setActiveLesson(lesson);
    if (window.innerWidth < 768) setSidebarOpen(false);
  };

  const handleMarkComplete = async () => {
    if (!activeLesson || completing) return;
    setCompleting(true);
    try {
      await api.post(`/courses/${id}/lessons/${activeLesson.id}/complete`);
      setCompleted(prev => new Set([...prev, activeLesson.id]));
      // Passer à la leçon suivante automatiquement
      goToNextLesson();
    } catch (err) {
      console.error("markComplete:", err);
    } finally {
      setCompleting(false);
    }
  };

  const goToNextLesson = () => {
    const allLessons = modules.flatMap(m => m.lessons || []);
    const idx = allLessons.findIndex(l => l.id === activeLesson?.id);
    if (idx >= 0 && idx < allLessons.length - 1) {
      setActiveLesson(allLessons[idx + 1]);
    }
  };

  const goToPrevLesson = () => {
    const allLessons = modules.flatMap(m => m.lessons || []);
    const idx = allLessons.findIndex(l => l.id === activeLesson?.id);
    if (idx > 0) setActiveLesson(allLessons[idx - 1]);
  };

  const totalLessons    = modules.flatMap(m => m.lessons || []).length;
  const doneCount       = completedLessons.size;
  const progressPct     = totalLessons > 0 ? Math.round((doneCount / totalLessons) * 100) : 0;

  // ── Loading ───────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center text-white space-y-3">
          <div className="w-12 h-12 border-4 border-indigo-400 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-gray-400 text-sm">Chargement du cours...</p>
        </div>
      </div>
    );
  }

  // ── Accès refusé ──────────────────────────────────────
  if (accessDenied) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center">
          <div className="text-5xl mb-4">🔒</div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">Accès non autorisé</h2>
          <p className="text-gray-500 text-sm mb-6">
            Vous n'avez pas encore accès à ce cours. Inscrivez-vous et attendez la validation de votre paiement.
          </p>
          <div className="flex gap-3">
            <button onClick={() => navigate(-1)} className="flex-1 py-2.5 border border-gray-200 rounded-xl text-gray-600 text-sm hover:bg-gray-50 transition">
              ← Retour
            </button>
            <button onClick={() => navigate(`/courses/${id}`)} className="flex-1 py-2.5 bg-indigo-700 text-white rounded-xl text-sm font-semibold hover:bg-indigo-800 transition">
              Voir le cours
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col">

      {/* ── Top bar ──────────────────────────────────────── */}
      <header className="bg-gray-800 border-b border-gray-700 px-4 py-3 flex items-center gap-4 z-10">
        <button
          onClick={() => navigate("/dashboard")}
          className="text-gray-400 hover:text-white transition text-sm flex items-center gap-1.5"
        >
          ← Tableau de bord
        </button>
        <div className="flex-1 min-w-0">
          <h1 className="text-white font-semibold text-sm truncate">{course?.title}</h1>
          {activeLesson && (
            <p className="text-gray-400 text-xs truncate">{activeLesson.title}</p>
          )}
        </div>

        {/* Progression globale */}
        <div className="hidden sm:flex items-center gap-3">
          <div className="w-32 h-1.5 bg-gray-700 rounded-full overflow-hidden">
            <div className="h-full bg-indigo-500 rounded-full transition-all" style={{ width: `${progressPct}%` }} />
          </div>
          <span className="text-gray-400 text-xs whitespace-nowrap">{doneCount}/{totalLessons} leçons</span>
        </div>

        <button
          onClick={() => setSidebarOpen(p => !p)}
          className="text-gray-400 hover:text-white transition text-xs border border-gray-600 rounded-lg px-2.5 py-1.5"
        >
          {sidebarOpen ? "Masquer" : "Sommaire"}
        </button>
      </header>

      <div className="flex flex-1 overflow-hidden">

        {/* ── Sidebar sommaire ─────────────────────────────── */}
        {sidebarOpen && (
          <aside className="w-72 bg-gray-800 border-r border-gray-700 overflow-y-auto flex-shrink-0">
            <div className="p-4 border-b border-gray-700">
              <p className="text-gray-400 text-xs font-semibold uppercase tracking-wider">Contenu du cours</p>
              <div className="mt-2 h-1.5 bg-gray-700 rounded-full overflow-hidden">
                <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${progressPct}%` }} />
              </div>
              <p className="text-gray-500 text-xs mt-1">{progressPct}% terminé</p>
            </div>

            {modules.length === 0 ? (
              <div className="p-6 text-center text-gray-500 text-sm">Aucun module disponible</div>
            ) : modules.map((mod, mi) => (
              <div key={mod.id} className="border-b border-gray-700/50">
                <div className="px-4 py-3">
                  <p className="text-gray-300 text-xs font-bold uppercase tracking-wide">
                    Module {mi + 1} · {mod.title}
                  </p>
                </div>
                {(mod.lessons || []).map((lesson, li) => {
                  const isDone    = completedLessons.has(lesson.id);
                  const isActive  = activeLesson?.id === lesson.id;
                  return (
                    <button
                      key={lesson.id}
                      onClick={() => handleSelectLesson(lesson)}
                      className={`w-full text-left px-4 py-2.5 flex items-center gap-3 transition text-sm ${
                        isActive  ? "bg-indigo-600/20 border-l-2 border-indigo-500 text-white"
                        : isDone  ? "text-gray-400 hover:bg-gray-700/30"
                                  : "text-gray-400 hover:bg-gray-700/30"
                      }`}
                    >
                      <span className={`w-5 h-5 rounded-full flex-shrink-0 flex items-center justify-center text-xs border ${
                        isDone   ? "bg-green-500 border-green-500 text-white"
                        : isActive ? "border-indigo-400 text-indigo-400"
                                   : "border-gray-600 text-gray-600"
                      }`}>
                        {isDone ? "✓" : li + 1}
                      </span>
                      <span className="truncate">{lesson.title}</span>
                      {lesson.duration_minutes && (
                        <span className="ml-auto text-gray-600 text-xs flex-shrink-0">{lesson.duration_minutes}min</span>
                      )}
                    </button>
                  );
                })}
              </div>
            ))}
          </aside>
        )}

        {/* ── Contenu principal ────────────────────────────── */}
        <main className="flex-1 overflow-y-auto">
          {!activeLesson ? (
            <div className="h-full flex items-center justify-center text-gray-500">
              <div className="text-center">
                <div className="text-5xl mb-3">📖</div>
                <p>Sélectionnez une leçon pour commencer</p>
              </div>
            </div>
          ) : (
            <div className="max-w-4xl mx-auto px-4 py-8">

              {/* Titre leçon */}
              <div className="mb-6">
                <p className="text-indigo-400 text-xs font-semibold uppercase tracking-wider mb-1">
                  {modules.find(m => (m.lessons || []).some(l => l.id === activeLesson.id))?.title}
                </p>
                <h2 className="text-white text-2xl font-bold">{activeLesson.title}</h2>
                {activeLesson.duration_minutes && (
                  <p className="text-gray-400 text-sm mt-1">⏱ {activeLesson.duration_minutes} min</p>
                )}
              </div>

              {/* Vidéo */}
              {activeLesson.video_url && (
                <div className="mb-6 rounded-xl overflow-hidden bg-black aspect-video">
                  {activeLesson.video_url.includes("youtube") || activeLesson.video_url.includes("youtu.be") ? (
                    <iframe
                      src={activeLesson.video_url.replace("watch?v=", "embed/").replace("youtu.be/", "youtube.com/embed/")}
                      className="w-full h-full"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  ) : (
                    <video src={activeLesson.video_url} controls className="w-full h-full" />
                  )}
                </div>
              )}

              {/* Contenu texte */}
              {activeLesson.content && (
                <div className="prose prose-invert max-w-none mb-8 text-gray-300 leading-relaxed">
                  <div dangerouslySetInnerHTML={{ __html: activeLesson.content }} />
                </div>
              )}

              {/* Ressources */}
              {activeLesson.resources?.length > 0 && (
                <div className="mb-8 bg-gray-800 rounded-xl p-4">
                  <p className="text-gray-300 font-semibold text-sm mb-3">📎 Ressources</p>
                  <ul className="space-y-2">
                    {activeLesson.resources.map((r, i) => (
                      <li key={i}>
                        <a href={r.url} target="_blank" rel="noopener noreferrer"
                          className="text-indigo-400 hover:text-indigo-300 text-sm flex items-center gap-2 transition">
                          ↓ {r.title || r.url}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Navigation + Marquer terminée */}
              <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-700">
                <button
                  onClick={goToPrevLesson}
                  disabled={modules.flatMap(m => m.lessons || []).findIndex(l => l.id === activeLesson.id) === 0}
                  className="flex-1 py-3 border border-gray-600 text-gray-300 rounded-xl text-sm font-medium hover:bg-gray-700 transition disabled:opacity-30"
                >
                  ← Leçon précédente
                </button>

                {completedLessons.has(activeLesson.id) ? (
                  <div className="flex-1 py-3 bg-green-600/20 border border-green-600/30 text-green-400 rounded-xl text-sm font-medium text-center">
                    ✓ Leçon terminée
                  </div>
                ) : (
                  <button
                    onClick={handleMarkComplete}
                    disabled={completing}
                    className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold transition disabled:opacity-60"
                  >
                    {completing ? "..." : "✓ Marquer comme terminée →"}
                  </button>
                )}

                <button
                  onClick={goToNextLesson}
                  disabled={modules.flatMap(m => m.lessons || []).findIndex(l => l.id === activeLesson.id) >= totalLessons - 1}
                  className="flex-1 py-3 border border-gray-600 text-gray-300 rounded-xl text-sm font-medium hover:bg-gray-700 transition disabled:opacity-30"
                >
                  Leçon suivante →
                </button>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}