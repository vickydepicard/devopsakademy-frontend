// src/pages/BecomeInstructor/FormControls.jsx — DevOpsAkademy
// Contrôles partagés par le formulaire de candidature et le formulaire de complément :
// listes déroulantes, sélection multiple (listes proposées + saisie libre) et dépôt de CV.

import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { FileText, Plus, UploadCloud, X } from "lucide-react";
import api from "../../api/api";
import { COURSE_LEVELS, HOURS_OPTIONS, YEARS_OPTIONS } from "../../utils/instructorOptions";

export const inputCls = (hasError) =>
  `w-full px-3 py-2.5 border-2 rounded-xl text-sm focus:outline-none bg-white transition ${hasError ? "border-red-300" : "border-gray-200 focus:border-indigo-400"}`;

// ── Liste déroulante générique ──
export function SelectField({ value, onChange, options, placeholder, error }) {
  return (
    <select value={value ?? ""} onChange={(e) => onChange(e.target.value)} className={inputCls(error)}>
      <option value="">{placeholder}</option>
      {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
  );
}

export function YearsSelect({ value, onChange, error }) {
  const { t } = useTranslation("applicationReview");
  const options = YEARS_OPTIONS.map((n) => ({ value: String(n), label: n === 0 ? t("less_than_one_year") : n === 10 ? t("ten_plus_years") : t("years", { count: n }) }));
  return <SelectField value={value === null || value === undefined ? "" : String(value)} onChange={onChange} options={options} placeholder={t("select")} error={error} />;
}

export function HoursSelect({ value, onChange, error }) {
  const { t } = useTranslation("applicationReview");
  const options = HOURS_OPTIONS.map((n) => ({ value: String(n), label: t("hours_per_week", { count: n }) }));
  return <SelectField value={value === null || value === undefined ? "" : String(value)} onChange={onChange} options={options} placeholder={t("select")} error={error} />;
}

export function LevelSelect({ value, onChange, error }) {
  const { t } = useTranslation("applicationReview");
  const options = COURSE_LEVELS.map((l) => ({ value: l, label: t(`level_${l}`) }));
  return <SelectField value={value ?? ""} onChange={onChange} options={options} placeholder={t("select")} error={error} />;
}

// Catégories de cours déjà gérées par la plateforme (table course_categories)
export function CategorySelect({ value, onChange, error }) {
  const { t } = useTranslation("applicationReview");
  const [cats, setCats] = useState([]);
  useEffect(() => {
    let alive = true;
    api.get("/categories")
      .then((r) => { if (alive) setCats((r.data?.data || []).map((c) => c.name || c.title).filter(Boolean)); })
      .catch(() => {});
    return () => { alive = false; };
  }, []);
  // une valeur déjà enregistrée qui ne figure plus dans la liste reste sélectionnable
  const names = value && !cats.includes(value) ? [value, ...cats] : cats;
  return <SelectField value={value ?? ""} onChange={onChange} options={names.map((n) => ({ value: n, label: n }))} placeholder={t("select")} error={error} />;
}

// ── Sélection multiple : choix proposés + « Autre » en saisie libre ──
export function ChipSelect({ options, value, onChange, error, max = 20 }) {
  const { t } = useTranslation("applicationReview");
  const [custom, setCustom] = useState("");
  const list = Array.isArray(value) ? value : [];
  const extras = list.filter((v) => !options.includes(v));

  const toggle = (item) => onChange(list.includes(item) ? list.filter((x) => x !== item) : [...list, item].slice(0, max));
  const addCustom = () => {
    const v = custom.trim();
    if (!v || list.includes(v)) { setCustom(""); return; }
    onChange([...list, v].slice(0, max));
    setCustom("");
  };

  const chip = (item, selected) => (
    <button key={item} type="button" onClick={() => toggle(item)}
      className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold border-2 transition ${selected ? "text-white border-transparent" : "bg-white text-gray-600 border-gray-200 hover:border-indigo-300"}`}
      style={selected ? { background: "linear-gradient(135deg,rgb(var(--c-primary)),rgb(var(--c-primary-light)))" } : undefined}>
      {selected && "✓ "}{item}
    </button>
  );

  return (
    <div className={`rounded-xl border-2 p-3 space-y-3 bg-white ${error ? "border-red-300" : "border-gray-200"}`}>
      <div className="flex flex-wrap gap-2">
        {options.map((o) => chip(o, list.includes(o)))}
        {extras.map((o) => chip(o, true))}
      </div>
      <div className="flex gap-2">
        <input value={custom} onChange={(e) => setCustom(e.target.value)} maxLength={80}
          onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addCustom(); } }}
          placeholder={t("other_placeholder")}
          className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-indigo-400" />
        <button type="button" onClick={addCustom} disabled={!custom.trim()}
          className="inline-flex items-center gap-1 px-3 py-2 rounded-lg text-xs font-bold border border-indigo-300 text-indigo-700 hover:bg-indigo-50 disabled:opacity-40">
          <Plus className="w-3.5 h-3.5" />{t("add")}
        </button>
      </div>
      <p className="text-[11px] text-gray-400">{t("selected_count", { count: list.length })}</p>
    </div>
  );
}

// ── Dépôt de CV depuis l'ordinateur (PDF / DOC / DOCX, 5 Mo) ──
const CV_EXT = /\.(pdf|doc|docx)$/i;
const CV_MAX = 5 * 1024 * 1024;

export function CvUpload({ file, onFile, existingName, error }) {
  const { t } = useTranslation("applicationReview");
  const ref = useRef(null);
  const [localErr, setLocalErr] = useState("");
  const [drag, setDrag] = useState(false);

  const pick = (f) => {
    if (!f) return;
    if (!CV_EXT.test(f.name)) { setLocalErr(t("cv_bad_format")); return; }
    if (f.size > CV_MAX) { setLocalErr(t("cv_too_big")); return; }
    setLocalErr("");
    onFile(f);
  };
  const msg = localErr || error;

  return (
    <div>
      <div
        onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
        onDragLeave={() => setDrag(false)}
        onDrop={(e) => { e.preventDefault(); setDrag(false); pick(e.dataTransfer.files?.[0]); }}
        onClick={() => ref.current?.click()}
        className={`cursor-pointer rounded-xl border-2 border-dashed p-5 text-center transition ${drag ? "border-indigo-500 bg-indigo-50" : msg ? "border-red-300 bg-red-50/40" : "border-gray-300 bg-white hover:border-indigo-400 hover:bg-indigo-50/40"}`}>
        <input ref={ref} type="file" accept=".pdf,.doc,.docx,application/pdf" className="hidden"
          onChange={(e) => { pick(e.target.files?.[0]); e.target.value = ""; }} />
        {file ? (
          <div className="flex items-center justify-center gap-3">
            <FileText className="w-6 h-6 text-indigo-500 shrink-0" />
            <div className="text-left min-w-0">
              <p className="text-sm font-bold text-gray-800 truncate">{file.name}</p>
              <p className="text-xs text-gray-400">{(file.size / 1024 / 1024).toFixed(2)} Mo</p>
            </div>
            <button type="button" onClick={(e) => { e.stopPropagation(); onFile(null); }} className="text-gray-400 hover:text-red-500" title={t("remove")}>
              <X className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <>
            <UploadCloud className="w-7 h-7 mx-auto text-gray-400 mb-1.5" />
            <p className="text-sm font-bold text-gray-700">{existingName ? t("cv_replace") : t("cv_choose")}</p>
            <p className="text-xs text-gray-400 mt-0.5">{t("cv_hint")}</p>
            {existingName && <p className="text-xs text-emerald-600 font-semibold mt-2">{t("cv_current", { name: existingName })}</p>}
          </>
        )}
      </div>
      {msg && <p className="mt-1 text-xs text-red-600">{msg}</p>}
    </div>
  );
}

// Envoi du CV (multipart) ; lève l'erreur renvoyée par l'API
export const uploadCv = async (file) => {
  const fd = new FormData();
  fd.append("file", file);
  await api.post("/instructor-applications/my/cv", fd, { headers: { "Content-Type": "multipart/form-data" } });
};
