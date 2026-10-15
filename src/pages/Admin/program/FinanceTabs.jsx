// Paliers de commission et versements groupés.
import { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { AlertCircle, Download, Plus } from "lucide-react";
import api from "../../../api/api";
import useFeedback, { apiError } from "../../../components/Common/useFeedback";
import { formatDate, formatMoney } from "../../../utils/format";
import { Card, Center, Empty, Pill, Spinner, Stat, btnGhost, btnPrimary, downloadFile, fullName, inp } from "./ui";

// ── Paliers ──
export function TiersTab() {
  const { t, i18n } = useTranslation("instructorProgram");
  const { notify, confirm } = useFeedback();
  const [rows, setRows] = useState(null);
  const [defaultRate, setDefaultRate] = useState(70);
  const [edit, setEdit] = useState(null);
  const [busy, setBusy] = useState(false);
  const en = (i18n.resolvedLanguage || "fr").startsWith("en");

  const load = useCallback(() => {
    api.get("/instructor-program/admin/tiers").then((r) => { setRows(r.data.data); setDefaultRate(r.data.default_rate); }).catch((e) => notify(apiError(e, t("error_generic"))));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { load(); }, [load]);

  const save = async () => {
    setBusy(true);
    try {
      const body = { name_fr: edit.name_fr, name_en: edit.name_en, description: edit.description, default_commission_rate: edit.rate, is_active: edit.is_active };
      if (edit.id) await api.patch(`/instructor-program/admin/tiers/${edit.id}`, body); else await api.post("/instructor-program/admin/tiers", body);
      setEdit(null); load();
    } catch (e) { notify(apiError(e, t("error_generic"))); }
    finally { setBusy(false); }
  };
  const remove = async (r) => {
    if (!(await confirm(t("tier_delete_confirm", { name: en ? r.name_en : r.name_fr })))) return;
    try { await api.delete(`/instructor-program/admin/tiers/${r.id}`); load(); } catch (e) { notify(apiError(e, t("error_generic"))); }
  };

  if (!rows) return <Center><Spinner className="w-6 h-6" /></Center>;
  return (
    <div className="space-y-5">
      <Card title={t("tiers_title")} action={<button type="button" onClick={() => setEdit({ name_fr: "", name_en: "", description: "", rate: String(defaultRate), is_active: true })} className={btnPrimary}><Plus className="w-4 h-4" />{t("tier_new")}</button>}>
        <p className="text-xs text-gray-500 mb-4">{t("tiers_hint", { rate: defaultRate })}</p>
        <ul className="divide-y divide-gray-100">
          {rows.map((r) => (
            <li key={r.id} className="py-3 flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="text-sm font-semibold text-gray-900">{en ? r.name_en : r.name_fr} {!r.is_active && <Pill>{t("inactive")}</Pill>}</p>
                {r.description && <p className="text-xs text-gray-400 truncate">{r.description}</p>}
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <Pill tone="bg-indigo-50 text-indigo-700">{Number(r.default_commission_rate)} %</Pill>
                <span className="text-xs text-gray-500">{t("members", { count: r.members })}</span>
                <button type="button" onClick={() => setEdit({ id: r.id, name_fr: r.name_fr, name_en: r.name_en, description: r.description || "", rate: String(Number(r.default_commission_rate)), is_active: r.is_active })} className={btnGhost}>{t("edit")}</button>
                <button type="button" onClick={() => remove(r)} className="text-xs font-semibold text-red-600 bg-transparent hover:underline">{t("delete")}</button>
              </div>
            </li>
          ))}
        </ul>
      </Card>
      {edit && (
        <Card title={edit.id ? t("tier_edit") : t("tier_new")}>
          <div className="grid sm:grid-cols-2 gap-4">
            <label className="block"><span className="block text-xs font-medium text-gray-600 mb-1">{t("name_fr")}</span><input className={inp} value={edit.name_fr} onChange={(e) => setEdit((p) => ({ ...p, name_fr: e.target.value }))} /></label>
            <label className="block"><span className="block text-xs font-medium text-gray-600 mb-1">{t("name_en")}</span><input className={inp} value={edit.name_en} onChange={(e) => setEdit((p) => ({ ...p, name_en: e.target.value }))} /></label>
            <label className="block"><span className="block text-xs font-medium text-gray-600 mb-1">{t("default_rate")}</span><input inputMode="decimal" className={inp} value={edit.rate} onChange={(e) => setEdit((p) => ({ ...p, rate: e.target.value }))} /></label>
            <label className="block"><span className="block text-xs font-medium text-gray-600 mb-1">{t("description")}</span><input className={inp} value={edit.description} onChange={(e) => setEdit((p) => ({ ...p, description: e.target.value }))} /></label>
          </div>
          <label className="flex items-center gap-2 text-sm text-gray-700 mt-4"><input type="checkbox" className="w-4 h-4" checked={edit.is_active} onChange={(e) => setEdit((p) => ({ ...p, is_active: e.target.checked }))} />{t("tier_active")}</label>
          <div className="flex justify-end gap-2 mt-4">
            <button type="button" onClick={() => setEdit(null)} className={btnGhost}>{t("cancel")}</button>
            <button type="button" onClick={save} disabled={busy} className={btnPrimary}>{busy && <Spinner className="w-4 h-4" />}{t("save")}</button>
          </div>
        </Card>
      )}
    </div>
  );
}

// ── Versements groupés ──
export function PayoutsTab() {
  const { t } = useTranslation("instructorProgram");
  const { notify, confirm } = useFeedback();
  const [data, setData] = useState(null);
  const [picked, setPicked] = useState([]);
  const [ref, setRef] = useState("");
  const [skip, setSkip] = useState(true);
  const [busy, setBusy] = useState(false);

  const load = useCallback(() => {
    api.get("/instructor-program/admin/payouts/summary").then((r) => { setData(r.data); setPicked([]); }).catch((e) => notify(apiError(e, t("error_generic"))));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { load(); }, [load]);

  const rows = data?.data || [];
  const selected = useMemo(() => rows.filter((r) => picked.includes(r.id)), [rows, picked]);
  const selectedTotal = selected.reduce((s, r) => s + r.due_amount, 0);
  const allPicked = rows.length > 0 && picked.length === rows.length;

  const run = async () => {
    if (ref.trim().length < 3) return notify(t("batch_ref_required"));
    if (!(await confirm(t("batch_confirm", { count: selected.length, amount: formatMoney(selectedTotal) }), { confirmLabel: t("pay_now"), danger: false }))) return;
    setBusy(true);
    try {
      const r = await api.post("/instructor-program/admin/payouts/batch", { instructor_ids: picked, reference: ref.trim(), skip_without_profile: skip });
      const d = r.data.data;
      notify(t("batch_done", { count: d.paid_count, amount: formatMoney(d.total), skipped: d.results.filter((x) => x.skipped).length }), "success");
      setRef(""); load();
    } catch (e) { notify(apiError(e, t("error_generic"))); }
    finally { setBusy(false); }
  };

  if (!data) return <Center><Spinner className="w-6 h-6" /></Center>;
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-3 gap-3">
        <Stat label={t("pay_due_total")} value={formatMoney(data.totals.due)} tone="text-amber-600" />
        <Stat label={t("pay_instructors_due")} value={data.totals.instructors} />
        <Stat label={t("pay_paid_total")} value={formatMoney(data.totals.paid)} tone="text-emerald-600" />
      </div>

      <Card title={t("pay_due_title")}>
        {rows.length === 0 ? <Empty>{t("pay_nothing_due")}</Empty> : (
          <>
            <div className="overflow-x-auto border border-gray-100 rounded-xl">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-xs text-gray-500">
                  <tr>
                    <th className="px-3 py-2 w-8"><input type="checkbox" className="w-4 h-4" checked={allPicked} onChange={() => setPicked(allPicked ? [] : rows.map((r) => r.id))} /></th>
                    {["col_instructor", "col_due", "col_commissions", "col_oldest", "col_payout_method"].map((k) => <th key={k} className="text-left font-medium px-3 py-2">{t(k)}</th>)}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {rows.map((r) => (
                    <tr key={r.id}>
                      <td className="px-3 py-2"><input type="checkbox" className="w-4 h-4" checked={picked.includes(r.id)} onChange={() => setPicked((p) => (p.includes(r.id) ? p.filter((x) => x !== r.id) : [...p, r.id]))} /></td>
                      <td className="px-3 py-2"><span className="font-medium text-gray-900">{fullName(r)}</span><span className="block text-xs text-gray-400">{r.email}</span></td>
                      <td className="px-3 py-2 font-semibold whitespace-nowrap">{formatMoney(r.due_amount)}</td>
                      <td className="px-3 py-2">{r.due_count}</td>
                      <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-500">{r.oldest_due ? formatDate(r.oldest_due) : "—"}</td>
                      <td className="px-3 py-2 text-xs">
                        {r.profile
                          ? <span className="text-gray-700">{t(`method_${r.profile.method}`)}{r.profile.provider ? ` · ${r.profile.provider}` : ""}<span className="block text-gray-400">{r.profile.account_name} — {r.profile.account_number}</span></span>
                          : <Pill tone="bg-red-100 text-red-600"><AlertCircle className="w-3 h-3 mr-1" />{t("no_payout_profile")}</Pill>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="mt-4 grid sm:grid-cols-[1fr_auto] gap-3 items-end">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">{t("batch_reference")}</label>
                <input className={inp} value={ref} maxLength={90} placeholder={t("batch_reference_ph")} onChange={(e) => setRef(e.target.value)} />
                <label className="flex items-center gap-2 text-xs text-gray-600 mt-2"><input type="checkbox" className="w-4 h-4" checked={skip} onChange={(e) => setSkip(e.target.checked)} />{t("skip_without_profile")}</label>
              </div>
              <button type="button" disabled={busy || !picked.length} onClick={run} className={btnPrimary}>
                {busy && <Spinner className="w-4 h-4" />}{t("pay_selected", { count: picked.length })} {picked.length > 0 && `· ${formatMoney(selectedTotal)}`}
              </button>
            </div>
          </>
        )}
      </Card>

      {data.batches.length > 0 && (
        <Card title={t("batches_history")}>
          <ul className="divide-y divide-gray-100">
            {data.batches.map((b) => (
              <li key={b.id} className="py-2.5 flex items-center justify-between gap-3 text-sm">
                <span><span className="font-medium text-gray-900">{b.reference}</span><span className="block text-xs text-gray-400">{formatDate(b.created_at)} · {fullName(b)}</span></span>
                <span className="text-xs text-gray-600 shrink-0">{t("batch_row", { count: b.instructors_count, amount: formatMoney(b.total_amount) })}</span>
              </li>
            ))}
          </ul>
        </Card>
      )}
    </div>
  );
}

// Boutons de relevé (CSV) réutilisés dans la fiche
export function StatementButtons({ instructorId }) {
  const { t } = useTranslation("instructorProgram");
  const { notify } = useFeedback();
  const [busy, setBusy] = useState(false);
  const go = async () => {
    setBusy(true);
    try { await downloadFile(`/instructor-program/admin/instructors/${instructorId}/statement`, { format: "csv" }, "statement.csv"); }
    catch (e) { notify(apiError(e, t("error_generic"))); }
    finally { setBusy(false); }
  };
  return <button type="button" onClick={go} disabled={busy} className={btnGhost}>{busy ? <Spinner className="w-4 h-4" /> : <Download className="w-4 h-4" />}{t("export_statement")}</button>;
}
