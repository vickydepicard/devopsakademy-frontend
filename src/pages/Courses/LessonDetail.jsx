import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import {
  FileText, Download, ExternalLink, Film, HelpCircle,
  ChevronLeft, ChevronRight, CheckCircle, Clock, Loader
} from "lucide-react";
import { FileTypeIcon } from "../../components/UI/Icons";
import { useTranslation } from "react-i18next";
import i18n from "../../i18n";

// ─── Helpers ───────────────────────────────────────────────
const getYtId = (url) => {
  const m = url?.match(/(?:v=|youtu\.be\/|embed\/)([^&?/]+)/);
  return m ? m[1] : null;
};
const normalizeUrl = (url) => {
  if (!url) return null;
  if (url.startsWith("/")) return url;
  try {
    const u = new URL(url);
    if (u.hostname === "localhost" || u.hostname === "127.0.0.1") return u.pathname;
    return url;
  } catch { return url; }
};
const isPdf  = (url) => /\.pdf(\?|$)/i.test(url || "");
const isVid  = (url) => /\.(mp4|webm|ogg|mov)(\?|$)/i.test(url || "");
const ext    = (url) => (url || "").split(".").pop().split("?")[0].toLowerCase();

const FILE_ICONS = () => ({
  pdf:  { icon: "pdf", color: "text-red-400",    bg: "bg-red-900/20",    label: "PDF" },
  docx: { icon: "doc", color: "text-blue-400",   bg: "bg-blue-900/20",   label: i18n.t("lessonDetail:word") },
  doc:  { icon: "doc", color: "text-blue-400",   bg: "bg-blue-900/20",   label: i18n.t("lessonDetail:word") },
  pptx: { icon: "ppt", color: "text-orange-400", bg: "bg-orange-900/20", label: i18n.t("lessonDetail:slides") },
  ppt:  { icon: "ppt", color: "text-orange-400", bg: "bg-orange-900/20", label: i18n.t("lessonDetail:slides") },
  xlsx: { icon: "xls", color: "text-green-400",  bg: "bg-green-900/20",  label: i18n.t("lessonDetail:excel") },
  zip:  { icon: "zip", color: "text-yellow-400", bg: "bg-yellow-900/20", label: i18n.t("lessonDetail:archive") },
  mp4:  { icon: "mp4", color: "text-purple-400", bg: "bg-purple-900/20", label: i18n.t("lessonDetail:video") },
  mp3:  { icon: "mp3", color: "text-pink-400",   bg: "bg-pink-900/20",   label: i18n.t("lessonDetail:audio") },
});
const fileInfo = (url) => FILE_ICONS()[ext(url)] || { icon: "file", color: "text-gray-400", bg: "bg-gray-800", label: i18n.t("lessonDetail:fichier") };
const fmtSize  = (b) => !b ? "" : b < 1024*1024 ? `${(b/1024).toFixed(0)} Ko` : `${(b/1024/1024).toFixed(1)} Mo`;

export default function LessonDetail() {
  const { t } = useTranslation("lessonDetail");
  const { id, lessonId } = useParams();
  const { token } = useAuth();
  const navigate  = useNavigate();

  const [lesson,  setLesson]  = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);
  const [marking, setMarking] = useState(false);
  const [marked,  setMarked]  = useState(false);

  useEffect(() => {
    if (!id || !lessonId || !token) return;
    setLoading(true);
    fetch(`/api/courses/${id}/lessons/${lessonId}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => r.json())
      .then(data => {
        if (data.success) {
          setLesson(data.data);
          setMarked(!!data.data?.progress?.is_completed);
        } else {
          setError(data.message || t("lecon_introuvable"));
        }
      })
      .catch(() => setError(t("erreur_de_connexion")))
      .finally(() => setLoading(false));
  }, [id, lessonId, token]);

  const handleMarkDone = async () => {
    setMarking(true);
    try {
      await fetch(`/api/courses/${id}/lessons/${lessonId}/complete`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      setMarked(true);
    } catch (_) {}
    setMarking(false);
  };

  if (loading) return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center">
      <Loader className="w-8 h-8 text-[#5653e1] animate-spin" />
    </div>
  );

  if (error || !lesson) return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center text-white">
      <div className="text-center">
        
        <p className="font-bold text-lg mb-2">{error || t("lecon_introuvable")}</p>
        <button onClick={() => navigate(-1)}
          className="px-5 py-2.5 bg-[#2d287f] rounded-xl text-sm font-bold hover:bg-[#3b3aab] transition mt-3">{t("retour")}</button>
      </div>
    </div>
  );

  const contentUrl = normalizeUrl(lesson.content_url);
  const resources  = lesson.resources || [];
  const ytId       = getYtId(contentUrl || "");
  const hasVideo   = ytId || isVid(contentUrl || "");
  const hasPdf     = isPdf(contentUrl || "");
  const nav        = lesson.navigation || {};

  return (
    <div className="min-h-screen bg-gray-900">
      <div className="max-w-4xl mx-auto px-4 py-8">

        {/* ── Navigation retour ── */}
        <button onClick={() => navigate(`/courses/${id}/learn`)}
          className="flex items-center gap-1.5 text-[#5653e1] hover:text-[#2d287f] transition text-sm mb-6 font-semibold">
          <ChevronLeft className="w-4 h-4" />{" "}{t("retour_au_cours")}</button>

        {/* ── Titre ── */}
        <div className="mb-6">
          <h1 className="text-2xl font-black text-white leading-tight mb-2">{lesson.title}</h1>
          <div className="flex items-center gap-4 text-sm text-gray-400 flex-wrap">
            {lesson.duration_minutes > 0 && (
              <span className="flex items-center gap-1.5">
                <Clock className="w-4 h-4" />{" "}{i18n.t("lessonDetail:min", { vduration_minutes: lesson.duration_minutes })}</span>
            )}
            {lesson.content_type && (
              <span className="capitalize px-2 py-0.5 bg-gray-800 rounded-lg text-xs font-medium text-gray-300">
                {lesson.content_type === "video" ? t("video")
                  : lesson.content_type === "article" ? t("article")
                  : lesson.content_type === "quiz" ? t("quiz")
                  : lesson.content_type}
              </span>
            )}
            {marked && (
              <span className="flex items-center gap-1.5 text-emerald-400 text-xs font-semibold">
                <CheckCircle className="w-4 h-4" />{" "}{t("termine")}</span>
            )}
          </div>
        </div>

        {/* ── Vidéo ── */}
        {hasVideo && contentUrl && (
          <div className="rounded-2xl overflow-hidden bg-black aspect-video mb-6 shadow-2xl">
            {ytId ? (
              <iframe
                src={`https://www.youtube.com/embed/${ytId}?rel=0`}
                className="w-full h-full border-none"
                allowFullScreen title={lesson.title}
              />
            ) : (
              <video
                src={contentUrl} controls
                controlsList="nodownload"
                className="w-full h-full"
              />
            )}
          </div>
        )}

        {/* ── PDF inline ── */}
        {hasPdf && contentUrl && (
          <div className="bg-gray-800 rounded-2xl overflow-hidden border border-gray-700 mb-6">
            <div className="flex items-center justify-between px-5 py-3 border-b border-gray-700">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-red-400" />
                <span className="text-white font-semibold text-sm">{lesson.title}</span>
              </div>
              <a href={contentUrl} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-xs text-[#5653e1] hover:underline font-semibold">
                <ExternalLink className="w-3.5 h-3.5" />{" "}{t("ouvrir")}</a>
            </div>
            <div style={{ height: "600px" }}>
              <object
                data={`${contentUrl}#toolbar=0&navpanes=0`}
                type="application/pdf"
                className="w-full h-full"
                title={lesson.title}
              >
                <div className="flex flex-col items-center justify-center h-full gap-4 bg-gray-900 p-8 text-center">
                  <FileText className="w-16 h-16 text-red-400/40" />
                  <p className="text-gray-400 text-sm">{t("votre_navigateur_ne_peut_pas_afficher")}</p>
                  <a href={contentUrl} target="_blank" rel="noopener noreferrer"
                    className="px-5 py-2.5 bg-[#2d287f] text-white rounded-xl text-sm font-bold hover:bg-[#3b3aab] transition">{t("ouvrir_dans_un_nouvel_onglet")}</a>
                </div>
              </object>
            </div>
          </div>
        )}

        {/* ── Article texte ── */}
        {lesson.content_type === "article" && lesson.article_content && (
          <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700 mb-6">
            <div
              className="prose prose-invert prose-sm max-w-none text-gray-200 leading-relaxed
                prose-headings:text-white prose-h2:border-b prose-h2:border-gray-600 prose-h2:pb-2
                prose-p:text-gray-300 prose-p:leading-7 prose-a:text-[#5653e1]
                prose-code:bg-gray-900 prose-code:text-green-400 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded
                prose-pre:bg-gray-900 prose-pre:border prose-pre:border-gray-700 prose-pre:rounded-xl
                prose-blockquote:border-[#5653e1] prose-blockquote:bg-indigo-900/20
                prose-strong:text-white"
              dangerouslySetInnerHTML={{ __html: lesson.article_content }}
            />
          </div>
        )}

        {/* ── Aucun contenu mais il y a des ressources ── */}
        {!hasVideo && !hasPdf && !lesson.article_content && resources.length === 0 && (
          <div className="bg-gray-800 rounded-2xl p-8 text-center border border-dashed border-gray-700 mb-6">
            
            <p className="text-gray-300 font-semibold">{t("contenu_en_cours_de_redaction")}</p>
            <p className="text-gray-500 text-sm mt-1">{t("l_instructeur_n_a_pas_encore")}</p>
          </div>
        )}

        {/* ── Ressources attachées (PDFs, slides, ZIP, vidéos supplémentaires) ── */}
        {resources.length > 0 && (
          <div className="bg-gray-800 rounded-2xl border border-gray-700 overflow-hidden mb-6">
            <div className="px-5 py-3 border-b border-gray-700 flex items-center gap-2">
              
              <h3 className="text-white font-bold text-sm">{t("ressources", { length: resources.length })}</h3>
            </div>
            <div className="divide-y divide-gray-700/50">
              {resources.map((res, i) => {
                const info  = fileInfo(res.file_url);
                const url   = normalizeUrl(res.file_url);
                const isPdfRes = isPdf(res.file_url);
                const isVidRes = isVid(res.file_url);
                return (
                  <div key={res.id || i} className="flex items-center gap-4 px-5 py-3.5 hover:bg-gray-700/40 transition">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0 ${info.bg}`}>
                      <FileTypeIcon type={info.icon} className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-sm font-semibold truncate">
                        {res.title || res.file_url?.split("/").pop()}
                      </p>
                      <p className={`text-xs font-medium ${info.color} mt-0.5`}>
                        {info.label}{res.file_size ? ` · ${fmtSize(res.file_size)}` : ""}
                      </p>
                    </div>
                    {url && (
                      <div className="flex items-center gap-2 flex-shrink-0">
                        {isPdfRes && (
                          <a href={url} target="_blank" rel="noopener noreferrer"
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-700 hover:bg-gray-600 text-white text-xs font-semibold rounded-lg transition">
                            <ExternalLink className="w-3.5 h-3.5" />{" "}{t("voir")}</a>
                        )}
                        {isVidRes && (
                          <span className="px-3 py-1.5 bg-purple-900/40 text-purple-300 text-xs font-semibold rounded-lg">{t("video")}</span>
                        )}
                        {!isPdfRes && !isVidRes && (
                          <a href={url} download target="_blank" rel="noopener noreferrer"
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#2d287f] hover:bg-[#3b3aab] text-white text-xs font-semibold rounded-lg transition">
                            <Download className="w-3.5 h-3.5" />{" "}{t("telecharger")}</a>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── Actions + Navigation ── */}
        <div className="flex items-center justify-between gap-4 pt-4 border-t border-gray-800">
          {/* Précédent */}
          <button
            onClick={() => nav.previous_lesson_id && navigate(`/courses/${id}/lessons/${nav.previous_lesson_id}`)}
            disabled={!nav.previous_lesson_id}
            className="flex items-center gap-2 px-4 py-2.5 bg-gray-800 hover:bg-gray-700 disabled:opacity-30 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-xl transition">
            <ChevronLeft className="w-4 h-4" />{" "}{t("precedent")}</button>

          {/* Marquer comme terminé */}
          <button
            onClick={handleMarkDone}
            disabled={marking || marked}
            className={`flex items-center gap-2 px-5 py-2.5 text-sm font-bold rounded-xl transition ${
              marked
                ? "bg-emerald-800 text-emerald-300 cursor-default"
                : "bg-[#2d287f] hover:bg-[#3b3aab] text-white"
            }`}>
            {marking ? (
              <Loader className="w-4 h-4 animate-spin" />
            ) : (
              <CheckCircle className="w-4 h-4" />
            )}
            {marked ? t("termine_2") : t("marquer_comme_termine")}
          </button>

          {/* Suivant */}
          <button
            onClick={() => nav.next_lesson_id && navigate(`/courses/${id}/lessons/${nav.next_lesson_id}`)}
            disabled={!nav.next_lesson_id}
            className="flex items-center gap-2 px-4 py-2.5 bg-gray-800 hover:bg-gray-700 disabled:opacity-30 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-xl transition">{t("suivant")}{" "}<ChevronRight className="w-4 h-4" />
          </button>
        </div>

      </div>
    </div>
  );
}