// src/pages/Courses/CoursePreview.jsx
// Aperçu public — lecture vidéo, PDF inline, message si aucun contenu, toggle admin
import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import api from "../../api/api";
import { useAuth } from "../../contexts/AuthContext";
import {
  PlayCircle, Lock, BookOpen, Clock, Star, Users,
  ChevronLeft, AlertCircle, Eye, EyeOff, Award, ArrowRight,
  FileText, Film, HelpCircle, Dumbbell, CheckCircle,
  WifiOff, Settings, ToggleLeft, ToggleRight, Loader
} from "lucide-react";

// ─── Constantes ────────────────────────────────────────────
const LEVEL_LABELS = { beginner: "Débutant", intermediate: "Intermédiaire", advanced: "Avancé" };
const LEVEL_COLORS = {
  beginner:     "bg-emerald-100 text-emerald-700",
  intermediate: "bg-blue-100 text-blue-700",
  advanced:     "bg-purple-100 text-purple-700",
};
const CONTENT_TYPES = {
  video:    { icon: Film,       label: "Vidéo",     color: "text-blue-600",    bg: "bg-blue-50" },
  article:  { icon: FileText,   label: "Article",   color: "text-purple-600",  bg: "bg-purple-50" },
  quiz:     { icon: HelpCircle, label: "Quiz",      color: "text-amber-600",   bg: "bg-amber-50" },
  exercise: { icon: Dumbbell,   label: "Exercice",  color: "text-emerald-600", bg: "bg-emerald-50" },
};

// ─── Helpers URL ───────────────────────────────────────────
const KNOWN_DOMAINS = ["youtube.com", "youtu.be", "vimeo.com", "loom.com"];
const normalizeUrl = (url) => {
  if (!url) return null;
  if (url.startsWith("/")) return url;
  try {
    const u = new URL(url);
    if (u.hostname === "localhost" || u.hostname === "127.0.0.1") return u.pathname;
    if (KNOWN_DOMAINS.some(d => u.hostname.includes(d))) return url;
    if (u.hostname.endsWith("devopsakademy.com") && !u.hostname.startsWith("videos.") && !u.hostname.startsWith("img.")) return url;
    return null; // domaine inaccessible
  } catch { return null; }
};
const getYtId = (url) => {
  if (!url) return null;
  const m = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|v\/|shorts\/))([A-Za-z0-9_-]{11})/);
  return m ? m[1] : null;
};
const getYtThumb = (id) => `https://img.youtube.com/vi/${id}/maxresdefault.jpg`;
const isVideo = (url) => /\.(mp4|webm|ogg|mov|mkv|avi)(\?|$)/i.test(url || "");
const isPdf   = (url) => /\.pdf(\?|$)/i.test(url || "");
const formatDur = (h) => !h ? null : h < 1 ? `${Math.round(h * 60)} min` : `${h}h`;

// ─── Lecteur YouTube / MP4 avec poster cliquable ───────────
function VideoPlayer({ url, poster, title, duration }) {
  const [playing, setPlaying] = useState(false);
  const ytId = getYtId(url);
  useEffect(() => { setPlaying(false); }, [url]);

  return (
    <div className="aspect-video relative bg-black overflow-hidden">
      {!playing ? (
        <div className="absolute inset-0 cursor-pointer group" onClick={() => setPlaying(true)}>
          {ytId ? (
            <img src={getYtThumb(ytId)} alt={title} className="w-full h-full object-cover"
              onError={e => {
                if (!e.currentTarget.src.includes("hqdefault")) e.currentTarget.src = `https://img.youtube.com/vi/${ytId}/hqdefault.jpg`;
                else if (poster) e.currentTarget.src = poster;
              }} />
          ) : poster ? (
            <img src={poster} alt={title} className="w-full h-full object-cover"
              onError={e => { e.currentTarget.style.display = "none"; }} />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-[#1f1b5a] to-[#2d287f] flex items-center justify-center">
              <Film className="w-16 h-16 text-white/20" />
            </div>
          )}
          <div className="absolute inset-0 bg-black/25 group-hover:bg-black/45 transition-colors" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className={`w-20 h-20 rounded-full flex items-center justify-center shadow-2xl transition-all group-hover:scale-110 ${ytId ? "bg-red-600 group-hover:bg-red-500" : "bg-white/90 group-hover:bg-white"}`}>
              <svg className={`w-9 h-9 ml-1`} fill={ytId ? "white" : "#2d287f"} viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
            </div>
          </div>
          {duration > 0 && (
            <div className="absolute bottom-3 right-3 bg-black/70 text-white text-xs font-bold px-2 py-1 rounded">
              {duration} min
            </div>
          )}
        </div>
      ) : ytId ? (
        <iframe key={ytId}
          src={`https://www.youtube.com/embed/${ytId}?rel=0&modestbranding=1&autoplay=1`}
          className="absolute inset-0 w-full h-full border-0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen title={title} />
      ) : (
        <video key={url} src={url} controls autoPlay controlsList="nodownload"
          className="absolute inset-0 w-full h-full bg-black"
          poster={poster || undefined} />
      )}
    </div>
  );
}

// ─── Visionneuse PDF inline (sans téléchargement) ──────────
function PdfViewer({ url, title }) {
  // Embed le PDF via object tag — pas de bouton téléchargement
  // On empêche le clic droit et le menu contextuel
  return (
    <div className="relative bg-gray-100" style={{ height: "500px" }}>
      {/* Overlay invisible pour bloquer le clic droit */}
      <div
        className="absolute inset-0 z-10"
        onContextMenu={e => e.preventDefault()}
        style={{ pointerEvents: "none" }}
      />
      <object
        data={`${url}#toolbar=0&navpanes=0&scrollbar=1&statusbar=0&messages=0`}
        type="application/pdf"
        className="w-full h-full"
        title={title}
      >
        {/* Fallback si le navigateur ne peut pas afficher le PDF inline */}
        <div className="flex flex-col items-center justify-center h-full gap-4 bg-gray-50">
          <FileText className="w-16 h-16 text-[#2d287f]/30" />
          <p className="text-gray-600 font-semibold">{title}</p>
          <p className="text-gray-400 text-sm text-center max-w-xs">
            Votre navigateur ne supporte pas l'affichage PDF inline.<br />
            Inscrivez-vous pour accéder au contenu complet.
          </p>
        </div>
      </object>
    </div>
  );
}

// ─── Message "contenu indisponible" ────────────────────────
function NoContentMessage({ lesson, isAdmin, courseId, onTogglePreview, toggling }) {
  const ct = CONTENT_TYPES[lesson?.content_type] || CONTENT_TYPES.video;
  const Icon = ct.icon;
  return (
    <div className="aspect-video flex flex-col items-center justify-center gap-4 bg-gradient-to-br from-[#1f1b5a] to-[#2d287f] relative">
      <div className="w-20 h-20 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center">
        <WifiOff className="w-10 h-10 text-white/50" />
      </div>
      <div className="text-center text-white px-8 max-w-md">
        <p className="font-bold text-lg mb-1">Contenu non disponible</p>
        <p className="text-white/60 text-sm">
          {lesson
            ? `Aucun fichier n'a été associé à cette leçon aperçu (${ct.label}).`
            : "Aucune leçon aperçu n'a été configurée pour ce cours."}
        </p>
        {isAdmin && lesson && (
          <div className="mt-4 p-3 bg-white/10 rounded-xl text-xs text-white/70 border border-white/20">
            <Settings className="w-4 h-4 inline mr-1.5" />
            En tant qu'admin : uploadez une vidéo ou un fichier dans l'onglet "Fichiers" de cette leçon via le gestionnaire de cours.
          </div>
        )}
      </div>
      {isAdmin && lesson && (
        <button
          onClick={() => onTogglePreview(lesson.id, false)}
          disabled={toggling}
          className="flex items-center gap-2 bg-red-500/80 hover:bg-red-500 text-white text-xs font-semibold px-4 py-2 rounded-xl transition mt-2">
          {toggling ? <Loader className="w-3 h-3 animate-spin" /> : <EyeOff className="w-3 h-3" />}
          Retirer de l'aperçu
        </button>
      )}
    </div>
  );
}

// ─── Zone lecteur (dispatch selon type) ────────────────────
function ContentPlayer({ lesson, course, isAdmin, onTogglePreview, toggling }) {
  const url = normalizeUrl(lesson?.content_url);
  const ytId = getYtId(url);
  const isVid = ytId || isVideo(url || "");
  const isPdfFile = isPdf(url || "");

  if (!lesson) {
    return <NoContentMessage lesson={null} isAdmin={isAdmin} courseId={course?.id} onTogglePreview={onTogglePreview} toggling={toggling} />;
  }

  if (!url) {
    return <NoContentMessage lesson={lesson} isAdmin={isAdmin} courseId={course?.id} onTogglePreview={onTogglePreview} toggling={toggling} />;
  }

  if (isVid) {
    return (
      <VideoPlayer
        key={lesson.id}
        url={url}
        poster={course?.thumbnail_url}
        title={lesson.title}
        duration={lesson.duration_minutes}
      />
    );
  }

  if (isPdfFile) {
    return <PdfViewer url={url} title={lesson.title} />;
  }

  // Autre type (article, quiz, exercise) avec URL → placeholder
  const ct = CONTENT_TYPES[lesson.content_type] || CONTENT_TYPES.article;
  const Icon = ct.icon;
  return (
    <div className="aspect-video flex flex-col items-center justify-center gap-4 bg-gradient-to-br from-[#1f1b5a] to-[#2d287f]">
      <div className="w-20 h-20 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center">
        <Icon className="w-10 h-10 text-white/60" />
      </div>
      <div className="text-center text-white px-6">
        <p className="font-bold text-lg">{lesson.title}</p>
        <p className="text-white/50 text-sm mt-1">Ce type de contenu est accessible après inscription</p>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// PAGE PRINCIPALE
// ═══════════════════════════════════════════════════════════
export default function CoursePreview() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const isAdmin = user?.role === "admin" || user?.role === "instructor";

  const [course,       setCourse]     = useState(null);
  const [activeLesson, setActive]     = useState(null);
  const [loading,      setLoading]    = useState(true);
  const [error,        setError]      = useState(null);
  const [toggling,     setToggling]   = useState(null); // lesson id en cours de toggle
  const playerRef = useRef(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const res  = await api.get(`/courses/${id}/preview`);
      const data = res.data?.data || res.data;
      if (!data) { setError("Cours introuvable."); return; }
      setCourse(data);
      const allLessons = (data.modules || []).flatMap(m => m.lessons || []);
      const first = allLessons.find(l => l.is_preview) || data.first_lesson_preview;
      setActive(prev => {
        // Garder la leçon active si on recharge (après toggle), sinon prendre la première
        if (prev) return allLessons.find(l => l.id === prev.id) || first || null;
        return first || null;
      });
    } catch (err) {
      setError(err.response?.status === 404 ? "Ce cours est introuvable." : "Erreur de connexion au serveur.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [id]);

  // ── Toggle aperçu d'une leçon (admin/instructor) ──────────
  const handleTogglePreview = async (lessonId, newValue) => {
    setToggling(lessonId);
    try {
      await api.patch(`/admin/lessons/${lessonId}`, { is_preview: newValue ? 1 : 0 });
      await load(); // recharger
    } catch { alert("Erreur lors de la modification."); }
    setToggling(null);
  };

  const handleSelectLesson = (lesson) => {
    setActive(lesson);
    playerRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  if (loading) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="w-10 h-10 border-4 border-[#2d287f] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-gray-500 text-sm">Chargement…</p>
      </div>
    </div>
  );

  if (error || !course) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl p-10 text-center max-w-sm shadow border border-gray-100">
        <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
        <p className="font-semibold text-gray-800 mb-4">{error || "Cours non disponible"}</p>
        <button onClick={() => navigate("/courses")}
          className="px-5 py-2.5 bg-[#2d287f] text-white rounded-xl text-sm font-semibold hover:bg-[#3b3aab] transition">
          ← Retour au catalogue
        </button>
      </div>
    </div>
  );

  const isFree = course.is_free === 1 || Number(course.price || 0) === 0;
  const level  = LEVEL_LABELS[course.level];
  const allLessons     = (course.modules || []).flatMap(m => m.lessons || []);
  const previewLessons = allLessons.filter(l => l.is_preview);
  const totalLessons   = (course.modules || []).reduce((s, m) => s + (m.lesson_count || (m.lessons || []).length), 0);
  const ct = CONTENT_TYPES[activeLesson?.content_type] || CONTENT_TYPES.video;

  return (
    <div className="min-h-screen bg-gray-50">

      {/* ── Bandeau admin ── */}
      {isAdmin && (
        <div className="bg-amber-50 border-b border-amber-200 px-6 py-2 flex items-center gap-3 text-sm text-amber-800">
          <Settings className="w-4 h-4 shrink-0" />
          <span className="font-semibold">Mode admin</span>
          <span className="text-amber-600">— Vous pouvez activer/désactiver l'aperçu de chaque leçon via le bouton <Eye className="w-3.5 h-3.5 inline" /> dans le programme ci-dessous.</span>
        </div>
      )}

      {/* ── Header ── */}
      <div className="bg-gradient-to-br from-[#1f1b5a] to-[#2d287f] text-white px-6 py-10">
        <div className="max-w-5xl mx-auto">
          <button onClick={() => navigate(`/courses/${id}`)}
            className="flex items-center gap-2 text-white/60 hover:text-white text-sm mb-6 transition">
            <ChevronLeft className="w-4 h-4" /> Retour au cours
          </button>
          <div className="flex items-center gap-3 mb-3 flex-wrap">
            <span className="bg-[#facc15] text-[#1f1b5a] text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
              <Eye className="w-3 h-3" /> Aperçu gratuit
            </span>
            {level && <span className={`text-xs font-semibold px-3 py-1 rounded-full ${LEVEL_COLORS[course.level]}`}>{level}</span>}
          </div>
          <h1 className="text-2xl lg:text-3xl font-black mb-3">{course.title}</h1>
          <p className="text-white/65 text-sm mb-5 max-w-2xl leading-relaxed">
            {course.short_description || course.description?.substring(0, 160)}
          </p>
          <div className="flex items-center gap-5 text-sm text-white/60 flex-wrap">
            {course.rating > 0 && (
              <span className="flex items-center gap-1.5">
                <Star className="w-4 h-4 fill-[#facc15] text-[#facc15]" />
                <strong className="text-white">{parseFloat(course.rating).toFixed(1)}</strong>
              </span>
            )}
            {(course.student_count || 0) > 0 && <span className="flex items-center gap-1.5"><Users className="w-4 h-4" /> {course.student_count} étudiants</span>}
            {course.duration_hours && <span className="flex items-center gap-1.5"><Clock className="w-4 h-4" /> {formatDur(course.duration_hours)}</span>}
            {totalLessons > 0 && <span className="flex items-center gap-1.5"><BookOpen className="w-4 h-4" /> {totalLessons} leçons</span>}
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-8 grid lg:grid-cols-3 gap-8">

        {/* ── Contenu principal ── */}
        <div className="lg:col-span-2 space-y-6">

          {/* Lecteur */}
          <div ref={playerRef} className="bg-gray-900 rounded-2xl overflow-hidden shadow-2xl">
            <ContentPlayer
              lesson={activeLesson}
              course={course}
              isAdmin={isAdmin}
              onTogglePreview={handleTogglePreview}
              toggling={toggling}
            />
            {/* Info sous le lecteur */}
            <div className="p-5">
              <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                <span className="text-[#facc15] text-xs font-bold uppercase tracking-wide">APERÇU · LEÇON GRATUITE</span>
                {activeLesson && (
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${ct.bg} ${ct.color}`}>{ct.label}</span>
                )}
              </div>
              <h3 className="text-white font-bold text-lg leading-snug">
                {activeLesson?.title || course.title}
              </h3>
              {(activeLesson?.duration_minutes || 0) > 0 && (
                <p className="text-gray-400 text-sm mt-1.5 flex items-center gap-1.5">
                  <Clock className="w-4 h-4" /> {activeLesson.duration_minutes} min
                </p>
              )}
              {previewLessons.length > 1 && (
                <p className="text-gray-500 text-xs mt-2">
                  {previewLessons.length} leçons en aperçu — cliquez sur une leçon ci-dessous pour la sélectionner
                </p>
              )}
            </div>
          </div>

          {/* Programme */}
          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
              <h2 className="font-bold text-gray-900">Programme du cours</h2>
              <span className="text-xs text-[#2d287f] bg-[#2d287f]/8 px-2.5 py-1 rounded-full font-medium">
                {previewLessons.length} aperçu{previewLessons.length > 1 ? "s" : ""} gratuit{previewLessons.length > 1 ? "s" : ""}
              </span>
            </div>

            {(course.modules || []).length === 0 ? (
              <div className="p-8 text-center text-gray-400 text-sm">Programme en cours de finalisation</div>
            ) : (
              <div className="divide-y divide-gray-50">
                {course.modules.map((mod, mi) => (
                  <div key={mod.id || mi}>
                    {/* En-tête module */}
                    <div className="px-5 py-3 bg-gray-50 flex items-center justify-between">
                      <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">
                        Module {mi + 1} · {mod.title}
                      </p>
                      <span className="text-xs text-gray-400">
                        {mod.lesson_count || (mod.lessons || []).length} leçon{((mod.lesson_count || (mod.lessons || []).length) > 1) ? "s" : ""}
                      </span>
                    </div>

                    {/* Leçons */}
                    {(mod.lessons || []).map((les, li) => {
                      const lt      = CONTENT_TYPES[les.content_type] || CONTENT_TYPES.video;
                      const LIcon   = lt.icon;
                      const isPreview = !!les.is_preview;
                      const isActive  = activeLesson?.id === les.id;
                      const isToggling = toggling === les.id;
                      const hasContent = !!normalizeUrl(les.content_url);

                      return (
                        <div key={les.id || li}
                          onClick={() => isPreview && handleSelectLesson(les)}
                          className={`flex items-center gap-3 px-5 py-3.5 transition-all ${
                            isPreview ? "cursor-pointer hover:bg-[#2d287f]/4" : "cursor-default"
                          } ${isActive ? "bg-[#2d287f]/8 border-l-2 border-[#2d287f]" : ""}`}>

                          {/* Icône type */}
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 transition ${
                            isActive  ? "bg-[#2d287f] shadow-md" :
                            isPreview ? lt.bg : "bg-gray-100"
                          }`}>
                            {isActive
                              ? <LIcon className="w-4 h-4 text-white" />
                              : isPreview
                                ? <LIcon className={`w-4 h-4 ${lt.color}`} />
                                : <Lock className="w-3.5 h-3.5 text-gray-400" />
                            }
                          </div>

                          {/* Titre + sous-titre */}
                          <div className="flex-1 min-w-0">
                            <p className={`text-sm truncate leading-snug ${
                              isActive  ? "font-bold text-[#2d287f]" :
                              isPreview ? "font-medium text-gray-800" :
                              "text-gray-400"
                            }`}>
                              {les.title}
                            </p>
                            <p className="text-xs text-gray-400 mt-0.5">
                              {lt.label}{les.duration_minutes > 0 ? ` · ${les.duration_minutes} min` : ""}
                              {isPreview && !hasContent && (
                                <span className="ml-1.5 text-orange-500 font-medium">· Aucun contenu</span>
                              )}
                            </p>
                          </div>

                          {/* Droite : badge + toggle admin */}
                          <div className="flex items-center gap-2 flex-shrink-0">
                            {isActive ? (
                              <span className="text-xs bg-[#2d287f] text-white px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
                                <PlayCircle className="w-3 h-3" /> En cours
                              </span>
                            ) : isPreview ? (
                              <span className="text-xs bg-[#2d287f]/10 text-[#2d287f] px-2 py-0.5 rounded-full font-medium">Aperçu</span>
                            ) : (
                              <Lock className="w-3.5 h-3.5 text-gray-300" />
                            )}

                            {/* Toggle admin visible sur toutes les leçons */}
                            {isAdmin && (
                              <button
                                onClick={e => { e.stopPropagation(); handleTogglePreview(les.id, !isPreview); }}
                                disabled={isToggling}
                                title={isPreview ? "Désactiver l'aperçu" : "Activer l'aperçu"}
                                className={`p-1 rounded-lg transition flex items-center gap-1 text-xs font-semibold ${
                                  isPreview
                                    ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-200"
                                    : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                                }`}>
                                {isToggling
                                  ? <Loader className="w-3.5 h-3.5 animate-spin" />
                                  : isPreview
                                    ? <ToggleRight className="w-4 h-4" />
                                    : <ToggleLeft className="w-4 h-4" />
                                }
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
            )}

            {/* Bannière CTA */}
            {previewLessons.length < totalLessons && (
              <div className="p-5 border-t border-gray-100 flex items-center gap-4 bg-gradient-to-r from-[#2d287f]/5 to-transparent">
                <Lock className="w-5 h-5 text-[#2d287f] shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-800">
                    {totalLessons - previewLessons.length} leçon{(totalLessons - previewLessons.length) > 1 ? "s" : ""} verrouillée{(totalLessons - previewLessons.length) > 1 ? "s" : ""}
                  </p>
                  <p className="text-xs text-gray-500">Inscrivez-vous pour accéder au contenu complet</p>
                </div>
                <button onClick={() => navigate(`/courses/${id}`)}
                  className="shrink-0 px-4 py-2 text-xs font-bold text-white rounded-xl transition hover:opacity-90"
                  style={{ background: "linear-gradient(135deg,#2d287f,#5653e1)" }}>
                  S'inscrire →
                </button>
              </div>
            )}
          </div>
        </div>

        {/* ── Sidebar ── */}
        <div className="space-y-4">
          <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm sticky top-4">
            <div className="mb-5">
              {isFree
                ? <p className="text-3xl font-black text-emerald-600">Gratuit</p>
                : <p className="text-3xl font-black text-[#1f1b5a]">{parseFloat(course.price || 0).toLocaleString("fr-FR")} FCFA</p>
              }
              <p className="text-xs text-gray-400 mt-1">Accès à vie · Certificat inclus</p>
            </div>
            <div className="space-y-3 mb-5">
              <button onClick={() => navigate(`/courses/${id}`)}
                className="w-full py-3.5 rounded-2xl font-black text-white flex items-center justify-center gap-2 text-base hover:shadow-xl hover:-translate-y-0.5 transition-all"
                style={{ background: "linear-gradient(135deg,#2d287f,#5653e1)" }}>
                {isAuthenticated ? "S'inscrire au cours" : "Commencer maintenant"}
                <ArrowRight className="w-5 h-5" />
              </button>
              <Link to={`/courses/${id}`}
                className="w-full py-3 rounded-2xl font-semibold text-sm border-2 border-[#2d287f]/25 text-[#2d287f] flex items-center justify-center gap-2 hover:border-[#2d287f] hover:bg-[#2d287f]/5 transition">
                <BookOpen className="w-4 h-4" /> Voir le détail du cours
              </Link>
            </div>
            <div className="space-y-2.5 text-sm text-gray-600 border-t border-gray-100 pt-4">
              {[
                [Clock,    `${formatDur(course.duration_hours) || "—"} de contenu`],
                [BookOpen, `${totalLessons} leçon${totalLessons > 1 ? "s" : ""}`],
                [Eye,      `${previewLessons.length} aperçu${previewLessons.length > 1 ? "s" : ""} gratuit${previewLessons.length > 1 ? "s" : ""}`],
                [Award,    "Certificat officiel inclus"],
              ].map(([Icon, label]) => (
                <div key={label} className="flex items-center gap-2.5">
                  <Icon className="w-4 h-4 text-[#2d287f]" />
                  {label}
                </div>
              ))}
            </div>

            {/* Liste rapide des leçons aperçu */}
            {previewLessons.length > 0 && (
              <div className="mt-4 pt-4 border-t border-gray-100">
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">Leçons aperçu</p>
                <div className="space-y-2">
                  {previewLessons.map(les => {
                    const isActive = activeLesson?.id === les.id;
                    const lt = CONTENT_TYPES[les.content_type] || CONTENT_TYPES.video;
                    const LIcon = lt.icon;
                    const hasContent = !!normalizeUrl(les.content_url);
                    return (
                      <button key={les.id} onClick={() => handleSelectLesson(les)}
                        className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-left transition-all text-sm ${
                          isActive ? "bg-[#2d287f] text-white shadow-md" : "hover:bg-[#2d287f]/8 text-gray-700 border border-gray-100"
                        }`}>
                        <LIcon className={`w-4 h-4 shrink-0 ${isActive ? "text-white" : lt.color}`} />
                        <span className="truncate flex-1">{les.title}</span>
                        {!hasContent && <span className="text-orange-400 text-xs">!</span>}
                        {isActive && <CheckCircle className="w-4 h-4 shrink-0 text-white/70" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}