// src/pages/Courses/CourseLearn.jsx — Lecteur de cours (thème clair)
import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import api from "../../api/api";
import {
  ChevronLeft, ChevronRight, CheckCircle2, Play, FileText, HelpCircle, Wrench,
  Film, Clock, AlertCircle, ChevronDown, Circle, Download, Eye, ListChecks,
} from "lucide-react";
import { FileTypeIcon } from "../../components/UI/Icons";
import { useTranslation } from "react-i18next";
import useFeedback, { apiError } from "../../components/Common/useFeedback";

const TYPE_ICON = { video: Film, article: FileText, quiz: HelpCircle, exercise: Wrench };

const getYtId = (url) => (url || "").match(/(?:v=|youtu\.be\/|embed\/)([^&?/]+)/)?.[1] || null;
const normalUrl = (url) => {
  if (!url) return null;
  if (url.startsWith("/")) return url;
  try {
    const u = new URL(url);
    if (u.hostname === "localhost" || u.hostname === "127.0.0.1") return u.pathname;
    return url;
  } catch { return url; }
};
const isPdf = (url) => /\.pdf(\?|$)/i.test(url || "");
const isVid = (url) => /\.(mp4|webm|ogg|mov)(\?|$)/i.test(url || "");
const fmtDur = (min) => !min ? "" : min < 60 ? `${min} min` : `${Math.floor(min / 60)} h${min % 60 > 0 ? ` ${min % 60}` : ""}`;
const fmtSz = (b) => !b ? "" : b < 1048576 ? `${(b / 1024).toFixed(0)} Ko` : `${(b / 1048576).toFixed(1)} Mo`;
const extOf = (url) => (url || "").split("?")[0].split(".").pop().toLowerCase();
const ICON_BY_EXT = { pdf: "pdf", doc: "doc", docx: "doc", ppt: "ppt", pptx: "ppt", xls: "xls", xlsx: "xls", zip: "zip", mp4: "mp4", mp3: "mp3" };

const card = "bg-white border border-slate-200 rounded-lg";

// ─── Lecteur vidéo ─────────────────────────────────────────
function VideoPlayer({ url, title }) {
  const { t } = useTranslation("courseLearn");
  const [playing, setPlaying] = useState(false);
  const ytId = getYtId(url || "");
  useEffect(() => { setPlaying(false); }, [url]);

  if (!url) return (
    <div className="aspect-video bg-slate-100 flex items-center justify-center text-slate-400">
      <div className="text-center"><Film className="w-10 h-10 mx-auto mb-2" /><p className="text-sm">{t("video_non_disponible")}</p></div>
    </div>
  );

  return (
    <div className="aspect-video bg-slate-900 relative">
      {!playing ? (
        <button type="button" onClick={() => setPlaying(true)} className="absolute inset-0 w-full h-full group bg-slate-900" aria-label={title}>
          {ytId && <img src={`https://img.youtube.com/vi/${ytId}/hqdefault.jpg`} alt="" className="w-full h-full object-cover opacity-90" />}
          <span className="absolute inset-0 flex items-center justify-center">
            <span className="w-16 h-16 rounded-full bg-white shadow-md flex items-center justify-center group-hover:scale-105 transition-transform">
              <Play className="w-6 h-6 text-primary fill-primary ml-0.5" />
            </span>
          </span>
        </button>
      ) : ytId ? (
        <iframe key={ytId} src={`https://www.youtube.com/embed/${ytId}?autoplay=1&rel=0&modestbranding=1`}
          className="absolute inset-0 w-full h-full border-none" allowFullScreen title={title} />
      ) : (
        <video key={url} src={url} autoPlay controls controlsList="nodownload" className="absolute inset-0 w-full h-full" />
      )}
    </div>
  );
}

// ─── Ressources téléchargeables ────────────────────────────
function Resources({ resources, onDownload, busyId }) {
  const { t } = useTranslation("courseLearn");
  if (!resources.length) return null;
  return (
    <section className={`${card} mt-6`}>
      <header className="flex items-center justify-between px-5 py-3.5 border-b border-slate-200">
        <h2 className="text-sm font-semibold text-slate-900">{t("ressources_a_telecharger")}</h2>
        <span className="text-xs text-slate-500">{resources.length}</span>
      </header>
      <ul className="divide-y divide-slate-100">
        {resources.map((r) => {
          const ext = extOf(r.file_url);
          return (
            <li key={r.id} className="flex items-center gap-4 px-5 py-3.5">
              <span className="flex-shrink-0 w-9 h-9 rounded-md bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-600">
                <FileTypeIcon type={ICON_BY_EXT[ext] || "file"} className="w-5 h-5" />
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-900 truncate">{r.title || r.file_url?.split("/").pop()}</p>
                <p className="text-xs text-slate-500 mt-0.5">{ext ? ext.toUpperCase() : t("fichier")}{r.file_size ? ` · ${fmtSz(r.file_size)}` : ""}</p>
              </div>
              <button type="button" onClick={() => onDownload(r)} disabled={busyId === r.id}
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-md border border-slate-300 bg-white text-sm font-medium text-slate-800 hover:bg-slate-50 hover:border-primary hover:text-primary transition disabled:opacity-50">
                <Download className="w-4 h-4" />{t("telecharger")}
              </button>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

// ─── Élément de leçon (sidebar) ────────────────────────────
function LessonItem({ lesson, isActive, isDone, onClick }) {
  const Icon = TYPE_ICON[lesson.content_type] || FileText;
  return (
    <button type="button" onClick={onClick}
      className={`w-full flex items-start gap-3 px-4 py-2.5 text-left bg-transparent border-l-2 transition ${
        isActive ? "bg-primary/5 border-primary" : "border-transparent hover:bg-slate-50"}`}>
      <span className="mt-0.5 flex-shrink-0">
        {isDone ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <Circle className="w-4 h-4 text-slate-300" />}
      </span>
      <span className="flex-1 min-w-0">
        <span className={`block text-sm leading-snug ${isActive ? "text-primary font-semibold" : "text-slate-700"}`}>{lesson.title}</span>
        <span className="flex items-center gap-1.5 mt-0.5 text-xs text-slate-400">
          <Icon className="w-3 h-3" />
          {lesson.duration_minutes > 0 && fmtDur(lesson.duration_minutes)}
        </span>
      </span>
    </button>
  );
}

// ═══════════════ PAGE ═══════════════
export default function CourseLearn() {
  const { t } = useTranslation("courseLearn");
  const { id } = useParams();
  const navigate = useNavigate();
  const { ui, notify } = useFeedback();

  const [course, setCourse] = useState(null);
  const [modules, setModules] = useState([]);
  const [activeLesson, setActive] = useState(null);
  const [completed, setCompleted] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [completing, setCompleting] = useState(false);
  const [collapsed, setCollapsed] = useState({});
  const [teacherMode, setTeacherMode] = useState(false);
  const [busyId, setBusyId] = useState(null);

  const selectLesson = useCallback(async (lesson) => {
    setActive(lesson);
    try {
      const r = await api.get(`/courses/${id}/lessons/${lesson.id}`);
      const full = r.data?.data;
      if (full?.teacher_mode) setTeacherMode(true);
      if (full) setActive((prev) => (prev?.id === lesson.id ? { ...lesson, ...full } : prev));
    } catch (_) { /* le contenu de base reste affiché */ }
  }, [id]);

  const load = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const [cRes, mRes] = await Promise.all([api.get(`/courses/${id}`), api.get(`/courses/${id}/modules`)]);
      const courseData = cRes.data?.data || cRes.data;
      const raw = mRes.data?.data || mRes.data;
      const modulesData = Array.isArray(raw) ? raw : (raw?.modules || []);
      if (mRes.data?.teacher_mode) setTeacherMode(true);
      setCourse(courseData); setModules(modulesData);

      let doneSet = new Set(modulesData.flatMap((m) => (m.lessons || []).filter((l) => l.is_completed || l.completed).map((l) => l.id)));
      try {
        const pRes = await api.get(`/courses/${id}/progress`);
        const fromP = new Set((pRes.data?.data || []).flatMap((m) => (m.lessons || []).filter((l) => l.completed || l.is_completed).map((l) => l.id)));
        if (fromP.size > 0) doneSet = fromP;
      } catch (_) { /* optionnel */ }
      setCompleted(doneSet);

      const all = modulesData.flatMap((m) => m.lessons || []);
      const first = all.find((l) => !doneSet.has(l.id)) || all[0];
      if (first) await selectLesson(first);
    } catch (err) {
      setError(err.response?.status === 403 ? "enrollment" : "server");
    } finally { setLoading(false); }
  }, [id, selectLesson]);

  useEffect(() => { load(); }, [load]);

  const allLessons = modules.flatMap((m) => m.lessons || []);
  const currentIdx = allLessons.findIndex((l) => l.id === activeLesson?.id);
  const total = allLessons.length;
  const doneCount = allLessons.filter((l) => completed.has(l.id)).length;
  const pct = total > 0 ? Math.round((doneCount / total) * 100) : 0;
  const go = (i) => { if (allLessons[i]) { selectLesson(allLessons[i]); window.scrollTo({ top: 0, behavior: "smooth" }); } };

  const handleComplete = async () => {
    if (!activeLesson || completing) return;
    setCompleting(true);
    try {
      await api.post(`/courses/${id}/lessons/${activeLesson.id}/complete`);
      setCompleted((prev) => new Set([...prev, activeLesson.id]));
      notify(t("lecon_terminee"), "success");
      if (allLessons[currentIdx + 1]) go(currentIdx + 1);
    } catch (e) { notify(apiError(e)); }
    setCompleting(false);
  };

  const handleDownload = async (r) => {
    setBusyId(r.id);
    try {
      const res = await api.post(`/courses/${id}/resources/${r.id}/download`);
      const url = normalUrl(res.data?.file_url || res.data?.data?.file_url || r.file_url);
      const a = document.createElement("a");
      a.href = url; a.download = r.title || ""; a.rel = "noopener"; a.target = "_blank";
      document.body.appendChild(a); a.click(); a.remove();
    } catch (e) { notify(apiError(e)); }
    setBusyId(null);
  };

  const Shell = ({ children }) => <div className="min-h-[60vh] flex items-center justify-center p-6">{children}</div>;

  if (loading) return <Shell><div className="text-center text-slate-500">
    <div className="w-9 h-9 border-[3px] border-primary border-t-transparent rounded-full animate-spin mx-auto mb-3" />
    <p className="text-sm">{t("chargement_du_cours")}</p></div></Shell>;

  if (error) return <Shell><div className={`${card} p-8 text-center max-w-md`}>
    <AlertCircle className="w-10 h-10 text-amber-500 mx-auto mb-4" />
    <h2 className="text-slate-900 font-semibold text-lg mb-2">{error === "enrollment" ? t("acces_non_autorise") : t("une_erreur_est_survenue")}</h2>
    {error === "enrollment" && <p className="text-slate-600 text-sm mb-5">{t("votre_inscription_est_en_attente_de")}</p>}
    <div className="flex gap-3 justify-center">
      {error === "enrollment" ? (<>
        <button onClick={() => navigate(`/courses/${id}`)} className="px-4 py-2 bg-primary text-white text-sm font-medium rounded-md hover:bg-primary-700">{t("voir_le_cours")}</button>
        <button onClick={() => navigate("/dashboard")} className="px-4 py-2 border border-slate-300 bg-white text-slate-700 text-sm font-medium rounded-md hover:bg-slate-50">{t("tableau_de_bord")}</button>
      </>) : <button onClick={load} className="px-4 py-2 bg-primary text-white text-sm font-medium rounded-md hover:bg-primary-700">{t("reessayer")}</button>}
    </div></div></Shell>;

  const lessonUrl = normalUrl(activeLesson?.content_url);
  const isVideo = activeLesson?.content_type === "video" || isVid(lessonUrl || "");
  const showPdf = isPdf(lessonUrl || "") && !isVideo && !activeLesson?.article_content;
  const resources = activeLesson?.resources || [];
  const isDone = completed.has(activeLesson?.id);
  const modOfActive = modules.find((m) => (m.lessons || []).some((l) => l.id === activeLesson?.id));

  return (
    <div className="bg-slate-50 text-left">
      {ui}
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-6">
        {/* Fil d'Ariane */}
        <div className="flex items-center gap-3 mb-5 min-w-0">
          <Link to={`/courses/${id}`} className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-primary flex-shrink-0">
            <ChevronLeft className="w-4 h-4" />{t("retour")}
          </Link>
          <span className="text-slate-300">/</span>
          <h1 className="text-sm font-semibold text-slate-900 truncate">{course?.title}</h1>
        </div>

        {teacherMode && (
          <div className="mb-5 flex items-start gap-3 rounded-lg border border-primary/20 bg-primary/5 px-4 py-3 text-sm text-slate-700">
            <Eye className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
            <p><strong className="font-semibold text-primary">{t("mode_enseignant")}</strong> — {t("mode_enseignant_desc")}</p>
          </div>
        )}

        <div className="grid lg:grid-cols-[minmax(0,1fr)_360px] gap-6 items-start">
          {/* ── Contenu ── */}
          <main className="min-w-0">
            {activeLesson ? (
              <>
                {(isVideo || showPdf) && (
                  <div className={`${card} overflow-hidden`}>
                    {isVideo ? <VideoPlayer url={lessonUrl} title={activeLesson.title} />
                      : <iframe src={`${lessonUrl}#toolbar=0&navpanes=0&view=FitH`} title={activeLesson.title} className="w-full border-none block" style={{ height: 640 }} />}
                  </div>
                )}

                <article className={`${card} p-6 md:p-8 ${(isVideo || showPdf) ? "mt-6" : ""}`}>
                  {modOfActive && <p className="text-xs font-semibold uppercase tracking-wide text-primary mb-2">{modOfActive.title}</p>}
                  <h2 className="text-2xl font-bold text-slate-900 leading-tight">{activeLesson.title}</h2>
                  <div className="flex items-center gap-4 mt-2 mb-6 text-sm text-slate-500 flex-wrap">
                    {activeLesson.content_type && (() => { const I = TYPE_ICON[activeLesson.content_type] || FileText;
                      return <span className="inline-flex items-center gap-1.5"><I className="w-4 h-4" />{t(activeLesson.content_type, { defaultValue: t("lecon") })}</span>; })()}
                    {activeLesson.duration_minutes > 0 && <span className="inline-flex items-center gap-1.5"><Clock className="w-4 h-4" />{fmtDur(activeLesson.duration_minutes)}</span>}
                    {isDone && <span className="inline-flex items-center gap-1.5 text-emerald-700 font-medium"><CheckCircle2 className="w-4 h-4" />{t("termine_2")}</span>}
                  </div>

                  {activeLesson.article_content ? (
                    <div className="lesson-content" dangerouslySetInnerHTML={{ __html: activeLesson.article_content }} />
                  ) : activeLesson.content_type === "quiz" ? (
                    <div className="rounded-lg border border-slate-200 bg-slate-50 p-6 text-center">
                      <ListChecks className="w-8 h-8 text-primary mx-auto mb-3" />
                      <p className="text-sm text-slate-600 mb-4">{t("quiz_intro")}</p>
                      {activeLesson.quiz_id ? (
                        <Link to={`/courses/${id}/quizzes/${activeLesson.quiz_id}`} className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-white text-sm font-medium rounded-md hover:bg-primary-700">{t("passer_le_quiz")}</Link>
                      ) : <p className="text-xs text-slate-400">{t("quiz_indisponible")}</p>}
                    </div>
                  ) : !isVideo && !showPdf && resources.length === 0 ? (
                    <div className="text-center py-10 text-slate-400">
                      <FileText className="w-9 h-9 mx-auto mb-3" />
                      <p className="font-medium text-slate-500">{t("contenu_en_cours_de_redaction")}</p>
                      <p className="text-sm mt-1">{t("l_instructeur_n_a_pas_encore")}</p>
                    </div>
                  ) : null}
                </article>

                <Resources resources={resources} onDownload={handleDownload} busyId={busyId} />

                {/* Navigation */}
                <div className="mt-6 flex items-center justify-between gap-3">
                  <button type="button" onClick={() => go(currentIdx - 1)} disabled={currentIdx <= 0}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-md border border-slate-300 bg-white text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed">
                    <ChevronLeft className="w-4 h-4" />{t("precedent")}
                  </button>
                  {!teacherMode && (
                    <button type="button" onClick={handleComplete} disabled={completing || isDone}
                      className={`inline-flex items-center gap-2 px-5 py-2 rounded-md text-sm font-medium transition ${
                        isDone ? "bg-emerald-50 text-emerald-700 border border-emerald-200 cursor-default" : "bg-primary text-white hover:bg-primary-700"}`}>
                      <CheckCircle2 className="w-4 h-4" />{isDone ? t("termine_2") : t("marquer_comme_termine")}
                    </button>
                  )}
                  <button type="button" onClick={() => go(currentIdx + 1)} disabled={currentIdx >= total - 1}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-md border border-slate-300 bg-white text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed">
                    {t("suivant")}<ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </>
            ) : (
              <div className={`${card} p-12 text-center text-slate-400`}><Film className="w-10 h-10 mx-auto mb-3" /><p>{t("selectionnez_une_lecon")}</p></div>
            )}
          </main>

          {/* ── Sommaire ── */}
          <aside className={`${card} lg:sticky lg:top-20 overflow-hidden`}>
            <div className="px-4 py-4 border-b border-slate-200">
              <h2 className="text-sm font-semibold text-slate-900 mb-3">{t("contenu_du_cours")}</h2>
              {!teacherMode && (
                <div className="flex items-center gap-3">
                  <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden"><div className="h-full bg-primary transition-all" style={{ width: `${pct}%` }} /></div>
                  <span className="text-xs text-slate-500 whitespace-nowrap">{pct}% · {doneCount}/{total}</span>
                </div>
              )}
            </div>
            <div className="max-h-[70vh] overflow-y-auto">
              {modules.map((mod, mi) => {
                const open = collapsed[mod.id] !== true;
                const ls = mod.lessons || [];
                return (
                  <div key={mod.id || mi} className="border-b border-slate-100 last:border-0">
                    <button type="button" onClick={() => setCollapsed((p) => ({ ...p, [mod.id]: open }))}
                      className="w-full flex items-center gap-3 px-4 py-3 bg-slate-50 hover:bg-slate-100 text-left transition">
                      <span className="flex-1 min-w-0">
                        <span className="block text-sm font-semibold text-slate-900 truncate">{mod.title}</span>
                        <span className="block text-xs text-slate-500 mt-0.5">{ls.filter((l) => completed.has(l.id)).length}/{ls.length}</span>
                      </span>
                      <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${open ? "rotate-180" : ""}`} />
                    </button>
                    {open && ls.map((l) => (
                      <LessonItem key={l.id} lesson={l} isActive={activeLesson?.id === l.id} isDone={completed.has(l.id)} onClick={() => go(allLessons.findIndex((x) => x.id === l.id))} />
                    ))}
                  </div>
                );
              })}
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
