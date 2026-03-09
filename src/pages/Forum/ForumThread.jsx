import { useEffect, useState, useRef } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import api from "../../api/api";
import { useAuth } from "../../contexts/AuthContext";
import {
  ArrowLeft, MessageSquare, Eye, Clock, User,
  Pin, BookOpen, Send, CornerDownRight, ChevronRight,
  Loader, AlertCircle, Hash, Heart, Flag, CheckCircle
} from "lucide-react";

// ─── Helpers ────────────────────────────────────────────────────
const timeAgo = (date) => {
  const d = new Date(date);
  const diff = Math.floor((Date.now() - d) / 1000);
  if (diff < 60) return "à l'instant";
  if (diff < 3600) return `il y a ${Math.floor(diff / 60)} min`;
  if (diff < 86400) return `il y a ${Math.floor(diff / 3600)} h`;
  if (diff < 604800) return `il y a ${Math.floor(diff / 86400)} j`;
  return d.toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });
};

const fmtDate = (date) =>
  new Date(date).toLocaleDateString("fr-FR", {
    day: "numeric", month: "long", year: "numeric",
    hour: "2-digit", minute: "2-digit"
  });

// ─── Avatar ──────────────────────────────────────────────────────
const Avatar = ({ firstName, lastName, avatarUrl, size = "md" }) => {
  const sizes = { sm: "w-8 h-8 text-xs", md: "w-10 h-10 text-sm", lg: "w-12 h-12 text-base" };
  if (avatarUrl) {
    return <img src={avatarUrl} alt="" className={`${sizes[size]} rounded-full object-cover shrink-0`} />;
  }
  return (
    <div className={`${sizes[size]} bg-gradient-to-br from-primary to-primary-light rounded-full flex items-center justify-center text-white font-bold shrink-0`}>
      {firstName?.[0]}{lastName?.[0]}
    </div>
  );
};

// ─── Carte message ───────────────────────────────────────────────
const PostCard = ({ post, isFirst, onReply, currentUserId }) => {
  const [liked, setLiked] = useState(false);

  return (
    <div className={`flex gap-4 ${isFirst ? "pb-6 border-b border-gray-100" : "py-5"}`} id={`post-${post.id}`}>
      <Avatar firstName={post.first_name} lastName={post.last_name} avatarUrl={post.avatar_url} size="md" />

      <div className="flex-1 min-w-0">
        {/* Meta */}
        <div className="flex items-center gap-2 flex-wrap mb-2">
          <span className="font-bold text-gray-900 text-sm">
            {post.first_name} {post.last_name}
          </span>
          {isFirst && (
            <span className="text-xs bg-primary/10 text-primary font-semibold px-2 py-0.5 rounded-full">
              Auteur
            </span>
          )}
          <span className="text-xs text-gray-400 flex items-center gap-1">
            <Clock className="w-3 h-3" /> {timeAgo(post.created_at)}
          </span>
          <span className="text-xs text-gray-300" title={fmtDate(post.created_at)}>
            · {fmtDate(post.created_at)}
          </span>
        </div>

        {/* Réponse parente indicator */}
        {post.parent_post_id && (
          <div className="flex items-center gap-1.5 text-xs text-gray-400 mb-2">
            <CornerDownRight className="w-3.5 h-3.5" />
            <span>En réponse à un message</span>
          </div>
        )}

        {/* Contenu */}
        <div className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap break-words">
          {post.content}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3 mt-3">
          <button
            onClick={() => setLiked(l => !l)}
            className={`flex items-center gap-1.5 text-xs font-medium transition ${
              liked ? "text-red-500" : "text-gray-400 hover:text-red-400"
            }`}
          >
            <Heart className={`w-3.5 h-3.5 ${liked ? "fill-current" : ""}`} />
            <span>{liked ? "Aimé" : "J'aime"}</span>
          </button>
          {onReply && (
            <button
              onClick={() => onReply(post)}
              className="flex items-center gap-1.5 text-xs font-medium text-gray-400 hover:text-primary transition"
            >
              <CornerDownRight className="w-3.5 h-3.5" />
              Répondre
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

// ─── Page principale ─────────────────────────────────────────────
export default function ForumThread() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const replyBoxRef = useRef(null);

  const [thread, setThread] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [replyContent, setReplyContent] = useState("");
  const [replyingTo, setReplyingTo] = useState(null);
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState("");
  const [sendSuccess, setSendSuccess] = useState(false);

  useEffect(() => {
    fetchThread();
  }, [id]);

  const fetchThread = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await api.get(`/forum/threads/${id}`);
      if (res.data?.success) {
        const { posts: p, ...t } = res.data.data;
        setThread(t);
        setPosts(p || []);
        document.title = `${t.title} — Forum DevOpsAkademy`;
      } else {
        setError("Discussion introuvable.");
      }
    } catch {
      setError("Impossible de charger cette discussion.");
    }
    setLoading(false);
  };

  const handleReply = (post) => {
    setReplyingTo(post);
    replyBoxRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    replyBoxRef.current?.querySelector("textarea")?.focus();
  };

  const handleSend = async () => {
    if (!replyContent.trim()) return;
    setSending(true);
    setSendError("");
    setSendSuccess(false);
    try {
      await api.post(`/forum/threads/${id}/messages`, {
        content: replyContent.trim(),
        parent_post_id: replyingTo?.id || null,
      });
      setReplyContent("");
      setReplyingTo(null);
      setSendSuccess(true);
      setTimeout(() => setSendSuccess(false), 3000);
      await fetchThread();
    } catch (err) {
      setSendError(err.response?.data?.message || "Erreur lors de l'envoi.");
    } finally {
      setSending(false);
    }
  };

  // ── Loading ──
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center space-y-3">
          <Loader className="w-10 h-10 text-primary animate-spin mx-auto" />
          <p className="text-gray-500 text-sm">Chargement de la discussion…</p>
        </div>
      </div>
    );
  }

  // ── Error ──
  if (error || !thread) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="text-center bg-white rounded-2xl shadow-soft p-10 max-w-sm">
          <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <p className="font-bold text-gray-900 mb-2">Discussion introuvable</p>
          <p className="text-sm text-gray-500 mb-5">{error}</p>
          <Link to="/forum" className="inline-flex items-center gap-2 bg-primary text-white font-semibold py-2.5 px-5 rounded-xl text-sm hover:-translate-y-0.5 transition">
            <ArrowLeft className="w-4 h-4" /> Retour au forum
          </Link>
        </div>
      </div>
    );
  }

  const firstPost = { ...thread, id: `t-${thread.id}` };

  return (
    <div className="min-h-screen bg-gray-50 pb-16">

      {/* ── Topbar navigation ── */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-20">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center gap-2 text-sm">
          <Link to="/forum" className="flex items-center gap-1.5 text-primary hover:underline font-medium">
            <ArrowLeft className="w-4 h-4" /> Forum
          </Link>
          <ChevronRight className="w-4 h-4 text-gray-300" />
          {thread.category_name && (
            <>
              <Link
                to={`/forum?category=${thread.category_id}`}
                className="text-primary hover:underline font-medium flex items-center gap-1"
              >
                <Hash className="w-3.5 h-3.5" /> {thread.category_name}
              </Link>
              <ChevronRight className="w-4 h-4 text-gray-300" />
            </>
          )}
          <span className="text-gray-500 truncate max-w-xs">{thread.title}</span>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-6 lg:px-6 space-y-4">

        {/* ── Entête thread ── */}
        <div className="bg-white border border-gray-100 rounded-2xl shadow-soft overflow-hidden">

          {/* Bandeau titre */}
          <div className="bg-gradient-to-r from-primary/5 to-primary-light/5 border-b border-gray-100 px-6 py-5">
            <div className="flex items-start gap-4">
              <Avatar
                firstName={thread.first_name}
                lastName={thread.last_name}
                size="lg"
              />
              <div className="flex-1 min-w-0">
                {/* Badges */}
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  {thread.is_pinned && (
                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-600 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
                      <Pin className="w-3 h-3" /> Épinglé
                    </span>
                  )}
                  {thread.category_name && (
                    <span className="text-xs font-medium text-primary bg-primary/10 px-2 py-0.5 rounded-full flex items-center gap-1">
                      <Hash className="w-3 h-3" /> {thread.category_name}
                    </span>
                  )}
                  {thread.course_title && (
                    <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full flex items-center gap-1">
                      <BookOpen className="w-3 h-3" /> {thread.course_title}
                    </span>
                  )}
                </div>

                <h1 className="text-xl lg:text-2xl font-bold text-gray-900 leading-snug">{thread.title}</h1>

                <div className="flex flex-wrap items-center gap-4 mt-2 text-xs text-gray-500">
                  <span className="flex items-center gap-1">
                    <User className="w-3.5 h-3.5" />
                    <strong>{thread.first_name} {thread.last_name}</strong>
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" /> {fmtDate(thread.created_at)}
                  </span>
                  <span className="flex items-center gap-1">
                    <Eye className="w-3.5 h-3.5" /> {thread.view_count ?? 0} vue{thread.view_count !== 1 ? "s" : ""}
                  </span>
                  <span className="flex items-center gap-1">
                    <MessageSquare className="w-3.5 h-3.5" /> {posts.length} réponse{posts.length !== 1 ? "s" : ""}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Message original */}
          <div className="px-6 py-5">
            <div className="text-gray-700 text-sm leading-relaxed whitespace-pre-wrap break-words">
              {thread.content}
            </div>
            {user && (
              <div className="flex gap-3 mt-4">
                <button
                  onClick={() => {
                    setReplyingTo(null);
                    replyBoxRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
                    replyBoxRef.current?.querySelector("textarea")?.focus();
                  }}
                  className="flex items-center gap-1.5 text-xs font-medium text-gray-400 hover:text-primary transition"
                >
                  <CornerDownRight className="w-3.5 h-3.5" /> Répondre à ce sujet
                </button>
              </div>
            )}
          </div>
        </div>

        {/* ── Réponses ── */}
        {posts.length > 0 && (
          <div className="bg-white border border-gray-100 rounded-2xl shadow-soft overflow-hidden">
            <div className="flex items-center gap-2 px-6 py-4 border-b border-gray-100">
              <MessageSquare className="w-4 h-4 text-primary" />
              <p className="font-bold text-gray-900 text-sm">
                {posts.length} réponse{posts.length !== 1 ? "s" : ""}
              </p>
            </div>
            <div className="divide-y divide-gray-50 px-6">
              {posts.map((post, i) => (
                <PostCard
                  key={post.id}
                  post={post}
                  isFirst={false}
                  onReply={user ? handleReply : null}
                  currentUserId={user?.id}
                />
              ))}
            </div>
          </div>
        )}

        {/* ── Zone réponse ── */}
        {user ? (
          <div
            ref={replyBoxRef}
            className="bg-white border border-gray-100 rounded-2xl shadow-soft overflow-hidden"
          >
            <div className="flex items-center gap-2 px-6 py-4 border-b border-gray-100">
              <Avatar firstName={user.first_name} lastName={user.last_name} size="sm" />
              <p className="font-bold text-gray-900 text-sm">Votre réponse</p>
            </div>

            <div className="p-5 space-y-3">
              {/* Réponse à... */}
              {replyingTo && (
                <div className="flex items-start gap-3 bg-gray-50 border border-gray-200 rounded-xl p-3">
                  <CornerDownRight className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-gray-500 mb-0.5">
                      En réponse à {replyingTo.first_name} {replyingTo.last_name}
                    </p>
                    <p className="text-xs text-gray-400 line-clamp-2">{replyingTo.content}</p>
                  </div>
                  <button
                    onClick={() => setReplyingTo(null)}
                    className="text-gray-400 hover:text-gray-600 p-1"
                  >
                    ×
                  </button>
                </div>
              )}

              <textarea
                value={replyContent}
                onChange={e => setReplyContent(e.target.value)}
                rows={5}
                placeholder="Partagez votre réponse, expérience ou question complémentaire…"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none leading-relaxed"
              />

              {sendError && (
                <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-2.5">
                  <AlertCircle className="w-4 h-4 shrink-0" /> {sendError}
                </div>
              )}

              {sendSuccess && (
                <div className="flex items-center gap-2 text-sm text-emerald-600 bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-2.5">
                  <CheckCircle className="w-4 h-4 shrink-0" /> Réponse publiée avec succès !
                </div>
              )}

              <div className="flex items-center justify-between">
                <p className="text-xs text-gray-400">
                  Soyez respectueux et constructif dans vos échanges.
                </p>
                <button
                  onClick={handleSend}
                  disabled={sending || !replyContent.trim()}
                  className="flex items-center gap-2 bg-primary text-white font-bold py-2.5 px-6 rounded-xl text-sm hover:-translate-y-0.5 transition shadow-md disabled:opacity-60"
                >
                  {sending
                    ? <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                    : <Send className="w-4 h-4" />
                  }
                  {sending ? "Envoi…" : "Répondre"}
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* Non connecté → CTA connexion */
          <div className="bg-white border border-gray-100 rounded-2xl shadow-soft p-8 text-center">
            <MessageSquare className="w-10 h-10 text-gray-300 mx-auto mb-3" />
            <p className="font-bold text-gray-900 mb-1">Connectez-vous pour répondre</p>
            <p className="text-sm text-gray-500 mb-5">
              Rejoignez la communauté pour partager votre expérience.
            </p>
            <div className="flex gap-3 justify-center">
              <Link
                to="/login"
                className="inline-flex items-center gap-2 bg-primary text-white font-semibold py-2.5 px-5 rounded-xl text-sm hover:-translate-y-0.5 transition shadow-md"
              >
                Se connecter
              </Link>
              <Link
                to="/register"
                className="inline-flex items-center gap-2 border-2 border-primary text-primary font-semibold py-2.5 px-5 rounded-xl text-sm hover:bg-primary hover:text-white transition"
              >
                Créer un compte
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}