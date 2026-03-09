import { useEffect, useState } from "react";
import api from "../../api/api";
import { useAuth } from "../../contexts/AuthContext";
import {
  Bell, BellOff, Check, CheckCheck, Trash2,
  BookOpen, Award, AlertCircle, Info, Clock,
  Filter, RefreshCw
} from "lucide-react";

const TYPE_CONFIG = {
  enrollment_approved: { icon: CheckCheck, color: "text-emerald-500", bg: "bg-emerald-50", label: "Inscription approuvée" },
  enrollment_rejected: { icon: AlertCircle, color: "text-red-500", bg: "bg-red-50", label: "Inscription rejetée" },
  course_completed:    { icon: Award, color: "text-violet-500", bg: "bg-violet-50", label: "Cours terminé" },
  quiz_passed:         { icon: CheckCheck, color: "text-blue-500", bg: "bg-blue-50", label: "Quiz réussi" },
  new_lesson:          { icon: BookOpen, color: "text-primary", bg: "bg-primary/10", label: "Nouveau contenu" },
  payment_verified:    { icon: Check, color: "text-emerald-600", bg: "bg-emerald-50", label: "Paiement vérifié" },
  system:              { icon: Info, color: "text-gray-500", bg: "bg-gray-50", label: "Système" },
};

const getConfig = (type) => TYPE_CONFIG[type] || TYPE_CONFIG.system;

const timeAgo = (date) => {
  const diff = Date.now() - new Date(date).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "À l'instant";
  if (m < 60) return `Il y a ${m} min`;
  const h = Math.floor(m / 60);
  if (h < 24) return `Il y a ${h}h`;
  const d = Math.floor(h / 24);
  if (d < 7) return `Il y a ${d}j`;
  return new Date(date).toLocaleDateString("fr-FR");
};

const FILTERS = [
  { key: "all", label: "Toutes" },
  { key: "unread", label: "Non lues" },
  { key: "read", label: "Lues" },
];

export default function Notifications() {
  const { token } = useAuth();
  const [notifs, setNotifs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    document.title = "Notifications — DevOpsAkademy";
    fetchNotifs();
  }, []);

  const fetchNotifs = async () => {
    try {
      const res = await api.get("/notifications?limit=50");
      setNotifs(res.data?.data?.notifications || res.data?.data || []);
    } catch (err) {
      console.error("Erreur notifications:", err);
    } finally {
      setLoading(false);
    }
  };

  const markRead = async (id) => {
    try {
      await api.patch(`/notifications/${id}/read`);
      setNotifs((prev) => prev.map((n) => n.id === id ? { ...n, is_read: 1 } : n));
    } catch {}
  };

  const markAllRead = async () => {
    try {
      await api.patch("/notifications/read-all");
      setNotifs((prev) => prev.map((n) => ({ ...n, is_read: 1 })));
    } catch {}
  };

  const deleteNotif = async (id) => {
    setDeletingId(id);
    try {
      await api.delete(`/notifications/${id}`);
      setNotifs((prev) => prev.filter((n) => n.id !== id));
    } catch {}
    setDeletingId(null);
  };

  const filtered = notifs.filter((n) => {
    if (filter === "unread") return !n.is_read;
    if (filter === "read") return !!n.is_read;
    return true;
  });

  const unreadCount = notifs.filter((n) => !n.is_read).length;

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">

        {/* Header */}
        <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center">
              <Bell className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
              {unreadCount > 0 && (
                <p className="text-sm text-gray-500">{unreadCount} non lue{unreadCount > 1 ? "s" : ""}</p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={fetchNotifs}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition"
              title="Actualiser"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            {unreadCount > 0 && (
              <button
                onClick={markAllRead}
                className="flex items-center gap-1.5 text-sm text-primary font-medium hover:underline"
              >
                <CheckCheck className="w-4 h-4" /> Tout marquer lu
              </button>
            )}
          </div>
        </div>

        {/* Filtres */}
        <div className="flex gap-2 mb-6">
          {FILTERS.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setFilter(key)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition ${
                filter === key
                  ? "bg-primary text-white shadow-md"
                  : "bg-white border border-gray-200 text-gray-600 hover:border-primary hover:text-primary"
              }`}
            >
              {label}
              {key === "unread" && unreadCount > 0 && (
                <span className="ml-1.5 bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full">
                  {unreadCount}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Liste */}
        {loading ? (
          <div className="space-y-3 animate-pulse">
            {[1,2,3,4,5].map(i => (
              <div key={i} className="bg-white rounded-2xl border border-gray-100 p-5 flex gap-4">
                <div className="w-10 h-10 bg-gray-200 rounded-xl shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-2/3" />
                  <div className="h-3 bg-gray-100 rounded w-full" />
                  <div className="h-3 bg-gray-100 rounded w-1/3" />
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-200 p-16 text-center">
            <BellOff className="w-14 h-14 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-gray-700 mb-2">
              {filter === "unread" ? "Aucune notification non lue" : "Aucune notification"}
            </h3>
            <p className="text-gray-400 text-sm">
              {filter === "unread"
                ? "Vous êtes à jour !"
                : "Vos notifications apparaîtront ici."}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((notif) => {
              const cfg = getConfig(notif.type);
              const Icon = cfg.icon;
              const isUnread = !notif.is_read;

              return (
                <div
                  key={notif.id}
                  className={`bg-white rounded-2xl border transition-all duration-200 p-5 flex gap-4 group ${
                    isUnread
                      ? "border-primary/30 shadow-sm hover:shadow-md"
                      : "border-gray-100 hover:border-gray-200"
                  }`}
                >
                  {/* Icône */}
                  <div className={`w-11 h-11 ${cfg.bg} rounded-xl flex items-center justify-center shrink-0`}>
                    <Icon className={`w-5 h-5 ${cfg.color}`} />
                  </div>

                  {/* Contenu */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        {isUnread && (
                          <span className="inline-block w-2 h-2 bg-primary rounded-full mr-2 mb-0.5" />
                        )}
                        <p className={`text-sm font-semibold ${isUnread ? "text-gray-900" : "text-gray-600"} leading-snug`}>
                          {notif.title || cfg.label}
                        </p>
                        {notif.message && (
                          <p className="text-sm text-gray-500 mt-0.5 leading-relaxed">{notif.message}</p>
                        )}
                        <p className="text-xs text-gray-400 mt-1.5 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {timeAgo(notif.created_at)}
                        </p>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                        {isUnread && (
                          <button
                            onClick={() => markRead(notif.id)}
                            title="Marquer comme lu"
                            className="p-1.5 text-primary hover:bg-primary/10 rounded-lg transition"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          onClick={() => deleteNotif(notif.id)}
                          title="Supprimer"
                          disabled={deletingId === notif.id}
                          className="p-1.5 text-red-400 hover:bg-red-50 rounded-lg transition disabled:opacity-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Info */}
        {!loading && notifs.length > 0 && (
          <p className="text-center text-xs text-gray-400 mt-6">
            {notifs.length} notification{notifs.length > 1 ? "s" : ""} au total
          </p>
        )}
      </div>
    </div>
  );
}