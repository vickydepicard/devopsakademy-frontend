import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../api/api";
import {
  Plus, Trash2, Edit3, Save, ArrowLeft, X,
  CheckCircle, Clock, Star, ChevronDown, ChevronUp, Loader
} from "lucide-react";

const QuizModal = ({ quiz, courseId, onSave, onClose }) => {
  const [form, setForm] = useState({
    title: quiz?.title || "",
    description: quiz?.description || "",
    time_limit_minutes: quiz?.time_limit_minutes || "",
    passing_score: quiz?.passing_score ?? 70,
    attempts_allowed: quiz?.attempts_allowed ?? 3,
    is_published: quiz?.is_published ?? false,
  });
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!form.title.trim()) return;
    setSaving(true);
    await onSave({ ...form, passing_score: parseInt(form.passing_score), attempts_allowed: parseInt(form.attempts_allowed), time_limit_minutes: form.time_limit_minutes ? parseInt(form.time_limit_minutes) : null });
    setSaving(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/40">
      <div className="bg-white rounded-2xl shadow-hard w-full max-w-lg p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-gray-900">{quiz ? "Modifier le quiz" : "Nouveau quiz"}</h3>
          <button onClick={onClose} className="p-1.5 text-gray-400 hover:bg-gray-100 rounded-lg"><X className="w-4 h-4" /></button>
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">Titre *</label>
          <input value={form.title} onChange={(e) => setForm(p => ({ ...p, title: e.target.value }))}
            placeholder="Ex : Quiz Module 1 — Introduction"
            className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">Description</label>
          <textarea value={form.description} onChange={(e) => setForm(p => ({ ...p, description: e.target.value }))}
            rows={2} placeholder="Instructions pour les apprenants…"
            className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none" />
        </div>
        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Durée (min)</label>
            <input type="number" value={form.time_limit_minutes} onChange={(e) => setForm(p => ({ ...p, time_limit_minutes: e.target.value }))}
              placeholder="Illimitée" min="1"
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Score min (%)</label>
            <input type="number" value={form.passing_score} onChange={(e) => setForm(p => ({ ...p, passing_score: e.target.value }))}
              min="0" max="100"
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Tentatives</label>
            <input type="number" value={form.attempts_allowed} onChange={(e) => setForm(p => ({ ...p, attempts_allowed: e.target.value }))}
              min="1" max="10"
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
          </div>
        </div>
        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" checked={form.is_published} onChange={(e) => setForm(p => ({ ...p, is_published: e.target.checked }))}
            className="w-4 h-4 accent-primary" />
          <span className="text-sm text-gray-700 font-medium">Publié (visible pour les étudiants)</span>
        </label>
        <div className="flex gap-3 justify-end">
          <button onClick={onClose} className="px-4 py-2 border border-gray-200 text-gray-600 rounded-xl text-sm hover:bg-gray-50 transition">Annuler</button>
          <button onClick={handleSave} disabled={saving || !form.title.trim()}
            className="flex items-center gap-2 px-5 py-2 bg-primary text-white font-semibold rounded-xl text-sm hover:-translate-y-0.5 transition disabled:opacity-60">
            {saving ? <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> : <Save className="w-4 h-4" />}
            {saving ? "Enregistrement…" : "Enregistrer"}
          </button>
        </div>
      </div>
    </div>
  );
};

const QuestionModal = ({ question, quizId, questionCount, onSave, onClose }) => {
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
    if (!form.options.some(o => o.is_correct)) { alert("Sélectionnez au moins une bonne réponse."); return; }
    setSaving(true);
    await onSave({ ...form, order_index: (question?.order_index || questionCount + 1), points: parseInt(form.points) });
    setSaving(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/40 overflow-y-auto py-8">
      <div className="bg-white rounded-2xl shadow-hard w-full max-w-xl p-6 space-y-4 my-auto">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-gray-900">{question ? "Modifier la question" : "Nouvelle question"}</h3>
          <button onClick={onClose} className="p-1.5 text-gray-400 hover:bg-gray-100 rounded-lg"><X className="w-4 h-4" /></button>
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">Question *</label>
          <textarea value={form.question_text} onChange={(e) => setForm(p => ({ ...p, question_text: e.target.value }))}
            rows={3} placeholder="Formulez votre question clairement…"
            className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none" />
        </div>
        <div className="flex gap-4">
          <div className="flex-1">
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Type</label>
            <select value={form.type} onChange={(e) => setForm(p => ({ ...p, type: e.target.value }))}
              className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30">
              <option value="single">Choix unique</option>
              <option value="multiple">Choix multiple</option>
            </select>
          </div>
          <div className="w-24">
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Points</label>
            <input type="number" value={form.points} onChange={(e) => setForm(p => ({ ...p, points: e.target.value }))}
              min="1" max="10"
              className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
          </div>
        </div>

        {/* Options */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Réponses <span className="text-gray-400 font-normal text-xs">(cochez la/les bonne(s))</span>
          </label>
          <div className="space-y-2">
            {form.options.map((opt, i) => (
              <div key={i} className={`flex items-center gap-2 p-2.5 rounded-xl border-2 transition ${opt.is_correct ? "border-emerald-400 bg-emerald-50" : "border-gray-200"}`}>
                <button type="button" onClick={() => toggleCorrect(i)}
                  className={`w-5 h-5 rounded-full border-2 shrink-0 flex items-center justify-center transition ${opt.is_correct ? "border-emerald-500 bg-emerald-500" : "border-gray-300"}`}>
                  {opt.is_correct && <div className="w-2 h-2 bg-white rounded-full" />}
                </button>
                <input value={opt.option_text} onChange={(e) => setOption(i, "option_text", e.target.value)}
                  placeholder={`Réponse ${i + 1}`}
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
              <Plus className="w-3.5 h-3.5" /> Ajouter une option
            </button>
          )}
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">Explication (après la réponse)</label>
          <textarea value={form.explanation} onChange={(e) => setForm(p => ({ ...p, explanation: e.target.value }))}
            rows={2} placeholder="Expliquez pourquoi cette réponse est correcte…"
            className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none" />
        </div>

        <div className="flex gap-3 justify-end">
          <button onClick={onClose} className="px-4 py-2 border border-gray-200 text-gray-600 rounded-xl text-sm hover:bg-gray-50 transition">Annuler</button>
          <button onClick={handleSave} disabled={saving || !form.question_text.trim()}
            className="flex items-center gap-2 px-5 py-2 bg-primary text-white font-semibold rounded-xl text-sm hover:-translate-y-0.5 transition disabled:opacity-60">
            {saving ? <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> : <Save className="w-4 h-4" />}
            {saving ? "Enregistrement…" : "Enregistrer"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default function CourseQuizzes() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedQuizzes, setExpandedQuizzes] = useState({});
  const [quizModal, setQuizModal] = useState(null);
  const [questionModal, setQuestionModal] = useState(null);
  const [deletingQuiz, setDeletingQuiz] = useState(null);
  const [deletingQuestion, setDeletingQuestion] = useState(null);

  useEffect(() => {
    document.title = "Gérer les quizzes — DevOpsAkademy";
    fetchQuizzes();
  }, [id]);

  const fetchQuizzes = async () => {
    try {
      const res = await api.get(`/courses/${id}/quizzes`);
      setQuizzes(res.data?.data || []);
    } catch {}
    setLoading(false);
  };

  const saveQuiz = async (data) => {
    try {
      if (quizModal?.id) await api.patch(`/instructor/quizzes/${quizModal.id}`, data);
      else await api.post(`/instructor/courses/${id}/quizzes`, data);
      await fetchQuizzes();
    } catch { alert("Erreur."); }
    setQuizModal(null);
  };

  const deleteQuiz = async (quizId) => {
    if (!window.confirm("Supprimer ce quiz et toutes ses questions ?")) return;
    setDeletingQuiz(quizId);
    try { await api.delete(`/instructor/quizzes/${quizId}`); await fetchQuizzes(); }
    catch { alert("Erreur."); }
    setDeletingQuiz(null);
  };

  const saveQuestion = async (data) => {
    try {
      const { quizId, question } = questionModal;
      if (question?.id) await api.patch(`/instructor/questions/${question.id}`, data);
      else await api.post(`/instructor/quizzes/${quizId}/questions`, data);
      await fetchQuizzes();
    } catch { alert("Erreur."); }
    setQuestionModal(null);
  };

  const deleteQuestion = async (questionId) => {
    if (!window.confirm("Supprimer cette question ?")) return;
    setDeletingQuestion(questionId);
    try { await api.delete(`/instructor/questions/${questionId}`); await fetchQuizzes(); }
    catch { alert("Erreur."); }
    setDeletingQuestion(null);
  };

  if (loading) return <div className="flex justify-center py-32"><Loader className="w-8 h-8 text-primary animate-spin" /></div>;

  return (
    <div className="max-w-4xl space-y-6">
      {quizModal !== null && <QuizModal quiz={quizModal === "new" ? null : quizModal} courseId={id} onSave={saveQuiz} onClose={() => setQuizModal(null)} />}
      {questionModal !== null && <QuestionModal question={questionModal.question || null} quizId={questionModal.quizId} questionCount={questionModal.questionCount || 0} onSave={saveQuestion} onClose={() => setQuestionModal(null)} />}

      <div className="flex items-center gap-4 flex-wrap">
        <button onClick={() => navigate(`/instructor/courses/${id}/modules`)} className="p-2 text-gray-500 hover:bg-gray-100 rounded-xl transition">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">Quizzes du cours</h1>
          <p className="text-gray-500 text-sm mt-0.5">{quizzes.length} quiz{quizzes.length > 1 ? "zes" : ""}</p>
        </div>
        <button onClick={() => setQuizModal("new")}
          className="inline-flex items-center gap-2 bg-primary text-white font-semibold py-2.5 px-5 rounded-xl text-sm hover:-translate-y-0.5 transition shadow-md">
          <Plus className="w-4 h-4" /> Nouveau quiz
        </button>
      </div>

      {quizzes.length === 0 && (
        <div className="bg-white border-2 border-dashed border-gray-200 rounded-2xl p-12 text-center">
          <CheckCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="font-semibold text-gray-600 mb-1">Aucun quiz créé</p>
          <p className="text-gray-400 text-sm mb-5">Ajoutez un quiz pour évaluer vos apprenants.</p>
          <button onClick={() => setQuizModal("new")} className="inline-flex items-center gap-2 bg-primary text-white font-semibold py-2.5 px-6 rounded-xl text-sm">
            <Plus className="w-4 h-4" /> Créer un quiz
          </button>
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
                        {quiz.is_published ? "Publié" : "Brouillon"}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-gray-400 mt-0.5">
                      <span>{questions.length} question{questions.length > 1 ? "s" : ""}</span>
                      {quiz.time_limit_minutes && <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {quiz.time_limit_minutes} min</span>}
                      <span className="flex items-center gap-1"><Star className="w-3 h-3" /> Seuil {quiz.passing_score || 70}%</span>
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
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                        <button onClick={() => setQuestionModal({ quizId: quiz.id, question: q, questionCount: questions.length })} className="p-1.5 text-gray-400 hover:text-primary hover:bg-primary/10 rounded-lg transition"><Edit3 className="w-3.5 h-3.5" /></button>
                        <button onClick={() => deleteQuestion(q.id)} disabled={deletingQuestion === q.id} className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition">
                          {deletingQuestion === q.id ? <span className="w-3.5 h-3.5 border-2 border-red-200 border-t-red-500 rounded-full animate-spin block" /> : <Trash2 className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>
                  ))}
                  <div className="px-5 py-3">
                    <button onClick={() => setQuestionModal({ quizId: quiz.id, questionCount: questions.length })}
                      className="flex items-center gap-2 text-sm text-primary hover:text-primary-light font-medium transition">
                      <Plus className="w-4 h-4" /> Ajouter une question
                    </button>
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