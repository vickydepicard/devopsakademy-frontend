import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  Bell, BellRing, CheckCheck, Info, CheckCircle, AlertTriangle,
  UserPlus, Mail, CreditCard, BookOpen, GraduationCap, Radio, Star,
} from "lucide-react";
import useNotifications from "../../hooks/useNotifications";

const TYPE_STYLE = {
  new_user:               { Icon: UserPlus,      cls: "bg-indigo-100 text-indigo-600" },
  new_contact:            { Icon: Mail,          cls: "bg-sky-100 text-sky-600" },
  payment_proof:          { Icon: CreditCard,    cls: "bg-amber-100 text-amber-600" },
  new_enrollment:         { Icon: BookOpen,      cls: "bg-violet-100 text-violet-600" },
  instructor_application: { Icon: GraduationCap, cls: "bg-fuchsia-100 text-fuchsia-600" },
  bootcamp_registration:  { Icon: Radio,         cls: "bg-rose-100 text-rose-600" },
  new_review:             { Icon: Star,          cls: "bg-yellow-100 text-yellow-600" },
  success:                { Icon: CheckCircle,   cls: "bg-emerald-100 text-emerald-600" },
  warning:                { Icon: AlertTriangle, cls: "bg-amber-100 text-amber-600" },
};
const DEFAULT_STYLE = { Icon: Info, cls: "bg-gray-100 text-gray-500" };

function useTimeAgo() {
  const { i18n } = useTranslation();
  const rtf = new Intl.RelativeTimeFormat(i18n.language, { numeric: "auto" });
  return (date) => {
    const diffMin = Math.round((new Date(date).getTime() - Date.now()) / 60000);
    const abs = Math.abs(diffMin);
    if (abs < 1) return rtf.format(0, "minute");
    if (abs < 60) return rtf.format(diffMin, "minute");
    if (abs < 60 * 24) return rtf.format(Math.round(diffMin / 60), "hour");
    if (abs < 60 * 24 * 7) return rtf.format(Math.round(diffMin / 1440), "day");
    return new Date(date).toLocaleDateString(i18n.language);
  };
}

/**
 * Cloche de notifications en temps réel.
 * variant="dark"  : icône claire pour le header violet du site public
 * variant="light" : icône sombre pour les barres blanches (admin)
 */
export default function NotificationBell({ basePath = "/notifications", variant = "light" }) {
  const { t } = useTranslation();
  const timeAgo = useTimeAgo();
  const { notifications, unreadCount, markRead, markAllRead } = useNotifications({ limit: 10 });
  const [open, setOpen] = useState(false);
  const [perm, setPerm] = useState(typeof Notification !== "undefined" ? Notification.permission : "denied");
  const ref = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const onClick = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    const onKey = (e) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => { document.removeEventListener("mousedown", onClick); document.removeEventListener("keydown", onKey); };
  }, []);

  const openNotif = (n) => {
    if (!n.is_read) markRead(n.id);
    setOpen(false);
    if (n.link) navigate(n.link);
  };

  const enableDesktop = async () => {
    if (typeof Notification === "undefined") return;
    setPerm(await Notification.requestPermission());
  };

  const btn =
    variant === "dark"
      ? "text-white hover:text-accent hover:bg-white/10"
      : "text-gray-600 hover:bg-gray-100";

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-label={t("notifications.title")}
        aria-expanded={open}
        aria-haspopup="true"
        className={`relative w-10 h-10 inline-flex items-center justify-center rounded-full transition ${btn} ${open ? (variant === "dark" ? "bg-white/10" : "bg-gray-100") : ""}`}
      >
        {unreadCount > 0 ? <BellRing className="w-5 h-5" /> : <Bell className="w-5 h-5" />}
        {unreadCount > 0 && (
          <span className={`absolute top-0.5 right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-red-500 text-white text-[10px] font-bold leading-[18px] text-center ring-2 ${variant === "dark" ? "ring-primary" : "ring-white"}`}>
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div
          role="menu"
          className="fixed inset-x-3 top-[4.25rem] sm:absolute sm:inset-x-auto sm:right-0 sm:top-full sm:mt-3 sm:w-[24rem] bg-white text-gray-800 border border-gray-200 rounded-2xl shadow-2xl z-[60] overflow-hidden"
        >
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
            <p className="font-bold text-sm text-gray-900">
              {t("notifications.title")}
              {unreadCount > 0 && (
                <span className="ml-2 text-xs font-semibold text-red-600 bg-red-50 rounded-full px-2 py-0.5">{unreadCount}</span>
              )}
            </p>
            {unreadCount > 0 && (
              <button onClick={markAllRead} className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-800">
                <CheckCheck className="w-3.5 h-3.5" /> {t("notifications.markAllRead")}
              </button>
            )}
          </div>

          <div className="max-h-[60vh] sm:max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="px-6 py-10 text-center">
                <Bell className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                <p className="text-sm font-semibold text-gray-600">{t("notifications.empty")}</p>
                <p className="text-xs text-gray-400 mt-0.5">{t("notifications.emptyHint")}</p>
              </div>
            ) : (
              <ul className="divide-y divide-gray-50">
                {notifications.map((n) => {
                  const { Icon, cls } = TYPE_STYLE[n.type] || DEFAULT_STYLE;
                  return (
                    <li key={n.id}>
                      <button
                        onClick={() => openNotif(n)}
                        className={`w-full text-left px-4 py-3 flex gap-3 hover:bg-gray-50 transition ${n.is_read ? "" : "bg-indigo-50/50"}`}
                      >
                        <span className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${cls}`}>
                          <Icon className="w-4 h-4" />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className={`block text-sm leading-snug ${n.is_read ? "font-medium text-gray-700" : "font-semibold text-gray-900"}`}>{n.title}</span>
                          {n.message && <span className="block text-xs text-gray-500 mt-0.5 line-clamp-2 whitespace-pre-line">{n.message}</span>}
                          <span className="block text-[11px] text-gray-400 mt-1">{timeAgo(n.created_at)}</span>
                        </span>
                        {!n.is_read && <span className="w-2 h-2 mt-2 rounded-full bg-indigo-500 shrink-0" aria-hidden="true" />}
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          <div className="flex items-center justify-between gap-3 px-4 py-2.5 border-t border-gray-100 bg-gray-50">
            {perm === "default" ? (
              <button onClick={enableDesktop} className="inline-flex items-center gap-1.5 text-xs text-gray-500 hover:text-indigo-600">
                <BellRing className="w-3.5 h-3.5" /> {t("notifications.enableDesktop")}
              </button>
            ) : <span />}
            <Link to={basePath} onClick={() => setOpen(false)} className="text-xs font-semibold text-indigo-600 hover:text-indigo-800">
              {t("notifications.viewAll")}
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
