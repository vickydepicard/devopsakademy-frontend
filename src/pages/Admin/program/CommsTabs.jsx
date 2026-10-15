// Messagerie admin ↔ instructeur, annonces, collaborations et journal d'audit.
import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Megaphone, Send } from "lucide-react";
import api from "../../../api/api";
import useFeedback, { apiError } from "../../../components/Common/useFeedback";
import { formatDate, formatDateTime } from "../../../utils/format";
import { Card, Center, Empty, Pill, Spinner, btnGhost, btnPrimary, fullName, inp } from "./ui";

// ── Fil de discussion avec un instructeur (utilisé dans l'inbox et dans la fiche) ──
export function Thread({ instructorId }) {
  const { t } = useTranslation("instructorProgram");
  const { notify } = useFeedback();
  const [rows, setRows] = useState(null);
  const [body, setBody] = useState("");
  const [busy, setBusy] = useState(false);
  const endRef = useRef(null);

  const load = useCallback(() => {
    api.get(`/instructor-program/admin/instructors/${instructorId}/messages`).then((r) => setRows(r.data.data)).catch((e) => notify(apiError(e, t("error_generic"))));
  }, [instructorId]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { setRows(null); load(); }, [load]);
  useEffect(() => { endRef.current?.scrollIntoView({ block: "end" }); }, [rows]);

  const send = async () => {
    if (!body.trim()) return;
    setBusy(true);
    try { await api.post(`/instructor-program/admin/instructors/${instructorId}/messages`, { body: body.trim() }); setBody(""); load(); }
    catch (e) { notify(apiError(e, t("error_generic"))); }
    finally { setBusy(false); }
  };

  if (!rows) return <Center><Spinner className="w-6 h-6" /></Center>;
  return (
    <div className="space-y-3">
      <div className="max-h-80 overflow-y-auto space-y-2 pr-1">
        {rows.length === 0 && <Empty>{t("thread_empty")}</Empty>}
        {rows.map((m) => (
          <div key={m.id} className={`rounded-xl p-3 max-w-[88%] text-sm ${m.sender_role === "admin" ? "ml-auto bg-indigo-50 border border-indigo-100" : "mr-auto bg-gray-50 border border-gray-100"}`}>
            <p className="text-[11px] font-bold text-gray-500 mb-1">{m.sender_role === "admin" ? (fullName(m) || t("team")) : t("instructor")} · {formatDateTime(m.created_at)}</p>
            <p className="text-gray-700 whitespace-pre-line">{m.body}</p>
          </div>
        ))}
        <div ref={endRef} />
      </div>
      <textarea rows={3} value={body} maxLength={4000} onChange={(e) => setBody(e.target.value)} placeholder={t("thread_placeholder")} className={`${inp} resize-none`} />
      <div className="flex items-center justify-between gap-3">
        <p className="text-[11px] text-gray-400">{t("thread_notified")}</p>
        <button type="button" onClick={send} disabled={busy || !body.trim()} className={btnPrimary}>{busy ? <Spinner className="w-4 h-4" /> : <Send className="w-4 h-4" />}{t("send")}</button>
      </div>
    </div>
  );
}

export function MessagesTab({ initialId }) {
  const { t } = useTranslation("instructorProgram");
  const { notify } = useFeedback();
  const [rows, setRows] = useState(null);
  const [sel, setSel] = useState(initialId || null);
  const [all, setAll] = useState([]);

  const load = useCallback(() => {
    api.get("/instructor-program/admin/messages").then((r) => setRows(r.data.data)).catch((e) => notify(apiError(e, t("error_generic"))));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { load(); api.get("/admin/instructor-management", { params: { limit: 100 } }).then((r) => setAll(r.data.data || [])).catch(() => {}); }, [load]);

  if (!rows) return <Center><Spinner className="w-6 h-6" /></Center>;
  const known = new Set(rows.map((r) => r.id));
  return (
    <div className="grid lg:grid-cols-[320px_1fr] gap-5">
      <Card title={t("inbox")} className="self-start">
        <select className={`${inp} mb-3`} value="" onChange={(e) => e.target.value && setSel(Number(e.target.value))}>
          <option value="">{t("new_conversation")}</option>
          {all.filter((u) => !known.has(u.id)).map((u) => <option key={u.id} value={u.id}>{fullName(u)}</option>)}
        </select>
        {rows.length === 0 ? <Empty>{t("inbox_empty")}</Empty> : (
          <ul className="divide-y divide-gray-100 -mx-2">
            {rows.map((r) => (
              <li key={r.id}>
                <button type="button" onClick={() => { setSel(r.id); setTimeout(load, 800); }} className={`w-full text-left px-2 py-2.5 rounded-lg ${sel === r.id ? "bg-indigo-50" : "bg-transparent hover:bg-gray-50"}`}>
                  <span className="flex items-center justify-between gap-2"><span className="text-sm font-semibold text-gray-900 truncate">{fullName(r)}</span>{r.unread > 0 && <Pill tone="bg-red-500 text-white">{r.unread}</Pill>}</span>
                  <span className="block text-xs text-gray-500 truncate">{r.last_sender === "admin" ? `${t("you")} : ` : ""}{r.last_body}</span>
                  <span className="block text-[11px] text-gray-400">{formatDate(r.last_at)}</span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </Card>
      <Card title={sel ? (fullName(rows.find((r) => r.id === sel)) || fullName(all.find((u) => u.id === sel)) || t("conversation")) : t("conversation")}>
        {sel ? <Thread instructorId={sel} /> : <Empty>{t("select_conversation")}</Empty>}
      </Card>
    </div>
  );
}

export function AnnouncementsTab() {
  const { t, i18n } = useTranslation("instructorProgram");
  const { notify, confirm } = useFeedback();
  const [rows, setRows] = useState(null);
  const [tiers, setTiers] = useState([]);
  const [form, setForm] = useState({ title: "", body: "", tier_id: "", send_email: true });
  const [busy, setBusy] = useState(false);
  const en = (i18n.resolvedLanguage || "fr").startsWith("en");

  const load = useCallback(() => { api.get("/instructor-program/admin/announcements").then((r) => setRows(r.data.data)).catch((e) => notify(apiError(e, t("error_generic")))); }, []); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { load(); api.get("/instructor-program/admin/tiers").then((r) => setTiers(r.data.data.filter((x) => x.is_active))).catch(() => {}); }, [load]);

  const send = async () => {
    if (!(await confirm(t("announce_confirm"), { confirmLabel: t("send"), danger: false }))) return;
    setBusy(true);
    try {
      const r = await api.post("/instructor-program/admin/announcements", { ...form, tier_id: form.tier_id || null });
      notify(t("announce_sent", { count: r.data.data.recipients }), "success");
      setForm({ title: "", body: "", tier_id: "", send_email: true }); load();
    } catch (e) { notify(apiError(e, t("error_generic"))); }
    finally { setBusy(false); }
  };

  return (
    <div className="grid lg:grid-cols-2 gap-5">
      <Card title={t("announce_new")} className="self-start">
        <div className="space-y-3">
          <input className={inp} placeholder={t("announce_title")} maxLength={200} value={form.title} onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))} />
          <textarea rows={6} className={`${inp} resize-none`} placeholder={t("announce_body")} maxLength={4000} value={form.body} onChange={(e) => setForm((p) => ({ ...p, body: e.target.value }))} />
          <label className="block"><span className="block text-xs font-medium text-gray-600 mb-1">{t("announce_audience")}</span>
            <select className={inp} value={form.tier_id} onChange={(e) => setForm((p) => ({ ...p, tier_id: e.target.value }))}>
              <option value="">{t("audience_all")}</option>
              {tiers.map((x) => <option key={x.id} value={x.id}>{t("audience_tier", { name: en ? x.name_en : x.name_fr })}</option>)}
            </select></label>
          <label className="flex items-center gap-2 text-sm text-gray-700"><input type="checkbox" className="w-4 h-4" checked={form.send_email} onChange={(e) => setForm((p) => ({ ...p, send_email: e.target.checked }))} />{t("announce_email")}</label>
          <div className="flex justify-end"><button type="button" onClick={send} disabled={busy || form.title.trim().length < 3 || form.body.trim().length < 5} className={btnPrimary}>{busy ? <Spinner className="w-4 h-4" /> : <Megaphone className="w-4 h-4" />}{t("send")}</button></div>
        </div>
      </Card>
      <Card title={t("announce_history")}>
        {!rows ? <Center><Spinner className="w-6 h-6" /></Center> : rows.length === 0 ? <Empty>{t("announce_empty")}</Empty> : (
          <ul className="divide-y divide-gray-100">
            {rows.map((a) => (
              <li key={a.id} className="py-3">
                <div className="flex items-start justify-between gap-2"><p className="text-sm font-semibold text-gray-900">{a.title}</p><span className="text-[11px] text-gray-400 shrink-0">{formatDate(a.created_at)}</span></div>
                <p className="text-xs text-gray-600 whitespace-pre-line line-clamp-3 mt-0.5">{a.body}</p>
                <p className="text-[11px] text-gray-400 mt-1">{a.tier_name ? t("audience_tier", { name: a.tier_name }) : t("audience_all")} · {t("read_count", { read: Number(a.read_total), total: Number(a.recipients) })}</p>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}

// ── Collaborations ──
export function CollabTab() {
  const { t } = useTranslation("instructorProgram");
  const { notify } = useFeedback();
  const [status, setStatus] = useState("pending");
  const [rows, setRows] = useState(null);
  const [dec, setDec] = useState(null);   // { id, rate, can_edit, note, mode }
  const [busy, setBusy] = useState(false);

  const load = useCallback(() => { api.get("/instructor-program/admin/collab", { params: { status } }).then((r) => setRows(r.data.data)).catch((e) => notify(apiError(e, t("error_generic")))); }, [status]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { setRows(null); load(); }, [load]);

  const submit = async () => {
    setBusy(true);
    try {
      await api.post(`/instructor-program/admin/collab/${dec.id}/decide`, { decision: dec.mode, commission_rate: dec.rate, can_edit_content: dec.can_edit, note: dec.note });
      setDec(null); load();
    } catch (e) { notify(apiError(e, t("error_generic"))); }
    finally { setBusy(false); }
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-1 bg-gray-100 rounded-xl p-1 w-fit">
        {["pending", "all"].map((s) => <button key={s} type="button" onClick={() => setStatus(s)} className={`px-3.5 py-1.5 rounded-lg text-sm font-medium ${status === s ? "bg-white shadow-sm text-gray-900" : "bg-transparent text-gray-500"}`}>{t(`collab_${s}`)}</button>)}
      </div>
      {!rows ? <Center><Spinner className="w-6 h-6" /></Center> : rows.length === 0 ? <Card><Empty>{t("collab_empty")}</Empty></Card> : (
        <ul className="space-y-3">
          {rows.map((r) => (
            <li key={r.id} className="bg-white border border-gray-100 rounded-2xl shadow-sm p-5">
              <div className="flex items-start justify-between gap-3 flex-wrap">
                <div>
                  <p className="text-sm font-bold text-gray-900">{r.course_title}</p>
                  <p className="text-xs text-gray-500">{t("collab_by", { name: `${r.applicant_first_name} ${r.applicant_last_name}`, role: t(`role_${r.role}`) })} · {t("collab_owner", { name: `${r.owner_first_name} ${r.owner_last_name}` })}</p>
                </div>
                <Pill tone={{ pending: "bg-amber-100 text-amber-700", accepted: "bg-emerald-100 text-emerald-700", declined: "bg-red-100 text-red-600", withdrawn: "bg-gray-100 text-gray-500" }[r.status]}>{t(`collab_status_${r.status}`)}</Pill>
              </div>
              {r.message && <p className="text-sm text-gray-700 bg-gray-50 rounded-xl p-3 mt-3 whitespace-pre-line">{r.message}</p>}
              {r.response_note && <p className="text-xs text-gray-500 mt-2">{t("response_note")} : {r.response_note}</p>}
              {r.status === "pending" && dec?.id !== r.id && (
                <div className="flex gap-2 mt-3">
                  <button type="button" onClick={() => setDec({ id: r.id, mode: "accept", rate: r.role === "assistant" ? "0" : "10", can_edit: r.role === "co_instructor", note: "" })} className={btnPrimary}>{t("accept")}</button>
                  <button type="button" onClick={() => setDec({ id: r.id, mode: "decline", rate: "0", can_edit: false, note: "" })} className={btnGhost}>{t("decline")}</button>
                </div>
              )}
              {dec?.id === r.id && (
                <div className="mt-3 border border-gray-200 rounded-xl p-3 space-y-3">
                  {dec.mode === "accept" && (
                    <div className="grid sm:grid-cols-2 gap-3">
                      <label className="block"><span className="block text-xs font-medium text-gray-600 mb-1">{t("collab_rate")}</span><input inputMode="decimal" className={inp} value={dec.rate} onChange={(e) => setDec((p) => ({ ...p, rate: e.target.value }))} /></label>
                      <label className="flex items-center gap-2 text-sm text-gray-700 mt-5"><input type="checkbox" className="w-4 h-4" checked={dec.can_edit} onChange={(e) => setDec((p) => ({ ...p, can_edit: e.target.checked }))} />{t("collab_can_edit")}</label>
                    </div>
                  )}
                  <input className={inp} placeholder={t("collab_note")} value={dec.note} maxLength={500} onChange={(e) => setDec((p) => ({ ...p, note: e.target.value }))} />
                  <div className="flex justify-end gap-2">
                    <button type="button" onClick={() => setDec(null)} className={btnGhost}>{t("cancel")}</button>
                    <button type="button" onClick={submit} disabled={busy} className={btnPrimary}>{busy && <Spinner className="w-4 h-4" />}{dec.mode === "accept" ? t("accept") : t("decline")}</button>
                  </div>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

// ── Journal d'audit ──
const SKIP_KEYS = new Set(["id", "course_id", "instructor_id", "agreement_id", "pending"]);
export function AuditEntry({ e }) {
  const { t } = useTranslation("instructorProgram");
  const label = t(`act_${e.action.replace("instructor.", "")}`, { defaultValue: e.action });
  const details = e.details && typeof e.details === "object"
    ? Object.entries(e.details).filter(([k, v]) => !SKIP_KEYS.has(k) && v !== null && v !== "" && typeof v !== "object")
    : [];
  return (
    <li className="py-2.5 text-sm">
      <div className="flex justify-between gap-3">
        <span className="text-gray-900">{label}{e.target && <span className="text-gray-500"> · {e.target}</span>}{e.actor && <span className="text-gray-400"> · {t("by", { name: e.actor })}</span>}</span>
        <span className="text-xs text-gray-400 shrink-0">{formatDateTime(e.created_at)}</span>
      </div>
      {details.length > 0 && <p className="text-xs text-gray-500 mt-0.5">{details.map(([k, v]) => `${k}: ${v}`).join(" · ")}</p>}
    </li>
  );
}

export function JournalTab() {
  const { t } = useTranslation("instructorProgram");
  const { notify } = useFeedback();
  const [data, setData] = useState(null);
  const [page, setPage] = useState(1);
  const [action, setAction] = useState("");
  const [search, setSearch] = useState("");

  const load = useCallback(() => {
    api.get("/instructor-program/admin/journal", { params: { page, action: action || undefined, search: search || undefined } })
      .then((r) => setData(r.data)).catch((e) => notify(apiError(e, t("error_generic"))));
  }, [page, action, search]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { const h = setTimeout(load, 250); return () => clearTimeout(h); }, [load]);

  const pages = data ? Math.max(Math.ceil(data.pagination.total / data.pagination.limit), 1) : 1;
  return (
    <Card title={t("journal_title")} action={
      <div className="flex gap-2">
        <input className={`${inp} !w-44`} placeholder={t("search")} value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} />
        <select className={`${inp} !w-52`} value={action} onChange={(e) => { setAction(e.target.value); setPage(1); }}>
          <option value="">{t("all_actions")}</option>
          {(data?.actions || []).map((a) => <option key={a} value={a}>{t(`act_${a.replace("instructor.", "")}`, { defaultValue: a })}</option>)}
        </select>
      </div>}>
      {!data ? <Center><Spinner className="w-6 h-6" /></Center> : data.data.length === 0 ? <Empty>{t("journal_empty")}</Empty> : (
        <>
          <ul className="divide-y divide-gray-100">{data.data.map((e) => <AuditEntry key={e.id} e={e} />)}</ul>
          <div className="flex items-center justify-between mt-4 text-sm text-gray-500">
            <span>{t("page_of", { page, pages })}</span>
            <div className="flex gap-2">
              <button type="button" disabled={page <= 1} onClick={() => setPage(page - 1)} className={btnGhost}>{t("previous")}</button>
              <button type="button" disabled={page >= pages} onClick={() => setPage(page + 1)} className={btnGhost}>{t("next")}</button>
            </div>
          </div>
        </>
      )}
    </Card>
  );
}
