// Éditeur de blocs d'un email (titre, texte, image, bouton, cours, webinaire, code promo, séparateur).
import { useTranslation } from "react-i18next";
import { ArrowDown, ArrowUp, Plus, Trash2 } from "lucide-react";
import { inp } from "../program/ui";
import { emptyBlock } from "./templates";

const TYPES = ["heading", "text", "image", "button", "course", "webinar", "coupon", "divider"];

export default function BlocksEditor({ blocks, onChange, pickers }) {
  const { t } = useTranslation("marketing");
  const set = (i, patch) => onChange(blocks.map((b, j) => (j === i ? { ...b, ...patch } : b)));
  const move = (i, d) => {
    const j = i + d;
    if (j < 0 || j >= blocks.length) return;
    const next = [...blocks]; [next[i], next[j]] = [next[j], next[i]]; onChange(next);
  };
  const fmtDate = (d) => (d ? new Date(d).toLocaleDateString() : "");

  return (
    <div className="space-y-3">
      {blocks.length === 0 && <p className="text-sm text-gray-400 text-center py-6">{t("blocks_empty")}</p>}
      {blocks.map((b, i) => (
        <div key={i} className="border border-gray-200 rounded-xl bg-white">
          <div className="flex items-center justify-between px-3 py-2 border-b border-gray-100 bg-gray-50 rounded-t-xl">
            <span className="text-xs font-bold text-gray-600">{t(`block_${b.type}`)}</span>
            <div className="flex items-center gap-1">
              <button type="button" onClick={() => move(i, -1)} className="p-1 bg-transparent text-gray-400 hover:text-gray-700" aria-label={t("up")}><ArrowUp className="w-4 h-4" /></button>
              <button type="button" onClick={() => move(i, 1)} className="p-1 bg-transparent text-gray-400 hover:text-gray-700" aria-label={t("down")}><ArrowDown className="w-4 h-4" /></button>
              <button type="button" onClick={() => onChange(blocks.filter((_, j) => j !== i))} className="p-1 bg-transparent text-gray-400 hover:text-red-600" aria-label={t("delete")}><Trash2 className="w-4 h-4" /></button>
            </div>
          </div>
          <div className="p-3 space-y-2">
            {b.type === "heading" && <input className={inp} value={b.text || ""} maxLength={200} placeholder={t("ph_heading")} onChange={(e) => set(i, { text: e.target.value })} />}
            {b.type === "text" && <textarea rows={4} className={`${inp} resize-y`} value={b.text || ""} placeholder={t("ph_text")} onChange={(e) => set(i, { text: e.target.value })} />}
            {b.type === "image" && (
              <>
                <input className={inp} value={b.url || ""} placeholder={t("ph_image_url")} onChange={(e) => set(i, { url: e.target.value })} />
                <div className="grid sm:grid-cols-2 gap-2">
                  <input className={inp} value={b.alt || ""} placeholder={t("ph_alt")} onChange={(e) => set(i, { alt: e.target.value })} />
                  <input className={inp} value={b.link || ""} placeholder={t("ph_image_link")} onChange={(e) => set(i, { link: e.target.value })} />
                </div>
              </>
            )}
            {b.type === "button" && (
              <div className="grid sm:grid-cols-2 gap-2">
                <input className={inp} value={b.label || ""} maxLength={80} placeholder={t("ph_button_label")} onChange={(e) => set(i, { label: e.target.value })} />
                <input className={inp} value={b.url || ""} placeholder={t("ph_button_url")} onChange={(e) => set(i, { url: e.target.value })} />
              </div>
            )}
            {b.type === "course" && (
              <select className={inp} value={b.course_id || ""} onChange={(e) => set(i, { course_id: e.target.value ? Number(e.target.value) : null })}>
                <option value="">{t("pick_course")}</option>
                {(pickers?.courses || []).map((c) => <option key={c.id} value={c.id}>{c.title}{Number(c.is_published) ? "" : ` (${t("unpublished")})`}</option>)}
              </select>
            )}
            {b.type === "webinar" && (
              <select className={inp} value={b.bootcamp_id || ""} onChange={(e) => set(i, { bootcamp_id: e.target.value ? Number(e.target.value) : null })}>
                <option value="">{t("pick_webinar")}</option>
                {(pickers?.bootcamps || []).map((w) => <option key={w.id} value={w.id}>{w.title} — {fmtDate(w.scheduled_at)}</option>)}
              </select>
            )}
            {b.type === "coupon" && (
              <div className="grid sm:grid-cols-2 gap-2">
                <input className={inp} value={b.code || ""} maxLength={40} placeholder={t("ph_coupon_code")} onChange={(e) => set(i, { code: e.target.value })} />
                <input className={inp} value={b.text || ""} maxLength={200} placeholder={t("ph_coupon_text")} onChange={(e) => set(i, { text: e.target.value })} />
              </div>
            )}
            {b.type === "divider" && <p className="text-xs text-gray-400">{t("divider_hint")}</p>}
          </div>
        </div>
      ))}
      <div className="flex flex-wrap gap-1.5 pt-1">
        {TYPES.map((tp) => (
          <button key={tp} type="button" onClick={() => onChange([...blocks, emptyBlock(tp)])}
            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold border border-gray-200 bg-white text-gray-700 hover:bg-gray-50">
            <Plus className="w-3 h-3" />{t(`block_${tp}`)}
          </button>
        ))}
      </div>
    </div>
  );
}
