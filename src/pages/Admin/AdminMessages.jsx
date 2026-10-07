import { useEffect, useMemo, useState } from "react";
import { Trash2, X, Mail, Search, CheckCircle2, Circle, Copy, Reply, Inbox, Loader } from "lucide-react";
import { useTranslation } from "react-i18next";
import api from "../../api/api";
import { getLocale } from "../../i18n";
import { askConfirm, showAlert } from "../../utils/dialog";

const fmt = (d) =>
  d ? new Date(d).toLocaleString(getLocale(), { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }) : "";

export default function AdminMessages() {
  const { t } = useTranslation("adminMessages");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all"); // all | open | done
  const [selected, setSelected] = useState(null);

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await api.get("/contacts");
      setMessages(res.data?.data || []);
    } catch {
      setError(t("impossible_de_charger_les_messages"));
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => { load(); }, []);

  const counts = useMemo(() => ({
    all: messages.length,
    open: messages.filter((m) => !m.is_handled).length,
    done: messages.filter((m) => !!m.is_handled).length,
  }), [messages]);

  const list = useMemo(() => {
    const q = search.trim().toLowerCase();
    return messages.filter((m) => {
      if (filter === "open" && m.is_handled) return false;
      if (filter === "done" && !m.is_handled) return false;
      if (!q) return true;
      return [m.name, m.email, m.subject, m.message].some((v) => String(v || "").toLowerCase().includes(q));
    });
  }, [messages, search, filter]);

  const toggleHandled = async (m) => {
    const next = !m.is_handled;
    try {
      await api.patch(`/contacts/${m.id}/handled`, { is_handled: next });
      setMessages((prev) => prev.map((x) => (x.id === m.id ? { ...x, is_handled: next ? 1 : 0 } : x)));
      setSelected((s) => (s && s.id === m.id ? { ...s, is_handled: next ? 1 : 0 } : s));
    } catch {
      showAlert(t("erreur_action"), "error");
    }
  };

  const remove = async (m) => {
    const ok = await askConfirm(t("confirmDelete", { name: m.name }), { danger: true, confirmLabel: t("oui_supprimer") });
    if (!ok) return;
    try {
      await api.delete(`/contacts/${m.id}`);
      setMessages((prev) => prev.filter((x) => x.id !== m.id));
      setSelected(null);
    } catch {
      showAlert(t("erreur_de_suppression_du_message"), "error");
    }
  };

  const copyEmail = async (email) => {
    try { await navigator.clipboard.writeText(email); showAlert(t("copied"), "success"); } catch { /* ignore */ }
  };

  const chip = (key, label) => (
    <button key={key} onClick={() => setFilter(key)}
      className={"px-3.5 py-1.5 rounded-full text-xs font-semibold border transition-colors " +
        (filter === key ? "bg-indigo-700 text-white border-indigo-700" : "bg-white text-gray-600 border-gray-200 hover:border-indigo-300")}>
      {label} <span className={filter === key ? "text-white/70" : "text-gray-400"}>{counts[key]}</span>
    </button>
  );

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-black text-gray-900 flex items-center gap-2"><Inbox className="w-7 h-7 text-indigo-600" />{t("messages_recus")}</h1>
        <p className="text-sm text-gray-500 mt-0.5">{t("subtitle", { count: counts.open })}</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
        <div className="relative sm:max-w-sm w-full">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder={t("search")}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200" />
        </div>
        <div className="flex flex-wrap gap-2">
          {chip("all", t("filterAll"))}{chip("open", t("filterOpen"))}{chip("done", t("filterDone"))}
        </div>
      </div>

      <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-16 flex justify-center text-gray-400"><Loader className="w-6 h-6 animate-spin" /></div>
        ) : error ? (
          <p className="p-8 text-center text-red-600 text-sm">{error}</p>
        ) : list.length === 0 ? (
          <div className="py-16 text-center text-gray-400">
            <Mail className="w-10 h-10 mx-auto mb-3 opacity-40" />
            <p className="text-sm">{t("aucun_message_recu_pour_le_moment")}</p>
          </div>
        ) : (
          <ul className="divide-y divide-gray-100">
            {list.map((m) => (
              <li key={m.id}>
                <button onClick={() => setSelected(m)} className="w-full text-left px-4 sm:px-6 py-4 flex gap-3 sm:gap-4 hover:bg-gray-50 transition">
                  <span className={"mt-1.5 w-2.5 h-2.5 rounded-full shrink-0 " + (m.is_handled ? "bg-gray-200" : "bg-indigo-600")} />
                  <span className="flex-1 min-w-0">
                    <span className="flex items-baseline justify-between gap-3">
                      <span className={"truncate text-sm " + (m.is_handled ? "text-gray-600 font-medium" : "text-gray-900 font-bold")}>{m.name}</span>
                      <span className="text-xs text-gray-400 shrink-0">{fmt(m.created_at)}</span>
                    </span>
                    <span className="block text-sm text-gray-800 truncate">{m.subject}</span>
                    <span className="block text-xs text-gray-400 truncate mt-0.5">{m.message}</span>
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {selected && (
        <div className="fixed inset-0 z-[70] flex items-end sm:items-center justify-center p-0 sm:p-4" role="dialog" aria-modal="true">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setSelected(null)} />
          <div className="relative bg-white w-full sm:max-w-xl rounded-t-3xl sm:rounded-2xl shadow-2xl max-h-[90vh] flex flex-col">
            <div className="flex items-start justify-between gap-4 px-5 sm:px-6 py-4 border-b border-gray-100">
              <div className="min-w-0">
                <h3 className="font-bold text-gray-900 leading-snug break-words">{selected.subject}</h3>
                <p className="text-xs text-gray-500 mt-1">{selected.name} · {fmt(selected.created_at)}</p>
              </div>
              <button onClick={() => setSelected(null)} className="p-1.5 text-gray-400 hover:text-gray-700 rounded-lg shrink-0" aria-label={t("close")}><X className="w-5 h-5" /></button>
            </div>
            <div className="px-5 sm:px-6 py-5 overflow-y-auto space-y-4">
              <div className="flex flex-wrap items-center gap-2 text-sm">
                <a href={`mailto:${selected.email}`} className="text-indigo-700 font-semibold hover:underline break-all">{selected.email}</a>
                <button onClick={() => copyEmail(selected.email)} className="text-gray-400 hover:text-gray-700" title={t("copy")}><Copy className="w-4 h-4" /></button>
              </div>
              <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap break-words">{selected.message}</p>
            </div>
            <div className="px-5 sm:px-6 py-4 border-t border-gray-100 flex flex-col-reverse sm:flex-row sm:items-center sm:justify-between gap-3">
              <button onClick={() => remove(selected)} className="inline-flex items-center justify-center gap-2 text-sm font-semibold text-red-600 hover:bg-red-50 px-4 py-2.5 rounded-xl transition">
                <Trash2 className="w-4 h-4" />{t("supprimer")}
              </button>
              <div className="flex flex-col sm:flex-row gap-2">
                <button onClick={() => toggleHandled(selected)} className="inline-flex items-center justify-center gap-2 text-sm font-semibold border border-gray-200 text-gray-700 hover:bg-gray-50 px-4 py-2.5 rounded-xl transition">
                  {selected.is_handled ? <Circle className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
                  {selected.is_handled ? t("markOpen") : t("markDone")}
                </button>
                <a href={`mailto:${selected.email}?subject=${encodeURIComponent("Re: " + selected.subject)}`} className="inline-flex items-center justify-center gap-2 text-sm font-bold text-white bg-indigo-700 hover:bg-indigo-800 px-5 py-2.5 rounded-xl transition">
                  <Reply className="w-4 h-4" />{t("reply")}
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
