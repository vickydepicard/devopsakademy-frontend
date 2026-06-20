import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../../api/api";
import { useAuth } from "../../contexts/AuthContext";
import {
  MessageSquare, Plus, Eye, Clock, Hash,
  Pin, ChevronRight, Search, Loader, AlertCircle, Users
} from "lucide-react";

// ─── Helpers ────────────────────────────────────────────────────
const timeAgo = (date) => {
  if (!date) return "";
  const diff = Math.floor((Date.now() - new Date(date)) / 1000);
  if (diff < 60)     return "à l'instant";
  if (diff < 3600)   return `il y a ${Math.floor(diff / 60)} min`;
  if (diff < 86400)  return `il y a ${Math.floor(diff / 3600)} h`;
  if (diff < 604800) return `il y a ${Math.floor(diff / 86400)} j`;
  return new Date(date).toLocaleDateString("fr-FR", { day: "numeric", month: "short" });
};

const getInitials = (first, last) =>
  `${first?.[0] || ""}${last?.[0] || ""}`.toUpperCase() || "?";

const AVATAR_COLORS = [
  "#7c3aed", "#059669", "#0284c7", "#dc2626",
  "#d97706", "#4f46e5", "#0f766e", "#be185d",
];
const avatarColor = (id) => AVATAR_COLORS[(id || 0) % AVATAR_COLORS.length];

// ─── Avatar ─────────────────────────────────────────────────────
function Avatar({ firstName, lastName, avatarUrl, userId, size = "md" }) {
  const sz = { sm: "w-8 h-8 text-xs", md: "w-9 h-9 text-sm" }[size] || "w-9 h-9 text-sm";
  if (avatarUrl) {
    return <img src={avatarUrl} alt={firstName} className={`${sz} rounded-full object-cover shrink-0`} />;
  }
  return (
    <div className={`${sz} rounded-full flex items-center justify-center font-bold text-white shrink-0`} style={{ background: avatarColor(userId) }}>
      {getInitials(firstName, lastName)}
    </div>
  );
}

// ─── Skeleton ───────────────────────────────────────────────────
function ThreadSkeleton() {
  return (
    <div className="animate-pulse bg-white border border-gray-100 rounded-2xl p-5 flex gap-4">
      <div className="w-9 h-9 bg-gray-200 rounded-full shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="h-4 bg-gray-200 rounded w-2/3" />
        <div className="h-3 bg-gray-100 rounded w-1/3" />
      </div>
      <div className="flex gap-4">
        <div className="h-3 bg-gray-100 rounded w-10" />
        <div className="h-3 bg-gray-100 rounded w-10" />
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// PAGE PRINCIPALE
// ═══════════════════════════════════════════════════════════════
export default function ForumList() {
  const { user } = useAuth();
  const navigate  = useNavigate();

  const [categories,    setCategories]    = useState([]);
  const [threads,       setThreads]       = useState([]);
  const [total,         setTotal]         = useState(0);
  const [page,          setPage]          = useState(1);
  const [loading,       setLoading]       = useState(true);
  const [loadingMore,   setLoadingMore]   = useState(false);
  const [error,         setError]         = useState(null);
  const [search,        setSearch]        = useState("");
  const [activeCategory, setActiveCategory] = useState(null);

  const LIMIT = 15;

  // Chargement catégories
  useEffect(() => {
    api.get("/forum/categories")
      .then(r => setCategories(r.data?.data || []))
      .catch(() => {});
  }, []);

  // Chargement threads
  useEffect(() => {
    setLoading(true);
    setError(null);
    const params = new URLSearchParams({ page: 1, limit: LIMIT });
    if (activeCategory) params.set("category_id", activeCategory);
    if (search.trim())  params.set("search", search.trim());

    api.get(`/forum/threads?${params}`)
      .then(r => {
        setThreads(r.data?.data || []);
        setTotal(r.data?.total || 0);
        setPage(1);
      })
      .catch(() => setError("Impossible de charger le forum."))
      .finally(() => setLoading(false));
  }, [activeCategory, search]);

  const loadMore = () => {
    const nextPage = page + 1;
    setLoadingMore(true);
    const params = new URLSearchParams({ page: nextPage, limit: LIMIT });
    if (activeCategory) params.set("category_id", activeCategory);
    if (search.trim())  params.set("search", search.trim());

    api.get(`/forum/threads?${params}`)
      .then(r => {
        setThreads(prev => [...prev, ...(r.data?.data || [])]);
        setPage(nextPage);
      })
      .catch(() => {})
      .finally(() => setLoadingMore(false));
  };

  const hasMore = threads.length < total;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ── Header ── */}
      <div className="bg-gradient-to-br from-[#1f1b5a] to-[#2d287f] text-white py-14 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center">
              <MessageSquare className="w-5 h-5" />
            </div>
            <h1 className="text-3xl font-black">Forum communautaire</h1>
          </div>
          <p className="text-white/65 mb-8">Posez vos questions, partagez vos expériences DevOps.</p>

          {/* Barre de recherche */}
          <div className="relative max-w-xl">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
            <input
              type="text"
              placeholder="Rechercher un sujet..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-white/50 text-sm"
            />
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="flex flex-col md:flex-row gap-6">

          {/* ── Sidebar catégories ── */}
          <aside className="md:w-52 shrink-0">
            <div className="bg-white border border-gray-100 rounded-2xl p-4 sticky top-4">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Catégories</p>
              <button
                onClick={() => setActiveCategory(null)}
                className={"w-full text-left px-3 py-2 rounded-xl text-sm font-medium mb-1 transition-colors " + (!activeCategory ? "bg-[#2d287f]/8 text-[#2d287f]" : "text-gray-600 hover:bg-gray-50")}
              >
                Tous les sujets
              </button>
              {categories.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id === activeCategory ? null : cat.id)}
                  className={"w-full text-left px-3 py-2 rounded-xl text-sm font-medium mb-1 transition-colors flex items-center gap-2 " + (activeCategory === cat.id ? "bg-[#2d287f]/8 text-[#2d287f]" : "text-gray-600 hover:bg-gray-50")}
                >
                  <Hash className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">{cat.name}</span>
                </button>
              ))}

              {user && (
                <button
                  onClick={() => navigate("/forum/new")}
                  className="w-full mt-4 flex items-center justify-center gap-2 bg-[#2d287f] text-white font-bold py-2.5 px-4 rounded-xl text-sm hover:bg-[#3b3aab] transition-colors"
                >
                  <Plus className="w-4 h-4" /> Nouveau sujet
                </button>
              )}
            </div>
          </aside>

          {/* ── Liste des threads ── */}
          <div className="flex-1 min-w-0">
            {/* Header liste */}
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-gray-500">
                {loading ? "Chargement..." : `${total} sujet${total > 1 ? "s" : ""}`}
              </p>
              {!user && (
                <Link to="/login" className="text-sm text-[#2d287f] font-semibold hover:underline">
                  Connectez-vous pour participer →
                </Link>
              )}
            </div>

            {/* Erreur */}
            {error && (
              <div className="flex items-center gap-3 bg-red-50 border border-red-200 text-red-700 rounded-xl p-4 mb-4 text-sm">
                <AlertCircle className="w-4 h-4 shrink-0" />
                {error}
              </div>
            )}

            {/* Skeletons */}
            {loading && (
              <div className="space-y-3">
                {[1,2,3,4,5].map(i => <ThreadSkeleton key={i} />)}
              </div>
            )}

            {/* Liste */}
            {!loading && threads.length === 0 && !error && (
              <div className="text-center py-16 text-gray-400">
                <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p className="font-semibold">Aucun sujet trouvé</p>
                <p className="text-sm mt-1">Soyez le premier à lancer une discussion !</p>
                {user && (
                  <button onClick={() => navigate("/forum/new")} className="mt-4 inline-flex items-center gap-2 bg-[#2d287f] text-white font-bold py-2.5 px-6 rounded-xl text-sm hover:bg-[#3b3aab] transition-colors">
                    <Plus className="w-4 h-4" /> Créer un sujet
                  </button>
                )}
              </div>
            )}

            {!loading && threads.length > 0 && (
              <div className="space-y-3">
                {threads.map(thread => (
                  <Link
                    key={thread.id}
                    to={`/forum/thread/${thread.id}`}
                    className="group flex items-start gap-4 bg-white border border-gray-100 hover:border-[#2d287f]/20 hover:shadow-md rounded-2xl p-5 transition-all duration-200"
                  >
                    <Avatar
                      firstName={thread.author_first_name}
                      lastName={thread.author_last_name}
                      avatarUrl={thread.author_avatar}
                      userId={thread.user_id}
                    />

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        {thread.is_pinned && (
                          <span className="inline-flex items-center gap-1 text-xs bg-amber-50 text-amber-700 border border-amber-200 px-2 py-0.5 rounded-full font-medium">
                            <Pin className="w-2.5 h-2.5" /> Épinglé
                          </span>
                        )}
                        {thread.category_name && (
                          <span className="inline-flex items-center gap-1 text-xs bg-[#2d287f]/6 text-[#2d287f] px-2 py-0.5 rounded-full font-medium">
                            <Hash className="w-2.5 h-2.5" /> {thread.category_name}
                          </span>
                        )}
                      </div>

                      <h3 className="font-semibold text-gray-900 group-hover:text-[#2d287f] transition-colors leading-snug line-clamp-2 mb-1">
                        {thread.title}
                      </h3>

                      {thread.content && (
                        <p className="text-sm text-gray-400 line-clamp-1">{thread.content}</p>
                      )}

                      <div className="flex items-center gap-3 mt-2 text-xs text-gray-400">
                        <span className="font-medium text-gray-600">
                          {thread.author_first_name} {thread.author_last_name}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" /> {timeAgo(thread.created_at)}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 shrink-0 text-xs text-gray-400">
                      <span className="flex items-center gap-1">
                        <MessageSquare className="w-3.5 h-3.5" />
                        {thread.message_count || thread.replies_count || 0}
                      </span>
                      <span className="flex items-center gap-1">
                        <Eye className="w-3.5 h-3.5" />
                        {thread.views || 0}
                      </span>
                      <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity text-[#2d287f]" />
                    </div>
                  </Link>
                ))}
              </div>
            )}

            {/* Load more */}
            {hasMore && !loading && (
              <div className="text-center mt-6">
                <button
                  onClick={loadMore}
                  disabled={loadingMore}
                  className="inline-flex items-center gap-2 border border-gray-200 text-gray-600 font-medium py-2.5 px-6 rounded-xl text-sm hover:border-[#2d287f] hover:text-[#2d287f] transition-colors disabled:opacity-50"
                >
                  {loadingMore ? <Loader className="w-4 h-4 animate-spin" /> : null}
                  {loadingMore ? "Chargement..." : "Voir plus de sujets"}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}