// src/pages/Courses/CourseLearn.jsx
// ✅ Layout fixe plein écran — vidéo visible sans scroll
// ✅ Upload vidéo depuis PC pour les leçons sans URL
// ✅ Contenu article bien formaté
import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { usePermissions } from "../../contexts/PermissionContext";
import { useAuth } from "../../contexts/AuthContext";
import api from "../../api/api";
import {
  ChevronLeft, ChevronRight, CheckCircle, Play, FileText,
  Brain, Zap, Download, Upload, Film, Paperclip, BookOpen,
  Menu, X, Clock, Lock
} from "lucide-react";

/* ── icônes par type ── */
const TYPE_ICON = { video: Film, article: FileText, quiz: Brain, exercise: Zap, download: Download };
const TYPE_LABEL = { video:"Vidéo", article:"Article", quiz:"Quiz", exercise:"Exercice", download:"Téléchargement" };

/* ── helper YouTube ── */
const getYtId = (url) => {
  const m = (url||"").match(/(?:v=|youtu\.be\/)([^&?/]+)/);
  return m ? m[1] : null;
};

/* ════════════════════════════════════════
   COMPOSANT UPLOAD VIDÉO INLINE
════════════════════════════════════════ */
function VideoUploadZone({ token, lessonId, onSuccess }) {
  const [drag,     setDrag]     = useState(false);
  const [up,       setUp]       = useState(false);
  const [progress, setProgress] = useState(0);
  const ref = useRef(null);

  const doUpload = (file) => {
    if (!file || !file.type.startsWith("video/")) {
      alert("Choisissez un fichier vidéo (MP4, MKV, AVI…)"); return;
    }
    if (file.size > 2 * 1024 * 1024 * 1024) {
      alert("Fichier trop grand (max 2 Go)"); return;
    }
    setUp(true); setProgress(0);
    const fd = new FormData(); fd.append("video", file);
    const xhr = new XMLHttpRequest();
    xhr.open("POST", `/api/admin/lessons/${lessonId}/upload-video`);
    xhr.setRequestHeader("Authorization", `Bearer ${token}`);
    xhr.upload.onprogress = e => {
      if (e.lengthComputable) setProgress(Math.round((e.loaded / e.total) * 95));
    };
    xhr.onload = () => {
      setProgress(100);
      try {
        const r = JSON.parse(xhr.responseText);
        if (r.success) { setTimeout(() => { setUp(false); onSuccess(r.data.file_url); }, 500); }
        else alert("Erreur: " + r.message);
      } catch { alert("Erreur serveur"); }
    };
    xhr.onerror = () => { setUp(false); alert("Erreur réseau"); };
    xhr.send(fd);
  };

  return (
    <div className="mt-4">
      <div
        onDragOver={e => { e.preventDefault(); setDrag(true); }}
        onDragLeave={() => setDrag(false)}
        onDrop={e => { e.preventDefault(); setDrag(false); doUpload(e.dataTransfer.files[0]); }}
        onClick={() => !up && ref.current?.click()}
        className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition
          ${drag ? "border-indigo-400 bg-indigo-900/20" : "border-gray-600 hover:border-gray-500 hover:bg-gray-700/30"}`}
      >
        {up ? (
          <div>
            <div className="flex justify-center mb-3">
              <div className="w-7 h-7 border-3 border-indigo-400 border-t-transparent rounded-full animate-spin" style={{ borderWidth: 3 }} />
            </div>
            <p className="text-indigo-400 font-semibold text-sm mb-2">Upload en cours… {progress}%</p>
            <div className="h-1.5 bg-gray-700 rounded-full overflow-hidden mx-8">
              <div className="h-full rounded-full transition-all duration-300 bg-indigo-500" style={{ width: `${progress}%` }} />
            </div>
          </div>
        ) : (
          <>
            <Upload size={28} className="text-gray-500 mx-auto mb-2" />
            <p className="text-gray-300 font-semibold text-sm">Glissez votre vidéo ici</p>
            <p className="text-gray-500 text-xs mt-1">ou cliquez pour sélectionner · MP4, MKV, AVI, MOV, WebM · max 2 Go</p>
          </>
        )}
      </div>
      <input ref={ref} type="file" accept="video/*" className="hidden" onChange={e => doUpload(e.target.files?.[0])} />
    </div>
  );
}

/* ════════════════════════════════════════
   PLAYER VIDÉO — taille réduite, visible sans scroll
════════════════════════════════════════ */
function VideoPlayer({ url, lessonId, token, onVideoUploaded, isAdmin, isInstructor }) {
  const ytId = getYtId(url);

  if (ytId) {
    return (
      <div className="w-full rounded-2xl overflow-hidden bg-black" style={{ maxHeight: "56vh", aspectRatio: "16/9" }}>
        <iframe
          src={`https://www.youtube.com/embed/${ytId}?rel=0&modestbranding=1`}
          className="w-full h-full border-none"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          title="Leçon vidéo"
        />
      </div>
    );
  }

  if (url?.match(/\.(mp4|webm|ogg|mkv|avi|mov)$/i) || url?.includes("/uploads/")) {
    return (
      <div className="w-full rounded-2xl overflow-hidden bg-black" style={{ maxHeight: "56vh" }}>
        <video
          src={url}
          controls
          className="w-full"
          style={{ maxHeight: "56vh" }}
          controlsList="nodownload"
        />
      </div>
    );
  }

  if (url) {
    return (
      <div className="w-full rounded-2xl overflow-hidden bg-black" style={{ maxHeight: "56vh", aspectRatio: "16/9" }}>
        <iframe src={url} className="w-full h-full border-none" title="Leçon vidéo" allowFullScreen />
      </div>
    );
  }

  /* Pas d'URL — zone d'upload (admin/instructeur seulement) */
  if (isAdmin || isInstructor) {
    return (
      <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700">
        <div className="flex items-center gap-3 mb-3">
          <Film size={20} className="text-gray-400" />
          <p className="text-gray-300 font-semibold text-sm">Aucune vidéo encore associée</p>
        </div>
        <p className="text-gray-500 text-xs mb-3">Uploadez une vidéo pré-enregistrée depuis votre ordinateur :</p>
        <VideoUploadZone token={token} lessonId={lessonId} onSuccess={onVideoUploaded} />
      </div>
    );
  }

  return (
    <div className="bg-gray-800 rounded-2xl p-8 text-center border border-gray-700">
      <Film size={36} className="text-gray-600 mx-auto mb-3" />
      <p className="text-gray-300 font-semibold">Vidéo à venir</p>
      <p className="text-gray-500 text-sm mt-1">L'instructeur n'a pas encore ajouté cette vidéo.</p>
    </div>
  );
}

/* ════════════════════════════════════════
   CONTENU ARTICLE — bien formaté
════════════════════════════════════════ */
function ArticleContent({ content }) {
  if (!content) {
    return (
      <div className="bg-gray-800 rounded-2xl p-8 text-center border border-dashed border-gray-700">
        <FileText size={36} className="text-gray-600 mx-auto mb-3" />
        <p className="text-gray-300 font-semibold">Contenu en cours de rédaction</p>
        <p className="text-gray-500 text-sm mt-1">L'instructeur n'a pas encore ajouté le contenu.</p>
      </div>
    );
  }

  return (
    <div className="bg-gray-800 rounded-2xl border border-gray-700 overflow-hidden">
      {/* Barre déco */}
      <div className="h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />
      <div className="p-6 md:p-8">
        <div
          className="
            text-gray-200 leading-7 text-sm
            [&_h1]:text-white [&_h1]:text-2xl [&_h1]:font-bold [&_h1]:mb-4 [&_h1]:mt-6 [&_h1]:first:mt-0
            [&_h2]:text-white [&_h2]:text-xl [&_h2]:font-bold [&_h2]:mb-3 [&_h2]:mt-6 [&_h2]:first:mt-0
                   [&_h2]:border-b [&_h2]:border-gray-700 [&_h2]:pb-2
            [&_h3]:text-indigo-300 [&_h3]:text-lg [&_h3]:font-semibold [&_h3]:mb-3 [&_h3]:mt-5
            [&_h4]:text-gray-200 [&_h4]:font-semibold [&_h4]:mb-2 [&_h4]:mt-4
            [&_p]:text-gray-300 [&_p]:mb-4 [&_p]:leading-7
            [&_a]:text-indigo-400 [&_a:hover]:text-indigo-300 [&_a]:no-underline [&_a:hover]:underline
            [&_strong]:text-white [&_strong]:font-semibold
            [&_em]:text-gray-200 [&_em]:italic
            [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:mb-4 [&_ul]:space-y-1
            [&_ol]:list-decimal [&_ol]:pl-6 [&_ol]:mb-4 [&_ol]:space-y-1
            [&_li]:text-gray-300 [&_li]:leading-6
            [&_code]:bg-gray-900 [&_code]:text-green-400 [&_code]:px-1.5 [&_code]:py-0.5
                    [&_code]:rounded [&_code]:text-xs [&_code]:font-mono
                    [&_code]:border [&_code]:border-gray-700
            [&_pre]:bg-gray-900 [&_pre]:border [&_pre]:border-gray-700 [&_pre]:rounded-xl
                   [&_pre]:p-4 [&_pre]:mb-4 [&_pre]:overflow-x-auto
            [&_pre_code]:bg-transparent [&_pre_code]:border-none [&_pre_code]:p-0 [&_pre_code]:text-green-400 [&_pre_code]:text-sm
            [&_blockquote]:border-l-4 [&_blockquote]:border-indigo-500 [&_blockquote]:bg-indigo-900/20
                          [&_blockquote]:pl-4 [&_blockquote]:py-2 [&_blockquote]:my-4 [&_blockquote]:rounded-r-xl
                          [&_blockquote_p]:text-indigo-200 [&_blockquote_p]:mb-0
            [&_table]:w-full [&_table]:border-collapse [&_table]:mb-4
            [&_th]:bg-gray-700 [&_th]:text-white [&_th]:px-4 [&_th]:py-2 [&_th]:text-left [&_th]:text-sm
                  [&_th]:border [&_th]:border-gray-600
            [&_td]:px-4 [&_td]:py-2 [&_td]:border [&_td]:border-gray-700 [&_td]:text-gray-300 [&_td]:text-sm
            [&_tr:nth-child(even)]:bg-gray-800/50
            [&_hr]:border-gray-700 [&_hr]:my-6
            [&_img]:rounded-xl [&_img]:max-w-full [&_img]:mx-auto [&_img]:my-4
          "
          dangerouslySetInnerHTML={{ __html: content }}
        />
      </div>
    </div>
  );
}

/* ════════════════════════════════════════
   COMPOSANT PRINCIPAL
════════════════════════════════════════ */
export default function CourseLearn() {
  const { id }      = useParams();
  const navigate    = useNavigate();
  const { token }   = useAuth();
  const { canAccessCourseContent, isAdmin, isInstructor } = usePermissions();

  const [course,           setCourse]       = useState(null);
  const [modules,          setModules]      = useState([]);
  const [activeLesson,     setActiveLesson] = useState(null);
  const [completedLessons, setCompleted]    = useState(new Set());
  const [sidebarOpen,      setSidebarOpen]  = useState(true);
  const [loading,          setLoading]      = useState(true);
  const [accessDenied,     setAccessDenied] = useState(false);
  const [completing,       setCompleting]   = useState(false);
  const [courseFinished,   setFinished]     = useState(false);

  useEffect(() => {
    setLoading(true); setActiveLesson(null); setModules([]);
    setCourse(null); setCompleted(new Set()); setFinished(false); setAccessDenied(false);
    fetchCourse();
  }, [id]); // eslint-disable-line

  const fetchCourse = async () => {
    try {
      if (!canAccessCourseContent(id) && !isAdmin() && !isInstructor()) {
        setAccessDenied(true); return;
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

      let doneIds = new Set(
        modulesData.flatMap(m => (m.lessons||[]).filter(l=>l.is_completed===1||l.is_completed===true).map(l=>l.id))
      );
      try {
        const pRes = await api.get(`/courses/${id}/progress`);
        const pData = pRes.data?.data || [];
        const fromP = new Set(pData.flatMap(m=>(m.lessons||[]).filter(l=>l.completed||l.is_completed).map(l=>l.id)));
        if (fromP.size > 0) doneIds = fromP;
      } catch(_) {}
      setCompleted(doneIds);

      const all = modulesData.flatMap(m => m.lessons||[]);
      if (all.length > 0) {
        setActiveLesson(all.find(l=>!doneIds.has(l.id)) || all[all.length-1]);
      }
      if (all.length > 0 && doneIds.size >= all.length) setFinished(true);
    } catch(err) {
      console.error("CourseLearn:", err);
      if (err.response?.status === 403) setAccessDenied(true);
    } finally { setLoading(false); }
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
      const newDone = new Set([...completedLessons, activeLesson.id]);
      setCompleted(newDone);
      if (res.data?.data?.course_completed) setFinished(true);
      else goToNext();
    } catch(err) { console.error("markComplete:", err); }
    finally { setCompleting(false); }
  };

  const allLessons = modules.flatMap(m => m.lessons||[]);
  const currentIdx = allLessons.findIndex(l => l.id === activeLesson?.id);
  const goToNext = () => { if (currentIdx < allLessons.length-1) setActiveLesson(allLessons[currentIdx+1]); };
  const goToPrev = () => { if (currentIdx > 0) setActiveLesson(allLessons[currentIdx-1]); };

  const totalLessons = allLessons.length;
  const doneCount    = completedLessons.size;
  const progressPct  = totalLessons > 0 ? Math.round((doneCount / totalLessons) * 100) : 0;

  /* Mettre à jour la vidéo d'une leçon après upload */
  const handleVideoUploaded = (url) => {
    if (!activeLesson) return;
    setModules(prev => prev.map(m => ({
      ...m,
      lessons: (m.lessons||[]).map(l => l.id === activeLesson.id ? {...l, content_url: url} : l)
    })));
    setActiveLesson(prev => prev ? {...prev, content_url: url} : prev);
  };

  /* ── États d'erreur ── */
  if (loading) return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center">
      <div className="text-center text-white">
        <div className="w-12 h-12 border-4 border-indigo-400 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-gray-400 text-sm">Chargement du cours…</p>
      </div>
    </div>
  );

  if (accessDenied) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center">
        <Lock size={48} className="text-gray-400 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-gray-800 mb-2">Accès non autorisé</h2>
        <p className="text-gray-500 text-sm mb-6">Vous n'avez pas encore accès à ce cours.</p>
        <div className="flex gap-3">
          <button onClick={() => navigate(-1)} className="flex-1 py-2.5 border border-gray-200 rounded-xl text-gray-600 text-sm hover:bg-gray-50 transition">← Retour</button>
          <button onClick={() => navigate(`/courses/${id}`)} className="flex-1 py-2.5 bg-indigo-700 text-white rounded-xl text-sm font-semibold hover:bg-indigo-800 transition">Voir le cours</button>
        </div>
      </div>
    </div>
  );

  /* ════════════ LAYOUT PRINCIPAL ════════════
     Fixé en plein écran — vidéo visible SANS SCROLL
  ═══════════════════════════════════════════ */
  return (
    <div style={{ height:"100vh", display:"flex", flexDirection:"column", background:"#111827", overflow:"hidden" }}>

      {/* ── Bannière cours terminé ── */}
      {courseFinished && (
        <div className="bg-gradient-to-r from-yellow-500 to-yellow-400 text-indigo-900 px-4 py-2.5 flex items-center justify-between gap-4 flex-shrink-0">
          <div className="flex items-center gap-3">
            <span className="text-xl">🎉</span>
            <div>
              <p className="font-bold text-sm">Félicitations ! Cours terminé à 100%.</p>
              <p className="text-xs opacity-80">Votre certificat a été généré automatiquement.</p>
            </div>
          </div>
          <button onClick={() => navigate("/student/certificates")} className="flex-shrink-0 bg-indigo-900 text-yellow-400 text-xs font-bold px-4 py-2 rounded-xl hover:bg-indigo-800 transition">
            Voir mon certificat →
          </button>
        </div>
      )}

      {/* ── Top bar ── */}
      <header className="bg-gray-800 border-b border-gray-700 px-4 py-2.5 flex items-center gap-3 flex-shrink-0 z-10">
        <button onClick={() => navigate("/student")} className="text-gray-400 hover:text-white transition text-sm flex items-center gap-1.5 flex-shrink-0">
          <ChevronLeft size={16} /> Tableau de bord
        </button>
        <div className="flex-1 min-w-0">
          <p className="text-white font-semibold text-sm truncate">{course?.title}</p>
          {activeLesson && <p className="text-gray-400 text-xs truncate">{activeLesson.title}</p>}
        </div>
        {/* Barre de progression */}
        <div className="hidden sm:flex items-center gap-3 flex-shrink-0">
          <div className="flex flex-col items-end gap-0.5">
            <span className="text-gray-400 text-xs">{progressPct}% terminé</span>
            <div className="w-36 h-1.5 bg-gray-700 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-500" style={{ width:`${progressPct}%` }} />
            </div>
          </div>
          <span className="text-gray-500 text-xs">{doneCount}/{totalLessons}</span>
        </div>
        <button onClick={() => setSidebarOpen(p=>!p)} className="flex-shrink-0 text-gray-400 hover:text-white transition text-xs border border-gray-600 rounded-lg px-2.5 py-1.5 flex items-center gap-1.5">
          {sidebarOpen ? <><X size={12}/> Masquer</> : <><Menu size={12}/> Sommaire</>}
        </button>
      </header>

      {/* ── Corps principal ── */}
      <div style={{ flex:1, display:"flex", overflow:"hidden" }}>

        {/* ── Sidebar sommaire ── */}
        {sidebarOpen && (
          <aside className="w-72 bg-gray-800 border-r border-gray-700 flex flex-col flex-shrink-0 overflow-hidden">
            {/* Progression */}
            <div className="p-4 border-b border-gray-700 flex-shrink-0">
              <div className="flex items-center justify-between mb-2">
                <p className="text-gray-400 text-xs font-semibold uppercase tracking-wider">Contenu du cours</p>
                <span className="text-gray-500 text-xs">{doneCount}/{totalLessons}</span>
              </div>
              <div className="h-1.5 bg-gray-700 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-500" style={{ width:`${progressPct}%` }} />
              </div>
            </div>

            {/* Liste modules/leçons scrollable */}
            <div className="flex-1 overflow-y-auto">
              {modules.length === 0 ? (
                <div className="p-6 text-center text-gray-500 text-sm">Aucun module disponible</div>
              ) : modules.map((mod, mi) => (
                <div key={mod.id} className="border-b border-gray-700/50">
                  <div className="px-4 py-3 sticky top-0 bg-gray-800 z-10">
                    <p className="text-gray-300 text-xs font-bold uppercase tracking-wide">
                      Module {mi+1} · {mod.title}
                    </p>
                  </div>
                  {(mod.lessons||[]).map(lesson => {
                    const isDone   = completedLessons.has(lesson.id);
                    const isActive = activeLesson?.id === lesson.id;
                    const TIcon = TYPE_ICON[lesson.content_type] || Film;
                    return (
                      <button key={lesson.id} onClick={() => handleSelectLesson(lesson)}
                        className={`w-full text-left px-4 py-2.5 flex items-center gap-3 transition text-sm
                          ${isActive ? "bg-indigo-600/20 border-l-2 border-indigo-500 text-white" : "text-gray-400 hover:bg-gray-700/30"}`}>
                        <span className={`w-5 h-5 rounded-full flex-shrink-0 flex items-center justify-center border
                          ${isDone   ? "bg-green-500 border-green-500 text-white"
                           : isActive ? "border-indigo-400 text-indigo-400"
                                       : "border-gray-600 text-gray-600"}`}>
                          {isDone ? <CheckCircle size={10} /> : <TIcon size={9} />}
                        </span>
                        <span className="flex-1 truncate text-xs">{lesson.title}</span>
                        {lesson.duration_minutes > 0 && (
                          <span className="text-gray-600 text-xs flex-shrink-0">{lesson.duration_minutes}min</span>
                        )}
                      </button>
                    );
                  })}
                </div>
              ))}
            </div>
          </aside>
        )}

        {/* ── Zone de contenu principale — scrollable INDÉPENDAMMENT ── */}
        <main style={{ flex:1, overflowY:"auto", background:"#111827" }}>
          {!activeLesson ? (
            <div className="h-full flex items-center justify-center text-gray-500">
              <div className="text-center">
                <BookOpen size={48} className="mx-auto mb-4 text-gray-700" />
                <p className="font-semibold text-gray-400">Sélectionnez une leçon pour commencer</p>
              </div>
            </div>
          ) : (
            <div className="max-w-5xl mx-auto px-4 py-6">

              {/* ── En-tête leçon ── */}
              <div className="mb-4">
                <p className="text-indigo-400 text-xs font-semibold uppercase tracking-wider mb-1">
                  {modules.find(m=>(m.lessons||[]).some(l=>l.id===activeLesson.id))?.title}
                </p>
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div>
                    <h2 className="text-white text-xl font-bold">{activeLesson.title}</h2>
                    <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                      {activeLesson.content_type && (
                        <span className="flex items-center gap-1.5 text-xs text-gray-400">
                          {(() => { const TI = TYPE_ICON[activeLesson.content_type]||Film; return <TI size={13}/>; })()}
                          {TYPE_LABEL[activeLesson.content_type]}
                        </span>
                      )}
                      {activeLesson.duration_minutes > 0 && (
                        <span className="flex items-center gap-1 text-xs text-gray-400">
                          <Clock size={12} /> {activeLesson.duration_minutes} min
                        </span>
                      )}
                      {completedLessons.has(activeLesson.id) && (
                        <span className="flex items-center gap-1 text-xs text-green-400">
                          <CheckCircle size={12} /> Terminée
                        </span>
                      )}
                    </div>
                  </div>
                  {/* Navigation rapide */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button onClick={goToPrev} disabled={currentIdx<=0}
                      className="p-2 border border-gray-700 text-gray-400 rounded-xl hover:bg-gray-700 transition disabled:opacity-30">
                      <ChevronLeft size={16} />
                    </button>
                    <span className="text-gray-500 text-xs">{currentIdx+1}/{totalLessons}</span>
                    <button onClick={goToNext} disabled={currentIdx>=totalLessons-1}
                      className="p-2 border border-gray-700 text-gray-400 rounded-xl hover:bg-gray-700 transition disabled:opacity-30">
                      <ChevronRight size={16} />
                    </button>
                  </div>
                </div>
              </div>

              {/* ══ CONTENU DE LA LEÇON ══ */}

              {/* 🎬 VIDÉO */}
              {activeLesson.content_type === "video" && (
                <VideoPlayer
                  url={activeLesson.content_url}
                  lessonId={activeLesson.id}
                  token={token}
                  onVideoUploaded={handleVideoUploaded}
                  isAdmin={isAdmin()}
                  isInstructor={isInstructor()}
                />
              )}

              {/* 📝 ARTICLE */}
              {activeLesson.content_type === "article" && (
                <ArticleContent content={activeLesson.article_content} />
              )}

              {/* 📥 TÉLÉCHARGEMENT */}
              {activeLesson.content_type === "download" && (
                <div className="bg-gray-800 rounded-2xl p-5 flex items-center gap-4 border border-gray-700">
                  <div className="w-12 h-12 bg-indigo-900/50 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Download size={22} className="text-indigo-400" />
                  </div>
                  <div className="flex-1">
                    <p className="text-white font-semibold text-sm">{activeLesson.title}</p>
                    <p className="text-gray-400 text-xs mt-0.5">Ressource téléchargeable</p>
                  </div>
                  {activeLesson.content_url ? (
                    <a href={activeLesson.content_url} download target="_blank" rel="noopener noreferrer"
                      className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl transition flex items-center gap-2">
                      <Download size={14}/> Télécharger
                    </a>
                  ) : (
                    <span className="text-gray-500 text-sm">Fichier non disponible</span>
                  )}
                </div>
              )}

              {/* ⚡ EXERCICE */}
              {activeLesson.content_type === "exercise" && (
                <div>
                  {activeLesson.content_url && (
                    <div className="bg-gray-800 rounded-2xl p-5 flex items-center gap-4 border border-orange-900/40 mb-4">
                      <div className="w-12 h-12 bg-orange-900/30 rounded-xl flex items-center justify-center flex-shrink-0">
                        <Zap size={22} className="text-orange-400" />
                      </div>
                      <div className="flex-1">
                        <p className="text-white font-semibold text-sm">Lab / Exercice pratique</p>
                        <a href={activeLesson.content_url} target="_blank" rel="noopener noreferrer"
                          className="text-orange-400 text-xs hover:text-orange-300 transition">{activeLesson.content_url}</a>
                      </div>
                      <a href={activeLesson.content_url} target="_blank" rel="noopener noreferrer"
                        className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white text-sm font-semibold rounded-xl transition">
                        Ouvrir →
                      </a>
                    </div>
                  )}
                  {activeLesson.article_content && <ArticleContent content={activeLesson.article_content} />}
                </div>
              )}

              {/* 🧠 QUIZ */}
              {activeLesson.content_type === "quiz" && (
                <div className="bg-gray-800 rounded-2xl p-8 text-center border border-purple-900/40">
                  <div className="w-16 h-16 bg-purple-900/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Brain size={30} className="text-purple-400" />
                  </div>
                  <p className="text-white font-bold text-lg mb-2">Quiz disponible</p>
                  <p className="text-gray-400 text-sm">Ce quiz est disponible dans l'onglet Quiz du cours.</p>
                </div>
              )}

              {/* Ressources attachées */}
              {activeLesson.resources?.length > 0 && (
                <div className="mt-5 bg-gray-800 rounded-2xl border border-gray-700 overflow-hidden">
                  <div className="flex items-center gap-2 px-5 py-3.5 border-b border-gray-700">
                    <Paperclip size={15} className="text-gray-400" />
                    <p className="text-gray-300 font-semibold text-sm">Ressources ({activeLesson.resources.length})</p>
                  </div>
                  <div className="divide-y divide-gray-700/50">
                    {activeLesson.resources.map((r, i) => (
                      <a key={i} href={r.url || r.file_url} target="_blank" rel="noopener noreferrer"
                        className="flex items-center gap-3 px-5 py-3 hover:bg-gray-700/30 transition group">
                        <span className="text-base">{r.file_type==="pdf"?"📄":r.file_type==="zip"?"🗜":"📎"}</span>
                        <span className="flex-1 text-indigo-400 group-hover:text-indigo-300 text-sm transition">{r.title || r.url}</span>
                        <Download size={13} className="text-gray-600 group-hover:text-gray-400 flex-shrink-0" />
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {/* ── Boutons de navigation bas ── */}
              <div className="flex items-center gap-3 mt-6 pt-5 border-t border-gray-700/50">
                <button onClick={goToPrev} disabled={currentIdx<=0}
                  className="flex items-center gap-2 px-4 py-3 border border-gray-700 text-gray-300 rounded-xl text-sm font-medium hover:bg-gray-800 transition disabled:opacity-30">
                  <ChevronLeft size={15}/> Précédente
                </button>

                <div className="flex-1 flex justify-center">
                  {completedLessons.has(activeLesson.id) ? (
                    <div className="flex items-center gap-2 px-5 py-3 bg-green-600/15 border border-green-600/30 text-green-400 rounded-xl text-sm font-medium">
                      <CheckCircle size={15}/> Leçon terminée
                    </div>
                  ) : (
                    <button onClick={handleMarkComplete} disabled={completing}
                      className="flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold transition disabled:opacity-60">
                      {completing ? (
                        <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Enregistrement…</>
                      ) : (
                        <><CheckCircle size={15}/> Marquer comme terminée</>
                      )}
                    </button>
                  )}
                </div>

                <button onClick={goToNext} disabled={currentIdx>=totalLessons-1}
                  className="flex items-center gap-2 px-4 py-3 border border-gray-700 text-gray-300 rounded-xl text-sm font-medium hover:bg-gray-800 transition disabled:opacity-30">
                  Suivante <ChevronRight size={15}/>
                </button>
              </div>

            </div>
          )}
        </main>
      </div>
    </div>
  );
}