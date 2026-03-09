import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import api from "../../api/api";
import { useAuth } from "../../contexts/AuthContext";
import {
  Clock, CheckCircle, XCircle, AlertCircle,
  ArrowLeft, ArrowRight, Send, Award, BookOpen, RefreshCw
} from "lucide-react";

export default function QuizPage() {
  const { courseId, quizId } = useParams();
  const navigate = useNavigate();
  const { token } = useAuth();
  const timerRef = useRef(null);

  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);
  const [answers, setAnswers] = useState({}); // { questionId: optionId }
  const [current, setCurrent] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);
  const [timeLeft, setTimeLeft] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    document.title = "Quiz — DevOpsAkademy";
    fetchQuiz();
    return () => clearInterval(timerRef.current);
  }, []);

  const fetchQuiz = async () => {
    try {
      const res = await api.get(`/quizzes/${quizId}`);
      const data = res.data?.data;
      setQuiz(data);
      if (data?.time_limit_minutes) {
        setTimeLeft(data.time_limit_minutes * 60);
        startTimer(data.time_limit_minutes * 60);
      }
    } catch (err) {
      setError("Impossible de charger ce quiz.");
    } finally {
      setLoading(false);
    }
  };

  const startTimer = (seconds) => {
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          handleSubmit(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const formatTime = (s) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, "0")}`;
  };

  const handleAnswer = (questionId, optionId) => {
    setAnswers((prev) => ({ ...prev, [questionId]: optionId }));
  };

  const handleSubmit = async (auto = false) => {
    clearInterval(timerRef.current);
    if (!auto) {
      const unanswered = quiz?.questions?.filter((q) => !answers[q.id]).length;
      if (unanswered > 0) {
        const ok = window.confirm(`Vous n'avez pas répondu à ${unanswered} question(s). Soumettre quand même ?`);
        if (!ok) return;
      }
    }
    setSubmitting(true);
    try {
      const payload = {
        answers: Object.entries(answers).map(([questionId, selectedOptionId]) => ({
          question_id: parseInt(questionId),
          selected_option_id: parseInt(selectedOptionId),
        })),
      };
      const res = await api.post(`/quizzes/${quizId}/submit`, payload);
      setResult(res.data?.data);
    } catch (err) {
      setError("Erreur lors de la soumission. Veuillez réessayer.");
    } finally {
      setSubmitting(false);
    }
  };

  // ── LOADING ──
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-500">Chargement du quiz…</p>
        </div>
      </div>
    );
  }

  // ── ERREUR ──
  if (error && !quiz) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl shadow-soft p-10 max-w-md w-full text-center">
          <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">Quiz introuvable</h2>
          <p className="text-gray-500 text-sm mb-6">{error}</p>
          <button onClick={() => navigate(-1)} className="inline-flex items-center gap-2 bg-primary text-white py-2.5 px-6 rounded-full font-semibold text-sm">
            <ArrowLeft className="w-4 h-4" /> Retour
          </button>
        </div>
      </div>
    );
  }

  // ── RÉSULTATS ──
  if (result) {
    const passed = result.passed;
    const pct = Math.round(result.score || 0);
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-dark to-primary flex items-center justify-center px-4 py-10">
        <div className="bg-white rounded-3xl shadow-hard max-w-lg w-full overflow-hidden">
          {/* Header résultat */}
          <div className={`px-8 py-8 text-center text-white ${passed ? "bg-gradient-to-r from-emerald-500 to-teal-500" : "bg-gradient-to-r from-red-500 to-rose-600"}`}>
            <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
              {passed
                ? <CheckCircle className="w-10 h-10 text-white" />
                : <XCircle className="w-10 h-10 text-white" />
              }
            </div>
            <h2 className="text-2xl font-bold mb-1">
              {passed ? "Félicitations !" : "Quiz échoué"}
            </h2>
            <p className="text-white/80 text-sm">
              {passed ? "Vous avez réussi ce quiz !" : "Vous pouvez recommencer."}
            </p>
          </div>

          {/* Score */}
          <div className="px-8 py-6">
            <div className="text-center mb-6">
              <div className="text-6xl font-bold text-gray-900 mb-1">{pct}%</div>
              <p className="text-gray-500 text-sm">Score obtenu (seuil : {quiz?.passing_score || 70}%)</p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 mb-6">
              {[
                { label: "Correctes", value: result.correct_answers, color: "text-emerald-600" },
                { label: "Incorrectes", value: result.wrong_answers, color: "text-red-500" },
                { label: "Points", value: `+${result.earned_points || 0}`, color: "text-primary" },
              ].map(({ label, value, color }) => (
                <div key={label} className="bg-gray-50 rounded-xl p-4 text-center">
                  <p className={`text-2xl font-bold ${color}`}>{value}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{label}</p>
                </div>
              ))}
            </div>

            {/* Barre de score */}
            <div className="mb-6">
              <div className="flex justify-between text-xs text-gray-400 mb-1.5">
                <span>0%</span>
                <span className="text-primary font-semibold">Seuil {quiz?.passing_score || 70}%</span>
                <span>100%</span>
              </div>
              <div className="h-3 bg-gray-100 rounded-full relative overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-700 ${passed ? "bg-gradient-to-r from-emerald-400 to-teal-500" : "bg-gradient-to-r from-red-400 to-rose-500"}`}
                  style={{ width: `${pct}%` }}
                />
                <div
                  className="absolute top-0 bottom-0 w-0.5 bg-primary/60"
                  style={{ left: `${quiz?.passing_score || 70}%` }}
                />
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-3">
              {!passed && quiz?.attempts_allowed && (
                <button
                  onClick={() => { setResult(null); setAnswers({}); setCurrent(0); fetchQuiz(); }}
                  className="w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-primary to-primary-light text-white font-bold rounded-xl hover:shadow-md transition"
                >
                  <RefreshCw className="w-4 h-4" /> Recommencer
                </button>
              )}
              {passed && (
                <Link
                  to={`/courses/${courseId}/learn`}
                  className="w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-primary to-primary-light text-white font-bold rounded-xl hover:shadow-md transition"
                >
                  <BookOpen className="w-4 h-4" /> Continuer le cours
                </Link>
              )}
              <button
                onClick={() => navigate(`/courses/${courseId}/learn`)}
                className="w-full flex items-center justify-center gap-2 py-3 border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition text-sm"
              >
                <ArrowLeft className="w-4 h-4" /> Retour au cours
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── QUIZ EN COURS ──
  const questions = quiz?.questions || [];
  const q = questions[current];
  const total = questions.length;
  const answered = Object.keys(answers).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      <div className="max-w-3xl mx-auto px-4 py-8">

        {/* Header quiz */}
        <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
          <div>
            <Link to={`/courses/${courseId}/learn`} className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-primary mb-1">
              <ArrowLeft className="w-4 h-4" /> Retour au cours
            </Link>
            <h1 className="text-xl font-bold text-gray-900">{quiz?.title}</h1>
          </div>

          {/* Timer */}
          {timeLeft !== null && (
            <div className={`flex items-center gap-2 px-4 py-2 rounded-full font-mono font-bold text-sm ${
              timeLeft < 60 ? "bg-red-100 text-red-700 animate-pulse" : "bg-primary/10 text-primary"
            }`}>
              <Clock className="w-4 h-4" />
              {formatTime(timeLeft)}
            </div>
          )}
        </div>

        {/* Barre de progression globale */}
        <div className="mb-6">
          <div className="flex justify-between text-xs text-gray-500 mb-1.5">
            <span>Question {current + 1} / {total}</span>
            <span>{answered} répondu{answered > 1 ? "s" : ""}</span>
          </div>
          <div className="h-2 bg-gray-200 rounded-full">
            <div
              className="h-full bg-gradient-to-r from-primary to-primary-light rounded-full transition-all duration-300"
              style={{ width: `${((current + 1) / total) * 100}%` }}
            />
          </div>
        </div>

        {/* Carte question */}
        {q && (
          <div className="bg-white rounded-2xl shadow-soft border border-gray-100 p-6 lg:p-8 mb-6">
            {/* Numéro + points */}
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-semibold text-primary bg-primary/10 px-3 py-1 rounded-full">
                Question {current + 1}
              </span>
              <span className="text-xs text-gray-400">{q.points || 1} point{(q.points || 1) > 1 ? "s" : ""}</span>
            </div>

            {/* Texte question */}
            <h2 className="text-lg font-bold text-gray-900 mb-6 leading-snug">{q.question_text}</h2>

            {/* Options */}
            <div className="space-y-3">
              {q.options?.map((opt) => {
                const selected = answers[q.id] === opt.id;
                return (
                  <button
                    key={opt.id}
                    onClick={() => handleAnswer(q.id, opt.id)}
                    className={`w-full text-left flex items-center gap-4 p-4 rounded-xl border-2 transition-all duration-200 ${
                      selected
                        ? "border-primary bg-primary/5 shadow-sm"
                        : "border-gray-200 hover:border-primary/40 hover:bg-gray-50"
                    }`}
                  >
                    <div className={`w-6 h-6 rounded-full border-2 shrink-0 flex items-center justify-center transition-all ${
                      selected ? "border-primary bg-primary" : "border-gray-300"
                    }`}>
                      {selected && <div className="w-2.5 h-2.5 bg-white rounded-full" />}
                    </div>
                    <span className={`text-sm font-medium ${selected ? "text-primary" : "text-gray-700"}`}>
                      {opt.option_text}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="flex items-center justify-between gap-4">
          <button
            onClick={() => setCurrent((p) => Math.max(0, p - 1))}
            disabled={current === 0}
            className="flex items-center gap-2 py-2.5 px-5 border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition disabled:opacity-40 disabled:cursor-not-allowed text-sm font-medium"
          >
            <ArrowLeft className="w-4 h-4" /> Précédent
          </button>

          {/* Dots navigation */}
          <div className="flex gap-1.5 flex-wrap justify-center">
            {questions.map((q2, i) => (
              <button
                key={i}
                onClick={() => setCurrent(i)}
                className={`w-2.5 h-2.5 rounded-full transition-all ${
                  i === current
                    ? "bg-primary scale-125"
                    : answers[q2.id]
                    ? "bg-emerald-400"
                    : "bg-gray-300"
                }`}
              />
            ))}
          </div>

          {current < total - 1 ? (
            <button
              onClick={() => setCurrent((p) => p + 1)}
              className="flex items-center gap-2 py-2.5 px-5 bg-primary text-white rounded-xl hover:bg-primary-light transition text-sm font-semibold"
            >
              Suivant <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={() => handleSubmit()}
              disabled={submitting}
              className="flex items-center gap-2 py-2.5 px-5 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl hover:shadow-md transition text-sm font-bold disabled:opacity-60"
            >
              {submitting
                ? <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                : <Send className="w-4 h-4" />
              }
              {submitting ? "Envoi…" : "Soumettre"}
            </button>
          )}
        </div>

        {/* Résumé réponses */}
        <div className="mt-6 bg-white rounded-xl border border-gray-100 p-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-500">
              <span className="font-semibold text-gray-900">{answered}</span> / {total} questions répondues
            </span>
            {answered === total && (
              <button
                onClick={() => handleSubmit()}
                className="flex items-center gap-1.5 text-emerald-600 font-semibold hover:underline text-sm"
              >
                <Send className="w-3.5 h-3.5" /> Soumettre maintenant
              </button>
            )}
          </div>
          <div className="mt-2 flex gap-1 flex-wrap">
            {questions.map((q2, i) => (
              <button
                key={i}
                onClick={() => setCurrent(i)}
                title={`Question ${i + 1}`}
                className={`w-7 h-7 rounded-lg text-xs font-bold transition ${
                  answers[q2.id]
                    ? "bg-primary text-white"
                    : "bg-gray-100 text-gray-400 hover:bg-gray-200"
                }`}
              >
                {i + 1}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}