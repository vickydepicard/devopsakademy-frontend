// Liste des campagnes, choix d'un modèle, détail avec statistiques et destinataires.
import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { ClipboardList, Copy, CreditCard, FileText, Flag, Gift, GraduationCap, Newspaper, Percent, PlayCircle, Plus, Presentation, RotateCcw, ShoppingBag, Sparkles, Target, Ticket, Trash2, Trophy, Users, Video, Wrench, Zap } from "lucide-react";
import api from "../../../api/api";
import useFeedback, { apiError } from "../../../components/Common/useFeedback";
import { formatDate, formatDateTime } from "../../../utils/format";
import { Card, Center, Empty, Pill, Spinner, Stat, btnGhost, btnPrimary, btnDanger } from "../program/ui";
import CampaignEditor from "./CampaignEditor";
import { fromTemplateRow } from "./templates";

const ICONS = { Gift, Percent, Zap, Video, Sparkles, Newspaper, RotateCcw, FileText, Ticket, PlayCircle, Trophy, Wrench, Flag, CreditCard, GraduationCap, ShoppingBag, Target, Presentation, Users, ClipboardList };
const CATEGORIES = ["all", "offer", "event", "content", "retention", "seasonal", "growth", "custom"];
const STATUS_TONE = { draft: "bg-gray-100 text-gray-600", scheduled: "bg-blue-100 text-blue-700", sending: "bg-amber-100 text-amber-700", sent: "bg-emerald-100 text-emerald-700", cancelled: "bg-red-100 text-red-600" };
const pct = (a, b) => (b ? `${Math.round((a / b) * 1000) / 10}%` : "—");

function Detail({ id, onBack, onEdit }) {
  const { t } = useTranslation("marketing");
  const { notify, confirm } = useFeedback();
  const [c, setC] = useState(null);
  const [rec, setRec] = useState(null);
  const [filter, setFilter] = useState("");

  const load = useCallback(() => {
    api.get(`/marketing/admin/campaigns/${id}`).then((r) => setC(r.data.data)).catch((e) => notify(apiError(e, t("error_generic"))));
    api.get(`/marketing/admin/campaigns/${id}/recipients`, { params: { status: filter || undefined } }).then((r) => setRec(r.data)).catch(() => {});
  }, [id, filter]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { load(); }, [load]);
  useEffect(() => { if (c?.status !== "sending") return undefined; const h = setInterval(load, 15000); return () => clearInterval(h); }, [c?.status, load]);

  const act = async (path, okMsg, confirmMsg) => {
    if (confirmMsg && !(await confirm(confirmMsg, { confirmLabel: t("confirm") }))) return;
    try { await api.post(`/marketing/admin/campaigns/${id}/${path}`); notify(okMsg, "success"); load(); } catch (e) { notify(apiError(e, t("error_generic"))); }
  };

  if (!c) return <Center><Spinner className="w-6 h-6" /></Center>;
  const delivered = c.sent;
  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <button type="button" onClick={onBack} className="text-sm font-semibold text-primary bg-transparent hover:underline">← {t("back_to_list")}</button>
        <div className="flex gap-2 flex-wrap">
          {["draft", "scheduled"].includes(c.status) && <button type="button" onClick={() => onEdit(c)} className={btnPrimary}>{t("edit")}</button>}
          {["scheduled", "sending"].includes(c.status) && <button type="button" onClick={() => act("cancel", t("cancelled_ok"), t("cancel_confirm"))} className={btnDanger}>{t("cancel_campaign")}</button>}
          {c.failed > 0 && <button type="button" onClick={() => act("retry", t("retry_ok"))} className={btnGhost}><RotateCcw className="w-4 h-4" />{t("retry_failed", { count: c.failed })}</button>}
        </div>
      </div>
      <div>
        <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">{c.name} <Pill tone={STATUS_TONE[c.status]}>{t(`status_${c.status}`)}</Pill></h2>
        <p className="text-xs text-gray-500 mt-1">{t(`kind_${c.kind}`)} · {c.subject_fr || c.subject_en}{c.scheduled_at ? ` · ${formatDateTime(c.scheduled_at)}` : ""}</p>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <Stat label={t("st_recipients")} value={c.recipients_total} />
        <Stat label={t("st_sent")} value={delivered} sub={c.queued ? t("st_queued", { n: c.queued }) : undefined} tone="text-emerald-600" />
        <Stat label={t("st_opens")} value={pct(c.opened, delivered)} sub={`${c.opened}`} />
        <Stat label={t("st_clicks")} value={pct(c.clicked, delivered)} sub={`${c.clicked}`} />
        <Stat label={t("st_unsub")} value={c.unsubscribed} tone={c.unsubscribed ? "text-amber-600" : "text-gray-900"} sub={c.failed ? t("st_failed", { n: c.failed }) : undefined} />
      </div>
      <p className="text-[11px] text-gray-400">{t("opens_note")}</p>
      {c.variants?.length > 0 && (
        <Card title={t("ab_results")} action={c.ab_state === "decided" ? <Pill tone="bg-emerald-100 text-emerald-700">{t("ab_winner", { variant: c.ab_winner })}</Pill> : <Pill tone="bg-amber-100 text-amber-700">{t("ab_testing")}</Pill>}>
          <div className="overflow-x-auto"><table className="w-full text-sm">
            <thead className="text-xs text-gray-500"><tr>{["ab_variant", "st_sent", "st_opens", "st_clicks"].map((k) => <th key={k} className="text-left font-medium py-1.5 pr-3">{t(k)}</th>)}</tr></thead>
            <tbody className="divide-y divide-gray-100">{c.variants.map((v) => (
              <tr key={v.variant} className={c.ab_winner === v.variant ? "bg-emerald-50/50" : ""}>
                <td className="py-2 pr-3 font-semibold">{v.variant} <span className="text-xs font-normal text-gray-500">— {v.variant === "A" ? c.subject_fr : (c.ab_test?.subject_b_fr || c.subject_fr)}</span></td>
                <td className="py-2 pr-3">{v.sent}</td><td className="py-2 pr-3">{pct(v.opened, v.sent)}</td><td className="py-2">{pct(v.clicked, v.sent)}</td>
              </tr>))}</tbody></table></div>
          {c.held > 0 && <p className="text-xs text-gray-500 mt-2">{t("ab_held", { count: c.held })}</p>}
        </Card>
      )}
      {c.links?.length > 0 && (
        <Card title={t("links_title")}>
          <ul className="divide-y divide-gray-100">{c.links.map((l, i) => <li key={i} className="py-2 flex justify-between gap-3 text-sm"><span className="truncate text-gray-700">{l.url}</span><span className="font-semibold text-gray-900 shrink-0">{l.clicks}</span></li>)}</ul>
        </Card>
      )}
      <Card title={t("recipients_title")} action={
        <select className="px-2 py-1 border border-gray-200 rounded-lg text-xs bg-white" value={filter} onChange={(e) => setFilter(e.target.value)}>
          <option value="">{t("all")}</option>{["queued", "sent", "failed"].map((s) => <option key={s} value={s}>{t(`send_${s}`)}</option>)}
        </select>}>
        {!rec ? <Center><Spinner className="w-5 h-5" /></Center> : rec.data.length === 0 ? <Empty>{t("no_recipients_yet")}</Empty> : (
          <div className="overflow-x-auto"><table className="w-full text-sm">
            <thead className="text-xs text-gray-500"><tr>{["email", "status", "opened", "clicked"].map((k) => <th key={k} className="text-left font-medium py-1.5 pr-3">{t(`col_${k}`)}</th>)}</tr></thead>
            <tbody className="divide-y divide-gray-100">{rec.data.map((r) => (
              <tr key={r.id}>
                <td className="py-2 pr-3">{r.email}{r.unsubscribed_at && <Pill tone="bg-amber-100 text-amber-700">{t("unsubscribed")}</Pill>}</td>
                <td className="py-2 pr-3"><Pill tone={r.status === "sent" ? "bg-emerald-100 text-emerald-700" : r.status === "failed" ? "bg-red-100 text-red-600" : "bg-gray-100 text-gray-600"}>{t(`send_${r.status}`)}</Pill>{r.error && <span className="block text-[11px] text-red-500 max-w-[220px] truncate" title={r.error}>{r.error}</span>}</td>
                <td className="py-2 pr-3 text-xs text-gray-500">{r.opened_at ? formatDate(r.opened_at) : "—"}</td>
                <td className="py-2 text-xs text-gray-500">{r.clicked_at ? formatDate(r.clicked_at) : "—"}</td>
              </tr>))}</tbody></table></div>
        )}
      </Card>
    </div>
  );
}

function TemplatePicker({ lang, onBack, onUse }) {
  const { t } = useTranslation("marketing");
  const { notify, confirm } = useFeedback();
  const [rows, setRows] = useState(null);
  const [cat, setCat] = useState("all");
  const load = useCallback(() => { api.get("/marketing/admin/templates", { params: { type: "campaign" } }).then((r) => setRows(r.data.data)).catch((e) => notify(apiError(e, t("error_generic")))); }, []); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { load(); }, [load]);

  const remove = async (row) => {
    if (!(await confirm(t("delete_confirm", { name: lang === "en" ? row.name_en : row.name_fr })))) return;
    try { await api.delete(`/marketing/admin/templates/${row.id}`); load(); } catch (e) { notify(apiError(e, t("error_generic"))); }
  };
  const restore = async (row) => {
    if (!(await confirm(t("template_restore_confirm"), { confirmLabel: t("restore"), danger: false }))) return;
    try { await api.post(`/marketing/admin/templates/${row.id}/reset`); notify(t("restored"), "success"); load(); } catch (e) { notify(apiError(e, t("error_generic"))); }
  };
  const blank = rows?.find((r) => r.slug === "blank");
  const list = (rows || []).filter((r) => r.slug !== "blank" && (cat === "all" || (cat === "custom" ? !r.is_builtin : r.category === cat)));

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <button type="button" onClick={onBack} className="text-sm font-semibold text-primary bg-transparent hover:underline">← {t("back_to_list")}</button>
        {blank && <button type="button" onClick={() => onUse(blank)} className={btnGhost}><FileText className="w-4 h-4" />{t("template_blank")}</button>}
      </div>
      <div>
        <h2 className="text-lg font-bold text-gray-900">{t("pick_template")}</h2>
        <p className="text-xs text-gray-500 mt-1">{t("pick_template_hint")}</p>
      </div>
      <div className="flex gap-1.5 flex-wrap">{CATEGORIES.map((c) => <button key={c} type="button" onClick={() => setCat(c)} className={`px-3 py-1.5 rounded-lg text-xs font-bold ${cat === c ? "bg-primary text-white" : "bg-gray-100 text-gray-600"}`}>{t(`cat_${c}`)}</button>)}</div>
      {!rows ? <Center><Spinner className="w-6 h-6" /></Center> : list.length === 0 ? <Empty>{t("templates_empty")}</Empty> : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {list.map((row) => {
            const Icon = ICONS[row.icon] || FileText;
            return (
              <div key={row.id} className="bg-white border border-gray-200 rounded-2xl p-5 hover:border-primary hover:shadow-md transition flex flex-col">
                <button type="button" onClick={() => onUse(row)} className="text-left bg-transparent flex-1">
                  <span className="w-10 h-10 rounded-xl bg-indigo-50 text-primary flex items-center justify-center mb-3"><Icon className="w-5 h-5" /></span>
                  <p className="font-bold text-gray-900">{lang === "en" ? row.name_en : row.name_fr}</p>
                  <p className="text-xs text-gray-500 mt-1">{(lang === "en" ? row.description_en : row.description_fr) || ""}</p>
                </button>
                <div className="flex items-center justify-between gap-2 mt-3 pt-3 border-t border-gray-100">
                  <Pill tone={row.is_builtin ? "bg-gray-100 text-gray-600" : "bg-indigo-50 text-indigo-700"}>{row.is_builtin ? t(`cat_${row.category}`, { defaultValue: row.category }) : t("template_mine")}</Pill>
                  <span className="flex items-center gap-3">
                    <button type="button" onClick={() => onUse(row)} className="text-xs font-bold text-primary bg-transparent hover:underline">{t("use")}</button>
                    {row.is_builtin ? <button type="button" onClick={() => restore(row)} title={t("restore")} className="text-gray-300 hover:text-gray-600 bg-transparent"><RotateCcw className="w-3.5 h-3.5" /></button>
                      : <button type="button" onClick={() => remove(row)} className="text-gray-300 hover:text-red-600 bg-transparent"><Trash2 className="w-3.5 h-3.5" /></button>}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function CampaignsTab({ meta, pickers }) {
  const { t, i18n } = useTranslation("marketing");
  const { notify, confirm } = useFeedback();
  const [rows, setRows] = useState(null);
  const [view, setView] = useState({ name: "list" });   // list | templates | edit | detail
  const lang = (i18n.resolvedLanguage || "fr").startsWith("en") ? "en" : "fr";

  const load = useCallback(() => { api.get("/marketing/admin/campaigns").then((r) => setRows(r.data.data)).catch((e) => notify(apiError(e, t("error_generic")))); }, []); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { load(); }, [load]);
  const backToList = () => { setView({ name: "list" }); load(); };

  const duplicate = async (r) => { try { await api.post(`/marketing/admin/campaigns/${r.id}/duplicate`); load(); } catch (e) { notify(apiError(e, t("error_generic"))); } };
  const remove = async (r) => {
    if (!(await confirm(t("delete_confirm", { name: r.name })))) return;
    try { await api.delete(`/marketing/admin/campaigns/${r.id}`); load(); } catch (e) { notify(apiError(e, t("error_generic"))); }
  };
  const edit = async (r) => {
    try { const res = await api.get(`/marketing/admin/campaigns/${r.id}`); setView({ name: "edit", initial: res.data.data }); } catch (e) { notify(apiError(e, t("error_generic"))); }
  };

  if (view.name === "edit") return <CampaignEditor initial={view.initial} pickers={pickers} onClose={backToList} onDone={backToList} />;
  if (view.name === "detail") return <Detail id={view.id} onBack={backToList} onEdit={(c) => setView({ name: "edit", initial: c })} />;

  if (view.name === "templates") return <TemplatePicker lang={lang} onBack={() => setView({ name: "list" })} onUse={(row) => setView({ name: "edit", initial: fromTemplateRow(row, lang) })} />;

  return (
    <div className="space-y-5">
      {meta && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Stat label={t("meta_today")} value={`${meta.sent_today} / ${meta.daily_limit}`} sub={t("meta_today_hint")} />
          <Stat label={t("meta_queue")} value={meta.queued} />
          <Stat label={t("meta_smtp")} value={meta.smtp_configured ? t("ok") : t("missing")} tone={meta.smtp_configured ? "text-emerald-600" : "text-red-600"} />
          <Stat label="Telegram" value={meta.telegram_configured ? t("ok") : t("not_configured")} tone={meta.telegram_configured ? "text-emerald-600" : "text-gray-500"} />
        </div>
      )}
      <Card title={t("campaigns")} action={<button type="button" onClick={() => setView({ name: "templates" })} className={btnPrimary}><Plus className="w-4 h-4" />{t("new_campaign")}</button>}>
        {!rows ? <Center><Spinner className="w-6 h-6" /></Center> : rows.length === 0 ? <Empty>{t("no_campaigns")}</Empty> : (
          <ul className="divide-y divide-gray-100">
            {rows.map((r) => (
              <li key={r.id} className="py-3 flex items-center justify-between gap-3 flex-wrap">
                <button type="button" onClick={() => setView({ name: "detail", id: r.id })} className="min-w-0 text-left bg-transparent flex-1">
                  <span className="block text-sm font-semibold text-gray-900 truncate">{r.name}</span>
                  <span className="block text-xs text-gray-500">{t(`kind_${r.kind}`)} · {r.scheduled_at ? formatDateTime(r.scheduled_at) : formatDate(r.created_at)}</span>
                </button>
                <div className="flex items-center gap-3 shrink-0">
                  {r.status !== "draft" && <span className="text-xs text-gray-500 hidden sm:block">{t("row_stats", { sent: r.sent, open: pct(r.opened, r.sent), click: pct(r.clicked, r.sent) })}</span>}
                  <Pill tone={STATUS_TONE[r.status]}>{t(`status_${r.status}`)}</Pill>
                  {["draft", "scheduled"].includes(r.status) && <button type="button" onClick={() => edit(r)} className={btnGhost}>{t("edit")}</button>}
                  <button type="button" onClick={() => duplicate(r)} className="p-1.5 bg-transparent text-gray-400 hover:text-gray-700" title={t("duplicate")}><Copy className="w-4 h-4" /></button>
                  {["draft", "cancelled"].includes(r.status) && <button type="button" onClick={() => remove(r)} className="p-1.5 bg-transparent text-gray-400 hover:text-red-600" title={t("delete")}><Trash2 className="w-4 h-4" /></button>}
                </div>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
