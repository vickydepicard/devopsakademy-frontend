// src/components/Reviews/CourseReviews.jsx
// Usage :
//   <CourseReviews courseId={id} isEnrolled={true} />
//   Intégrer dans CourseDetails.jsx et CourseProgress.jsx

import { useState, useEffect, useCallback } from "react";
import api from "../../api/api";
import { useAuth } from "../../contexts/AuthContext";
import {
  Star, Edit3, Trash2, Send, CheckCircle,
  ChevronDown, Loader, MessageSquare, Award
} from "lucide-react";

// ─── Étoiles interactives ──────────────────────────────────
function StarRating({ value, onChange, readonly = false, size = "md" }) {
  const [hovered, setHovered] = useState(0);
  const active = hovered || value;
  const sz = size === "lg" ? "w-8 h-8" : size === "sm" ? "w-4 h-4" : "w-6 h-6";

  return (
    <div className="flex gap-1" onMouseLeave={() => !readonly && setHovered(0)}>
      {[1, 2, 3, 4, 5].map(n => (
        <button
          key={n}
          type="button"
          disabled={readonly}
          onClick={() => onChange?.(n)}
          onMouseEnter={() => !readonly && setHovered(n)}
          className={`transition-all duration-150 ${readonly ? "cursor-default" : "cursor-pointer hover:scale-110"}`}
          aria-label={`${n} étoile${n > 1 ? "s" : ""}`}
        >
          <Star
            className={`${sz} transition-colors duration-150 ${
              n <= active
                ? "fill-amber-400 text-amber-400"
                : "fill-gray-200 text-gray-200"
            }`}
          />
        </button>
      ))}
    </div>
  );
}

// ─── Distribution des notes ────────────────────────────────
function RatingBar({ count, total, label }) {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
  return (
    <div className="flex items-center gap-2 text-sm">
      <span className="text-gray-500 w-3 text-right shrink-0">{label}</span>
      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400 shrink-0" />
      <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
        <div
          className="h-full bg-amber-400 rounded-full transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="text-gray-400 w-7 text-right shrink-0 text-xs">{count}</span>
    </div>
  );
}

// ─── Carte d'un avis ──────────────────────────────────────
function ReviewCard({ review, isOwn, onEdit, onDelete }) {
  const initials = [review.first_name?.[0], review.last_name?.[0]]
    .filter(Boolean).join("").toUpperCase() || "?";
  const fullName = [review.first_name, review.last_name].filter(Boolean).join(" ") || "Anonyme";
  const date = new Date(review.created_at).toLocaleDateString("fr-FR", {
    day: "numeric", month: "long", year: "numeric",
  });

  return (
    <div className={`bg-white rounded-2xl border p-5 transition-all ${
      isOwn ? "border-[#2d287f]/20 bg-[#2d287f]/3" : "border-gray-100"
    }`}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          {/* Avatar */}
          {review.avatar_url ? (
            <img
              src={review.avatar_url}
              alt={fullName}
              className="w-10 h-10 rounded-full object-contain"
              onError={e => { e.target.onerror = null; e.target.style.display = "none"; }}
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#2d287f] to-[#5653e1] flex items-center justify-center text-white text-sm font-bold">
              {initials}
            </div>
          )}
          <div>
            <p className="font-semibold text-gray-800 text-sm">
              {fullName}
              {isOwn && (
                <span className="ml-2 text-xs bg-indigo-100 text-[#2d287f] px-1.5 py-0.5 rounded-full font-medium">
                  Mon avis
                </span>
              )}
            </p>
            <p className="text-xs text-gray-400">{date}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <StarRating value={review.rating} readonly size="sm" />
          {isOwn && (
            <div className="flex gap-1 ml-1">
              <button
                onClick={onEdit}
                className="p-1.5 text-gray-400 hover:text-[#2d287f] hover:bg-[#2d287f]/5 rounded-lg transition"
                title="Modifier"
              >
                <Edit3 className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={onDelete}
                className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition"
                title="Supprimer"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      </div>

      {review.comment && (
        <p className="mt-3 text-gray-600 text-sm leading-relaxed">{review.comment}</p>
      )}
    </div>
  );
}

// ─── Formulaire d'avis ────────────────────────────────────
function ReviewForm({ courseId, existing, onSuccess, onCancel }) {
  const [rating,    setRating]    = useState(existing?.rating || 0);
  const [comment,   setComment]   = useState(existing?.comment || "");
  const [submitting, setSubmitting] = useState(false);
  const [error,     setError]     = useState("");

  const LABELS = { 1: "Très décevant", 2: "Décevant", 3: "Correct", 4: "Bien", 5: "Excellent !" };

  const handleSubmit = async () => {
    if (!rating) { setError("Veuillez sélectionner une note."); return; }
    setSubmitting(true);
    setError("");
    try {
      if (existing) {
        await api.put(`/courses/${courseId}/reviews`, { rating, comment });
      } else {
        await api.post(`/courses/${courseId}/reviews`, { rating, comment });
      }
      onSuccess();
    } catch (err) {
      setError(err.response?.data?.message || "Erreur lors de l'envoi de l'avis.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-[#2d287f]/25 p-6 shadow-sm">
      <h3 className="font-bold text-gray-800 mb-4 text-base flex items-center gap-2">
        <Star className="w-5 h-5 text-amber-400 fill-amber-400" />
        {existing ? "Modifier votre avis" : "Laisser un avis"}
      </h3>

      {/* Étoiles */}
      <div className="mb-4">
        <p className="text-sm text-gray-500 mb-2">Votre note *</p>
        <div className="flex items-center gap-3">
          <StarRating value={rating} onChange={setRating} size="lg" />
          {rating > 0 && (
            <span className="text-sm font-semibold text-amber-600">{LABELS[rating]}</span>
          )}
        </div>
      </div>

      {/* Commentaire */}
      <div className="mb-4">
        <p className="text-sm text-gray-500 mb-2">Commentaire (facultatif)</p>
        <textarea
          value={comment}
          onChange={e => setComment(e.target.value)}
          rows={4}
          maxLength={1000}
          placeholder="Partagez votre expérience avec ce cours…"
          className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#2d287f]/30 resize-none transition"
        />
        <p className="text-xs text-gray-400 text-right mt-1">{comment.length}/1000</p>
      </div>

      {error && (
        <p className="text-sm text-red-500 bg-red-50 border border-red-100 rounded-xl px-4 py-2 mb-4">
          {error}
        </p>
      )}

      <div className="flex gap-3">
        <button
          onClick={handleSubmit}
          disabled={submitting || !rating}
          className="flex-1 py-2.5 bg-[#2d287f] hover:bg-[#3b3aab] disabled:opacity-50 text-white rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition"
        >
          {submitting
            ? <><Loader className="w-4 h-4 animate-spin" /> Envoi...</>
            : <><Send className="w-4 h-4" /> {existing ? "Modifier" : "Publier l'avis"}</>
          }
        </button>
        {onCancel && (
          <button
            onClick={onCancel}
            className="px-5 py-2.5 border border-gray-200 text-gray-600 hover:bg-gray-50 rounded-xl text-sm font-medium transition"
          >
            Annuler
          </button>
        )}
      </div>
    </div>
  );
}

// ─── COMPOSANT PRINCIPAL ──────────────────────────────────
export default function CourseReviews({ courseId, isEnrolled = false }) {
  const { user } = useAuth();
  const isLoggedIn = !!user;

  const [stats,    setStats]    = useState(null);
  const [reviews,  setReviews]  = useState([]);
  const [myReview, setMyReview] = useState(null);
  const [loading,  setLoading]  = useState(true);
  const [page,     setPage]     = useState(1);
  const [hasMore,  setHasMore]  = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [success,  setSuccess]  = useState("");
  const [deleting, setDeleting] = useState(false);

  const fetchReviews = useCallback(async (p = 1, append = false) => {
    try {
      const res = await api.get(`/courses/${courseId}/reviews?page=${p}&limit=5`);
      const data = res.data?.data;
      if (append) {
        setReviews(prev => [...prev, ...(data.reviews || [])]);
      } else {
        setReviews(data.reviews || []);
      }
      setStats(data.stats);
      setHasMore(p * 5 < (data.stats?.total || 0));
    } catch (err) {
      console.error("fetchReviews:", err);
    }
  }, [courseId]);

  const fetchMyReview = useCallback(async () => {
    if (!isLoggedIn) return;
    try {
      const res = await api.get(`/courses/${courseId}/my-review`);
      setMyReview(res.data?.data || null);
    } catch (_) {}
  }, [courseId, isLoggedIn]);

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await Promise.all([fetchReviews(1), fetchMyReview()]);
      setLoading(false);
    };
    init();
  }, [courseId]);

  const handleSuccess = async () => {
    setShowForm(false);
    setEditMode(false);
    setSuccess("✅ Avis publié avec succès !");
    setPage(1);
    await Promise.all([fetchReviews(1), fetchMyReview()]);
    setTimeout(() => setSuccess(""), 4000);
  };

  const handleDelete = async () => {
    if (!window.confirm("Supprimer votre avis ?")) return;
    setDeleting(true);
    try {
      await api.delete(`/courses/${courseId}/reviews`);
      setMyReview(null);
      setSuccess("Avis supprimé.");
      await fetchReviews(1);
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      alert(err.response?.data?.message || "Erreur suppression.");
    } finally {
      setDeleting(false);
    }
  };

  const handleLoadMore = async () => {
    setLoadingMore(true);
    const next = page + 1;
    setPage(next);
    await fetchReviews(next, true);
    setLoadingMore(false);
  };

  if (loading) {
    return (
      <div className="py-12 flex justify-center">
        <Loader className="w-8 h-8 text-[#2d287f] animate-spin" />
      </div>
    );
  }

  // Avis sans le mien pour éviter le doublon dans la liste
  const otherReviews = reviews.filter(r =>
    !(user && r.first_name === user.first_name && r.last_name === user.last_name && r.rating === myReview?.rating)
  );

  return (
    <div className="space-y-6">

      {/* ── Titre section ─────────────────────────────── */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-[#2d287f]" />
          Avis des apprenants
          {stats?.total > 0 && (
            <span className="text-base font-normal text-gray-400">({stats.total})</span>
          )}
        </h2>
      </div>

      {/* ── Stats + distribution ──────────────────────── */}
      {stats && stats.total > 0 ? (
        <div className="bg-white border border-gray-100 rounded-2xl p-6 flex flex-col sm:flex-row gap-6 items-center">
          {/* Note globale */}
          <div className="text-center shrink-0">
            <p className="text-6xl font-black text-amber-500 leading-none">
              {Number(stats.avg_rating).toFixed(1)}
            </p>
            <StarRating value={Math.round(stats.avg_rating)} readonly size="sm" />
            <p className="text-gray-400 text-xs mt-1">{stats.total} avis</p>
          </div>

          {/* Distribution */}
          <div className="flex-1 w-full space-y-1.5">
            {[5, 4, 3, 2, 1].map(n => (
              <RatingBar
                key={n}
                label={n}
                count={stats.distribution[n] || 0}
                total={stats.total}
              />
            ))}
          </div>
        </div>
      ) : (
        <div className="bg-gray-50 border border-dashed border-gray-200 rounded-2xl p-8 text-center">
          <Award className="w-10 h-10 text-gray-300 mx-auto mb-2" />
          <p className="text-gray-500 font-medium">Aucun avis pour l'instant</p>
          <p className="text-gray-400 text-sm mt-1">Soyez le premier à donner votre avis !</p>
        </div>
      )}

      {/* ── Message succès ────────────────────────────── */}
      {success && (
        <div className="flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 rounded-xl px-4 py-3 text-sm font-medium">
          <CheckCircle className="w-4 h-4 shrink-0" />
          {success}
        </div>
      )}

      {/* ── Mon avis / formulaire ─────────────────────── */}
      {isLoggedIn && isEnrolled && (
        <div>
          {myReview && !editMode ? (
            // Avis existant
            <ReviewCard
              review={{ ...myReview, first_name: user?.first_name, last_name: user?.last_name, avatar_url: user?.avatar_url }}
              isOwn
              onEdit={() => setEditMode(true)}
              onDelete={handleDelete}
            />
          ) : showForm || editMode ? (
            <ReviewForm
              courseId={courseId}
              existing={editMode ? myReview : null}
              onSuccess={handleSuccess}
              onCancel={() => { setShowForm(false); setEditMode(false); }}
            />
          ) : (
            !myReview && (
              <button
                onClick={() => setShowForm(true)}
                className="w-full py-3.5 border-2 border-dashed border-[#2d287f]/25 hover:border-indigo-400 hover:bg-indigo-50/50 text-indigo-600 rounded-2xl text-sm font-semibold flex items-center justify-center gap-2 transition group"
              >
                <Star className="w-4 h-4 group-hover:fill-indigo-400 transition" />
                Donner mon avis sur ce cours
              </button>
            )
          )}
        </div>
      )}

      {/* Message si non connecté ou non inscrit */}
      {!isLoggedIn && (
        <div className="bg-gray-50 border border-gray-200 rounded-xl px-5 py-4 text-sm text-gray-500 text-center">
          <a href="/login" className="text-[#2d287f] font-semibold hover:underline">Connectez-vous</a>
          {" "}pour laisser un avis.
        </div>
      )}
      {isLoggedIn && !isEnrolled && (
        <div className="bg-amber-50 border border-amber-100 rounded-xl px-5 py-4 text-sm text-amber-700 text-center">
          Inscrivez-vous au cours pour pouvoir laisser un avis.
        </div>
      )}

      {/* ── Liste des autres avis ─────────────────────── */}
      {otherReviews.length > 0 && (
        <div className="space-y-3">
          {otherReviews.map(review => (
            <ReviewCard
              key={review.id}
              review={review}
              isOwn={false}
              onEdit={null}
              onDelete={null}
            />
          ))}
        </div>
      )}

      {/* Charger plus */}
      {hasMore && (
        <button
          onClick={handleLoadMore}
          disabled={loadingMore}
          className="w-full py-3 border border-gray-200 hover:bg-gray-50 text-gray-600 rounded-xl text-sm font-medium flex items-center justify-center gap-2 transition disabled:opacity-60"
        >
          {loadingMore
            ? <><Loader className="w-4 h-4 animate-spin" /> Chargement...</>
            : <><ChevronDown className="w-4 h-4" /> Voir plus d'avis</>
          }
        </button>
      )}

      {/* Aucun avis, connecté et inscrit */}
      {otherReviews.length === 0 && !myReview && stats?.total === 0 && isEnrolled && (
        <p className="text-center text-gray-400 text-sm py-4">
          Personne n'a encore donné d'avis. Soyez le premier !
        </p>
      )}
    </div>
  );
}