// src/pages/Courses/CourseLearn.jsx
import { useState, useEffect, useRef, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { usePermissions } from "../../contexts/PermissionContext";
import api from "../../api/api";
import {
  CheckCircle, ChevronLeft, ChevronRight, ChevronDown,
  PlayCircle, BookOpen, Clock, Menu, X, Trophy,
  FileText, Download, BarChart2, Award, Lock, Layers,
  Volume2, Youtube, ExternalLink, ArrowLeft, RefreshCw,
  Check, Circle, Info
} from "lucide-react";

/* ── Type d'icône de leçon ── */
function LessonTypeIcon({ type, className = "w-3.5 h-3.5" }) {
  if (type === "video")   return <PlayCircle className={`${className} text-indigo-400`} />;
  if (type === "quiz")    return <FileText    className={`${className} text-purple-400`} />;
  if (type === "text")    return <BookOpen    className={`${className} text-blue-400`} />;
  if (type === "audio")   return <Volume2     className={`${className} text-green-400`} />;
  return <BookOpen className={`${className} text-gray-400`} />;
}

/* ── Progress ring header ── */
function ProgressBar({ value, total }) {
  const pct = total > 0 ? Math.round((value / total) * 100) : 0;
  return (
    <div className="flex items-center gap-2">
      <div className="w-24 h-1.5 bg-gray-700 rounded-full overflow-hidden">
        <div className="h-full bg-gradient-to-r from-indigo-400 to-purple-400 rounded-full transition-all"
          style={{ width:`${pct}%` }} />
      </div>
      <span className="text-gray-400 text-xs whitespace-nowrap font-semibold">{value}/{total}</span>
    </div>
  );
}

/* ── Lesson Preview Card (sidebar) ── */
function LessonItem({ lesson, index, isActive, isDone, onSelect }) {
  return (
    <button onClick={() => onSelect(lesson)}
      className={`w-full text-left px-4 py-3 flex items-center gap-3 transition-all group relative
        ${isActive
          ? "bg-indigo-600/20 border-l-2 border-indigo-400"
          : "hover:bg-white/5 border-l-2 border-transparent"
        }`}>
      {/* Indicateur */}
      <div className={`flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold transition-all
        ${isDone   ? "bg-emerald-500 text-white border-0"
        : isActive ? "bg-indigo-500 text-white border-0"
                   : "border border-gray-600 text-gray-600 group-hover:border-gray-500"}`}>
        {isDone ? <Check className="w-3 h-3" /> : <span>{index + 1}</span>}
      </div>

      <div className="flex-1 min-w-0">
        <p className={`text-xs font-semibold truncate transition-colors
          ${isActive ? "text-white" : isDone ? "text-gray-400" : "text-gray-300 group-hover:text-white"}`}>
          {lesson.title}
        </p>
        <div className="flex items-center gap-1.5 mt-0.5">
          <LessonTypeIcon type={lesson.lesson_type} className="w-3 h-3" />
          {lesson.duration_minutes && (
            <span className="text-gray-600 text-xs">{lesson.duration_minutes}min</span>
          )}
          {isDone && <span className="text-emerald-500 text-xs font-semibold">Terminée</span>}
        </div>
      </div>
    </button>
  );
}

/* ── MAIN COMPONENT ── */
export default function CourseLearn() {
  const { id }    = useParams();
  const navigate  = useNavigate();
  const { token } = useAuth();
  const { canAccessCourseContent, isAdmin, isInstructor } = usePermissions();

  const [course,        setCourse]      = useState(null);
  const [modules,       setModules]     = useState([]);
  const [activeLesson,  setActive]      = useState(null);
  const [completed,     setCompleted]   = useState(new Set());
  const [sidebarOpen,   setSidebar]     = useState(true);
  const [loading,       setLoading]     = useState(true);
  const [accessDenied,  setDenied]      = useState(false);
  const [marking,       setMarking]     = useState(false);
  const [expandedMods,  setExpanded]    = useState({});
  const [showFinish,    setShowFinish]  = useState(false);
  const contentRef = useRef(null);

  useEffect(() => { fetchData(); }, [id]);
  useEffect(() => { contentRef.current?.scrollTo({ top:0, behavior:"smooth" }); }, [activeLesson?.id]);

  const fetchData = async () => {
    setLoading(true);
    try {
      if (!canAccessCourseContent(id) && !isAdmin() && !isInstructor()) {
        setDenied(true); setLoading(false); return;
      }

      const [courseRes, modRes] = await Promise.all([
        api.get(`/courses/${id}`),
        api.get(`/courses/${id}/modules`),
      ]);
      const course = courseRes.data?.data || courseRes.data;
      const raw    = modRes.data?.data || modRes.data;
      const mods   = Array.isArray(raw) ? raw : (raw?.modules || raw?.content || []);

      setCourse(course);
      setModules(mods);

      // Tous les modules ouverts par défaut
      const exp = {};
      mods.forEach(m => { exp[m.id] = true; });
      setExpanded(exp);

      // Leçons terminées
      const doneSet = new Set(
        mods.flatMap(m =>
          (m.lessons || []).filter(l => l.is_completed === 1 || l.is_completed === true).map(l => l.id)
        )
      );
      setCompleted(doneSet);

      // Enrichir via /progress
      try {
        const progRes = await api.get(`/courses/${id}/progress`);
        const ids = new Set(
          (progRes.data?.data || []).flatMap(m =>
            (m.lessons || []).filter(l => l.completed || l.is_completed).map(l => l.id)
          )
        );
        if (ids.size > 0) setCompleted(ids);
      } catch (_) {}

      // Reprendre à la dernière leçon non terminée
      const allLessons = mods.flatMap(m => m.lessons || []);
      const resume = allLessons.find(l => !doneSet.has(l.id)) || allLessons[0];
      if (resume) setActive(resume);

    } catch (err) {
      console.error("CourseLearn:", err);
      if (err.response?.status === 403) setDenied(true);
    } finally {
      setLoading(false);
    }
  };

  const selectLesson = (lesson) => {
    setActive(lesson);
    if (window.innerWidth < 768) setSidebar(false);
    setShowFinish(false);
  };

  const markComplete = async () => {
    if (!activeLesson || marking) return;
    setMarking(true);
    try {
      await api.post(`/courses/${id}/lessons/${activeLesson.id}/complete`);
      const newCompleted = new Set([...completed, activeLesson.id]);
      setCompleted(newCompleted);

      const allLessons = modules.flatMap(m => m.lessons || []);
      if (newCompleted.size >= allLessons.length) {
        setShowFinish(true);
      } else {
        goNext(activeLesson);
      }
    } catch (err) {
      console.error("markComplete:", err);
    } finally {
      setMarking(false);
    }
  };

  const allLessons = useMemo(() => modules.flatMap(m => m.lessons || []), [modules]);

  const goNext = (lesson = activeLesson) => {
    const idx = allLessons.findIndex(l => l.id === lesson?.id);
    if (idx < allLessons.length - 1) setActive(allLessons[idx + 1]);
  };
  const goPrev = () => {
    const idx = allLessons.findIndex(l => l.id === activeLesson?.id);
    if (idx > 0) setActive(allLessons[idx - 1]);
  };

  const activeIdx   = allLessons.findIndex(l => l.id === activeLesson?.id);
  const doneCount   = completed.size;
  const totalCount  = allLessons.length;
  const progressPct = totalCount > 0 ? Math.round((doneCount / totalCount) * 100) : 0;

  const activeModule = useMemo(() =>
    modules.find(m => (m.lessons || []).some(l => l.id === activeLesson?.id))
  , [modules, activeLesson]);

  /* ── Loading ── */
  if (loading) return (
    <div className="min-h-screen bg-[#0f0f1a] flex items-center justify-center">
      <div className="text-center">
        <RefreshCw className="w-10 h-10 text-indigo-400 animate-spin mx-auto mb-3" />
        <p className="text-gray-400 text-sm">Chargement du cours...</p>
      </div>
    </div>
  );

  /* ── Accès refusé ── */
  if (accessDenied) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center">
        <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Lock className="w-8 h-8 text-red-500" />
        </div>
        <h2 className="text-xl font-black text-gray-800 mb-2">Accès non autorisé</h2>
        <p className="text-gray-500 text-sm mb-6">
          Vous n'avez pas encore accès à ce cours. Inscrivez-vous et attendez la validation de votre paiement.
        </p>
        <div className="flex gap-3">
          <button onClick={() => navigate(-1)}
            className="flex-1 py-2.5 border border-gray-200 rounded-xl text-gray-600 text-sm font-semibold hover:bg-gray-50 transition">
            ← Retour
          </button>
          <button onClick={() => navigate(`/courses/${id}`)}
            className="flex-1 py-2.5 bg-indigo-700 text-white rounded-xl text-sm font-bold hover:bg-indigo-800 transition">
            Voir le cours
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0f0f1a] flex flex-col" style={{ fontFamily:"'Inter', system-ui, sans-serif" }}>

      {/* ══════ TOP BAR ══════ */}
      <header className="bg-[#1a1a2e] border-b border-white/10 px-4 py-2.5 flex items-center gap-3 z-20 flex-shrink-0">
        <button onClick={() => navigate("/dashboard")}
          className="flex items-center gap-1.5 text-gray-400 hover:text-white transition text-xs font-semibold flex-shrink-0">
          <ArrowLeft className="w-3.5 h-3.5" /> Tableau de bord
        </button>

        <div className="w-px h-4 bg-white/10 flex-shrink-0" />

        <div className="flex-1 min-w-0">
          <p className="text-white text-xs font-bold truncate leading-tight">{course?.title}</p>
          {activeLesson && (
            <p className="text-gray-500 text-xs truncate">
              {activeModule?.title} · {activeLesson.title}
            </p>
          )}
        </div>

        <div className="hidden sm:flex items-center gap-3">
          <ProgressBar value={doneCount} total={totalCount} />
          <span className="text-gray-500 text-xs font-semibold">{progressPct}%</span>
        </div>

        <button onClick={() => navigate(`/courses/${id}/progress`)}
          className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 border border-white/10 hover:bg-white/5 rounded-lg text-gray-400 hover:text-white transition text-xs font-semibold">
          <BarChart2 className="w-3 h-3" /> Progression
        </button>

        <button onClick={() => setSidebar(p => !p)}
          className="p-1.5 border border-white/10 hover:bg-white/5 rounded-lg text-gray-400 hover:text-white transition flex-shrink-0"
          title={sidebarOpen ? "Masquer le sommaire" : "Afficher le sommaire"}>
          {sidebarOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
        </button>
      </header>

      <div className="flex flex-1 overflow-hidden">

        {/* ══════ SIDEBAR ══════ */}
        {sidebarOpen && (
          <aside className="w-72 bg-[#13131f] border-r border-white/10 flex flex-col flex-shrink-0 z-10">
            {/* Header sidebar */}
            <div className="px-4 py-3 border-b border-white/10 flex-shrink-0">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Contenu du cours</p>
                <span className="text-xs text-indigo-400 font-bold">{progressPct}%</span>
              </div>
              <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-700"
                  style={{ width:`${progressPct}%` }} />
              </div>
              <p className="text-gray-600 text-xs mt-1">{doneCount}/{totalCount} leçons terminées</p>
            </div>

            {/* Liste des modules/leçons */}
            <div className="flex-1 overflow-y-auto">
              {modules.length === 0 ? (
                <div className="p-8 text-center text-gray-600 text-sm">Aucun module disponible</div>
              ) : modules.map((mod, mi) => {
                const modLessons = mod.lessons || [];
                const modDone    = modLessons.filter(l => completed.has(l.id)).length;
                const modPct     = modLessons.length > 0 ? Math.round((modDone / modLessons.length) * 100) : 0;
                const isOpen     = expandedMods[mod.id] !== false;

                return (
                  <div key={mod.id}>
                    {/* En-tête module */}
                    <button
                      onClick={() => setExpanded(p => ({ ...p, [mod.id]: !isOpen }))}
                      className="w-full px-4 py-3 flex items-center gap-2 hover:bg-white/5 transition group"
                    >
                      <div className={`flex-shrink-0 w-6 h-6 rounded-lg flex items-center justify-center text-xs font-black
                        ${modPct === 100 ? "bg-emerald-500 text-white" : "bg-white/10 text-gray-400"}`}>
                        {modPct === 100 ? <Check className="w-3 h-3" /> : mi + 1}
                      </div>
                      <div className="flex-1 min-w-0 text-left">
                        <p className="text-xs font-bold text-gray-300 truncate group-hover:text-white transition">
                          {mod.title}
                        </p>
                        <p className="text-xs text-gray-600">{modDone}/{modLessons.length} · {modPct}%</p>
                      </div>
                      <ChevronDown className={`w-3.5 h-3.5 text-gray-600 transition-transform flex-shrink-0 ${isOpen ? "" : "-rotate-90"}`} />
                    </button>

                    {/* Leçons */}
                    {isOpen && modLessons.map((lesson, li) => (
                      <LessonItem
                        key={lesson.id}
                        lesson={lesson}
                        index={li}
                        isActive={activeLesson?.id === lesson.id}
                        isDone={completed.has(lesson.id)}
                        onSelect={selectLesson}
                      />
                    ))}
                  </div>
                );
              })}
            </div>
          </aside>
        )}

        {/* ══════ MAIN CONTENT ══════ */}
        <main ref={contentRef} className="flex-1 overflow-y-auto">
          {!activeLesson ? (
            <div className="h-full flex items-center justify-center">
              <div className="text-center">
                <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <BookOpen className="w-8 h-8 text-gray-600" />
                </div>
                <p className="text-gray-400 font-semibold">Sélectionnez une leçon pour commencer</p>
              </div>
            </div>
          ) : (

            <div className="max-w-4xl mx-auto px-4 py-8">

              {/* ── Breadcrumb leçon ── */}
              <div className="mb-5">
                <div className="flex items-center gap-2 text-xs text-gray-500 mb-2">
                  <Layers className="w-3 h-3" />
                  <span>{activeModule?.title}</span>
                  <ChevronRight className="w-3 h-3" />
                  <span className="text-gray-400">Leçon {activeIdx + 1}/{totalCount}</span>
                </div>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h2 className="text-white text-2xl font-black leading-tight">{activeLesson.title}</h2>
                    <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                      {activeLesson.duration_minutes && (
                        <span className="flex items-center gap-1 text-gray-500 text-xs">
                          <Clock className="w-3 h-3" /> {activeLesson.duration_minutes} min
                        </span>
                      )}
                      {activeLesson.lesson_type && (
                        <span className="flex items-center gap-1 text-gray-500 text-xs">
                          <LessonTypeIcon type={activeLesson.lesson_type} />
                          <span className="capitalize">{activeLesson.lesson_type}</span>
                        </span>
                      )}
                      {completed.has(activeLesson.id) && (
                        <span className="flex items-center gap-1 text-emerald-400 text-xs font-bold">
                          <CheckCircle className="w-3.5 h-3.5" /> Terminée
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* ── Description courte ── */}
              {activeLesson.short_description && (
                <div className="mb-5 bg-indigo-500/10 border border-indigo-500/20 rounded-xl px-4 py-3 flex items-start gap-2.5">
                  <Info className="w-4 h-4 text-indigo-400 flex-shrink-0 mt-0.5" />
                  <p className="text-indigo-200 text-sm leading-relaxed">{activeLesson.short_description}</p>
                </div>
              )}

              {/* ── Vidéo ── */}
              {activeLesson.video_url && (
                <div className="mb-6 rounded-2xl overflow-hidden bg-black shadow-2xl shadow-black/50">
                  <div className="relative w-full" style={{ paddingTop:"56.25%" }}>
                    {(activeLesson.video_url.includes("youtube") || activeLesson.video_url.includes("youtu.be")) ? (
                      <iframe
                        src={activeLesson.video_url
                          .replace("watch?v=", "embed/")
                          .replace("youtu.be/", "youtube.com/embed/")
                          + "?rel=0&modestbranding=1"}
                        className="absolute inset-0 w-full h-full"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        title={activeLesson.title}
                      />
                    ) : (
                      <video src={activeLesson.video_url} controls
                        className="absolute inset-0 w-full h-full"
                        controlsList="nodownload" />
                    )}
                  </div>
                </div>
              )}

              {/* ── Contenu texte enrichi ── */}
              {activeLesson.content && (
                <div className="mb-8 bg-[#1a1a2e] rounded-2xl border border-white/10 overflow-hidden">
                  <div className="px-5 py-3 border-b border-white/10 flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-indigo-400" />
                    <p className="text-sm font-bold text-gray-300">Contenu de la leçon</p>
                  </div>
                  <div className="p-6">
                    <div
                      className="text-gray-300 leading-relaxed text-sm
                        [&_h1]:text-white [&_h1]:text-xl [&_h1]:font-black [&_h1]:mb-3 [&_h1]:mt-5
                        [&_h2]:text-white [&_h2]:text-lg [&_h2]:font-black [&_h2]:mb-2 [&_h2]:mt-4
                        [&_h3]:text-gray-100 [&_h3]:font-bold [&_h3]:mb-2 [&_h3]:mt-3
                        [&_p]:mb-3 [&_p]:leading-relaxed
                        [&_ul]:mb-3 [&_ul]:pl-5 [&_ul]:space-y-1
                        [&_ol]:mb-3 [&_ol]:pl-5 [&_ol]:space-y-1
                        [&_li]:text-gray-300 [&_li]:leading-relaxed
                        [&_code]:bg-white/10 [&_code]:text-purple-300 [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded [&_code]:text-xs [&_code]:font-mono
                        [&_pre]:bg-black/40 [&_pre]:border [&_pre]:border-white/10 [&_pre]:rounded-xl [&_pre]:p-4 [&_pre]:overflow-x-auto [&_pre]:mb-4
                        [&_pre_code]:bg-transparent [&_pre_code]:text-green-300 [&_pre_code]:text-xs
                        [&_blockquote]:border-l-2 [&_blockquote]:border-indigo-500 [&_blockquote]:pl-4 [&_blockquote]:text-gray-400 [&_blockquote]:italic [&_blockquote]:my-4
                        [&_a]:text-indigo-400 [&_a]:underline [&_a]:hover:text-indigo-300
                        [&_strong]:text-white [&_strong]:font-bold
                        [&_img]:rounded-xl [&_img]:max-w-full [&_img]:my-4
                        [&_table]:w-full [&_table]:border-collapse [&_table]:mb-4
                        [&_th]:bg-white/10 [&_th]:text-gray-200 [&_th]:px-3 [&_th]:py-2 [&_th]:text-xs [&_th]:font-bold [&_th]:text-left [&_th]:border [&_th]:border-white/10
                        [&_td]:text-gray-400 [&_td]:px-3 [&_td]:py-2 [&_td]:text-xs [&_td]:border [&_td]:border-white/10
                        [&_hr]:border-white/10 [&_hr]:my-4"
                      dangerouslySetInnerHTML={{ __html: activeLesson.content }}
                    />
                  </div>
                </div>
              )}

              {/* ── Message si leçon vide ── */}
              {!activeLesson.video_url && !activeLesson.content && (
                <div className="mb-8 bg-[#1a1a2e] rounded-2xl border border-white/10 p-12 text-center">
                  <div className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <BookOpen className="w-7 h-7 text-gray-600" />
                  </div>
                  <p className="text-gray-500 font-semibold">Le contenu de cette leçon sera bientôt disponible.</p>
                </div>
              )}

              {/* ── Ressources ── */}
              {activeLesson.resources?.length > 0 && (
                <div className="mb-6 bg-[#1a1a2e] rounded-2xl border border-white/10 overflow-hidden">
                  <div className="px-5 py-3 border-b border-white/10 flex items-center gap-2">
                    <Download className="w-4 h-4 text-indigo-400" />
                    <p className="text-sm font-bold text-gray-300">Ressources à télécharger</p>
                  </div>
                  <div className="p-4 space-y-2">
                    {activeLesson.resources.map((r, i) => (
                      <a key={i} href={r.url} target="_blank" rel="noopener noreferrer"
                        className="flex items-center gap-3 px-4 py-3 bg-white/5 hover:bg-white/10 rounded-xl transition group">
                        <div className="w-8 h-8 bg-indigo-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                          <FileText className="w-4 h-4 text-indigo-400" />
                        </div>
                        <span className="text-gray-300 text-sm font-semibold group-hover:text-white transition flex-1">
                          {r.title || r.url}
                        </span>
                        <ExternalLink className="w-3.5 h-3.5 text-gray-600 group-hover:text-gray-400 transition flex-shrink-0" />
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {/* ── Félicitations fin de cours ── */}
              {showFinish && (
                <div className="mb-6 bg-gradient-to-r from-purple-600/20 to-indigo-600/20 border border-purple-500/30 rounded-2xl p-6 text-center">
                  <div className="w-16 h-16 bg-yellow-400 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-yellow-400/30">
                    <Trophy className="w-8 h-8 text-indigo-900" />
                  </div>
                  <h3 className="text-white text-xl font-black mb-2">🎉 Félicitations !</h3>
                  <p className="text-gray-300 text-sm mb-5">
                    Vous avez terminé toutes les leçons de <strong>{course?.title}</strong>.
                    Votre certificat est disponible dans votre profil.
                  </p>
                  <div className="flex gap-3 justify-center flex-wrap">
                    <button onClick={() => navigate("/certificates")}
                      className="px-5 py-2.5 bg-yellow-400 hover:bg-yellow-300 text-indigo-900 rounded-xl font-black text-sm transition flex items-center gap-2">
                      <Award className="w-4 h-4" /> Voir mon certificat
                    </button>
                    <button onClick={() => navigate("/dashboard")}
                      className="px-5 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl font-bold text-sm transition">
                      Mon tableau de bord
                    </button>
                  </div>
                </div>
              )}

              {/* ── Navigation ── */}
              <div className="flex gap-3 pt-5 border-t border-white/10">
                <button onClick={goPrev} disabled={activeIdx === 0}
                  className="flex items-center gap-2 px-4 py-3 border border-white/10 text-gray-400 rounded-xl text-sm font-semibold hover:bg-white/5 hover:text-white transition disabled:opacity-30 disabled:cursor-not-allowed">
                  <ChevronLeft className="w-4 h-4" /> Précédente
                </button>

                <div className="flex-1">
                  {completed.has(activeLesson.id) ? (
                    <div className="w-full py-3 bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 rounded-xl text-sm font-bold text-center flex items-center justify-center gap-2">
                      <CheckCircle className="w-4 h-4" /> Leçon terminée ✓
                    </div>
                  ) : (
                    <button onClick={markComplete} disabled={marking}
                      className="w-full py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-xl text-sm font-black transition disabled:opacity-60 flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/25">
                      {marking
                        ? <><RefreshCw className="w-4 h-4 animate-spin" /> Marquage...</>
                        : <><Check className="w-4 h-4" /> Marquer comme terminée &amp; continuer</>
                      }
                    </button>
                  )}
                </div>

                <button onClick={() => goNext()} disabled={activeIdx >= totalCount - 1}
                  className="flex items-center gap-2 px-4 py-3 border border-white/10 text-gray-400 rounded-xl text-sm font-semibold hover:bg-white/5 hover:text-white transition disabled:opacity-30 disabled:cursor-not-allowed">
                  Suivante <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}