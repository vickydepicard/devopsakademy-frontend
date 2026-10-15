// Panneaux ajoutés à la fiche d'un instructeur : programme, performance, historique complet.
import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { AlertTriangle, Send, Star } from "lucide-react";
import api from "../../../api/api";
import useFeedback, { apiError } from "../../../components/Common/useFeedback";
import { formatDate, formatMoney, formatNumber } from "../../../utils/format";
import { Card, Center, Empty, Pill, Progress, Spinner, Stat, btnGhost, btnPrimary, inp } from "./ui";
import { TaskChecklist } from "./OverviewTabs";
import { StatementButtons } from "./FinanceTabs";
import { AuditEntry } from "./CommsTabs";

// ── Programme : intégration, contrat, palier, paiement ──
export function ProgramPanel({ instructorId, onChanged }) {
  const { t, i18n } = useTranslation("instructorProgram");
  const { notify } = useFeedback();
  const [ob, setOb] = useState(null);
  const [tier, setTier] = useState(undefined);
  const [tiers, setTiers] = useState([]);
  const [payout, setPayout] = useState(undefined);
  const [sel, setSel] = useState("");
  const [apply, setApply] = useState("none");
  const [busy, setBusy] = useState(false);
  const en = (i18n.resolvedLanguage || "fr").startsWith("en");
  const base = `/instructor-program/admin/instructors/${instructorId}`;

  const load = useCallback(() => {
    api.get(`${base}/onboarding`).then((r) => setOb(r.data.data)).catch(() => setOb(null));
    api.get(`${base}/tier`).then((r) => { setTier(r.data.data); setSel(r.data.data ? String(r.data.data.id) : ""); }).catch(() => setTier(null));
    api.get(`${base}/payout-profile`).then((r) => setPayout(r.data.data)).catch(() => setPayout(null));
  }, [base]);
  useEffect(() => { load(); api.get("/instructor-program/admin/tiers").then((r) => setTiers(r.data.data.filter((x) => x.is_active))).catch(() => {}); }, [load]);

  const remind = async () => {
    try { await api.post(`${base}/onboarding/remind`); notify(t("reminder_sent"), "success"); load(); onChanged?.(); }
    catch (e) { notify(apiError(e, t("error_generic"))); }
  };
  const saveTier = async () => {
    setBusy(true);
    try {
      const r = await api.put(`${base}/tier`, { tier_id: sel ? Number(sel) : null, apply_to_courses: sel ? apply : "none" });
      const d = r.data.data;
      notify(d.updated_courses || d.skipped_courses ? t("tier_saved_courses", { updated: d.updated_courses, skipped: d.skipped_courses }) : t("tier_saved"), "success");
      load(); onChanged?.();
    } catch (e) { notify(apiError(e, t("error_generic"))); }
    finally { setBusy(false); }
  };

  if (!ob || tier === undefined || payout === undefined) return <Center><Spinner className="w-6 h-6" /></Center>;
  return (
    <div className="space-y-4">
      <Card title={t("onboarding_title")} action={!ob.complete && <button type="button" onClick={remind} className={btnGhost}><Send className="w-4 h-4" />{t("remind")}</button>}>
        <div className="flex items-center gap-3 mb-3"><div className="flex-1"><Progress percent={ob.percent} /></div><span className="text-sm font-bold text-gray-700">{ob.percent}%</span></div>
        <TaskChecklist tasks={ob.tasks} />
        <p className="text-[11px] text-gray-400 mt-3">{t("onboarding_started", { date: ob.started_at ? formatDate(ob.started_at) : "—", count: ob.reminder_count })}</p>
      </Card>

      <Card title={t("agreement_title_card")}>
        {ob.last_signature
          ? <p className="text-sm text-gray-700">{t("agreement_signed_info", { version: ob.last_signature.version, date: formatDate(ob.last_signature.signed_at), name: ob.last_signature.signed_name })}</p>
          : <Pill tone="bg-amber-100 text-amber-700">{t("agreement_not_signed")}</Pill>}
      </Card>

      <Card title={t("tier_title")}>
        <p className="text-xs text-gray-500 mb-3">{tier ? t("tier_current", { name: en ? tier.name_en : tier.name_fr, rate: Number(tier.default_commission_rate) }) : t("tier_none")}</p>
        <div className="grid sm:grid-cols-2 gap-3">
          <select className={inp} value={sel} onChange={(e) => setSel(e.target.value)}>
            <option value="">{t("tier_none_option")}</option>
            {tiers.map((x) => <option key={x.id} value={x.id}>{en ? x.name_en : x.name_fr} — {Number(x.default_commission_rate)} %</option>)}
          </select>
          <select className={inp} value={apply} onChange={(e) => setApply(e.target.value)} disabled={!sel}>
            <option value="none">{t("apply_none")}</option>
            <option value="default_only">{t("apply_default_only")}</option>
            <option value="all">{t("apply_all")}</option>
          </select>
        </div>
        <div className="flex justify-end mt-3"><button type="button" onClick={saveTier} disabled={busy} className={btnPrimary}>{busy && <Spinner className="w-4 h-4" />}{t("save")}</button></div>
      </Card>

      <Card title={t("payout_title")} action={<StatementButtons instructorId={instructorId} />}>
        {payout
          ? <div className="text-sm text-gray-700 space-y-0.5"><p className="font-semibold">{t(`method_${payout.method}`)}{payout.provider ? ` · ${payout.provider}` : ""}</p><p>{payout.account_name} — {payout.account_number}</p>{payout.country && <p className="text-xs text-gray-400">{payout.country}</p>}</div>
          : <Pill tone="bg-red-100 text-red-600">{t("no_payout_profile")}</Pill>}
      </Card>
    </div>
  );
}

// ── Performance ──
const FLAG_KEYS = ["no_login_60d", "no_activity_60d", "low_rating", "negative_reviews", "no_published_course"];

export function PerformancePanel({ instructorId }) {
  const { t } = useTranslation("instructorProgram");
  const { notify } = useFeedback();
  const [d, setD] = useState(null);
  useEffect(() => {
    api.get(`/instructor-program/admin/instructors/${instructorId}/performance`).then((r) => setD(r.data.data)).catch((e) => notify(apiError(e, t("error_generic"))));
  }, [instructorId]); // eslint-disable-line react-hooks/exhaustive-deps
  if (!d) return <Center><Spinner className="w-6 h-6" /></Center>;
  const max = Math.max(...d.revenue.monthly.map((m) => m.amount), 1);
  const active = FLAG_KEYS.filter((k) => d.flags[k]);
  return (
    <div className="space-y-4">
      {active.length > 0 && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 flex items-start gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
          <div className="text-sm text-amber-800"><p className="font-semibold">{t("needs_attention")}</p><ul className="list-disc ml-4 text-xs mt-1">{active.map((k) => <li key={k}>{t(`flag_${k}`)}</li>)}</ul></div>
        </div>
      )}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Stat label={t("perf_students")} value={formatNumber(d.students.total)} sub={t("perf_new_30d", { n: d.students.new_30d })} />
        <Stat label={t("perf_completion")} value={`${d.students.avg_completion}%`} sub={t("perf_completion_rate", { n: d.students.completion_rate })} />
        <Stat label={t("perf_rating")} value={d.reviews.count ? d.reviews.avg_rating.toFixed(2) : "—"} sub={t("perf_reviews", { n: d.reviews.count })} />
        <Stat label={t("perf_courses")} value={`${d.courses.published}/${d.courses.total}`} sub={t("perf_submitted", { n: d.courses.submitted })} />
      </div>
      <div className="grid grid-cols-3 gap-3">
        <Stat label={t("perf_rev_30")} value={formatMoney(d.revenue.last_30d)} />
        <Stat label={t("perf_rev_90")} value={formatMoney(d.revenue.last_90d)} />
        <Stat label={t("perf_rev_total")} value={formatMoney(d.revenue.total)} />
      </div>
      {d.revenue.monthly.length > 0 && (
        <Card title={t("perf_monthly")}>
          <div className="flex items-end gap-2 h-28">
            {d.revenue.monthly.map((m) => (
              <div key={m.month} className="flex-1 flex flex-col items-center justify-end gap-1 min-w-0">
                <div className="w-full rounded-t bg-primary/80" style={{ height: `${Math.max((m.amount / max) * 100, 4)}%` }} title={formatMoney(m.amount)} />
                <span className="text-[10px] text-gray-400">{m.month.slice(5)}</span>
              </div>
            ))}
          </div>
        </Card>
      )}
      <Card title={t("perf_per_course")}>
        {d.per_course.length === 0 ? <Empty>{t("perf_no_course")}</Empty> : (
          <div className="overflow-x-auto"><table className="w-full text-sm">
            <thead className="text-xs text-gray-500"><tr>{["col_course", "perf_students", "perf_completion", "perf_rating", "col_earned"].map((k) => <th key={k} className="text-left font-medium py-1.5 pr-3">{t(k)}</th>)}</tr></thead>
            <tbody className="divide-y divide-gray-100">
              {d.per_course.map((c) => (
                <tr key={c.id}>
                  <td className="py-2 pr-3 max-w-[200px] truncate">{c.title} {!c.is_published && <Pill>{t("draft")}</Pill>}</td>
                  <td className="py-2 pr-3">{c.students}</td><td className="py-2 pr-3">{c.completion}%</td>
                  <td className="py-2 pr-3">{c.reviews ? <span className="inline-flex items-center gap-1"><Star className="w-3 h-3 fill-amber-400 text-amber-400" />{c.rating.toFixed(1)} ({c.reviews})</span> : "—"}</td>
                  <td className="py-2 whitespace-nowrap">{formatMoney(c.earned)}</td>
                </tr>
              ))}
            </tbody></table></div>
        )}
      </Card>
      {d.reviews.recent_negative.length > 0 && (
        <Card title={t("perf_negative")}>
          <ul className="divide-y divide-gray-100">
            {d.reviews.recent_negative.map((r, i) => (
              <li key={i} className="py-2.5 text-sm"><p className="text-xs text-gray-500">{r.course_title} · {r.rating}/5 · {formatDate(r.created_at)}</p><p className="text-gray-700">{r.comment || "—"}</p></li>
            ))}
          </ul>
        </Card>
      )}
    </div>
  );
}

// ── Historique complet (audit) ──
export function AuditPanel({ instructorId }) {
  const { t } = useTranslation("instructorProgram");
  const { notify } = useFeedback();
  const [data, setData] = useState(null);
  const [page, setPage] = useState(1);
  useEffect(() => {
    api.get(`/instructor-program/admin/instructors/${instructorId}/audit`, { params: { page } }).then((r) => setData(r.data)).catch((e) => notify(apiError(e, t("error_generic"))));
  }, [instructorId, page]); // eslint-disable-line react-hooks/exhaustive-deps
  if (!data) return <Center><Spinner className="w-6 h-6" /></Center>;
  const pages = Math.max(Math.ceil(data.pagination.total / data.pagination.limit), 1);
  if (!data.data.length) return <Empty>{t("journal_empty")}</Empty>;
  return (
    <div>
      <ul className="divide-y divide-gray-100 border border-gray-200 rounded-xl px-4">{data.data.map((e) => <AuditEntry key={e.id} e={{ ...e, target: null }} />)}</ul>
      {pages > 1 && (
        <div className="flex items-center justify-between mt-3 text-sm text-gray-500">
          <span>{t("page_of", { page, pages })}</span>
          <div className="flex gap-2"><button type="button" disabled={page <= 1} onClick={() => setPage(page - 1)} className={btnGhost}>{t("previous")}</button><button type="button" disabled={page >= pages} onClick={() => setPage(page + 1)} className={btnGhost}>{t("next")}</button></div>
        </div>
      )}
    </div>
  );
}
