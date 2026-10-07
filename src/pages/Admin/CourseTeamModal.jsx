// Équipe d'un cours : part totale des instructeurs, auteur, intervenants assignés par l'administration.
import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { X, Plus, Trash2, Loader, Check } from "lucide-react";
import api from "../../api/api";
import useFeedback, { apiError } from "../../components/Common/useFeedback";

const field = "w-full px-3 py-2 border border-gray-200 rounded-xl text-sm bg-white text-left focus:outline-none focus:ring-2 focus:ring-primary/30";
const parseRate = (v) => {
  const n = Number(String(v).replace(",", "."));
  return String(v).trim() !== "" && Number.isFinite(n) && n >= 0 && n <= 100 ? n : null;
};

export default function CourseTeamModal({ courseId, courseTitle, onClose, onChanged }) {
  const { t } = useTranslation("courseTeam");
  const { ui, notify, confirm } = useFeedback();
  const [team, setTeam] = useState(null);
  const [poolInput, setPoolInput] = useState("");
  const [query, setQuery] = useState("");
  const [options, setOptions] = useState([]);
  const [form, setForm] = useState({ instructor_id: "", commission_rate: "", can_edit_content: false });
  const [editId, setEditId] = useState(null);
  const [editRate, setEditRate] = useState("");
  const [busy, setBusy] = useState(false);

  const apply = useCallback((data) => { setTeam(data); setPoolInput(String(data.pool_rate)); onChanged?.(); }, [onChanged]);

  useEffect(() => {
    api.get(`/admin/courses/${courseId}/instructors`)
      .then((r) => { setTeam(r.data.data); setPoolInput(String(r.data.data.pool_rate)); })
      .catch((e) => notify(apiError(e, t("erreur_chargement"))));
  }, [courseId]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const h = setTimeout(async () => {
      try {
        const r = await api.get("/admin/instructor-management", { params: { search: query || undefined, status: "active", limit: 20 } });
        setOptions(r.data?.data || []);
      } catch { setOptions([]); }
    }, 250);
    return () => clearTimeout(h);
  }, [query]);

  const run = async (fn, okMsg) => {
    setBusy(true);
    try {
      const r = await fn();
      apply(r.data.data);
      if (okMsg) notify(okMsg, "success");
      return true;
    } catch (e) {
      const d = e?.response?.data;
      notify(d?.code === "RATE_EXCEEDS_POOL" ? t("part_trop_elevee", { available: d.available }) : apiError(e, t("erreur_action")));
      return false;
    } finally { setBusy(false); }
  };

  const savePool = () => {
    const rate = parseRate(poolInput);
    if (rate === null) return notify(t("taux_invalide"));
    return run(() => api.patch(`/admin/courses/${courseId}/commission`, { rate }), t("part_enregistree"));
  };

  const add = async () => {
    const rate = parseRate(form.commission_rate);
    if (!form.instructor_id) return notify(t("choisir_instructeur"));
    if (rate === null) return notify(t("taux_invalide"));
    const ok = await run(() => api.post(`/admin/courses/${courseId}/instructors`, {
      instructor_id: Number(form.instructor_id), commission_rate: rate, can_edit_content: form.can_edit_content,
    }), t("instructeur_ajoute"));
    if (ok) setForm({ instructor_id: "", commission_rate: "", can_edit_content: false });
  };

  const saveRate = async (entry) => {
    const rate = parseRate(editRate);
    if (rate === null) return notify(t("taux_invalide"));
    if (await run(() => api.patch(`/admin/courses/${courseId}/instructors/${entry.id}`, { commission_rate: rate }))) setEditId(null);
  };

  const toggleEdit = (entry) => run(() => api.patch(`/admin/courses/${courseId}/instructors/${entry.id}`, { can_edit_content: !entry.can_edit_content }));

  const remove = async (entry) => {
    if (!(await confirm(t("retirer_confirmation", { name: `${entry.first_name} ${entry.last_name}` }), { confirmLabel: t("retirer") }))) return;
    run(() => api.delete(`/admin/courses/${courseId}/instructors/${entry.id}`), t("instructeur_retire"));
  };

  const taken = new Set([team?.author?.id, ...(team?.assigned || []).map((a) => a.instructor_id)]);
  const candidates = options.filter((o) => !taken.has(o.id));
  const assignedTotal = (team?.assigned || []).filter((a) => a.status === "accepted").reduce((s, a) => s + Number(a.commission_rate), 0);

  return (
    <div className="fixed inset-0 z-[58] flex items-center justify-center px-4 bg-black/40" onMouseDown={onClose}>
      {ui}
      <div role="dialog" aria-modal="true" onMouseDown={(e) => e.stopPropagation()} className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto text-left">
        <div className="flex items-start justify-between gap-4 p-6 border-b border-gray-100">
          <div className="min-w-0">
            <h2 className="text-lg font-bold text-gray-900">{t("titre")}</h2>
            <p className="text-sm text-gray-500 truncate">{courseTitle}</p>
          </div>
          <button type="button" onClick={onClose} aria-label={t("fermer")} className="p-2 rounded-lg bg-transparent text-gray-400 hover:bg-gray-100"><X className="w-4 h-4" /></button>
        </div>

        {!team ? (
          <div className="flex justify-center py-16"><Loader className="w-6 h-6 animate-spin text-gray-400" /></div>
        ) : (
          <div className="p-6 space-y-6">
            <section>
              <h3 className="text-sm font-semibold text-gray-900 mb-1">{t("part_totale")}</h3>
              <p className="text-xs text-gray-500 mb-3">{t("part_totale_aide")}{team.pool_is_default ? ` ${t("part_par_defaut")}` : ""}</p>
              <div className="flex items-center gap-2 max-w-xs">
                <input inputMode="decimal" value={poolInput} onChange={(e) => setPoolInput(e.target.value)} aria-label={t("part_totale")} className={field} />
                <span className="text-sm text-gray-500">%</span>
                <button type="button" onClick={savePool} disabled={busy} className="px-4 py-2 rounded-xl text-sm font-medium bg-primary text-white hover:opacity-90 disabled:opacity-60">{t("enregistrer")}</button>
              </div>
              <p className="text-xs text-gray-500 mt-2">{t("ecole_garde", { rate: Math.round((100 - team.pool_rate) * 100) / 100 })}</p>
            </section>

            <section>
              <h3 className="text-sm font-semibold text-gray-900 mb-3">{t("equipe")}</h3>
              <ul className="space-y-2">
                {team.author && (
                  <li className="flex items-center gap-3 p-3 border border-gray-100 rounded-xl">
                    <span className="w-9 h-9 rounded-full bg-primary/10 text-primary text-xs font-semibold flex items-center justify-center shrink-0">{team.author.first_name?.[0]}{team.author.last_name?.[0]}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{team.author.first_name} {team.author.last_name}</p>
                      <p className="text-xs text-gray-500 truncate">{team.author.email}</p>
                    </div>
                    <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary shrink-0">{t("auteur")}</span>
                    <span className="text-sm font-semibold text-gray-800 w-14 text-right">{team.author.rate} %</span>
                  </li>
                )}
                {team.assigned.map((entry) => (
                  <li key={entry.id} className="flex items-center gap-3 p-3 border border-gray-100 rounded-xl flex-wrap">
                    <span className="w-9 h-9 rounded-full bg-gray-100 text-gray-600 text-xs font-semibold flex items-center justify-center shrink-0">{entry.first_name?.[0]}{entry.last_name?.[0]}</span>
                    <div className="flex-1 min-w-[10rem]">
                      <p className="text-sm font-medium text-gray-900 truncate">{entry.first_name} {entry.last_name}</p>
                      <p className="text-xs text-gray-500 truncate">{entry.email}</p>
                    </div>
                    <label className="flex items-center gap-1.5 text-xs text-gray-600 cursor-pointer">
                      <input type="checkbox" checked={entry.can_edit_content} onChange={() => toggleEdit(entry)} disabled={busy} />
                      {t("peut_modifier")}
                    </label>
                    {editId === entry.id ? (
                      <div className="flex items-center gap-1.5">
                        <input inputMode="decimal" autoFocus value={editRate} onChange={(e) => setEditRate(e.target.value)} aria-label={t("part")} className="w-16 px-2 py-1 border border-gray-300 rounded-lg text-xs text-center bg-white" />
                        <span className="text-xs text-gray-500">%</span>
                        <button type="button" onClick={() => saveRate(entry)} aria-label={t("enregistrer")} className="p-1 rounded-lg bg-emerald-100 text-emerald-700"><Check className="w-3 h-3" /></button>
                        <button type="button" onClick={() => setEditId(null)} aria-label={t("annuler")} className="p-1 rounded-lg bg-gray-100 text-gray-500"><X className="w-3 h-3" /></button>
                      </div>
                    ) : (
                      <button type="button" onClick={() => { setEditId(entry.id); setEditRate(String(Number(entry.commission_rate))); }} title={t("modifier_part")} className="text-sm font-semibold text-gray-800 bg-transparent !p-1 w-14 text-right">{Number(entry.commission_rate)} %</button>
                    )}
                    <button type="button" onClick={() => remove(entry)} aria-label={t("retirer")} className="p-1.5 rounded-lg bg-transparent text-gray-400 hover:text-red-500 hover:bg-red-50"><Trash2 className="w-3.5 h-3.5" /></button>
                  </li>
                ))}
              </ul>
              {team.assigned.length === 0 && <p className="text-sm text-gray-500 mt-2">{t("aucun_intervenant")}</p>}
              <p className="text-xs text-gray-500 mt-2">{t("reparti", { assigned: assignedTotal, pool: team.pool_rate })}</p>
            </section>

            <section className="border border-gray-200 rounded-xl p-4 space-y-3">
              <h3 className="text-sm font-semibold text-gray-900">{t("ajouter_instructeur")}</h3>
              <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder={t("rechercher")} aria-label={t("rechercher")} className={field} />
              <select value={form.instructor_id} onChange={(e) => setForm((p) => ({ ...p, instructor_id: e.target.value }))} aria-label={t("instructeur")} className={field}>
                <option value="">{t("choisir_instructeur")}</option>
                {candidates.map((c) => <option key={c.id} value={c.id}>{c.first_name} {c.last_name} — {c.email}</option>)}
              </select>
              <div className="flex items-end gap-3 flex-wrap">
                <label className="w-32">
                  <span className="block text-xs font-medium text-gray-600 mb-1">{t("part")}</span>
                  <input inputMode="decimal" placeholder="0" value={form.commission_rate} onChange={(e) => setForm((p) => ({ ...p, commission_rate: e.target.value }))} className={field} />
                </label>
                <label className="flex items-center gap-1.5 text-xs text-gray-600 pb-2.5 cursor-pointer">
                  <input type="checkbox" checked={form.can_edit_content} onChange={(e) => setForm((p) => ({ ...p, can_edit_content: e.target.checked }))} />
                  {t("peut_modifier")}
                </label>
                <button type="button" onClick={add} disabled={busy} className="ml-auto inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium bg-primary text-white hover:opacity-90 disabled:opacity-60">
                  {busy ? <Loader className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}{t("ajouter")}
                </button>
              </div>
              <p className="text-xs text-gray-500">{t("aide_ajout")}</p>
            </section>
          </div>
        )}
      </div>
    </div>
  );
}
