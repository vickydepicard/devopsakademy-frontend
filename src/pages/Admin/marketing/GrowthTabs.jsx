// Automatisations (bienvenue, relances…) et codes promo.
import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Copy, Mail, Plus, RotateCcw, Trash2 } from "lucide-react";
import api from "../../../api/api";
import { useAuth } from "../../../contexts/AuthContext";
import useFeedback, { apiError } from "../../../components/Common/useFeedback";
import { formatDate, formatMoney } from "../../../utils/format";
import { Card, Center, Empty, Pill, Spinner, Stat, btnGhost, btnPrimary, btnDanger, inp } from "../program/ui";
import BlocksEditor from "./BlocksEditor";

const Label = ({ children }) => <span className="block text-xs font-medium text-gray-600 mb-1">{children}</span>;
const pct = (a, b) => (b ? `${Math.round((a / b) * 1000) / 10}%` : "—");
const TRIGGERS = ["signup", "no_enrollment", "inactive", "course_stalled", "course_completed"];

// ═══════════════ Automatisations ═══════════════
function AutomationEditor({ initial, pickers, onClose, onSaved }) {
  const { t } = useTranslation("marketing");
  const { user } = useAuth();
  const { notify, confirm } = useFeedback();
  const [a, setA] = useState(initial);
  const [lang, setLang] = useState("fr");
  const [preview, setPreview] = useState(null);
  const [busy, setBusy] = useState("");
  const [testEmail, setTestEmail] = useState(user?.email || "");
  const patch = (p) => setA((x) => ({ ...x, ...p }));
  const key = lang === "en" ? "blocks_en" : "blocks_fr";

  const save = async () => {
    setBusy("save");
    try {
      const r = a.id ? await api.put(`/marketing/admin/automations/${a.id}`, a) : await api.post("/marketing/admin/automations", a);
      notify(t("saved"), "success"); onSaved(r.data.data.id);
    } catch (e) { notify(apiError(e, t("error_generic"))); } finally { setBusy(""); }
  };
  const test = async () => {
    setBusy("test");
    try { await save0(); await api.post(`/marketing/admin/automations/${a.id}/test`, { email: testEmail, lang }); notify(t("test_sent", { email: testEmail }), "success"); }
    catch (e) { notify(apiError(e, t("error_generic"))); } finally { setBusy(""); }
  };
  const save0 = async () => { if (!a.id) throw { response: { data: { message: t("save_first") } } }; await api.put(`/marketing/admin/automations/${a.id}`, a); };
  const loadPreview = useCallback(async () => {
    if (!a.id) return;
    try { await api.put(`/marketing/admin/automations/${a.id}`, a); const r = await api.get(`/marketing/admin/automations/${a.id}/preview`, { params: { lang } }); setPreview(r.data.data); }
    catch (e) { notify(apiError(e, t("error_generic"))); }
  }, [a, lang]); // eslint-disable-line react-hooks/exhaustive-deps
  const reset = async () => {
    if (!(await confirm(t("reset_confirm"), { confirmLabel: t("restore") }))) return;
    try { await api.post(`/marketing/admin/automations/${a.id}/reset`); notify(t("restored"), "success"); onSaved(a.id); } catch (e) { notify(apiError(e, t("error_generic"))); }
  };
  const remove = async () => {
    if (!(await confirm(t("delete_confirm", { name: a.name_fr })))) return;
    try { await api.delete(`/marketing/admin/automations/${a.id}`); onSaved(null); } catch (e) { notify(apiError(e, t("error_generic"))); }
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <button type="button" onClick={onClose} className="text-sm font-semibold text-primary bg-transparent hover:underline">← {t("back_to_list")}</button>
        <div className="flex gap-2">
          {a.is_preset && <button type="button" onClick={reset} className={btnGhost}><RotateCcw className="w-4 h-4" />{t("restore")}</button>}
          {a.id && !a.is_preset && <button type="button" onClick={remove} className={btnDanger}><Trash2 className="w-4 h-4" />{t("delete")}</button>}
          <button type="button" onClick={save} disabled={!!busy} className={btnPrimary}>{busy === "save" && <Spinner className="w-4 h-4" />}{t("save")}</button>
        </div>
      </div>
      <div className="grid xl:grid-cols-[1fr_420px] gap-5 items-start">
        <div className="space-y-5">
          <Card title={t("auto_settings")}>
            <div className="grid sm:grid-cols-2 gap-3">
              <label className="block"><Label>{t("name_fr")}</Label><input className={inp} value={a.name_fr} onChange={(e) => patch({ name_fr: e.target.value })} /></label>
              <label className="block"><Label>{t("name_en")}</Label><input className={inp} value={a.name_en} onChange={(e) => patch({ name_en: e.target.value })} /></label>
              <label className="block"><Label>{t("auto_trigger")}</Label>
                <select className={inp} value={a.trigger_type} disabled={!!a.id} onChange={(e) => patch({ trigger_type: e.target.value })}>{TRIGGERS.map((x) => <option key={x} value={x}>{t(`trig_${x}`)}</option>)}</select></label>
              <label className="block"><Label>{t("auto_delay")}</Label><input type="number" min="0" max="365" className={inp} value={a.delay_days} onChange={(e) => patch({ delay_days: e.target.value })} /></label>
              <label className="block sm:col-span-2"><Label>{t("auto_pref")}</Label>
                <select className={inp} value={a.pref} onChange={(e) => patch({ pref: e.target.value })}>{["newsletter", "promotions", "events"].map((x) => <option key={x} value={x}>{t(`pref_${x}`)}</option>)}</select></label>
            </div>
            <p className="text-xs text-gray-500 mt-3">{t(`trig_${a.trigger_type}_hint`)}</p>
          </Card>
          <Card title={t("sec_content")} action={<div className="flex gap-1">{["fr", "en"].map((l) => <button key={l} type="button" onClick={() => setLang(l)} className={`px-3 py-1 rounded-lg text-xs font-bold ${lang === l ? "bg-primary text-white" : "bg-gray-100 text-gray-600"}`}>{l.toUpperCase()}</button>)}</div>}>
            <div className="space-y-3">
              <label className="block"><Label>{t("subject")}</Label><input className={inp} value={a[`subject_${lang}`] || ""} onChange={(e) => patch({ [`subject_${lang}`]: e.target.value })} /></label>
              <label className="block"><Label>{t("preheader")}</Label><input className={inp} value={a[`preheader_${lang}`] || ""} onChange={(e) => patch({ [`preheader_${lang}`]: e.target.value })} /></label>
              <p className="text-[11px] text-gray-400">{t("auto_vars_hint")}</p>
              <BlocksEditor blocks={a[key]} onChange={(b) => patch({ [key]: b })} pickers={pickers} />
            </div>
          </Card>
        </div>
        <div className="xl:sticky xl:top-4 space-y-5">
          <Card title={t("preview")} action={<button type="button" onClick={loadPreview} disabled={!a.id} className={btnGhost}>{t("refresh_preview")}</button>}>
            {!a.id ? <p className="text-sm text-gray-400 text-center py-8">{t("save_first")}</p> : !preview ? <p className="text-sm text-gray-400 text-center py-8">{t("click_preview")}</p> : (
              <>
                <p className="text-xs text-gray-500 mb-2 truncate"><strong>{t("subject")} :</strong> {preview.subject}</p>
                <iframe title={t("preview")} sandbox="" srcDoc={preview.html} className="w-full h-[460px] border border-gray-200 rounded-xl bg-white" />
                <p className="text-[11px] text-gray-500 mt-2">{t("auto_eligible", { count: preview.eligible_now })}</p>
              </>
            )}
          </Card>
          <Card title={t("send_test")}>
            <div className="flex gap-2"><input type="email" className={inp} value={testEmail} onChange={(e) => setTestEmail(e.target.value)} /><button type="button" onClick={test} disabled={!!busy || !testEmail || !a.id} className={btnGhost}>{busy === "test" ? <Spinner className="w-4 h-4" /> : <Mail className="w-4 h-4" />}{t("send_test")}</button></div>
          </Card>
        </div>
      </div>
    </div>
  );
}

export function AutomationsTab({ pickers }) {
  const { t, i18n } = useTranslation("marketing");
  const { notify, confirm } = useFeedback();
  const [rows, setRows] = useState(null);
  const [edit, setEdit] = useState(null);
  const en = (i18n.resolvedLanguage || "fr").startsWith("en");

  const load = useCallback(() => { api.get("/marketing/admin/automations").then((r) => setRows(r.data.data)).catch((e) => notify(apiError(e, t("error_generic")))); }, []); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { load(); }, [load]);

  const toggle = async (a) => {
    if (!a.enabled) {
      let extra = "";
      if (a.trigger_type === "inactive") {
        try { await api.put(`/marketing/admin/automations/${a.id}`, a); const p = await api.get(`/marketing/admin/automations/${a.id}/preview`); extra = `\n\n${t("auto_eligible_warn", { count: p.data.data.eligible_now })}`; } catch { /* aperçu indisponible */ }
      }
      if (!(await confirm(`${t("auto_enable_confirm", { name: en ? a.name_en : a.name_fr })}${extra}`, { confirmLabel: t("enable"), danger: false }))) return;
    }
    try { await api.post(`/marketing/admin/automations/${a.id}/toggle`, { enabled: !a.enabled }); load(); } catch (e) { notify(apiError(e, t("error_generic"))); }
  };

  if (edit) return <AutomationEditor initial={edit} pickers={pickers} onClose={() => { setEdit(null); load(); }} onSaved={(id) => { if (id) { api.get("/marketing/admin/automations").then((r) => { setRows(r.data.data); setEdit(r.data.data.find((x) => x.id === id) || null); }); } else { setEdit(null); load(); } }} />;
  if (!rows) return <Center><Spinner className="w-6 h-6" /></Center>;

  const blank = { name_fr: "", name_en: "", trigger_type: "signup", delay_days: 0, pref: "newsletter", subject_fr: "", subject_en: "", preheader_fr: "", preheader_en: "", blocks_fr: [{ type: "heading", text: "" }, { type: "text", text: "Bonjour {{first_name}}," }], blocks_en: [{ type: "heading", text: "" }, { type: "text", text: "Hello {{first_name}}," }] };
  return (
    <div className="space-y-5">
      <Card title={t("automations_title")} action={<button type="button" onClick={() => setEdit(blank)} className={btnPrimary}><Plus className="w-4 h-4" />{t("auto_new")}</button>}>
        <p className="text-xs text-gray-500 mb-4">{t("automations_hint")}</p>
        <ul className="divide-y divide-gray-100">
          {rows.map((a) => (
            <li key={a.id} className="py-4 flex items-center justify-between gap-4 flex-wrap">
              <div className="min-w-0 flex-1">
                <p className="text-sm font-bold text-gray-900">{en ? a.name_en : a.name_fr} {a.is_preset && <Pill>{t("preset")}</Pill>}</p>
                <p className="text-xs text-gray-500 mt-0.5">{t(`trig_${a.trigger_type}`)}{a.delay_days ? ` · ${t("after_days", { count: a.delay_days })}` : ""}</p>
                {a.enabled && <p className="text-xs text-gray-500 mt-1">{t("auto_stats", { sent: a.sent, open: pct(a.opened, a.sent), click: pct(a.clicked, a.sent), queued: a.queued })}</p>}
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <button type="button" onClick={() => setEdit(a)} className={btnGhost}>{t("edit")}</button>
                <button type="button" role="switch" aria-checked={a.enabled} onClick={() => toggle(a)} title={a.enabled ? t("disable") : t("enable")}
                  className={`relative w-12 h-6 rounded-full transition ${a.enabled ? "bg-emerald-500" : "bg-gray-300"}`}>
                  <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition ${a.enabled ? "translate-x-6" : ""}`} />
                </button>
              </div>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}

// ═══════════════ Codes promo ═══════════════
const blankCoupon = { code: "", prefix: "PROMO", discount_type: "percentage", discount_value: 20, applicable_to: "all", course_ids: [], category_ids: [], max_uses: "", max_uses_per_user: 1, minimum_amount: 0, starts_at: "", expires_at: "", is_public: true };

export function CouponsTab({ pickers }) {
  const { t } = useTranslation("marketing");
  const { notify, confirm } = useFeedback();
  const [rows, setRows] = useState(null);
  const [f, setF] = useState(null);
  const [busy, setBusy] = useState(false);
  const load = useCallback(() => { api.get("/marketing/admin/coupons").then((r) => setRows(r.data.data)).catch((e) => notify(apiError(e, t("error_generic")))); }, []); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { load(); }, [load]);

  const save = async () => {
    setBusy(true);
    try {
      await api.post("/marketing/admin/coupons", { ...f, max_uses: f.max_uses === "" ? null : Number(f.max_uses), starts_at: f.starts_at ? new Date(f.starts_at).toISOString() : null, expires_at: f.expires_at ? new Date(f.expires_at).toISOString() : null });
      notify(t("coupon_created"), "success"); setF(null); load();
    } catch (e) { notify(apiError(e, t("error_generic"))); } finally { setBusy(false); }
  };
  const toggle = async (c) => { try { await api.put(`/marketing/admin/coupons/${c.id}`, { is_active: !c.is_active, expires_at: c.expires_at, max_uses: c.max_uses }); load(); } catch (e) { notify(apiError(e, t("error_generic"))); } };
  const remove = async (c) => { if (!(await confirm(t("delete_confirm", { name: c.code })))) return; try { await api.delete(`/marketing/admin/coupons/${c.id}`); load(); } catch (e) { notify(apiError(e, t("error_generic"))); } };
  const copy = async (code) => { try { await navigator.clipboard.writeText(code); notify(t("copied"), "success"); } catch { /* presse-papiers indisponible */ } };
  const togglePublic = async (c) => { try { await api.put(`/marketing/admin/coupons/${c.id}`, { is_active: c.is_active, expires_at: c.expires_at, max_uses: c.max_uses, is_public: !c.is_public }); load(); } catch (e) { notify(apiError(e, t("error_generic"))); } };
  // Lien de partage : ouvre le cours (ou le catalogue) et applique le code automatiquement au paiement
  const shareLink = (c) => {
    const one = c.applicable_to === "specific_courses" && c.course_ids.length === 1 ? c.course_ids[0] : null;
    return `${window.location.origin}/courses${one ? `/${one}` : ""}?promo=${encodeURIComponent(c.code)}`;
  };
  const shareMessage = (c) => {
    const one = c.applicable_to === "specific_courses" && c.course_ids.length === 1 ? (pickers?.courses || []).find((x) => x.id === c.course_ids[0]) : null;
    return t("share_message_text", {
      discount: c.discount_type === "percentage" ? `-${Number(c.discount_value)} %` : `-${formatMoney(c.discount_value)}`,
      what: one ? `« ${one.title} »` : t("share_all_courses"), code: c.code,
      until: c.expires_at ? t("share_until", { date: formatDate(c.expires_at) }) : "", link: shareLink(c),
    }).replace(/ +\n/g, "\n");
  };
  const copyShare = async (text) => { try { await navigator.clipboard.writeText(text); notify(t("share_copied"), "success"); } catch { /* presse-papiers indisponible */ } };
  const set = (p) => setF((x) => ({ ...x, ...p }));
  const toggleId = (k, id) => set({ [k]: f[k].includes(id) ? f[k].filter((x) => x !== id) : [...f[k], id] });
  const scope = (c) => c.applicable_to === "specific_courses" ? t("scope_courses", { n: c.course_ids.length }) : c.applicable_to === "specific_categories" ? t("scope_categories", { n: c.category_ids.length }) : t("scope_all");
  const totals = (rows || []).reduce((s, c) => ({ uses: s.uses + Number(c.uses_count), discount: s.discount + c.discount_total, revenue: s.revenue + c.revenue }), { uses: 0, discount: 0, revenue: 0 });

  return (
    <div className="space-y-5">
      {rows && <div className="grid grid-cols-3 gap-3"><Stat label={t("coupon_uses")} value={totals.uses} /><Stat label={t("coupon_discount_total")} value={formatMoney(totals.discount)} tone="text-amber-600" /><Stat label={t("coupon_revenue")} value={formatMoney(totals.revenue)} tone="text-emerald-600" /></div>}
      <Card title={t("coupons_title")} action={<button type="button" onClick={() => setF({ ...blankCoupon })} className={btnPrimary}><Plus className="w-4 h-4" />{t("coupon_new")}</button>}>
        <p className="text-xs text-gray-500 mb-1">{t("coupons_hint")}</p>
        <p className="text-xs text-primary/80 mb-4">{t("share_hint")}</p>
        {!rows ? <Center><Spinner className="w-6 h-6" /></Center> : rows.length === 0 ? <Empty>{t("coupons_empty")}</Empty> : (
          <div className="overflow-x-auto"><table className="w-full text-sm">
            <thead className="text-xs text-gray-500"><tr>{["col_code", "col_discount", "col_scope", "col_usage", "col_revenue", "col_expires"].map((k) => <th key={k} className="text-left font-medium py-1.5 pr-3">{t(k)}</th>)}<th /></tr></thead>
            <tbody className="divide-y divide-gray-100">
              {rows.map((c) => {
                const expired = c.expires_at && new Date(c.expires_at) <= new Date();
                return (
                  <tr key={c.id}>
                    <td className="py-2.5 pr-3"><span className="font-mono font-bold text-gray-900">{c.code}</span> <button type="button" onClick={() => copy(c.code)} className="text-gray-300 hover:text-gray-600 bg-transparent"><Copy className="w-3.5 h-3.5 inline" /></button>
                      {c.campaign_name && <span className="block text-[11px] text-gray-400">{c.campaign_name}</span>}
                      <span className="mt-1 flex flex-wrap gap-x-3 gap-y-0.5 text-[11px] font-semibold">
                        <button type="button" onClick={() => copyShare(shareLink(c))} className="bg-transparent text-primary hover:underline">{t("share_link")}</button>
                        <button type="button" onClick={() => copyShare(shareMessage(c))} className="bg-transparent text-primary hover:underline">{t("share_message")}</button>
                      </span></td>
                    <td className="py-2.5 pr-3 whitespace-nowrap">{c.discount_type === "percentage" ? `-${Number(c.discount_value)}%` : `-${formatMoney(c.discount_value)}`}</td>
                    <td className="py-2.5 pr-3 text-xs text-gray-600">{scope(c)}</td>
                    <td className="py-2.5 pr-3 text-xs">{c.uses_count}{c.max_uses ? ` / ${c.max_uses}` : ""}</td>
                    <td className="py-2.5 pr-3 text-xs whitespace-nowrap">{formatMoney(c.revenue)}</td>
                    <td className="py-2.5 pr-3 text-xs whitespace-nowrap">{c.expires_at ? formatDate(c.expires_at) : "—"} {expired ? <Pill tone="bg-gray-100 text-gray-500">{t("expired")}</Pill> : !c.is_active ? <Pill tone="bg-red-100 text-red-600">{t("off")}</Pill> : <Pill tone="bg-emerald-100 text-emerald-700">{t("live")}</Pill>}</td>
                    <td className="py-2.5 text-right whitespace-nowrap">
                      <button type="button" onClick={() => togglePublic(c)} title={t("coupon_public_hint")} className={`text-xs font-semibold bg-transparent hover:underline mr-3 ${c.is_public ? "text-emerald-600" : "text-gray-400"}`}>{c.is_public ? t("coupon_shown") : t("coupon_hidden")}</button>
                      <button type="button" onClick={() => toggle(c)} className="text-xs font-semibold text-primary bg-transparent hover:underline mr-3">{c.is_active ? t("disable") : t("enable")}</button>
                      {Number(c.uses_count) === 0 && <button type="button" onClick={() => remove(c)} className="text-gray-300 hover:text-red-600 bg-transparent"><Trash2 className="w-4 h-4 inline" /></button>}
                    </td>
                  </tr>);
              })}
            </tbody></table></div>
        )}
      </Card>
      {f && (
        <Card title={t("coupon_new")}>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            <label className="block"><Label>{t("coupon_code")}</Label><input className={`${inp} uppercase`} maxLength={40} placeholder={t("coupon_code_auto")} value={f.code} onChange={(e) => set({ code: e.target.value.toUpperCase() })} /></label>
            <label className="block"><Label>{t("coupon_type")}</Label><select className={inp} value={f.discount_type} onChange={(e) => set({ discount_type: e.target.value })}><option value="percentage">{t("coupon_percentage")}</option><option value="fixed">{t("coupon_fixed")}</option></select></label>
            <label className="block"><Label>{f.discount_type === "percentage" ? t("promo_percent_value") : t("coupon_amount")}</Label><input type="number" min="1" className={inp} value={f.discount_value} onChange={(e) => set({ discount_value: e.target.value })} /></label>
            <label className="block"><Label>{t("coupon_scope")}</Label><select className={inp} value={f.applicable_to} onChange={(e) => set({ applicable_to: e.target.value })}><option value="all">{t("scope_all")}</option><option value="specific_courses">{t("scope_pick_courses")}</option><option value="specific_categories">{t("scope_pick_categories")}</option></select></label>
            <label className="block"><Label>{t("coupon_max_uses")}</Label><input type="number" min="1" className={inp} placeholder={t("unlimited")} value={f.max_uses} onChange={(e) => set({ max_uses: e.target.value })} /></label>
            <label className="block"><Label>{t("coupon_per_user")}</Label><input type="number" min="1" className={inp} value={f.max_uses_per_user} onChange={(e) => set({ max_uses_per_user: e.target.value })} /></label>
            <label className="block"><Label>{t("coupon_min_amount")}</Label><input type="number" min="0" className={inp} value={f.minimum_amount} onChange={(e) => set({ minimum_amount: e.target.value })} /></label>
            <label className="block"><Label>{t("banner_starts")}</Label><input type="datetime-local" className={inp} value={f.starts_at} onChange={(e) => set({ starts_at: e.target.value })} /></label>
            <label className="block"><Label>{t("coupon_expires")}</Label><input type="datetime-local" className={inp} value={f.expires_at} onChange={(e) => set({ expires_at: e.target.value })} /></label>
          </div>
          <label className="mt-3 flex items-start gap-2 text-sm text-gray-700"><input type="checkbox" className="mt-0.5 h-4 w-4" checked={f.is_public} onChange={(e) => set({ is_public: e.target.checked })} /><span><strong>{t("coupon_public")}</strong> — {t("coupon_public_hint")}</span></label>
          {f.applicable_to === "specific_courses" && <div className="mt-3 max-h-44 overflow-y-auto border border-gray-100 rounded-xl p-3 space-y-1.5">{(pickers?.courses || []).map((c) => <label key={c.id} className="flex items-center gap-2 text-sm text-gray-700"><input type="checkbox" className="w-4 h-4" checked={f.course_ids.includes(c.id)} onChange={() => toggleId("course_ids", c.id)} />{c.title}</label>)}</div>}
          {f.applicable_to === "specific_categories" && <div className="mt-3 flex flex-wrap gap-3 border border-gray-100 rounded-xl p-3">{(pickers?.categories || []).map((c) => <label key={c.id} className="flex items-center gap-2 text-sm text-gray-700"><input type="checkbox" className="w-4 h-4" checked={f.category_ids.includes(c.id)} onChange={() => toggleId("category_ids", c.id)} />{c.name}</label>)}</div>}
          <p className="text-[11px] text-amber-700 bg-amber-50 rounded-lg p-2.5 mt-3">{t("coupon_no_stack")}</p>
          <div className="flex justify-end gap-2 mt-4"><button type="button" onClick={() => setF(null)} className={btnGhost}>{t("cancel")}</button><button type="button" onClick={save} disabled={busy} className={btnPrimary}>{busy && <Spinner className="w-4 h-4" />}{t("coupon_create")}</button></div>
        </Card>
      )}
    </div>
  );
}
