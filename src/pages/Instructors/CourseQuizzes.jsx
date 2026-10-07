import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../api/api";
import {
  Plus, Trash2, Edit3, Save, ArrowLeft, X,
  CheckCircle, Clock, Star, ChevronDown, ChevronUp, Loader
} from "lucide-react";
import { useTranslation } from "react-i18next";
import i18n from "../../i18n";

const QuizModal = ({ quiz, lessons, error, onSave, onClose }) => {
  const { t } = useTranslation("courseQuizzes");
  const [form, setForm] = useState({
    title: quiz?.title || "",
    description: quiz?.description || "",
    time_limit_minutes: quiz?.time_limit_minutes || "",
    passing_score: quiz?.passing_score ?? 70,
    attempts_allowed: quiz?.attempts_allowed ?? 3,
    is_published: quiz?.is_published ?? false,
    lesson_id: "",
  });
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!form.title.trim()) return;
    setSaving(true);
    const { lesson_id, ...rest } = form;
    await onSave({ ...rest, ...(!quiz && lesson_id ? { lesson_id: Number(lesson_id) } : {}), passing_score: parseInt(form.passing_score), attempts_allowed: parseInt(form.attempts_allowed), time_limit_minutes: form.time_limit_minutes ? parseInt(form.time_limit_minutes) : null });
    setSaving(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/40">
      <div className="bg-white rounded-2xl shadow-hard w-full max-w-lg p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-gray-900">{quiz ? t("modifier_le_quiz") : t("nouveau_quiz")}</h3>
          <button onClick={onClose} className="p-1.5 text-gray-400 hover:bg-gray-100 rounded-lg"><X className="w-4 h-4" /></button>
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">{t("titre")}</label>
          <input value={form.title} onChange={(e) => setForm(p => ({ ...p, title: e.target.value }))}
            placeholder={t("ex_quiz_module_1_introduction")}
            className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
        </div>
        {!quiz && (
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">{t("lecon_associee")}</label>
            <select value={form.lesson_id} onChange={(e) => setForm(p => ({ ...p, lesson_id: e.target.value }))}
              className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30">
              <option value="">{t("nouvelle_lecon_automatique")}</option>
              {(lessons || []).map(l => <option key={l.id} value={l.id}>{l.module_title} — {l.title}</option>)}
            </select>
            <p className="text-xs text-gray-400 mt-1">{t("lecon_associee_aide")}</p>
          </div>
        )}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">{t("description")}</label>
          <textarea value={form.description} onChange={(e) => setForm(p => ({ ...p, description: e.target.value }))}
            rows={2} placeholder={t("instructions_pour_les_apprenants")}
            className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none" />
        </div>
        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">{t("duree_min")}</label>
            <input type="number" value={form.time_limit_minutes} onChange={(e) => setForm(p => ({ ...p, time_limit_minutes: e.target.value }))}
              placeholder={t("illimitee")} min="1"
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">{t("score_min")}</label>
            <input type="number" value={form.passing_score} onChange={(e) => setForm(p => ({ ...p, passing_score: e.target.value }))}
              min="0" max="100"
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">{t("tentatives")}</label>
            <input type="number" value={form.attempts_allowed} onChange={(e) => setForm(p => ({ ...p, attempts_allowed: e.target.value }))}
              min="1" max="10"
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
          </div>
        </div>
        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" checked={form.is_published} onChange={(e) => setForm(p => ({ ...p, is_published: e.target.checked }))}
            className="w-4 h-4 accent-primary" />
          <span className="text-sm text-gray-700 font-medium">{t("publie_visible_pour_les_etudiants")}</span>
        </label>
        {error && <p className="text-sm text-red-600" role="alert">{error}</p>}
        <div className="flex gap-3 justify-end">
          <button onClick={onClose} className="px-4 py-2 border border-gray-200 text-gray-600 rounded-xl text-sm hover:bg-gray-50 transition">{t("annuler")}</button>
          <button onClick={handleSave} disabled={saving || !form.title.trim()}
            className="flex items-center gap-2 px-5 py-2 bg-primary text-white font-semibold rounded-xl text-sm hover:opacity-90 transition disabled:opacity-60">
            {saving ? <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> : <Save className="w-4 h-4" />}
            {saving ? t("enregistrement") : t("enregistrer")}
          </button>
        </div>
      </div>
    </div>
  );
};

const QuestionModal = ({ question, error, onSave, onClose }) => {
  const { t } = useTranslation("courseQuizzes");
  const [form, setForm] = useState({
    question_text: question?.question_text || "",
    type: question?.type || "single",
    points: question?.points ?? 1,
    explanation: question?.explanation || "",
    options: question?.options?.length ? question.options : [
      { option_text: "", is_correct: true },
      { option_text: "", is_correct: false },
      { option_text: "", is_correct: false },
      { option_text: "", is_correct: false },
    ],
  });
  const [saving, setSaving] = useState(false);
  const [localError, setLocalError] = useState("");

  const setOption = (i, key, val) => setForm(p => ({ ...p, options: p.options.map((o, idx) => idx === i ? { ...o, [key]: val } : o) }));
  const addOption = () => setForm(p => ({ ...p, options: [...p.options, { option_text: "", is_correct: false }] }));
  const removeOption = (i) => setForm(p => ({ ...p, options: p.options.filter((_, idx) => idx !== i) }));
  const toggleCorrect = (i) => {
    if (form.type === "single") {
      setForm(p => ({ ...p, options: p.options.map((o, idx) => ({ ...o, is_correct: idx === i })) }));
    } else {
      setOption(i, "is_correct", !form.options[i].is_correct);
    }
  };

  const handleSave = async () => {
    if (!form.question_text.trim()) return;
    if (form.options.filter(o => o.option_text.trim()).length < 2) { setLocalError(t("deux_reponses_minimum")); return; }
    if (!form.options.some(o => o.is_correct && o.option_text.trim())) { setLocalError(t("selectionnez_au_moins_une_bonne_reponse")); return; }
    setLocalError("");
    setSaving(true);
    await onSave({ ...form, points: parseInt(form.points) || 1 });
    setSaving(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/40 overflow-y-auto py-8">
      <div className="bg-white rounded-2xl shadow-hard w-full max-w-xl p-6 space-y-4 my-auto">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-gray-900">{question ? t("modifier_la_question") : t("nouvelle_question")}</h3>
          <button onClick={onClose} className="p-1.5 text-gray-400 hover:bg-gray-100 rounded-lg"><X className="w-4 h-4" /></button>
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">{t("question")}</label>
          <textarea value={form.question_text} onChange={(e) => setForm(p => ({ ...p, question_text: e.target.value }))}
            rows={3} placeholder={t("formulez_votre_question_clairement")}
            className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none" />
        </div>
        <div className="flex gap-4">
          <div className="flex-1">
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">{t("type")}</label>
            <select value={form.type} onChange={(e) => setForm(p => ({ ...p, type: e.target.value }))}
              className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30">
              <option value="single">{t("choix_unique")}</option>
              <option value="multiple">{t("choix_multiple")}</option>
            </select>
          </div>
          <div className="w-24">
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">{t("points")}</label>
            <input type="number" value={form.points} onChange={(e) => setForm(p => ({ ...p, points: e.target.value }))}
              min="1" max="10"
              className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
          </div>
        </div>

        {/* Options */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">{t("reponses")}{" "}<span className="text-gray-400 font-normal text-xs">{t("cochez_la_les_bonne_s")}</span>
          </label>
          <div className="space-y-2">
            {form.options.map((opt, i) => (
              <div key={i} className={`flex items-center gap-2 p-2.5 rounded-xl border-2 transition ${opt.is_correct ? "border-emerald-400 bg-emerald-50" : "border-gray-200"}`}>
                <button type="button" onClick={() => toggleCorrect(i)}
                  className={`w-5 h-5 rounded-full border-2 shrink-0 flex items-center justify-center transition ${opt.is_correct ? "border-emerald-500 bg-emerald-500" : "border-gray-300"}`}>
                  {!!opt.is_correct && <div className="w-2 h-2 bg-white rounded-full" />}
                </button>
                <input value={opt.option_text} onChange={(e) => setOption(i, "option_text", e.target.value)}
                  placeholder={t("reponse", { v: i + 1 })}
                  className="flex-1 bg-transparent text-sm focus:outline-none" />
                {form.options.length > 2 && (
                  <button onClick={() => removeOption(i)} className="p-1 text-gray-400 hover:text-red-500 transition">
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            ))}
          </div>
          {form.options.length < 6 && (
            <button onClick={addOption} className="mt-2 text-sm text-primary hover:underline flex items-center gap-1">
              <Plus className="w-3.5 h-3.5" />{" "}{t("ajouter_une_option")}</button>
          )}
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">{t("explication_apres_la_reponse")}</label>
          <textarea value={form.explanation} onChange={(e) => setForm(p => ({ ...p, explanation: e.target.value }))}
            rows={2} placeholder={t("expliquez_pourquoi_cette_reponse_est_correcte")}
            className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none" />
        </div>

        {(localError || error) && <p className="text-sm text-red-600" role="alert">{localError || error}</p>}
        <div className="flex gap-3 justify-end">
          <button onClick={onClose} className="px-4 py-2 border border-gray-200 text-gray-600 rounded-xl text-sm hover:bg-gray-50 transition">{t("annuler")}</button>
          <button onClick={handleSave} disabled={saving || !form.question_text.trim()}
            className="flex items-center gap-2 px-5 py-2 bg-primary text-white font-semibold rounded-xl text-sm hover:opacity-90 transition disabled:opacity-60">
            {saving ? <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> : <Save className="w-4 h-4" />}
            {saving ? t("enregistrement") : t("enregistrer")}
          </button>
        </div>
      </div>
    </div>
  );
};

export default function CourseQuizzes() {
  const { t } = useTranslation("courseQuizzes");
  const { id } = useParams();
  const navigate = useNavigate();
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedQuizzes, setExpandedQuizzes] = useState({});
  const [quizModal, setQuizModal] = useState(null);
  const [questionModal, setQuestionModal] = useState(null);
  const [deletingQuiz, setDeletingQuiz] = useState(null);
  const [deletingQuestion, setDeletingQuestion] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [modalError, setModalError] = useState("");
  const [pageError, setPageError] = useState("");

  useEffect(() => {
    document.title = t("gerer_les_quizzes_devopsakademy");
    fetchQuizzes();
  }, [id]);

  const fetchQuizzes = async () => {
    try {
      const res = await api.get(`/instructor/courses/${id}/quizzes`);
      setQuizzes(res.data?.data || []);
      setLessons(res.data?.lessons || []);
      setPageError("");
    } catch (e) { setPageError(e?.response?.data?.message || t("erreur")); }
    setLoading(false);
  };

  const saveQuiz = async (data) => {
    try {
      setModalError("");
      if (quizModal?.id) await api.patch(`/instructor/quizzes/${quizModal.id}`, data);
      else await api.post(`/instructor/courses/${id}/quizzes`, data);
      await fetchQuizzes();
      setQuizModal(null);
    } catch (e) { setModalError(e?.response?.data?.message || t("erreur")); }
  };

  const deleteQuiz = async (quizId) => {
    if (!window.confirm(t("supprimer_ce_quiz_et_toutes_ses"))) return;
    setDeletingQuiz(quizId);
    try { await api.delete(`/instructor/quizzes/${quizId}`); await fetchQuizzes(); }
    catch (e) { setPageError(e?.response?.data?.message || t("erreur")); }
    setDeletingQuiz(null);
  };

  const saveQuestion = async (data) => {
    try {
      setModalError("");
      const { quizId, question } = questionModal;
      if (question?.id) await api.patch(`/instructor/questions/${question.id}`, data);
      else await api.post(`/instructor/quizzes/${quizId}/questions`, data);
      await fetchQuizzes();
      setQuestionModal(null);
    } catch (e) { setModalError(e?.response?.data?.message || t("erreur")); }
  };

  const deleteQuestion = async (questionId) => {
    if (!window.confirm(t("supprimer_cette_question"))) return;
    setDeletingQuestion(questionId);
    try { await api.delete(`/instructor/questions/${questionId}`); await fetchQuizzes(); }
    catch (e) { setPageError(e?.response?.data?.message || t("erreur")); }
    setDeletingQuestion(null);
  };

  if (loading) return <div className="flex justify-center py-32"><Loader className="w-8 h-8 text-primary animate-spin" /></div>;

  return (
    <div className="max-w-4xl space-y-6">
      {quizModal !== null && <QuizModal quiz={quizModal === "new" ? null : quizModal} lessons={lessons} error={modalError} onSave={saveQuiz} onClose={() => { setQuizModal(null); setModalError(""); }} />}
      {questionModal !== null && <QuestionModal question={questionModal.question || null} error={modalError} onSave={saveQuestion} onClose={() => { setQuestionModal(null); setModalError(""); }} />}

      <div className="flex items-center gap-4 flex-wrap">
        <button onClick={() => navigate(`/instructor/courses/${id}/modules`)} className="p-2 text-gray-500 hover:bg-gray-100 rounded-xl transition">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">{t("quizzes_du_cours")}</h1>
          <p className="text-gray-500 text-sm mt-0.5">{t("quiz_count", { count: quizzes.length })}</p>
          {pageError && <p className="text-sm text-red-600 mt-1" role="alert">{pageError}</p>}
        </div>
        <button onClick={() => { setModalError(""); setQuizModal("new"); }}
          className="inline-flex items-center gap-2 bg-primary text-white font-semibold py-2.5 px-5 rounded-xl text-sm hover:opacity-90 transition">
          <Plus className="w-4 h-4" />{" "}{t("nouveau_quiz")}</button>
      </div>

      {quizzes.length === 0 && (
        <div className="bg-white border-2 border-dashed border-gray-200 rounded-2xl p-12 text-center">
          <CheckCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="font-semibold text-gray-600 mb-1">{t("aucun_quiz_cree")}</p>
          <p className="text-gray-400 text-sm mb-5">{t("ajoutez_un_quiz_pour_evaluer_vos")}</p>
          <button onClick={() => { setModalError(""); setQuizModal("new"); }} className="inline-flex items-center gap-2 bg-primary text-white font-semibold py-2.5 px-6 rounded-xl text-sm">
            <Plus className="w-4 h-4" />{" "}{t("creer_un_quiz")}</button>
        </div>
      )}

      <div className="space-y-4">
        {quizzes.map((quiz) => {
          const isExpanded = !!expandedQuizzes[quiz.id];
          const questions = quiz.questions || [];
          return (
            <div key={quiz.id} className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-soft">
              <div className="flex items-center gap-3 px-5 py-4 bg-gray-50/80">
                <button onClick={() => setExpandedQuizzes(p => ({ ...p, [quiz.id]: !p[quiz.id] }))} className="flex-1 flex items-center gap-3 text-left">
                  <div className="w-9 h-9 bg-violet-100 rounded-xl flex items-center justify-center">
                    <CheckCircle className="w-5 h-5 text-violet-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-gray-900 text-sm">{quiz.title}</p>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${quiz.is_published ? "bg-emerald-100 text-emerald-700" : "bg-gray-100 text-gray-500"}`}>
                        {quiz.is_published ? t("publie") : t("brouillon")}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-gray-400 mt-0.5">
                      <span>{t("question_count", { count: questions.length })}</span>
                      {quiz.time_limit_minutes && <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{" "}{t("min", { time_limit_minutes: quiz.time_limit_minutes })}</span>}
                      <span className="flex items-center gap-1"><Star className="w-3 h-3" />{" "}{t("seuil")}{" "}{quiz.passing_score ?? 70}%</span>
                      {quiz.lesson_title && <span className="truncate">{quiz.module_title} — {quiz.lesson_title}</span>}
                    </div>
                  </div>
                  {isExpanded ? <ChevronUp className="w-4 h-4 text-gray-400 shrink-0" /> : <ChevronDown className="w-4 h-4 text-gray-400 shrink-0" />}
                </button>
                <div className="flex gap-1 shrink-0">
                  <button onClick={() => setQuizModal(quiz)} className="p-1.5 text-gray-400 hover:text-primary hover:bg-primary/10 rounded-lg transition"><Edit3 className="w-3.5 h-3.5" /></button>
                  <button onClick={() => deleteQuiz(quiz.id)} disabled={deletingQuiz === quiz.id} className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition">
                    {deletingQuiz === quiz.id ? <span className="w-3.5 h-3.5 border-2 border-red-200 border-t-red-500 rounded-full animate-spin block" /> : <Trash2 className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              {isExpanded && (
                <div className="divide-y divide-gray-50">
                  {questions.map((q, qi) => (
                    <div key={q.id} className="flex items-start gap-3 px-5 py-3.5 hover:bg-gray-50/50 transition group">
                      <div className="w-6 h-6 bg-gray-100 rounded-lg flex items-center justify-center text-xs font-bold text-gray-500 shrink-0 mt-0.5">{qi + 1}</div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-800 font-medium">{q.question_text}</p>
                        <div className="flex flex-wrap gap-1 mt-1.5">
                          {(q.options || []).map((opt, oi) => (
                            <span key={oi} className={`text-xs px-2 py-0.5 rounded-full ${opt.is_correct ? "bg-emerald-100 text-emerald-700 font-semibold" : "bg-gray-100 text-gray-500"}`}>
                              {opt.option_text}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div className="flex gap-1 md:opacity-0 md:group-hover:opacity-100 transition-opacity shrink-0">
                        <button onClick={() => { setModalError(""); setQuestionModal({ quizId: quiz.id, question: q, questionCount: questions.length }); }} className="p-1.5 text-gray-400 hover:text-primary hover:bg-primary/10 rounded-lg transition"><Edit3 className="w-3.5 h-3.5" /></button>
                        <button onClick={() => deleteQuestion(q.id)} disabled={deletingQuestion === q.id} className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition">
                          {deletingQuestion === q.id ? <span className="w-3.5 h-3.5 border-2 border-red-200 border-t-red-500 rounded-full animate-spin block" /> : <Trash2 className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>
                  ))}
                  <div className="px-5 py-3">
                    <button onClick={() => { setModalError(""); setQuestionModal({ quizId: quiz.id, questionCount: questions.length }); }}
                      className="flex items-center gap-2 text-sm text-primary hover:text-primary-light font-medium transition">
                      <Plus className="w-4 h-4" />{" "}{t("ajouter_une_question")}</button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}