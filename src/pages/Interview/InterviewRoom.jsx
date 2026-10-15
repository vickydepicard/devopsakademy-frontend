// src/pages/Interview/InterviewRoom.jsx — DevOpsAkademy
// Salle d'entretien visio (Jitsi) intégrée à la plateforme. Le lien /interview/:code se partage
// à l'extérieur : l'invité arrive ici, sur la plateforme, sans compte nécessaire.

import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { AlertCircle, Clock, ExternalLink, Loader, Video } from "lucide-react";
import api from "../../api/api";
import { useAuth } from "../../contexts/AuthContext";
import { getLocale } from "../../i18n";

const C = { primary: "rgb(var(--c-primary))", light: "rgb(var(--c-primary-light))" };

export default function InterviewRoom() {
  const { t } = useTranslation("applicationReview");
  const { code } = useParams();
  const { user } = useAuth();
  const [room, setRoom] = useState(null);
  const [error, setError] = useState(false);
  const [guestName, setGuestName] = useState("");
  const [joined, setJoined] = useState(false);

  const load = useCallback(async () => {
    try {
      const res = await api.get(`/instructor-applications/interview-room/${code}`);
      setRoom(res.data?.data || null);
      setError(false);
    } catch { setError(true); }
  }, [code]);

  useEffect(() => { document.title = t("room_title"); load(); }, [load, t]);

  // Tant que la salle n'est pas ouverte, on interroge l'API toutes les 30 s
  useEffect(() => {
    if (!room || room.state !== "waiting") return undefined;
    const id = setInterval(load, 30_000);
    return () => clearInterval(id);
  }, [room, load]);

  const displayName = (user ? `${user.first_name || ""} ${user.last_name || ""}`.trim() : "") || guestName.trim();

  const src = useMemo(() => {
    if (!room?.room || !joined) return null;
    const cfg = [
      `userInfo.displayName=${encodeURIComponent(JSON.stringify(displayName))}`,
      "config.prejoinPageEnabled=false",
      "config.disableDeepLinking=true",
      "interfaceConfig.MOBILE_APP_PROMO=false",
    ].join("&");
    return `https://${room.jitsi_domain}/${encodeURIComponent(room.room)}#${cfg}`;
  }, [room, joined, displayName]);

  if (error) {
    return (
      <div className="max-w-md mx-auto py-24 px-6 text-center">
        <AlertCircle className="w-10 h-10 mx-auto text-red-400 mb-3" />
        <p className="font-bold text-gray-800">{t("room_not_found")}</p>
        <Link to="/" className="inline-block mt-4 text-sm font-bold" style={{ color: C.light }}>{t("back_home")}</Link>
      </div>
    );
  }
  if (!room) return <div className="flex justify-center py-24"><Loader className="w-7 h-7 animate-spin" style={{ color: C.light }} /></div>;

  const when = new Date(room.scheduled_at).toLocaleString(getLocale(), { dateStyle: "full", timeStyle: "short" });

  if (joined && src) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-4">
        <div className="rounded-2xl overflow-hidden border border-gray-200 shadow-lg bg-black" style={{ height: "calc(100vh - 160px)", minHeight: 480 }}>
          <iframe title={t("room_title")} src={src} className="w-full h-full border-0"
            allow="camera; microphone; fullscreen; display-capture; autoplay; clipboard-write" />
        </div>
        <div className="mt-3 text-center">
          <a href={src} target="_blank" rel="noreferrer noopener" className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-500 hover:underline">
            <ExternalLink className="w-3.5 h-3.5" />{t("open_in_new_tab")}
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto py-16 px-6">
      <div className="bg-white rounded-2xl border border-gray-200 shadow-lg overflow-hidden">
        <div className="h-1.5" style={{ background: `linear-gradient(90deg,${C.primary},${C.light})` }} />
        <div className="p-8 text-center space-y-4">
          <div className="w-14 h-14 rounded-2xl mx-auto flex items-center justify-center text-white" style={{ background: `linear-gradient(135deg,${C.primary},${C.light})` }}>
            <Video className="w-7 h-7" />
          </div>
          <h1 className="text-xl font-black text-gray-900">{t("room_title")}</h1>
          <p className="text-sm text-gray-500 flex items-center justify-center gap-1.5"><Clock className="w-4 h-4" />{when} · {room.duration_min} min</p>

          {room.state === "waiting" && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-800">
              {t("room_waiting", { time: new Date(room.opens_at).toLocaleTimeString(getLocale(), { timeStyle: "short" }) })}
            </div>
          )}
          {room.state === "unconfirmed" && <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-800">{t("room_unconfirmed")}</div>}
          {room.state === "cancelled" && <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-700">{t("room_cancelled")}</div>}
          {room.state === "ended" && <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 text-sm text-gray-600">{t("room_ended")}</div>}

          {room.state === "open" && (
            <div className="space-y-3 text-left">
              {!user && (
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1">{t("your_name")}</label>
                  <input value={guestName} onChange={(e) => setGuestName(e.target.value)} maxLength={60}
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-indigo-400 focus:outline-none text-sm" />
                </div>
              )}
              <button disabled={!displayName} onClick={() => setJoined(true)}
                className="w-full py-3.5 rounded-xl text-white font-black disabled:opacity-50 flex items-center justify-center gap-2"
                style={{ background: "linear-gradient(135deg,#059669,#10b981)" }}>
                <Video className="w-5 h-5" />{t("join_now")}
              </button>
              <p className="text-[11px] text-gray-400 text-center">{t("room_hint")}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
