// Formulaire d'une slide : texte, affiche (import ou lien), post LinkedIn (code d'intégration), bouton.
import { useState } from "react";
import { useTranslation } from "react-i18next";
import api from "../../../api/api";
import FileUrlField from "../../Common/FileUrlField";
import { apiError } from "../../Common/useFeedback";
import { Linkedin, Loader2 } from "lucide-react";

const input = "w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/15";
const lab = "mb-1.5 block text-sm font-medium text-slate-700";

export default function SlideForm({ campaignId, slide, onSaved, onCancel }) {
  const { t } = useTranslation("adminCampaigns");
  const [f, setF] = useState({
    label: slide?.label || "", title: slide?.title || "", body: slide?.body || "", image_url: slide?.image_url || "",
    linkedin_url: slide?.linkedin_url || "", cta_label: slide?.cta_label || "", cta_url: slide?.cta_url || "",
    is_active: slide ? slide.is_active : true,
  });
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const set = (k, v) => setF((p) => ({ ...p, [k]: v }));

  const submit = async (e) => {
    e.preventDefault();
    setErr("");
    if (!f.title.trim() && !f.image_url.trim() && !f.linkedin_url.trim()) return setErr(t("slides.need_content"));
    if (f.cta_url.trim() && !f.cta_label.trim()) return setErr(t("slides.need_cta_label"));
    setBusy(true);
    try {
      const res = slide
        ? await api.put(`/admin/campaigns/slides/${slide.id}`, f)
        : await api.post(`/admin/campaigns/${campaignId}/slides`, f);
      onSaved(res.data?.data);
    } catch (e2) { setErr(apiError(e2, t("save_error"))); }
    finally { setBusy(false); }
  };

  return (
    <form onSubmit={submit} className="space-y-4 rounded-2xl border border-primary/20 bg-primary/5 p-4 sm:p-5" noValidate>
      <h3 className="text-base font-bold text-slate-900">{slide ? t("slides.form_edit") : t("slides.form_new")}</h3>
      <div className="grid gap-4 sm:grid-cols-2">
        <div><label className={lab} htmlFor="sl-label">{t("slides.label")}</label>
          <input id="sl-label" className={input} maxLength={120} value={f.label} placeholder={t("slides.label_ph")} onChange={(e) => set("label", e.target.value)} /></div>
        <div><label className={lab} htmlFor="sl-title">{t("slides.title")}</label>
          <input id="sl-title" className={input} maxLength={200} value={f.title} placeholder={t("slides.title_ph")} onChange={(e) => set("title", e.target.value)} /></div>
      </div>
      <div><label className={lab} htmlFor="sl-body">{t("slides.body")}</label>
        <textarea id="sl-body" rows={3} className={input} maxLength={2000} value={f.body} placeholder={t("slides.body_ph")} onChange={(e) => set("body", e.target.value)} /></div>
      <div>
        <FileUrlField label={t("slides.image")} kind="image" value={f.image_url} onChange={(v) => set("image_url", v)} inputClass={input} labelClass={lab} />
        <p className="mt-1 text-xs text-slate-500">{t("slides.image_help")}</p>
      </div>
      <div>
        <label className={`${lab} flex items-center gap-1.5`} htmlFor="sl-in"><Linkedin size={15} aria-hidden="true" />{t("slides.linkedin")}</label>
        <textarea id="sl-in" rows={3} className={`${input} font-mono text-xs`} value={f.linkedin_url} placeholder={t("slides.linkedin_ph")} onChange={(e) => set("linkedin_url", e.target.value)} />
        <p className="mt-1 text-xs text-slate-500">{t("slides.linkedin_help")}</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div><label className={lab} htmlFor="sl-cl">{t("slides.cta_label")}</label>
          <input id="sl-cl" className={input} maxLength={80} value={f.cta_label} placeholder={t("slides.cta_label_ph")} onChange={(e) => set("cta_label", e.target.value)} /></div>
        <div><label className={lab} htmlFor="sl-cu">{t("slides.cta_url")}</label>
          <input id="sl-cu" className={input} maxLength={500} value={f.cta_url} placeholder={t("slides.cta_url_ph")} onChange={(e) => set("cta_url", e.target.value)} />
          <p className="mt-1 text-xs text-slate-500">{t("slides.cta_help")}</p></div>
      </div>
      <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
        <input type="checkbox" className="h-4 w-4 rounded border-slate-300" checked={f.is_active} onChange={(e) => set("is_active", e.target.checked)} />{t("slides.active")}
      </label>
      {err && <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm font-medium text-red-700">{err}</p>}
      <div className="flex justify-end gap-2">
        <button type="button" onClick={onCancel} className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-white">{t("cancel")}</button>
        <button type="submit" disabled={busy} className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-white hover:bg-primary-mid disabled:opacity-60">
          {busy && <Loader2 size={15} className="animate-spin" aria-hidden="true" />}{t("save")}
        </button>
      </div>
    </form>
  );
}
