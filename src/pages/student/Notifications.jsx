import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/api";
import { useAuth } from "../../contexts/AuthContext";
import {
  Bell, BellOff, Check, CheckCheck, Trash2,
  BookOpen, Award, AlertCircle, Info, Clock,
  Filter, RefreshCw, UserPlus, Mail, CreditCard, GraduationCap, Radio, Star, AlertTriangle
} from "lucide-react";
import { useTranslation } from "react-i18next";
import i18n from "../../i18n";
import { getLocale } from "../../i18n";

const TYPE_CONFIG = () => ({
  enrollment_approved: { icon: CheckCheck, color: "text-emerald-500", bg: "bg-emerald-50", label: i18n.t("notifications:inscription_approuvee") },
  enrollment_rejected: { icon: AlertCircle, color: "text-red-500", bg: "bg-red-50", label: i18n.t("notifications:inscription_rejetee") },
  course_completed:    { icon: Award, color: "text-violet-500", bg: "bg-violet-50", label: i18n.t("notifications:cours_termine") },
  quiz_passed:         { icon: CheckCheck, color: "text-blue-500", bg: "bg-blue-50", label: i18n.t("notifications:quiz_reussi") },
  new_lesson:          { icon: BookOpen, color: "text-primary", bg: "bg-primary/10", label: i18n.t("notifications:nouveau_contenu") },
  payment_verified:    { icon: Check, color: "text-emerald-600", bg: "bg-emerald-50", label: i18n.t("notifications:paiement_verifie") },
  system:              { icon: Info, color: "text-gray-500", bg: "bg-gray-50", label: i18n.t("notifications:systeme") },
  info:                { icon: Info, color: "text-blue-500", bg: "bg-blue-50", label: i18n.t("notifications:information") },
  success:             { icon: CheckCheck, color: "text-emerald-500", bg: "bg-emerald-50", label: i18n.t("notifications:succes") },
  warning:             { icon: AlertTriangle, color: "text-amber-500", bg: "bg-amber-50", label: i18n.t("notifications:attention") },
  // ── Alertes administrateur ──
  new_user:               { icon: UserPlus, color: "text-indigo-500", bg: "bg-indigo-50", label: i18n.t("notifications:nouvel_utilisateur") },
  new_contact:            { icon: Mail, color: "text-sky-500", bg: "bg-sky-50", label: i18n.t("notifications:message_de_contact") },
  payment_proof:          { icon: CreditCard, color: "text-amber-600", bg: "bg-amber-50", label: i18n.t("notifications:preuve_de_paiement") },
  new_enrollment:         { icon: BookOpen, color: "text-violet-500", bg: "bg-violet-50", label: i18n.t("notifications:inscription") },
  instructor_application: { icon: GraduationCap, color: "text-fuchsia-500", bg: "bg-fuchsia-50", label: i18n.t("notifications:candidature_instructeur") },
  bootcamp_registration:  { icon: Radio, color: "text-rose-500", bg: "bg-rose-50", label: i18n.t("notifications:bootcamp") },
  new_review:             { icon: Star, color: "text-yellow-500", bg: "bg-yellow-50", label: i18n.t("notifications:nouvel_avis") },
});

const getConfig = (type) => TYPE_CONFIG()[type] || TYPE_CONFIG().system;

const timeAgo = (date) => {
  const diff = Date.now() - new Date(date).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return i18n.t("notifications:a_l_instant");
  if (m < 60) return i18n.t("notifications:il_y_a_min", { m });
  const h = Math.floor(m / 60);
  if (h < 24) return `Il y a ${h}h`;
  const d = Math.floor(h / 24);
  if (d < 7) return `Il y a ${d}j`;
  return new Date(date).toLocaleDateString(getLocale());
};

const FILTERS = () => ([
  { key: "all", label: i18n.t("notifications:toutes") },
  { key: "unread", label: i18n.t("notifications:non_lues") },
  { key: "read", label: i18n.t("notifications:lues") },
]);

export default function Notifications() {
  const { t } = useTranslation("notifications");
  const { token } = useAuth();
  const navigate = useNavigate();
  const [notifs, setNotifs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    document.title = t("notifications_devopsakademy");
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
              <h1 className="text-2xl font-bold text-gray-900">{t("notifications")}</h1>
              {unreadCount > 0 && (
                <p className="text-sm text-gray-500">{t("non_lue_p", { unreadCount, s: unreadCount > 1 ? "s" : "" })}</p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={fetchNotifs}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition"
              title={t("actualiser")}
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            {unreadCount > 0 && (
              <button
                onClick={markAllRead}
                className="flex items-center gap-1.5 text-sm text-primary font-medium hover:underline"
              >
                <CheckCheck className="w-4 h-4" />{" "}{t("tout_marquer_lu")}</button>
            )}
          </div>
        </div>

        {/* Filtres */}
        <div className="flex gap-2 mb-6">
          {FILTERS().map(({ key, label }) => (
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
              {filter === "unread" ? t("aucune_notification_non_lue") : t("aucune_notification")}
            </h3>
            <p className="text-gray-400 text-sm">
              {filter === "unread"
                ? t("vous_etes_a_jour")
                : t("vos_notifications_apparaitront_ici")}
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
                  onClick={() => { if (notif.link) { if (isUnread) markRead(notif.id); navigate(notif.link); } }}
                  className={`bg-white rounded-2xl border transition-all duration-200 p-5 flex gap-4 group ${notif.link ? "cursor-pointer" : ""} ${
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
                          <p className="text-sm text-gray-500 mt-0.5 leading-relaxed whitespace-pre-line">{notif.message}</p>
                        )}
                        <p className="text-xs text-gray-400 mt-1.5 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {timeAgo(notif.created_at)}
                        </p>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-1 shrink-0 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                        {isUnread && (
                          <button
                            onClick={(e) => { e.stopPropagation(); markRead(notif.id); }}
                            title={t("marquer_comme_lu")}
                            className="p-1.5 text-primary hover:bg-primary/10 rounded-lg transition"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          onClick={(e) => { e.stopPropagation(); deleteNotif(notif.id); }}
                          title={t("supprimer")}
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
          <p className="text-center text-xs text-gray-400 mt-6">{i18n.t("notifications:notification", { length: notifs.length, s: notifs.length > 1 ? "s" : "" })}{" "}{t("au_total")}</p>
        )}
      </div>
    </div>
  );
}