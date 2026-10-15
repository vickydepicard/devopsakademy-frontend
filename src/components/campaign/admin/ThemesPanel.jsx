// Thèmes de couleurs : liste, création d'un thème pour un nouvel événement, contrôle de lisibilité.
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { AlertTriangle, CheckCircle2, Loader2, Lock, Pencil, Plus, Sparkles, Trash2 } from "lucide-react";
import api from "../../../api/api";
import { apiError } from "../../Common/useFeedback";
import { askConfirm, showAlert } from "../../../utils/dialog";
import { hexToRgb, rgbToHex, themeChecks } from "../../../theme/themeUtils";
import Modal from "./Modal";
import ThemePreview from "./ThemePreview";

const input = "w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/15";
const lab = "mb-1.5 block text-sm font-medium text-slate-700";
const HEX = /^#[0-9a-fA-F]{6}$/;
const FIELDS = ["primary", "primary_light", "primary_dark", "accent"];

function ColorField({ id, label, help, value, onChange, t }) {
  const valid = HEX.test(value);
  return (
    <div>
      <label className={lab} htmlFor={id}>{label}</label>
      <div className="flex items-center gap-2">
        <input type="color" aria-label={label} value={valid ? value : "#000000"} onChange={(e) => onChange(e.target.value)} className="h-10 w-12 shrink-0 cursor-pointer rounded-lg border border-slate-200 bg-white p-1" />
        <input id={id} className={`${input} font-mono uppercase`} value={value} maxLength={7} spellCheck={false} onChange={(e) => onChange(e.target.value.startsWith("#") ? e.target.value : `#${e.target.value}`)} aria-invalid={!valid} />
      </div>
      {valid ? <p className="mt-1 text-xs text-slate-500">{help}</p> : <p className="mt-1 text-xs font-medium text-red-600">{t("themes.hex_invalid")}</p>}
    </div>
  );
}

function ThemeDialog({ theme, onClose, onSaved, t }) {
  const [f, setF] = useState({ name: theme?.name || "", description: theme?.description || "", primary: theme?.primary || "#14284b", primary_light: theme?.primary_light || "#2f4b8a", primary_dark: theme?.primary_dark || "#0c1a33", accent: theme?.accent || "#f26aa8" });
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const set = (k, v) => setF((p) => ({ ...p, [k]: v }));
  const allValid = FIELDS.every((k) => HEX.test(f[k]));
  const checks = allValid ? themeChecks(f) : [];
  const weak = checks.filter((c) => !c.ok);

  const generate = () => {
    const p = hexToRgb(f.primary); if (!p) return;
    const mix = (to, k) => p.map((v, i) => v + (to[i] - v) * k);
    setF((x) => ({ ...x, primary_light: rgbToHex(mix([255, 255, 255], 0.22)), primary_dark: rgbToHex(mix([0, 0, 0], 0.4)) }));
  };

  const submit = async (e) => {
    e.preventDefault();
    setErr("");
    if (!f.name.trim()) return setErr(t("themes.name_required"));
    if (!allValid) return setErr(t("themes.hex_invalid"));
    setBusy(true);
    try {
      const body = { ...f, name: f.name.trim() };
      const r = theme ? await api.put(`/admin/themes/${theme.id}`, body) : await api.post("/admin/themes", body);
      onSaved(r.data?.data);
    } catch (e2) { setErr(apiError(e2, t("save_error"))); }
    finally { setBusy(false); }
  };

  return (
    <Modal title={theme ? t("themes.dialog_edit") : t("themes.dialog_new")} onClose={onClose} closeLabel={t("close")} wide>
      <form onSubmit={submit} noValidate className="grid gap-6 md:grid-cols-[1fr_280px]">
        <div className="space-y-4">
          <div><label className={lab} htmlFor="t-name">{t("themes.name")}</label>
            <input id="t-name" className={input} maxLength={120} value={f.name} placeholder={t("themes.name_ph")} onChange={(e) => set("name", e.target.value)} /></div>
          <div><label className={lab} htmlFor="t-desc">{t("themes.description")}</label>
            <input id="t-desc" className={input} maxLength={255} value={f.description} onChange={(e) => set("description", e.target.value)} /></div>
          <div className="grid gap-4 sm:grid-cols-2">
            <ColorField t={t} id="t-p" label={t("themes.primary")} help={t("themes.primary_help")} value={f.primary} onChange={(v) => set("primary", v)} />
            <ColorField t={t} id="t-a" label={t("themes.accent")} help={t("themes.accent_help")} value={f.accent} onChange={(v) => set("accent", v)} />
            <ColorField t={t} id="t-pl" label={t("themes.primary_light")} help={t("themes.primary_light_help")} value={f.primary_light} onChange={(v) => set("primary_light", v)} />
            <ColorField t={t} id="t-pd" label={t("themes.primary_dark")} help={t("themes.primary_dark_help")} value={f.primary_dark} onChange={(v) => set("primary_dark", v)} />
          </div>
          <button type="button" onClick={generate} className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"><Sparkles size={14} aria-hidden="true" />{t("themes.generate")}</button>
        </div>
        <div className="space-y-4">
          <p className="text-sm font-semibold text-slate-700">{t("themes.preview")}</p>
          <ThemePreview theme={f} />
          {allValid && (
            <div>
              <p className="mb-2 text-sm font-semibold text-slate-700">{t("themes.checks")}</p>
              <ul className="space-y-1.5">
                {checks.map((c) => (
                  <li key={c.id} className={`flex items-start gap-2 text-xs ${c.ok ? "text-emerald-700" : "text-amber-700"}`}>
                    {c.ok ? <CheckCircle2 size={15} className="mt-0.5 shrink-0" aria-hidden="true" /> : <AlertTriangle size={15} className="mt-0.5 shrink-0" aria-hidden="true" />}
                    <span>{t(`themes.check_${c.id}`)} : <b>{c.ratio.toFixed(1)}:1</b> · {c.ok ? t("themes.check_ok") : t("themes.check_warn")}</span>
                  </li>
                ))}
              </ul>
              {weak.length > 0 && <p className="mt-2 rounded-lg bg-amber-50 p-2.5 text-xs text-amber-800">{t("themes.check_warning")}</p>}
            </div>
          )}
        </div>
        <div className="md:col-span-2">
          {err && <p role="alert" className="mb-3 rounded-lg bg-red-50 px-3 py-2 text-sm font-medium text-red-700">{err}</p>}
          <div className="flex justify-end gap-2">
            <button type="button" onClick={onClose} className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50">{t("cancel")}</button>
            <button type="submit" disabled={busy} className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-white hover:bg-primary-mid disabled:opacity-60">
              {busy && <Loader2 size={15} className="animate-spin" aria-hidden="true" />}{t("save")}</button>
          </div>
        </div>
      </form>
    </Modal>
  );
}

export default function ThemesPanel({ themes, onChanged }) {
  const { t } = useTranslation("adminCampaigns");
  const [dialog, setDialog] = useState(null); // null | "new" | theme

  const remove = async (th) => {
    if (!(await askConfirm(t("themes.delete_confirm", { name: th.name }), { confirmLabel: t("delete"), danger: true }))) return;
    try { await api.delete(`/admin/themes/${th.id}`); onChanged(); }
    catch (e) { showAlert(apiError(e, t("save_error")), "error"); }
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="max-w-2xl text-sm text-slate-600">{t("themes.intro")}</p>
        <button type="button" onClick={() => setDialog("new")} className="inline-flex items-center gap-1.5 rounded-xl bg-accent px-4 py-2.5 text-sm font-bold text-primary hover:bg-accent-light"><Plus size={16} aria-hidden="true" />{t("new_theme")}</button>
      </div>
      <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {themes.map((th) => (
          <li key={th.id} className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <ThemePreview theme={th} />
            <div className="min-w-0">
              <p className="flex flex-wrap items-center gap-2 font-semibold text-slate-900">{th.name}
                <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-slate-500">{th.is_builtin ? t("themes.builtin") : t("themes.custom")}</span></p>
              {th.description && <p className="mt-0.5 text-xs text-slate-500">{th.description}</p>}
              <p className="mt-1 text-xs text-slate-500">{th.used_by > 0 ? t("themes.used_by", { count: th.used_by }) : t("themes.unused")}</p>
            </div>
            <div className="mt-auto flex items-center justify-between">
              <span className="flex gap-1.5" aria-hidden="true">{FIELDS.map((k) => <i key={k} className="h-5 w-5 rounded-full ring-1 ring-black/10" style={{ background: th[k] }} />)}</span>
              {th.slug === "normal" ? (
                <span className="inline-flex items-center gap-1 text-xs text-slate-400" title={t("themes.locked")}><Lock size={14} aria-hidden="true" />{t("themes.builtin")}</span>
              ) : (
                <span className="flex gap-1">
                  <button type="button" onClick={() => setDialog(th)} aria-label={`${t("edit")} ${th.name}`} className="rounded-lg p-2 text-slate-600 hover:bg-slate-100"><Pencil size={16} /></button>
                  <button type="button" onClick={() => remove(th)} aria-label={`${t("delete")} ${th.name}`} className="rounded-lg p-2 text-red-600 hover:bg-red-50"><Trash2 size={16} /></button>
                </span>
              )}
            </div>
          </li>
        ))}
      </ul>
      {dialog && <ThemeDialog t={t} theme={dialog === "new" ? null : dialog} onClose={() => setDialog(null)} onSaved={() => { setDialog(null); onChanged(); }} />}
    </div>
  );
}
