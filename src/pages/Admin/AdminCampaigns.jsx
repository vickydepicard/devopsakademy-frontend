// Admin : campagnes / événements du site (slides d'accueil + thème de couleurs).
import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { CalendarClock, Layers, Loader2, Megaphone, Palette, Pencil, Plus, Trash2 } from "lucide-react";
import api from "../../api/api";
import { getLocale } from "../../i18n";
import { apiError } from "../../components/Common/useFeedback";
import { askConfirm, showAlert } from "../../utils/dialog";
import CampaignDialog from "../../components/campaign/admin/CampaignDialog";
import ThemesPanel from "../../components/campaign/admin/ThemesPanel";

const STATUS_STYLE = {
  live: "bg-emerald-100 text-emerald-700",
  scheduled: "bg-sky-100 text-sky-700",
  ended: "bg-slate-200 text-slate-600",
  inactive: "bg-slate-100 text-slate-500",
};
const fmt = (iso) => (iso ? new Date(iso).toLocaleString(getLocale(), { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }) : "");

export default function AdminCampaigns() {
  const { t } = useTranslation("adminCampaigns");
  const [tab, setTab] = useState("campaigns");
  const [campaigns, setCampaigns] = useState([]);
  const [themes, setThemes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [dialog, setDialog] = useState(null); // null | "new" | campaignId

  useEffect(() => { document.title = `${t("title")} · Admin`; }, [t]);

  const load = useCallback(async () => {
    try {
      const [c, th] = await Promise.all([api.get("/admin/campaigns"), api.get("/admin/themes")]);
      setCampaigns(c.data?.data || []);
      setThemes(th.data?.data || []);
      setError("");
    } catch (e) { setError(apiError(e, t("load_error"))); }
    finally { setLoading(false); }
  }, [t]);
  useEffect(() => { load(); }, [load]);

  const toggle = async (c) => {
    try { await api.patch(`/admin/campaigns/${c.id}/active`, { is_active: !c.is_active }); await load(); }
    catch (e) { showAlert(apiError(e, t("save_error")), "error"); }
  };
  const remove = async (c) => {
    if (!(await askConfirm(t("list.delete_confirm", { title: c.title }), { confirmLabel: t("list.confirm_label"), danger: true }))) return;
    try { await api.delete(`/admin/campaigns/${c.id}`); await load(); }
    catch (e) { showAlert(apiError(e, t("save_error")), "error"); }
  };

  const period = (c) => {
    if (c.starts_at && c.ends_at) return `${t("list.period_from", { date: fmt(c.starts_at) })} ${t("list.period_to", { date: fmt(c.ends_at) })}`;
    if (c.starts_at) return t("list.period_from", { date: fmt(c.starts_at) });
    if (c.ends_at) return t("list.period_until", { date: fmt(c.ends_at) });
    return t("list.period_always");
  };

  return (
    <div className="mx-auto max-w-6xl space-y-6 p-4 sm:p-6">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="flex items-center gap-2.5 text-2xl font-extrabold text-slate-900"><Megaphone className="text-primary" size={26} aria-hidden="true" />{t("title")}</h1>
          <p className="mt-1.5 max-w-3xl text-sm text-slate-600">{t("subtitle")}</p>
        </div>
        {tab === "campaigns" && (
          <button type="button" onClick={() => setDialog("new")} className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-primary-mid"><Plus size={16} aria-hidden="true" />{t("new_campaign")}</button>
        )}
      </header>

      <div role="tablist" className="inline-flex rounded-xl bg-slate-100 p-1">
        {[["campaigns", t("tab_campaigns"), Layers], ["themes", t("tab_themes"), Palette]].map(([k, label, Icon]) => (
          <button key={k} role="tab" aria-selected={tab === k} onClick={() => setTab(k)}
            className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition ${tab === k ? "bg-white text-primary shadow-sm" : "text-slate-500 hover:text-slate-800"}`}><Icon size={16} aria-hidden="true" />{label}</button>
        ))}
      </div>

      {error && <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700">{error}</p>}
      {loading ? (
        <p className="flex items-center gap-2 text-sm text-slate-500"><Loader2 size={16} className="animate-spin" aria-hidden="true" />{t("loading")}</p>
      ) : tab === "themes" ? (
        <ThemesPanel themes={themes} onChanged={load} />
      ) : campaigns.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center">
          <Megaphone className="mx-auto mb-3 text-slate-300" size={40} aria-hidden="true" />
          <p className="font-semibold text-slate-800">{t("list.empty_title")}</p>
          <p className="mx-auto mt-1 max-w-md text-sm text-slate-500">{t("list.empty_text")}</p>
          <button type="button" onClick={() => setDialog("new")} className="mt-5 inline-flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white hover:bg-primary-mid"><Plus size={16} aria-hidden="true" />{t("new_campaign")}</button>
        </div>
      ) : (
        <ul className="space-y-3">
          {campaigns.map((c) => (
            <li key={c.id} className="flex flex-wrap items-center gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="min-w-0 flex-1 basis-64">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="truncate text-base font-bold text-slate-900">{c.title}</h2>
                  <span title={t(`status_hint.${c.status}`)} className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${STATUS_STYLE[c.status]}`}>{t(`status.${c.status}`)}</span>
                </div>
                <p className="mt-1 flex items-center gap-1.5 text-xs text-slate-500"><CalendarClock size={14} aria-hidden="true" />{period(c)}</p>
                <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500">
                  <span>{c.slide_count > 0 ? t("list.slides", { count: c.slide_count }) : t("list.no_slides")}</span>
                  {c.theme_name && c.apply_theme ? (
                    <span className="inline-flex items-center gap-1.5"><i className="h-3.5 w-3.5 rounded-full ring-1 ring-black/10" style={{ background: c.theme_colors?.primary }} /><i className="-ml-2.5 h-3.5 w-3.5 rounded-full ring-1 ring-black/10" style={{ background: c.theme_colors?.accent }} />{c.theme_name}</span>
                  ) : <span>{t("list.no_theme")}</span>}
                </p>
              </div>
              <label className="flex cursor-pointer items-center gap-2 text-xs font-medium text-slate-600" title={c.is_active ? t("list.toggle_on") : t("list.toggle_off")}>
                <input type="checkbox" role="switch" className="peer sr-only" checked={c.is_active} onChange={() => toggle(c)} aria-label={t("list.toggle_label", { title: c.title })} />
                <span className="relative h-6 w-11 rounded-full bg-slate-300 transition peer-checked:bg-emerald-500 peer-focus-visible:ring-2 peer-focus-visible:ring-primary after:absolute after:left-0.5 after:top-0.5 after:h-5 after:w-5 after:rounded-full after:bg-white after:shadow after:transition-all peer-checked:after:translate-x-5" />
                <span className="w-16">{c.is_active ? t("list.toggle_on").split(":")[0] : t("list.toggle_off")}</span>
              </label>
              <div className="flex gap-1">
                <button type="button" onClick={() => setDialog(c.id)} className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"><Pencil size={14} aria-hidden="true" />{t("edit")}</button>
                <button type="button" onClick={() => remove(c)} aria-label={`${t("delete")} ${c.title}`} className="rounded-lg p-2 text-red-600 hover:bg-red-50"><Trash2 size={16} /></button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {dialog && <CampaignDialog campaignId={dialog === "new" ? null : dialog} themes={themes} onClose={() => setDialog(null)} onChanged={load} />}
    </div>
  );
}
