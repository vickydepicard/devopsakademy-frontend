// Éditeur de campagne : contenu (FR/EN), public, canaux, offre, aperçu, test et envoi / programmation.
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { ArrowLeft, BookmarkPlus, Mail, Save, Send, Users } from "lucide-react";
import api from "../../../api/api";
import { useAuth } from "../../../contexts/AuthContext";
import useFeedback, { apiError } from "../../../components/Common/useFeedback";
import { Card, Spinner, Pill, btnGhost, btnPrimary, inp } from "../program/ui";
import BlocksEditor from "./BlocksEditor";
import { DEFAULT_AB, contentFromCampaign } from "./templates";

const KINDS = ["newsletter", "offer", "webinar", "announcement"];
const toLocalInput = (d) => { const x = new Date(d); x.setMinutes(x.getMinutes() - x.getTimezoneOffset()); return x.toISOString().slice(0, 16); };
const Label = ({ children }) => <span className="block text-xs font-medium text-gray-600 mb-1">{children}</span>;
const Check = ({ checked, onChange, children }) => (
  <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer"><input type="checkbox" className="w-4 h-4" checked={!!checked} onChange={(e) => onChange(e.target.checked)} />{children}</label>
);

export default function CampaignEditor({ initial, pickers, onClose, onDone }) {
  const { t } = useTranslation("marketing");
  const { user } = useAuth();
  const { notify, confirm } = useFeedback();
  const [c, setC] = useState(initial);
  const [lang, setLang] = useState("fr");
  const [count, setCount] = useState(null);
  const [preview, setPreview] = useState(null);
  const [busy, setBusy] = useState("");
  const [testEmail, setTestEmail] = useState(user?.email || "");
  const [when, setWhen] = useState("");
  const [promo, setPromo] = useState(() => ({
    course_id: "", type: initial._promo?.type || "percent", percent: initial._promo?.percent || 50,
    days: initial._promo?.days || 3, starts_at: "",
  }));
  const [promoDone, setPromoDone] = useState(false);
  const [offerMode, setOfferMode] = useState(initial._coupon && !initial._promo ? "coupon" : "price");
  const [cp, setCp] = useState(() => ({ code: initial._coupon?.code || "", percent: initial._coupon?.percent || 20, days: initial._coupon?.days || 14, course_id: "" }));
  const [cpDone, setCpDone] = useState(null);
  const [tplName, setTplName] = useState("");
  const [showTpl, setShowTpl] = useState(false);
  const ab = { ...DEFAULT_AB, ...(c.ab_test || {}) };
  const setAb = (p) => patch({ ab_test: { ...ab, ...p } });
  const locked = c.id && !["draft", "scheduled"].includes(c.status);
  const patch = (p) => setC((x) => ({ ...x, ...p }));
  const aud = c.audience || {};
  const ch = c.channels || {};
  const setAud = (p) => patch({ audience: { ...aud, ...p } });
  const setCh = (p) => patch({ channels: { ...ch, ...p } });
  const blocksKey = lang === "en" ? "blocks_en" : "blocks_fr";

  // Nombre de destinataires (anti-rebond)
  useEffect(() => {
    const h = setTimeout(() => {
      api.post("/marketing/admin/audience/count", { kind: c.kind, audience: aud }).then((r) => setCount(r.data.data)).catch(() => setCount(null));
    }, 400);
    return () => clearTimeout(h);
  }, [c.kind, JSON.stringify(aud)]); // eslint-disable-line react-hooks/exhaustive-deps

  // Aperçu (anti-rebond)
  const previewSeq = useRef(0);
  useEffect(() => {
    const seq = ++previewSeq.current;
    const h = setTimeout(() => {
      api.post("/marketing/admin/preview", { ...c, lang }).then((r) => { if (seq === previewSeq.current) setPreview(r.data.data); }).catch(() => {});
    }, 500);
    return () => clearTimeout(h);
  }, [c.subject_fr, c.subject_en, c.preheader_fr, c.preheader_en, JSON.stringify(c.blocks_fr), JSON.stringify(c.blocks_en), lang]); // eslint-disable-line react-hooks/exhaustive-deps

  const save = useCallback(async () => {
    const body = { ...c }; delete body._promo; delete body._coupon; delete body._banner_tone; delete body._tplId; delete body._tplBuiltin;
    const r = c.id ? await api.put(`/marketing/admin/campaigns/${c.id}`, body) : await api.post("/marketing/admin/campaigns", body);
    const id = r.data.data.id;
    if (!c.id) patch({ id });
    return id;
  }, [c]); // eslint-disable-line react-hooks/exhaustive-deps

  const run = async (key, fn, okMsg) => {
    setBusy(key);
    try { const out = await fn(); if (okMsg) notify(okMsg, "success"); return out; }
    catch (e) { notify(apiError(e, t("error_generic"))); return null; }
    finally { setBusy(""); }
  };

  const saveDraft = () => run("save", save, t("saved"));

  const sendTest = () => run("test", async () => { const id = await save(); await api.post(`/marketing/admin/campaigns/${id}/test`, { email: testEmail, lang }); }, t("test_sent", { email: testEmail }));

  const launch = async (scheduled) => {
    if (channelsNone) return notify(t("pick_channel"));
    if (ch.email && count && count.total === 0 && !ch.inapp) return notify(t("no_recipients"));
    const when_ = scheduled ? new Date(when) : null;
    if (scheduled && (!when || isNaN(when_.getTime()) || when_.getTime() < Date.now() + 60_000)) return notify(t("schedule_future"));
    const msg = scheduled
      ? t("confirm_schedule", { count: count?.total ?? 0, date: when_.toLocaleString() })
      : t("confirm_send_now", { count: count?.total ?? 0 });
    if (!(await confirm(msg, { confirmLabel: scheduled ? t("schedule") : t("send_now"), danger: false }))) return;
    const ok = await run("launch", async () => {
      const id = await save();
      await api.post(`/marketing/admin/campaigns/${id}/schedule`, scheduled ? { scheduled_at: when_.toISOString() } : {});
      return true;
    }, scheduled ? t("scheduled_ok") : t("sending_ok"));
    if (ok) onDone();
  };

  const createPromo = () => run("promo", async () => {
    if (!promo.course_id) throw { response: { data: { message: t("pick_course") } } };
    const id = c.id || (await save());
    const starts = promo.starts_at ? new Date(promo.starts_at) : new Date();
    const ends = new Date(starts.getTime() + Number(promo.days) * 86400_000);
    await api.post("/marketing/admin/promotions", { course_id: Number(promo.course_id), type: promo.type, percent: promo.type === "percent" ? Number(promo.percent) : null, starts_at: starts.toISOString(), ends_at: ends.toISOString(), campaign_id: id });
    setPromoDone(true);
    // relie le cours de la campagne au bloc « cours » vide
    setC((x) => ({ ...x, blocks_fr: x.blocks_fr.map((b) => (b.type === "course" && !b.course_id ? { ...b, course_id: Number(promo.course_id) } : b)), blocks_en: x.blocks_en.map((b) => (b.type === "course" && !b.course_id ? { ...b, course_id: Number(promo.course_id) } : b)) }));
  }, t("promo_created"));

  const createCoupon = () => run("coupon", async () => {
    const id = c.id || (await save());
    const expires = new Date(Date.now() + Number(cp.days) * 86400_000).toISOString();
    const r = await api.post("/marketing/admin/coupons", {
      code: cp.code, prefix: "PROMO", discount_type: "percentage", discount_value: Number(cp.percent), expires_at: expires, max_uses_per_user: 1,
      applicable_to: cp.course_id ? "specific_courses" : "all", course_ids: cp.course_id ? [Number(cp.course_id)] : [], campaign_id: id,
    });
    const code = r.data.data.code;
    setCpDone(code);
    const block = { type: "coupon", code, text: lang === "en" ? "Enter this code at checkout" : "Saisissez ce code au moment du paiement" };
    const upsert = (blocks) => (blocks.some((b) => b.type === "coupon") ? blocks.map((b) => (b.type === "coupon" ? { ...b, code } : b)) : [...blocks, block]);
    setC((x) => ({ ...x, blocks_fr: upsert(x.blocks_fr), blocks_en: upsert(x.blocks_en) }));
  }, t("coupon_created"));

  const saveAsTemplate = (update) => run("tpl", async () => {
    const content = contentFromCampaign(c);
    const base = { type: "campaign", kind: c.kind, icon: "FileText", category: "custom", content };
    if (update && c._tplId) await api.put(`/marketing/admin/templates/${c._tplId}`, { ...base, name_fr: c.name, name_en: c.name, category: "custom" });
    else await api.post("/marketing/admin/templates", { ...base, name_fr: tplName.trim() || c.name, name_en: tplName.trim() || c.name });
    setShowTpl(false); setTplName("");
  }, t("template_saved"));

  const channelsNone = !ch.email && !ch.inapp && !ch.banner && !ch.telegram;
  const toggleBanner = (on) => {
    if (!on) return setCh({ banner: null });
    setCh({ banner: { placement: "top_bar", tone: c._banner_tone || "promo", audience: "all", title_fr: c.subject_fr.replace(/\{\{.*?\}\}/g, "").trim(), title_en: c.subject_en.replace(/\{\{.*?\}\}/g, "").trim(), body_fr: "", body_en: "", cta_label_fr: "Découvrir", cta_label_en: "Discover", cta_url: "/courses", image_url: "", ends_at: new Date(Date.now() + 3 * 86400_000).toISOString() } });
  };
  const setBanner = (p) => setCh({ banner: { ...ch.banner, ...p } });
  const offerCourses = useMemo(() => (pickers?.courses || []).filter((x) => Number(x.is_published)), [pickers]);

  return (
    <div className="space-y-5 text-left">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <button type="button" onClick={onClose} className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary bg-transparent hover:underline"><ArrowLeft className="w-4 h-4" />{t("back_to_list")}</button>
        <div className="flex gap-2">
          {c.id && <Pill tone="bg-gray-100 text-gray-600">{t(`status_${c.status || "draft"}`)}</Pill>}
          <button type="button" onClick={() => setShowTpl((v) => !v)} className={btnGhost}><BookmarkPlus className="w-4 h-4" />{t("save_as_template")}</button>
          <button type="button" onClick={saveDraft} disabled={!!busy || locked} className={btnGhost}>{busy === "save" ? <Spinner className="w-4 h-4" /> : <Save className="w-4 h-4" />}{t("save_draft")}</button>
        </div>
      </div>
      {showTpl && (
        <Card title={t("save_as_template")}>
          <div className="flex gap-2 flex-wrap items-end">
            <label className="block flex-1 min-w-[14rem]"><Label>{t("template_name")}</Label><input className={inp} value={tplName} placeholder={c.name} onChange={(e) => setTplName(e.target.value)} /></label>
            <button type="button" onClick={() => saveAsTemplate(false)} disabled={!!busy} className={btnPrimary}>{busy === "tpl" && <Spinner className="w-4 h-4" />}{t("template_create")}</button>
            {c._tplId && <button type="button" onClick={() => saveAsTemplate(true)} disabled={!!busy} className={btnGhost}>{t("template_update")}</button>}
          </div>
          <p className="text-[11px] text-gray-400 mt-2">{t("template_hint")}</p>
        </Card>
      )}
      {locked && <p className="text-sm text-amber-700 bg-amber-50 border border-amber-100 rounded-xl p-3">{t("locked")}</p>}

      <div className="grid xl:grid-cols-[1fr_440px] gap-5 items-start">
        <div className="space-y-5">
          <Card title={t("sec_basics")}>
            <div className="grid sm:grid-cols-2 gap-3">
              <label className="block"><Label>{t("name")}</Label><input className={inp} value={c.name} maxLength={200} onChange={(e) => patch({ name: e.target.value })} /></label>
              <label className="block"><Label>{t("kind")}</Label>
                <select className={inp} value={c.kind} onChange={(e) => patch({ kind: e.target.value })}>{KINDS.map((k) => <option key={k} value={k}>{t(`kind_${k}`)}</option>)}</select></label>
            </div>
          </Card>

          <Card title={t("sec_content")} action={
            <div className="flex gap-1">{["fr", "en"].map((l) => <button key={l} type="button" onClick={() => setLang(l)} className={`px-3 py-1 rounded-lg text-xs font-bold ${lang === l ? "bg-primary text-white" : "bg-gray-100 text-gray-600"}`}>{l.toUpperCase()}</button>)}</div>}>
            <div className="space-y-3">
              <label className="block"><Label>{t("subject")}</Label>
                <input className={inp} maxLength={250} value={c[`subject_${lang}`]} onChange={(e) => patch({ [`subject_${lang}`]: e.target.value })} /></label>
              <label className="block"><Label>{t("preheader")}</Label>
                <input className={inp} maxLength={250} value={c[`preheader_${lang}`] || ""} onChange={(e) => patch({ [`preheader_${lang}`]: e.target.value })} /></label>
              <p className="text-[11px] text-gray-400">{t("placeholder_hint")}</p>
              <BlocksEditor blocks={c[blocksKey]} onChange={(b) => patch({ [blocksKey]: b })} pickers={pickers} />
              {lang === "en" && <button type="button" onClick={() => patch({ blocks_en: JSON.parse(JSON.stringify(c.blocks_fr)), subject_en: c.subject_en || c.subject_fr })} className="text-xs font-semibold text-primary bg-transparent hover:underline">{t("copy_from_fr")}</button>}
              <p className="text-[11px] text-gray-400">{t("lang_fallback")}</p>
            </div>
          </Card>

          {c.kind === "offer" && (
            <Card title={t("sec_offer")}>
              <div className="flex gap-1 mb-3">{["price", "coupon"].map((m) => <button key={m} type="button" onClick={() => setOfferMode(m)} className={`px-3 py-1.5 rounded-lg text-xs font-bold ${offerMode === m ? "bg-primary text-white" : "bg-gray-100 text-gray-600"}`}>{t(`offer_mode_${m}`)}</button>)}</div>
              {offerMode === "coupon" ? (
                cpDone ? <p className="text-sm text-emerald-700 font-semibold">{t("coupon_added_block", { code: cpDone })}</p> : (
                  <div className="grid sm:grid-cols-2 gap-3">
                    <p className="sm:col-span-2 text-xs text-gray-500">{t("coupon_mode_hint")}</p>
                    <label className="block"><Label>{t("coupon_code")}</Label><input className={`${inp} uppercase`} maxLength={40} placeholder={t("coupon_code_auto")} value={cp.code} onChange={(e) => setCp((p) => ({ ...p, code: e.target.value.toUpperCase() }))} /></label>
                    <label className="block"><Label>{t("promo_percent_value")}</Label><input type="number" min="1" max="100" className={inp} value={cp.percent} onChange={(e) => setCp((p) => ({ ...p, percent: e.target.value }))} /></label>
                    <label className="block"><Label>{t("coupon_valid_days")}</Label><input type="number" min="1" max="365" className={inp} value={cp.days} onChange={(e) => setCp((p) => ({ ...p, days: e.target.value }))} /></label>
                    <label className="block"><Label>{t("coupon_scope")}</Label>
                      <select className={inp} value={cp.course_id} onChange={(e) => setCp((p) => ({ ...p, course_id: e.target.value }))}><option value="">{t("scope_all")}</option>{offerCourses.map((x) => <option key={x.id} value={x.id}>{x.title}</option>)}</select></label>
                    <div className="sm:col-span-2 flex justify-end"><button type="button" onClick={createCoupon} disabled={!!busy} className={btnPrimary}>{busy === "coupon" && <Spinner className="w-4 h-4" />}{t("coupon_create")}</button></div>
                  </div>)
              ) : (<>
              <p className="text-xs text-gray-500 mb-3">{t("offer_hint")}</p>
              {promoDone ? <p className="text-sm text-emerald-700 font-semibold">{t("promo_created")}</p> : (
                <div className="grid sm:grid-cols-2 gap-3">
                  <label className="block sm:col-span-2"><Label>{t("promo_course")}</Label>
                    <select className={inp} value={promo.course_id} onChange={(e) => setPromo((p) => ({ ...p, course_id: e.target.value }))}>
                      <option value="">{t("pick_course")}</option>{offerCourses.map((x) => <option key={x.id} value={x.id}>{x.title} — {Number(x.is_free) ? t("free") : `${Number(x.price).toLocaleString()} XAF`}</option>)}
                    </select></label>
                  <label className="block"><Label>{t("promo_type")}</Label>
                    <select className={inp} value={promo.type} onChange={(e) => setPromo((p) => ({ ...p, type: e.target.value }))}><option value="percent">{t("promo_percent")}</option><option value="free">{t("promo_free")}</option></select></label>
                  {promo.type === "percent" && <label className="block"><Label>{t("promo_percent_value")}</Label><input type="number" min="1" max="95" className={inp} value={promo.percent} onChange={(e) => setPromo((p) => ({ ...p, percent: e.target.value }))} /></label>}
                  <label className="block"><Label>{t("promo_days")}</Label><input type="number" min="1" max="90" className={inp} value={promo.days} onChange={(e) => setPromo((p) => ({ ...p, days: e.target.value }))} /></label>
                  <label className="block"><Label>{t("promo_start")}</Label><input type="datetime-local" className={inp} value={promo.starts_at} onChange={(e) => setPromo((p) => ({ ...p, starts_at: e.target.value }))} /></label>
                  <div className="sm:col-span-2 flex justify-end"><button type="button" onClick={createPromo} disabled={!!busy} className={btnPrimary}>{busy === "promo" && <Spinner className="w-4 h-4" />}{t("promo_create")}</button></div>
                </div>
              )}
              </>)}
            </Card>
          )}

          <Card title={t("sec_audience")} action={count && <Pill tone="bg-indigo-50 text-indigo-700"><Users className="w-3 h-3 mr-1" />{t("recipients", { count: count.total })}</Pill>}>
            <div className="grid sm:grid-cols-2 gap-3">
              <div className="sm:col-span-2 flex gap-4 flex-wrap">
                {["student", "instructor"].map((r) => <Check key={r} checked={(aud.roles || []).includes(r)} onChange={(v) => setAud({ roles: v ? [...(aud.roles || []), r] : (aud.roles || []).filter((x) => x !== r) })}>{t(`role_${r}`)}</Check>)}
                <Check checked={aud.verified_only !== false} onChange={(v) => setAud({ verified_only: v })}>{t("verified_only")}</Check>
                <Check checked={aud.include_contacts} onChange={(v) => setAud({ include_contacts: v })}>{t("include_contacts")}</Check>
              </div>
              <label className="block"><Label>{t("aud_lang")}</Label>
                <select className={inp} value={aud.lang || ""} onChange={(e) => setAud({ lang: e.target.value })}><option value="">{t("all")}</option><option value="fr">Français</option><option value="en">English</option></select></label>
              <label className="block"><Label>{t("aud_subscription")}</Label>
                <select className={inp} value={aud.subscription || "any"} onChange={(e) => setAud({ subscription: e.target.value })}><option value="any">{t("all")}</option><option value="active">{t("sub_active")}</option><option value="none">{t("sub_none")}</option></select></label>
              <label className="block"><Label>{t("aud_enrolled")}</Label>
                <select className={inp} value={aud.enrolled_course_id || ""} onChange={(e) => setAud({ enrolled_course_id: e.target.value ? Number(e.target.value) : null })}><option value="">{t("all")}</option>{(pickers?.courses || []).map((x) => <option key={x.id} value={x.id}>{x.title}</option>)}</select></label>
              <label className="block"><Label>{t("aud_category")}</Label>
                <select className={inp} value={aud.category_id || ""} onChange={(e) => setAud({ category_id: e.target.value ? Number(e.target.value) : null })}><option value="">{t("all")}</option>{(pickers?.categories || []).map((x) => <option key={x.id} value={x.id}>{x.name}</option>)}</select></label>
              <label className="block"><Label>{t("aud_inactive")}</Label>
                <input type="number" min="1" className={inp} placeholder="30" value={aud.inactive_days || ""} onChange={(e) => setAud({ inactive_days: e.target.value ? Number(e.target.value) : null })} /></label>
              <label className="block"><Label>{t("aud_new")}</Label>
                <input type="number" min="1" className={inp} placeholder="7" value={aud.new_days || ""} onChange={(e) => setAud({ new_days: e.target.value ? Number(e.target.value) : null })} /></label>
              <div className="sm:col-span-2"><Check checked={aud.never_enrolled} onChange={(v) => setAud({ never_enrolled: v })}>{t("aud_never_enrolled")}</Check></div>
            </div>
            {count && <p className="text-xs text-gray-500 mt-3">{t("aud_breakdown", { fr: count.fr, en: count.en, contacts: count.contacts })}</p>}
            <p className="text-[11px] text-gray-400 mt-1">{t("aud_prefs_hint")}</p>
          </Card>

          {ch.email && (
            <Card title={t("sec_ab")} action={<label className="flex items-center gap-2 text-xs font-semibold text-gray-600 cursor-pointer"><input type="checkbox" className="w-4 h-4" checked={ab.enabled} onChange={(e) => setAb({ enabled: e.target.checked })} />{t("ab_enable")}</label>}>
              <p className="text-xs text-gray-500">{t("ab_hint")}</p>
              {ab.enabled && (
                <div className="grid sm:grid-cols-2 gap-3 mt-3">
                  <label className="block sm:col-span-2"><Label>{t("ab_subject_a")}</Label><input className={`${inp} bg-gray-50`} value={c.subject_fr} readOnly /></label>
                  <label className="block"><Label>{t("ab_subject_b_fr")}</Label><input className={inp} maxLength={250} value={ab.subject_b_fr} onChange={(e) => setAb({ subject_b_fr: e.target.value })} /></label>
                  <label className="block"><Label>{t("ab_subject_b_en")}</Label><input className={inp} maxLength={250} value={ab.subject_b_en} onChange={(e) => setAb({ subject_b_en: e.target.value })} /></label>
                  <label className="block"><Label>{t("ab_sample")}</Label><input type="number" min="10" max="50" className={inp} value={ab.sample_percent} onChange={(e) => setAb({ sample_percent: e.target.value })} /></label>
                  <label className="block"><Label>{t("ab_wait")}</Label><input type="number" min="1" max="72" className={inp} value={ab.wait_hours} onChange={(e) => setAb({ wait_hours: e.target.value })} /></label>
                  <label className="block sm:col-span-2"><Label>{t("ab_metric")}</Label>
                    <select className={inp} value={ab.metric} onChange={(e) => setAb({ metric: e.target.value })}><option value="clicks">{t("ab_metric_clicks")}</option><option value="opens">{t("ab_metric_opens")}</option></select></label>
                  <p className="sm:col-span-2 text-[11px] text-gray-400">{t("ab_min_audience")}</p>
                </div>
              )}
            </Card>
          )}

          <Card title={t("sec_channels")}>
            <div className="space-y-4">
              <Check checked={ch.email} onChange={(v) => setCh({ email: v })}><Mail className="w-4 h-4 inline mr-1 text-gray-400" />{t("ch_email")}</Check>
              <div>
                <Check checked={ch.inapp} onChange={(v) => setCh({ inapp: v })}>{t("ch_inapp")}</Check>
                {ch.inapp && <input className={`${inp} mt-2`} value={ch.inapp_link || ""} placeholder={t("ch_inapp_link")} onChange={(e) => setCh({ inapp_link: e.target.value })} />}
              </div>
              <div>
                <Check checked={!!ch.banner} onChange={toggleBanner}>{t("ch_banner")}</Check>
                {ch.banner && (
                  <div className="mt-2 grid sm:grid-cols-2 gap-2 border border-gray-100 rounded-xl p-3 bg-gray-50/60">
                    <input className={inp} placeholder={t("banner_title_fr")} value={ch.banner.title_fr} onChange={(e) => setBanner({ title_fr: e.target.value })} />
                    <input className={inp} placeholder={t("banner_title_en")} value={ch.banner.title_en} onChange={(e) => setBanner({ title_en: e.target.value })} />
                    <input className={inp} placeholder={t("banner_cta_fr")} value={ch.banner.cta_label_fr} onChange={(e) => setBanner({ cta_label_fr: e.target.value })} />
                    <input className={inp} placeholder={t("banner_cta_en")} value={ch.banner.cta_label_en} onChange={(e) => setBanner({ cta_label_en: e.target.value })} />
                    <input className={`${inp} sm:col-span-2`} placeholder={t("banner_url")} value={ch.banner.cta_url} onChange={(e) => setBanner({ cta_url: e.target.value })} />
                    <select className={inp} value={ch.banner.placement} onChange={(e) => setBanner({ placement: e.target.value })}>{["top_bar", "popup", "inline_home", "inline_dashboard", "inline_catalog"].map((p) => <option key={p} value={p}>{t(`place_${p}`)}</option>)}</select>
                    <select className={inp} value={ch.banner.tone} onChange={(e) => setBanner({ tone: e.target.value })}>{["info", "promo", "success", "urgent"].map((x) => <option key={x} value={x}>{t(`tone_${x}`)}</option>)}</select>
                    <label className="block sm:col-span-2"><Label>{t("banner_ends")}</Label><input type="datetime-local" className={inp} value={ch.banner.ends_at ? toLocalInput(ch.banner.ends_at) : ""} onChange={(e) => setBanner({ ends_at: e.target.value ? new Date(e.target.value).toISOString() : null })} /></label>
                  </div>
                )}
              </div>
              <div>
                <Check checked={ch.telegram} onChange={(v) => setCh({ telegram: v })}>{t("ch_telegram")}</Check>
                {ch.telegram && (
                  <div className="mt-2 space-y-2">
                    <textarea rows={3} className={`${inp} resize-y`} placeholder={t("social_text")} value={ch.social_text || ""} onChange={(e) => setCh({ social_text: e.target.value })} />
                    <input className={inp} placeholder={t("social_link")} value={ch.social_link || ""} onChange={(e) => setCh({ social_link: e.target.value })} />
                    <input className={inp} placeholder={t("social_image")} value={ch.social_image || ""} onChange={(e) => setCh({ social_image: e.target.value })} />
                    <p className="text-[11px] text-gray-400">{t("telegram_hint")}</p>
                  </div>
                )}
              </div>
            </div>
          </Card>

          <Card title={t("sec_send")}>
            <div className="space-y-4">
              <div className="flex gap-2 flex-wrap items-end">
                <label className="block flex-1 min-w-[14rem]"><Label>{t("test_email")}</Label><input type="email" className={inp} value={testEmail} onChange={(e) => setTestEmail(e.target.value)} /></label>
                <button type="button" onClick={sendTest} disabled={!!busy || !testEmail} className={btnGhost}>{busy === "test" ? <Spinner className="w-4 h-4" /> : <Mail className="w-4 h-4" />}{t("send_test")}</button>
              </div>
              <div className="flex gap-2 flex-wrap items-end border-t border-gray-100 pt-4">
                <label className="block"><Label>{t("schedule_at")}</Label><input type="datetime-local" className={inp} value={when} onChange={(e) => setWhen(e.target.value)} /></label>
                <button type="button" onClick={() => launch(true)} disabled={!!busy || locked || !when} className={btnGhost}>{t("schedule")}</button>
                <button type="button" onClick={() => launch(false)} disabled={!!busy || locked} className={btnPrimary}>{busy === "launch" ? <Spinner className="w-4 h-4" /> : <Send className="w-4 h-4" />}{t("send_now")}</button>
              </div>
              <p className="text-[11px] text-gray-400">{t("send_limit_hint")}</p>
            </div>
          </Card>
        </div>

        <div className="xl:sticky xl:top-4">
          <Card title={t("preview")} action={<div className="flex gap-1">{["fr", "en"].map((l) => <button key={l} type="button" onClick={() => setLang(l)} className={`px-2.5 py-0.5 rounded-lg text-[11px] font-bold ${lang === l ? "bg-primary text-white" : "bg-gray-100 text-gray-600"}`}>{l.toUpperCase()}</button>)}</div>}>
            {!preview ? <div className="flex justify-center py-12"><Spinner className="w-5 h-5" /></div> : (
              <>
                <p className="text-xs text-gray-500 mb-2 truncate"><strong>{t("subject")} :</strong> {preview.subject || "—"}</p>
                <iframe title={t("preview")} sandbox="" srcDoc={preview.html} className="w-full h-[560px] border border-gray-200 rounded-xl bg-white" />
              </>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
