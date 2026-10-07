import { useCallback, useEffect, useRef, useState } from "react";
import api from "../api/api";

const POLL_MS = 60000;      // filet de sécurité si le flux temps réel est coupé
const RECONNECT_MS = 5000;

/**
 * Notifications de l'utilisateur connecté :
 *  - chargement initial + rafraîchissement périodique (polling)
 *  - push temps réel via SSE (fetch + header Authorization, EventSource ne le permet pas)
 *  - notification navigateur (si autorisée) à chaque nouveau message
 */
export default function useNotifications({ limit = 20 } = {}) {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const seenIds = useRef(new Set());

  const refresh = useCallback(async () => {
    try {
      const res = await api.get(`/notifications?limit=${limit}`);
      const data = res.data?.data || {};
      const list = data.notifications || [];
      list.forEach((n) => seenIds.current.add(n.id));
      setNotifications(list);
      setUnreadCount(Number(data.unread_count) || 0);
    } catch {
      /* silencieux : le prochain poll réessaiera */
    } finally {
      setLoading(false);
    }
  }, [limit]);

  const onIncoming = useCallback((n) => {
    if (seenIds.current.has(n.id)) return;
    seenIds.current.add(n.id);
    setNotifications((prev) => [n, ...prev].slice(0, limit));
    setUnreadCount((c) => c + 1);
    if (typeof Notification !== "undefined" && Notification.permission === "granted") {
      try { new Notification(n.title, { body: n.message || "", tag: `notif-${n.id}` }); } catch {}
    }
  }, [limit]);

  // Chargement + polling
  useEffect(() => {
    refresh();
    const t = setInterval(refresh, POLL_MS);
    return () => clearInterval(t);
  }, [refresh]);

  // Flux temps réel SSE
  useEffect(() => {
    let cancelled = false;
    let controller = null;
    let retryTimer = null;

    const connect = async () => {
      const token = localStorage.getItem("token");
      if (!token || cancelled) return;
      controller = new AbortController();
      try {
        const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/notifications/stream`, {
          headers: { Authorization: `Bearer ${token}`, Accept: "text/event-stream" },
          signal: controller.signal,
        });
        if (!res.ok || !res.body) throw new Error(`SSE ${res.status}`);

        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";
        while (!cancelled) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });
          const frames = buffer.split("\n\n");
          buffer = frames.pop();
          for (const frame of frames) {
            if (!frame.includes("event: notification")) continue;
            const line = frame.split("\n").find((l) => l.startsWith("data: "));
            if (!line) continue;
            try { onIncoming(JSON.parse(line.slice(6))); } catch {}
          }
        }
      } catch {
        /* coupure / abort : reconnexion ci-dessous */
      }
      if (!cancelled) retryTimer = setTimeout(connect, RECONNECT_MS);
    };

    connect();
    return () => {
      cancelled = true;
      clearTimeout(retryTimer);
      controller?.abort();
    };
  }, [onIncoming]);

  const markRead = useCallback(async (id) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, is_read: 1 } : n)));
    setUnreadCount((c) => Math.max(0, c - 1));
    try { await api.patch(`/notifications/${id}/read`); } catch { refresh(); }
  }, [refresh]);

  const markAllRead = useCallback(async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: 1 })));
    setUnreadCount(0);
    try { await api.patch("/notifications/read-all"); } catch { refresh(); }
  }, [refresh]);

  return { notifications, unreadCount, loading, refresh, markRead, markAllRead };
}
