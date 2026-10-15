// Grille de relecture d'un cours (admin) + historique des tours de relecture.
import { Star } from "lucide-react";
import { useTranslation } from "react-i18next";
import { formatDateTime } from "../../../utils/format";

export const emptyGrid = (keys) => keys.map((key) => ({ key, score: null, comment: "" }));

export function GridEditor({ grid, onChange }) {
  const { t } = useTranslation("instructorProgram");
  const set = (i, patch) => onChange(grid.map((g, j) => (j === i ? { ...g, ...patch } : g)));
  return (
    <div className="space-y-3">
      <p className="text-xs text-gray-500">{t("grid_hint")}</p>
      {grid.map((g, i) => (
        <div key={g.key} className="border border-gray-200 rounded-xl p-3 space-y-2">
          <div className="flex items-center justify-between gap-2">
            <span className="text-sm font-semibold text-gray-800">{t(`crit_${g.key}`)}</span>
            <div className="flex gap-0.5">
              {[1, 2, 3, 4, 5].map((n) => (
                <button key={n} type="button" onClick={() => set(i, { score: g.score === n ? null : n })} className="p-0.5 bg-transparent">
                  <Star className={`w-5 h-5 ${n <= (g.score || 0) ? "fill-amber-400 text-amber-400" : "text-gray-300"}`} />
                </button>
              ))}
            </div>
          </div>
          <input value={g.comment} maxLength={1000} onChange={(e) => set(i, { comment: e.target.value })} placeholder={t("grid_comment_ph")}
            className="w-full px-3 py-1.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
        </div>
      ))}
    </div>
  );
}

export function RoundsHistory({ rounds }) {
  const { t } = useTranslation("instructorProgram");
  if (!rounds?.length) return null;
  return (
    <section>
      <h3 className="text-sm font-semibold text-gray-900 mb-2">{t("rounds_title")}</h3>
      <ul className="space-y-2">
        {rounds.map((r) => (
          <li key={r.id} className="border border-gray-200 rounded-xl p-3 text-sm">
            <div className="flex items-center justify-between gap-2">
              <span className={`text-xs font-bold ${r.decision === "approved" ? "text-emerald-600" : "text-amber-600"}`}>{t(`round_${r.decision}`)}</span>
              <span className="text-[11px] text-gray-400">{r.reviewer ? `${r.reviewer} · ` : ""}{formatDateTime(r.created_at)}</span>
            </div>
            {r.comment && <p className="text-gray-700 mt-1 whitespace-pre-line">{r.comment}</p>}
            {r.criteria?.length > 0 && (
              <ul className="mt-2 space-y-0.5">
                {r.criteria.map((c) => (
                  <li key={c.key} className="text-xs text-gray-600"><strong>{t(`crit_${c.key}`)}</strong>{c.score ? ` ${c.score}/5` : ""}{c.comment ? ` — ${c.comment}` : ""}</li>
                ))}
              </ul>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}
