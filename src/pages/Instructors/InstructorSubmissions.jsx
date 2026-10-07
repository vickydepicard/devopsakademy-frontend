import { useEffect, useState } from "react";
import api from "../../api/api";
import {
  FileText, Search, CheckCircle, Clock, XCircle,
  Eye, Send, Star, Download, Filter, User,
  BookOpen, Calendar, MessageSquare, ChevronDown, X, Loader
} from "lucide-react";
import { useTranslation } from "react-i18next";
import i18n from "../../i18n";
import useFeedback, { apiError } from "../../components/Common/useFeedback";
import { formatDate } from "../../utils/format";

const STATUS_CONFIG = () => ({
  pending:   { label: i18n.t("instructorSubmissions:a_corriger"),  color: "bg-yellow-100 text-yellow-700",  dot: "bg-yellow-500" },
  graded:    { label: i18n.t("instructorSubmissions:corrige"),     color: "bg-emerald-100 text-emerald-700", dot: "bg-emerald-500" },
  rejected:  { label: i18n.t("instructorSubmissions:rejete"),      color: "bg-red-100 text-red-600",         dot: "bg-red-500" },
});

const GradeModal = ({ submission, error, onSave, onClose }) => {
  const { t } = useTranslation("instructorSubmissions");
  const [grade, setGrade] = useState(submission?.grade ?? "");
  const [feedback, setFeedback] = useState(submission?.feedback || "");
  const [saving, setSaving] = useState(false);
  const [localError, setLocalError] = useState("");
  const link = submission.file_url || submission.submission_url;

  const handleSave = async () => {
    const n = Number(grade);
    if (grade === "" || !Number.isFinite(n) || n < 0 || n > 100) { setLocalError(t("note_entre_0_et_100")); return; }
    setLocalError("");
    setSaving(true);
    await onSave({ score: Math.round(n), feedback: feedback.trim() });
    setSaving(false);
  };

  const stars = [20, 40, 60, 80, 100];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/40 overflow-y-auto py-8">
      <div className="bg-white rounded-2xl shadow-hard w-full max-w-lg p-6 space-y-4 my-auto">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-gray-900">{t("corriger_le_devoir")}</h3>
          <button onClick={onClose} className="p-1.5 text-gray-400 hover:bg-gray-100 rounded-lg"><X className="w-4 h-4" /></button>
        </div>

        {/* Infos soumission */}
        <div className="bg-gray-50 rounded-xl p-4 space-y-2">
          <p className="text-sm font-semibold text-gray-800">{submission.course_title}</p>
          <p className="text-xs text-gray-500">{t("soumis_par")}{" "}<strong>{submission.first_name} {submission.last_name}</strong> ·{" "}
            {formatDate(submission.submitted_at)}
          </p>
          {submission.project_title && <p className="text-xs text-gray-500">{submission.project_title}</p>}
          {link && (
            <a href={link} target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs text-primary hover:underline font-medium">
              <Download className="w-3.5 h-3.5" />{" "}{t("telecharger_le_fichier")}</a>
          )}
          {submission.student_notes && (
            <p className="text-sm text-gray-700 bg-white border border-gray-200 rounded-lg p-3 max-h-32 overflow-y-auto whitespace-pre-wrap">
              {submission.student_notes}
            </p>
          )}
        </div>

        {/* Note rapide */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">{t("note_rapide")}</label>
          <div className="flex gap-2 flex-wrap">
            {stars.map((s) => (
              <button key={s} type="button" onClick={() => setGrade(s)}
                className={`px-3 py-1.5 rounded-lg text-sm font-semibold border-2 transition ${
                  parseFloat(grade) === s ? "border-primary bg-primary text-white" : "border-gray-200 text-gray-600 hover:border-primary"
                }`}>
                {s}/100
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">{t("note_sur_100")}{submission.pass_score != null && <span className="font-normal text-gray-400"> · {t("seuil_de_validation", { score: submission.pass_score })}</span>}</label>
          <input type="number" value={grade} onChange={(e) => setGrade(e.target.value)} min="0" max="100" step="1"
            placeholder={t("ex_15")}
            className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">{t("commentaire")}</label>
          <textarea value={feedback} onChange={(e) => setFeedback(e.target.value)} rows={4}
            placeholder={t("feedback_constructif_pour_l_etudiant")}
            className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none" />
        </div>

        {(localError || error) && <p className="text-sm text-red-600" role="alert">{localError || error}</p>}
        <div className="flex gap-3 justify-end">
          <button onClick={onClose} className="px-4 py-2 border border-gray-200 text-gray-600 rounded-xl text-sm hover:bg-gray-50 transition">{t("annuler")}</button>
          <button onClick={handleSave} disabled={saving || grade === ""}
            className="flex items-center gap-2 px-5 py-2 bg-primary text-white font-semibold rounded-xl text-sm hover:opacity-90 transition disabled:opacity-60">
            {saving ? <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> : <Send className="w-4 h-4" />}
            {saving ? t("envoi") : t("envoyer_la_note")}
          </button>
        </div>
      </div>
    </div>
  );
};

export default function InstructorSubmissions() {
  const { t } = useTranslation("instructorSubmissions");
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("pending");
  const [gradeModal, setGradeModal] = useState(null);
  const [gradeError, setGradeError] = useState("");
  const [loadError, setLoadError] = useState("");
  const { ui: feedbackUi } = useFeedback();

  useEffect(() => {
    document.title = t("devoirs_devopsakademy");
    fetchSubmissions();
  }, []);

  const fetchSubmissions = async () => {
    try {
      const res = await api.get("/instructor/submissions");
      setSubmissions(res.data?.data || []);
      setLoadError("");
    } catch (e) { setLoadError(apiError(e, t("erreur"))); }
    setLoading(false);
  };

  const handleGrade = async (data) => {
    try {
      await api.patch(`/instructor/submissions/${gradeModal.id}/grade`, data);
      await fetchSubmissions();
      setGradeModal(null); setGradeError("");
    } catch (e) { setGradeError(apiError(e, t("erreur_lors_de_la_notation"))); }
  };

  const filtered = submissions.filter((s) => {
    const name = `${s.first_name} ${s.last_name} ${s.course_title}`.toLowerCase();
    const matchSearch = name.includes(search.toLowerCase());
    const matchFilter = filter === "all" || s.status === filter;
    return matchSearch && matchFilter;
  });

  const counts = {
    all: submissions.length,
    pending: submissions.filter((s) => s.status === "pending").length,
    graded: submissions.filter((s) => s.status === "graded").length,
  };

  if (loading) return <div className="flex justify-center py-32"><Loader className="w-8 h-8 text-primary animate-spin" /></div>;

  return (
    <div className="max-w-6xl space-y-6">
      {feedbackUi}
      {gradeModal && <GradeModal submission={gradeModal} error={gradeError} onSave={handleGrade} onClose={() => { setGradeModal(null); setGradeError(""); }} />}

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">{t("devoirs_a_corriger")}</h1>
        <p className="text-gray-500 text-sm mt-0.5">{t("notez_et_commentez_les_travaux_de")}</p>
      </div>

      {loadError && <p className="text-sm text-red-600" role="alert">{loadError}</p>}

      {/* Stats rapides */}
      <div className="flex gap-3 flex-wrap">
        {[
          { key: "all", label: t("tous"), count: counts.all, color: "bg-gray-100 text-gray-700" },
          { key: "pending", label: t("a_corriger"), count: counts.pending, color: "bg-yellow-100 text-yellow-700" },
          { key: "graded", label: t("corriges"), count: counts.graded, color: "bg-emerald-100 text-emerald-700" },
        ].map(({ key, label, count, color }) => (
          <button key={key} onClick={() => setFilter(key)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 text-sm font-semibold transition ${
              filter === key ? "border-primary bg-primary text-white" : `${color} border-transparent hover:border-gray-300`
            }`}>
            {label}
            <span className={`text-xs px-2 py-0.5 rounded-full ${filter === key ? "bg-white/20 text-white" : "bg-white/60"}`}>{count}</span>
          </button>
        ))}
      </div>

      {/* Recherche */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder={t("rechercher_par_etudiant_ou_cours")}
          className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 bg-white" />
      </div>

      {/* Liste */}
      {filtered.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-2xl p-12 text-center">
          <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="font-semibold text-gray-600">
            {filter === "pending" ? t("aucun_devoir_en_attente") : t("aucun_devoir_trouve")}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((sub) => {
            const cfg = STATUS_CONFIG()[sub.status] || STATUS_CONFIG().pending;
            return (
              <div key={sub.id} className="bg-white border border-gray-100 rounded-2xl p-5 shadow-soft hover:shadow-medium transition-all flex items-start gap-4">
                {/* Avatar étudiant */}
                <div className="w-11 h-11 bg-primary rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0">
                  {sub.first_name?.[0]}{sub.last_name?.[0]}
                </div>

                {/* Infos */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 flex-wrap">
                    <div>
                      <p className="font-semibold text-gray-900">{sub.first_name} {sub.last_name}</p>
                      <p className="text-sm text-gray-500 flex items-center gap-1 mt-0.5">
                        <BookOpen className="w-3.5 h-3.5" /> {sub.course_title}
                      </p>
                    </div>
                    <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full ${cfg.color}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} /> {cfg.label}
                    </span>
                  </div>

                  <div className="flex items-center gap-4 text-xs text-gray-400 mt-2">
                    <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" />{formatDate(sub.submitted_at)}</span>
                    {sub.grade !== null && sub.grade !== undefined && (
                      <span className={`flex items-center gap-1 font-semibold ${sub.grade >= (sub.pass_score ?? 50) ? "text-emerald-600" : "text-red-500"}`}>
                        <Star className="w-3.5 h-3.5" /> {sub.grade}/100
                      </span>
                    )}
                    {(sub.file_url || sub.submission_url) && <span className="flex items-center gap-1 text-blue-500"><FileText className="w-3.5 h-3.5" />{" "}{t("fichier_joint")}</span>}
                  </div>

                  {sub.student_notes && (
                    <p className="text-xs text-gray-500 mt-2 line-clamp-2 bg-gray-50 rounded-lg px-3 py-2">{sub.student_notes}</p>
                  )}

                  {sub.feedback && (
                    <p className="text-xs text-emerald-700 mt-2 bg-emerald-50 rounded-lg px-3 py-2 flex items-start gap-1.5">
                      <MessageSquare className="w-3.5 h-3.5 shrink-0 mt-0.5" /> {sub.feedback}
                    </p>
                  )}
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-2 shrink-0">
                  {(sub.file_url || sub.submission_url) && (
                    <a href={sub.file_url || sub.submission_url} target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-1.5 px-3 py-2 border border-gray-200 text-gray-600 rounded-xl text-xs hover:bg-gray-50 transition">
                      <Eye className="w-3.5 h-3.5" />{" "}{t("voir")}</a>
                  )}
                  <button onClick={() => setGradeModal(sub)}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition ${
                      sub.status === "graded"
                        ? "border border-gray-200 text-gray-500 hover:bg-gray-50"
                        : "bg-primary text-white hover:opacity-90"
                    }`}>
                    <Star className="w-3.5 h-3.5" />
                    {sub.status === "graded" ? t("modifier") : t("corriger")}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}