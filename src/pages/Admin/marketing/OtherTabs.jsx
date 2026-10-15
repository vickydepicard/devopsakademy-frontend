// Bannières du site, réseaux sociaux, abonnés et promotions de prix.
import { useCallback, useEffect, useState } from "react";
import { PLACEMENTS } from "./placements";
import { BannerCss, toneOf } from "../../../components/Common/bannerStyles";
import { useTranslation } from "react-i18next";
import { BookmarkPlus, Copy, Download, ExternalLink, Plus, Send, Trash2 } from "lucide-react";
import api from "../../../api/api";
import useFeedback, { apiError } from "../../../components/Common/useFeedback";
import { formatDate, formatDateTime, formatMoney } from "../../../utils/format";
import { Card, Center, Empty, Pill, Spinner, Stat, btnGhost, btnPrimary, downloadFile, inp } from "../program/ui";

const Label = ({ children }) => <span className="block text-xs font-medium text-gray-600 mb-1">{children}</span>;
const TONES = { info: "bg-sky-600", promo: "bg-indigo-700", success: "bg-emerald-600", urgent: "bg-red-600" };
const toLocal = (d) => { if (!d) return ""; const x = new Date(d); x.setMinutes(x.getMinutes() - x.getTimezoneOffset()); return x.toISOString().slice(0, 16); };

// ── Bannières ──
const blankBanner = () => ({ placement: "top_bar", tone: "promo", audience: "all", title_fr: "", title_en: "", body_fr: "", body_en: "", cta_label_fr: "", cta_label_en: "", cta_url: "", image_url: "", starts_at: "", ends_at: "", is_active: true });

export function BannersTab() {
  const { t, i18n } = useTranslation("marketing");
  const [presets, setPresets] = useState([]);
  const lang = (i18n.resolvedLanguage || "fr").startsWith("en") ? "en" : "fr";
  useEffect(() => { api.get("/marketing/admin/templates", { params: { type: "banner" } }).then((r) => setPresets(r.data.data)).catch(() => {}); }, []);
  const fromPreset = (p) => { const c = p.content; setF({ ...blankBanner(), placement: c.placement, tone: c.tone, cta_url: c.url, title_fr: c.fr.title, body_fr: c.fr.body, cta_label_fr: c.fr.cta, title_en: c.en.title, body_en: c.en.body, cta_label_en: c.en.cta }); };
  const saveAsPreset = async () => { try { await api.post("/marketing/admin/templates", { type: "banner", name_fr: f.title_fr.slice(0, 60), name_en: (f.title_en || f.title_fr).slice(0, 60), kind: "announcement", icon: "Megaphone", category: "banner", content: { placement: f.placement, tone: f.tone, url: f.cta_url, fr: { name: f.title_fr, title: f.title_fr, body: f.body_fr, cta: f.cta_label_fr }, en: { name: f.title_en, title: f.title_en || f.title_fr, body: f.body_en, cta: f.cta_label_en } } }); notify(t("template_saved"), "success"); api.get("/marketing/admin/templates", { params: { type: "banner" } }).then((r) => setPresets(r.data.data)); } catch (e) { notify(apiError(e, t("error_generic"))); } };
  const { notify, confirm } = useFeedback();
  const [rows, setRows] = useState(null);
  const [f, setF] = useState(null);
  const [busy, setBusy] = useState(false);
  const load = useCallback(() => { api.get("/marketing/admin/banners").then((r) => setRows(r.data.data)).catch((e) => notify(apiError(e, t("error_generic")))); }, []); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { load(); }, [load]);

  const save = async () => {
    setBusy(true);
    try {
      const body = { ...f, starts_at: f.starts_at ? new Date(f.starts_at).toISOString() : null, ends_at: f.ends_at ? new Date(f.ends_at).toISOString() : null };
      if (f.id) await api.put(`/marketing/admin/banners/${f.id}`, body); else await api.post("/marketing/admin/banners", body);
      setF(null); load();
    } catch (e) { notify(apiError(e, t("error_generic"))); } finally { setBusy(false); }
  };
  const toggle = async (r) => { try { await api.put(`/marketing/admin/banners/${r.id}`, { ...r, is_active: !r.is_active }); load(); } catch (e) { notify(apiError(e, t("error_generic"))); } };
  const remove = async (r) => { if (!(await confirm(t("delete_confirm", { name: r.title_fr })))) return; try { await api.delete(`/marketing/admin/banners/${r.id}`); load(); } catch (e) { notify(apiError(e, t("error_generic"))); } };
  const set = (p) => setF((x) => ({ ...x, ...p }));

  return (
    <div className="space-y-5">
      <Card title={t("banner_presets")}>
        <p className="text-xs text-gray-500 mb-3">{t("banner_presets_hint")}</p>
        <div className="flex flex-wrap gap-2">{presets.map((p) => <button key={p.id} type="button" onClick={() => fromPreset(p)} className="px-3 py-1.5 rounded-lg text-xs font-semibold border border-gray-200 bg-white text-gray-700 hover:border-primary hover:text-primary">{lang === "en" ? p.name_en : p.name_fr}</button>)}</div>
      </Card>
      <Card title={t("banners_title")} action={<button type="button" onClick={() => setF(blankBanner())} className={btnPrimary}><Plus className="w-4 h-4" />{t("banner_new")}</button>}>
        <p className="text-xs text-gray-500 mb-4">{t("banners_hint")}</p>
        {!rows ? <Center><Spinner className="w-6 h-6" /></Center> : rows.length === 0 ? <Empty>{t("banners_empty")}</Empty> : (
          <ul className="divide-y divide-gray-100">
            {rows.map((r) => {
              const live = r.is_active && (!r.ends_at || new Date(r.ends_at) > new Date()) && (!r.starts_at || new Date(r.starts_at) <= new Date());
              return (
                <li key={r.id} className="py-3 flex items-center justify-between gap-3 flex-wrap">
                  <div className="min-w-0"><p className="text-sm font-semibold text-gray-900 truncate">{r.title_fr}</p>
                    <p className="text-xs text-gray-500">{t(`place_${r.placement}`)} · {t(`aud_${r.audience}`)}{r.ends_at ? ` · ${t("until", { date: formatDate(r.ends_at) })}` : ""}</p></div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-xs text-gray-500">{t("banner_stats", { views: r.impressions, clicks: r.clicks, ctr: r.impressions ? `${Math.round((r.clicks / r.impressions) * 1000) / 10}%` : "—" })}</span>
                    <Pill tone={live ? "bg-emerald-100 text-emerald-700" : "bg-gray-100 text-gray-500"}>{live ? t("live") : t("off")}</Pill>
                    <button type="button" onClick={() => toggle(r)} className={btnGhost}>{r.is_active ? t("disable") : t("enable")}</button>
                    <button type="button" onClick={() => setF({ ...r, starts_at: toLocal(r.starts_at), ends_at: toLocal(r.ends_at) })} className={btnGhost}>{t("edit")}</button>
                    <button type="button" onClick={() => remove(r)} className="p-1.5 bg-transparent text-gray-400 hover:text-red-600"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </Card>
      {f && (
        <Card title={f.id ? t("banner_edit") : t("banner_new")}>
          <div className="grid lg:grid-cols-2 gap-3">
            <label className="block"><Label>{t("banner_title_fr")}</Label><input className={inp} maxLength={200} value={f.title_fr} onChange={(e) => set({ title_fr: e.target.value })} /></label>
            <label className="block"><Label>{t("banner_title_en")}</Label><input className={inp} maxLength={200} value={f.title_en} onChange={(e) => set({ title_en: e.target.value })} /></label>
            <label className="block"><Label>{t("banner_body_fr")}</Label><input className={inp} maxLength={500} value={f.body_fr || ""} onChange={(e) => set({ body_fr: e.target.value })} /></label>
            <label className="block"><Label>{t("banner_body_en")}</Label><input className={inp} maxLength={500} value={f.body_en || ""} onChange={(e) => set({ body_en: e.target.value })} /></label>
            <label className="block"><Label>{t("banner_cta_fr")}</Label><input className={inp} maxLength={80} value={f.cta_label_fr || ""} onChange={(e) => set({ cta_label_fr: e.target.value })} /></label>
            <label className="block"><Label>{t("banner_cta_en")}</Label><input className={inp} maxLength={80} value={f.cta_label_en || ""} onChange={(e) => set({ cta_label_en: e.target.value })} /></label>
            <label className="block"><Label>{t("banner_url")}</Label><input className={inp} value={f.cta_url || ""} onChange={(e) => set({ cta_url: e.target.value })} /></label>
            <label className="block"><Label>{t("banner_image")}</Label><input className={inp} value={f.image_url || ""} onChange={(e) => set({ image_url: e.target.value })} /></label>
            <label className="block"><Label>{t("banner_placement")}</Label><select className={inp} value={f.placement} onChange={(e) => set({ placement: e.target.value })}>{PLACEMENTS.map((p) => <option key={p} value={p}>{t(`place_${p}`)}</option>)}</select></label>
            <label className="block"><Label>{t("banner_tone")}</Label><select className={inp} value={f.tone} onChange={(e) => set({ tone: e.target.value })}>{Object.keys(TONES).map((x) => <option key={x} value={x}>{t(`tone_${x}`)}</option>)}</select></label>
            <label className="block"><Label>{t("banner_audience")}</Label><select className={inp} value={f.audience} onChange={(e) => set({ audience: e.target.value })}>{["all", "visitors", "students", "instructors"].map((x) => <option key={x} value={x}>{t(`aud_${x}`)}</option>)}</select></label>
            <div className="grid grid-cols-2 gap-2">
              <label className="block"><Label>{t("banner_starts")}</Label><input type="datetime-local" className={inp} value={f.starts_at} onChange={(e) => set({ starts_at: e.target.value })} /></label>
              <label className="block"><Label>{t("banner_ends")}</Label><input type="datetime-local" className={inp} value={f.ends_at} onChange={(e) => set({ ends_at: e.target.value })} /></label>
            </div>
          </div>
          {(() => {
            const tn = toneOf(f.tone);
            return (
              <div className="mt-4">
                <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-1.5">{t("preview")}</p>
                <BannerCss />
                <div className={`relative overflow-hidden rounded-xl bg-gradient-to-r ${tn.grad} text-white`}>
                  <div className="bnr-stripes absolute inset-0 pointer-events-none" aria-hidden="true" />
                  <div className="relative px-4 py-2.5 flex items-center justify-center gap-3 flex-wrap text-sm">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 ring-1 ring-white/25 px-2.5 py-1 text-[11px] font-extrabold uppercase tracking-wider"><tn.Icon className="w-3.5 h-3.5" />{t(`tone_badge_${f.tone}`)}</span>
                    <span><strong className="font-extrabold">{f.title_fr || t("banner_preview_title")}</strong>{f.body_fr ? <span className="text-white/85"> — {f.body_fr}</span> : null}</span>
                    {f.cta_label_fr && <span className={`inline-flex items-center gap-1.5 rounded-full bg-white ${tn.accent} font-extrabold text-xs px-4 py-1.5`}>{f.cta_label_fr} →</span>}
                  </div>
                </div>
              </div>
            );
          })()}
          <div className="flex justify-end gap-2 mt-4">
            <button type="button" onClick={saveAsPreset} disabled={f.title_fr.trim().length < 2} className={btnGhost}><BookmarkPlus className="w-4 h-4" />{t("save_as_template")}</button>
            <button type="button" onClick={() => setF(null)} className={btnGhost}>{t("cancel")}</button>
            <button type="button" onClick={save} disabled={busy || f.title_fr.trim().length < 2} className={btnPrimary}>{busy && <Spinner className="w-4 h-4" />}{t("save")}</button>
          </div>
        </Card>
      )}
    </div>
  );
}

// ── Réseaux sociaux ──
const CHANNELS = ["telegram", "linkedin", "facebook", "x", "whatsapp"];
const shareUrl = (ch, text, link) => {
  const u = encodeURIComponent(link || ""), tx = encodeURIComponent(text || "");
  return {
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${u}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${u}&quote=${tx}`,
    x: `https://twitter.com/intent/tweet?text=${tx}&url=${u}`,
    whatsapp: `https://wa.me/?text=${encodeURIComponent(`${text || ""} ${link || ""}`.trim())}`,
  }[ch];
};
const LIMITS = { x: 280, telegram: 4000, linkedin: 3000, facebook: 5000, whatsapp: 4000 };

export function SocialTab({ meta }) {
  const { t, i18n } = useTranslation("marketing");
  const [presets, setPresets] = useState([]);
  const lang = (i18n.resolvedLanguage || "fr").startsWith("en") ? "en" : "fr";
  useEffect(() => { api.get("/marketing/admin/templates", { params: { type: "social" } }).then((r) => setPresets(r.data.data)).catch(() => {}); }, []);
  const { notify } = useFeedback();
  const [rows, setRows] = useState(null);
  const [f, setF] = useState({ channel: "telegram", text: "", link_url: "", image_url: "" });
  const [busy, setBusy] = useState(false);
  const load = useCallback(() => { api.get("/marketing/admin/social").then((r) => setRows(r.data.data)).catch((e) => notify(apiError(e, t("error_generic")))); }, []); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { load(); }, [load]);

  const copy = async () => { try { await navigator.clipboard.writeText(`${f.text}${f.link_url ? `\n\n${f.link_url}` : ""}`); notify(t("copied"), "success"); } catch { notify(t("error_generic")); } };
  const publish = async (publishNow) => {
    setBusy(true);
    try { await api.post("/marketing/admin/social", { ...f, publish: publishNow }); notify(publishNow ? t("social_posted") : t("social_saved"), "success"); setF((x) => ({ ...x, text: "" })); load(); }
    catch (e) { notify(apiError(e, t("error_generic"))); } finally { setBusy(false); }
  };
  const remove = async (id) => { try { await api.delete(`/marketing/admin/social/${id}`); load(); } catch (e) { notify(apiError(e, t("error_generic"))); } };
  const limit = LIMITS[f.channel];
  const share = shareUrl(f.channel, f.text, f.link_url);

  return (
    <div className="grid lg:grid-cols-2 gap-5">
      <Card title={t("social_compose")} className="self-start">
        <div className="space-y-3">
          {presets.length > 0 && <div><Label>{t("social_presets")}</Label><div className="flex flex-wrap gap-1.5">{presets.map((p) => <button key={p.id} type="button" onClick={() => setF((x) => ({ ...x, text: p.content?.[lang]?.text || p.content?.fr?.text || "" }))} className="px-2.5 py-1 rounded-lg text-xs font-semibold border border-gray-200 bg-white text-gray-700 hover:border-primary hover:text-primary">{lang === "en" ? p.name_en : p.name_fr}</button>)}</div></div>}
          <div className="flex gap-1 flex-wrap">{CHANNELS.map((c) => <button key={c} type="button" onClick={() => setF((x) => ({ ...x, channel: c }))} className={`px-3 py-1.5 rounded-lg text-xs font-bold ${f.channel === c ? "bg-primary text-white" : "bg-gray-100 text-gray-600"}`}>{t(`net_${c}`)}</button>)}</div>
          <textarea rows={6} className={`${inp} resize-y`} placeholder={t("social_text")} value={f.text} onChange={(e) => setF((x) => ({ ...x, text: e.target.value }))} />
          <p className={`text-[11px] text-right ${f.text.length > limit ? "text-red-600" : "text-gray-400"}`}>{f.text.length} / {limit}</p>
          <input className={inp} placeholder={t("social_link")} value={f.link_url} onChange={(e) => setF((x) => ({ ...x, link_url: e.target.value }))} />
          <input className={inp} placeholder={t("social_image")} value={f.image_url} onChange={(e) => setF((x) => ({ ...x, image_url: e.target.value }))} />
          <div className="flex flex-wrap gap-2 justify-end">
            <button type="button" onClick={copy} disabled={!f.text} className={btnGhost}><Copy className="w-4 h-4" />{t("copy_text")}</button>
            {share && <a href={share} target="_blank" rel="noreferrer noopener" className={`${btnGhost} ${!f.text && !f.link_url ? "pointer-events-none opacity-50" : ""}`}><ExternalLink className="w-4 h-4" />{t("open_share", { network: t(`net_${f.channel}`) })}</a>}
            {f.channel === "telegram" && <button type="button" onClick={() => publish(true)} disabled={busy || !f.text || !meta?.telegram_configured} className={btnPrimary}>{busy ? <Spinner className="w-4 h-4" /> : <Send className="w-4 h-4" />}{t("publish_telegram")}</button>}
            <button type="button" onClick={() => publish(false)} disabled={busy || f.text.length < 3} className={btnGhost}>{t("save_draft")}</button>
          </div>
          {f.channel === "telegram" && !meta?.telegram_configured && <p className="text-xs text-amber-700 bg-amber-50 rounded-lg p-2.5">{t("telegram_setup")}</p>}
          {f.channel === "linkedin" && <p className="text-[11px] text-gray-400">{t("linkedin_hint")}</p>}
          {!["telegram"].includes(f.channel) && <p className="text-[11px] text-gray-400">{t("manual_channel_hint")}</p>}
        </div>
      </Card>
      <Card title={t("social_history")}>
        {!rows ? <Center><Spinner className="w-6 h-6" /></Center> : rows.length === 0 ? <Empty>{t("social_empty")}</Empty> : (
          <ul className="divide-y divide-gray-100">
            {rows.map((r) => (
              <li key={r.id} className="py-3">
                <div className="flex items-center justify-between gap-2"><span className="text-xs font-bold text-gray-700">{t(`net_${r.channel}`, { defaultValue: r.channel })}</span>
                  <span className="flex items-center gap-2"><Pill tone={r.status === "published" ? "bg-emerald-100 text-emerald-700" : r.status === "failed" ? "bg-red-100 text-red-600" : "bg-gray-100 text-gray-600"}>{t(`social_${r.status}`)}</Pill><span className="text-[11px] text-gray-400">{formatDateTime(r.created_at)}</span>
                    <button type="button" onClick={() => remove(r.id)} className="text-gray-300 hover:text-red-600 bg-transparent"><Trash2 className="w-3.5 h-3.5" /></button></span></div>
                <p className="text-sm text-gray-700 whitespace-pre-line line-clamp-3 mt-1">{r.text}</p>{r.error && <p className="text-[11px] text-red-500 mt-1">{r.error}</p>}
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}

// ── Abonnés ──
export function SubscribersTab() {
  const { t } = useTranslation("marketing");
  const { notify } = useFeedback();
  const [sum, setSum] = useState(null);
  const [data, setData] = useState(null);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [contact, setContact] = useState({ email: "", first_name: "", lang: "fr" });

  const loadSum = useCallback(() => { api.get("/marketing/admin/subscribers/summary").then((r) => setSum(r.data.data)).catch(() => {}); }, []);
  const load = useCallback(() => { api.get("/marketing/admin/subscribers", { params: { search: search || undefined, filter, page } }).then((r) => setData(r.data)).catch((e) => notify(apiError(e, t("error_generic")))); }, [search, filter, page]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { loadSum(); }, [loadSum]);
  useEffect(() => { const h = setTimeout(load, 250); return () => clearTimeout(h); }, [load]);

  const toggle = async (u) => { try { await api.patch(`/marketing/admin/subscribers/user/${u.id}`, { unsubscribed_all: !u.unsubscribed_all }); load(); loadSum(); } catch (e) { notify(apiError(e, t("error_generic"))); } };
  const addContact = async () => { try { await api.post("/marketing/admin/contacts", contact); setContact({ email: "", first_name: "", lang: "fr" }); load(); loadSum(); notify(t("contact_added"), "success"); } catch (e) { notify(apiError(e, t("error_generic"))); } };
  const pages = data ? Math.max(Math.ceil(data.pagination.total / data.pagination.limit), 1) : 1;

  return (
    <div className="space-y-5">
      {sum && (
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          <Stat label={t("sub_accounts")} value={sum.users.total} />
          <Stat label={t("sub_newsletter")} value={sum.users.newsletter} tone="text-emerald-600" />
          <Stat label={t("sub_promotions")} value={sum.users.promotions} />
          <Stat label={t("sub_unsub")} value={sum.users.unsubscribed} tone={sum.users.unsubscribed ? "text-amber-600" : "text-gray-900"} />
          <Stat label={t("sub_contacts")} value={sum.contacts.subscribed} sub={t("sub_contacts_pending", { n: sum.contacts.pending })} />
        </div>
      )}
      <Card title={t("sub_list")} action={<button type="button" onClick={() => downloadFile("/marketing/admin/subscribers/export", {}, "subscribers.csv").catch(() => notify(t("error_generic")))} className={btnGhost}><Download className="w-4 h-4" />{t("export_csv")}</button>}>
        <div className="flex gap-2 mb-4 flex-wrap">
          <input className={`${inp} !w-64`} placeholder={t("search")} value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} />
          <select className={`${inp} !w-48`} value={filter} onChange={(e) => { setFilter(e.target.value); setPage(1); }}><option value="all">{t("all")}</option><option value="subscribed">{t("f_subscribed")}</option><option value="unsubscribed">{t("f_unsubscribed")}</option></select>
        </div>
        {!data ? <Center><Spinner className="w-6 h-6" /></Center> : data.data.length === 0 ? <Empty>{t("sub_empty")}</Empty> : (
          <div className="overflow-x-auto"><table className="w-full text-sm">
            <thead className="text-xs text-gray-500"><tr>{["col_user", "col_prefs", "col_state"].map((k) => <th key={k} className="text-left font-medium py-1.5 pr-3">{t(k)}</th>)}<th /></tr></thead>
            <tbody className="divide-y divide-gray-100">{data.data.map((u) => (
              <tr key={u.id}>
                <td className="py-2 pr-3"><span className="font-medium text-gray-900">{u.first_name} {u.last_name}</span><span className="block text-xs text-gray-400">{u.email} · {u.lang.toUpperCase()}</span></td>
                <td className="py-2 pr-3 text-xs text-gray-600">{[u.newsletter && t("pref_newsletter"), u.promotions && t("pref_promotions"), u.events && t("pref_events")].filter(Boolean).join(" · ") || "—"}</td>
                <td className="py-2 pr-3"><Pill tone={u.unsubscribed_all ? "bg-amber-100 text-amber-700" : "bg-emerald-100 text-emerald-700"}>{u.unsubscribed_all ? t("unsubscribed") : t("subscribed")}</Pill></td>
                <td className="py-2 text-right"><button type="button" onClick={() => toggle(u)} className="text-xs font-semibold text-primary bg-transparent hover:underline">{u.unsubscribed_all ? t("resubscribe") : t("unsubscribe")}</button></td>
              </tr>))}</tbody></table></div>
        )}
        {pages > 1 && <div className="flex items-center justify-between mt-4 text-sm text-gray-500"><span>{t("page_of", { page, pages })}</span><div className="flex gap-2"><button type="button" disabled={page <= 1} onClick={() => setPage(page - 1)} className={btnGhost}>{t("previous")}</button><button type="button" disabled={page >= pages} onClick={() => setPage(page + 1)} className={btnGhost}>{t("next")}</button></div></div>}
      </Card>
      <div className="grid lg:grid-cols-2 gap-5">
        <Card title={t("contacts_title")}>
          {!data?.contacts?.length ? <Empty>{t("contacts_empty")}</Empty> : (
            <ul className="divide-y divide-gray-100">{data.contacts.map((c) => <li key={c.id} className="py-2 flex justify-between gap-3 text-sm"><span className="truncate">{c.first_name ? `${c.first_name} · ` : ""}{c.email}</span><Pill tone={c.status === "subscribed" ? "bg-emerald-100 text-emerald-700" : c.status === "pending" ? "bg-amber-100 text-amber-700" : "bg-gray-100 text-gray-500"}>{t(`contact_${c.status}`)}</Pill></li>)}</ul>
          )}
        </Card>
        <Card title={t("contact_add")} className="self-start">
          <div className="space-y-2">
            <input className={inp} type="email" placeholder="email@exemple.com" value={contact.email} onChange={(e) => setContact((c) => ({ ...c, email: e.target.value }))} />
            <div className="grid grid-cols-2 gap-2"><input className={inp} placeholder={t("first_name")} value={contact.first_name} onChange={(e) => setContact((c) => ({ ...c, first_name: e.target.value }))} /><select className={inp} value={contact.lang} onChange={(e) => setContact((c) => ({ ...c, lang: e.target.value }))}><option value="fr">Français</option><option value="en">English</option></select></div>
            <p className="text-[11px] text-gray-400">{t("contact_consent_hint")}</p>
            <div className="flex justify-end"><button type="button" onClick={addContact} disabled={!contact.email} className={btnPrimary}>{t("add")}</button></div>
          </div>
        </Card>
      </div>
    </div>
  );
}

// ── Promotions de prix ──
export function PromotionsTab({ pickers }) {
  const { t } = useTranslation("marketing");
  const { notify, confirm } = useFeedback();
  const [rows, setRows] = useState(null);
  const [f, setF] = useState({ course_id: "", type: "percent", percent: 50, days: 3, starts_at: "" });
  const [busy, setBusy] = useState(false);
  const load = useCallback(() => { api.get("/marketing/admin/promotions").then((r) => setRows(r.data.data)).catch((e) => notify(apiError(e, t("error_generic")))); }, []); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { load(); }, [load]);

  const create = async () => {
    setBusy(true);
    try {
      const starts = f.starts_at ? new Date(f.starts_at) : new Date();
      await api.post("/marketing/admin/promotions", { course_id: Number(f.course_id), type: f.type, percent: f.type === "percent" ? Number(f.percent) : null, starts_at: starts.toISOString(), ends_at: new Date(starts.getTime() + Number(f.days) * 86400_000).toISOString() });
      notify(t("promo_created"), "success"); setF((x) => ({ ...x, course_id: "" })); load();
    } catch (e) { notify(apiError(e, t("error_generic"))); } finally { setBusy(false); }
  };
  const cancel = async (p) => {
    if (!(await confirm(t("promo_cancel_confirm"), { confirmLabel: t("confirm") }))) return;
    try { await api.post(`/marketing/admin/promotions/${p.id}/cancel`); load(); } catch (e) { notify(apiError(e, t("error_generic"))); }
  };
  const TONE = { scheduled: "bg-blue-100 text-blue-700", active: "bg-emerald-100 text-emerald-700", ended: "bg-gray-100 text-gray-500", cancelled: "bg-red-100 text-red-600" };

  return (
    <div className="grid lg:grid-cols-[360px_1fr] gap-5">
      <Card title={t("promo_new")} className="self-start">
        <div className="space-y-3">
          <p className="text-xs text-gray-500">{t("offer_hint")}</p>
          <label className="block"><Label>{t("promo_course")}</Label><select className={inp} value={f.course_id} onChange={(e) => setF((x) => ({ ...x, course_id: e.target.value }))}><option value="">{t("pick_course")}</option>{(pickers?.courses || []).map((c) => <option key={c.id} value={c.id}>{c.title}</option>)}</select></label>
          <label className="block"><Label>{t("promo_type")}</Label><select className={inp} value={f.type} onChange={(e) => setF((x) => ({ ...x, type: e.target.value }))}><option value="percent">{t("promo_percent")}</option><option value="free">{t("promo_free")}</option></select></label>
          {f.type === "percent" && <label className="block"><Label>{t("promo_percent_value")}</Label><input type="number" min="1" max="95" className={inp} value={f.percent} onChange={(e) => setF((x) => ({ ...x, percent: e.target.value }))} /></label>}
          <div className="grid grid-cols-2 gap-2"><label className="block"><Label>{t("promo_days")}</Label><input type="number" min="1" max="90" className={inp} value={f.days} onChange={(e) => setF((x) => ({ ...x, days: e.target.value }))} /></label>
            <label className="block"><Label>{t("promo_start")}</Label><input type="datetime-local" className={inp} value={f.starts_at} onChange={(e) => setF((x) => ({ ...x, starts_at: e.target.value }))} /></label></div>
          <p className="text-[11px] text-amber-700 bg-amber-50 rounded-lg p-2.5">{t("promo_commission_warning")}</p>
          <div className="flex justify-end"><button type="button" onClick={create} disabled={busy || !f.course_id} className={btnPrimary}>{busy && <Spinner className="w-4 h-4" />}{t("promo_create")}</button></div>
        </div>
      </Card>
      <Card title={t("promos_title")}>
        {!rows ? <Center><Spinner className="w-6 h-6" /></Center> : rows.length === 0 ? <Empty>{t("promos_empty")}</Empty> : (
          <ul className="divide-y divide-gray-100">
            {rows.map((p) => (
              <li key={p.id} className="py-3 flex items-center justify-between gap-3 flex-wrap">
                <div className="min-w-0"><p className="text-sm font-semibold text-gray-900 truncate">{p.course_title}</p>
                  <p className="text-xs text-gray-500">{p.type === "free" ? t("promo_free") : `-${Number(p.percent)}%`} · {formatDateTime(p.starts_at)} → {formatDateTime(p.ends_at)}
                    {p.status === "active" && ` · ${t("promo_now", { price: p.type === "free" ? t("free") : formatMoney(p.promo_price) })}`}</p></div>
                <div className="flex items-center gap-3 shrink-0"><Pill tone={TONE[p.status]}>{t(`promo_status_${p.status}`)}</Pill>
                  {["scheduled", "active"].includes(p.status) && <button type="button" onClick={() => cancel(p)} className="text-xs font-semibold text-red-600 bg-transparent hover:underline">{t("stop")}</button>}</div>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
