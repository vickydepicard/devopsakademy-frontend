// src/pages/Courses/CourseLearn.jsx — Design Udemy/OpenClassrooms
import { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { usePermissions } from "../../contexts/PermissionContext";
import { useAuth } from "../../contexts/AuthContext";
import api from "../../api/api";
import {
  ChevronLeft, ChevronRight, CheckCircle, Play,
  FileText, Brain, Zap, Film, Paperclip, Clock,
  Menu, X, Lock, AlertCircle, BarChart2, Home,
  ChevronDown, ChevronUp, Circle
} from "lucide-react";

// ─── Types de leçon ────────────────────────────────────────
const TYPE_ICON  = { video: Film, article: FileText, quiz: Brain, exercise: Zap };
const TYPE_COLOR = { video: "#5653e1", article: "#0ea5e9", quiz: "#a855f7", exercise: "#f97316" };

// ─── Helpers ───────────────────────────────────────────────
const getYtId = (url) => (url||"").match(/(?:v=|youtu\.be\/|embed\/)([^&?/]+)/)?.[1] || null;
const normalUrl = (url) => {
  if (!url) return null;
  if (url.startsWith("/")) return url;
  try {
    const u = new URL(url);
    if (u.hostname === "localhost" || u.hostname === "127.0.0.1") return u.pathname;
    return url;
  } catch { return url; }
};
const isPdf = (url) => /\.pdf(\?|$)/i.test(url||"");
const isVid = (url) => /\.(mp4|webm|ogg|mov)(\?|$)/i.test(url||"");
const fmtDur = (min) => !min ? "" : min < 60 ? `${min}min` : `${Math.floor(min/60)}h${min%60>0?`${min%60}m`:""}`;
const fmtSz  = (b) => !b ? "" : b<1048576 ? `${(b/1024).toFixed(0)} Ko` : `${(b/1048576).toFixed(1)} Mo`;

const EXT_INFO = {
  pdf:  { icon:"📄", label:"PDF" },
  docx: { icon:"📝", label:"Word" }, doc: { icon:"📝", label:"Word" },
  pptx: { icon:"📊", label:"Slides" }, ppt: { icon:"📊", label:"Slides" },
  xlsx: { icon:"📈", label:"Excel" }, zip: { icon:"📦", label:"ZIP" },
  mp4:  { icon:"🎬", label:"Vidéo" }, mp3: { icon:"🎵", label:"Audio" },
};
const extInfo = (url) => EXT_INFO[(url||"").split(".").pop().split("?")[0].toLowerCase()] || { icon:"📎", label:"Fichier" };

// ─── ArticleContent ────────────────────────────────────────
function ArticleContent({ content, resources=[], contentUrl=null }) {
  const resolved = normalUrl(contentUrl);
  const hasPdf   = isPdf(resolved||"");

  if (hasPdf && !content) {
    return (
      <div className="bg-gray-900 rounded-xl overflow-hidden" style={{height:640}}>
        <iframe
          src={`${resolved}#toolbar=0&navpanes=0&scrollbar=1&view=FitH`}
          className="w-full h-full border-none"
          title="Document"
        />
      </div>
    );
  }

  if (content) {
    return (
      <div className="bg-[#1a1f2e] rounded-xl border border-gray-700/50 p-6 md:p-8">
        <div
          className="prose prose-invert prose-sm max-w-none text-gray-200 leading-relaxed
            prose-headings:text-white prose-h2:text-lg prose-h2:font-bold prose-h2:border-b prose-h2:border-gray-700 prose-h2:pb-2 prose-h2:mb-4
            prose-p:text-gray-300 prose-p:leading-7 prose-a:text-[#5653e1]
            prose-code:bg-gray-800 prose-code:text-green-400 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-xs
            prose-pre:bg-gray-800 prose-pre:border prose-pre:border-gray-700 prose-pre:rounded-xl prose-pre:text-sm
            prose-blockquote:border-[#5653e1] prose-blockquote:bg-indigo-900/20 prose-blockquote:rounded-r-xl
            prose-strong:text-white prose-ul:text-gray-300 prose-ol:text-gray-300"
          dangerouslySetInnerHTML={{ __html: content }}
        />
      </div>
    );
  }

  if (resources.length > 0) {
    return (
      <div className="bg-[#1a1f2e] rounded-xl border border-gray-700/50 overflow-hidden">
        <div className="px-5 py-3.5 border-b border-gray-700/50">
          <p className="text-white font-semibold text-sm">Ressources de la leçon</p>
        </div>
        {resources.map((r, i) => {
          const url  = normalUrl(r.file_url);
          const info = extInfo(r.file_url);
          return (
            <div key={r.id||i} className="flex items-center gap-4 px-5 py-4 border-b border-gray-700/30 last:border-0 hover:bg-gray-700/20 transition">
              <span className="text-2xl flex-shrink-0">{info.icon}</span>
              <div className="flex-1 min-w-0">
                <p className="text-white text-sm font-medium truncate">{r.title || r.file_url?.split("/").pop()}</p>
                <p className="text-gray-500 text-xs mt-0.5">{info.label}{r.file_size ? ` · ${fmtSz(r.file_size)}` : ""}</p>
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <div className="bg-[#1a1f2e] rounded-xl border border-dashed border-gray-700 p-12 text-center">
      <FileText className="w-12 h-12 text-gray-600 mx-auto mb-4" />
      <p className="text-gray-400 font-medium">Contenu en cours de rédaction</p>
      <p className="text-gray-600 text-sm mt-1">L&apos;instructeur n&apos;a pas encore ajouté le contenu.</p>
    </div>
  );
}

// ─── Lecteur vidéo ─────────────────────────────────────────
function VideoPlayer({ url, title }) {
  const [playing, setPlaying] = useState(false);
  const ytId = getYtId(url||"");
  useEffect(() => { setPlaying(false); }, [url]);

  if (!url) return (
    <div className="aspect-video bg-black flex items-center justify-center">
      <div className="text-center">
        <Film className="w-16 h-16 text-gray-700 mx-auto mb-3" />
        <p className="text-gray-500 text-sm">Vidéo non disponible</p>
      </div>
    </div>
  );

  return (
    <div className="aspect-video bg-black relative overflow-hidden">
      {!playing ? (
        <div className="absolute inset-0 cursor-pointer group" onClick={() => setPlaying(true)}>
          {ytId && <img src={`https://img.youtube.com/vi/${ytId}/maxresdefault.jpg`} alt={title} className="w-full h-full object-cover" onError={e => { e.target.src = `https://img.youtube.com/vi/${ytId}/hqdefault.jpg`; }} />}
          {!ytId && <div className="w-full h-full bg-gradient-to-br from-[#1a1f2e] to-[#0f1117] flex items-center justify-center"><Film className="w-20 h-20 text-gray-700" /></div>}
          <div className="absolute inset-0 bg-black/30 group-hover:bg-black/20 transition-colors" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-20 h-20 rounded-full bg-white/10 backdrop-blur-sm border-2 border-white/30 flex items-center justify-center hover:scale-110 transition-transform">
              <Play className="w-8 h-8 text-white fill-white ml-1" />
            </div>
          </div>
        </div>
      ) : ytId ? (
        <iframe key={ytId} src={`https://www.youtube.com/embed/${ytId}?autoplay=1&rel=0&modestbranding=1`}
          className="absolute inset-0 w-full h-full border-none" allowFullScreen title={title} />
      ) : (
        <video key={url} src={url} autoPlay controls controlsList="nodownload"
          className="absolute inset-0 w-full h-full" />
      )}
    </div>
  );
}

// ─── Élément de leçon dans la sidebar ──────────────────────
function LessonItem({ lesson, isActive, isDone, onClick, moduleExpanded }) {
  const Icon = TYPE_ICON[lesson.content_type] || FileText;
  const color = TYPE_COLOR[lesson.content_type] || "#888";

  return (
    <button onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-all group ${
        isActive ? "bg-[#5653e1]/15 border-l-2 border-[#5653e1]" : "hover:bg-white/5 border-l-2 border-transparent"
      }`}>
      {/* Icône statut */}
      <div className="flex-shrink-0 w-6 h-6 flex items-center justify-center">
        {isDone
          ? <CheckCircle className="w-5 h-5 text-emerald-400" />
          : isActive
            ? <div className="w-4 h-4 rounded-full border-2 border-[#5653e1] bg-[#5653e1]/20" />
            : <Circle className="w-4 h-4 text-gray-600" />
        }
      </div>

      {/* Texte */}
      <div className="flex-1 min-w-0">
        <p className={`text-sm leading-snug truncate ${isActive ? "text-white font-semibold" : isDone ? "text-gray-400" : "text-gray-300 group-hover:text-white"}`}>
          {lesson.title}
        </p>
        <div className="flex items-center gap-1.5 mt-0.5">
          <Icon className="w-3 h-3 flex-shrink-0" style={{ color }} />
          <span className="text-xs text-gray-600">{TYPE_LABEL?.[lesson.content_type] || "Leçon"}</span>
          {lesson.duration_minutes > 0 && <span className="text-xs text-gray-600">· {fmtDur(lesson.duration_minutes)}</span>}
        </div>
      </div>
    </button>
  );
}

const TYPE_LABEL = { video:"Vidéo", article:"Article", quiz:"Quiz", exercise:"Exercice" };

// ═══════════════════════════════════════════════════════════
// PAGE PRINCIPALE
// ═══════════════════════════════════════════════════════════
export default function CourseLearn() {
  const { id }      = useParams();
  const navigate    = useNavigate();
  const { token }   = useAuth();
  const { canAccessCourseContent, isAdmin, isInstructor } = usePermissions();

  const [course,        setCourse]    = useState(null);
  const [modules,       setModules]   = useState([]);
  const [activeLesson,  setActive]    = useState(null);
  const [completed,     setCompleted] = useState(new Set());
  const [sidebar,       setSidebar]   = useState(true);
  const [loading,       setLoading]   = useState(true);
  const [error,         setError]     = useState(null);
  const [completing,    setCompleting]= useState(false);
  const [expandedMods,  setExpanded]  = useState({});
  const [notif,         setNotif]     = useState(null);

  // Charger le cours
  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [cRes, mRes] = await Promise.all([
        api.get(`/courses/${id}`),
        api.get(`/courses/${id}/modules`),
      ]);
      const courseData   = cRes.data?.data || cRes.data;
      const raw          = mRes.data?.data || mRes.data;
      const modulesData  = Array.isArray(raw) ? raw : (raw?.modules || []);
      setCourse(courseData);
      setModules(modulesData);

      // Leçons terminées
      let doneSet = new Set(
        modulesData.flatMap(m => (m.lessons||[]).filter(l => l.is_completed||l.completed).map(l=>l.id))
      );
      try {
        const pRes = await api.get(`/courses/${id}/progress`);
        const fromP = new Set((pRes.data?.data||[]).flatMap(m=>(m.lessons||[]).filter(l=>l.completed||l.is_completed).map(l=>l.id)));
        if (fromP.size > 0) doneSet = fromP;
      } catch(_) {}
      setCompleted(doneSet);

      // Première leçon non terminée
      const allLessons = modulesData.flatMap(m => m.lessons||[]);
      const first = allLessons.find(l => !doneSet.has(l.id)) || allLessons[0];
      if (first) {
        // Développer le module de la première leçon
        const modOfFirst = modulesData.find(m => (m.lessons||[]).some(l=>l.id===first.id));
        if (modOfFirst) setExpanded(prev => ({ ...prev, [modOfFirst.id]: true }));
        await selectLesson(first);
      }
    } catch (err) {
      if (err.response?.status === 403) setError("enrollment");
      else setError("server");
    } finally { setLoading(false); }
  }, [id]);

  useEffect(() => { load(); }, [id]);

  // Charger leçon complète (avec resources + article_content)
  const selectLesson = async (lesson) => {
    setActive(lesson);
    try {
      const r = await api.get(`/courses/${id}/lessons/${lesson.id}`);
      const full = r.data?.data;
      if (full) setActive(prev => prev?.id === lesson.id ? {...lesson, ...full} : prev);
    } catch(_) {}
  };

  const handleSelectLesson = async (lesson) => {
    // Développer le module correspondant
    const mod = modules.find(m => (m.lessons||[]).some(l=>l.id===lesson.id));
    if (mod) setExpanded(prev => ({ ...prev, [mod.id]: true }));
    await selectLesson(lesson);
    if (window.innerWidth < 768) setSidebar(false);
  };

  const allLessons   = modules.flatMap(m => m.lessons||[]);
  const currentIdx   = allLessons.findIndex(l => l.id === activeLesson?.id);
  const totalLessons = allLessons.length;
  const doneCount    = completed.size;
  const progressPct  = totalLessons > 0 ? Math.round((doneCount/totalLessons)*100) : 0;

  const goNext = () => { if (currentIdx < allLessons.length-1) handleSelectLesson(allLessons[currentIdx+1]); };
  const goPrev = () => { if (currentIdx > 0) handleSelectLesson(allLessons[currentIdx-1]); };

  const handleComplete = async () => {
    if (!activeLesson || completing) return;
    setCompleting(true);
    try {
      await api.post(`/courses/${id}/lessons/${activeLesson.id}/complete`);
      const next = allLessons[currentIdx+1];
      setCompleted(prev => new Set([...prev, activeLesson.id]));
      setNotif("✅ Leçon terminée !");
      setTimeout(() => setNotif(null), 3000);
      if (next) await handleSelectLesson(next);
    } catch(_) {}
    setCompleting(false);
  };

  // ── États de chargement / erreur ──────────────────────────
  if (loading) return (
    <div className="min-h-screen bg-[#0f1117] flex items-center justify-center">
      <div className="text-center">
        <div className="w-12 h-12 border-3 border-[#5653e1] border-t-transparent rounded-full animate-spin mx-auto mb-4" style={{borderWidth:3}} />
        <p className="text-gray-400 text-sm">Chargement du cours…</p>
      </div>
    </div>
  );

  if (error === "enrollment") return (
    <div className="min-h-screen bg-[#0f1117] flex items-center justify-center p-6">
      <div className="bg-[#1a1f2e] border border-gray-700/50 rounded-2xl p-10 text-center max-w-md">
        <AlertCircle className="w-14 h-14 text-amber-400 mx-auto mb-5" />
        <h2 className="text-white font-black text-xl mb-3">Accès non autorisé</h2>
        <p className="text-gray-400 text-sm mb-6 leading-relaxed">
          Votre inscription est en attente de validation par l&apos;administrateur.
          Vous recevrez un email dès que votre accès est confirmé.
        </p>
        <div className="flex gap-3 justify-center">
          <button onClick={() => navigate(`/courses/${id}`)}
            className="px-5 py-2.5 bg-[#5653e1] text-white font-bold text-sm rounded-xl hover:bg-[#4340c0] transition">
            Voir le cours
          </button>
          <button onClick={() => navigate("/dashboard")}
            className="px-5 py-2.5 border border-gray-600 text-gray-300 font-semibold text-sm rounded-xl hover:bg-gray-800 transition">
            Tableau de bord
          </button>
        </div>
      </div>
    </div>
  );

  if (error) return (
    <div className="min-h-screen bg-[#0f1117] flex items-center justify-center p-6">
      <div className="text-center">
        <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
        <p className="text-gray-300 font-semibold mb-4">Une erreur est survenue</p>
        <button onClick={load} className="px-5 py-2.5 bg-[#5653e1] text-white rounded-xl text-sm font-bold hover:bg-[#4340c0] transition">
          Réessayer
        </button>
      </div>
    </div>
  );

  // Contenu actif
  const lessonUrl    = normalUrl(activeLesson?.content_url);
  const isVideoLesson= activeLesson?.content_type === "video" || isVid(lessonUrl||"");
  const isPdfLesson  = isPdf(lessonUrl||"") && !isVideoLesson;
  const resources    = activeLesson?.resources || [];

  return (
    <div className="min-h-screen bg-[#0f1117] flex flex-col" style={{fontFamily:"inherit"}}>

      {/* ══ TOPBAR ══════════════════════════════════════════ */}
      <header className="bg-[#1a1f2e] border-b border-gray-700/50 h-14 flex items-center gap-4 px-4 flex-shrink-0 z-40">
        <button onClick={() => navigate(`/courses/${id}`)}
          className="flex items-center gap-1.5 text-gray-400 hover:text-white transition text-sm">
          <ChevronLeft className="w-4 h-4" />
          <span className="hidden sm:inline">Retour</span>
        </button>

        <div className="w-px h-6 bg-gray-700" />

        <div className="flex-1 min-w-0">
          <p className="text-white font-bold text-sm truncate">{course?.title}</p>
          {activeLesson && <p className="text-gray-500 text-xs truncate hidden sm:block">{activeLesson.title}</p>}
        </div>

        {/* Progress bar */}
        <div className="hidden md:flex items-center gap-3">
          <div className="w-32 h-1.5 bg-gray-700 rounded-full overflow-hidden">
            <div className="h-full bg-emerald-500 rounded-full transition-all" style={{width:`${progressPct}%`}} />
          </div>
          <span className="text-xs text-gray-400 whitespace-nowrap font-semibold">{progressPct}% · {doneCount}/{totalLessons}</span>
        </div>

        <button onClick={() => setSidebar(v => !v)}
          className="flex items-center gap-1.5 text-gray-400 hover:text-white text-sm transition px-2 py-1.5 rounded-lg hover:bg-white/5">
          <Menu className="w-4 h-4" />
          <span className="hidden sm:inline text-xs">Contenu</span>
        </button>
      </header>

      {/* Toast notif */}
      {notif && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 bg-emerald-700 text-white text-sm font-semibold px-5 py-2.5 rounded-xl shadow-xl">
          {notif}
        </div>
      )}

      {/* ══ CORPS ════════════════════════════════════════════ */}
      <div className="flex flex-1 overflow-hidden">

        {/* ── Contenu principal ── */}
        <main className={`flex-1 flex flex-col overflow-y-auto transition-all duration-300 ${sidebar ? "md:mr-80" : ""}`}>

          {/* Zone vidéo / PDF */}
          {activeLesson ? (
            <>
              <div className="bg-black">
                {isVideoLesson ? (
                  <VideoPlayer url={lessonUrl} title={activeLesson.title} />
                ) : isPdfLesson ? (
                  <div style={{height:600}} className="bg-[#1a1f2e]">
                    <iframe
                      src={`${lessonUrl}#toolbar=0&navpanes=0&scrollbar=1&view=FitH`}
                      className="w-full h-full border-none"
                      title="Document"
                    />
                  </div>
                ) : activeLesson.content_type === "quiz" ? (
                  <div className="aspect-video bg-gradient-to-br from-purple-900/30 to-[#0f1117] flex items-center justify-center">
                    <div className="text-center">
                      <Brain className="w-20 h-20 text-purple-400/40 mx-auto mb-4" />
                      <p className="text-purple-300 font-bold text-lg">Quiz interactif</p>
                    </div>
                  </div>
                ) : activeLesson.content_type === "exercise" ? (
                  <div className="aspect-video bg-gradient-to-br from-orange-900/20 to-[#0f1117] flex items-center justify-center">
                    <div className="text-center">
                      <Zap className="w-20 h-20 text-orange-400/40 mx-auto mb-4" />
                      <p className="text-orange-300 font-bold text-lg">Exercice pratique</p>
                    </div>
                  </div>
                ) : null}
              </div>

              {/* Navigation prev/next */}
              <div className="flex items-center justify-between gap-3 px-5 py-3 bg-[#161b27] border-b border-gray-700/50">
                <button onClick={goPrev} disabled={currentIdx <= 0}
                  className="flex items-center gap-2 text-sm font-semibold text-gray-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition px-3 py-2 rounded-lg hover:bg-white/5">
                  <ChevronLeft className="w-4 h-4" /> Précédent
                </button>

                <button onClick={handleComplete} disabled={completing || completed.has(activeLesson?.id)}
                  className={`flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-black transition-all ${
                    completed.has(activeLesson?.id)
                      ? "bg-emerald-700/30 text-emerald-400 cursor-default"
                      : "bg-[#5653e1] hover:bg-[#4340c0] text-white hover:shadow-lg hover:shadow-[#5653e1]/20"
                  }`}>
                  {completing
                    ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    : <CheckCircle className="w-4 h-4" />
                  }
                  {completed.has(activeLesson?.id) ? "Terminé ✓" : "Marquer comme terminé"}
                </button>

                <button onClick={goNext} disabled={currentIdx >= allLessons.length-1}
                  className="flex items-center gap-2 text-sm font-semibold text-gray-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition px-3 py-2 rounded-lg hover:bg-white/5">
                  Suivant <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              {/* Infos leçon + contenu texte */}
              <div className="max-w-3xl w-full mx-auto px-5 py-8 flex-1">
                {/* Titre + métadonnées */}
                <div className="mb-6">
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    {modules.find(m=>(m.lessons||[]).some(l=>l.id===activeLesson.id)) && (
                      <span className="text-xs text-[#5653e1] font-bold uppercase tracking-wider">
                        {modules.find(m=>(m.lessons||[]).some(l=>l.id===activeLesson.id))?.title}
                      </span>
                    )}
                  </div>
                  <h1 className="text-white text-2xl font-black leading-tight mb-3">{activeLesson.title}</h1>
                  <div className="flex items-center gap-4 text-sm text-gray-500 flex-wrap">
                    {activeLesson.content_type && (
                      <span className="flex items-center gap-1.5">
                        {(() => { const I = TYPE_ICON[activeLesson.content_type]||FileText; return <I className="w-4 h-4" />; })()}
                        {TYPE_LABEL[activeLesson.content_type]}
                      </span>
                    )}
                    {activeLesson.duration_minutes > 0 && (
                      <span className="flex items-center gap-1.5"><Clock className="w-4 h-4" /> {fmtDur(activeLesson.duration_minutes)}</span>
                    )}
                    {completed.has(activeLesson.id) && (
                      <span className="flex items-center gap-1.5 text-emerald-400 font-semibold">
                        <CheckCircle className="w-4 h-4" /> Terminé
                      </span>
                    )}
                  </div>
                </div>

                {/* Contenu article / PDF / resources */}
                <ArticleContent
                  content={activeLesson.article_content}
                  resources={resources}
                  contentUrl={!isVideoLesson ? lessonUrl : null}
                />

                {/* Ressources attachées (si vidéo avec fichiers supplémentaires) */}
                {isVideoLesson && resources.length > 0 && (
                  <div className="mt-6 bg-[#1a1f2e] rounded-xl border border-gray-700/50 overflow-hidden">
                    <div className="flex items-center gap-2 px-5 py-3.5 border-b border-gray-700/50">
                      <Paperclip className="w-4 h-4 text-gray-400" />
                      <p className="text-gray-300 font-semibold text-sm">Fichiers du cours</p>
                      <span className="text-xs text-gray-600 bg-gray-800 px-2 py-0.5 rounded-full ml-1">{resources.length}</span>
                    </div>
                    {resources.map((r, i) => {
                      const info = extInfo(r.file_url);
                      return (
                        <div key={r.id||i} className="flex items-center gap-4 px-5 py-3.5 border-b border-gray-700/30 last:border-0 hover:bg-gray-700/20 transition">
                          <span className="text-xl flex-shrink-0">{info.icon}</span>
                          <div className="flex-1 min-w-0">
                            <p className="text-white text-sm font-medium truncate">{r.title || r.file_url?.split("/").pop()}</p>
                            <p className="text-gray-600 text-xs">{info.label}{r.file_size ? ` · ${fmtSz(r.file_size)}` : ""}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Espace bas */}
                <div className="h-16" />
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center text-gray-600">
                <Film className="w-16 h-16 mx-auto mb-4 opacity-30" />
                <p>Sélectionnez une leçon</p>
              </div>
            </div>
          )}
        </main>

        {/* ── Sidebar ── */}
        {sidebar && (
          <aside className="fixed right-0 top-14 bottom-0 w-80 bg-[#1a1f2e] border-l border-gray-700/50 flex flex-col z-30 overflow-hidden">
            {/* Header sidebar */}
            <div className="px-4 py-4 border-b border-gray-700/50 flex-shrink-0">
              <div className="flex items-center justify-between mb-3">
                <p className="text-white font-black text-sm">Contenu du cours</p>
                <button onClick={() => setSidebar(false)} className="text-gray-500 hover:text-white transition">
                  <X className="w-4 h-4" />
                </button>
              </div>
              {/* Progression */}
              <div className="flex items-center gap-3">
                <div className="flex-1 h-1.5 bg-gray-700 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full transition-all duration-500" style={{width:`${progressPct}%`}} />
                </div>
                <span className="text-xs text-gray-400 font-bold whitespace-nowrap">{doneCount}/{totalLessons}</span>
              </div>
            </div>

            {/* Liste modules + leçons */}
            <div className="flex-1 overflow-y-auto">
              {modules.map((mod, mi) => {
                const isExpanded = expandedMods[mod.id] !== false; // ouvert par défaut
                const modLessons = mod.lessons || [];
                const modDone    = modLessons.filter(l => completed.has(l.id)).length;

                return (
                  <div key={mod.id || mi}>
                    {/* En-tête module */}
                    <button onClick={() => setExpanded(prev => ({...prev, [mod.id]: !isExpanded}))}
                      className="w-full flex items-center gap-3 px-4 py-3.5 bg-[#161b27] hover:bg-[#1e2435] transition text-left border-b border-gray-700/30">
                      <div className="flex-1 min-w-0">
                        <p className="text-white font-bold text-xs uppercase tracking-wider truncate">{mod.title}</p>
                        <p className="text-gray-600 text-xs mt-0.5">{modDone}/{modLessons.length} · {fmtDur(mod.total_duration||0)}</p>
                      </div>
                      {isExpanded
                        ? <ChevronUp className="w-4 h-4 text-gray-500 flex-shrink-0" />
                        : <ChevronDown className="w-4 h-4 text-gray-500 flex-shrink-0" />
                      }
                    </button>

                    {/* Leçons */}
                    {isExpanded && modLessons.map(lesson => (
                      <LessonItem
                        key={lesson.id}
                        lesson={lesson}
                        isActive={activeLesson?.id === lesson.id}
                        isDone={completed.has(lesson.id)}
                        onClick={() => handleSelectLesson(lesson)}
                      />
                    ))}
                  </div>
                );
              })}
            </div>
          </aside>
        )}
      </div>
    </div>
  );
}