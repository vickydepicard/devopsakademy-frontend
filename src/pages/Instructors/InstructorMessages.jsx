// Messagerie avec l'équipe DevOpsAkademy et annonces de la plateforme.
import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Loader, Megaphone, Send } from "lucide-react";
import api from "../../api/api";
import { formatDate, formatDateTime } from "../../utils/format";

export default function InstructorMessages() {
  const { t } = useTranslation("instructorProgram");
  const [msgs, setMsgs] = useState(null);
  const [anns, setAnns] = useState(null);
  const [body, setBody] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const endRef = useRef(null);

  const load = useCallback(() => {
    api.get("/instructor-program/messages").then((r) => setMsgs(r.data.data)).catch(() => setMsgs([]));
    api.get("/instructor-program/announcements").then((r) => setAnns(r.data.data)).catch(() => setAnns([]));
  }, []);
  useEffect(() => { document.title = `${t("messages_page_title")} — DevOpsAkademy`; load(); }, [load, t]);
  useEffect(() => { endRef.current?.scrollIntoView({ block: "end" }); }, [msgs]);

  const send = async () => {
    setBusy(true); setErr("");
    try { await api.post("/instructor-program/messages", { body: body.trim() }); setBody(""); load(); }
    catch (e) { setErr(e?.response?.data?.message || t("error_generic")); }
    finally { setBusy(false); }
  };
  const markRead = async (a) => {
    if (a.read_at) return;
    try { await api.post(`/instructor-program/announcements/${a.id}/read`); setAnns((p) => p.map((x) => (x.id === a.id ? { ...x, read_at: new Date().toISOString() } : x))); } catch { /* non bloquant */ }
  };

  return (
    <div className="max-w-5xl space-y-6 text-left">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">{t("messages_page_title")}</h1>
        <p className="text-sm text-gray-500 mt-1">{t("messages_page_subtitle")}</p>
      </div>
      <div className="grid lg:grid-cols-2 gap-6">
        <section className="bg-white border border-gray-200 rounded-2xl shadow-sm">
          <h2 className="px-5 py-3 text-sm font-bold text-gray-900 border-b border-gray-100">{t("conversation_team")}</h2>
          <div className="p-5 space-y-3">
            {!msgs ? <div className="flex justify-center py-8"><Loader className="w-5 h-5 animate-spin text-primary" /></div> : (
              <div className="max-h-96 overflow-y-auto space-y-2 pr-1">
                {msgs.length === 0 && <p className="text-sm text-gray-400 text-center py-8">{t("my_thread_empty")}</p>}
                {msgs.map((m) => (
                  <div key={m.id} className={`rounded-xl p-3 max-w-[88%] text-sm ${m.sender_role === "instructor" ? "ml-auto bg-indigo-50 border border-indigo-100" : "mr-auto bg-gray-50 border border-gray-100"}`}>
                    <p className="text-[11px] font-bold text-gray-500 mb-1">{m.sender_role === "instructor" ? t("you") : t("team")} · {formatDateTime(m.created_at)}</p>
                    <p className="text-gray-700 whitespace-pre-line">{m.body}</p>
                  </div>
                ))}
                <div ref={endRef} />
              </div>
            )}
            {err && <p className="text-xs text-red-600">{err}</p>}
            <textarea rows={3} value={body} maxLength={4000} onChange={(e) => setBody(e.target.value)} placeholder={t("my_thread_placeholder")}
              className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none" />
            <div className="flex justify-end">
              <button type="button" onClick={send} disabled={busy || !body.trim()} className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-white bg-primary disabled:opacity-50">
                {busy ? <Loader className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}{t("send")}
              </button>
            </div>
          </div>
        </section>

        <section className="bg-white border border-gray-200 rounded-2xl shadow-sm self-start">
          <h2 className="px-5 py-3 text-sm font-bold text-gray-900 border-b border-gray-100 flex items-center gap-2"><Megaphone className="w-4 h-4 text-primary" />{t("announcements")}</h2>
          <div className="p-5">
            {!anns ? <div className="flex justify-center py-8"><Loader className="w-5 h-5 animate-spin text-primary" /></div> : anns.length === 0 ? <p className="text-sm text-gray-400 text-center py-8">{t("announce_empty")}</p> : (
              <ul className="space-y-3">
                {anns.map((a) => (
                  <li key={a.id}>
                    <button type="button" onClick={() => markRead(a)} className={`w-full text-left rounded-xl border p-3 bg-transparent ${a.read_at ? "border-gray-100" : "border-indigo-200 bg-indigo-50/40"}`}>
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-sm font-bold text-gray-900">{a.title}</p>
                        <span className="text-[11px] text-gray-400 shrink-0">{formatDate(a.created_at)}</span>
                      </div>
                      <p className="text-sm text-gray-600 whitespace-pre-line mt-1">{a.body}</p>
                      {!a.read_at && <span className="inline-block mt-2 text-[11px] font-bold text-indigo-600">{t("new_badge")}</span>}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
