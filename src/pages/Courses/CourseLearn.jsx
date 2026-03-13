// src/pages/Courses/CourseLearn.jsx
// ✅ Adapté à la vraie structure BDD : content_url (pas video_url), content_type
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { usePermissions } from "../../contexts/PermissionContext";
import api from "../../api/api";

export default function CourseLearn() {
  const { id }      = useParams();
  const navigate    = useNavigate();
  const { canAccessCourseContent, isAdmin, isInstructor } = usePermissions();

  const [course,           setCourse]        = useState(null);
  const [modules,          setModules]       = useState([]);
  const [activeLesson,     setActiveLesson]  = useState(null);
  const [completedLessons, setCompleted]     = useState(new Set());
  const [sidebarOpen,      setSidebarOpen]   = useState(true);
  const [loading,          setLoading]       = useState(true);
  const [accessDenied,     setAccessDenied]  = useState(false);
  const [completing,       setCompleting]    = useState(false);
  const [courseFinished,   setCourseFinished]= useState(false);

  // ✅ Reset complet à chaque changement de cours
  useEffect(() => {
    setLoading(true);
    setActiveLesson(null);
    setModules([]);
    setCourse(null);
    setCompleted(new Set());
    setCourseFinished(false);
    setAccessDenied(false);
    fetchCourse();
  }, [id]); // eslint-disable-line

  const fetchCourse = async () => {
    try {
      if (!canAccessCourseContent(id) && !isAdmin() && !isInstructor()) {
        setAccessDenied(true);
        return;
      }

      const [courseRes, modulesRes] = await Promise.all([
        api.get(`/courses/${id}`),
        api.get(`/courses/${id}/modules`),
      ]);

      const courseData  = courseRes.data?.data || courseRes.data;
      const raw         = modulesRes.data?.data || modulesRes.data;
      const modulesData = Array.isArray(raw) ? raw : (raw?.modules || raw?.content || []);

      setCourse(courseData);
      setModules(modulesData);

      // Leçons complétées depuis les modules
      let doneIds = new Set(
        modulesData.flatMap(m =>
          (m.lessons || [])
            .filter(l => l.is_completed === 1 || l.is_completed === true)
            .map(l => l.id)
        )
      );

      // Enrichir via /progress
      try {
        const progressRes  = await api.get(`/courses/${id}/progress`);
        const progressData = progressRes.data?.data || [];
        const fromProgress = new Set(
          progressData.flatMap(m =>
            (m.lessons || [])
              .filter(l => l.completed || l.is_completed)
              .map(l => l.id)
          )
        );
        if (fromProgress.size > 0) doneIds = fromProgress;
      } catch (_) {}

      setCompleted(doneIds);

      const allLessons = modulesData.flatMap(m => m.lessons || []);

      // ✅ Reprendre la 1ère leçon non terminée
      if (allLessons.length > 0) {
        const nextLesson = allLessons.find(l => !doneIds.has(l.id));
        setActiveLesson(nextLesson || allLessons[allLessons.length - 1]);
      }

      if (allLessons.length > 0 && doneIds.size >= allLessons.length) {
        setCourseFinished(true);
      }
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
      const res = await api.post(`/courses/${id}/lessons/${activeLesson.id}/complete`);
      const newCompleted = new Set([...completedLessons, activeLesson.id]);
      setCompleted(newCompleted);

      if (res.data?.data?.course_completed) {
        setCourseFinished(true);
      } else {
        goToNextLesson();
      }
    } catch (err) {
      console.error("markComplete:", err);
    } finally {
      setCompleting(false);
    }
  };

  const goToNextLesson = () => {
    const all = modules.flatMap(m => m.lessons || []);
    const idx = all.findIndex(l => l.id === activeLesson?.id);
    if (idx >= 0 && idx < all.length - 1) setActiveLesson(all[idx + 1]);
  };

  const goToPrevLesson = () => {
    const all = modules.flatMap(m => m.lessons || []);
    const idx = all.findIndex(l => l.id === activeLesson?.id);
    if (idx > 0) setActiveLesson(all[idx - 1]);
  };

  // ✅ Détecter le type de contenu et afficher en conséquence
  const renderLessonContent = (lesson) => {
    const url  = lesson.content_url || lesson.video_url;
    const type = lesson.content_type || "video";

    return (
      <div className="space-y-6">
        {/* Vidéo / URL */}
        {url && (type === "video" || type === "article") && (
          <div className="rounded-xl overflow-hidden bg-black aspect-video">
            {url.includes("youtube") || url.includes("youtu.be") ? (
              <iframe
                key={url}
                src={url.replace("watch?v=", "embed/").replace("youtu.be/", "youtube.com/embed/")}
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            ) : url.match(/\.(mp4|webm|ogg)$/i) ? (
              <video key={url} src={url} controls className="w-full h-full" />
            ) : (
              <iframe key={url} src={url} className="w-full h-full" />
            )}
          </div>
        )}

        {/* Contenu texte / article */}
        {lesson.article_content && (
          <div className="prose prose-invert max-w-none text-gray-300 leading-relaxed">
            <div dangerouslySetInnerHTML={{ __html: lesson.article_content }} />
          </div>
        )}

        {/* Téléchargement */}
        {url && type === "download" && (
          <div className="bg-gray-800 rounded-xl p-5 flex items-center gap-4">
            <div className="text-3xl">📥</div>
            <div className="flex-1">
              <p className="text-white font-semibold text-sm">{lesson.title}</p>
              <p className="text-gray-400 text-xs mt-0.5">Ressource téléchargeable</p>
            </div>
            <a href={url} download target="_blank" rel="noopener noreferrer"
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl transition">
              Télécharger
            </a>
          </div>
        )}

        {/* Quiz placeholder */}
        {type === "quiz" && (
          <div className="bg-gray-800 rounded-xl p-8 text-center">
            <div className="text-4xl mb-3">📝</div>
            <p className="text-white font-semibold">Quiz</p>
            <p className="text-gray-400 text-sm mt-1">Le quiz est disponible dans l'onglet Quiz du cours.</p>
          </div>
        )}

        {/* Ressources attachées */}
        {lesson.resources?.length > 0 && (
          <div className="bg-gray-800 rounded-xl p-4">
            <p className="text-gray-300 font-semibold text-sm mb-3">📎 Ressources</p>
            <ul className="space-y-2">
              {lesson.resources.map((r, i) => (
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
      </div>
    );
  };

  const allLessons   = modules.flatMap(m => m.lessons || []);
  const totalLessons = allLessons.length;
  const doneCount    = completedLessons.size;
  const progressPct  = totalLessons > 0 ? Math.round((doneCount / totalLessons) * 100) : 0;
  const currentIdx   = allLessons.findIndex(l => l.id === activeLesson?.id);

  if (loading) return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center">
      <div className="text-center text-white space-y-3">
        <div className="w-12 h-12 border-4 border-indigo-400 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-gray-400 text-sm">Chargement du cours...</p>
      </div>
    </div>
  );

  if (accessDenied) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center">
        <div className="text-5xl mb-4">🔒</div>
        <h2 className="text-xl font-bold text-gray-800 mb-2">Accès non autorisé</h2>
        <p className="text-gray-500 text-sm mb-6">
          Vous n'avez pas encore accès à ce cours.
        </p>
        <div className="flex gap-3">
          <button onClick={() => navigate(-1)} className="flex-1 py-2.5 border border-gray-200 rounded-xl text-gray-600 text-sm hover:bg-gray-50 transition">← Retour</button>
          <button onClick={() => navigate(`/courses/${id}`)} className="flex-1 py-2.5 bg-indigo-700 text-white rounded-xl text-sm font-semibold hover:bg-indigo-800 transition">Voir le cours</button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col">

      {/* ── Bannière 100% ── */}
      {courseFinished && (
        <div className="bg-gradient-to-r from-yellow-500 to-yellow-400 text-indigo-900 px-4 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🎉</span>
            <div>
              <p className="font-bold text-sm">Félicitations ! Cours terminé à 100%.</p>
              <p className="text-xs opacity-75">Votre certificat a été généré automatiquement.</p>
            </div>
          </div>
          <button onClick={() => navigate("/student/certificates")}
            className="flex-shrink-0 bg-indigo-900 text-yellow-400 text-xs font-bold px-4 py-2 rounded-xl hover:bg-indigo-800 transition">
            Voir mon certificat →
          </button>
        </div>
      )}

      {/* ── Top bar ── */}
      <header className="bg-gray-800 border-b border-gray-700 px-4 py-3 flex items-center gap-4 z-10">
        <button onClick={() => navigate("/student")}
          className="text-gray-400 hover:text-white transition text-sm flex items-center gap-1.5 flex-shrink-0">
          ← Tableau de bord
        </button>
        <div className="flex-1 min-w-0">
          <h1 className="text-white font-semibold text-sm truncate">{course?.title}</h1>
          {activeLesson && <p className="text-gray-400 text-xs truncate">{activeLesson.title}</p>}
        </div>
        <div className="hidden sm:flex items-center gap-3 flex-shrink-0">
          <div className="w-32 h-1.5 bg-gray-700 rounded-full overflow-hidden">
            <div className="h-full bg-indigo-500 rounded-full transition-all duration-500" style={{ width: `${progressPct}%` }} />
          </div>
          <span className="text-gray-400 text-xs whitespace-nowrap">{doneCount}/{totalLessons}</span>
        </div>
        <button onClick={() => setSidebarOpen(p => !p)}
          className="flex-shrink-0 text-gray-400 hover:text-white transition text-xs border border-gray-600 rounded-lg px-2.5 py-1.5">
          {sidebarOpen ? "Masquer" : "Sommaire"}
        </button>
      </header>

      <div className="flex flex-1 overflow-hidden">

        {/* ── Sidebar ── */}
        {sidebarOpen && (
          <aside className="w-72 bg-gray-800 border-r border-gray-700 overflow-y-auto flex-shrink-0">
            <div className="p-4 border-b border-gray-700">
              <p className="text-gray-400 text-xs font-semibold uppercase tracking-wider">Contenu du cours</p>
              <div className="mt-2 h-1.5 bg-gray-700 rounded-full overflow-hidden">
                <div className="h-full bg-indigo-500 rounded-full transition-all duration-500" style={{ width: `${progressPct}%` }} />
              </div>
              <p className="text-gray-500 text-xs mt-1">{progressPct}% · {doneCount}/{totalLessons} leçons</p>
            </div>

            {modules.length === 0
              ? <div className="p-6 text-center text-gray-500 text-sm">Aucun module disponible</div>
              : modules.map((mod, mi) => (
                <div key={mod.id} className="border-b border-gray-700/50">
                  <div className="px-4 py-3">
                    <p className="text-gray-300 text-xs font-bold uppercase tracking-wide">
                      Module {mi + 1} · {mod.title}
                    </p>
                  </div>
                  {(mod.lessons || []).map((lesson, li) => {
                    const isDone   = completedLessons.has(lesson.id);
                    const isActive = activeLesson?.id === lesson.id;
                    // Icône selon content_type
                    const typeIcon = { video:"▶", article:"📄", quiz:"📝", exercise:"⚡", download:"📥" }[lesson.content_type] || "▶";
                    return (
                      <button key={lesson.id} onClick={() => handleSelectLesson(lesson)}
                        className={`w-full text-left px-4 py-2.5 flex items-center gap-3 transition text-sm ${
                          isActive ? "bg-indigo-600/20 border-l-2 border-indigo-500 text-white"
                                   : "text-gray-400 hover:bg-gray-700/30"
                        }`}>
                        <span className={`w-5 h-5 rounded-full flex-shrink-0 flex items-center justify-center text-xs border ${
                          isDone   ? "bg-green-500 border-green-500 text-white"
                          : isActive ? "border-indigo-400 text-indigo-400"
                                     : "border-gray-600 text-gray-600"
                        }`}>
                          {isDone ? "✓" : typeIcon}
                        </span>
                        <span className="truncate">{lesson.title}</span>
                        {lesson.duration_minutes > 0 && (
                          <span className="ml-auto text-gray-600 text-xs flex-shrink-0">{lesson.duration_minutes}min</span>
                        )}
                      </button>
                    );
                  })}
                </div>
              ))
            }
          </aside>
        )}

        {/* ── Contenu ── */}
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
              {/* Titre */}
              <div className="mb-6">
                <p className="text-indigo-400 text-xs font-semibold uppercase tracking-wider mb-1">
                  {modules.find(m => (m.lessons || []).some(l => l.id === activeLesson.id))?.title}
                </p>
                <h2 className="text-white text-2xl font-bold">{activeLesson.title}</h2>
                {activeLesson.duration_minutes > 0 && (
                  <p className="text-gray-400 text-sm mt-1">⏱ {activeLesson.duration_minutes} min</p>
                )}
              </div>

              {/* Contenu selon type */}
              {renderLessonContent(activeLesson)}

              {/* Navigation */}
              <div className="flex flex-col sm:flex-row gap-3 pt-6 mt-6 border-t border-gray-700">
                <button onClick={goToPrevLesson} disabled={currentIdx <= 0}
                  className="flex-1 py-3 border border-gray-600 text-gray-300 rounded-xl text-sm font-medium hover:bg-gray-700 transition disabled:opacity-30">
                  ← Précédente
                </button>

                {completedLessons.has(activeLesson.id) ? (
                  <div className="flex-1 py-3 bg-green-600/20 border border-green-600/30 text-green-400 rounded-xl text-sm font-medium text-center">
                    ✓ Leçon terminée
                  </div>
                ) : (
                  <button onClick={handleMarkComplete} disabled={completing}
                    className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold transition disabled:opacity-60">
                    {completing ? "Enregistrement..." : "✓ Marquer comme terminée →"}
                  </button>
                )}

                <button onClick={goToNextLesson} disabled={currentIdx >= totalLessons - 1}
                  className="flex-1 py-3 border border-gray-600 text-gray-300 rounded-xl text-sm font-medium hover:bg-gray-700 transition disabled:opacity-30">
                  Suivante →
                </button>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}