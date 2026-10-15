// Création / modification d'une campagne + gestion de ses slides.
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { ArrowDown, ArrowUp, Eye, EyeOff, Image as ImageIcon, Linkedin, Loader2, MousePointerClick, Pencil, Plus, Trash2 } from "lucide-react";
import api from "../../../api/api";
import { apiError } from "../../Common/useFeedback";
import { askConfirm, showAlert } from "../../../utils/dialog";
import Modal from "./Modal";
import SlideForm from "./SlideForm";
import ThemePreview from "./ThemePreview";

const input = "w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/15";
const lab = "mb-1.5 block text-sm font-medium text-slate-700";

// ISO (UTC) <-> valeur <input type="datetime-local"> (heure de l'appareil)
const toLocalInput = (iso) => {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const p = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}`;
};
const fromLocalInput = (v) => (v ? new Date(v).toISOString() : null);

export default function CampaignDialog({ campaignId, themes, onClose, onChanged }) {
  const { t } = useTranslation("adminCampaigns");
  const [id, setId] = useState(campaignId || null);
  const [loading, setLoading] = useState(!!campaignId);
  const [f, setF] = useState({ title: "", is_active: false, theme_id: "", apply_theme: true, starts_at: "", ends_at: "", priority: 0 });
  const [slides, setSlides] = useState([]);
  const [editing, setEditing] = useState(null);   // null | "new" | slide
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const [justCreated, setJustCreated] = useState(false);

  useEffect(() => {
    if (!campaignId) return;
    let alive = true;
    api.get(`/admin/campaigns/${campaignId}`).then((r) => {
      if (!alive) return;
      const c = r.data?.data;
      setF({ title: c.title, is_active: c.is_active, theme_id: c.theme_id ?? "", apply_theme: c.apply_theme, starts_at: toLocalInput(c.starts_at), ends_at: toLocalInput(c.ends_at), priority: c.priority });
      setSlides(c.slides || []);
    }).catch((e) => setErr(apiError(e, t("load_error")))).finally(() => alive && setLoading(false));
    return () => { alive = false; };
  }, [campaignId, t]);

  const set = (k, v) => setF((p) => ({ ...p, [k]: v }));
  const theme = themes.find((x) => String(x.id) === String(f.theme_id));

  const save = async (e) => {
    e.preventDefault();
    setErr("");
    if (!f.title.trim()) return setErr(t("campaign.title_required"));
    if (f.starts_at && f.ends_at && new Date(f.ends_at) < new Date(f.starts_at)) return setErr(t("campaign.dates_order"));
    setBusy(true);
    const body = { title: f.title.trim(), is_active: f.is_active, theme_id: f.theme_id === "" ? null : Number(f.theme_id), apply_theme: f.apply_theme,
      starts_at: fromLocalInput(f.starts_at), ends_at: fromLocalInput(f.ends_at), priority: Number(f.priority) || 0 };
    try {
      if (id) { await api.put(`/admin/campaigns/${id}`, body); showAlert(t("saved"), "success"); }
      else { const r = await api.post("/admin/campaigns", body); setId(r.data?.data?.id); setJustCreated(true); }
      onChanged();
    } catch (e2) { setErr(apiError(e2, t("save_error"))); }
    finally { setBusy(false); }
  };

  const reloadSlides = async () => {
    const r = await api.get(`/admin/campaigns/${id}`);
    setSlides(r.data?.data?.slides || []);
    onChanged();
  };
  const toggleSlide = async (s) => {
    try { await api.patch(`/admin/campaigns/slides/${s.id}/active`, { is_active: !s.is_active }); await reloadSlides(); }
    catch (e) { showAlert(apiError(e, t("save_error")), "error"); }
  };
  const removeSlide = async (s) => {
    if (!(await askConfirm(t("slides.delete_confirm"), { confirmLabel: t("delete"), danger: true }))) return;
    try { await api.delete(`/admin/campaigns/slides/${s.id}`); await reloadSlides(); }
    catch (e) { showAlert(apiError(e, t("save_error")), "error"); }
  };
  const move = async (i, dir) => {
    const next = [...slides]; const j = i + dir;
    if (j < 0 || j >= next.length) return;
    [next[i], next[j]] = [next[j], next[i]];
    setSlides(next);
    try { await api.patch(`/admin/campaigns/${id}/slides/reorder`, { ids: next.map((s) => s.id) }); onChanged(); }
    catch (e) { showAlert(apiError(e, t("save_error")), "error"); reloadSlides(); }
  };

  return (
    <Modal wide title={id ? t("campaign.dialog_edit") : t("campaign.dialog_new")} onClose={onClose} closeLabel={t("close")}>
      {loading ? <p className="flex items-center gap-2 text-sm text-slate-500"><Loader2 size={16} className="animate-spin" />{t("loading")}</p> : (
        <div className="space-y-8">
          <form onSubmit={save} noValidate className="space-y-5">
            <h3 className="text-sm font-bold uppercase tracking-wide text-slate-500">{t("campaign.section_info")}</h3>
            <div>
              <label className={lab} htmlFor="c-title">{t("campaign.title")}</label>
              <input id="c-title" className={input} maxLength={150} value={f.title} placeholder={t("campaign.title_ph")} onChange={(e) => set("title", e.target.value)} />
            </div>

            <div className="grid gap-5 md:grid-cols-[1fr_260px]">
              <div className="space-y-4">
                <div>
                  <label className={lab} htmlFor="c-theme">{t("campaign.theme")}</label>
                  <select id="c-theme" className={input} value={f.theme_id} onChange={(e) => set("theme_id", e.target.value)}>
                    <option value="">{t("campaign.theme_none")}</option>
                    {themes.map((x) => <option key={x.id} value={x.id}>{x.name}</option>)}
                  </select>
                </div>
                <label className="flex items-start gap-2 text-sm text-slate-700">
                  <input type="checkbox" className="mt-0.5 h-4 w-4 rounded border-slate-300" checked={f.apply_theme} disabled={!f.theme_id} onChange={(e) => set("apply_theme", e.target.checked)} />
                  <span><span className="font-medium">{t("campaign.apply_theme")}</span><br /><span className="text-xs text-slate-500">{t("campaign.apply_theme_help")}</span></span>
                </label>
              </div>
              {theme && f.apply_theme ? <ThemePreview theme={theme} /> : <div className="hidden md:block" />}
            </div>

            <div className="rounded-xl border border-slate-200 p-4">
              <label className="flex items-start gap-3 text-sm text-slate-700">
                <input type="checkbox" role="switch" className="mt-0.5 h-5 w-5 rounded border-slate-300" checked={f.is_active} onChange={(e) => set("is_active", e.target.checked)} />
                <span><span className="font-semibold">{t("campaign.active")}</span><br /><span className="text-xs text-slate-500">{t("campaign.active_help")}</span></span>
              </label>
              <div className="mt-4 grid gap-4 sm:grid-cols-3">
                <div><label className={lab} htmlFor="c-start">{t("campaign.starts_at")}</label>
                  <input id="c-start" type="datetime-local" className={input} value={f.starts_at} onChange={(e) => set("starts_at", e.target.value)} /></div>
                <div><label className={lab} htmlFor="c-end">{t("campaign.ends_at")}</label>
                  <input id="c-end" type="datetime-local" className={input} value={f.ends_at} min={f.starts_at || undefined} onChange={(e) => set("ends_at", e.target.value)} /></div>
                <div><label className={lab} htmlFor="c-prio">{t("campaign.priority")}</label>
                  <input id="c-prio" type="number" className={input} value={f.priority} onChange={(e) => set("priority", e.target.value)} /></div>
              </div>
              <p className="mt-2 text-xs text-slate-500">{t("campaign.dates_help")} {t("campaign.priority_help")}</p>
            </div>

            {err && <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm font-medium text-red-700">{err}</p>}
            {justCreated && <p role="status" className="rounded-lg bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-700">{t("campaign.created_hint")}</p>}
            <div className="flex justify-end gap-2">
              <button type="button" onClick={onClose} className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50">{t("close")}</button>
              <button type="submit" disabled={busy} className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-white hover:bg-primary-mid disabled:opacity-60">
                {busy && <Loader2 size={15} className="animate-spin" aria-hidden="true" />}{id ? t("save") : t("create")}
              </button>
            </div>
          </form>

          <section aria-labelledby="slides-h" className="space-y-3">
            <div className="flex items-center justify-between gap-3">
              <h3 id="slides-h" className="text-sm font-bold uppercase tracking-wide text-slate-500">{t("slides.section")}</h3>
              {id && editing === null && (
                <button type="button" onClick={() => setEditing("new")} className="inline-flex items-center gap-1.5 rounded-xl bg-accent px-4 py-2 text-sm font-bold text-primary hover:bg-accent-light"><Plus size={16} aria-hidden="true" />{t("slides.add")}</button>
              )}
            </div>
            {!id && <p className="rounded-xl border border-dashed border-slate-300 p-4 text-sm text-slate-500">{t("slides.save_first")}</p>}
            {id && editing !== null && (
              <SlideForm campaignId={id} slide={editing === "new" ? null : editing} onCancel={() => setEditing(null)}
                onSaved={async () => { setEditing(null); await reloadSlides(); }} />
            )}
            {id && editing === null && slides.length === 0 && <p className="rounded-xl border border-dashed border-slate-300 p-4 text-sm text-slate-500">{t("slides.empty")}</p>}
            {id && editing === null && slides.length > 0 && (
              <ul className="space-y-2">
                {slides.map((s, i) => (
                  <li key={s.id} className={`flex flex-wrap items-center gap-3 rounded-xl border p-3 ${s.is_active ? "border-slate-200 bg-white" : "border-slate-200 bg-slate-50 opacity-70"}`}>
                    <div className="flex flex-col">
                      <button type="button" aria-label={t("slides.move_up")} disabled={i === 0} onClick={() => move(i, -1)} className="rounded p-0.5 text-slate-500 hover:bg-slate-100 disabled:opacity-30"><ArrowUp size={15} /></button>
                      <button type="button" aria-label={t("slides.move_down")} disabled={i === slides.length - 1} onClick={() => move(i, 1)} className="rounded p-0.5 text-slate-500 hover:bg-slate-100 disabled:opacity-30"><ArrowDown size={15} /></button>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-slate-900">{s.title || t("slides.untitled")}</p>
                      <p className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500">
                        {s.image_url && <span className="inline-flex items-center gap-1"><ImageIcon size={13} aria-hidden="true" />{t("slides.has_image")}</span>}
                        {s.linkedin_url && <span className="inline-flex items-center gap-1"><Linkedin size={13} aria-hidden="true" />{t("slides.has_linkedin")}</span>}
                        {s.cta_label && <span className="inline-flex items-center gap-1"><MousePointerClick size={13} aria-hidden="true" />{s.cta_label}</span>}
                      </p>
                    </div>
                    <div className="flex items-center gap-1">
                      <button type="button" onClick={() => toggleSlide(s)} aria-label={t("slides.toggle")} title={t("slides.toggle")} className="rounded-lg p-2 text-slate-600 hover:bg-slate-100">{s.is_active ? <Eye size={17} /> : <EyeOff size={17} />}</button>
                      <button type="button" onClick={() => setEditing(s)} aria-label={t("edit")} title={t("edit")} className="rounded-lg p-2 text-slate-600 hover:bg-slate-100"><Pencil size={17} /></button>
                      <button type="button" onClick={() => removeSlide(s)} aria-label={t("delete")} title={t("delete")} className="rounded-lg p-2 text-red-600 hover:bg-red-50"><Trash2 size={17} /></button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      )}
    </Modal>
  );
}
